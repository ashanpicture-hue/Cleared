(function () {
  const A = ClearedAPI, body = document.getElementById('rows'), empty = document.getElementById('empty'), msg = document.getElementById('msg');
  async function load() {
    const { refunds } = await A.admin('refunds');
    empty.hidden = refunds.length > 0;
    body.innerHTML = refunds.map((r) => `<tr><td>${A.esc(r.reference)}</td><td>${A.esc(r.owner)}</td><td>${A.esc(r.reason)}</td><td>${A.rs(r.amount)}</td><td>${A.fmtDate(r.createdAt)}</td><td><span class="badge ${r.status === 'rejected' ? 'bad' : r.status === 'pending' ? 'warn' : 'ok'}">${A.esc(r.status)}</span></td><td>${r.status === 'pending' ? `<button class="btn alt sm" data-id="${A.esc(r.id)}" data-s="approved">Approve</button> <button class="btn alt sm" data-id="${A.esc(r.id)}" data-s="rejected">Reject</button>` : r.status === 'approved' ? `<button class="btn alt sm" data-id="${A.esc(r.id)}" data-s="paid">Mark paid</button>` : ''}</td></tr>`).join('');
  }
  body.addEventListener('click', async (e) => { const b = e.target.closest('button[data-id]'); if (!b) return; try { await A.admin('refunds/' + b.dataset.id, 'PATCH', { status: b.dataset.s }); load(); } catch (err) { A.say(msg, err.message, 'err'); } });
  load().catch((e) => A.say(msg, e.message, 'err'));
})();
