const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('./db');
const cfg = require('./config');
const { HttpError, wrap } = require('./http');
const COOKIE = 'cleared_session';

function normalizePhone(raw) {
  if (typeof raw !== 'string') return null;
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('0092')) p = '+92' + p.slice(4);
  else if (p.startsWith('+92')) { /* ok */ }
  else if (p.startsWith('92')) p = '+' + p;
  else if (p.startsWith('0')) p = '+92' + p.slice(1);
  else return null;
  return /^\+923\d{9}$/.test(p) ? p : null; // Pakistani mobile numbers only
}
const hashOtp = (phone, code) => crypto.createHash('sha256').update(phone + ':' + code + ':' + cfg.jwtSecret).digest();
const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);
const newCode = () => String(crypto.randomInt(100000, 1000000));

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
function setSession(res, userId) {
  const token = jwt.sign({ sub: userId }, cfg.jwtSecret, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${cfg.prod ? '; Secure' : ''}`);
}
function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${cfg.prod ? '; Secure' : ''}`);
}

// Role and active status come from the database on every request, never from the token.
const authenticate = wrap(async (req, res, next) => {
  const token = readCookie(req, COOKIE);
  if (!token) throw new HttpError(401, 'Sign in to continue');
  let payload;
  try { payload = jwt.verify(token, cfg.jwtSecret); } catch { throw new HttpError(401, 'Your session expired. Sign in again.'); }
  const { rows: [user] } = await db.query('select * from users where id = $1', [payload.sub]);
  if (!user || !user.is_active) throw new HttpError(401, 'Account not available');
  req.user = user;
  next();
});
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'You do not have access to this'));

const publicUser = (u) => ({ id: u.id, name: u.name, phone: u.phone, role: u.role, plan: u.plan,
  freeOrdersUsed: u.free_orders_used, freeOrdersLimit: u.free_orders_limit, seats: u.seats, createdAt: u.created_at });

module.exports = { normalizePhone, hashOtp, sameHash, newCode, setSession, clearSession, authenticate, authorize, publicUser };
