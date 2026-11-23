import { t } from './i18n.js';

const SAATLER = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6];
const DURAK = [[0, [9, 17, 44]], [0.5, [58, 110, 165]], [1, [255, 217, 138]]];
function renkOranla(v) {
  let i = 0; while (i < DURAK.length - 2 && v > DURAK[i + 1][0]) i++;
  const [a, ca] = DURAK[i], [b, cb] = DURAK[i + 1], k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return ca.map((x, j) => Math.round(x + (cb[j] - x) * k));
}
const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };

export async function iklimYukle() { return (await fetch('data/iklim.json')).json(); }

export function enIyiEnKotu(veri) {
  const oranlar = veri.aylik.map((a) => a.u / a.g);
  const en = oranlar.indexOf(Math.max(...oranlar)), az = oranlar.indexOf(Math.min(...oranlar));
  return { en, az, enV: Math.round(oranlar[en] * 100), azV: Math.round(oranlar[az] * 100), oranlar };
}

export function isiCiz(kap, veri) {
  const { oranlar } = enIyiEnKotu(veri);
  const tablo = document.createElement('table'); tablo.className = 'isi';
  tablo.setAttribute('aria-label', t('iklim.tablo'));
  const bas = tablo.createTHead().insertRow();
  bas.insertAdjacentHTML('beforeend', `<th scope="col" class="isi-ay">${t('iklim.ay')}</th>`);
  for (const s of SAATLER) bas.insertAdjacentHTML('beforeend', `<th scope="col">${String(s).padStart(2, '0')}</th>`);
  bas.insertAdjacentHTML('beforeend', `<th scope="col" class="isi-tum">${t('iklim.tum')}</th>`);
  const gov = tablo.createTBody();
  for (let ay = 0; ay < 12; ay++) {
    const tr = gov.insertRow();
    tr.insertAdjacentHTML('beforeend', `<th scope="row" class="isi-ay"><span class="uzun">${t('ay.' + ay)}</span><span class="kisa">${t('ay.k.' + ay)}</span></th>`);
    for (const s of SAATLER) {
      const h = veri.aySaat[ay][s], td = tr.insertCell();
      if (h.g < 20) { td.className = 'bos'; td.title = t('iklim.yetersiz'); td.setAttribute('aria-label', `${t('ay.' + ay)} ${String(s).padStart(2, '0')}: ${t('iklim.yetersiz')}`); continue; }
      const v = h.u / h.g, rgb = renkOranla(v), yazi = lum(rgb) > 0.3 ? '#07102a' : '#f2f5ff';
      const oran = Math.round(v * 100), metin = t('iklim.hucre', { ay: t('ay.' + ay), saat: `${String(s).padStart(2, '0')}:00`, oran, u: h.u, g: h.g });
      td.style.background = `rgb(${rgb})`; td.style.color = yazi; td.textContent = oran; td.title = metin; td.setAttribute('aria-label', metin);
    }
    const tum = tr.insertCell(); tum.className = 'isi-tum'; tum.textContent = `%${Math.round(oranlar[ay] * 100)}`;
  }
  kap.replaceChildren(tablo);
}

export function olcekCiz(kap) {
  kap.replaceChildren();
  const cubuk = document.createElement('span'); cubuk.className = 'olcek-cubuk';
  cubuk.style.background = `linear-gradient(90deg, rgb(${renkOranla(0)}), rgb(${renkOranla(0.5)}), rgb(${renkOranla(1)}))`;
  kap.append(Object.assign(document.createElement('span'), { textContent: '%0' }), cubuk, Object.assign(document.createElement('span'), { textContent: '%100' }));
}

// Model ile ölçümün aylık gece "açık" payı
export function karsilastirmaCiz(kap, veri) {
  const W = 560, H = 220, sol = 34, alt = 28, ust = 12, sag = 10;
  const olcum = veri.olcum.y2019.map((v, i) => (v + veri.olcum.y2020[i]) / 2), model = veri.model2019_2020AyBazinda;
  const x = (i) => sol + (i / 11) * (W - sol - sag), y = (v) => ust + (1 - v / 100) * (H - ust - alt);
  const yol = (d) => d.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('olcum.baslik')}">`;
  for (const g of [0, 25, 50, 75, 100]) s += `<line x1="${sol}" x2="${W - sag}" y1="${y(g)}" y2="${y(g)}" class="eks"/><text x="${sol - 6}" y="${y(g) + 4}" class="eks-m" text-anchor="end">${g}</text>`;
  for (let i = 0; i < 12; i++) s += `<text x="${x(i)}" y="${H - 8}" class="eks-m" text-anchor="middle">${t('ay.k.' + i)}</text>`;
  s += `<path d="${yol(olcum)}" class="cizgi-olcum"/><path d="${yol(model)}" class="cizgi-model"/>`;
  olcum.forEach((v, i) => { s += `<circle cx="${x(i)}" cy="${y(v)}" r="3.2" class="nokta-olcum"/>`; });
  model.forEach((v, i) => { s += `<circle cx="${x(i)}" cy="${y(v)}" r="2.6" class="nokta-model"/>`; });
  kap.innerHTML = s + '</svg>';
}
