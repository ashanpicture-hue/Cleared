(function () {
  const A = ClearedAPI, form = document.getElementById('shipmentForm'), msg = document.getElementById('msg'), btn = form.querySelector('button[type=submit]');
  const list = document.getElementById('fileList'), left = document.getElementById('freeLeft');
  const MAX = 4 * 1024 * 1024, TOTAL = 4.4 * 1024 * 1024;
  A.me().then(({ user }) => {
    const n = user.freeOrdersLimit - user.freeOrdersUsed;
    left.textContent = n > 0 ? `${n} of ${user.freeOrdersLimit} free orders left` : `Your ${user.freeOrdersLimit} free orders are used. This one costs Rs 3,000 and you pay after delivery.`;
  }).catch(() => {});
  form.docs.addEventListener('change', () => {
    list.innerHTML = [...form.docs.files].map((f) => `<li><span>${A.esc(f.name)}</span><span>${(f.size / 1048576).toFixed(1)} MB</span></li>`).join('');
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); A.say(msg, '');
    const files = [...form.docs.files], size = files.reduce((n, f) => n + f.size, 0);
    if (!form.buyer.value.trim()) return A.say(msg, 'Enter the buyer or consignee.', 'err');
    if (!files.length && !form.forward.value.trim()) return A.say(msg, 'Add a document or paste the forwarded text.', 'err');
    if (files.some((f) => f.size > MAX) || size > TOTAL) return A.say(msg, 'Keep each file under 4 MB and the total under 4.4 MB. Send larger scans on WhatsApp.', 'err');
    const fd = new FormData();
    fd.append('reference', form.reference.value.trim()); fd.append('buyer', form.buyer.value.trim());
    fd.append('lcTerms', form.lc.value.trim()); fd.append('forwardText', form.forward.value.trim());
    files.forEach((f) => fd.append('documents', f));
    A.busy(btn, true, 'Uploading…');
    try { const { shipment } = await A.create(fd); location.href = 'shipment.html?id=' + encodeURIComponent(shipment.id); }
    catch (err) { A.say(msg, err.message, 'err'); A.busy(btn, false, 'Start check'); }
  });
})();
