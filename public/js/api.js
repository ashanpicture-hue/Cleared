(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const rs = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK');
  const STATUS = { queued: ['Received', ''], extracting: ['Reading documents', ''], needs_review: ['Waiting for review', 'warn'], under_review: ['Being reviewed', 'warn'], completed: ['Ready', 'ok'] };
  const badge = (s) => { const [t, c] = STATUS[s] || [s, '']; return `<span class="badge ${c}">${esc(t)}</span>`; };
  const SOURCE = { invoice: 'Invoice', packingList: 'Packing list', billOfLading: 'Bill of lading', lcTerms: 'LC terms' };
  const home = (u) => u.role === 'admin' ? '/admin/orders.html' : u.role === 'reviewer' ? '/reviewer/queue.html' : '/app/shipment.html';

  async function request(path, opts = {}) {
    const headers = opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await fetch(path, { credentials: 'same-origin', ...opts, headers: { ...headers, ...opts.headers } });
    let data = {}; try { data = await res.json(); } catch { /* empty body */ }
    if (!res.ok) {
      const err = new Error(data.error || 'Something went wrong. Try again.'); err.status = res.status;
      const open = /\/(login|signup|verify)\.html$/.test(location.pathname);
      if (res.status === 401 && !open && /^\/(app|reviewer|admin)\//.test(location.pathname)) location.href = '/app/login.html?next=' + encodeURIComponent(location.pathname + location.search);
      throw err;
    }
    return data;
  }
  const send = (method, body) => ({ method, body: JSON.stringify(body) });
  function busy(btn, on, label) { btn.disabled = on; if (on) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy'); if (label) btn.textContent = label; }
  function say(el, text, kind) { el.textContent = text; el.className = 'msg' + (kind ? ' ' + kind : ''); }

  // Six single-digit boxes that accept typing, backspace and a pasted code.
  function otpInputs(root) {
    const boxes = [...root.querySelectorAll('.otp-input')];
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      b.addEventListener('paste', (e) => {
        const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!d) return; e.preventDefault(); d.split('').forEach((c, j) => { if (boxes[j]) boxes[j].value = c; }); (boxes[Math.min(d.length, 5)]).focus();
      });
    });
    return () => boxes.map((b) => b.value).join('');
  }
  document.addEventListener('click', async (e) => {
    if (e.target.closest('[data-logout]')) { await request('/api/auth/logout', { method: 'POST' }).catch(() => {}); location.href = '/'; }
  });
  window.ClearedAPI = { esc, fmtDate, rs, badge, say, busy, otpInputs, request, home, SOURCE, STATUS,
    me: () => request('/api/auth/me'),
    signup: (phone, name) => request('/api/auth/signup', send('POST', { phone, name })),
    login: (phone) => request('/api/auth/login', send('POST', { phone })),
    resend: (phone) => request('/api/auth/resend-otp', send('POST', { phone })),
    verify: (phone, code) => request('/api/auth/verify-otp', send('POST', { phone, code })),
    mine: () => request('/api/shipments/mine'),
    shipment: (id) => request('/api/shipments/' + encodeURIComponent(id)),
    create: (formData) => request('/api/shipments', { method: 'POST', body: formData }),
    queue: () => request('/api/shipments/reviewer/queue'),
    claim: (id) => request(`/api/shipments/${id}/claim`, { method: 'POST' }),
    review: (id, body) => request(`/api/shipments/${id}/review`, send('POST', body)),
    refund: (id, reason) => request(`/api/shipments/${id}/refund`, send('POST', { reason })),
    admin: (path, method, body) => request('/api/admin/' + path, method ? send(method, body || {}) : {}),
  };
})();
