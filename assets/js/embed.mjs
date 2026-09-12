// Tıkla-yükle gömme (facade) mantığı: sayfa açılırken hiçbir üçüncü taraf
// kaynak yüklenmez; kullanıcı tıklayınca oynatıcı/harita iframe'i oluşturulur.
// URL'ler yalnızca doğrulanmış kimliklerden üretilir; JSON'dan asla ham URL alınmaz.

export function buildEmbedUrl(item) {
  if (item.type === 'youtube') return `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0`;
  if (item.type === 'vimeo') return `https://player.vimeo.com/video/${item.id}?autoplay=1&dnt=1`;
  throw new Error('embed url yalnızca youtube/vimeo için üretilir');
}

/** Kapsayıcının içeriğini gerçek oynatıcıyla değiştirir; oluşturulan öğeyi döndürür. */
export function activateEmbed(container, item) {
  container.textContent = '';
  container.classList.add('is-active');

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.autoplay = true;
    if (item.poster) video.poster = item.poster;
    const source = document.createElement('source');
    source.src = item.src;
    source.type = 'video/mp4';
    video.append(source);
    container.append(video);
    return video;
  }

  const frame = document.createElement('iframe');
  frame.src = buildEmbedUrl(item);
  frame.title = item.title;
  frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.setAttribute('allowfullscreen', '');
  container.append(frame);
  return frame;
}

// Harita sorgusu: "enlem,boylam" ya da düz adres metni (harf, rakam, boşluk ve , . : / - ' işaretleri).
const MAP_QUERY = /^[\p{L}\p{N} ,.:/'\-]{3,120}$/u;

/** Statik HTML'deki facade'ler — şimdilik harita ([data-embed="map"] + data-map-q="adres veya enlem,boylam"). */
export function initEmbeds() {
  for (const el of document.querySelectorAll('[data-embed="map"]')) {
    const button = el.querySelector('button');
    const q = (el.dataset.mapQ ?? '').trim();
    if (!button || !MAP_QUERY.test(q)) continue;
    button.addEventListener('click', () => {
      el.textContent = '';
      el.classList.add('is-active');
      const frame = document.createElement('iframe');
      frame.src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
      frame.title = 'Harita: Kevser Barut Müzik Evi konumu';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      el.append(frame);
    });
  }
}
