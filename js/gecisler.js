import * as sat from 'satellite.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur, gecisleriBul } from '../src/gecis.js';

export const gozlemci = gozlemciKur(DAG);

function ayristir(metin) {
  const satirlar = metin.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), cikti = [];
  for (let i = 0; i + 2 < satirlar.length; i += 3) {
    try { cikti.push({ ad: satirlar[i].replace(/^0 /, ''), satrec: sat.twoline2satrec(satirlar[i + 1], satirlar[i + 2]) }); } catch { /* bozuk kayıt atlanır */ }
  }
  return cikti;
}

// Önce canlı CelesTrak, olmazsa depodaki örnek anlık görüntü.
export async function tleYukle() {
  try {
    const ctrl = new AbortController(); const z = setTimeout(() => ctrl.abort(), 9000);
    const r = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle', { signal: ctrl.signal }); clearTimeout(z);
    if (!r.ok) throw new Error(r.status);
    const sats = ayristir(await r.text());
    if (sats.length > 20) return { sats, canli: true };
  } catch { /* örnek veriye düş */ }
  const [metin, tarih] = await Promise.all([fetch('data/tle-gorunur.txt').then((r) => r.text()), fetch('data/tle-gorunur.tarih').then((r) => r.text())]);
  return { sats: ayristir(metin), canli: false, tarih: tarih.trim().slice(0, 10) };
}

const bekle = () => new Promise((r) => setTimeout(r, 0));
// Görünür geçişler: uydu Güneş ışığı alırken ve Güneş ≤ −6°'tayken ufkun ≥20° üstüne çıkar. Ana iş parçacığını bloke etmemek için parça parça çalışır.
export async function gecisleriHesapla(sats, bas, bit, ilerleme = () => {}) {
  const sonuc = [];
  for (let i = 0; i < sats.length; i++) {
    for (const p of gecisleriBul(sats[i].satrec, bas, bit, gozlemci, { adimSn: 45, minYukseklik: 15 })) if (p.gozleKolay && p.gorunurZirve >= 20) sonuc.push({ ad: sats[i].ad, ...p });
    if (i % 8 === 7) { ilerleme(i / sats.length); await bekle(); }
  }
  return sonuc.sort((a, b) => a.dogus - b.dogus);
}
