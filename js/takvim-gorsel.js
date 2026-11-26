// "Bu gece" sayfası: 30 gecelik takvim. Hesap src/takvim.js içinde.
import { t, getDil } from './i18n.js';
import { TZ } from './yardimci.js';
import { ayYolu, sureYazSa } from './ay-gorsel.js';

export function takvimCiz(liste, ol, ozet) {
  const tr = getDil() === 'tr', yerel = tr ? 'tr-TR' : 'en-GB';
  // Gecenin tarihi: öğleden öğleye pencerenin başlangıcı (yerel öğle), yani o akşamın tarihi.
  const gun = (d) => new Intl.DateTimeFormat(yerel, { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).format(new Date(d.getTime() + 6 * 3600e3));
  const enUzun = Math.max(...liste.map((g) => g.karanlikDk));
  const enAysiz = Math.max(...liste.map((g) => g.aysizDk)), eniyiler = liste.filter((g) => g.aysizDk >= enAysiz - 10); // 10 dk içindekiler aynı sayılır
  const ilkEn = eniyiler[0], sonEn = eniyiler[eniyiler.length - 1];
  ozet.textContent = t('tak.en', { tarih: ilkEn === sonEn ? gun(ilkEn.bas) : `${gun(ilkEn.bas)} – ${gun(sonEn.bas)}`, sure: sureYazSa(enAysiz) });
  ol.replaceChildren(...liste.map((g, i) => {
    const li = document.createElement('li'); li.className = 'tak-satir' + (eniyiler.includes(g) ? ' en-iyi' : '') + (i === 0 ? ' bugun' : '');
    const yuzde = Math.round(g.ay.aydinlik * 100);
    li.innerHTML = `<span class="tak-gun">${gun(g.bas)}${i === 0 ? ` <em>${t('tak.bugun')}</em>` : ''}</span>
      <svg class="tak-ay" viewBox="-12 -12 24 24" role="img" aria-label="${t('ay.evre.' + g.ay.ad)}, ${t('ay.yuzde', { v: yuzde })}"><circle r="10" class="ay-karanlik"/><path d="${ayYolu(g.ay.aydinlik, g.ay.buyuyen, 10)}" class="ay-aydinlik"/></svg>
      <span class="tak-cubuk" aria-hidden="true"><i class="tak-karanlik" style="width:${(100 * g.karanlikDk) / enUzun}%"></i><i class="tak-aysiz" style="width:${(100 * g.aysizDk) / enUzun}%"></i></span>
      <span class="tak-sure">${g.aysizDk ? sureYazSa(g.aysizDk) : '—'}</span>`;
    return li;
  }));
}
