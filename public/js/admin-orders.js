(function () {
  const A = ClearedAPI, body = document.getElementById('rows'), msg = document.getElementById('msg');
  async function load() {
    const { shipments } = await A.admin('orders');
    body.innerHTML = shipments.map((s) => `<tr><td>${A.esc(s.reference)}</td><td>${A.esc(s.owner)}<br><span class="hint">${A.esc(s.phone)}</span></td><td>${A.badge(s.status)}</td><td>${A.fmtDate(s.createdAt)}</td><td>${s.free ? 'Free order' : A.rs(s.fee)}</td><td>${s.fee === 0 ? '—' : s.paid ? '<span class="badge ok">Paid</span>' : `<button class="btn alt sm" data-id="${A.esc(s.id)}">Confirm payment</button>`}</td></tr>`).join('');
  }
  body.addEventListener('click', async (e) => { const b = e.target.closest('button[data-id]'); if (!b || !confirm('Confirm that this payment arrived?')) return; try { await A.admin(`orders/${b.dataset.id}/paid`, 'POST'); load(); } catch (err) { A.say(msg, err.message, 'err'); } });
  load().catch((e) => A.say(msg, e.message, 'err'));
})();
