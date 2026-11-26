// Giriş arka planı: ortadaki kütleçekim kuyusunun çevresinde dönen, içeri doğru çekilen parçacık izleri.
// Kuyuya yaklaştıkça hızlanır, parlar ve incelir. Hareket azaltma açıksa yalnız önceden ısıtılmış tek kare çizilir.
const RENKLER = [[143, 199, 255], [143, 199, 255], [190, 210, 255], [255, 255, 255], [244, 197, 106]];
const SABIT_DT = 1 / 60;

export function girdapBaslat(canvas) {
  const ctx = canvas.getContext('2d');
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, rMax = 1, rMin = 0, ex = 1, ey = 1, parcalar = [], raf = 0, son = 0;

  const dogur = (p, ilk) => {
    p.r = rMin + (rMax - rMin) * (ilk ? Math.random() ** 0.8 : 0.75 + Math.random() * 0.25);
    p.aci = Math.random() * 6.2832;
    p.k = Math.random();
    p.renk = RENKLER[(Math.random() * RENKLER.length) | 0];
    p.px = p.py = NaN;
    return p;
  };

  function kur() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    cx = w / 2; cy = h / 2;
    // yatay ekranda disk yassı, dikey ekranda dik durur
    ex = w >= h ? 1 : 0.62; ey = w >= h ? 0.62 : 1;
    rMax = Math.max(w, h) * 0.62; rMin = rMax * 0.07;
    const adet = Math.max(500, Math.min(1500, Math.round((w * h) / 1100)));
    parcalar = Array.from({ length: adet }, () => dogur({}, true));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) adim(SABIT_DT); // izler ilk karede hazır olsun
  }

  function adim(dt) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(2,4,10,0.065)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of parcalar) {
      const yakin = 1 - p.r / rMax;                                   // 0 dışta, 1 kuyunun dibinde
      const omega = (0.05 + 0.11 * p.k) / (p.r / rMax + 0.09) ** 1.1;  // iç yörünge daha hızlı döner
      p.aci += omega * dt;
      p.r -= rMax * (0.012 + 0.05 * yakin * yakin) * (0.6 + p.k * 0.8) * dt;
      if (p.r < rMin) { dogur(p, false); continue; }
      const x = cx + Math.cos(p.aci) * p.r * ex, y = cy + Math.sin(p.aci) * p.r * ey;
      if (p.px === p.px) { // NaN değilse
        const a = Math.min(1, 0.22 + yakin ** 1.2 * 1.2) * (0.55 + p.k * 0.45);
        const [r, g, b] = p.renk;
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.lineWidth = (0.7 + p.k * 1.1) * (1 - yakin * 0.4);
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(x, y); ctx.stroke();
      }
      p.px = x; p.py = y;
    }
  }

  function dongu(ms) {
    raf = requestAnimationFrame(dongu);
    const dt = Math.min(0.05, (ms - son) / 1000 || SABIT_DT); son = ms;
    adim(dt);
  }
  function baslat() {
    cancelAnimationFrame(raf);
    if (azalt.matches || document.hidden) return;
    son = performance.now(); raf = requestAnimationFrame(dongu);
  }

  kur(); baslat();
  let bekle; addEventListener('resize', () => { clearTimeout(bekle); bekle = setTimeout(() => { kur(); baslat(); }, 150); });
  document.addEventListener('visibilitychange', baslat);
  azalt.addEventListener('change', baslat);
}
