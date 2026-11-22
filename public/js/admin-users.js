(function () {
  const A = ClearedAPI, body = document.getElementById('rows'), form = document.getElementById('staffForm'), msg = document.getElementById('msg');
  async function load() {
    const { users } = await A.admin('users');
    body.innerHTML = users.map((u) => `<tr><td>${A.esc(u.name)}</td><td>${A.esc(u.phone)}</td><td>${A.esc(u.role)}</td><td>${u.shipments}</td><td>${u.freeOrdersUsed} of ${u.freeOrdersLimit}</td><td>${A.fmtDate(u.createdAt)}</td><td>${u.isActive ? '<span class="badge ok">Active</span>' : '<span class="badge bad">Off</span>'}</td><td><button class="btn alt sm" data-id="${A.esc(u.id)}" data-on="${u.isActive}">${u.isActive ? 'Turn off' : 'Turn on'}</button></td></tr>`).join('');
  }
  body.addEventListener('click', async (e) => { const b = e.target.closest('button[data-id]'); if (!b) return; try { await A.admin('users/' + b.dataset.id, 'PATCH', { isActive: b.dataset.on !== 'true' }); load(); } catch (err) { A.say(msg, err.message, 'err'); } });
  form.addEventListener('submit', async (e) => { e.preventDefault(); try { await A.admin('users', 'POST', { name: form.name.value, phone: form.phone.value, role: form.role.value }); A.say(msg, 'Saved.', 'good'); form.reset(); load(); } catch (err) { A.say(msg, err.message, 'err'); } });
  load().catch((e) => A.say(msg, e.message, 'err'));
})();
