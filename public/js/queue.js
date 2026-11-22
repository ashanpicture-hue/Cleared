(function () {
  const A = ClearedAPI, body = document.getElementById('rows'), empty = document.getElementById('empty'), tbl = document.getElementById('tbl');
  A.queue().then(({ shipments }) => {
    empty.hidden = shipments.length > 0; tbl.hidden = !shipments.length;
    body.innerHTML = shipments.map((s) => `<tr><td>${A.esc(s.reference)}</td><td>${A.esc(s.owner)}</td><td>${s.documentCount}</td><td>${s.status === 'needs_review' || s.status === 'under_review' ? s.mismatches : '—'}</td><td>${A.badge(s.status)}</td><td>${A.fmtDate(s.createdAt)}</td><td><a class="btn alt sm" href="review.html?id=${encodeURIComponent(s.id)}">Open</a></td></tr>`).join('');
  }).catch((e) => { empty.hidden = false; empty.querySelector('p').textContent = e.message; });
})();
