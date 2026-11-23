// Arka plan: sola doğru yavaşça akan, parıldayan yıldızlar + ara sıra kayan yıldızlar (meteor).
// Hareket azaltma açıksa yalnız tek kare çizilir, meteor yoktur.
export function yildizlariBaslat(canvas) {
  const ctx = canvas.getContext('2d');
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, dpr = 1, yildizlar = [], meteorlar = [], raf = 0, son = 0, sonrakiMeteor = 0;
  const rastgele = (() => { let s = 20261223; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
  const gercek = Math.random;

  function kur() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const adet = Math.round((w * h) / 4200);
    yildizlar = Array.from({ length: adet }, () => {
      const parlak = rastgele() ** 3;
      return { x: rastgele() * w, y: rastgele() * h, r: 0.35 + parlak * 1.3, a: 0.25 + parlak * 0.7, hiz: 0.25 + rastgele() * 0.9, faz: rastgele() * 6.28,
        akis: 3 + parlak * 9 + rastgele() * 3, isi: rastgele() < 0.16 ? 0 : rastgele() < 0.5 ? 1 : 2 };
    });
  }
  const renk = (isi, a) => (isi === 0 ? `rgba(255,214,160,${a})` : isi === 1 ? `rgba(190,215,255,${a})` : `rgba(244,247,255,${a})`);

  function meteorEkle() {
    const aci = (22 + gercek() * 22) * Math.PI / 180, yon = gercek() < 0.5 ? 1 : -1; // sağa ya da sola
    meteorlar.push({ x: gercek() * w * (yon > 0 ? 0.7 : 1) + (yon > 0 ? 0 : 0), y: gercek() * h * 0.5, vx: Math.cos(aci) * yon, vy: Math.sin(aci),
      hiz: 650 + gercek() * 500, boy: 120 + gercek() * 140, omur: 0.8 + gercek() * 0.7, yas: 0 });
  }

  function ciz(ms) {
    const dt = Math.min(0.05, (ms - son) / 1000 || 0); son = ms;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sn = ms / 1000;
    for (const y of yildizlar) {
      const parilti = azalt.matches ? 1 : 0.7 + 0.3 * Math.sin(sn * y.hiz + y.faz);
      const kayma = azalt.matches ? 0 : (sn * y.akis) % (w + 12);
      let x = y.x - kayma; if (x < -6) x += w + 12;
      ctx.beginPath(); ctx.fillStyle = renk(y.isi, y.a * parilti); ctx.arc(x, y.y, y.r, 0, 6.2832); ctx.fill();
    }
    if (azalt.matches) return;
    sonrakiMeteor -= dt;
    if (sonrakiMeteor <= 0) { meteorEkle(); sonrakiMeteor = 2.2 + gercek() * 4.5; }
    meteorlar = meteorlar.filter((m) => m.yas < m.omur);
    for (const m of meteorlar) {
      m.yas += dt; m.x += m.vx * m.hiz * dt; m.y += m.vy * m.hiz * dt;
      const k = m.yas / m.omur, a = Math.sin(Math.PI * Math.min(1, k)) , tx = m.x - m.vx * m.boy, ty = m.y - m.vy * m.boy;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); g.addColorStop(0.25, `rgba(190,215,255,${0.45 * a})`); g.addColorStop(1, 'rgba(190,215,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.arc(m.x, m.y, 1.8, 0, 6.2832); ctx.fill();
    }
  }
  function dongu(ms) { ciz(ms); raf = requestAnimationFrame(dongu); }
  function baslat() { cancelAnimationFrame(raf); son = performance.now(); if (azalt.matches || document.hidden) ciz(0); else raf = requestAnimationFrame(dongu); }

  kur(); baslat();
  let bekle; addEventListener('resize', () => { clearTimeout(bekle); bekle = setTimeout(() => { kur(); baslat(); }, 150); });
  document.addEventListener('visibilitychange', baslat);
  azalt.addEventListener('change', baslat);
}
