// Giriş noktası — tüm modülleri başlatır.
// Yeni bir davranış eklemek için ayrı bir .mjs dosyası yazıp buradan çağırın.
import { initNav } from './nav.mjs';
import { initReveal } from './reveal.mjs';
import { initGallery } from './gallery.mjs';
import { initEmbeds } from './embed.mjs';
import { initContactForm } from './contact-form.mjs';

document.documentElement.classList.add('js');

initNav();
initReveal();
initEmbeds();
initContactForm();
initGallery();
