// İklim sayfası: model verisinin resmî yerleşke değerleriyle karşılaştırması ve DAG–TUG Bakırlıtepe karşılaştırması.
// Veri: data/yerleskeler.json (araclar/yerleske-ozet.mjs üretir).
import { t, getDil } from './i18n.js';

export const yerleskeYukle = async () => (await fetch('data/yerleskeler.json')).json();

const sayi = (v, k = 1) => new Intl.NumberFormat(getDil() === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: k, minimumFractionDigits: 0 }).format(v);
const isaret = (v, k = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + sayi(Math.abs(v), k);

// Tablo 1: DAG resmî sensör ölçümü ve aynı dönemin model değerleri.
export function resmiKiyasCiz(kap, v) {
  const r = v.resmi.dag, m = v.model.dag, i = m.istatistik;
  const satir = (ad, resmi, model, fark) => `<tr><th scope="row">${ad}</th><td>${resmi}</td><td>${model}</td><td>${fark}</td></tr>`;
  const ac = m.acikGeceYil;
  kap.innerHTML = `<table class="veri-tablo"><caption>${t('ik2.tablo')}</caption>
    <thead><tr><th scope="col">${t('ik2.param')}</th><th scope="col">${t('ik2.resmi')}</th><th scope="col">${t('ik2.model')}</th><th scope="col">${t('ik2.fark')}</th></tr></thead><tbody>
    ${satir(t('ik2.sicOrt'), sayi(r.sicaklik.ort), sayi(i.sicaklik.ort), isaret(i.sicaklik.ort - r.sicaklik.ort))}
    ${satir(t('ik2.sicMin'), sayi(r.sicaklik.min), sayi(i.sicaklik.min), isaret(i.sicaklik.min - r.sicaklik.min))}
    ${satir(t('ik2.nemOrt'), sayi(r.nem.ort), sayi(i.nem.ort), isaret(i.nem.ort - r.nem.ort))}
    ${satir(t('ik2.ruzgarOrt'), sayi(r.ruzgarMs.ort), sayi(i.ruzgarMs.ort), isaret(i.ruzgarMs.ort - r.ruzgarMs.ort))}
    ${satir(t('ik2.ruzgarMax'), sayi(r.ruzgarMs.max), sayi(i.ruzgarMs.max), isaret(i.ruzgarMs.max - r.ruzgarMs.max))}
    ${satir(t('ik2.acik'), `${r.acikGece} (${r.acikGeceAralik[0]}–${r.acikGeceAralik[1]})`, `${ac.bulut30} · ${ac.bulut50} · ${ac.bulut70}`, '')}
    </tbody></table>`;
  const kat = r.ruzgarMs.ort / i.ruzgarMs.ort;
  return t('ik2.not', { dT: sayi(Math.abs(i.sicaklik.ort - r.sicaklik.ort)), dN: sayi(Math.abs(i.nem.ort - r.nem.ort), 0), kat: sayi(kat), r: r.olcum });
}

// Grafik: iki yerleşkenin aylık uygun gece oranı.
export function yerleskeGrafikCiz(kap, v) {
  const W = 560, H = 240, sol = 34, alt = 28, ust = 12, sag = 10;
  const x = (i) => sol + (i / 11) * (W - sol - sag), y = (p) => ust + (1 - p / 100) * (H - ust - alt);
  const yol = (d) => d.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  const dag = v.model.dag.aylikUygun, tug = v.model.tug.aylikUygun;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('ik3.baslik')}">`;
  for (const g of [0, 25, 50, 75, 100]) s += `<line x1="${sol}" x2="${W - sag}" y1="${y(g)}" y2="${y(g)}" class="eks"/><text x="${sol - 6}" y="${y(g) + 4}" class="eks-m" text-anchor="end">${g}</text>`;
  for (let k = 0; k < 12; k++) s += `<text x="${x(k)}" y="${H - 8}" class="eks-m" text-anchor="middle">${t('ay.k.' + k)}</text>`;
  s += `<path d="${yol(tug)}" class="cizgi-tug"/><path d="${yol(dag)}" class="cizgi-dag"/>`;
  tug.forEach((p, k) => { s += `<circle cx="${x(k)}" cy="${y(p)}" r="3" class="nokta-tug"><title>${t('ay.' + k)} · ${t('ik3.tug')}: ${t('yuzde', { v: sayi(p, 0) })}</title></circle>`; });
  dag.forEach((p, k) => { s += `<circle cx="${x(k)}" cy="${y(p)}" r="3" class="nokta-dag"><title>${t('ay.' + k)} · ${t('ik3.dag')}: ${t('yuzde', { v: sayi(p, 0) })}</title></circle>`; });
  kap.innerHTML = s + '</svg>';
}

// Tablo 2: iki yerleşkenin resmî yayımlı değerleri yan yana (+ model açık gece sayısı).
export function yerleskeTabloCiz(kap, v) {
  const d = v.resmi.dag, g = v.resmi.tug, md = v.model.dag.acikGeceYil, mg = v.model.tug.acikGeceYil;
  const satir = (ad, a, b) => `<tr><th scope="row">${ad}</th><td>${a}</td><td>${b}</td></tr>`;
  kap.innerHTML = `<table class="veri-tablo"><caption>${t('ik3.tablo')}</caption>
    <thead><tr><th scope="col"></th><th scope="col">${t('ik3.dag')}</th><th scope="col">${t('ik3.tug')}</th></tr></thead><tbody>
    ${satir(t('ik3.rakim'), `${d.rakim} m`, `${g.rakim} m`)}
    ${satir(t('ik3.acik'), d.acikGece, g.acikGece)}
    ${satir(t('ik3.acikModel'), md.bulut50, mg.bulut50)}
    ${satir(t('ik3.seeing'), sayi(d.seeing, 2), sayi(g.seeing, 2))}
    ${satir(t('ik3.gok'), d.gokParlaklik, g.gokParlaklik)}
    ${satir(t('ik3.sic'), sayi(d.sicaklik.ort), sayi(g.sicaklik.ort))}
    ${satir(t('ik3.kar'), d.karSuresiAy, g.karSuresiAy)}
    </tbody></table>`;
}
