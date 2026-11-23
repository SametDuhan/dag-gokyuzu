// Düşük duyarlıklı Güneş konumu (Astronomical Almanac, ~0.01°) ve yer gölgesi testi.
const RAD = Math.PI / 180;
const AU_KM = 149597870.7;

export function gunesECI(tarih) {
  const n = tarih.getTime() / 86400000 + 2440587.5 - 2451545.0; // J2000'den gün
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;
  const R = (1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g)) * AU_KM;
  return { x: R * Math.cos(lam), y: R * Math.cos(eps) * Math.sin(lam), z: R * Math.sin(eps) * Math.sin(lam) };
}

// Silindirik gölge: uydu Güneş'in tersi yönde ve eksene 6378 km'den yakınsa gölgede.
export function golgedeMi(uyduECI, gunes) {
  const R = Math.hypot(gunes.x, gunes.y, gunes.z);
  const s = { x: gunes.x / R, y: gunes.y / R, z: gunes.z / R };
  const d = uyduECI.x * s.x + uyduECI.y * s.y + uyduECI.z * s.z; // Güneş yönündeki bileşen
  if (d > 0) return false;
  const dik = Math.hypot(uyduECI.x - d * s.x, uyduECI.y - d * s.y, uyduECI.z - d * s.z);
  return dik < 6378.137;
}

// Gözlemcinin Güneş yüksekliği (derece), gözlemci ECI konumundan.
export function gunesYuksekligi(gozlemciECI, gunes) {
  const gx = gunes.x - gozlemciECI.x, gy = gunes.y - gozlemciECI.y, gz = gunes.z - gozlemciECI.z;
  const gr = Math.hypot(gx, gy, gz), or = Math.hypot(gozlemciECI.x, gozlemciECI.y, gozlemciECI.z);
  const sin = (gx * gozlemciECI.x + gy * gozlemciECI.y + gz * gozlemciECI.z) / (gr * or);
  return Math.asin(sin) / RAD;
}

// Yer (enlem/boylam derece) için Güneş yüksekliği — arşiv analizinde kullanılır.
import * as sat from 'satellite.js';
export function gunesYuksekligiYer(tarih, enlemDerece, boylamDerece) {
  const e = sat.geodeticToEcf({ latitude: enlemDerece * RAD, longitude: boylamDerece * RAD, height: 0 });
  const gm = sat.gstime(tarih), c = Math.cos(gm), s = Math.sin(gm);
  return gunesYuksekligi({ x: e.x * c - e.y * s, y: e.x * s + e.y * c, z: e.z }, gunesECI(tarih));
}
