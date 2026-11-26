// Sayfaları üretir: index, gokyuzu, gece, iklim, yontem (.html). Çalıştır: node araclar/sayfalari-uret.mjs
// Ortak üst çubuk/alt bilgi tek yerde; çizim araclar/parcalar/sahne.html (araclar/sahne_uret.py üretir).
import { readFileSync, writeFileSync } from 'node:fs';
const kok = new URL('../', import.meta.url);
const sahne = readFileSync(new URL('araclar/parcalar/sahne.html', kok), 'utf8');
const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2302040a'/%3E%3Cpath d='M16 4l2.4 9.6L28 16l-9.6 2.4L16 28l-2.4-9.6L4 16l9.6-2.4z' fill='%23f4c56a'/%3E%3C/svg%3E";

const SEKME = { gokyuzu: ['gokyuzu.html', 'nav.gokyuzu', 'Gökyüzü'], gece: ['gece.html', 'nav.gece', 'Bu gece'], iklim: ['iklim.html', 'nav.iklim', 'İklim'], yontem: ['yontem.html', 'nav.yontem', 'Yöntem'] };
const sekme = (k, aktif) => `<a href="${SEKME[k][0]}" data-i="${SEKME[k][1]}"${aktif === k ? ' aria-current="page"' : ''}>${SEKME[k][2]}</a>`;

const ANA_DAG = '<h1 class="dag" id="baslik"><a href="./" aria-label="DAG, Doğu Anadolu Gözlemevi">DAG</a></h1>';
const IC_DAG = '<div class="dag"><a href="./" aria-label="DAG, Doğu Anadolu Gözlemevi, ana sayfa">DAG</a></div>';
const DIS = 'target="_blank" rel="noopener"';

function sayfa({ dosya, baslik, aciklama, aktif, govde, betik = 'js/ana.js', anaSayfa = false }) {
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
<script>document.documentElement.classList.add('js')</script>
<script type="importmap">{ "imports": { "satellite.js": "./vendor/satellite.js/index.js" } }</script>
</head>
<body class="sayfa-${dosya.replace('.html', '').replace('index', 'ana')}">
<div class="aurora" aria-hidden="true"></div>
<canvas id="yildizlar" aria-hidden="true"></canvas>
<a class="atla" href="#icerik" data-i="nav.atla">İçeriğe geç</a>
<header class="ust${anaSayfa ? '' : ' kompakt'}" id="ust">
  <div class="ust-ic">
    <nav class="menu menu-sol" aria-label="Sol gezinme">${sekme('gokyuzu', aktif)}${sekme('gece', aktif)}</nav>
    ${anaSayfa ? ANA_DAG : IC_DAG}
    <nav class="menu menu-sag" aria-label="Sağ gezinme">${sekme('iklim', aktif)}${sekme('yontem', aktif)}</nav>
    <button type="button" id="dilDugme" class="dil" aria-label="Switch to English">EN</button>
  </div>
</header>
<main id="icerik">
${govde}
</main>
<footer class="alt">
  <div class="alt-ic">
    <div class="alt-marka">
      <p class="alt-dag" aria-hidden="true">DAG</p>
      <p data-i="alt.not"></p>
      <p class="soluk" data-i="alt.yapan"></p>
    </div>
    <nav class="alt-kol" aria-labelledby="altGezin">
      <h2 id="altGezin" data-i="alt.gezin">Sayfalar</h2>
      <ul>${['gokyuzu', 'gece', 'iklim', 'yontem'].map((k) => `<li><a href="${SEKME[k][0]}" data-i="${SEKME[k][1]}">${SEKME[k][2]}</a></li>`).join('')}</ul>
    </nav>
    <div class="alt-kol">
      <h2 data-i="alt.veri">Veri ve kaynaklar</h2>
      <ul>
        <li><a href="https://celestrak.org" ${DIS}>CelesTrak</a></li>
        <li><a href="https://open-meteo.com" ${DIS}>Open-Meteo</a></li>
        <li><a href="https://github.com/shashwatak/satellite-js" ${DIS}>satellite.js</a></li>
        <li><a href="https://github.com/SametDuhan/dag-gokyuzu" ${DIS} data-i="alt.kod">Kaynak kod (GitHub)</a></li>
      </ul>
    </div>
  </div>
</footer>
<script type="module" src="${betik}"></script>
</body>
</html>
`;
  writeFileSync(new URL(dosya, kok), html);
}

// Alt sayfaların ortak başlığı: küçük üst etiket, büyük başlık, açıklama
const sayfaUst = (eyKey, eyTr, id, bKey, bTr, ek = '') =>
  `<div class="sayfa-ust gor">
      <p class="eyebrow" data-i="${eyKey}">${eyTr}</p>
      <h1 id="${id}" class="sayfa-baslik" data-i="${bKey}">${bTr}</h1>
${ek}
    </div>`;

sayfa({ dosya: 'index.html', baslik: 'DAG Gökyüzü', aciklama: 'Doğu Anadolu Gözlemevi (DAG) için canlı uydu geçişleri ve gözlem koşulu analizi.', anaSayfa: true, govde: `
  <section class="hero" aria-label="Giriş">
    <p class="etiket"><span class="canli" aria-hidden="true"></span><span data-i="hero.etiket">Doğu Anadolu Gözlemevi · Karakayatepe · 3170 m</span></p>
    <p class="slogan" data-i="slogan">Karakayatepe’nin gökyüzü: bu gece ve 2015’ten bugüne</p>
    <p class="lead" data-i="lead">Doğu Anadolu Gözlemevi için canlı uydu geçişleri ve gözlem koşulu analizi.</p>
    <div class="hero-dugmeler">
      <a class="dugme" href="gokyuzu.html" data-i="hero.ac">Gökyüzüne bak</a>
      <a class="dugme ikincil" href="yontem.html" data-i="hero.yontem">Yöntem ve doğrulama</a>
    </div>
    <figure class="sahne-kap">
      ${sahne}
      <figcaption data-i="sahne.not">Stilize illüstrasyon: Karakayatepe, 3170 m. Bina biçimi ve ölçüleri gerçeğe uygun değildir.</figcaption>
    </figure>
  </section>

  <section class="kartlar" aria-label="Özet">
    <ul class="bento">
      <li class="gor"><a class="kart kart-gecis" href="gokyuzu.html">
        <div class="kart-et"><span data-i="nav.gokyuzu">Gökyüzü</span><i class="ok" aria-hidden="true">→</i></div>
        <div class="kart-alt-et" data-i="hero.sonraki">Sıradaki görünür geçiş</div>
        <div id="sonraki" class="kart-deger" aria-live="polite"></div>
        <div class="kart-not" data-i="ana.t.gokyuzu"></div>
      </a></li>
      <li class="gor"><a class="kart kart-gece" href="gece.html">
        <div class="kart-et"><span data-i="nav.gece">Bu gece</span><i class="ok" aria-hidden="true">→</i></div>
        <div class="kart-orta">
          <svg id="ayMini" class="ay-mini" viewBox="-50 -50 100 100" aria-hidden="true"></svg>
          <div><div id="geceKart" class="kart-deger"></div><div id="geceAlt" class="kart-alt-et"></div></div>
        </div>
        <div class="kart-not" data-i="ana.t.gece"></div>
      </a></li>
      <li class="gor"><a class="kart kart-iklim" href="iklim.html">
        <div class="kart-et"><span data-i="nav.iklim">İklim</span><i class="ok" aria-hidden="true">→</i></div>
        <div class="kart-alt-et" data-i="k.iklim.et">En açık ay</div>
        <div id="iklimKart" class="kart-deger"></div>
        <div class="kart-alt-et" data-i="k.iklim.alt"></div>
        <div class="kart-not" data-i="ana.t.iklim"></div>
      </a></li>
      <li class="gor"><a class="kart kart-yontem" href="yontem.html">
        <div class="kart-et"><span data-i="nav.yontem">Yöntem</span><i class="ok" aria-hidden="true">→</i></div>
        <div class="kart-alt-et" data-i="k.dogr.et">Ölçümle uyum</div>
        <div class="kart-deger">r <span class="altin">0.86–0.88</span></div>
        <div class="kart-alt-et" data-i="k.dogr.alt"></div>
        <div class="kart-not" data-i="ana.t.yontem"></div>
      </a></li>
    </ul>
  </section>

  <section class="kanit" aria-labelledby="kanitB">
    <div class="gor">
      <p class="eyebrow" data-i="ey.yontem">Şeffaflık</p>
      <h2 id="kanitB" data-i="kanit.baslik">Sayılara ne kadar güvenilir?</h2>
      <p class="aciklama" data-i="kanit.aciklama"></p>
    </div>
    <ul class="kanit-liste">
      ${[1, 2, 3].map((n) => `<li class="panel gor"><p class="kanit-fig" data-i="kanit.${n}.f"></p><h3 data-i="kanit.${n}.b"></h3><p data-i="kanit.${n}"></p></li>`).join('\n      ')}
    </ul>
    <p class="devam gor"><a class="baglanti" href="yontem.html" data-i="ayrinti">Yöntem, eşikler ve sınırlar</a></p>
  </section>` });

sayfa({ dosya: 'gokyuzu.html', baslik: 'Gökyüzü · DAG Gökyüzü', aciklama: 'DAG’dan görünen gökyüzü ve önümüzdeki 24 saatin parlak uydu geçişleri.', aktif: 'gokyuzu', govde: `
  <section class="bolum" aria-labelledby="gokBaslik">
    ${sayfaUst('ey.gokyuzu', 'Canlı harita', 'gokBaslik', 'gokyuzu.baslik', 'DAG’dan görünen gökyüzü', '      <p class="aciklama" data-i="gokyuzu.aciklama"></p>')}
    <div class="gok-izgara">
      <figure class="kubbe panel gor" id="kubbe">
        <canvas id="gokHarita" role="img" data-i-attr="aria-label:harita.etiket" aria-label="DAG’dan görünen gökyüzü haritası."></canvas>
        <div class="zaman">
          <label for="zaman" data-i="harita.zaman">Zaman</label>
          <input id="zaman" type="range" min="0" max="1440" step="1" value="0">
          <output id="zamanYazi" for="zaman"></output>
          <button type="button" id="simdiDugme" class="kucuk" data-i="harita.simdi">Şimdi</button>
        </div>
        <figcaption id="kaynak"></figcaption>
      </figure>
      <div class="gecis-kap panel gor">
        <h2 data-i="gecis.baslik">Önümüzdeki 24 saatte görülebilecek parlak nesneler</h2>
        <p class="aciklama" data-i="gecis.aciklama"></p>
        <div class="gecis-ust" aria-hidden="true"><span data-i="gecis.nesne">Nesne</span><span data-i="gecis.zaman">Saat</span><span data-i="gecis.zirve">Zirve</span><span data-i="gecis.yon">Yön</span></div>
        <ol id="gecisListe" class="gecis-liste"></ol>
        <p id="gecisBos" class="aciklama" hidden data-i="gecis.bos"></p>
      </div>
    </div>
  </section>` });

sayfa({ dosya: 'gece.html', baslik: 'Bu gece · DAG Gökyüzü', aciklama: 'DAG için bu gecenin karanlık saatleri, Ay evresi ve önümüzdeki 24 saatin gözlem koşulları.', aktif: 'gece', govde: `
  <section class="bolum" aria-labelledby="geceBaslik">
    ${sayfaUst('ey.gece', 'Bu gece', 'geceBaslik', 'gece.baslik', 'Bu gece: karanlık, Ay ve hava', '      <p id="geceOzet" class="ozet"></p>')}
    <div class="gece-izgara">
      <div class="panel panel-ay gor">
        <h2 data-i="p.ay">Ay</h2>
        <div id="ayKart" class="ay-kart"></div>
        <p class="not" data-i="gece.ay.aciklama"></p>
      </div>
      <div class="panel panel-zaman gor">
        <h2 data-i="p.zaman">Gecenin çizelgesi</h2>
        <div id="geceCizelge"></div>
        <ul class="serit-anahtar cizelge-anahtar" aria-hidden="true"><li class="c-a-gunduz" data-i="an.gunduz">gündüz</li><li class="c-a-alaca" data-i="an.alaca">alacakaranlık</li><li class="c-a-karanlik" data-i="an.karanlik">astronomik karanlık</li><li class="c-a-ay" data-i="an.ay">Ay ufkun üstünde</li><li class="c-a-aysiz" data-i="an.aysiz">Ay’sız karanlık</li></ul>
        <ol id="olayListe" class="olay-liste"></ol>
      </div>
      <div class="panel panel-hava gor">
        <h2 data-i="hava.baslik">Önümüzdeki 24 saat: gözlem koşulları</h2>
        <p class="aciklama" data-i="hava.aciklama"></p>
        <div id="havaSerit"></div>
        <p id="havaOzet" class="ozet" aria-live="polite"></p>
        <ul class="serit-anahtar" aria-hidden="true"><li class="uygun" data-i="hava.uygun">uygun</li><li class="degil" data-i="hava.degil">uygun değil</li><li class="gunduz" data-i="hava.gunduz">gündüz</li><li class="ayli" data-i="hava.ay">Ay ufkun üstünde</li></ul>
      </div>
      <div class="panel panel-esik gor">
        <h2 data-i="esik.baslik">Kullanılan eşikler</h2>
        <p class="aciklama" data-i="esik.aciklama"></p>
        <ul id="esikListe" class="esik-liste"></ul>
      </div>
    </div>
  </section>` });

sayfa({ dosya: 'iklim.html', baslik: 'İklim · DAG Gökyüzü', aciklama: 'DAG için 2015’ten bugüne saatlik gözlem koşulu analizi.', aktif: 'iklim', govde: `
  <section class="bolum" aria-labelledby="iklimBaslik">
    ${sayfaUst('ey.iklim', '2015 – bugün', 'iklimBaslik', 'iklim.baslik', 'Yılın hangi saati açık? DAG, 2015’ten bugüne', '      <p id="iklimOzet" class="ozet"></p>')}
    <ul id="iklimStat" class="stats gor"></ul>
    <div class="panel gor">
      <div class="isi-kap"><div id="isi"></div></div>
      <div class="olcek"><span class="olcek-ad" data-i="iklim.olcek">uygun oranı</span><div id="olcek" class="olcek-ic"></div></div>
      <p class="not" data-i="iklim.sinir"></p>
    </div>
    <div class="panel olcum-panel gor">
      <div class="olcum-metin">
        <h2 data-i="olcum.baslik">Ölçümle karşılaştırma</h2>
        <p class="aciklama" data-i="olcum.aciklama"></p>
        <p class="devam"><a class="baglanti" href="yontem.html" data-i="ayrinti">Yöntem, eşikler ve sınırlar</a></p>
      </div>
      <div class="grafik"><div id="karsilastirma"></div>
        <ul class="grafik-anahtar"><li class="a-olcum" data-i="olcum.olcum">Ölçüm</li><li class="a-model" data-i="olcum.model">Model</li></ul></div>
    </div>
  </section>` });

// yöntem sayfası: makale sözlük anahtarlarından üretilir (metin js/i18n.js içinde)
const bolumler = [['y.neden', 'y.neden.b'], ['y.gecis', 'y.gecis.b'], ['y.ay', 'y.ay.b'], ['y.koord', 'y.koord.b'], ['y.iklim', 'y.iklim.b'], ['y.esik', 'y.esik.b'], ['y.duyarlilik', 'y.duyarlilik.b'], ['y.dogrulama', 'y.dogrulama.b']];
// Heavens-Above karşılaştırma tablosu: sayılar dogrulama/heavens-above-sonuc.json'dan (node araclar/heavens-above-kiyas.mjs --yaz)
const ha = JSON.parse(readFileSync(new URL('dogrulama/heavens-above-sonuc.json', kok), 'utf8'));
const haSatir = (tur) => { const o = ha.ozet[tur]; return `<tr><th scope="row" data-i="ha.${tur}"></th><td>${o.n}</td><td>${o.ortalamaMutlakSn.toFixed(1)}</td><td>${o.enBuyuk.toFixed(1)}</td><td>${o.altFarkEnBuyuk.toFixed(1)}°</td></tr>`; };
const haTablo = `  <h2 id="s-ha" data-i="y.ha.b"></h2>
  <p data-i="y.ha"></p>
  <div class="tablo-kap"><table class="veri-tablo">
    <caption data-i="ha.baslik"></caption>
    <thead><tr><th scope="col" data-i="ha.olay"></th><th scope="col" data-i="ha.n"></th><th scope="col" data-i="ha.ort"></th><th scope="col" data-i="ha.max"></th><th scope="col" data-i="ha.alt"></th></tr></thead>
    <tbody>${['yukselis10', 'zirve', 'alcalis10', 'golgedenCikis', 'golgeyeGiris'].map(haSatir).join('')}</tbody>
  </table></div>
  <p data-i="y.ha2"></p>`;
const sId = (h) => 's-' + h.replace(/^y\./, '').replace(/\.b$/, '');
// içindekiler: makaledeki h2 sırasıyla (uydu geçişlerinden sonra Heavens-Above bölümü)
const h2Sirasi = [...bolumler.slice(0, 2).map(([, h]) => h), 'y.ha.b', ...bolumler.slice(2).map(([, h]) => h), 'y.kaynak.b', 'y.yapilmadi.b'];
const icindekiler = `<nav class="icindekiler" aria-labelledby="icB"><h2 id="icB" data-i="y.icindekiler">İçindekiler</h2><ol>${h2Sirasi.map((h) => `<li><a href="#${sId(h)}" data-i="${h}"></a></li>`).join('')}</ol></nav>`;
const makale = `<div class="yontem-izgara">
  ${icindekiler}
  <article class="makale">
    ${sayfaUst('ey.yontem', 'Şeffaflık', 'yontemB', 'y.baslik', 'Yöntem ve doğrulama', '      <p class="lead" data-i="y.giris"></p>')}
${bolumler.map(([p, h]) => `  <h2 id="${sId(h)}" data-i="${h}"></h2>\n  <p data-i="${p}"></p>` + (p === 'y.gecis' ? '\n' + haTablo : '')).join('\n')}
  <h2 id="s-kaynak" data-i="y.kaynak.b"></h2>
  <ul><li data-i="y.kaynak1"></li><li data-i="y.kaynak2"></li><li data-i="y.kaynak3"></li><li data-i="y.kaynak4"></li><li data-i="y.kaynak5"></li></ul>
  <h2 id="s-yapilmadi" data-i="y.yapilmadi.b"></h2>
  <p data-i="y.yapilmadi"></p>
  </article>
</div>`;
sayfa({ dosya: 'yontem.html', baslik: 'Yöntem ve doğrulama · DAG Gökyüzü', aciklama: 'DAG Gökyüzü’ndeki sayıların nasıl üretildiği ve nereye kadar güvenilebileceği.', aktif: 'yontem', govde: '  ' + makale });
console.log('5 sayfa yazıldı');
