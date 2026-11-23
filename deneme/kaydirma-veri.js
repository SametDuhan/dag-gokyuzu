// Kaydırmalı girişin canlı katmanı: bu gecenin karanlık/Ay bilgisi ve sıradaki parlak uydu geçişinin gökteki yolu.
// Hesaplar sitenin kendi çekirdeğinden (src/, js/gecisler.js); burada yalnız yazı ve çizim var.
import { t } from '../js/i18n.js';
import { saatYaz, yonYaz, TZ } from '../js/yardimci.js';
import { sureYazSa } from '../js/ay-gorsel.js';
import { tleYukle, gecisleriHesapla, gozlemci } from '../js/gecisler.js';
import { geceOzeti } from '../src/gece.js';
import { anlikGorunum } from '../src/gecis.js';

const $ = (s) => document.getElementById(s);
const kis = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const adTemiz = (ad) => ad.replace(/\s*\(.*$/, '').trim();
const gunYaz = (d) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', timeZone: TZ }).format(d);
const ayniGece = (a, b) => Math.abs(a - b) < 18 * 3600e3;

// İz çiziminin kaydırma aralığı (HTML'deki "Bu gece geçecek" sahnesiyle eş)
const IZ = { gorun: [0.72, 0.76], ciz: [0.75, 0.88], kaybol: [0.97, 1] };

export function veriBaslat() {
  const simdi = new Date();
  let iz = null; // { ad, noktalar: [{ zaman, az, el, isik }], merkezAz }

  // ---- bu gece: karanlık ve Ay (anında, ağ gerekmez)
  try {
    const oz = geceOzeti(simdi, gozlemci);
    const k = oz.karanlik;
    $('vKaranlik').textContent = k.length ? `${saatYaz(k[0].bas)} – ${saatYaz(k.at(-1).bit)}` : 'astronomik karanlık yok';
    $('vAy').textContent = `%${Math.round(oz.ay.aydinlik * 100)} aydınlık`;
    $('vAyAd').textContent = t('ay.evre.' + oz.ay.ad);
    $('vAysiz').textContent = oz.aysizDk > 0 ? sureYazSa(oz.aysizDk) : 'yok';
    $('geceNot').textContent = (oz.aysizDk > 0 ? '' : 'Bu gece Ay, karanlık boyunca ufkun üstünde. ') + 'DAG koordinatları için şu an hesaplandı.';
  } catch {
    $('geceVeri').hidden = true;
  }

  // ---- sıradaki parlak geçiş (TLE indirilip ~150 uydu taranır, birkaç saniye sürer)
  (async () => {
    const tle = await tleYukle('../');
    if (!tle.sats.length) { $('izMetin').textContent = 'Uydu verisi alınamadı.'; return; }
    const gecisler = await gecisleriHesapla(tle.sats, simdi, new Date(simdi.getTime() + 24 * 3600e3));
    // Şu an sürmekte olan geçiş, yolunun çoğu geride kaldığı için gösterilmez; sıradaki seçilir.
    const g = gecisler.find((x) => x.dogus.getTime() > simdi.getTime() + 60e3) ?? gecisler[0];
    if (!g) { $('izBaslik').textContent = 'Bu gece parlak geçiş yok'; $('izMetin').textContent = 'Önümüzdeki 24 saatte gözle kolayca görülecek bir uydu geçişi bulunamadı.'; return; }
    // Aynı adı taşıyan birden çok kayıt olabilir (ör. "SL-8 R/B" roket gövdeleri): zirvesi tutan seçilir.
    const zirveFarki = (s) => Math.abs((anlikGorunum(s.satrec, g.zirveZaman, gozlemci)?.yukseklik ?? -90) - g.zirveYukseklik);
    const satrec = tle.sats.filter((s) => s.ad === g.ad).sort((a, b) => zirveFarki(a) - zirveFarki(b))[0].satrec;
    const noktalar = [];
    for (let z = g.dogus.getTime(); z <= g.batis.getTime(); z += 5000) {
      const v = anlikGorunum(satrec, new Date(z), gozlemci, { gunesBilgisi: true });
      if (v) noktalar.push({ zaman: new Date(z), az: v.azimut, el: Math.max(0, v.yukseklik), isik: v.uyduGunesAliyor && v.gunesYuksekligi < -6 });
    }
    const ad = adTemiz(g.ad);
    iz = { ad, noktalar, merkezAz: g.zirveAzimut };
    const gorunen = noktalar.filter((n) => n.isik);
    const ilk = gorunen[0] ?? noktalar[0], son = gorunen.at(-1) ?? noktalar.at(-1);
    const ne = ayniGece(g.dogus, simdi) ? 'Bu gece' : gunYaz(g.dogus);
    $('izBaslik').textContent = `${ne} geçecek: ${ad}`;
    $('izMetin').textContent = `${saatYaz(ilk.zaman)}’de ${yonYaz(ilk.az)} yönünde belirir, ${Math.round(Math.max(...(gorunen.length ? gorunen : noktalar).map((n) => n.el)))}° yükselir, ${saatYaz(son.zaman)}’de ${yonYaz(son.az)} yönünde ${son === noktalar.at(-1) ? 'ufukta kaybolur' : 'Dünya’nın gölgesine girip söner'}.`;
    $('izNot').textContent = 'Yol şematiktir: yatay eksen yön, düşey eksen ufuktan yükseklik. Arka plan gerçek gökyüzü değildir.';
    window.dispatchEvent(new Event('scroll')); // çizimi tazele
  })().catch(() => { $('izMetin').textContent = 'Uydu geçişleri hesaplanamadı.'; });

  // ---- iz çizimi: kaydırmaya göre ilerler; o noktadaki saat de yazılır
  const tuval = $('izTuval'), ctx = tuval?.getContext('2d');
  function izCiz(tIlerleme) {
    if (!ctx) return;
    const gor = Math.min(kis(...IZ.gorun, tIlerleme), 1 - kis(...IZ.kaybol, tIlerleme));
    tuval.style.opacity = gor;
    if (gor <= 0 || !iz) return;
    const o = Math.min(devicePixelRatio || 1, 2);
    const W = Math.round(tuval.clientWidth * o), H = Math.round(tuval.clientHeight * o);
    if (tuval.width !== W || tuval.height !== H) { tuval.width = W; tuval.height = H; }
    ctx.clearRect(0, 0, W, H);

    const dar = W / o < 640;
    const ufukY = H * (dar ? 0.62 : 0.84), tepeY = H * (dar ? 0.14 : 0.12), yari = 105; // ±105° yatayda
    // Geniş ekranda yazı sağda durduğu için yol sola kaydırılır.
    const ortaX = dar ? W / 2 : W * 0.36, genis = dar ? W * 0.47 : W * 0.34;
    const x = (az) => ortaX + ((((az - iz.merkezAz) % 360) + 540) % 360 - 180) / yari * genis;
    const y = (el) => ufukY - (el / 90) * (ufukY - tepeY);
    const yazi = (px) => `${px * o}px "JetBrains Mono", ui-monospace, monospace`;

    // ufuk, yükseklik çizgileri, yön harfleri
    ctx.lineWidth = o;
    ctx.strokeStyle = 'rgba(188, 199, 227, 0.45)';
    ctx.beginPath(); ctx.moveTo(0, ufukY); ctx.lineTo(W, ufukY); ctx.stroke();
    ctx.setLineDash([3 * o, 6 * o]); ctx.strokeStyle = 'rgba(188, 199, 227, 0.18)';
    ctx.fillStyle = 'rgba(188, 199, 227, 0.6)'; ctx.font = yazi(11); ctx.textBaseline = 'bottom';
    for (const el of [30, 60]) { ctx.beginPath(); ctx.moveTo(0, y(el)); ctx.lineTo(W, y(el)); ctx.stroke(); ctx.fillText(`${el}°`, 8 * o, y(el) - 3 * o); }
    ctx.setLineDash([]);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let az = 0; az < 360; az += 45) { const px = x(az); if (px > 12 * o && px < W - 12 * o) ctx.fillText(yonYaz(az), px, ufukY + 6 * o); }

    // yol: kaydırma ilerledikçe uzar; Güneş ışığı alan kısım altın, gölgedeki kısım soluk kesikli
    const n = iz.noktalar;
    if (n.length < 2) return; // geçiş şu an bitmek üzereyse çizilecek yol yok
    // Geçişin tamamı soluk kesikli çizilir; kaydırma yalnız gözle görünen kısmı (uydu aydınlık, gök karanlık) altınla doldurur.
    ctx.lineCap = 'round';
    ctx.setLineDash([2 * o, 5 * o]); ctx.strokeStyle = 'rgba(188, 199, 227, 0.3)'; ctx.lineWidth = 1.5 * o;
    ctx.beginPath(); n.forEach((a, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, x(a.az), y(a.el))); ctx.stroke();
    ctx.setLineDash([]);
    let i0 = n.findIndex((a) => a.isik), i1 = n.findLastIndex((a) => a.isik);
    if (i0 < 0) { i0 = 0; i1 = n.length - 1; }
    const son = i0 + Math.round(kis(...IZ.ciz, tIlerleme) * (i1 - i0));
    ctx.strokeStyle = 'rgba(244, 197, 106, 0.95)'; ctx.lineWidth = 2.5 * o;
    ctx.beginPath(); for (let i = i0; i <= son; i++) (i > i0 ? ctx.lineTo : ctx.moveTo).call(ctx, x(n[i].az), y(n[i].el)); ctx.stroke();
    const bas = n[son];
    ctx.fillStyle = bas.isik ? '#f4c56a' : '#94a3ca';
    ctx.beginPath(); ctx.arc(x(bas.az), y(bas.el), 4.5 * o, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(242, 245, 255, 0.8)'; ctx.lineWidth = o;
    ctx.beginPath(); ctx.arc(x(bas.az), y(bas.el), 9 * o, 0, Math.PI * 2); ctx.stroke();

    // baştaki etiket: ad, o anın saati ve yüksekliği
    const etiket = `${iz.ad}  ${saatYaz(bas.zaman)}  ${Math.round(bas.el)}°${bas.isik ? '' : '  gölgede'}`;
    ctx.font = yazi(12); ctx.textBaseline = 'bottom';
    // etiket kutusu: noktanın sağına sığıyorsa sağa, yoksa soluna; her durumda ekran içinde
    const gen = ctx.measureText(etiket).width, px = x(bas.az);
    let kx = px + 14 * o;
    if (kx + gen + 8 * o > W) kx = px - 14 * o - gen;
    kx = Math.max(4 * o, Math.min(W - gen - 8 * o, kx));
    const ey = y(bas.el) - 10 * o;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(2, 4, 10, 0.75)';
    ctx.fillRect(kx - 4 * o, ey - 17 * o, gen + 8 * o, 20 * o);
    ctx.fillStyle = '#f2f5ff';
    ctx.fillText(etiket, kx, ey);
  }

  return { izCiz };
}
