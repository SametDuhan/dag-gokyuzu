# DAG Gökyüzü

Doğu Anadolu Gözlemevi (DAG, Karakayatepe, Erzurum, ~3170 m) için gözlem gecesi planlayıcısı ve iklim analizi.

**Canlı site:** https://sametduhan.github.io/dag-gokyuzu/

- **Gökyüzü / Bu gece:** CelesTrak TLE + SGP4 (satellite.js) ile DAG için görünür uydu geçişleri, kutupsal gökyüzü haritası, Open-Meteo tahminiyle önümüzdeki 24 saatin gözlem koşulları.
- **İklim:** Open-Meteo arşivinden 2015–2026 saatlik veriyle ay × saat açık gökyüzü istatistiği; DAG'daki Boltwood BWCS II ölçümüyle (Atalay vd. 2024) karşılaştırma (aylık r ≈ 0.86–0.88).
- **Yöntem:** eşikler, sınırlar, doğrulama ve kaynaklar `yontem.html` sayfasında.

TUG 2027/1 staj başvurusu için hazırlanmış bağımsız bir çalışmadır; resmî bir TUG/DAG aracı değildir.

## Çalıştırma

Derleme adımı yok: düz HTML/CSS/JS (ES modülleri).

```sh
python3 -m http.server 8765   # sonra http://localhost:8765/
npm install && npm test       # Node testleri (hesap çekirdeği)
```

- Sayfalar `node araclar/sayfalari-uret.mjs` ile üretilir; HTML dosyalarını elle düzenleme.
- Giriş çizimi `python3 araclar/sahne_uret.py` ile üretilir.
- Arşiv verisi: `node araclar/arsiv-cek.mjs` → `data/arsiv/`; özet: `node araclar/iklim-json.mjs` → `data/iklim.json`.
- Tarayıcı satellite.js'i `vendor/satellite.js/` klasöründen yükler (sürüm 7.2.0, MIT). Güncellemek için: `npm install` sonra `npm run vendor`.

## Veri ve lisanslar

- Uydu yörünge verisi: [CelesTrak](https://celestrak.org/)
- Hava verisi: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0)
- satellite.js: MIT (`vendor/satellite.js/LICENSE.md`)
