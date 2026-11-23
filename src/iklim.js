import { gunesYuksekligiYer } from './gunes.js';

// Eşikler VARSAYIMDIR (gözlemevinin resmî işletme sınırları değil); raporda böyle belirtilir.
export const ESIKLER = { karanlikGunes: -12, bulutMax: 30, ruzgarMax: 36, ruzgarEsMax: 50, nemMax: 85, yagisMax: 0 };

// Bir saatin gözlem için uygun olup olmadığı. null: veri eksik.
export function saatDurumu(t, v, esik = ESIKLER, yer) {
  const gece = gunesYuksekligiYer(t, yer.enlemDerece, yer.boylamDerece) < esik.karanlikGunes;
  if (!gece) return { gece: false, uygun: false };
  if ([v.bulut, v.ruzgar, v.nem, v.yagis].some((x) => x == null)) return { gece: true, uygun: null };
  const uygun = v.bulut <= esik.bulutMax && v.ruzgar <= esik.ruzgarMax && (v.ruzgarEs ?? 0) <= esik.ruzgarEsMax &&
    v.nem <= esik.nemMax && v.yagis <= esik.yagisMax;
  return { gece: true, uygun };
}

// arşiv dosyalarının birleşik listesi → ay ve yerel-saat bazlı uygunluk tablosu.
// donus.aySaat[ay 0..11][saat 0..23] = {gece, uygun} sayıları; donus.aylik, donus.yillik.
export function iklimOzeti(dosyalar, yer, esik = ESIKLER, tzSaat = 3) {
  const aySaat = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => ({ gece: 0, uygun: 0, veriYok: 0 })));
  const yillik = {};
  for (const d of dosyalar) {
    const h = d.hourly;
    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i] + ':00Z');
      const durum = saatDurumu(t, { bulut: h.cloud_cover[i], ruzgar: h.wind_speed_10m[i], ruzgarEs: h.wind_gusts_10m[i],
        nem: h.relative_humidity_2m[i], yagis: h.precipitation[i] }, esik, yer);
      if (!durum.gece) continue;
      const yerel = new Date(t.getTime() + tzSaat * 3600e3);
      const ay = yerel.getUTCMonth(), saat = yerel.getUTCHours(), yil = yerel.getUTCFullYear();
      const hucre = aySaat[ay][saat];
      if (durum.uygun === null) { hucre.veriYok++; continue; }
      hucre.gece++; if (durum.uygun) hucre.uygun++;
      const y = (yillik[yil] ??= { gece: 0, uygun: 0 }); y.gece++; if (durum.uygun) y.uygun++;
    }
  }
  const aylik = aySaat.map((satirlar) => {
    const g = satirlar.reduce((a, c) => a + c.gece, 0), u = satirlar.reduce((a, c) => a + c.uygun, 0);
    return { geceSaat: g, uygunSaat: u, oran: g ? u / g : null };
  });
  return { aySaat, aylik, yillik };
}
