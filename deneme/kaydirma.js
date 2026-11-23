// Kaydırmalı giriş: kaydırma ilerlemesine göre kare dizisinden doğru kareyi <canvas>'a çizer.
// Kareler: kareler/<set>/0001.jpg…, sayı ve boyut kareler/kareler.json'dan.
import { veriBaslat } from './kaydirma-veri.js';

const KLASOR = 'kareler';
const kok = document.documentElement;
const bolum = document.getElementById('kaydir');
const yazilar = [...document.querySelectorAll('.sahne-yazi')];
const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
const adres = (set, i) => `${KLASOR}/${set}/${String(i + 1).padStart(4, '0')}.jpg`;

const veri = veriBaslat(); // canlı katman: kare olsun olmasın, yazılar doldurulur

const bilgi = await fetch(`${KLASOR}/kareler.json`).then(r => r.json()).catch(() => null);

if (!bilgi) {
  // kare yoksa sayfa durgun düzende kalır, yazılar okunur
} else if (azalt) {
  // Hareketsiz sürüm: her yazının üstüne kendi aralığının ortasındaki kare
  const set = 'masaustu';
  for (const y of yazilar) {
    const orta = (Number(y.dataset.bas) + Math.min(1, Number(y.dataset.bit))) / 2;
    const img = new Image(bilgi.setler[set].genislik, bilgi.setler[set].yukseklik);
    img.src = adres(set, Math.round(orta * (bilgi.kare - 1)));
    img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    y.prepend(img);
  }
} else {
  canliKur(bilgi);
}

function canliKur(bilgi) {
  kok.classList.add('canli');
  const tuval = document.getElementById('kareTuval');
  const ctx = tuval.getContext('2d');
  const cubuk = document.getElementById('ilerleme');
  const yukleme = document.getElementById('yukleme');
  const N = bilgi.kare;
  const dikey = matchMedia('(max-aspect-ratio: 4/5)');
  let set = dikey.matches ? 'mobil' : 'masaustu';
  let kareler = [], cizilen = -1, istenen = 0, bekliyor = false;

  // Önce seyrek kareler (her 16.), sonra aralar dolar: kaydırma hemen çalışır, kalite giderek artar.
  function yukle() {
    kareler = new Array(N).fill(null);
    // Her seviyede, o an bakılan kareye en yakın olan önce indirilir (sayfa ortadan açılırsa da doğru kare çabuk gelir).
    const seviyeler = [], gorulen = new Set();
    for (const adim of [16, 8, 4, 2, 1]) {
      const s = [];
      for (let i = 0; i < N; i += adim) if (!gorulen.has(i)) { gorulen.add(i); s.push(i); }
      if (adim === 16 && !gorulen.has(N - 1)) { gorulen.add(N - 1); s.push(N - 1); }
      seviyeler.push(s);
    }
    const siradaki = () => {
      const s = seviyeler.find(x => x.length);
      if (!s) return -1;
      let en = 0;
      for (let k = 1; k < s.length; k++) if (Math.abs(s[k] - istenen) < Math.abs(s[en] - istenen)) en = k;
      return s.splice(en, 1)[0];
    };
    let biten = 0;
    const buSet = set;
    const isci = async () => {
      for (let i = siradaki(); i >= 0 && buSet === set; i = siradaki()) {
        const img = new Image();
        img.src = adres(buSet, i);
        try { await img.decode(); } catch { continue; }
        if (buSet !== set) return;
        kareler[i] = img; biten++;
        yukleme.textContent = biten < N ? `kareler ${Math.round(100 * biten / N)}%` : '';
        if (Math.abs(i - istenen) < 16) { cizilen = -1; iste(); }
      }
    };
    for (let k = 0; k < 6; k++) isci();
  }

  function enYakin(i) {
    for (let d = 0; d < N; d++) {
      if (kareler[i - d]) return i - d;
      if (kareler[i + d]) return i + d;
    }
    return -1;
  }

  function boyutla() {
    const o = Math.min(devicePixelRatio || 1, 2);
    tuval.width = Math.round(tuval.clientWidth * o);
    tuval.height = Math.round(tuval.clientHeight * o);
    cizilen = -1;
  }

  function ciz() {
    bekliyor = false;
    const r = bolum.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight) || 0)); // boyutsuz (gizli) görünümde 0/0 olmasın
    istenen = Math.round(t * (N - 1));
    cubuk.style.transform = `scaleX(${t})`;

    const j = enYakin(istenen);
    if (j >= 0 && j !== cizilen) {
      const img = kareler[j], W = tuval.width, H = tuval.height;
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight); // "cover"
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      cizilen = j;
    }

    veri.izCiz(t);

    for (const y of yazilar) {
      const bas = Number(y.dataset.bas), bit = Number(y.dataset.bit), g = 0.035;
      const giris = bas <= 0 ? 1 : (t - bas) / g; // ilk yazı sayfa açılınca görünür
      const o = Math.min(1, Math.max(0, Math.min(giris, (bit - t) / g)));
      const kay = (1 - o) * (t < (bas + bit) / 2 ? 24 : -24);
      y.style.opacity = o;
      y.style.translate = `0 ${kay}px`;
      y.classList.toggle('gorunur', o > 0.01);
    }
  }
  const iste = () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(ciz); } };

  if (new URLSearchParams(location.search).has('test')) window.__ciz = ciz; // gizli sekmede rAF durur; testte elle çizdirmek için
  addEventListener('scroll', iste, { passive: true });
  addEventListener('resize', () => { boyutla(); iste(); });
  dikey.addEventListener('change', () => { set = dikey.matches ? 'mobil' : 'masaustu'; yukle(); });
  boyutla();
  yukle();
  iste();
}
