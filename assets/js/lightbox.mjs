// <dialog> tabanlı galeri görüntüleyici: klavye (Esc, ←, →), arka plana tıklayınca
// kapanma, kapanınca odak tetikleyen öğeye döner. Video öğeleri doğrudan oynatılır.
import { activateEmbed } from './embed.mjs';

export function initLightbox(getItems) {
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return null;

  const stage = dialog.querySelector('.lightbox__stage');
  const caption = dialog.querySelector('.lightbox__caption');
  const count = dialog.querySelector('.lightbox__count');
  const prevBtn = dialog.querySelector('.lightbox__prev');
  const nextBtn = dialog.querySelector('.lightbox__next');
  const closeBtn = dialog.querySelector('.lightbox__close');

  let index = 0;
  let trigger = null;

  function render() {
    const items = getItems();
    const item = items[index];
    stage.textContent = '';
    if (!item) return;

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.decoding = 'async';
      stage.append(img);
      caption.textContent = item.caption || item.alt;
    } else {
      const box = document.createElement('div');
      box.className = 'embed';
      stage.append(box);
      activateEmbed(box, item);
      caption.textContent = item.title;
    }
    count.textContent = `${index + 1} / ${items.length}`;
    const single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
  }

  function step(delta) {
    const n = getItems().length;
    if (!n) return;
    index = (index + delta + n) % n;
    render();
  }

  function open(i, triggerEl) {
    index = i;
    trigger = triggerEl ?? null;
    render();
    document.body.classList.add('lightbox-open');
    dialog.showModal();
    closeBtn.focus();
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'Escape') { e.preventDefault(); dialog.close(); }
  });
  dialog.addEventListener('close', () => {
    stage.textContent = ''; // oynayan videoyu durdurur
    document.body.classList.remove('lightbox-open');
    if (trigger && document.contains(trigger)) trigger.focus();
  });

  return { open };
}
