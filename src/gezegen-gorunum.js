// Bir gecede gezegenlerin görünürlüğü: Güneş ufkun en az 6° altındayken (sivil alacakaranlık bitti) ve gezegen ufkun en az 10° üstündeyken.
import { GEZEGENLER, gezegenKonumu, parlaklik } from './gezegen.js';
import { govdeGorunum } from './gece.js';

export const MIN_YUKSEKLIK = 10, GUNES_ESIGI = -6;

// oz: geceOzeti() çıktısı (oz.pencere, oz.seri). Dönen liste, görünür olanlar önce, en yüksekten alçağa.
export function gezegenGecesi(oz, gozlemci, adimDk = 10) {
  const { zamanlar, gunes } = oz.seri, bas = zamanlar[0];
  const sonuc = [];
  for (const ad of GEZEGENLER) {
    let ilk = null, son = null, zirve = null;
    for (let t = bas; t <= zamanlar[zamanlar.length - 1]; t += adimDk * 60e3) {
      const i = Math.round((t - bas) / 60e3);
      if (gunes[i] > GUNES_ESIGI) continue;
      const tarih = new Date(t), k = gezegenKonumu(ad, tarih), g = govdeGorunum(k.eci, tarih, gozlemci);
      if (g.yukseklik < MIN_YUKSEKLIK) continue;
      ilk ??= t; son = t;
      if (!zirve || g.yukseklik > zirve.yukseklik) zirve = { yukseklik: g.yukseklik, azimut: g.azimut, zaman: tarih, kadir: parlaklik(ad, k) };
    }
    sonuc.push({ ad, gorunur: !!zirve, bas: ilk && new Date(ilk), bit: son && new Date(son), zirve });
  }
  return sonuc.sort((a, b) => (b.gorunur - a.gorunur) || ((b.zirve?.yukseklik ?? 0) - (a.zirve?.yukseklik ?? 0)));
}
