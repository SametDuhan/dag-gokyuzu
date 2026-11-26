// "Bu gece" sayfası: gezegen tablosu. Hesap src/gezegen-gorunum.js içinde.
import { t } from './i18n.js';
import { saatYaz, yonYaz } from './yardimci.js';

const kadirYaz = (k) => (k > 0 ? '+' : k < 0 ? '−' : '') + Math.abs(k).toFixed(1);

export function gezegenTabloCiz(kap, liste) {
  const satir = (g) => {
    const ad = t('gez.' + g.ad);
    if (!g.gorunur) return `<tr class="gez-yok"><th scope="row">${ad}</th><td colspan="4">${t('gez.yok')}</td></tr>`;
    const z = g.zirve, teleskop = z.kadir > 5.5;
    return `<tr><th scope="row"><span class="gez-nokta gez-${g.ad}" aria-hidden="true"></span>${ad}</th>
      <td>${saatYaz(g.bas)}–${saatYaz(g.bit)}</td><td>${Math.round(z.yukseklik)}° · ${yonYaz(z.azimut)} · ${saatYaz(z.zaman)}</td>
      <td>${kadirYaz(z.kadir)}</td><td>${t(teleskop ? 'gez.tel' : 'gez.goz')}</td></tr>`;
  };
  kap.innerHTML = `<table class="veri-tablo gez-tablo"><caption class="gor-sadece-okuyucu">${t('gez.baslik')}</caption>
    <thead><tr><th scope="col">${t('gez.ad')}</th><th scope="col">${t('gez.saat')}</th><th scope="col">${t('gez.zirve')}</th><th scope="col">${t('gez.kadir')}</th><th scope="col">${t('gez.nasil')}</th></tr></thead>
    <tbody>${liste.map(satir).join('')}</tbody></table>`;
}
