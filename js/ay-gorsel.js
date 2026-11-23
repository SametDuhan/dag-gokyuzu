// "Bu gece" sayfası: Ay evresi kartı, gecenin zaman çizelgesi (Güneş/Ay), olay listesi.
import { t } from './i18n.js';
import { saatYaz } from './yardimci.js';
import { ESIK, UFUK_GUNES, UFUK_AY } from '../src/gece.js';

// Ay evresi silueti (SVG yol verisi, merkez 0,0). k: aydınlık kesir, buyuyen: sağ taraf aydınlık (kuzey yarıküre görünümü).
export function ayYolu(k, buyuyen, r) {
  const rx = (r * Math.abs(1 - 2 * k)).toFixed(2), s1 = buyuyen ? 1 : 0;
  const s2 = buyuyen ? (k < 0.5 ? 0 : 1) : (k < 0.5 ? 1 : 0);
  return `M0,${-r} A${r},${r} 0 0 ${s1} 0,${r} A${rx},${r} 0 0 ${s2} 0,${-r} Z`;
}

export function sureYazSa(dk) {
  const s = Math.floor(dk / 60), d = dk % 60;
  return s ? t('sure.sa', { s, d }) : t('sure.dk', { d });
}
// Gece penceresi öğleden öğleye; gün ortasındaki Ay doğuş/batışı "bu gece" için anlamsız. Gün batımından 2 saat
// öncesi ile gün doğumundan 2 saat sonrası arasındakiler gösterilir.
function geceAyOlaylari(oz) {
  const bas = (oz.olaylar.gunBatimi ?? oz.pencere.bas).getTime() - 2 * 3600e3, bit = (oz.olaylar.gunDogumu ?? oz.pencere.bit).getTime() + 2 * 3600e3;
  return oz.ayOlaylari.filter((o) => o.zaman >= bas && o.zaman <= bit);
}
const aralikYaz = (l) => l.map((a) => `${saatYaz(a.bas)}–${saatYaz(a.bit)}`).join(', ');

export function ozetYaz(el, oz) {
  const kar = t('gece.karanlik', { sure: sureYazSa(oz.karanlikDk) });
  el.textContent = (oz.aysizDk > 0 ? t('gece.ozet', { sure: sureYazSa(oz.aysizDk), araliklar: aralikYaz(oz.aysiz) }) : t('gece.ozetYok')) + ' ' + kar;
}

export function ayKartCiz(kap, oz) {
  const { aydinlik, buyuyen, ad } = oz.ay, r = 40;
  const satirlar = geceAyOlaylari(oz).map((o) => `${t('olay.' + o.tur)} ${saatYaz(o.zaman)}`);
  kap.innerHTML = `<svg class="ay-resim" viewBox="-50 -50 100 100" role="img" aria-label="${t('ay.evre.' + ad)}, ${t('ay.yuzde', { v: Math.round(aydinlik * 100) })}">
      <circle r="${r + 6}" class="ay-hale"/><circle r="${r}" class="ay-karanlik"/><path d="${ayYolu(aydinlik, buyuyen, r)}" class="ay-aydinlik"/></svg>
    <div><p class="ay-ad">${t('ay.evre.' + ad)}</p><p class="ay-yuzde">${t('ay.yuzde', { v: Math.round(aydinlik * 100) })}</p>
    <p class="ay-saat">${satirlar.join(' · ')}</p></div>`;
}

export function olaylarCiz(ol, oz) {
  const o = oz.olaylar;
  const liste = [['gunBatimi', o.gunBatimi], ['astroBas', o.astroBas], ['astroBit', o.astroBit], ['gunDogumu', o.gunDogumu], ...geceAyOlaylari(oz).map((a) => [a.tur, a.zaman])]
    .filter(([, z]) => z).sort((a, b) => a[1] - b[1]);
  ol.replaceChildren(...liste.map(([tur, z]) => {
    const li = document.createElement('li'); li.className = 'olay-' + tur;
    li.innerHTML = `<time datetime="${z.toISOString()}">${saatYaz(z)}</time><span>${t('olay.' + tur)}</span>`;
    return li;
  }));
}

// Zaman çizelgesi: üst şerit Güneş'e göre gökyüzü (gündüz / alacakaranlık / karanlık), alt şerit Ay'ın yüksekliği,
// altın çizgi Ay'sız astronomik karanlık. Yalnız gün batımından bir saat öncesi ile gün doğumundan bir saat sonrası çizilir.
export function cizelgeCiz(kap, oz, simdi = new Date()) {
  const { zamanlar, gunes, ay } = oz.seri, o = oz.olaylar;
  const t0 = (o.gunBatimi ?? oz.pencere.bas).getTime() - 3600e3, t1 = (o.gunDogumu ?? oz.pencere.bit).getTime() + 3600e3;
  // Kutunun gerçek genişliğinde çizilir ki yazılar telefonda küçülmesin.
  const W = Math.round(Math.min(900, Math.max(320, kap.clientWidth || 800))), sol = 50, sag = 8, x = (tt) => sol + ((tt - t0) / (t1 - t0)) * (W - sol - sag);
  const GY = 10, GH = 30, AY0 = 50, AH = 34, CY = 94;
  const sinif = (h) => (h > UFUK_GUNES ? 'c-gunduz' : h > ESIK.sivil ? 'c-sivil' : h > ESIK.deniz ? 'c-deniz' : h > ESIK.astro ? 'c-astro' : 'c-karanlik');
  let parcalar = '', onceki = null, bas = null, ayYol = '', ayAcik = false;
  for (let i = 0; i < zamanlar.length; i++) {
    const tt = zamanlar[i]; if (tt < t0 || tt > t1) continue;
    const s = sinif(gunes[i]);
    if (s !== onceki) { if (onceki) parcalar += `<rect class="${onceki}" x="${x(bas).toFixed(1)}" y="${GY}" width="${(x(tt) - x(bas)).toFixed(1)}" height="${GH}"/>`; onceki = s; bas = tt; }
    const yuk = Math.max(0, ay[i] - UFUK_AY), y = (AY0 + AH - (yuk / 90) * AH).toFixed(1);
    if (ay[i] >= UFUK_AY) { ayYol += ayAcik ? ` L${x(tt).toFixed(1)},${y}` : ` M${x(tt).toFixed(1)},${AY0 + AH} L${x(tt).toFixed(1)},${y}`; ayAcik = true; }
    else if (ayAcik) { ayYol += ` L${x(tt).toFixed(1)},${AY0 + AH} Z`; ayAcik = false; }
  }
  const son = Math.min(t1, zamanlar[zamanlar.length - 1]);
  if (onceki) parcalar += `<rect class="${onceki}" x="${x(bas).toFixed(1)}" y="${GY}" width="${(x(son) - x(bas)).toFixed(1)}" height="${GH}"/>`;
  if (ayAcik) ayYol += ` L${x(son).toFixed(1)},${AY0 + AH} Z`;
  const aysiz = oz.aysiz.filter((a) => a.bit > t0 && a.bas < t1)
    .map((a) => `<line class="c-aysiz" x1="${x(Math.max(t0, a.bas)).toFixed(1)}" x2="${x(Math.min(t1, a.bit)).toFixed(1)}" y1="${CY}" y2="${CY}"/>`).join('');
  let isaret = '';
  for (let h = Math.ceil(t0 / 3600e3) * 3600e3; h <= t1; h += 3600e3) {
    const xx = x(h).toFixed(1), saat = Number(saatYaz(new Date(h)).slice(0, 2));
    isaret += `<line class="c-isaret" x1="${xx}" x2="${xx}" y1="${GY + GH}" y2="${AY0 + AH + 4}"/>`;
    if (saat % (W < 520 ? 3 : 2) === 0) isaret += `<text class="c-saat" x="${xx}" y="114" text-anchor="middle">${saatYaz(new Date(h))}</text>`;
  }
  const simdiX = simdi >= t0 && simdi <= t1 ? `<line class="c-simdi" x1="${x(simdi).toFixed(1)}" x2="${x(simdi).toFixed(1)}" y1="4" y2="${CY + 4}"/>` : '';
  kap.innerHTML = `<svg viewBox="0 0 ${W} 120" class="cizelge" role="img" aria-label="${t('cizelge.etiket')}">
    <text class="c-et" x="0" y="${GY + GH / 2 + 4}">${t('cizelge.gunes')}</text><text class="c-et" x="0" y="${AY0 + AH / 2 + 4}">${t('cizelge.ay')}</text>
    ${parcalar}<rect class="c-cerceve" x="${sol}" y="${GY}" width="${W - sol - sag}" height="${GH}"/><rect class="c-ay-zemin" x="${sol}" y="${AY0}" width="${W - sol - sag}" height="${AH}"/>
    <path class="c-ay" d="${ayYol}"/>${isaret}${aysiz}${simdiX}</svg>`;
}
