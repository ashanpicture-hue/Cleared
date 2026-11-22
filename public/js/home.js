(function () {
  const fix = document.getElementById('fix'), stamp = document.getElementById('stamp'), msg = document.getElementById('msg');
  if (!fix) return;
  const busy = (on) => { fix.disabled = true; if (on) fix.setAttribute('aria-busy', 'true'); else fix.removeAttribute('aria-busy'); };
  fix.addEventListener('click', () => {
    const cells = [...document.querySelectorAll('td.x')];
    busy(true);
    cells.forEach((td, i) => setTimeout(() => {
      td.textContent = td.dataset.f; td.className = 'ok';
      const left = cells.length - i - 1;
      window.dispatchEvent(new CustomEvent('cleared:mismatches', { detail: { left, total: cells.length } }));
      if (left) { stamp.textContent = left + (left > 1 ? ' MISMATCHES' : ' MISMATCH'); return; }
      stamp.textContent = 'CLEARED'; stamp.className = 'stamp good pop';
      msg.textContent = 'All fields now agree. Corrected set is ready.';
      busy(false); fix.textContent = 'Fixed';
    }, i * 240));
  });
})();
