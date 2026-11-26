// Üst çubuk (ana sayfada kaydırınca küçülür) ve içeriğin kaydırınca belirmesi.
// Hareket azaltma açıksa ya da IntersectionObserver yoksa her şey baştan görünür.
export function efektleriKur() {
  const ust = document.getElementById('ust');
  if (ust && document.body.classList.contains('sayfa-ana')) {
    const durumla = () => ust.classList.toggle('kompakt', scrollY > 60);
    durumla(); addEventListener('scroll', durumla, { passive: true });
  }
  const sahne = document.getElementById('sahne');
  if (sahne && 'IntersectionObserver' in window) new IntersectionObserver(([k]) => sahne.classList.toggle('dur', !k.isIntersecting)).observe(sahne);
  const ogeler = document.querySelectorAll('.gor');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const e of ogeler) e.classList.add('gorundu');
    return;
  }
  const gozlem = new IntersectionObserver((kayitlar) => {
    for (const k of kayitlar) if (k.isIntersecting) { k.target.classList.add('gorundu'); gozlem.unobserve(k.target); }
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  for (const e of ogeler) gozlem.observe(e);
}
