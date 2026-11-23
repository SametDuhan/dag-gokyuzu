// Model (Open-Meteo, gece saatleri, bulut ≤ eşik) ile DAG'daki BWCS II ölçümünün (Atalay vd. 2024, Tablo 2, gece "açık %") aylık karşılaştırması.
import { readFileSync } from 'node:fs';
import { DAG } from '../src/gozlemevi.js';
import { gunesYuksekligiYer } from '../src/gunes.js';
const OLCUM = { 2019: [31.9,18.7,26.6,52.8,77.5,72.7,86.2,90.8,84.3,74.8,65.2,56.7], 2020: [50.7,37.2,41.9,45.6,63.4,86.3,88.8,87.9,93.6,94.1,69,59.4] };
const pearson = (a, b) => { const n = a.length, ma = a.reduce((s, x) => s + x) / n, mb = b.reduce((s, x) => s + x) / n;
  let c = 0, va = 0, vb = 0; a.forEach((x, i) => { c += (x - ma) * (b[i] - mb); va += (x - ma) ** 2; vb += (b[i] - mb) ** 2; }); return c / Math.sqrt(va * vb); };
for (const esik of [20, 30, 50]) {
  const model = [], olc = [];
  for (const yil of [2019, 2020]) {
    const h = JSON.parse(readFileSync(new URL(`../data/arsiv/${yil}.json`, import.meta.url))).hourly;
    const g = Array(12).fill(0), a = Array(12).fill(0);
    h.time.forEach((t, i) => { const d = new Date(t + ':00Z'); if (gunesYuksekligiYer(d, DAG.enlemDerece, DAG.boylamDerece) >= -6 || h.cloud_cover[i] == null) return;
      const m = d.getUTCMonth(); g[m]++; if (h.cloud_cover[i] <= esik) a[m]++; });
    g.forEach((n, m) => { model.push(100 * a[m] / n); olc.push(OLCUM[yil][m]); });
  }
  const fark = model.map((x, i) => x - olc[i]), ort = (x) => x.reduce((s, v) => s + v) / x.length;
  console.log(`bulut ≤%${esik}: r=${pearson(model, olc).toFixed(2)}  ort.fark(model−ölçüm)=${ort(fark).toFixed(1)} puan  ort.model=${ort(model).toFixed(1)} ort.ölçüm=${ort(olc).toFixed(1)}`);
  if (esik === 50) model.forEach((x, i) => console.log(`  ${2019 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')} model ${x.toFixed(0).padStart(3)}  ölçüm ${olc[i].toFixed(0).padStart(3)}`));
}
