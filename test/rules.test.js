const assert = require('assert');
const { compare } = require('../lib/rules');
const sample = {
  grossWeight: { invoice: '4,820 kg', packingList: '4,280 kg', billOfLading: '4,820 kg', lcTerms: '4,820 kg' },
  cartons: { invoice: '240', packingList: '240', billOfLading: '204', lcTerms: '240' },
  consignee: { invoice: 'Van Dijk BV', packingList: 'Van Dijk BV', billOfLading: 'Van Dyk B.V.', lcTerms: 'Van Dijk BV' },
  hsCode: { invoice: '6109.10', packingList: '6109.10', billOfLading: '6109.10', lcTerms: '6109.10' },
  portOfDischarge: { invoice: 'Rotterdam', packingList: 'Rotterdam', billOfLading: 'Rotterdam', lcTerms: 'Rottterdam' },
  shipmentDate: { invoice: '14/11/2026', billOfLading: '2026-11-14' },
  netWeight: { invoice: '4,500 kg' },
};
const f = Object.fromEntries(compare(sample).map((x) => [x.key, x]));
assert.deepStrictEqual(Object.keys(f).filter((k) => f[k].mismatch).sort(), ['cartons', 'consignee', 'grossWeight', 'portOfDischarge']);
assert.strictEqual(f.grossWeight.kind, 'transposed digits');
assert.strictEqual(f.grossWeight.outliers[0].source, 'packingList');
assert.strictEqual(f.consignee.kind, 'spelling');
assert.strictEqual(f.consignee.expected, 'Van Dijk BV');
assert.strictEqual(f.hsCode.mismatch, false);
assert.strictEqual(f.shipmentDate.mismatch, false);
assert.ok(!f.netWeight, 'single-source fields are not compared');
console.log('rules: all checks passed');
