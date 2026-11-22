(function () {
  const A = ClearedAPI, form = document.getElementById('loginForm'), msg = document.getElementById('msg'), btn = form.querySelector('button');
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); A.say(msg, '');
    const phone = form.phone.value.trim();
    if (!phone) return A.say(msg, 'Enter your phone number.', 'err');
    A.busy(btn, true, 'Sending code…');
    try {
      const r = await A.login(phone);
      if (r.devCode) sessionStorage.setItem('cleared_dev_code', r.devCode);
      const next = new URLSearchParams(location.search).get('next');
      location.href = '/app/verify.html?phone=' + encodeURIComponent(r.phone) + (next ? '&next=' + encodeURIComponent(next) : '');
    } catch (err) { A.say(msg, err.message, 'err'); A.busy(btn, false, 'Send code'); }
  });
})();
