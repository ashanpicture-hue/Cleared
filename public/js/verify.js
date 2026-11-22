(function () {
  const A = ClearedAPI, q = new URLSearchParams(location.search), phone = q.get('phone') || '';
  const form = document.getElementById('otpForm'), msg = document.getElementById('msg'), btn = form.querySelector('button[type=submit]'), resend = document.getElementById('resend');
  const code = A.otpInputs(form);
  document.getElementById('sentTo').textContent = phone;
  const dev = sessionStorage.getItem('cleared_dev_code');
  if (dev) A.say(msg, 'Development code: ' + dev);
  let wait = 30; resend.disabled = true;
  const tick = setInterval(() => { wait--; resend.textContent = wait > 0 ? `Resend in ${wait}s` : 'Resend code'; if (wait <= 0) { resend.disabled = false; clearInterval(tick); } }, 1000);
  resend.addEventListener('click', async () => {
    resend.disabled = true;
    try { const r = await A.resend(phone); A.say(msg, r.devCode ? 'Development code: ' + r.devCode : 'A new code is on its way.', 'good'); }
    catch (err) { A.say(msg, err.message, 'err'); }
    setTimeout(() => { resend.disabled = false; }, 30000);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (code().length !== 6) return A.say(msg, 'Enter all 6 digits.', 'err');
    A.busy(btn, true, 'Checking…');
    try {
      const { user } = await A.verify(phone, code());
      sessionStorage.removeItem('cleared_dev_code');
      const next = q.get('next');
      location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : A.home(user);
    } catch (err) { A.say(msg, err.message, 'err'); A.busy(btn, false, 'Verify code'); }
  });
})();
