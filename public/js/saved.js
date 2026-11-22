(function () {
  const A = ClearedAPI, body = document.getElementById('buyers');
  A.mine().then(({ shipments }) => {
    const by = new Map();
    shipments.forEach((s) => { const k = s.buyer.trim(); if (!k) return; const e = by.get(k) || { n: 0, last: s.createdAt }; e.n++; if (s.createdAt > e.last) e.last = s.createdAt; by.set(k, e); });
    body.innerHTML = by.size ? [...by].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => `<tr><td>${A.esc(k)}</td><td>${e.n}</td><td>${A.fmtDate(e.last)}</td></tr>`).join('') : '<tr><td colspan="3" class="plain">Buyers appear here after your first shipment.</td></tr>';
  });
})();
