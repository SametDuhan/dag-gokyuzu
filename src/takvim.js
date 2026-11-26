// Gözlem takvimi: önümüzdeki geceler için astronomik karanlık ve Ay'sız karanlık süresi, Ay evresi (gece ortasına göre).
import { geceOzeti, gecePenceresi } from './gece.js';

// Her gece için geceOzeti() çağrılır (5 dakikalık adım). İlk satır "bu gece" ya da süren gecedir.
export function gozlemTakvimi(gozlemci, simdi = new Date(), gunSayisi = 30, adimDk = 5) {
  const ilk = gecePenceresi(simdi).bas.getTime();
  return Array.from({ length: gunSayisi }, (_, i) => {
    const oz = geceOzeti(new Date(ilk + i * 86400e3 + 6 * 3600e3), gozlemci, { adimDk });
    return { bas: oz.pencere.bas, karanlikDk: oz.karanlikDk, aysizDk: oz.aysizDk, ay: oz.ay };
  });
}
