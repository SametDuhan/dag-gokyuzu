# DAG Gökyüzü — Plan

**Amaç:** TUG/DAG 2027/1 staj başvurusu (son tarih 18 Aralık 2026, 17:00) için, Erzurum DAG Karakayatepe
(3170 m) gözlemevine özel bir **gözlem gecesi planlayıcısı**. Jürinin linke tıklayıp hemen görebileceği statik site.

## Yapı: tek site, iki yarı (23 Kas 2026 kararı)
Gerekçe: DAG ekibinin kamuya açık işlerinde uydu geçişi planlayıcısına ihtiyaç izi yok; ama DAG için gözlem
koşulu/bulut analizi yayımlanmış bir çalışma konusu (JARNAS, CM SAF bulut verisi). Görsel etki + içerik uyumu için birleştirildi.

**A. "Bu gece" (görsel çekirdek):** TLE + SGP4 (satellite.js) ile DAG için uydu geçişleri, canlı gökyüzü haritası,
Güneş/yer gölgesi görünürlüğü; yanında bu geceye ait hava tahmini (Open-Meteo forecast) ve gözlem uygunluk skoru.
**B. "DAG iklimi" (içerik çekirdeği):** Open-Meteo arşivinden (2015+) saatlik bulut/rüzgâr/nem/sıcaklık ile DAG için
ay-saat bazlı açık gökyüzü istatistiği; aynı skor tanımı geçmişe uygulanır. Veri model çıktısıdır (~7 km grid, model
rakımı 3120 m), ölçüm değildir; raporda yazılı.
**C. Doğrulama (yapıldı 23 Kas):** bulut verisi DAG'daki BWCS II yerinde ölçümüyle (Atalay vd. 2024, 2019–2020) aylık karşılaştırıldı, r≈0.86–0.88; uydu geçişleri Heavens-Above ile (yapılacak).

## Dürüstlük kuralları
- TLE doğruluğu km mertebesi; raporda yazılı.
- Skor basit heuristik; bilimsel iddia küçük, iş sağlam.
- DAG koordinatı tek kaynaktan (Wikipedia); resmî değer bulunursa güncellenir.

## Takvim
| Gün | Tarih | İş |
|---|---|---|
| 1–3 | 23–25 Kas | Çekirdek (TLE+SGP4, geçiş, Güneş/gölge) ← **başladı** |
| 4–9 | 26 Kas–1 Ara | A: arayüz, gökyüzü haritası, geçiş listesi, bu gece tahmini |
| 10–14 | 2–6 Ara | B: arşiv verisi, ay-saat istatistiği, skor |
| 15–18 | 7–10 Ara | Doğrulama, sapma raporu |
| 19–22 | 11–14 Ara | Cilalama, README, 1 sayfalık teknik özet |
| 23–25 | 15–18 Ara | Başvuru paketi, tampon |

Belgeler (transkript, sağlık raporu, bölüm yazısı, dilekçe, niyet mektubu, özgeçmiş) paralel yürür.
