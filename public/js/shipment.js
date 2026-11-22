(function () {
  const A = ClearedAPI, id = new URLSearchParams(location.search).get('id'), root = document.getElementById('root');
  const COLS = ['invoice', 'packingList', 'billOfLading', 'lcTerms'];
  const live = (f) => f.mismatch && f.decision !== 'reject'; // a rejected finding means the reviewer found the agent wrong
  const said = (f) => `${(f.outliers || []).map((o) => `${A.SOURCE[o.source]} shows ${o.value}`).join('; ')}. Expected ${f.decision === 'edit' ? f.correctedValue : f.expected}${f.kind ? ` (${f.kind})` : ''}.`;

  async function list() {
    const { shipments } = await A.mine();
    if (!shipments.length) { root.innerHTML = '<div class="card empty"><h3>No shipments yet</h3><p>Send your first shipment and it appears here.</p><p style="margin-top:16px"><a class="btn" href="new-shipment.html">Send a shipment</a></p></div>'; return; }
    root.innerHTML = `<div class="card scroll"><table class="queue-table"><thead><tr><th>Reference</th><th>Buyer</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>${shipments.map((s) =>
      `<tr><td>${A.esc(s.reference)}</td><td>${A.esc(s.buyer)}</td><td>${A.badge(s.status)}</td><td>${A.fmtDate(s.createdAt)}</td><td><a class="btn alt sm" href="?id=${encodeURIComponent(s.id)}">Open</a></td></tr>`).join('')}</tbody></table></div>`;
  }
  async function detail() {
    const { shipment: s } = await A.shipment(id), done = s.status === 'completed', bad = s.findings.filter(live);
    const step = { queued: 1, extracting: 2, needs_review: 3, under_review: 3, completed: 4 }[s.status];
    document.getElementById('title').textContent = s.reference;
    document.getElementById('meta').textContent = `${s.buyer} · Sent ${A.fmtDate(s.createdAt)}`;
    let h = `<ol class="steps">${['Received', 'Reading documents', 'Person reviews', 'Report ready'].map((t, i) => `<li class="${i < step ? 'done' : ''}">${t}</li>`).join('')}</ol>`;
    if (!done) h += `<div class="card"><h3>We are on it</h3><p class="sub" style="margin-bottom:0">A person checks every report before you see it. You will get a WhatsApp message when it is ready.</p></div>`;
    else {
      h += `<div class="set"><header><span>Mismatch report</span><span class="stamp ${bad.length ? 'bad' : 'good'}">${bad.length ? bad.length + ' MISMATCH' + (bad.length > 1 ? 'ES' : '') : 'CLEARED'}</span></header>
      <div class="scroll"><table class="tbl" style="min-width:560px"><thead><tr><th>Field</th><th>Invoice</th><th>Packing list</th><th>Bill of lading</th><th>LC terms</th></tr></thead><tbody>${s.findings.map((f) =>
        `<tr><td>${A.esc(f.field)}</td>${COLS.map((c) => { const v = f.values[c]; const x = live(f) && (f.outliers || []).some((o) => o.source === c); return `<td class="${v === undefined ? '' : x ? 'x' : 'ok'}">${A.esc(v ?? '—')}</td>`; }).join('')}</tr>`).join('') || '<tr><td colspan="5" class="plain">Nothing to compare.</td></tr>'}</tbody></table></div>
      <footer><span>${bad.length ? 'Fix these before you submit to the bank.' : 'Every shared field agrees across your documents.'}</span></footer></div>`;
      if (bad.length) h += `<div class="card" style="margin-top:20px"><h3>What to fix</h3><ul class="findings">${bad.map((f) => `<li><b>${A.esc(f.field)}</b>${A.esc(said(f))}</li>`).join('')}</ul></div>`;
      if (s.reviewerNote) h += `<div class="card"><h3>Reviewer note</h3><p>${A.esc(s.reviewerNote)}</p></div>`;
      h += `<div class="card"><h3>Corrected document set</h3><p class="sub" style="margin-bottom:0">${s.fee > 0 && !s.paid ? `Your reviewer sends the corrected set on WhatsApp once payment of ${A.rs(s.fee)} is confirmed. See <a href="billing.html">Billing</a>.` : 'Your reviewer sends the corrected set on WhatsApp.'}</p></div>`;
      if (s.paid && s.fee > 0) h += `<details class="card"><summary>The corrected set missed something</summary><form id="refund" style="margin-top:12px"><div class="form-group"><label for="why">What did it miss?</label><textarea id="why" rows="3" required></textarea></div><button class="btn" type="submit">Request refund of ${A.rs(s.fee)}</button><p class="msg" id="rmsg" role="alert"></p></form></details>`;
    }
    root.innerHTML = h;
    const rf = document.getElementById('refund');
    if (rf) rf.addEventListener('submit', async (e) => { e.preventDefault(); const m = document.getElementById('rmsg'); try { await A.refund(s.id, document.getElementById('why').value); A.say(m, 'Refund requested. We reply within five business days.', 'good'); } catch (err) { A.say(m, err.message, 'err'); } });
  }
  (id ? detail() : list()).catch((err) => { root.innerHTML = `<div class="card empty"><h3>${err.status === 404 ? 'Shipment not found' : 'Could not load this'}</h3><p>${A.esc(err.message)}</p></div>`; });
})();
