const db = require('./db');
const storage = require('./storage');
const { extractFields } = require('./extract');
const { compare } = require('./rules');

// Moves a shipment from queued to needs_review. Any failure still lands in the reviewer queue, never in a dead end.
async function processShipment(id) {
  await db.query("update shipments set status = 'extracting' where id = $1 and status = 'queued'", [id]);
  try {
    const { rows: [s] } = await db.query('select * from shipments where id = $1', [id]);
    const { rows: docs } = await db.query('select * from documents where shipment_id = $1', [id]);
    const files = [];
    for (const d of docs) files.push({ name: d.name, mime: d.mime, buf: await storage.get(d.storage_path) });
    const result = await extractFields(files, { lcTerms: s.lc_terms, forwardText: s.forward_text });
    if (!result) return await toReview(id, {}, [], 0, 'No automatic extraction. Read the documents by hand.');
    const note = result.skipped.length ? 'Not read automatically: ' + result.skipped.join(', ') : null;
    await toReview(id, result.fields, compare(result.fields), result.costPkr, note);
  } catch (err) {
    console.error('pipeline', id, err.message);
    await toReview(id, {}, [], 0, 'Automatic extraction failed. Read the documents by hand.');
  }
}
const toReview = (id, extracted, findings, cost, note) => db.query(
  "update shipments set status = 'needs_review', extracted = $2, findings = $3, model_cost_pkr = $4, agent_note = $5 where id = $1",
  [id, JSON.stringify(extracted), JSON.stringify(findings), cost, note]);
module.exports = { processShipment };
