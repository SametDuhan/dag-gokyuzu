import { DAG } from '../src/gozlemevi.js';
import { saatDurumu, ESIKLER } from '../src/iklim.js';
import { t } from './i18n.js';
import { saatYaz } from './yardimci.js';

export async function havaYukle() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${DAG.enlemDerece}&longitude=${DAG.boylamDerece}` +
    '&hourly=cloud_cover,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,precipitation&forecast_days=3&timezone=UTC';
  const ctrl = new AbortController(); const z = setTimeout(() => ctrl.abort(), 9000);
  const r = await fetch(url, { signal: ctrl.signal }); clearTimeout(z);
  if (!r.ok) throw new Error(r.status);
  return (await r.json()).hourly;
}

// Şu andan itibaren 24 saat: her saat için {zaman, bulut, gece, uygun}
export function saatleriHazirla(h, simdi = new Date()) {
  const bas = Math.floor(simdi.getTime() / 3600e3) * 3600e3, cikti = [];
  for (let i = 0; i < h.time.length && cikti.length < 24; i++) {
    const zaman = new Date(h.time[i] + ':00Z');
    if (zaman.getTime() < bas) continue;
    const v = { bulut: h.cloud_cover[i], ruzgar: h.wind_speed_10m[i], ruzgarEs: h.wind_gusts_10m[i], nem: h.relative_humidity_2m[i], yagis: h.precipitation[i] };
    cikti.push({ zaman, bulut: v.bulut, ...saatDurumu(zaman, v, ESIKLER, DAG) });
  }
  return cikti;
}

export function seritCiz(kap, saatler) {
  kap.replaceChildren();
  const liste = document.createElement('ol'); liste.className = 'serit';
  for (const s of saatler) {
    const li = document.createElement('li');
    li.className = !s.gece ? 'gunduz' : s.uygun ? 'uygun' : 'degil';
    const durum = !s.gece ? t('hava.gunduz') : s.uygun ? t('hava.uygun') : t('hava.degil');
    li.setAttribute('aria-label', `${saatYaz(s.zaman)}: ${durum}, ${t('hava.bulut')} %${Math.round(s.bulut)}`);
    li.innerHTML = `<span class="serit-saat">${saatYaz(s.zaman).slice(0, 2)}</span><span class="serit-cubuk"><i style="height:${Math.max(4, Math.round(s.bulut))}%"></i></span>`;
    liste.append(li);
  }
  kap.append(liste);
}

// Kullanılan eşikleri okunur liste olarak yazar (bu gece sayfası)
export function esikleriCiz(ul) {
  if (!ul) return;
  const e = ESIKLER;
  const satirlar = [['esik.karanlik', -e.karanlikGunes], ['esik.bulut', e.bulutMax], ['esik.ruzgar', e.ruzgarMax], ['esik.hamle', e.ruzgarEsMax], ['esik.nem', e.nemMax], ['esik.yagis', 0]];
  ul.replaceChildren(...satirlar.map(([k, v]) => Object.assign(document.createElement('li'), { textContent: t(k, { v }) })));
}
