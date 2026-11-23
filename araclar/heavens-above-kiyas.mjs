// Uydu geçişi doğrulaması: Heavens-Above'un DAG için verdiği görünür geçişleri (dogrulama/heavens-above-*.json)
// bizim SGP4 çekirdeğimizle 1 saniye adımla hesaplanan anlarla karşılaştırır.
// Çalıştır: node araclar/heavens-above-kiyas.mjs [dogrulama/heavens-above-2026-11-23.json] [--json]
import { readFileSync } from 'node:fs';
import * as sat from 'satellite.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur, anlikGorunum, gecisleriBul } from '../src/gecis.js';
import { tleAyikla } from '../src/tle.js';

const kok = new URL('../', import.meta.url);
const dosya = process.argv.find((a) => a.endsWith('.json')) ?? 'dogrulama/heavens-above-2026-11-23.json';
const ha = JSON.parse(readFileSync(new URL(dosya, kok), 'utf8'));
// Varsayılan: karşılaştırmanın yapıldığı gün alınan TLE (tekrarlanabilirlik için sabitlendi). --guncel-tle: data/ altındaki günlük dosya.
const tleDosya = process.argv.includes("--guncel-tle") ? "data/tle-gorunur.txt" : "dogrulama/tle-2026-11-23.txt";
const tle = tleAyikla(readFileSync(new URL(tleDosya, kok), "utf8")).kayitlar;
const gozlemci = gozlemciKur(DAG);

const PUSULA = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const pusula = (az) => PUSULA[Math.round(az / 22.5) % 16];
const pusulaFark = (a, b) => { const d = Math.abs(PUSULA.indexOf(a) - PUSULA.indexOf(b)) % 16; return Math.min(d, 16 - d); };
const zaman = (tarih, saat) => new Date(`${tarih}T${saat}Z`);

// HA geçişinin çevresini 1 sn adımla örnekle; yükseklik ve gölge geçişlerini doğrusal ara değerle bul.
function bizimOlaylar(satrec, bas, bit) {
  const o = [];
  for (let t = bas.getTime(); t <= bit.getTime(); t += 1000) {
    const g = anlikGorunum(satrec, new Date(t), gozlemci, { gunesBilgisi: true });
    if (g) o.push({ t, ...g });
  }
  const gecis = (i, esik) => { const a = o[i - 1].yukseklik - esik, b = o[i].yukseklik - esik; return o[i - 1].t + (a / (a - b)) * 1000; };
  const ev = { yukari10: null, asagi10: null, golgedenCikis: null, golgeyeGiris: null, zirve: null };
  for (let i = 1; i < o.length; i++) {
    if (o[i - 1].yukseklik < 10 && o[i].yukseklik >= 10 && !ev.yukari10) ev.yukari10 = gecis(i, 10);
    if (o[i - 1].yukseklik >= 10 && o[i].yukseklik < 10) ev.asagi10 = gecis(i, 10);
    if (o[i].yukseklik > 0 && !o[i - 1].uyduGunesAliyor && o[i].uyduGunesAliyor) ev.golgedenCikis = o[i].t - 500;
    if (o[i].yukseklik > 0 && o[i - 1].uyduGunesAliyor && !o[i].uyduGunesAliyor) ev.golgeyeGiris = o[i].t - 500;
  }
  ev.zirve = o.reduce((m, x) => (x.yukseklik > m.yukseklik ? x : m));
  ev.ornek = (t) => o.reduce((m, x) => (Math.abs(x.t - t) < Math.abs(m.t - t) ? x : m));
  return ev;
}

const satirlar = [];
for (const [no, u] of Object.entries(ha.uydular)) {
  const k = tle.find((x) => x.s1.slice(2, 7).trim() === no);
  if (!k) { console.error(`${u.ad} (${no}) TLE dosyasında yok`); continue; }
  const satrec = sat.twoline2satrec(k.s1, k.s2);
  const donem = new Date(Date.UTC(2000 + Number(k.s1.slice(18, 20)), 0, 1) + (Number(k.s1.slice(20, 32)) - 1) * 86400e3);
  for (const [tarih, B, Z, S] of u.gecisler) {
    const tB = zaman(tarih, B[0]), tZ = zaman(tarih, Z[0]), tS = zaman(tarih, S[0]);
    const ev = bizimOlaylar(satrec, new Date(tB - 15 * 60e3), new Date(tS.getTime() + 15 * 60e3));
    const ekle = (tur, haT, bizT, haAlt, haAz) => {
      if (bizT == null) { satirlar.push({ uydu: u.ad, tarih, tur, ha: haT.toISOString().slice(11, 19), biz: null }); return; }
      const g = ev.ornek(bizT);
      satirlar.push({ uydu: u.ad, tarih, tur, ha: haT.toISOString().slice(11, 19), biz: new Date(Math.round(bizT / 1000) * 1000).toISOString().slice(11, 19),
        dtSn: Math.round((bizT - haT) / 100) / 10, haAlt, bizAlt: Math.round(g.yukseklik * 10) / 10, haAz, bizAz: pusula(g.azimut), azFark: pusulaFark(haAz, pusula(g.azimut)),
        tleYasGun: Math.round(((haT - donem) / 86400e3) * 10) / 10 });
    };
    // Başlangıç: 10°'de ise yükselme, daha yüksekte ise gölgeden çıkış (ya da HA'nın gökyüzü karanlık eşiği).
    if (B[1] === 10) ekle('yukselis10', tB, ev.yukari10, B[1], B[2]); else ekle('golgedenCikis', tB, ev.golgedenCikis, B[1], B[2]);
    if (Z[0] !== B[0] && Z[0] !== S[0]) ekle('zirve', tZ, ev.zirve.t, Z[1], Z[2]);
    if (S[1] === 10) ekle('alcalis10', tS, ev.asagi10, S[1], S[2]); else ekle('golgeyeGiris', tS, ev.golgeyeGiris, S[1], S[2]);
  }
}

// Sitenin kendi ayarlarıyla (45 sn adım) zirve anı hatası: aynı geçişleri sitenin yaptığı gibi bul.
const site = [];
for (const [no, u] of Object.entries(ha.uydular)) {
  const k = tle.find((x) => x.s1.slice(2, 7).trim() === no); if (!k) continue;
  const satrec = sat.twoline2satrec(k.s1, k.s2);
  for (const [tarih, , Z] of u.gecisler) {
    const tZ = zaman(tarih, Z[0]);
    const g = gecisleriBul(satrec, new Date(tZ - 20 * 60e3), new Date(tZ.getTime() + 20 * 60e3), gozlemci, { adimSn: 45, minYukseklik: 0 })
      .find((p) => p.dogus <= tZ && p.batis >= tZ);
    if (g) site.push({ uydu: u.ad, tarih, dtZirveSn: Math.round((g.zirveZaman - ev1(satrec, tZ)) / 100) / 10, dtDogusSn: null });
  }
}
function ev1(satrec, tZ) { // 1 sn adımla gerçek zirve
  let en = null;
  for (let t = tZ - 15 * 60e3; t <= tZ.getTime() + 15 * 60e3; t += 1000) { const g = anlikGorunum(satrec, new Date(t), gozlemci); if (g && (!en || g.yukseklik > en.y)) en = { t, y: g.yukseklik }; }
  return en.t;
}

const ozet = {};
for (const s of satirlar) {
  const o = (ozet[s.tur] ??= { n: 0, bulunamadi: 0, mutlakToplam: 0, enBuyuk: 0, toplam: 0, altFarkEnBuyuk: 0, azUyusmayan: 0 });
  if (s.biz == null) { o.bulunamadi++; continue; }
  o.n++; o.toplam += s.dtSn; o.mutlakToplam += Math.abs(s.dtSn); o.enBuyuk = Math.max(o.enBuyuk, Math.abs(s.dtSn));
  o.altFarkEnBuyuk = Math.max(o.altFarkEnBuyuk, Math.abs(s.bizAlt - s.haAlt)); if (s.azFark > 1) o.azUyusmayan++;
}
for (const o of Object.values(ozet)) { o.ortalamaSn = o.n ? Math.round((o.toplam / o.n) * 10) / 10 : null; o.ortalamaMutlakSn = o.n ? Math.round((o.mutlakToplam / o.n) * 10) / 10 : null; o.altFarkEnBuyuk = Math.round(o.altFarkEnBuyuk * 10) / 10; delete o.toplam; delete o.mutlakToplam; }
const siteOzet = { n: site.length, enBuyukZirveHatasiSn: Math.max(...site.map((s) => Math.abs(s.dtZirveSn))) };

if (process.argv.includes('--json')) console.log(JSON.stringify({ ozet, siteOzet, satirlar }, null, 1));
else {
  console.table(satirlar.map(({ uydu, tarih, tur, ha: h, biz, dtSn, haAlt, bizAlt, haAz, bizAz }) => ({ uydu, tarih, tur, ha: h, biz, dtSn, haAlt, bizAlt, haAz, bizAz })));
  console.log('Özet (dtSn = bizim − Heavens-Above, saniye):'); console.table(ozet);
  console.log('Sitenin 45 sn adımıyla zirve anı hatası:', siteOzet);
}
// --yaz: yöntem sayfasındaki tablo için özet dosyası (araclar/sayfalari-uret.mjs okur)
if (process.argv.includes('--yaz')) {
  const { writeFileSync } = await import('node:fs');
  const uydular = Object.values(ha.uydular).map((u) => ({ ad: u.ad, gecis: u.gecisler.length }));
  writeFileSync(new URL('dogrulama/heavens-above-sonuc.json', kok), JSON.stringify({ kaynak: dosya, tle: tleDosya, alindi: ha.alindi, uydular, ozet, siteOzet }, null, 1) + '\n');
  console.log('dogrulama/heavens-above-sonuc.json yazıldı');
}
