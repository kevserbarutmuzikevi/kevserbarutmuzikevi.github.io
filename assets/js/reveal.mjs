// Kaydırdıkça yumuşak giriş (.reveal → .is-visible).
// Ekranda zaten görünen öğeler beklemeden gösterilir; hareket azaltma
// tercihi CSS tarafında ele alınır.
export function initReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;

  const show = (el) => el.classList.add('is-visible');
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const pending = els.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > 0) { show(el); return false; }
    return true;
  });

  if (!('IntersectionObserver' in window)) { pending.forEach(show); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  pending.forEach((el) => io.observe(el));
}
