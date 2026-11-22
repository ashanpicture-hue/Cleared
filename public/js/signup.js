(function () {
  const A = ClearedAPI, form = document.getElementById('signupForm'), msg = document.getElementById('msg'), btn = form.querySelector('button');
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); A.say(msg, '');
    const phone = form.phone.value.trim(), name = form.name.value.trim();
    if (!phone || !name) return A.say(msg, 'Enter your phone number and full name.', 'err');
    A.busy(btn, true, 'Sending code…');
    try {
      const r = await A.signup(phone, name);
      if (r.devCode) sessionStorage.setItem('cleared_dev_code', r.devCode);
      location.href = '/app/verify.html?phone=' + encodeURIComponent(r.phone);
    } catch (err) { A.say(msg, err.message, 'err'); A.busy(btn, false, 'Send code'); }
  });
})();
