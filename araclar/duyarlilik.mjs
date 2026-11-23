// Eşik duyarlılığı + yayımlanmış DAG ölçümüyle (Atalay vd. 2024: 2019–2020, %58.2 açık) kaba karşılaştırma.
import { readFileSync, readdirSync } from 'node:fs';
import { DAG } from '../src/gozlemevi.js';
import { iklimOzeti, ESIKLER } from '../src/iklim.js';
const dir = new URL('../data/arsiv/', import.meta.url);
const hepsi = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => [f, JSON.parse(readFileSync(new URL(f, dir)))]);
const dosyalar = hepsi.map((x) => x[1]);
const oran = (esik, d = dosyalar) => { const o = iklimOzeti(d, DAG, { ...ESIKLER, ...esik });
  const T = o.aylik.reduce((s, a) => s + a.geceSaat, 0), U = o.aylik.reduce((s, a) => s + a.uygunSaat, 0); return (100 * U / T).toFixed(1); };
console.log('Duyarlılık (2015–2026, gece saatleri, uygun %):');
console.log(' bulutMax 10/20/30/50 :', [10, 20, 30, 50].map((b) => oran({ bulutMax: b })).join(' / '));
console.log(' ruzgarMax 25/36/50/999:', [25, 36, 50, 999].map((r) => oran({ ruzgarMax: r, ruzgarEsMax: 999 })).join(' / '));
console.log(' nemMax 70/85/95/101   :', [70, 85, 95, 101].map((n) => oran({ nemMax: n })).join(' / '));
console.log(' yalnız bulut ≤30 (rüzgâr/nem/yağış serbest):', oran({ ruzgarMax: 999, ruzgarEsMax: 999, nemMax: 101, yagisMax: 999 }));

// Yayımlanmış ölçümle kaba kıyas: yalnız bulut, 2019+2020, tüm saatler ve gece saatleri.
const iki = hepsi.filter(([f]) => f.startsWith('2019') || f.startsWith('2020')).map((x) => x[1]);
let all = 0, n = 0; const esiklerCloud = [20, 30, 50];
const say = Object.fromEntries(esiklerCloud.map((e) => [e, 0]));
for (const d of iki) for (const c of d.hourly.cloud_cover) { if (c == null) continue; n++; for (const e of esiklerCloud) if (c <= e) say[e]++; }
console.log('2019–2020 tüm saatler, model bulut kapalılığı ≤ eşik oranı:', esiklerCloud.map((e) => `≤${e}: %${(100 * say[e] / n).toFixed(1)}`).join('  '), ' | yayımlanan BWCS II: %58.2 açık');
const ort = (d) => { const a = d.hourly.cloud_cover.filter((x) => x != null); return a.reduce((s, x) => s + x, 0) / a.length; };
console.log('Ortalama bulut % model:', iki.map((d) => ort(d).toFixed(1)).join(', '));
