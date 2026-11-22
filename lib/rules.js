// Deterministic cross-document comparison. The model reads documents; this code decides what disagrees.
const SOURCES = ['invoice', 'packingList', 'billOfLading', 'lcTerms'];
const FIELDS = [
  { key: 'grossWeight', label: 'Gross weight', type: 'number' },
  { key: 'netWeight', label: 'Net weight', type: 'number' },
  { key: 'cartons', label: 'Cartons', type: 'number' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'invoiceValue', label: 'Invoice value', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'code' },
  { key: 'incoterm', label: 'Incoterm', type: 'code' },
  { key: 'consignee', label: 'Consignee', type: 'party' },
  { key: 'hsCode', label: 'HS code', type: 'hs' },
  { key: 'description', label: 'Goods description', type: 'text' },
  { key: 'portOfLoading', label: 'Port of loading', type: 'text' },
  { key: 'portOfDischarge', label: 'Port of discharge', type: 'text' },
  { key: 'shipmentDate', label: 'Shipment date', type: 'date' },
];
const LEGAL = new Set(['bv', 'nv', 'ltd', 'limited', 'llc', 'gmbh', 'co', 'inc', 'corp', 'pvt', 'sa', 'ag', 'plc']);
const plain = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function normalize(type, raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return null;
  const v = String(raw).trim();
  switch (type) {
    case 'number': { const m = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? String(Number(m[0])) : null; }
    case 'hs': return v.replace(/\D/g, '') || null;
    case 'code': return v.toUpperCase().replace(/\s+/g, '');
    case 'party': return plain(v).replace(/[.']/g, '').replace(/[,&\-/]/g, ' ').split(/\s+/).filter((t) => t && !LEGAL.has(t)).join(' ');
    case 'date': {
      let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/); // day first, as used in Pakistan
      if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      const t = Date.parse(v + ' 12:00 UTC'); return Number.isNaN(t) ? plain(v) : new Date(t).toISOString().slice(0, 10);
    }
    default: return plain(v).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const sortedDigits = (s) => s.replace(/\D/g, '').split('').sort().join('');
function kindOf(type, a, b) {
  if (type === 'number' && a !== b && sortedDigits(a) === sortedDigits(b)) return 'transposed digits';
  if (['party', 'text', 'hs'].includes(type) && distance(a, b) <= Math.max(2, Math.floor(Math.max(a.length, b.length) * 0.2))) return 'spelling';
  return 'different value';
}

function compare(extracted) {
  const findings = [];
  for (const f of FIELDS) {
    const row = extracted && extracted[f.key]; if (!row) continue;
    const present = SOURCES.filter((s) => normalize(f.type, row[s]) !== null).map((s) => ({ source: s, raw: String(row[s]).trim(), norm: normalize(f.type, row[s]) }));
    if (present.length < 2) continue;
    const groups = new Map();
    for (const p of present) groups.set(p.norm, [...(groups.get(p.norm) || []), p]);
    const values = Object.fromEntries(present.map((p) => [p.source, p.raw]));
    if (groups.size === 1) { findings.push({ key: f.key, field: f.label, mismatch: false, values }); continue; }
    const rank = (g) => g.length * 10 + (g.some((p) => p.source === 'lcTerms') ? 2 : 0) + (g.some((p) => p.source === 'invoice') ? 1 : 0);
    const [major, ...rest] = [...groups.values()].sort((a, b) => rank(b) - rank(a));
    const expected = (major.find((p) => p.source === 'lcTerms') || major[0]).raw;
    findings.push({ key: f.key, field: f.label, mismatch: true, kind: kindOf(f.type, major[0].norm, rest[0][0].norm), expected,
      outliers: rest.flat().map((p) => ({ source: p.source, value: p.raw })), values });
  }
  return findings;
}
module.exports = { compare, normalize, FIELDS, SOURCES };
