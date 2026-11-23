// CelesTrak "visual" grubunu (parlak nesneler) indirip data/tle-gorunur.txt ve .tarih dosyalarına yazar.
// GitHub Actions bunu günde bir kez çalıştırır; elle de çalışır: node araclar/tle-guncelle.mjs
import { writeFile } from 'node:fs/promises';
import { tleAyikla, tleYaz } from '../src/tle.js';

const URL_ = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle';
const EN_AZ = 50; // "visual" grubunda ~150 nesne var; bundan çok azı gelirse bozuk yanıt say

const r = await fetch(URL_, { headers: { 'User-Agent': 'dag-gokyuzu (github.com/SametDuhan/dag-gokyuzu)' }, signal: AbortSignal.timeout(30000) });
const metin = await r.text();
if (!r.ok) { console.error(`CelesTrak HTTP ${r.status}: ${metin.slice(0, 200)}`); process.exit(1); }

const { kayitlar, atlanan } = tleAyikla(metin);
if (kayitlar.length < EN_AZ) { console.error(`Yalnız ${kayitlar.length} geçerli kayıt (atlanan ${atlanan}); dosyalar değiştirilmedi.`); process.exit(1); }

const kok = new URL('../data/', import.meta.url);
await writeFile(new URL('tle-gorunur.txt', kok), tleYaz(kayitlar));
await writeFile(new URL('tle-gorunur.tarih', kok), new Date().toISOString().replace(/\.\d+Z$/, 'Z') + '\n');
console.log(`${kayitlar.length} nesne yazıldı (atlanan ${atlanan}).`);
