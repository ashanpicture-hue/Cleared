const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../lib/db');
const cfg = require('../lib/config');
const storage = require('../lib/storage');
const { HttpError, wrap } = require('../lib/http');
const { authenticate, authorize } = require('../lib/auth');
const { processShipment } = require('../lib/pipeline');
let waitUntil = (p) => { p.catch(() => {}); };
try { waitUntil = require('@vercel/functions').waitUntil; } catch { /* local dev */ }
const router = express.Router();

// Vercel caps a request body at about 4.5 MB, so keep each upload small.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024, files: 10 } });
const MIME = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xls': 'application/vnd.ms-excel' };
function sniff(f) { // trust the file's own bytes, not the name the browser sent
  const ext = (f.originalname.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  const b = f.buffer;
  if (!MIME[ext]) return null;
  if (ext === '.pdf') return b.slice(0, 4).toString() === '%PDF' ? MIME[ext] : null;
  if (ext === '.png') return b.slice(0, 4).toString('hex') === '89504e47' ? MIME[ext] : null;
  if (ext === '.jpg' || ext === '.jpeg') return b[0] === 0xff && b[1] === 0xd8 ? MIME[ext] : null;
  if (ext === '.xlsx') return b.slice(0, 2).toString() === 'PK' ? MIME[ext] : null;
  return MIME[ext];
}
const text = (v, max) => String(v || '').trim().slice(0, max);

const card = (s) => ({ id: s.id, reference: s.reference, buyer: s.buyer, status: s.status, fee: s.fee, free: s.free,
  paid: s.paid, createdAt: s.created_at, reviewedAt: s.reviewed_at, documentCount: Number(s.document_count ?? 0) });

router.post('/', authenticate, upload.array('documents', 10), wrap(async (req, res) => {
  const u = req.user;
  const buyer = text(req.body.buyer, 120), lcTerms = text(req.body.lcTerms, 5000), forwardText = text(req.body.forwardText, 20000);
  const reference = text(req.body.reference, 40) || 'CLR-' + crypto.randomInt(10000, 100000);
  const files = req.files || [];
  if (!buyer) throw new HttpError(400, 'Enter the buyer or consignee.');
  if (!files.length && !forwardText) throw new HttpError(400, 'Add at least one document or paste the forwarded text.');
  for (const f of files) if (!sniff(f)) throw new HttpError(400, `${f.originalname} is not a PDF, image, Excel or CSV file.`);

  const id = 'shp_' + crypto.randomBytes(6).toString('hex');
  const stored = [];
  for (const f of files) {
    const path = `${u.id}/${id}/${crypto.randomBytes(4).toString('hex')}-${f.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    await storage.put(path, f.buffer, sniff(f));
    stored.push({ name: f.originalname.slice(0, 200), mime: sniff(f), size: f.size, path });
  }
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    let fee = cfg.perShipmentFee, free = false;
    if (u.plan === 'desk') {
      const { rows: [c] } = await client.query("select count(*)::int n from shipments where user_id = $1 and created_at >= date_trunc('month', now())", [u.id]);
      if (c.n >= cfg.deskMonthlyShipments) throw new HttpError(403, `Your Desk plan covers ${cfg.deskMonthlyShipments} shipments a month.`);
      fee = 0;
    } else {
      const r = await client.query('update users set free_orders_used = free_orders_used + 1 where id = $1 and free_orders_used < free_orders_limit', [u.id]);
      if (r.rowCount) { fee = 0; free = true; }
    }
    await client.query('insert into shipments (id, reference, user_id, buyer, lc_terms, forward_text, fee, free) values ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, reference, u.id, buyer, lcTerms, forwardText, fee, free]);
    for (const d of stored) await client.query('insert into documents (shipment_id, name, mime, size, storage_path) values ($1,$2,$3,$4,$5)', [id, d.name, d.mime, d.size, d.path]);
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    if (e.code === '23505') throw new HttpError(409, 'You already used that reference. Pick another.');
    throw e;
  } finally { client.release(); }
  waitUntil(processShipment(id));
  res.status(201).json({ shipment: { id, reference, status: 'queued', fee, free } });
}));

router.get('/mine', authenticate, wrap(async (req, res) => {
  const { rows } = await db.query(`select s.*, (select count(*) from documents d where d.shipment_id = s.id) document_count
    from shipments s where user_id = $1 order by created_at desc limit 200`, [req.user.id]);
  res.json({ shipments: rows.map(card) });
}));

router.get('/reviewer/queue', authenticate, authorize('reviewer', 'admin'), wrap(async (req, res) => {
  const { rows } = await db.query(`select s.*, u.name owner_name, (select count(*) from documents d where d.shipment_id = s.id) document_count,
    (select count(*) from jsonb_array_elements(s.findings) f where (f->>'mismatch')::boolean) mismatches
    from shipments s join users u on u.id = s.user_id where s.status in ('queued','extracting','needs_review','under_review') order by s.created_at`);
  res.json({ shipments: rows.map((s) => ({ ...card(s), owner: s.owner_name, mismatches: Number(s.mismatches), reviewerId: s.reviewer_id })) });
}));

router.get('/:id', authenticate, wrap(async (req, res) => {
  const { rows: [s] } = await db.query('select s.*, u.name owner_name from shipments s join users u on u.id = s.user_id where s.id = $1', [req.params.id]);
  const staff = ['reviewer', 'admin'].includes(req.user.role);
  if (!s || (!staff && s.user_id !== req.user.id)) throw new HttpError(404, 'Shipment not found.');
  const { rows: docs } = await db.query('select id, name, mime, size, storage_path from documents where shipment_id = $1 order by name', [s.id]);
  const released = staff || s.status === 'completed'; // customers see the report only after a person signs it off
  res.json({ shipment: { ...card(s), buyer: s.buyer, lcTerms: s.lc_terms, owner: s.owner_name, agentNote: staff ? s.agent_note : null,
    extracted: released ? s.extracted : {}, findings: released ? s.findings : [], reviewerNote: released ? s.reviewer_note : null,
    reviewerId: s.reviewer_id, canDownloadPack: false,
    documents: await Promise.all(docs.map(async (d) => ({ id: d.id, name: d.name, size: d.size, url: staff ? await storage.signedUrl(d.storage_path) : null }))) } });
}));

router.post('/:id/claim', authenticate, authorize('reviewer', 'admin'), wrap(async (req, res) => {
  const r = await db.query("update shipments set status = 'under_review', reviewer_id = $2 where id = $1 and (status = 'needs_review' or (status = 'under_review' and reviewer_id = $2))", [req.params.id, req.user.id]);
  if (!r.rowCount) throw new HttpError(409, 'Someone else is reviewing this shipment, or it is not ready yet.');
  res.json({ ok: true });
}));

router.post('/:id/review', authenticate, authorize('reviewer', 'admin'), wrap(async (req, res) => {
  const { decisions, note, minutes } = req.body;
  const { rows: [s] } = await db.query('select * from shipments where id = $1', [req.params.id]);
  if (!s) throw new HttpError(404, 'Shipment not found.');
  if (s.status !== 'under_review' || s.reviewer_id !== req.user.id) throw new HttpError(409, 'Claim this shipment before signing it off.');
  const byKey = new Map((Array.isArray(decisions) ? decisions : []).map((d) => [d.key, d]));
  const findings = s.findings.map((f) => {
    const d = byKey.get(f.key);
    if (!d) return f;
    if (!['accept', 'edit', 'reject'].includes(d.decision)) throw new HttpError(400, 'Each decision must be accept, edit or reject.');
    if (d.decision === 'edit' && !text(d.correctedValue, 300)) throw new HttpError(400, `Enter the corrected value for ${f.field}.`);
    return { ...f, decision: d.decision, correctedValue: d.decision === 'edit' ? text(d.correctedValue, 300) : undefined };
  });
  await db.query("update shipments set status = 'completed', findings = $2, reviewer_note = $3, review_minutes = $4, reviewed_at = now() where id = $1",
    [s.id, JSON.stringify(findings), text(note, 2000) || null, Math.max(0, Math.min(600, parseInt(minutes, 10) || 0))]);
  await db.query("insert into audit_log (actor_id, action, entity, entity_id, meta) values ($1,'review.signoff','shipment',$2,$3)", [req.user.id, s.id, JSON.stringify({ decisions: findings.length })]);
  res.json({ ok: true });
}));

router.post('/:id/refund', authenticate, wrap(async (req, res) => {
  const reason = text(req.body.reason, 1000);
  if (!reason) throw new HttpError(400, 'Say what the corrected set missed.');
  const { rows: [s] } = await db.query('select * from shipments where id = $1 and user_id = $2', [req.params.id, req.user.id]);
  if (!s || !s.paid || s.fee <= 0) throw new HttpError(400, 'Only paid shipments can be refunded.');
  try { await db.query('insert into refunds (shipment_id, user_id, reason, amount) values ($1,$2,$3,$4)', [s.id, req.user.id, reason, s.fee]); }
  catch (e) { if (e.code === '23505') throw new HttpError(409, 'A refund request already exists for this shipment.'); throw e; }
  res.status(201).json({ ok: true });
}));
module.exports = router;
