const express = require('express');
const db = require('../lib/db');
const cfg = require('../lib/config');
const { HttpError, wrap } = require('../lib/http');
const { authenticate, authorize, normalizePhone } = require('../lib/auth');
const router = express.Router();
router.use(authenticate, authorize('admin'));
const audit = (req, action, entity, id, meta = {}) => db.query('insert into audit_log (actor_id, action, entity, entity_id, meta) values ($1,$2,$3,$4,$5)', [req.user.id, action, entity, String(id), JSON.stringify(meta)]);

router.get('/users', wrap(async (req, res) => {
  const { rows } = await db.query(`select u.id, u.name, u.phone, u.role, u.plan, u.free_orders_used, u.free_orders_limit, u.is_active, u.created_at,
    (select count(*) from shipments s where s.user_id = u.id) shipments from users u order by u.created_at desc limit 500`);
  res.json({ users: rows.map((u) => ({ id: u.id, name: u.name, phone: u.phone, role: u.role, plan: u.plan, isActive: u.is_active,
    freeOrdersUsed: u.free_orders_used, freeOrdersLimit: u.free_orders_limit, shipments: Number(u.shipments), createdAt: u.created_at })) });
}));
router.post('/users', wrap(async (req, res) => { // how reviewers and admins are created
  const phone = normalizePhone(req.body.phone), name = String(req.body.name || '').trim();
  if (!phone || !name || !['reviewer', 'admin', 'customer'].includes(req.body.role)) throw new HttpError(400, 'Name, a Pakistani mobile number and a role are required.');
  await db.query('insert into users (phone, name, role) values ($1,$2,$3) on conflict (phone) do update set role = $3, name = $2', [phone, name, req.body.role]);
  await audit(req, 'user.upsert', 'user', phone, { role: req.body.role });
  res.status(201).json({ ok: true });
}));
router.patch('/users/:id', wrap(async (req, res) => {
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot change your own account here.');
  await db.query('update users set is_active = coalesce($2, is_active), plan = coalesce($3, plan) where id = $1', [req.params.id, typeof req.body.isActive === 'boolean' ? req.body.isActive : null, ['free', 'desk'].includes(req.body.plan) ? req.body.plan : null]);
  await audit(req, 'user.update', 'user', req.params.id, req.body);
  res.json({ ok: true });
}));
router.get('/orders', wrap(async (req, res) => {
  const { rows } = await db.query('select s.*, u.name owner_name, u.phone owner_phone from shipments s join users u on u.id = s.user_id order by s.created_at desc limit 500');
  res.json({ shipments: rows.map((s) => ({ id: s.id, reference: s.reference, owner: s.owner_name, phone: s.owner_phone, status: s.status, fee: s.fee, free: s.free, paid: s.paid, createdAt: s.created_at })) });
}));
router.post('/orders/:id/paid', wrap(async (req, res) => { // manual confirmation of a bank, JazzCash, Easypaisa or Raast transfer
  const r = await db.query('update shipments set paid = true, paid_at = now() where id = $1 and fee > 0 and not paid', [req.params.id]);
  if (!r.rowCount) throw new HttpError(409, 'Nothing to confirm for this shipment.');
  await audit(req, 'payment.confirm', 'shipment', req.params.id);
  res.json({ ok: true });
}));
router.get('/costs', wrap(async (req, res) => {
  const { rows: [t] } = await db.query(`select count(*)::int n, coalesce(avg(model_cost_pkr),0) model, coalesce(avg(review_minutes),0) minutes
    from shipments where status = 'completed' and reviewed_at > now() - interval '30 days'`);
  const reviewPkr = Number(t.minutes) * cfg.reviewRatePkrPerMin;
  res.json({ shipments: t.n, modelPkr: Math.round(t.model), reviewMinutes: Math.round(Number(t.minutes) * 10) / 10, reviewPkr: Math.round(reviewPkr), totalPkr: Math.round(Number(t.model) + reviewPkr) });
}));
router.get('/refunds', wrap(async (req, res) => {
  const { rows } = await db.query('select r.*, s.reference, u.name owner_name from refunds r join shipments s on s.id = r.shipment_id join users u on u.id = r.user_id order by r.created_at desc limit 200');
  res.json({ refunds: rows.map((r) => ({ id: r.id, reference: r.reference, owner: r.owner_name, reason: r.reason, amount: r.amount, status: r.status, createdAt: r.created_at })) });
}));
router.patch('/refunds/:id', wrap(async (req, res) => {
  if (!['approved', 'rejected', 'paid'].includes(req.body.status)) throw new HttpError(400, 'Status must be approved, rejected or paid.');
  await db.query('update refunds set status = $2 where id = $1', [req.params.id, req.body.status]);
  await audit(req, 'refund.' + req.body.status, 'refund', req.params.id);
  res.json({ ok: true });
}));
module.exports = router;
