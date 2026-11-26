// Gezegen konumları: JPL "Approximate Positions of the Planets" (Standish) Kepler elemanları, geçerlilik 1800–2050.
// Beklenen doğruluk: dakikalar mertebesi (yaklaşık 1′). Işık gecikmesi, nütasyon ve Dünya–Ay merkezi farkı yok sayılır.
// tests/gezegen.test.js, astronomy-engine ile 0.1° içinde karşılaştırır.
const RAD = Math.PI / 180, AU_KM = 149597870.7;

// [a, e, I, L, ϖ, Ω] ve yüzyıllık değişimleri (a: AU, açılar: derece). Kaynak: JPL SSD, Tablo 1.
const ELEMAN = {
  merkur: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus: [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  dunya: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars: [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus: [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptun: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
};
export const GEZEGENLER = ['merkur', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptun'];

const julianGun = (tarih) => tarih.getTime() / 86400e3 + 2440587.5;
const norm180 = (d) => ((d % 360) + 540) % 360 - 180;

// Güneş merkezli, J2000 ekliptik koordinatlarda konum (AU).
function helyosentrik(ad, T) {
  const [e0, d] = ELEMAN[ad];
  const [a, e, I, L, vp, Om] = e0.map((v, i) => v + d[i] * T);
  const M = norm180(L - vp) * RAD, w = (vp - Om) * RAD, Omr = Om * RAD, Ir = I * RAD;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Omr), sO = Math.sin(Omr), cI = Math.cos(Ir), sI = Math.sin(Ir);
  return [(cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y, (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y, sw * sI * x + cw * sI * y];
}

// J2000 ekvator koordinatlarından tarihin ortalama ekinoksuna presesyon (IAU 1976 açıları).
function presesyon([x, y, z], T) {
  const sn = RAD / 3600, zeta = (2306.2181 * T + 0.30188 * T * T) * sn, zz = (2306.2181 * T + 1.09468 * T * T) * sn, th = (2004.3109 * T - 0.42665 * T * T) * sn;
  const cz = Math.cos(zeta), sz = Math.sin(zeta), cZ = Math.cos(zz), sZ = Math.sin(zz), ct = Math.cos(th), st = Math.sin(th);
  const X = (cZ * ct * cz - sZ * sz) * x + (-cZ * ct * sz - sZ * cz) * y + -cZ * st * z;
  const Y = (sZ * ct * cz + cZ * sz) * x + (-sZ * ct * sz + cZ * cz) * y + -sZ * st * z;
  return [X, Y, st * cz * x - st * sz * y + ct * z];
}

// Gezegenin yer merkezli konumu: ECI benzeri vektör (km, tarihin ekvatoru; satellite.js ile aynı çerçeve) ve görünüm bilgisi.
export function gezegenKonumu(ad, tarih) {
  const T = (julianGun(tarih) - 2451545.0) / 36525;
  const p = helyosentrik(ad, T), d = helyosentrik('dunya', T);
  const g = [p[0] - d[0], p[1] - d[1], p[2] - d[2]];
  const eps = 23.43928 * RAD, ce = Math.cos(eps), se = Math.sin(eps);
  const [x, y, z] = presesyon([g[0], g[1] * ce - g[2] * se, g[1] * se + g[2] * ce], T);
  const delta = Math.hypot(...g), r = Math.hypot(...p), R = Math.hypot(...d);
  // faz açısı (Güneş–gezegen–Dünya), derece
  const cosI = (r * r + delta * delta - R * R) / (2 * r * delta);
  return { eci: { x: x * AU_KM, y: y * AU_KM, z: z * AU_KM }, uzaklikAU: delta, gunesUzaklikAU: r, fazAcisi: Math.acos(Math.max(-1, Math.min(1, cosI))) / RAD };
}

// Görünür parlaklık: Astronomical Almanac formülleri. Satürn'de halka etkisi yok sayılır (± ~1 kadir).
export function parlaklik(ad, k) {
  const i = k.fazAcisi, b = 5 * Math.log10(k.gunesUzaklikAU * k.uzaklikAU);
  switch (ad) {
    case 'merkur': return -0.42 + b + 0.0380 * i - 0.000273 * i * i + 0.000002 * i ** 3;
    case 'venus': return -4.40 + b + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i ** 3;
    case 'mars': return -1.52 + b + 0.016 * i;
    case 'jupiter': return -9.40 + b + 0.005 * i;
    case 'saturn': return -8.88 + b;
    case 'uranus': return -7.19 + b;
    default: return -6.87 + b;
  }
}
