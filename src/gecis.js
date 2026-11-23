import * as sat from 'satellite.js';
import { gunesECI, golgedeMi, gunesYuksekligi } from './gunes.js';

const RAD = Math.PI / 180;

export function gozlemciKur(g) {
  return { latitude: g.enlemDerece * RAD, longitude: g.boylamDerece * RAD, height: g.rakimKm };
}

// Bir anda uydunun gözlemciden görünümü: yükseklik/azimut (derece), menzil (km); gölge bilgisi yalnız
// ufuk üstündeyken (ya da gunesBilgisi:true verilirse) hesaplanır — toplu taramalarda hız için.
export function anlikGorunum(satrec, tarih, gozlemci, { gunesBilgisi = false } = {}) {
  const pv = sat.propagate(satrec, tarih);
  if (!pv || !pv.position || typeof pv.position.x !== 'number') return null;
  const gmst = sat.gstime(tarih);
  const ecf = sat.eciToEcf(pv.position, gmst);
  const bak = sat.ecfToLookAngles(gozlemci, ecf);
  const sonuc = { yukseklik: bak.elevation / RAD, azimut: ((bak.azimuth / RAD) + 360) % 360, menzil: bak.rangeSat };
  if (gunesBilgisi || sonuc.yukseklik > 0) {
    const gunes = gunesECI(tarih);
    const obsEcf = sat.geodeticToEcf(gozlemci);
    const cos = Math.cos(gmst), sin = Math.sin(gmst); // ECF → ECI
    const obsEci = { x: obsEcf.x * cos - obsEcf.y * sin, y: obsEcf.x * sin + obsEcf.y * cos, z: obsEcf.z };
    sonuc.uyduGunesAliyor = !golgedeMi(pv.position, gunes);
    sonuc.gunesYuksekligi = gunesYuksekligi(obsEci, gunes);
  }
  return sonuc;
}

// [baslangic, bitis] aralığındaki geçişleri bulur (ufuk üstü aralıklar). adim saniye.
// Kaba adımla bulunan doğuş/batış ikiye bölmeyle, zirve altın oran aramasıyla 0.2 sn'ye kadar hassaslaştırılır
// (45 sn adımda bile; Heavens-Above karşılaştırmasında adımın kendisinden gelen hata böylece kalkar).
export function gecisleriBul(satrec, baslangic, bitis, gozlemci, { adimSn = 20, minYukseklik = 10 } = {}) {
  const sonuc = [], bas = baslangic.getTime(), son = bitis.getTime(), adim = adimSn * 1000;
  let aktif = null;
  for (let t = bas; t <= son; t += adim) {
    const g = anlikGorunum(satrec, new Date(t), gozlemci);
    if (g && g.yukseklik > 0) {
      if (!aktif) aktif = { ornekler: [], kenarBas: t === bas };
      aktif.ornekler.push({ zaman: new Date(t), ...g });
    } else if (aktif) { sonuc.push(ozetle(aktif, satrec, gozlemci, adim, false)); aktif = null; }
  }
  if (aktif) sonuc.push(ozetle(aktif, satrec, gozlemci, adim, true));
  return sonuc.filter((p) => p.zirveYukseklik >= minYukseklik);
}

const yukseklik = (satrec, t, gozlemci) => anlikGorunum(satrec, new Date(t), gozlemci)?.yukseklik ?? -90;

// alt: ufuk altındaki an, ust: ufuk üstündeki an (sıra fark etmez); ufuk geçişini ikiye bölmeyle bulur.
function ufukGecisi(satrec, gozlemci, alt, ust) {
  while (Math.abs(ust - alt) > 200) { const m = (alt + ust) / 2; if (yukseklik(satrec, m, gozlemci) > 0) ust = m; else alt = m; }
  return (alt + ust) / 2;
}

// [a, b] içinde yüksekliği en büyük yapan an (tek tepeli kabul edilir).
function zirveAra(satrec, gozlemci, a, b) {
  const k = (Math.sqrt(5) - 1) / 2;
  let c = b - k * (b - a), d = a + k * (b - a), yc = yukseklik(satrec, c, gozlemci), yd = yukseklik(satrec, d, gozlemci);
  while (b - a > 200) {
    if (yc > yd) { b = d; d = c; yd = yc; c = b - k * (b - a); yc = yukseklik(satrec, c, gozlemci); }
    else { a = c; c = d; yc = yd; d = a + k * (b - a); yd = yukseklik(satrec, d, gozlemci); }
  }
  return (a + b) / 2;
}

function ozetle(a, satrec, gozlemci, adim, kenarSon) {
  const o = a.ornekler, ilk = o[0].zaman.getTime(), sonT = o[o.length - 1].zaman.getTime();
  const enY = o.reduce((m, x) => (x.yukseklik > m.yukseklik ? x : m));
  const dogusT = a.kenarBas ? ilk : ufukGecisi(satrec, gozlemci, ilk - adim, ilk);
  const batisT = kenarSon ? sonT : ufukGecisi(satrec, gozlemci, sonT + adim, sonT);
  const zirveT = zirveAra(satrec, gozlemci, Math.max(dogusT, enY.zaman.getTime() - adim), Math.min(batisT, enY.zaman.getTime() + adim));
  const zirve = anlikGorunum(satrec, new Date(zirveT), gozlemci);
  const dg = anlikGorunum(satrec, new Date(dogusT), gozlemci), bt = anlikGorunum(satrec, new Date(batisT), gozlemci);
  const gorunur = o.filter((x) => x.uyduGunesAliyor && x.gunesYuksekligi < -6); // alacakaranlık sonrası, uydu aydınlık
  return {
    dogus: new Date(dogusT), batis: new Date(batisT), sureSn: Math.round((batisT - dogusT) / 1000),
    zirveZaman: new Date(zirveT), zirveYukseklik: zirve.yukseklik, zirveAzimut: zirve.azimut,
    dogusAzimut: dg.azimut, batisAzimut: bt.azimut,
    gozleKolay: gorunur.length > 0, gorunurZirve: gorunur.reduce((m, x) => Math.max(m, x.yukseklik), 0), ornekler: o,
  };
}
