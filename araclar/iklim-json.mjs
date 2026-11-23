// data/arsiv/*.json → site için küçük özet: data/iklim.json (ay×yerel-saat uygunluk, ölçümle kıyas, eşikler)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { DAG } from '../src/gozlemevi.js';
import { iklimOzeti, ESIKLER } from '../src/iklim.js';
import { gunesYuksekligiYer } from '../src/gunes.js';
const dir = new URL('../data/arsiv/', import.meta.url);
const dosyalar = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const o = iklimOzeti(dosyalar, DAG);
const yillar = dosyalar.map((d) => d.hourly.time[0].slice(0, 4));
// yalnız bulut ≤%30 (ölçümle kıyas için) aylık gece oranı
const bulutAylik = Array(12).fill(0).map(() => ({ g: 0, a: 0 }));
for (const d of dosyalar) d.hourly.time.forEach((t, i) => { const dt = new Date(t + ':00Z');
  if (gunesYuksekligiYer(dt, DAG.enlemDerece, DAG.boylamDerece) >= -12 || d.hourly.cloud_cover[i] == null) return;
  const m = new Date(dt.getTime() + 3 * 3600e3).getUTCMonth(); bulutAylik[m].g++; if (d.hourly.cloud_cover[i] <= 30) bulutAylik[m].a++; });
const ikiYil = Array(12).fill(0).map(() => ({ g: 0, a: 0 }));
for (const d of dosyalar.filter((x) => ['2019', '2020'].includes(x.hourly.time[0].slice(0, 4)))) d.hourly.time.forEach((t, i) => { const dt = new Date(t + ':00Z');
  if (gunesYuksekligiYer(dt, DAG.enlemDerece, DAG.boylamDerece) >= -6 || d.hourly.cloud_cover[i] == null) return;
  const m = new Date(dt.getTime() + 3 * 3600e3).getUTCMonth(); ikiYil[m].g++; if (d.hourly.cloud_cover[i] <= 30) ikiYil[m].a++; });
const cikti = {
  uretim: new Date().toISOString().slice(0, 10), yillar: [yillar[0], yillar[yillar.length - 1]], kaynak: 'Open-Meteo Historical Weather API (model verisi, ~7 km ızgara)',
  esikler: ESIKLER, yerelSaatFarki: 3,
  aySaat: o.aySaat.map((satir) => satir.map((h) => ({ g: h.gece, u: h.uygun }))),
  aylik: o.aylik.map((a) => ({ g: a.geceSaat, u: a.uygunSaat })),
  bulutAylik: bulutAylik.map((x) => +(100 * x.a / x.g).toFixed(1)),
  model2019_2020AyBazinda: ikiYil.map((x) => +(100 * x.a / x.g).toFixed(1)),
  olcum: { kaynak: 'Atalay, Nasıroğlu & Yeşilyaprak 2024, JARNAS 10(1):9–20, Tablo 2 (BWCS II, gece açık %)',
    y2019: [31.9,18.7,26.6,52.8,77.5,72.7,86.2,90.8,84.3,74.8,65.2,56.7], y2020: [50.7,37.2,41.9,45.6,63.4,86.3,88.8,87.9,93.6,94.1,69,59.4], r: [0.86, 0.88] },
};
writeFileSync(new URL('../data/iklim.json', import.meta.url), JSON.stringify(cikti));
console.log('yazıldı', JSON.stringify(cikti).length, 'bayt');
