// gallery.json doğrulayıcısı — saf fonksiyonlar; tarayıcıda ve Node testlerinde çalışır.
// Amaç: yalnızca media/ altındaki dosyalar ve geçerli video kimlikleri kabul edilir;
// dış URL, data: veya yol atlama (..) içeren girdiler sessizce atlanır.

const TYPES = new Set(['image', 'youtube', 'vimeo', 'video']);
const MEDIA_PATH = /^media\/[A-Za-z0-9_\-./]+$/;
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^[0-9]{6,12}$/;

export function mediaPathOk(p) {
  return typeof p === 'string' && MEDIA_PATH.test(p) && !p.includes('..') && !p.includes('//');
}

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const dim = (v) => (Number.isFinite(v) && v > 0 ? Math.round(v) : null);

/**
 * @returns {{ items: object[], warnings: string[] }}
 * items: normalize edilmiş öğeler (image | youtube | vimeo | video)
 * warnings: atlanan öğeler için açıklamalar (konsola yazılır)
 */
export function validateGalleryItems(raw) {
  const items = [];
  const warnings = [];
  if (!Array.isArray(raw)) return { items, warnings: ['gallery.json bir dizi ([...]) olmalı'] };

  raw.forEach((it, i) => {
    const warn = (msg) => warnings.push(`öğe ${i}: ${msg}`);
    if (!it || typeof it !== 'object') return warn('nesne değil');
    if (it.enabled === false) return warn('devre dışı (enabled: false)');
    if (!TYPES.has(it.type)) return warn(`bilinmeyen type "${it.type}"`);

    const featured = it.featured === true;
    let poster = null;
    if (it.poster != null) {
      if (!mediaPathOk(it.poster)) return warn('poster yolu geçersiz (media/ altında olmalı)');
      poster = it.poster;
    }

    if (it.type === 'image') {
      if (!mediaPathOk(it.src)) return warn('src yolu geçersiz (media/ altında olmalı)');
      if (typeof it.alt !== 'string') return warn('alt metni gerekli (dekoratifse "" verin)');
      const w = dim(it.width);
      const h = dim(it.height);
      items.push({
        type: 'image', src: it.src, alt: str(it.alt), caption: str(it.caption),
        width: w && h ? w : 4, height: w && h ? h : 3, featured,
      });
      return;
    }

    if (it.type === 'youtube' || it.type === 'vimeo') {
      const id = typeof it.id === 'string' ? it.id : '';
      const ok = it.type === 'youtube' ? YT_ID.test(id) : VIMEO_ID.test(id);
      if (!ok) return warn(`${it.type} id geçersiz`);
      items.push({ type: it.type, id, title: str(it.title) || 'Video', poster, featured });
      return;
    }

    if (!mediaPathOk(it.src)) return warn('video src yolu geçersiz (media/ altında olmalı)');
    items.push({ type: 'video', src: it.src, poster, title: str(it.title) || 'Video', featured });
  });

  return { items, warnings };
}
