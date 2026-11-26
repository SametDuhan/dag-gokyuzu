// "Şimdi DAG'da" paneli: Open-Meteo modelinin anlık değerleri, 24 saatlik bulut katmanları, jet akımı rüzgârı ve NOAA SWPC Kp indeksi.
// Hepsi model/tahmin verisidir; yerinde sensör ölçümü değildir.
import { DAG } from '../src/gozlemevi.js';
import { t, getDil } from './i18n.js';
import { saatYaz } from './yardimci.js';

export const JET_GUCLU_MS = 30; // 250 hPa rüzgârı bunun üstündeyse "güçlü" işaretlenir. Eşik yazarın varsayımı.
export const CIG_FARKI_C = 2;   // T − Td bunun altındaysa yoğuşma riski. Pratik kural, resmî sınır değil.

async function getir(url, ms = 9000) {
  const ctrl = new AbortController(), z = setTimeout(() => ctrl.abort(), ms);
  try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(z); }
}

export async function kosulYukle() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${DAG.enlemDerece}&longitude=${DAG.boylamDerece}&elevation=${Math.round(DAG.rakimKm * 1000)}` +
    '&current=temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,surface_pressure' +
    '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_250hPa&forecast_days=2&timezone=UTC';
  return getir(url);
}

// Kp: son kayıt ve son 24 saatin (8 ölçüm) en yükseği
export async function kpYukle() {
  const a = await getir('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
  const son = a.slice(-8).map((x) => Number(x.Kp)).filter((x) => Number.isFinite(x));
  return { simdi: son[son.length - 1], enYuksek: Math.max(...son) };
}

const sayi = (v, k = 0) => new Intl.NumberFormat(getDil() === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: k, minimumFractionDigits: k }).format(v);

export function kosulCiz(kap, v, kp) {
  const c = v.current, fark = c.temperature_2m - c.dew_point_2m, risk = fark <= CIG_FARKI_C;
  const kutu = (et, deger, alt, sinif = '') => `<li class="stat ${sinif}"><span class="stat-et">${et}</span><strong class="stat-deger">${deger}</strong><span class="stat-alt">${alt}</span></li>`;
  const kpSinif = kp ? (kp.simdi >= 5 ? 'kp-firtina' : kp.simdi >= 4 ? 'kp-aktif' : '') : '';
  const kpDurum = kp ? t(kp.simdi >= 5 ? 'kos.kpFirtina' : kp.simdi >= 4 ? 'kos.kpAktif' : 'kos.kpSakin') : '';
  kap.innerHTML =
    kutu(t('kos.sic'), `${sayi(c.temperature_2m, 1)} °C`, `${t('kos.nem')} ${t('yuzde', { v: sayi(c.relative_humidity_2m) })}`) +
    kutu(t('kos.cig'), `${sayi(fark, 1)} °C`, t(risk ? 'kos.cigRisk' : 'kos.cigIyi'), risk ? 'stat-uyari' : 'stat-altin') +
    kutu(t('kos.ruzgar'), `${sayi(c.wind_speed_10m / 3.6, 1)} m/s`, `${t('kos.hamle')} ${sayi(c.wind_gusts_10m / 3.6, 1)} m/s`) +
    kutu(t('kos.bulut'), t('yuzde', { v: sayi(c.cloud_cover) }), `${t('kos.basinc')} ${sayi(c.surface_pressure)} hPa`) +
    (kp === undefined ? kutu(t('kos.kp'), '…', '') : kp ? kutu(t('kos.kp'), `Kp ${sayi(kp.simdi, 1)}`, `${kpDurum} · ${t('kos.kpAlt', { m: sayi(kp.enYuksek, 1) })}`, kpSinif) : kutu(t('kos.kp'), '—', t('kos.kpYok')));
}

// 24 saatlik küçük çoklu şerit: bulut katmanları (yüzde) ve jet akımı (m/s). Şu andan itibaren.
export function katmanCiz(kap, v, simdi = new Date()) {
  const h = v.hourly, bas = Math.floor(simdi.getTime() / 3600e3) * 3600e3, idx = [];
  for (let i = 0; i < h.time.length && idx.length < 24; i++) if (new Date(h.time[i] + ':00Z').getTime() >= bas) idx.push(i);
  const satir = (anahtar, deger, hucre) => `<li class="katman"><span class="katman-ad">${t(anahtar)}</span><ol>${idx.map((i) => hucre(i, deger[i])).join('')}</ol></li>`;
  const bulut = (i, d) => `<li style="--v:${(d ?? 0) / 100}" title="${saatYaz(new Date(h.time[i] + ':00Z'))} · ${t('yuzde', { v: Math.round(d ?? 0) })}"><i></i></li>`;
  const jet = (i, d) => { const ms = d / 3.6; return `<li class="jet${ms >= JET_GUCLU_MS ? ' guclu' : ''}" style="--v:${Math.min(1, ms / 60)}" title="${saatYaz(new Date(h.time[i] + ':00Z'))} · ${sayi(ms, 0)} m/s"><i></i><b>${Math.round(ms)}</b></li>`; };
  const saatler = `<li class="katman katman-saat"><span class="katman-ad"></span><ol>${idx.map((i) => `<li>${saatYaz(new Date(h.time[i] + ':00Z')).slice(0, 2)}</li>`).join('')}</ol></li>`;
  kap.innerHTML = `<ul class="katmanlar">${saatler}${satir('kos.alcak', h.cloud_cover_low, bulut)}${satir('kos.orta', h.cloud_cover_mid, bulut)}${satir('kos.yuksek', h.cloud_cover_high, bulut)}${satir('kos.jet', h.wind_speed_250hPa, jet)}</ul>`;
}
