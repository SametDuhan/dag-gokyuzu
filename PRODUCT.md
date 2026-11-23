# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
delegated: düz HTML/CSS/JS (ES modülleri), derleme adımı yok. Gerekçe: sayfa sayısı az, ağır işler canvas çizimi, 25 günlük takvimde hata yüzeyini küçük tutmak. Kullanıcı yığına dair tercih belirtmedi; React/Vite avantajı sorgulandı, bu projede maliyetine değmediği için seçilmedi. Hesap çekirdeği (satellite.js + Node testleri) hâlihazırda sade ES modülü.

## Users
- Birincil: Türkiye Ulusal Gözlemevleri (TUG/DAG) 2027/1 staj değerlendirme jürisi ve TUG çalışanları. Başvuru e-postasındaki linke tıklayıp kısa sürede "bu kişi ne yaptı, ne kadar sağlam" sorusuna cevap arar.
- İkincil: genel gökyüzü meraklıları; ana sayfa bağımsız bir araç gibi okunabilmeli.
- Yapan kişi: Samet Duhan Şahin, Atatürk Üniversitesi Bilgisayar Mühendisliği 3. sınıf (Erzurum).

## Product Purpose
DAG Karakayatepe (Erzurum, ~3170 m) için gözlem gecesi planlayıcısı ve iklim analizi. İki yarı: (A) "Bu gece": uydu geçişleri, canlı gökyüzü haritası, gece hava tahmini ve gözlem uygunluğu; (B) "DAG iklimi": 2015'ten beri saatlik arşiv verisiyle ay×saat bazlı açık gökyüzü istatistiği. Amaç aynı zamanda 18 Aralık 2026 17:00 son tarihli TUG staj başvurusunu güçlendirmek; başarı, jürinin işi anlayıp doğruluğuna güvenmesi.

## Positioning
DAG'a özel (genel bir uydu takip sitesi değil) ve hesaplarını kamuya açık DAG ölçümüyle karşılaştırmış: model bulut verisi, DAG'daki BWCS II ölçümüyle (Atalay vd. 2024, 2019–2020) aylık gece "açık %" üzerinde r≈0.86–0.88.

## Operating Context
- Ana sayfa araç gibi çalışır; ayrı bir sayfada başvuru notu, yöntem ve doğrulama bulunur.
- Çift dil: Türkçe + İngilizce (tek sözlük dosyası, dil düğmesi).
- Veri: CelesTrak TLE (canlı), Open-Meteo forecast (bu gece) ve archive (2015–2026, saatlik, UTC). Sunucu yok; statik yayın.

## Capabilities and Constraints
- Uydu geçişi: satellite.js SGP4; TLE doğruluğu km mertebesi. Güneş konumu düşük duyarlıklı formül; yer gölgesi silindirik model.
- DAG koordinatı 39.783°N 41.233°E, 3170 m — tek kaynak (Wikipedia yansıması), resmî değil.
- Hava verisi model çıktısı (~7 km grid, model rakımı 3120 m), ölçüm değil.
- "Gözlem için uygun saat" eşikleri yazarın varsayımı (Güneş < −12°, bulut ≤%30, rüzgâr ≤36 km/s, hamle ≤50, nem ≤%85, yağış yok); resmî işletme sınırı değil. Nem eşiği sonucu en çok etkileyen değişken (%70→%30 uygun, sınırsız→%51); rüzgâr eşiği neredeyse etkisiz. Mutlak oranlar aralık olarak, mevsimsel desen ve ölçümle uyum öne çıkarılarak sunulur.
- Henüz yapılmadı: uydu geçişlerinin Heavens-Above ile doğrulanması.
- Son tarih 18 Aralık 2026 17:00; takvim docs/PLAN.md ve Masaüstü "DAG Gokyuzu Proje".

## Brand Commitments
Kullanıcının bağlayıcı görsel kararları: genel zemin siyah ve lacivert, yazılar beyaz, arkada hafif bir yıldız animasyonu. Ürün adı: "DAG Gökyüzü".

## Evidence on Hand
- data/arsiv/ altında 2015–2026 saatlik hava verisi (12 dosya); araclar/ altında analiz betikleri; 7 geçen Node testi.
- Yayımlanmış dayanaklar: Atalay, Nasıroğlu & Yeşilyaprak 2024 (JARNAS 10(1):9–20, DAG'da Boltwood BWCS II ölçümü); Kaba & Yeşilyaprak 2021 (JARNAS 7(3):304–318, CM SAF CFC; yalnız özet okundu).
- Yok ve uydurulmayacak: TUG/DAG'ın bu aracı istediğine dair kanıt, resmî işletme eşikleri, resmî koordinat, uydu geçişi doğrulama sonucu.

## Product Principles
1. Dürüstlük önce: model verisi ölçüm gibi sunulmaz, eşikler varsayım olarak etiketlenir, bilinmeyen bilinmiyor diye yazılır.
2. Kanıt gösterir: her iddianın yanında kaynak ya da doğrulama sonucu bulunur.
3. DAG'a özel: her ekran Karakayatepe koordinatı ve DAG'ın gerçek koşullarıyla konuşur.
4. Küçük bilimsel iddia, sağlam iş: abartmadan kanıtlanabilir olanı göster.
5. Jüri 30 saniyede ne olduğunu anlamalı, 5 dakikada neye güvenebileceğini görebilmeli.

## Accessibility & Inclusion
Koyu zeminde beyaz metin yüksek kontrastla; yıldız animasyonu `prefers-reduced-motion` altında durur ve içerik animasyona bağlı olmaz. Her iki dilde klavye ile gezinilebilir olmalı.
