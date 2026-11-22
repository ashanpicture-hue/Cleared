const express = require('express');
const db = require('../lib/db');
const { HttpError, wrap } = require('../lib/http');
const A = require('../lib/auth');
const { sendOtp } = require('../lib/notify');
const router = express.Router();

async function issueOtp(phone, name) {
  const { rows: [o] } = await db.query('select * from otps where phone = $1', [phone]);
  const now = Date.now();
  if (o && now - new Date(o.sent_at) < 30000) throw new HttpError(429, 'Wait 30 seconds before asking for another code.');
  let sends = 1, windowStart = new Date();
  if (o && now - new Date(o.window_start) < 3600000) {
    sends = o.sends_in_window + 1; windowStart = o.window_start;
    if (sends > 5) throw new HttpError(429, 'Too many codes requested. Try again in an hour.');
  }
  const code = A.newCode();
  const devCode = await sendOtp(phone, code);
  await db.query(`insert into otps (phone, code_hash, expires_at, attempts, sent_at, window_start, sends_in_window, pending_name)
    values ($1, $2, now() + interval '10 minutes', 0, now(), $3, $4, $5)
    on conflict (phone) do update set code_hash = $2, expires_at = now() + interval '10 minutes', attempts = 0,
      sent_at = now(), window_start = $3, sends_in_window = $4, pending_name = $5`,
    [phone, A.hashOtp(phone, code), windowStart, sends, name]);
  return devCode;
}
const phoneOr400 = (raw) => A.normalizePhone(raw) || (() => { throw new HttpError(400, 'Enter a Pakistani mobile number, like 0300 1234567.'); })();

router.post('/signup', wrap(async (req, res) => {
  const phone = phoneOr400(req.body.phone);
  const name = String(req.body.name || '').trim();
  if (!name || name.length > 120) throw new HttpError(400, 'Enter your full name.');
  const { rows: [u] } = await db.query('select 1 from users where phone = $1', [phone]);
  if (u) throw new HttpError(409, 'An account with this number exists. Log in instead.');
  res.json({ ok: true, phone, devCode: await issueOtp(phone, name) || undefined });
}));

router.post('/login', wrap(async (req, res) => {
  const phone = phoneOr400(req.body.phone);
  const { rows: [u] } = await db.query('select is_active from users where phone = $1', [phone]);
  if (!u) throw new HttpError(404, 'No account with this number. Create one first.');
  if (!u.is_active) throw new HttpError(403, 'This account is turned off.');
  res.json({ ok: true, phone, devCode: await issueOtp(phone, null) || undefined });
}));

router.post('/resend-otp', wrap(async (req, res) => {
  const phone = phoneOr400(req.body.phone);
  const { rows: [o] } = await db.query('select pending_name from otps where phone = $1', [phone]);
  if (!o) throw new HttpError(400, 'Ask for a code first.');
  res.json({ ok: true, devCode: await issueOtp(phone, o.pending_name) || undefined });
}));

router.post('/verify-otp', wrap(async (req, res) => {
  const phone = phoneOr400(req.body.phone);
  const code = String(req.body.code || '');
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, 'Enter the 6-digit code.');
  const { rows: [o] } = await db.query('update otps set attempts = attempts + 1 where phone = $1 returning *', [phone]);
  if (!o) throw new HttpError(400, 'Ask for a code first.');
  if (new Date(o.expires_at) < new Date()) { await db.query('delete from otps where phone = $1', [phone]); throw new HttpError(410, 'This code expired. Ask for a new one.'); }
  if (o.attempts > 5) { await db.query('delete from otps where phone = $1', [phone]); throw new HttpError(429, 'Too many wrong codes. Ask for a new one.'); }
  if (!A.sameHash(o.code_hash, A.hashOtp(phone, code))) throw new HttpError(400, 'That code is not right.');
  await db.query('delete from otps where phone = $1', [phone]);
  let user;
  if (o.pending_name) { // new accounts are always customers; staff are created by an admin
    await db.query("insert into users (phone, name, free_orders_limit) values ($1, $2, $3) on conflict (phone) do nothing", [phone, o.pending_name, require('../lib/config').freeOrders]);
  }
  ({ rows: [user] } = await db.query('select * from users where phone = $1', [phone]));
  if (!user || !user.is_active) throw new HttpError(403, 'This account is turned off.');
  A.setSession(res, user.id);
  res.json({ ok: true, user: A.publicUser(user) });
}));

router.get('/me', A.authenticate, (req, res) => res.json({ user: A.publicUser(req.user) }));
router.post('/logout', (req, res) => { A.clearSession(res); res.json({ ok: true }); });
module.exports = router;
