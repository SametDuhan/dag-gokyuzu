// Düşük duyarlıklı Ay konumu (Astronomical Almanac, "Low-precision formulae for the Moon": boylam ~0.3°,
// enlem ~0.2°, uzaklık ~%0.2) ve Ay evresi. Sonuç gunesECI ile aynı çerçevede (tarihin ortalama ekinoksu, km).
import { gunesECI } from './gunes.js';

const RAD = Math.PI / 180;
const YER_YARICAP = 6378.14;
const sind = (x) => Math.sin(x * RAD), cosd = (x) => Math.cos(x * RAD);

function ekliptik(tarih) {
  const T = (tarih.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  const lam = 218.32 + 481267.881 * T
    + 6.29 * sind(135.0 + 477198.87 * T) - 1.27 * sind(259.3 - 413335.36 * T)
    + 0.66 * sind(235.7 + 890534.22 * T) + 0.21 * sind(269.9 + 954397.74 * T)
    - 0.19 * sind(357.5 + 35999.05 * T) - 0.11 * sind(186.5 + 966404.03 * T);
  const bet = 5.13 * sind(93.3 + 483202.02 * T) + 0.28 * sind(228.2 + 960400.89 * T)
    - 0.28 * sind(318.3 + 6003.15 * T) - 0.17 * sind(217.6 - 407332.21 * T);
  const par = 0.9508 + 0.0518 * cosd(135.0 + 477198.87 * T) + 0.0095 * cosd(259.3 - 413335.36 * T)
    + 0.0078 * cosd(235.7 + 890534.22 * T) + 0.0028 * cosd(269.9 + 954397.74 * T);
  const eps = 23.439 - 0.0000004 * (T * 36525);
  return { lam, bet, r: YER_YARICAP / sind(par), eps };
}

export function ayECI(tarih) {
  const { lam, bet, r, eps } = ekliptik(tarih);
  const x = r * cosd(bet) * cosd(lam), y = r * cosd(bet) * sind(lam), z = r * sind(bet);
  return { x, y: y * cosd(eps) - z * sind(eps), z: y * sind(eps) + z * cosd(eps) };
}

const nokta = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const uzunluk = (a) => Math.hypot(a.x, a.y, a.z);

// Ay evresi. aydinlik: 0..1 aydınlanan kesir; uzanim: Güneş'ten doğuya doğru açı (0 yeni ay, 180 dolunay), derece.
export function ayEvresi(tarih) {
  const e = ekliptik(tarih), m = ayECI(tarih), s = gunesECI(tarih);
  const cosPsi = nokta(m, s) / (uzunluk(m) * uzunluk(s));
  const psi = Math.acos(Math.max(-1, Math.min(1, cosPsi))); // Yer'den bakınca Güneş–Ay açısı
  const R = uzunluk(s), r = uzunluk(m);
  const evreAcisi = Math.atan2(R * Math.sin(psi), r - R * Math.cos(psi)); // Ay'dan bakınca Güneş–Yer açısı
  // Uzanım ekliptik boylam farkıyla (evre tanımı bu); Güneş boylamı ECI'den geri çevrilir.
  const gunesBoylam = Math.atan2(s.y * cosd(e.eps) + s.z * sind(e.eps), s.x) / RAD;
  const uzanim = (((e.lam - gunesBoylam) % 360) + 360) % 360;
  return { aydinlik: (1 + Math.cos(evreAcisi)) / 2, uzanim, buyuyen: uzanim < 180, uzaklikKm: r };
}

// Evre adı anahtarı (i18n: 'ay.evre.<anahtar>'); uzanım aralıkları yaklaşık, yalnız adlandırma için.
export function evreAdi(uzanim) {
  const u = ((uzanim % 360) + 360) % 360;
  if (u < 8 || u >= 352) return 'yeni';
  if (u < 82) return 'hilalB';
  if (u < 98) return 'ilkDordun';
  if (u < 172) return 'siskinB';
  if (u < 188) return 'dolunay';
  if (u < 262) return 'siskinK';
  if (u < 278) return 'sonDordun';
  return 'hilalK';
}
