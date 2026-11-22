(function () {
  const A = ClearedAPI;
  A.me().then(({ user }) => {
    document.getElementById('plan').textContent = user.plan === 'desk' ? 'Desk' : 'Pay per shipment';
    document.getElementById('seats').innerHTML = `<tr><td>${A.esc(user.name)}</td><td>Owner</td><td>${A.esc(user.phone)}</td><td>${A.fmtDate(user.createdAt)}</td></tr>`;
  });
})();
