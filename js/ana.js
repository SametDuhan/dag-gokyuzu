// Her sayfa bu betiği yükler; yalnız o sayfada bulunan öğeler için çalışır.
import { t, dilKur, ilkDil, getDil } from './i18n.js';
import { yildizlariBaslat } from './yildiz.js';
import { tleYukle, gecisleriHesapla, gozlemci } from './gecisler.js';
import { geceOzeti } from '../src/gece.js';
import { ozetYaz, ayKartCiz, cizelgeCiz, olaylarCiz, ayYolu, sureYazSa } from './ay-gorsel.js';
import { gokyuzuKur } from './gokyuzu.js';
import { havaYukle, saatleriHazirla, seritCiz, esikleriCiz } from './hava.js';
import { iklimYukle, isiCiz, olcekCiz, karsilastirmaCiz, enIyiEnKotu, ozetKartlariCiz } from './iklim-gorsel.js';
import { efektleriKur } from './efekt.js';
import { yerleskeYukle, resmiKiyasCiz, yerleskeGrafikCiz, yerleskeTabloCiz } from './yerleske-gorsel.js';
import { gezegenGecesi } from '../src/gezegen-gorunum.js';
import { gezegenTabloCiz } from './gezegen-gorsel.js';
import { kosulYukle, kpYukle, kosulCiz, katmanCiz } from './kosul.js';
import { gozlemTakvimi } from '../src/takvim.js';
import { takvimCiz } from './takvim-gorsel.js';
import { saatYaz, yonYaz, sureYaz, TZ } from './yardimci.js';

const $ = (s) => document.querySelector(s);
const durum = { baslangic: new Date(), gecisler: [], sats: [], secili: null, tle: null, hava: null, iklim: null, hazir: false };
const harita = $('#gokHarita') ? gokyuzuKur($('#gokHarita')) : null;
const cubuk = $('#zaman');

yildizlariBaslat($('#yildizlar'));
efektleriKur();
if (matchMedia('(prefers-reduced-motion: reduce)').matches) $('#sahne')?.pauseAnimations?.();

// ---- dil ----
function dilDugmesi() {
  const d = $('#dilDugme'); d.textContent = getDil() === 'tr' ? 'EN' : 'TR';
  d.setAttribute('aria-label', getDil() === 'tr' ? 'Switch to English' : 'Türkçeye geç');
}
$('#dilDugme').addEventListener('click', () => dilKur(getDil() === 'tr' ? 'en' : 'tr'));

// ---- zaman çubuğu (gökyüzü sayfası) ----
function zamanGuncelle() {
  if (!cubuk) return;
  const z = new Date(durum.baslangic.getTime() + Number(cubuk.value) * 60e3);
  $('#zamanYazi').textContent = saatYaz(z);
  harita.guncelle({ zaman: z });
}
if (cubuk) { cubuk.addEventListener('input', zamanGuncelle); $('#simdiDugme').addEventListener('click', () => { cubuk.value = 0; zamanGuncelle(); }); }

// ---- geçiş listesi ----
function listeCiz() {
  const ol = $('#gecisListe'); if (!ol) return; ol.replaceChildren();
  $('#gecisBos').hidden = durum.gecisler.length > 0 || !durum.hazir;
  for (const g of durum.gecisler.slice(0, 12)) {
    const ad = g.ad.replace(/\s*\(.*$/, '');
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'gecis' + (g === durum.secili ? ' secili' : ''); b.setAttribute('aria-pressed', String(g === durum.secili));
    b.setAttribute('aria-label', t('gecis.ac', { ad }));
    b.innerHTML = `<span class="g-ad">${ad}</span><span class="g-saat">${saatYaz(g.dogus)}–${saatYaz(g.batis)}</span><span class="g-zirve">${Math.round(g.zirveYukseklik)}°</span><span class="g-yon">${yonYaz(g.dogusAzimut)} → ${yonYaz(g.batisAzimut)}</span><span class="g-sure">${sureYaz(g.sureSn)}</span>`;
    b.addEventListener('click', () => sec(g, true)); li.append(b); ol.append(li);
  }
}
function sec(g, kaydir) {
  durum.secili = g; listeCiz();
  const dk = Math.max(0, Math.min(1440, Math.round((g.zirveZaman - durum.baslangic) / 60e3)));
  cubuk.value = dk; harita.guncelle({ secili: g }); zamanGuncelle();
  if (kaydir && innerWidth < 992) $('#kubbe').scrollIntoView({ behavior: 'auto', block: 'center' });
}
function sonrakiCiz() {
  const kap = $('#sonraki'); if (!kap) return;
  const g = durum.gecisler[0];
  if (!durum.hazir) { kap.textContent = t('harita.yukleniyor'); kap.classList.add('bekle'); return; }
  kap.classList.remove('bekle');
  if (!g) { kap.textContent = t('hero.yok'); return; }
  kap.innerHTML = `<strong>${g.ad.replace(/\s*\(.*$/, '')}</strong><span class="s-d">${saatYaz(g.dogus)} · ${t('hero.zirve')} ${Math.round(g.zirveYukseklik)}° · ${yonYaz(g.dogusAzimut)} → ${yonYaz(g.batisAzimut)}</span>`;
}
function kaynakYazi() {
  const el = $('#kaynak'); if (!el) return; if (!durum.tle) { el.textContent = ''; return; }
  const { tur, tarih } = durum.tle;
  const zaman = tarih && !isNaN(tarih) ? new Intl.DateTimeFormat(getDil() === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(tarih) : '?';
  el.textContent = t('harita.' + tur, { n: durum.sats.length, tarih: zaman });
}

// ---- Ay ve karanlık (bu gece sayfası) ----
let geceOz = null, gezegenler = null;
function geceCiz() {
  if (!$('#ayKart')) return;
  geceOz ??= geceOzeti(new Date(), gozlemci);
  ozetYaz($('#geceOzet'), geceOz); ayKartCiz($('#ayKart'), geceOz); cizelgeCiz($('#geceCizelge'), geceOz); olaylarCiz($('#olayListe'), geceOz);
  gezegenler ??= gezegenGecesi(geceOz, gozlemci); gezegenTabloCiz($('#gezegenTablo'), gezegenler); takvimGuncelle();
}

// ---- şimdiki koşullar ve 30 gecelik takvim (bu gece sayfası) ----
function kosulKutuCiz() {
  const kap = $('#kosulKutular'); if (!kap) return;
  if (!durum.kosul) return;
  if (durum.kosul === 'yok') { kap.innerHTML = `<li class="stat-yok">${t('kos.yok')}</li>`; $('#katmanlar').replaceChildren(); return; }
  kosulCiz(kap, durum.kosul, durum.kp === 'yok' ? null : durum.kp); katmanCiz($('#katmanlar'), durum.kosul);
}
let takvimListe = null;
function takvimGuncelle() {
  if (!$('#takvim')) return;
  takvimListe ??= gozlemTakvimi(gozlemci);
  takvimCiz(takvimListe, $('#takvim'), $('#takvimOzet'));
}

// ---- ana sayfa kartı: bu gece ----
function anaKartlar() {
  if (!$('#ayMini')) return;
  geceOz ??= geceOzeti(new Date(), gozlemci);
  const { aydinlik, buyuyen, ad } = geceOz.ay, r = 40;
  $('#ayMini').innerHTML = `<circle r="46" class="ay-hale"/><circle r="${r}" class="ay-karanlik"/><path d="${ayYolu(aydinlik, buyuyen, r)}" class="ay-aydinlik"/>`;
  $('#geceKart').textContent = sureYazSa(geceOz.karanlikDk);
  const aysiz = geceOz.aysizDk > 0 ? t('k.aysiz', { sure: sureYazSa(geceOz.aysizDk) }) : t('k.aysizYok');
  $('#geceAlt').innerHTML = `${t('k.gece.sure')}<br>${aysiz} · ${t('ay.evre.' + ad)}, ${t('ay.yuzde', { v: Math.round(aydinlik * 100) })}`;
}

if ($('#geceCizelge')) {
  let sonGenislik = 0;
  new ResizeObserver(([g]) => { const w = Math.round(g.contentRect.width); if (geceOz && Math.abs(w - sonGenislik) > 8) { sonGenislik = w; cizelgeCiz($('#geceCizelge'), geceOz); } }).observe($('#geceCizelge'));
}

// ---- hava (bu gece sayfası) ----
function havaCiz() {
  const kap = $('#havaSerit'), oz = $('#havaOzet'); if (!kap) return;
  esikleriCiz($('#esikListe'));
  if (!durum.hava) return;
  if (durum.hava === 'yok') { kap.replaceChildren(); oz.textContent = t('hava.yuk'); return; }
  const saatler = saatleriHazirla(durum.hava); seritCiz(kap, saatler);
  const uygun = saatler.filter((s) => s.uygun), n = uygun.length, m = uygun.filter((s) => s.ayUstte).length;
  oz.textContent = !n ? t('hava.ozetSifir') : m ? t('hava.ozetAy', { n, m }) : t('hava.ozet', { n });
}

// ---- iklim sayfası ----
function iklimCiz() {
  const v = durum.iklim; if (!v) return;
  const { en, az, enV, azV } = enIyiEnKotu(v);
  if ($('#iklimKart')) $('#iklimKart').innerHTML = `${t('ay.' + en)} <span class="altin">${t('yuzde', { v: enV })}</span>`;
  if (!$('#isi')) return;
  $('#iklimOzet').textContent = t('iklim.ozet', { en: t('ay.' + en), az: t('ay.' + az), enV, azV });
  ozetKartlariCiz($('#iklimStat'), v); isiCiz($('#isi'), v); olcekCiz($('#olcek')); karsilastirmaCiz($('#karsilastirma'), v);
}

function yerleskeCiz() {
  const v = durum.yerleske; if (!v || !$('#resmiTablo')) return;
  $('#resmiNot').textContent = resmiKiyasCiz($('#resmiTablo'), v);
  yerleskeGrafikCiz($('#yerleskeGrafik'), v); yerleskeTabloCiz($('#yerleskeTablo'), v);
}

document.addEventListener('dilDegisti', () => { dilDugmesi(); listeCiz(); sonrakiCiz(); kaynakYazi(); zamanGuncelle(); geceCiz(); anaKartlar(); havaCiz(); iklimCiz(); yerleskeCiz(); kosulKutuCiz(); });
dilKur(ilkDil());

// ---- veri akışı: yalnız ilgili sayfada ----
(async () => {
  if ($('#isi') || $('#iklimKart')) iklimYukle().then((v) => { durum.iklim = v; iklimCiz(); }).catch(() => {});
  if ($('#resmiTablo')) yerleskeYukle().then((v) => { durum.yerleske = v; yerleskeCiz(); }).catch(() => {});
  if ($('#havaSerit')) { havaCiz(); havaYukle().then((h) => { durum.hava = h; havaCiz(); }).catch(() => { durum.hava = 'yok'; havaCiz(); }); }
  if ($('#kosulKutular')) {
    kpYukle().then((k) => { durum.kp = k; kosulKutuCiz(); }).catch(() => { durum.kp = 'yok'; kosulKutuCiz(); });
    kosulYukle().then((v) => { durum.kosul = v; kosulKutuCiz(); }).catch(() => { durum.kosul = 'yok'; kosulKutuCiz(); });
  }
  if (!harita && !$('#sonraki')) return;
  sonrakiCiz();
  const tle = await tleYukle(); durum.tle = tle; durum.sats = tle.sats; kaynakYazi();
  harita?.guncelle({ sats: tle.sats });
  const bit = new Date(durum.baslangic.getTime() + 24 * 3600e3);
  durum.gecisler = await gecisleriHesapla(tle.sats, durum.baslangic, bit);
  durum.hazir = true;
  harita?.guncelle({ gecisler: durum.gecisler });
  durum.secili = durum.gecisler[0] ?? null; harita?.guncelle({ secili: durum.secili });
  listeCiz(); sonrakiCiz(); zamanGuncelle();
})();
