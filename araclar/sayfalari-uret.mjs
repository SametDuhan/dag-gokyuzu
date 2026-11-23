// Sayfaları üretir: index, gokyuzu, gece, iklim, yontem (.html). Çalıştır: node araclar/sayfalari-uret.mjs
// Ortak üst çubuk/alt bilgi tek yerde; çizim araclar/parcalar/sahne.html (araclar/sahne_uret.py üretir).
import { readFileSync, writeFileSync } from 'node:fs';
const kok = new URL('../', import.meta.url);
const sahne = readFileSync(new URL('araclar/parcalar/sahne.html', kok), 'utf8');
const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2302040a'/%3E%3Cpath d='M16 4l2.4 9.6L28 16l-9.6 2.4L16 28l-2.4-9.6L4 16l9.6-2.4z' fill='%23f4c56a'/%3E%3C/svg%3E";

const SEKME = { gokyuzu: ['gokyuzu.html', 'nav.gokyuzu', 'Gökyüzü'], gece: ['gece.html', 'nav.gece', 'Bu gece'], iklim: ['iklim.html', 'nav.iklim', 'İklim'], yontem: ['yontem.html', 'nav.yontem', 'Yöntem'] };
const sekme = (k, aktif) => `<a href="${SEKME[k][0]}" data-i="${SEKME[k][1]}"${aktif === k ? ' aria-current="page"' : ''}>${SEKME[k][2]}</a>`;

function sayfa({ dosya, baslik, aciklama, aktif, govde, betik = 'js/ana.js', anaSayfa = false }) {
  const dag = anaSayfa ? '<h1 class="dag" id="baslik"><a href="./" aria-label="DAG, Doğu Anadolu Gözlemevi">DAG</a></h1>'
    : '<div class="dag"><a href="./" aria-label="DAG, Doğu Anadolu Gözlemevi, ana sayfa">DAG</a></div>';
  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${baslik}</title>
<meta name="description" content="${aciklama}">
<meta name="theme-color" content="#02040a">
<link rel="icon" href="${FAV}">
<link rel="preload" href="fonts/BricolageGrotesque-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/yazi-tipleri.css">
<link rel="stylesheet" href="css/stil.css">
<script type="importmap">{ "imports": { "satellite.js": "./vendor/satellite.js/index.js" } }</script>
</head>
<body class="sayfa-${dosya.replace('.html', '').replace('index', 'ana')}">
<canvas id="yildizlar" aria-hidden="true"></canvas>
<a class="atla" href="#icerik" data-i="nav.atla">İçeriğe geç</a>
<header class="ust">
  <nav class="menu menu-sol" aria-label="Sol gezinme">${sekme('gokyuzu', aktif)}${sekme('gece', aktif)}</nav>
  ${dag}
  <nav class="menu menu-sag" aria-label="Sağ gezinme">${sekme('iklim', aktif)}${sekme('yontem', aktif)}</nav>
  <button type="button" id="dilDugme" class="dil" aria-label="Switch to English">EN</button>
</header>
<main id="icerik">
${govde}
</main>
<footer class="alt">
  <p data-i="alt.not"></p>
  <p class="soluk" data-i="alt.yapan"></p>
</footer>
<script type="module" src="${betik}"></script>
</body>
</html>
`;
  writeFileSync(new URL(dosya, kok), html);
}

sayfa({ dosya: 'index.html', baslik: 'DAG Gökyüzü', aciklama: 'Doğu Anadolu Gözlemevi (DAG) için canlı uydu geçişleri ve gözlem koşulu analizi.', anaSayfa: true, govde: `
  <section class="giris" aria-label="Giriş">
    <p class="slogan" data-i="slogan">Karakayatepe’nin gökyüzü: bu gece ve 2015’ten bugüne</p>
    <p class="lead" data-i="lead">Doğu Anadolu Gözlemevi için canlı uydu geçişleri ve gözlem koşulu analizi.</p>
    <figure class="sahne-kap">
      ${sahne}
      <figcaption data-i="sahne.not">Stilize illüstrasyon: Karakayatepe, 3170 m. Bina biçimi ve ölçüleri gerçeğe uygun değildir.</figcaption>
    </figure>
    <div class="giris-alt">
      <p id="sonraki" class="sonraki" aria-live="polite"></p>
      <a class="dugme" href="gokyuzu.html" data-i="hero.ac">Gökyüzüne bak</a>
    </div>
  </section>
  <section class="rehber" aria-label="Sayfalar">
    <ul>
      <li><a href="gokyuzu.html"><strong data-i="nav.gokyuzu">Gökyüzü</strong><span data-i="ana.t.gokyuzu"></span></a></li>
      <li><a href="gece.html"><strong data-i="nav.gece">Bu gece</strong><span data-i="ana.t.gece"></span></a></li>
      <li><a href="iklim.html"><strong data-i="nav.iklim">İklim</strong><span data-i="ana.t.iklim"></span></a></li>
      <li><a href="yontem.html"><strong data-i="nav.yontem">Yöntem</strong><span data-i="ana.t.yontem"></span></a></li>
    </ul>
  </section>` });

sayfa({ dosya: 'gokyuzu.html', baslik: 'Gökyüzü · DAG Gökyüzü', aciklama: 'DAG’dan görünen gökyüzü ve önümüzdeki 24 saatin parlak uydu geçişleri.', aktif: 'gokyuzu', govde: `
  <section class="bolum ilk" aria-labelledby="gokBaslik">
    <h1 id="gokBaslik" class="sayfa-baslik" data-i="gokyuzu.baslik">DAG’dan görünen gökyüzü</h1>
    <p class="aciklama" data-i="gokyuzu.aciklama"></p>
    <div class="gok-izgara">
      <figure class="kubbe" id="kubbe">
        <canvas id="gokHarita" role="img" data-i-attr="aria-label:harita.etiket" aria-label="DAG’dan görünen gökyüzü haritası."></canvas>
        <div class="zaman">
          <label for="zaman" data-i="harita.zaman">Zaman</label>
          <input id="zaman" type="range" min="0" max="1440" step="1" value="0">
          <output id="zamanYazi" for="zaman"></output>
          <button type="button" id="simdiDugme" class="kucuk" data-i="harita.simdi">Şimdi</button>
        </div>
        <figcaption id="kaynak"></figcaption>
      </figure>
      <div class="gecis-kap">
        <h2 data-i="gecis.baslik">Önümüzdeki 24 saatte görülebilecek parlak nesneler</h2>
        <p class="aciklama" data-i="gecis.aciklama"></p>
        <div class="gecis-ust" aria-hidden="true"><span data-i="gecis.nesne">Nesne</span><span data-i="gecis.zaman">Saat</span><span data-i="gecis.zirve">Zirve</span><span data-i="gecis.yon">Yön</span></div>
        <ol id="gecisListe" class="gecis-liste"></ol>
        <p id="gecisBos" class="aciklama" hidden data-i="gecis.bos"></p>
      </div>
    </div>
  </section>` });

sayfa({ dosya: 'gece.html', baslik: 'Bu gece · DAG Gökyüzü', aciklama: 'DAG için bu gecenin karanlık saatleri, Ay evresi ve önümüzdeki 24 saatin gözlem koşulları.', aktif: 'gece', govde: `
  <section class="bolum ilk" aria-labelledby="geceBaslik">
    <h1 id="geceBaslik" class="sayfa-baslik" data-i="gece.baslik">Bu gece: karanlık, Ay ve hava</h1>
    <p id="geceOzet" class="ozet"></p>
    <div class="ay-izgara">
      <div id="ayKart" class="ay-kart"></div>
      <div class="cizelge-kap">
        <div id="geceCizelge"></div>
        <ul class="serit-anahtar cizelge-anahtar" aria-hidden="true"><li class="c-a-gunduz" data-i="an.gunduz">gündüz</li><li class="c-a-alaca" data-i="an.alaca">alacakaranlık</li><li class="c-a-karanlik" data-i="an.karanlik">astronomik karanlık</li><li class="c-a-ay" data-i="an.ay">Ay ufkun üstünde</li><li class="c-a-aysiz" data-i="an.aysiz">Ay’sız karanlık</li></ul>
        <ol id="olayListe" class="olay-liste"></ol>
      </div>
    </div>
    <p class="aciklama" data-i="gece.ay.aciklama"></p>
    <h2 data-i="hava.baslik">Önümüzdeki 24 saat: gözlem koşulları</h2>
    <p class="aciklama" data-i="hava.aciklama"></p>
    <div id="havaSerit"></div>
    <p id="havaOzet" class="ozet" aria-live="polite"></p>
    <ul class="serit-anahtar" aria-hidden="true"><li class="uygun" data-i="hava.uygun">uygun</li><li class="degil" data-i="hava.degil">uygun değil</li><li class="gunduz" data-i="hava.gunduz">gündüz</li><li class="ayli" data-i="hava.ay">Ay ufkun üstünde</li></ul>
    <h2 data-i="esik.baslik">Kullanılan eşikler</h2>
    <p class="aciklama" data-i="esik.aciklama"></p>
    <ul id="esikListe" class="esik-liste"></ul>
  </section>` });

sayfa({ dosya: 'iklim.html', baslik: 'İklim · DAG Gökyüzü', aciklama: 'DAG için 2015’ten bugüne saatlik gözlem koşulu analizi.', aktif: 'iklim', govde: `
  <section class="bolum ilk" aria-labelledby="iklimBaslik">
    <h1 id="iklimBaslik" class="sayfa-baslik" data-i="iklim.baslik">Yılın hangi saati açık? DAG, 2015’ten bugüne</h1>
    <p id="iklimOzet" class="ozet"></p>
    <div class="isi-kap"><div id="isi"></div></div>
    <div class="olcek"><span class="olcek-ad" data-i="iklim.olcek">uygun oranı</span><div id="olcek" class="olcek-ic"></div></div>
    <p class="aciklama" data-i="iklim.sinir"></p>
    <h2 data-i="olcum.baslik">Ölçümle karşılaştırma</h2>
    <p class="aciklama" data-i="olcum.aciklama"></p>
    <div class="grafik"><div id="karsilastirma"></div>
      <ul class="grafik-anahtar"><li class="a-olcum" data-i="olcum.olcum">Ölçüm</li><li class="a-model" data-i="olcum.model">Model</li></ul></div>
    <p class="devam"><a href="yontem.html" data-i="ayrinti">Yöntem, eşikler ve sınırlar</a></p>
  </section>` });

// yöntem sayfası: makale sözlük anahtarlarından üretilir (metin js/i18n.js içinde)
const bolumler = [['y.neden', 'y.neden.b'], ['y.gecis', 'y.gecis.b'], ['y.ay', 'y.ay.b'],['y.koord', 'y.koord.b'], ['y.iklim', 'y.iklim.b'], ['y.esik', 'y.esik.b'], ['y.duyarlilik', 'y.duyarlilik.b'], ['y.dogrulama', 'y.dogrulama.b']];
// Heavens-Above karşılaştırma tablosu: sayılar dogrulama/heavens-above-sonuc.json'dan (node araclar/heavens-above-kiyas.mjs --yaz)
const ha = JSON.parse(readFileSync(new URL('dogrulama/heavens-above-sonuc.json', kok), 'utf8'));
const haSatir = (tur) => { const o = ha.ozet[tur]; return `<tr><th scope="row" data-i="ha.${tur}"></th><td>${o.n}</td><td>${o.ortalamaMutlakSn.toFixed(1)}</td><td>${o.enBuyuk.toFixed(1)}</td><td>${o.altFarkEnBuyuk.toFixed(1)}°</td></tr>`; };
const haTablo = `  <h2 data-i="y.ha.b"></h2>
  <p data-i="y.ha"></p>
  <div class="tablo-kap"><table class="veri-tablo">
    <caption data-i="ha.baslik"></caption>
    <thead><tr><th scope="col" data-i="ha.olay"></th><th scope="col" data-i="ha.n"></th><th scope="col" data-i="ha.ort"></th><th scope="col" data-i="ha.max"></th><th scope="col" data-i="ha.alt"></th></tr></thead>
    <tbody>${['yukselis10', 'zirve', 'alcalis10', 'golgedenCikis', 'golgeyeGiris'].map(haSatir).join('')}</tbody>
  </table></div>
  <p data-i="y.ha2"></p>`;
const makale = `<article class="makale ilk">
  <h1 data-i="y.baslik"></h1>
  <p class="lead" data-i="y.giris"></p>
${bolumler.map(([p, h]) => `  <h2 data-i="${h}"></h2>\n  <p data-i="${p}"></p>` + (p === 'y.gecis' ? '\n' + haTablo : '')).join('\n')}
  <h2 data-i="y.kaynak.b"></h2>
  <ul><li data-i="y.kaynak1"></li><li data-i="y.kaynak2"></li><li data-i="y.kaynak3"></li><li data-i="y.kaynak4"></li><li data-i="y.kaynak5"></li></ul>
  <h2 data-i="y.yapilmadi.b"></h2>
  <p data-i="y.yapilmadi"></p>
</article>`;
sayfa({ dosya: 'yontem.html', baslik: 'Yöntem ve doğrulama · DAG Gökyüzü', aciklama: 'DAG Gökyüzü’ndeki sayıların nasıl üretildiği ve nereye kadar güvenilebileceği.', aktif: 'yontem', govde: '  ' + makale });
console.log('5 sayfa yazıldı');
