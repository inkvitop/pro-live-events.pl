// src/js/contact-w3f.js
const ENDPOINT = 'https://api.web3forms.com/submit';

function setBtnState(btn, busy) {
  if (!btn) return;
  if (busy) {
    btn.dataset.prevText = btn.textContent;
    btn.textContent = btn.dataset.sending || 'Wysyłanie...';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.default || btn.dataset.prevText || 'Wyślij';
    btn.disabled = false;
  }
}

function validate(form) {
  if (!form.user_name.value.trim()) return 'Podaj imię i nazwisko.';
  const email = form.user_email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Podaj poprawny e-mail.';
  if (!form.message.value.trim()) return 'Napisz wiadomość.';
  if (!form.consent.checked) return 'Zaznacz zgodę na kontakt.';
  if (form.company.value.trim() !== '') return 'Spam zablokowany.'; // honeypot
  return null;
}

function throttleOk() {
  const now = Date.now();
  const last = Number(localStorage.getItem('ple_contact_last') || 0);
  const ok = now - last >= 60_000; // 60 сек между отправками
  if (ok) localStorage.setItem('ple_contact_last', String(now));
  return ok;
}

export function initContactFormW3F() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const note = form.querySelector('.form-note');
  const btn  = form.querySelector('.btn-send');
  const accessKey = form.dataset.w3fKey;

  if (!accessKey) {
    console.warn('[contact] Missing data-w3f-key on form');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.textContent = '';
    note.className = 'form-note';

    const err = validate(form);
    if (err) {
      note.textContent = err;
      note.classList.add('is-error');
      return;
    }

    if (!throttleOk()) {
      note.textContent = 'Proszę poczekać chwilę przed kolejną wysyłką.';
      note.classList.add('is-error');
      return;
    }

    setBtnState(btn, true);
    try {
      const data = new FormData(form);
      data.append('access_key', accessKey);
      // по желанию можно задать тему письма из JS:
      // data.set('subject', 'Nowe zapytanie z Pro Live Events');

      const resp = await fetch(ENDPOINT, { method: 'POST', body: data });
      const json = await resp.json();

      if (json.success) {
        form.reset();
        note.textContent = 'Dziękujemy! Wiadomość została wysłana.';
        note.classList.add('is-ok');
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (e) {
      console.error('[contact] send error:', e);
      note.textContent = 'Błąd wysyłki. Spróbuj ponownie później.';
      note.classList.add('is-error');
    } finally {
      setBtnState(btn, false);
    }
  });
}
