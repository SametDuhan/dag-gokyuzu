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

const TAZE_SAAT = 36; // depodaki dosya GitHub Actions ile her gün yenilenir; bundan eskiyse canlı veri denenir

async function depodanYukle() {
  const al = (yol) => fetch(yol, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
  const [metin, tarih] = await Promise.all([al('data/tle-gorunur.txt'), al('data/tle-gorunur.tarih')]);
  return { sats: ayristir(metin), tarih: new Date(tarih.trim()) };
}

async function canliYukle() {
  const r = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle', { signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(r.status);
  const sats = ayristir(await r.text());
  if (sats.length <= 20) throw new Error('az kayıt');
  return sats;
}

// Önce depodaki günlük CelesTrak kopyası (her ziyaretçi CelesTrak'e istek atmasın diye);
// dosya bayatsa canlı CelesTrak; o da olmazsa bayat kopya, açıkça "eski" diye etiketlenir.
// Dönüş: { sats, tur: 'depo' | 'canli' | 'eski', tarih? }
export async function tleYukle() {
  let depo = null;
  try { depo = await depodanYukle(); } catch { /* canlıyı dene */ }
  const yasSaat = depo ? (Date.now() - depo.tarih) / 3600e3 : Infinity;
  if (depo && yasSaat <= TAZE_SAAT && depo.sats.length > 20) return { sats: depo.sats, tur: 'depo', tarih: depo.tarih };
  try { return { sats: await canliYukle(), tur: 'canli' }; } catch { /* bayat kopyaya düş */ }
  if (depo) return { sats: depo.sats, tur: 'eski', tarih: depo.tarih };
  return { sats: [], tur: 'eski', tarih: null };
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
