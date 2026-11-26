// Gözlem yerleri. Koordinatlar Türkiye Ulusal Gözlemevleri'nin resmî yerleşke sayfalarından
// (trgozlemevleri.gov.tr/en/campuses/erzurum-dag ve /antalya-tug, 26 Kasım 2026'da okundu), derece-dakika-saniyeden çevrildi.
const dms = (d, m, s) => d + m / 60 + s / 3600;

// DAG Karakayatepe, Konaklı / Erzurum: 39°46′43″K 41°13′37″D, 3170 m.
export const DAG = { ad: 'DAG Karakayatepe', enlemDerece: dms(39, 46, 43), boylamDerece: dms(41, 13, 37), rakimKm: 3.17 };
// TÜBİTAK Ulusal Gözlemevi (TUG), Bakırlıtepe / Antalya: 36°49′27″K 30°20′08″D, 2550 m.
export const TUG = { ad: 'TUG Bakırlıtepe', enlemDerece: dms(36, 49, 27), boylamDerece: dms(30, 20, 8), rakimKm: 2.55 };

// 23 Kasım 2026'daki Heavens-Above ve USNO karşılaştırmaları, resmî koordinat bulunmadan önceki
// Wikipedia değeriyle (39.783°K 41.233°D) yapıldı. Bu karşılaştırmaların tekrarlanabilmesi için sabit tutulur.
export const DAG_WIKIPEDIA = { ad: 'DAG (Wikipedia koordinatı)', enlemDerece: 39.783, boylamDerece: 41.233, rakimKm: 3.17 };
