(function () {
  const A = ClearedAPI, id = new URLSearchParams(location.search).get('id'), root = document.getElementById('root');
  const kindOpts = ['accept', 'edit', 'reject'];
  async function load() {
    const [{ user }, { shipment: s }] = await Promise.all([A.me(), A.shipment(id)]);
    document.getElementById('title').textContent = 'Review ' + s.reference;
    document.getElementById('meta').textContent = `${s.owner} · ${s.buyer} · Sent ${A.fmtDate(s.createdAt)}`;
    const docs = `<div class="card"><h3>Documents</h3><ul class="doc-list">${s.documents.map((d) => `<li><span>${A.esc(d.name)}</span>${d.url ? `<a href="${A.esc(d.url)}" target="_blank" rel="noopener">Open</a>` : '<span class="hint">Preview needs storage</span>'}</li>`).join('') || '<li>No files. Text was pasted.</li>'}</ul>${s.lcTerms ? `<h3 style="margin-top:16px">LC or PO terms</h3><p style="white-space:pre-wrap">${A.esc(s.lcTerms)}</p>` : ''}</div>`;
    const note = s.agentNote ? `<div class="card"><b>Agent note.</b> ${A.esc(s.agentNote)}</div>` : '';
    if (s.status === 'completed') { root.innerHTML = `<div class="card"><h3>Signed off</h3><p class="sub" style="margin-bottom:0">${A.fmtDate(s.reviewedAt)}</p></div>` + docs; return; }
    if (s.status !== 'needs_review' && s.status !== 'under_review') { root.innerHTML = `<div class="card"><h3>Not ready yet</h3><p class="sub" style="margin-bottom:0">${A.badge(s.status)} The agent is still reading the documents.</p></div>` + docs; return; }
    if (s.status === 'needs_review' || s.reviewerId !== user.id) {
      const mine = s.status === 'needs_review';
      root.innerHTML = note + docs + `<div class="card"><h3>${mine ? 'Ready for you' : 'Someone else is reviewing this'}</h3>${mine ? '<button class="btn" id="claim">Start review</button><p class="msg" id="cmsg" role="alert"></p>' : ''}</div>`;
      const c = document.getElementById('claim');
      if (c) c.addEventListener('click', async () => { try { await A.claim(s.id); load(); } catch (e) { A.say(document.getElementById('cmsg'), e.message, 'err'); } });
      return;
    }
    const rows = s.findings.map((f, i) => f.mismatch
      ? `<tr data-key="${A.esc(f.key)}"><td>${A.esc(f.field)}</td><td class="plain">${(f.outliers || []).map((o) => `${A.SOURCE[o.source]}: <b>${A.esc(o.value)}</b>`).join('<br>')}<br><span class="hint">Expected ${A.esc(f.expected)} · ${A.esc(f.kind)}</span></td><td><select class="decision" aria-label="Decision for ${A.esc(f.field)}">${kindOpts.map((k) => `<option>${k}</option>`).join('')}</select><input class="decision edit" style="display:none;margin-top:6px" placeholder="Corrected value" value="${A.esc(f.expected)}" aria-label="Corrected value for ${A.esc(f.field)}"></td></tr>`
      : `<tr><td>${A.esc(f.field)}</td><td class="plain" colspan="2">Agrees</td></tr>`).join('');
    root.innerHTML = note + docs + `<div class="set" style="margin:20px 0"><header><span>Agent findings</span><span class="stamp bad">${s.findings.filter((f) => f.mismatch).length} TO CHECK</span></header><div class="scroll"><table class="tbl" style="min-width:560px"><thead><tr><th>Field</th><th>Where it differs</th><th>Your decision</th></tr></thead><tbody>${rows || '<tr><td colspan="3" class="plain">The agent produced no findings. Read the documents by hand.</td></tr>'}</tbody></table></div></div>
      <div class="card"><div class="form-group"><label for="note">Note for the exporter</label><textarea id="note" rows="3"></textarea></div><div class="form-group"><label for="mins">Minutes spent</label><input id="mins" type="number" min="0" max="600" inputmode="numeric"></div><button class="btn" id="sign">Sign off and release</button><p class="msg" id="smsg" role="alert"></p></div>`;
    root.addEventListener('change', (e) => { if (e.target.matches('select.decision')) e.target.parentElement.querySelector('.edit').style.display = e.target.value === 'edit' ? 'block' : 'none'; });
    document.getElementById('sign').addEventListener('click', async () => {
      const decisions = [...root.querySelectorAll('tr[data-key]')].map((r) => ({ key: r.dataset.key, decision: r.querySelector('select').value, correctedValue: r.querySelector('.edit').value }));
      try { await A.review(s.id, { decisions, note: document.getElementById('note').value, minutes: document.getElementById('mins').value }); location.href = 'queue.html'; }
      catch (e) { A.say(document.getElementById('smsg'), e.message, 'err'); }
    });
  }
  load().catch((e) => { root.innerHTML = `<div class="card empty"><h3>Could not load</h3><p>${A.esc(e.message)}</p></div>`; });
})();
