import * as sat from 'satellite.js';
import { anlikGorunum } from '../src/gecis.js';
import { gozlemci } from './gecisler.js';
import { t } from './i18n.js';
import { ayGorunum, govdeGorunum } from '../src/gece.js';
import { GEZEGENLER, gezegenKonumu, parlaklik } from '../src/gezegen.js';
import { ayEvresi } from '../src/ay.js';
import { ayYolu } from './ay-gorsel.js';

const ALTIN = '#f4c56a', MAVI = '#8fc7ff', BEYAZ = '#f2f5ff';

// Kutupsal gökyüzü haritası: merkez zenit, kenar ufuk, kuzey yukarıda, doğu solda (başımızı kaldırıp bakış).
export function gokyuzuKur(canvas) {
  const ctx = canvas.getContext('2d');
  let durum = { sats: [], gecisler: [], secili: null, zaman: new Date() };
  let boyut = 0, dpr = 1;

  function olc() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    boyut = canvas.clientWidth;
    canvas.width = Math.round(boyut * dpr); canvas.height = Math.round(boyut * dpr);
    ciz();
  }
  const merkez = () => boyut / 2, R = () => boyut / 2 - Math.max(22, boyut * 0.06);
  const nokta = (az, alt) => { const r = ((90 - Math.max(alt, 0)) / 90) * R(), a = (az * Math.PI) / 180; return [merkez() - r * Math.sin(a), merkez() - r * Math.cos(a)]; };

  function izgara() {
    const c = merkez(), r = R();
    const g = ctx.createRadialGradient(c, c, 0, c, c, r * 1.05);
    g.addColorStop(0, '#0a1433'); g.addColorStop(0.7, '#060d24'); g.addColorStop(1, '#03071a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, r, 0, 6.2832); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(160,185,235,0.22)';
    for (const alt of [30, 60]) { ctx.beginPath(); ctx.arc(c, c, ((90 - alt) / 90) * r, 0, 6.2832); ctx.stroke(); }
    for (let az = 0; az < 360; az += 45) { const [x, y] = nokta(az, 0); ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(x, y); ctx.strokeStyle = az % 90 ? 'rgba(160,185,235,0.08)' : 'rgba(160,185,235,0.18)'; ctx.stroke(); }
    ctx.strokeStyle = 'rgba(200,215,250,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c, c, r, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = 'rgba(180,192,222,0.9)'; ctx.font = `${Math.max(11, boyut * 0.026)}px "Hanken Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const e = Math.max(13, boyut * 0.035);
    for (const [az, k] of [[0, 'harita.kuzey'], [90, 'harita.dogu'], [180, 'harita.guney'], [270, 'harita.bati']]) {
      const a = (az * Math.PI) / 180; ctx.fillText(t(k), c - (r + e) * Math.sin(a), c - (r + e) * Math.cos(a));
    }
    ctx.fillStyle = 'rgba(180,192,222,0.7)'; ctx.font = `${Math.max(10, boyut * 0.022)}px "JetBrains Mono", monospace`; ctx.textAlign = 'left';
    ctx.fillText('30°', c + 4, c - (60 / 90) * r + 10); ctx.fillText('60°', c + 4, c - (30 / 90) * r + 10);
  }

  function iz(gecis, vurgu) {
    ctx.beginPath();
    gecis.ornekler.forEach((o, i) => { const [x, y] = nokta(o.azimut, o.yukseklik); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = vurgu ? ALTIN : 'rgba(143,199,255,0.45)'; ctx.lineWidth = vurgu ? 2.2 : 1.1; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function ciz() {
    if (!boyut) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, boyut, boyut);
    izgara();
    const { sats, gecisler, secili, zaman } = durum, kucuk = Math.max(1.6, boyut * 0.0042);
    for (const g of gecisler.slice(0, 10)) if (g !== secili) iz(g, false);
    if (secili) iz(secili, true);
    ayCiz(zaman); gezegenCiz(zaman);
    // Şu anda ufuk üstündeki tüm parlak nesneler
    const gorunurAdlar = new Set(gecisler.filter((g) => zaman >= g.dogus && zaman <= g.batis).map((g) => g.ad));
    for (const s of sats) {
      const v = anlikGorunum(s.satrec, zaman, gozlemci);
      if (!v || v.yukseklik <= 0) continue;
      const [x, y] = nokta(v.azimut, v.yukseklik), onde = s === durum.seciliSat || gorunurAdlar.has(s.ad);
      ctx.beginPath(); ctx.arc(x, y, onde ? kucuk * 2.1 : kucuk, 0, 6.2832);
      ctx.fillStyle = onde ? ALTIN : 'rgba(242,245,255,0.55)'; ctx.fill();
      if (onde) { ctx.fillStyle = BEYAZ; ctx.font = `500 ${Math.max(11, boyut * 0.027)}px "Hanken Grotesk", sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s.ad.replace(/\s*\(.*$/, ''), x + kucuk * 3, y - kucuk * 2); }
    }
  }

  // Gezegenler: ufuk üstündekiler, parlaklığa göre boyutlu nokta ve ad.
  const GEZ_RENK = { merkur: '#c9c4bd', venus: '#fff6dc', mars: '#ff8a65', jupiter: '#ffe3b0', saturn: '#f2d98f', uranus: '#9be7f0', neptun: '#7ea6ff' };
  function gezegenCiz(zaman) {
    for (const ad of GEZEGENLER) {
      const k = gezegenKonumu(ad, zaman), v = govdeGorunum(k.eci, zaman, gozlemci);
      if (v.yukseklik <= 0) continue;
      const [x, y] = nokta(v.azimut, v.yukseklik), kadir = parlaklik(ad, k);
      const r = Math.max(2.2, Math.min(6.5, 4.6 - 0.55 * kadir)) * Math.max(1, boyut / 480);
      const hale = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      hale.addColorStop(0, GEZ_RENK[ad] + '66'); hale.addColorStop(1, GEZ_RENK[ad] + '00');
      ctx.fillStyle = hale; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = GEZ_RENK[ad]; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      ctx.fillStyle = GEZ_RENK[ad]; ctx.font = `500 ${Math.max(11, boyut * 0.026)}px "Hanken Grotesk", sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(t('gez.' + ad), x + r + 5, y - r);
    }
  }

  // Ay: konumu ve evresi (silüet şematiktir, gökteki eğim açısı gösterilmez). Ufkun altındaysa çizilmez.
  function ayCiz(zaman) {
    const v = ayGorunum(zaman, gozlemci);
    if (v.yukseklik < 0) return;
    const e = ayEvresi(zaman), [x, y] = nokta(v.azimut, v.yukseklik), r = Math.max(7, boyut * 0.018);
    ctx.save(); ctx.translate(x, y);
    const hale = ctx.createRadialGradient(0, 0, r, 0, 0, r * 3.2);
    hale.addColorStop(0, `rgba(233,237,247,${0.08 + 0.22 * e.aydinlik})`); hale.addColorStop(1, 'rgba(233,237,247,0)');
    ctx.fillStyle = hale; ctx.beginPath(); ctx.arc(0, 0, r * 3.2, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#1a2240'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#e9edf7'; ctx.fill(new Path2D(ayYolu(e.aydinlik, e.buyuyen, r)));
    ctx.fillStyle = 'rgba(233,237,247,0.85)'; ctx.font = `500 ${Math.max(11, boyut * 0.026)}px "Hanken Grotesk", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(t('harita.ay'), 0, r + 5);
    ctx.restore();
  }

  new ResizeObserver(olc).observe(canvas);
  document.addEventListener('dilDegisti', ciz);
  olc();
  return {
    guncelle(yeni) { durum = { ...durum, ...yeni }; durum.seciliSat = durum.secili ? durum.sats.find((s) => s.ad === durum.secili.ad) : null; ciz(); },
  };
}
