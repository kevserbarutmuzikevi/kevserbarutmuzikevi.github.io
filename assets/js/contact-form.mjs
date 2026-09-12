// İletişim formu: Web3Forms'a fetch ile gönderim, yer tutucu anahtar koruması,
// çift gönderim kilidi. JS kapalıysa form normal POST ile yine çalışır.
const PLACEHOLDER_KEY = 'WEB3FORMS_ACCESS_KEY_BURAYA';

export function initContactForm() {
  const form = document.querySelector('form.form');
  if (!form) return;
  const status = form.querySelector('.form__status');
  const submit = form.querySelector('.form__submit');
  form.noValidate = true; // doğrulamayı JS üstlenir (JS yokken tarayıcı yapar)

  const setStatus = (message, kind) => {
    status.textContent = message;
    status.className = `form__status${kind ? ` form__status--${kind}` : ''}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('', null);
    if (!form.reportValidity()) return;
    if (form.elements.botcheck?.checked) return; // bot tuzağı

    if (form.elements.access_key.value === PLACEHOLDER_KEY) {
      setStatus('Form henüz etkinleştirilmedi. Lütfen telefon veya WhatsApp ile ulaşın.', 'error');
      return;
    }

    submit.disabled = true;
    setStatus('Gönderiliyor…', 'pending');
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.botcheck;
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success !== true) throw new Error(json.message || `HTTP ${res.status}`);
      setStatus('Mesajınız alındı, yönlendiriliyorsunuz…', 'success');
      window.location.assign('tesekkurler.html');
    } catch (err) {
      console.warn('[form]', err);
      setStatus('Mesaj gönderilemedi. Lütfen tekrar deneyin ya da telefonla ulaşın.', 'error');
      submit.disabled = false;
    }
  });
}
