// Supabase Storage over REST. Falls back to ./.data/uploads in local development.
const fs = require('fs'), path = require('path');
const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
const bucket = process.env.STORAGE_BUCKET || 'cleared-uploads';
const local = !base || !key;
const auth = { Authorization: 'Bearer ' + key, apikey: key };
const localPath = (p) => path.join(process.cwd(), '.data', 'uploads', p);

async function put(p, buf, mime) {
  if (local) { fs.mkdirSync(path.dirname(localPath(p)), { recursive: true }); fs.writeFileSync(localPath(p), buf); return; }
  const r = await fetch(`${base}/storage/v1/object/${bucket}/${p}`, { method: 'POST', headers: { ...auth, 'Content-Type': mime }, body: buf });
  if (!r.ok) throw new Error('Storage upload failed (' + r.status + ')');
}
async function get(p) {
  if (local) return fs.readFileSync(localPath(p));
  const r = await fetch(`${base}/storage/v1/object/${bucket}/${p}`, { headers: auth });
  if (!r.ok) throw new Error('Storage download failed (' + r.status + ')');
  return Buffer.from(await r.arrayBuffer());
}
async function signedUrl(p, seconds = 300) {
  if (local) return null;
  const r = await fetch(`${base}/storage/v1/object/sign/${bucket}/${p}`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: seconds }) });
  if (!r.ok) return null;
  const j = await r.json();
  return j.signedURL ? `${base}/storage/v1${j.signedURL}` : null;
}
module.exports = { put, get, signedUrl };
