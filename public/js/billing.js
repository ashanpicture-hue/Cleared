(function () {
  const A = ClearedAPI, body = document.getElementById('invoices');
  A.me().then(({ user }) => {
    const left = Math.max(0, user.freeOrdersLimit - user.freeOrdersUsed);
    document.getElementById('freeLeft').textContent = `${left} of ${user.freeOrdersLimit}`;
  });
  A.mine().then(({ shipments }) => {
    const rows = shipments.filter((s) => s.fee > 0);
    body.innerHTML = rows.length ? rows.map((s) => `<tr><td>${A.esc(s.reference)}</td><td>${A.rs(s.fee)}</td><td>${s.paid ? '<span class="badge ok">Paid</span>' : s.status === 'completed' ? '<span class="badge warn">Awaiting payment</span>' : '<span class="badge">After delivery</span>'}</td><td>${A.fmtDate(s.createdAt)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="plain">No invoices yet. Free orders do not create one.</td></tr>';
  });
})();
