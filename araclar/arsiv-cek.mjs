// Open-Meteo arşivinden DAG için saatlik veriyi yıl yıl çeker → data/arsiv/<yıl>.json
// Kullanım: node araclar/arsiv-cek.mjs [ilkYıl] [sonYıl]
import { writeFile, mkdir } from 'node:fs/promises';
import { DAG } from '../src/gozlemevi.js';

const ilk = Number(process.argv[2] ?? 2015), son = Number(process.argv[3] ?? new Date().getUTCFullYear());
const degiskenler = ['cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'relative_humidity_2m',
  'temperature_2m', 'dew_point_2m', 'wind_speed_10m', 'wind_gusts_10m', 'precipitation'];
await mkdir(new URL('../data/arsiv/', import.meta.url), { recursive: true });
const dun = new Date(Date.now() - 6 * 86400e3).toISOString().slice(0, 10); // arşiv birkaç gün geriden gelir

for (let y = ilk; y <= son; y++) {
  const bitis = y === new Date().getUTCFullYear() ? dun : `${y}-12-31`;
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${DAG.enlemDerece}&longitude=${DAG.boylamDerece}` +
    `&start_date=${y}-01-01&end_date=${bitis}&hourly=${degiskenler.join(',')}&timezone=UTC`;
  let veri;
  for (let deneme = 1; deneme <= 4; deneme++) {
    const r = await fetch(url);
    if (r.ok) { veri = await r.json(); break; }
    console.error(y, 'HTTP', r.status, 'deneme', deneme);
    await new Promise((s) => setTimeout(s, 4000 * deneme));
  }
  if (!veri) { console.error(y, 'ALINAMADI'); process.exitCode = 1; continue; }
  await writeFile(new URL(`../data/arsiv/${y}.json`, import.meta.url), JSON.stringify(veri));
  console.log(y, veri.hourly.time.length, 'saat');
}
