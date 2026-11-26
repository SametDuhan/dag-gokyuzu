// İki yerleşkenin (DAG, TUG Bakırlıtepe) arşiv verisinden küçük özet: data/yerleskeler.json
// - model: aylık uygun gece oranı, aylık "bulut ≤ %30" gece oranı, "açık gece" sayıları, sıcaklık/nem/rüzgâr istatistiği
// - resmi: Türkiye Ulusal Gözlemevleri yerleşke sayfalarındaki yayımlı değerler (elle girildi; kaynak ve okuma tarihi yazılı)
// Çalıştır: node araclar/arsiv-cek.mjs 2015 2026 dag && node araclar/arsiv-cek.mjs 2015 2026 tug && node araclar/yerleske-ozet.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { DAG, TUG } from '../src/gozlemevi.js';
import { iklimOzeti, ESIKLER } from '../src/iklim.js';
import { gunesYuksekligiYer } from '../src/gunes.js';

const kok = new URL('../', import.meta.url);
const oku = (klasor) => readdirSync(new URL(klasor, kok)).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(new URL(klasor + f, kok))));

const stat = (a) => { const s = [...a].sort((x, y) => x - y); return { ort: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1), min: s[0], max: s[s.length - 1] }; };

function ozetle(yer, dosyalar, { dönemBas, dönemBit } = {}) {
  const o = iklimOzeti(dosyalar, yer);
  const bulutAylik = Array.from({ length: 12 }, () => ({ g: 0, a: 0 }));
  const geceler = {}; // yerel gece (öğleden öğleye) → bulut serisi
  const T = [], R = [], W = [];
  for (const d of dosyalar) {
    const h = d.hourly;
    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i] + ':00Z'), ms = t.getTime();
      if (dönemBas && ms >= dönemBas && ms <= dönemBit && h.temperature_2m[i] != null) { T.push(h.temperature_2m[i]); R.push(h.relative_humidity_2m[i]); W.push(h.wind_speed_10m[i] / 3.6); }
      if (h.cloud_cover[i] == null || gunesYuksekligiYer(t, yer.enlemDerece, yer.boylamDerece) >= ESIKLER.karanlikGunes) continue;
      const m = new Date(ms + 3 * 3600e3).getUTCMonth(); bulutAylik[m].g++; if (h.cloud_cover[i] <= 30) bulutAylik[m].a++;
      (geceler[new Date(ms - 9 * 3600e3).toISOString().slice(0, 10)] ??= []).push(h.cloud_cover[i]);
    }
  }
  // "Açık gece" sayısı: o gecenin ortalama bulutu ≤ eşik olan gece sayısı, tam yıllar (2015–2025) için yıllık ortalama.
  const yil = {};
  for (const [k, v] of Object.entries(geceler)) {
    if (k >= '2026' || v.length < 6) continue;
    const y = (yil[k.slice(0, 4)] ??= { n: 0, a30: 0, a50: 0, a70: 0 }), m = v.reduce((a, b) => a + b, 0) / v.length;
    y.n++; if (m <= 30) y.a30++; if (m <= 50) y.a50++; if (m <= 70) y.a70++;
  }
  const yillar = Object.values(yil), ort = (f) => Math.round(yillar.reduce((a, y) => a + (f(y) / y.n) * 365, 0) / yillar.length);
  return {
    aylikUygun: o.aylik.map((a) => +(100 * a.oran).toFixed(1)),
    aylikBulut30: bulutAylik.map((x) => +(100 * x.a / x.g).toFixed(1)),
    acikGeceYil: { bulut30: ort((y) => y.a30), bulut50: ort((y) => y.a50), bulut70: ort((y) => y.a70) },
    ...(T.length ? { istatistik: { sicaklik: stat(T), nem: stat(R), ruzgarMs: stat(W), saat: T.length } } : {}),
  };
}

const dag = ozetle(DAG, oku('data/arsiv/'), { dönemBas: Date.UTC(2022, 8, 1), dönemBit: Date.UTC(2025, 5, 9, 23) });
const tug = ozetle(TUG, oku('data/arsiv-tug/'));

const cikti = {
  uretim: new Date().toISOString().slice(0, 10),
  kaynakModel: 'Open-Meteo Historical Weather API, 2015–2026, model verisi (~7 km ızgara)',
  esikler: ESIKLER,
  resmi: {
    kaynak: 'Türkiye Ulusal Gözlemevleri yerleşke sayfaları: trgozlemevleri.gov.tr/en/campuses/erzurum-dag ve /antalya-tug', okunma: '2026-11-26',
    dag: { koordinat: '39°46′43″K 41°13′37″D', rakim: 3170, acikGece: 240, acikGeceAralik: [200, 300], seeing: 0.93, gokParlaklik: '21.4–21.8', karSuresiAy: 7,
      sicaklik: { ort: 3, min: -26, max: 25 }, nem: { ort: 63, min: 1, max: 100 }, ruzgarMs: { ort: 6, min: 1, max: 25 },
      olcum: 'Vaisala sensörü, 2022 – 9 Haz 2025; ±2σ dışı ve boş veriler elenmiş' },
    tug: { koordinat: '36°49′27″K 30°20′08″D', rakim: 2550, acikGece: 200, acikGeceAralik: [200, 300], seeing: 0.86, gokParlaklik: '21.5', karSuresiAy: 5,
      sicaklik: { ort: 5, min: -28, max: 22 }, nem: { ort: 50, min: 2, max: 99 }, ruzgarKmh: { ort: 17 } },
  },
  model: { dag, tug },
};
writeFileSync(new URL('data/yerleskeler.json', kok), JSON.stringify(cikti));
console.log(JSON.stringify(cikti.model, null, 1));
