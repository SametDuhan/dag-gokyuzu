// "Bu gece" özeti: gün batımı/doğumu, alacakaranlıklar, Ay doğuş/batışı, Ay'sız astronomik karanlık.
import * as sat from 'satellite.js';
import { gunesECI } from './gunes.js';
import { ayECI, ayEvresi, evreAdi } from './ay.js';

const RAD = Math.PI / 180;
export const UFUK_GUNES = -0.833; // merkez yüksekliği: kırılma 34′ + yarıçap 16′
export const UFUK_AY = -0.83;     // topocentrik merkez yüksekliği: kırılma 34′ + yarıçap ~15.5′
export const ESIK = { sivil: -6, deniz: -12, astro: -18 };

// Bir gök cisminin (ECI, km) gözlemciden yüksekliği ve azimutu (derece); paralaks dahil (topocentrik).
export function govdeGorunum(eci, tarih, gozlemci) {
  const ecf = sat.eciToEcf(eci, sat.gstime(tarih));
  const b = sat.ecfToLookAngles(gozlemci, ecf);
  return { yukseklik: b.elevation / RAD, azimut: ((b.azimuth / RAD) + 360) % 360 };
}
export const gunesGorunum = (t, g) => govdeGorunum(gunesECI(t), t, g);
export const ayGorunum = (t, g) => govdeGorunum(ayECI(t), t, g);

// Hangi gece? Yerel saat 06:00'dan önceyse süren gece (dünkü öğleden itibaren), değilse bugünkü öğleden yarın öğlene.
export function gecePenceresi(simdi, tzSaat = 3) {
  const yerel = new Date(simdi.getTime() + tzSaat * 3600e3);
  const ogle = Date.UTC(yerel.getUTCFullYear(), yerel.getUTCMonth(), yerel.getUTCDate(), 12) - tzSaat * 3600e3;
  const bas = yerel.getUTCHours() < 6 ? ogle - 86400e3 : ogle;
  return { bas: new Date(bas), bit: new Date(bas + 86400e3) };
}

// Örneklenmiş seride eşik geçişleri (doğrusal ara değer). yon: 'iner' | 'cikar'
function gecisler(zamanlar, degerler, esik) {
  const cikti = [];
  for (let i = 1; i < degerler.length; i++) {
    const a = degerler[i - 1] - esik, b = degerler[i] - esik;
    if ((a < 0) === (b < 0)) continue;
    const k = a / (a - b), t = zamanlar[i - 1] + k * (zamanlar[i] - zamanlar[i - 1]);
    cikti.push({ zaman: new Date(t), yon: b >= 0 ? 'cikar' : 'iner' });
  }
  return cikti;
}

// Koşulun doğru olduğu aralıklar [{bas, bit}] (dakika çözünürlüğü yeterli).
function araliklar(zamanlar, kosul) {
  const cikti = []; let ac = null;
  zamanlar.forEach((t, i) => {
    if (kosul[i] && ac === null) ac = t;
    if (!kosul[i] && ac !== null) { cikti.push({ bas: new Date(ac), bit: new Date(t) }); ac = null; }
  });
  if (ac !== null) cikti.push({ bas: new Date(ac), bit: new Date(zamanlar[zamanlar.length - 1]) });
  return cikti;
}

export function geceOzeti(simdi, gozlemci, { tzSaat = 3, adimDk = 1 } = {}) {
  const { bas, bit } = gecePenceresi(simdi, tzSaat);
  const zamanlar = [], gunes = [], ay = [];
  for (let t = bas.getTime(); t <= bit.getTime(); t += adimDk * 60e3) {
    const d = new Date(t);
    zamanlar.push(t); gunes.push(gunesGorunum(d, gozlemci).yukseklik); ay.push(ayGorunum(d, gozlemci).yukseklik);
  }
  const ilk = (seri, esik, yon) => gecisler(zamanlar, seri, esik).find((g) => g.yon === yon)?.zaman ?? null;
  const olaylar = {
    gunBatimi: ilk(gunes, UFUK_GUNES, 'iner'), sivilBitis: ilk(gunes, ESIK.sivil, 'iner'),
    astroBas: ilk(gunes, ESIK.astro, 'iner'), astroBit: ilk(gunes, ESIK.astro, 'cikar'),
    sivilBas: ilk(gunes, ESIK.sivil, 'cikar'), gunDogumu: ilk(gunes, UFUK_GUNES, 'cikar'),
  };
  const ayOlaylari = gecisler(zamanlar, ay, UFUK_AY).map((g) => ({ tur: g.yon === 'cikar' ? 'ayDogus' : 'ayBatis', zaman: g.zaman }));
  const karanlik = araliklar(zamanlar, gunes.map((h) => h < ESIK.astro));
  const aysiz = araliklar(zamanlar, gunes.map((h, i) => h < ESIK.astro && ay[i] < UFUK_AY));
  const ayUstte = araliklar(zamanlar, ay.map((h) => h >= UFUK_AY));
  const sure = (l) => Math.round(l.reduce((t, a) => t + (a.bit - a.bas), 0) / 60e3);
  // Evre gece yarısına (ya da karanlığın ortasına) göre verilir.
  const orta = karanlik.length ? new Date((karanlik[0].bas.getTime() + karanlik[karanlik.length - 1].bit.getTime()) / 2) : new Date((bas.getTime() + bit.getTime()) / 2);
  const evre = ayEvresi(orta);
  return {
    pencere: { bas, bit }, olaylar, ayOlaylari, karanlik, aysiz, ayUstte,
    karanlikDk: sure(karanlik), aysizDk: sure(aysiz),
    ay: { ...evre, ad: evreAdi(evre.uzanim), zaman: orta },
    seri: { zamanlar, gunes, ay },
  };
}
