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
export function gecisleriBul(satrec, baslangic, bitis, gozlemci, { adimSn = 20, minYukseklik = 10 } = {}) {
  const sonuc = [];
  let aktif = null;
  for (let t = baslangic.getTime(); t <= bitis.getTime(); t += adimSn * 1000) {
    const g = anlikGorunum(satrec, new Date(t), gozlemci);
    if (g && g.yukseklik > 0) {
      if (!aktif) aktif = { dogus: new Date(t), ornekler: [] };
      aktif.ornekler.push({ zaman: new Date(t), ...g });
    } else if (aktif) { sonuc.push(ozetle(aktif, adimSn)); aktif = null; }
  }
  if (aktif) sonuc.push(ozetle(aktif, adimSn));
  return sonuc.filter((p) => p.zirveYukseklik >= minYukseklik);
}

function ozetle(a, adimSn) {
  const o = a.ornekler, zirve = o.reduce((m, x) => (x.yukseklik > m.yukseklik ? x : m));
  const gorunur = o.filter((x) => x.uyduGunesAliyor && x.gunesYuksekligi < -6); // alacakaranlık sonrası, uydu aydınlık
  return {
    dogus: o[0].zaman, batis: o[o.length - 1].zaman, sureSn: o.length * adimSn,
    zirveZaman: zirve.zaman, zirveYukseklik: zirve.yukseklik, zirveAzimut: zirve.azimut,
    dogusAzimut: o[0].azimut, batisAzimut: o[o.length - 1].azimut,
    gozleKolay: gorunur.length > 0, gorunurZirve: gorunur.reduce((m, x) => Math.max(m, x.yukseklik), 0), ornekler: o,
  };
}
