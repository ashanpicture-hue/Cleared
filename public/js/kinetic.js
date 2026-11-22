// Kinetic letter: one heavy serif letter cut into tiles that slip on crossing sine waves.
// Ripple strength follows how many mismatches are left in the hero demo.
(function () {
  const host = document.getElementById('ripple');
  if (!host) return;
  const canvas = host.querySelector('canvas'), ctx = canvas.getContext('2d');
  const P = { text: 'c', paper: '#0c1b48', ink: '#eaf1fd', accent: '#62a7ea', comp: '#f2ea1e', tiles: 34, offset: 26, speed: 0.02, spread: 0.025, chroma: 0.35, shade: 0.35, grain: 0.7 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  let W, H, dpr, mask, warp, tint, grain, box, rows, tw, th, calm = 1, target = 1, frame = 90, last = 0, running = false, visible = true;

  function build() {
    const r = host.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    mask = mk(W * dpr, H * dpr); warp = mk(W * dpr, H * dpr); tint = mk(W * dpr, H * dpr);
    const m = mask.getContext('2d'); m.scale(dpr, dpr); m.fillStyle = '#fff'; m.textBaseline = 'alphabetic';
    const face = (s) => `900 ${s}px Fraunces, Georgia, serif`;
    let size = H; m.font = face(size); let t = m.measureText(P.text);
    size *= (H * 0.86) / (t.actualBoundingBoxAscent + t.actualBoundingBoxDescent); m.font = face(size); t = m.measureText(P.text);
    let inkW = t.actualBoundingBoxLeft + t.actualBoundingBoxRight;
    if (inkW > W * 0.9) { size *= (W * 0.9) / inkW; m.font = face(size); t = m.measureText(P.text); inkW = t.actualBoundingBoxLeft + t.actualBoundingBoxRight; }
    const left = (W - inkW) / 2, base = (H + t.actualBoundingBoxAscent - t.actualBoundingBoxDescent) / 2;
    m.fillText(P.text, left + t.actualBoundingBoxLeft, base);
    box = { x: left, y: base - t.actualBoundingBoxAscent, w: inkW, h: t.actualBoundingBoxAscent + t.actualBoundingBoxDescent };
    rows = Math.round((P.tiles * H) / W); tw = W / P.tiles; th = H / rows;
    grain = mk(W, H); const g = grain.getContext('2d'), img = g.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.random() * 26; }
    g.putImageData(img, 0, 0); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  }

  function paint(color, shift, alpha) {
    const c = tint.getContext('2d'); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, tint.width, tint.height);
    c.drawImage(warp, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, tint.width, tint.height);
    ctx.globalAlpha = alpha; ctx.drawImage(tint, shift * dpr, 0);
  }

  function draw() {
    const w = warp.getContext('2d'); w.clearRect(0, 0, warp.width, warp.height);
    const time = frame * P.speed, amp = P.offset * calm;
    const i0 = Math.max(0, Math.floor((box.x - P.offset) / tw)), i1 = Math.min(P.tiles, Math.ceil((box.x + box.w + P.offset) / tw));
    const j0 = Math.max(0, Math.floor((box.y - P.offset) / th)), j1 = Math.min(rows, Math.ceil((box.y + box.h + P.offset) / th));
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const dx = amp * 0.5 * (Math.sin(time + i * j * P.spread) + Math.sin(time * 2 + (i + j) * P.spread * 2));
      const dy = amp * 0.7 * Math.sin(time * 1.3 + (i - j) * P.spread * 3);
      const moved = Math.min(1, Math.hypot(dx, dy) / P.offset);
      w.globalAlpha = 1 - P.shade * (1 - moved) * calm;
      const x0 = Math.floor(i * tw * dpr), x1 = Math.floor((i + 1) * tw * dpr), y0 = Math.floor(j * th * dpr), y1 = Math.floor((j + 1) * th * dpr);
      w.drawImage(mask, x0 + Math.round(dx * dpr), y0 + Math.round(dy * dpr), x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); // edges meet exactly, so no seams
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = P.paper; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shift = 4 * calm + 1;
    paint(P.accent, shift, P.chroma); paint(P.comp, -shift, P.chroma); paint(P.ink, 0, 1);
    ctx.globalAlpha = P.grain * 0.4; ctx.drawImage(grain, 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1;
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(64, now - (last || now)); last = now; frame += dt / 16.667;
    calm += (target - calm) * Math.min(1, (dt / 16.667) * 0.05);
    draw();
    if (target === 0 && calm < 0.005) { calm = 0; draw(); running = false; return; } // fully settled, stop spending CPU
    requestAnimationFrame(tick);
  }
  function start() { if (reduce || running || !visible) return; running = true; last = 0; requestAnimationFrame(tick); }

  window.addEventListener('cleared:mismatches', (e) => {
    const { left, total } = e.detail; target = left === 0 ? 0 : 0.2 + 0.8 * (left / total);
    if (reduce) { calm = target; draw(); } else start();
  });
  function init() {
    build(); draw();
    new ResizeObserver(() => { build(); draw(); }).observe(host);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else running = false; }).observe(host);
    start();
  }
  Promise.race([document.fonts.load('900 100px Fraunces').catch(() => {}), new Promise((r) => setTimeout(r, 1500))]).then(init);
})();
