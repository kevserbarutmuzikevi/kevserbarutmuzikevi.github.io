// Üst menü: mobil aç/kapa, kaydırma gölgesi, aktif bölüm vurgusu.
export function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('ana-menu');
  if (!header || !toggle || !nav) return;

  const icon = toggle.querySelector('use');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    if (icon) icon.setAttribute('href', open ? '#icon-close' : '#icon-menu');
  };
  const isOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  // Masaüstü genişliğine dönülürse açık menüyü sıfırla
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Logo ve "Başa dön": uzun sayfada yumuşak kaydırma yavaş kalıyor → anında başa dön
  for (const a of document.querySelectorAll('a[href="#ust"]')) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = previous;
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Görünür bölüme göre menü linkini vurgula
  const links = [...nav.querySelectorAll('.nav__link[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links) a.classList.toggle('is-active', a.hash === `#${entry.target.id}`);
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => io.observe(s));
  }
}
