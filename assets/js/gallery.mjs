// Galeri: media/gallery.json → doğrula → kartları DOM API'leriyle kur.
// HTML dizgisi hiç kullanılmaz; tüm metinler textContent ile yazılır.
import { validateGalleryItems } from './gallery-validate.mjs';
import { activateEmbed } from './embed.mjs';
import { initLightbox } from './lightbox.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK = 'http://www.w3.org/1999/xlink';

function icon(id, size) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#${id}`);
  use.setAttributeNS(XLINK, 'xlink:href', `#${id}`);
  svg.append(use);
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function posterFor(item) {
  if (item.poster) return item.poster;
  if (item.type === 'youtube') return `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
  return null;
}

const KIND_LABEL = { youtube: 'Video', vimeo: 'Video', video: 'Video', image: '' };

export async function initGallery() {
  const root = document.getElementById('galeri');
  if (!root) return;
  const featuredEl = root.querySelector('.gallery__featured');
  const gridEl = root.querySelector('.gallery__grid');
  const errorEl = root.querySelector('.gallery__error');

  let items = [];
  try {
    const res = await fetch('media/gallery.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = validateGalleryItems(await res.json());
    result.warnings.forEach((w) => console.warn('[galeri]', w));
    items = result.items;
  } catch (err) {
    console.warn('[galeri] yüklenemedi:', err);
    errorEl.hidden = false;
    return;
  }
  if (!items.length) { errorEl.hidden = false; return; }

  const lightbox = initLightbox(() => items);
  const featuredIndex = items.findIndex((i) => i.featured);

  items.forEach((item, index) => {
    const isFeatured = index === featuredIndex;
    const card = buildCard(item, index, isFeatured);
    (isFeatured ? featuredEl : gridEl).append(card);
  });
  featuredEl.hidden = featuredIndex === -1;

  function buildCard(item, index, isFeatured) {
    const figure = el('figure', `media-card${isFeatured ? ' media-card--featured' : ''}`);
    if (item.type === 'image' && !isFeatured) figure.style.aspectRatio = `${item.width} / ${item.height}`;

    if (item.type === 'image') {
      const button = el('button', 'media-card__btn');
      button.type = 'button';
      button.setAttribute('aria-label', `Büyüt: ${item.caption || item.alt || 'fotoğraf'}`);
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = item.width;
      img.height = item.height;
      button.append(img);
      button.addEventListener('click', () => lightbox?.open(index, button));
      figure.append(button);
      if (item.caption) figure.append(el('figcaption', null, item.caption));
      return figure;
    }

    // Video türleri: poster + oynat düğmesi
    const button = el('button', 'media-card__play');
    button.type = 'button';
    button.setAttribute('aria-label', `Oynat: ${item.title}`);
    const poster = posterFor(item);
    if (poster) {
      const img = document.createElement('img');
      img.src = poster;
      img.alt = '';
      img.loading = isFeatured ? 'eager' : 'lazy';
      img.decoding = 'async';
      button.append(img);
    } else {
      button.append(el('span', 'media-card__poster--empty'));
    }
    const circle = el('span', 'media-card__play-circle');
    circle.append(icon('icon-play', 30));
    button.append(circle);

    const cap = el('figcaption');
    cap.append(el('span', 'media-card__kind', KIND_LABEL[item.type]));
    cap.append(document.createTextNode(item.title));

    if (isFeatured) {
      // Öne çıkan video yerinde oynar
      const box = el('div', 'embed');
      box.hidden = true;
      button.addEventListener('click', () => {
        button.hidden = true;
        cap.hidden = true;
        box.hidden = false;
        activateEmbed(box, item);
      });
      figure.append(button, box, cap);
    } else {
      button.addEventListener('click', () => lightbox?.open(index, button));
      figure.append(button, cap);
    }
    return figure;
  }
}
