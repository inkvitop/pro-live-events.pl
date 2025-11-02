// Footer interactions: modal + newsletter validation + no-jump scroll lock
export function initFooter() {
  // ===== helpers: lock/unlock scroll with scrollbar compensation =====
  const docEl = document.documentElement;
  let scrollLocked = false;

  const lockScroll = () => {
    if (scrollLocked) return;
    // ширина вертикальной полосы прокрутки
    const sbw = window.innerWidth - docEl.clientWidth; // обычно 0..17px
    docEl.style.setProperty('--sbw', `${sbw}px`);
    docEl.classList.add('modal-open');
    scrollLocked = true;
  };

  const unlockScroll = () => {
    if (!scrollLocked) return;
    docEl.classList.remove('modal-open');
    docEl.style.removeProperty('--sbw');
    scrollLocked = false;
  };

  // ===== Privacy Policy modal =====
  const modal = document.getElementById('privacy-modal');
  const openPolicy = document.querySelector('.footer__policy');
  const closeBtn = modal?.querySelector('.footer-modal__close');
  const overlay = modal?.querySelector('.footer-modal__overlay');

  const openModal = (e) => {
    e?.preventDefault?.();
    if (!modal) return;
    modal.hidden = false;
    lockScroll();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    unlockScroll();
  };

  openPolicy?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // ===== Newsletter validation =====
  const form = document.querySelector('.footer__newsletter');
  if (!form) return;

  const emailInput = form.querySelector('#nl-email');
  const consent = form.querySelector('#nl-consent');
  const submitBtn = form.querySelector('.footer__btn');
  const msg = form.querySelector('.footer__form-msg');

  const showMsg = (text, type) => {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove('is-error', 'is-success');
    msg.classList.add(type === 'success' ? 'is-success' : 'is-error');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    emailInput.setAttribute('aria-invalid', 'false');

    const emailValid = emailInput.value.trim().length > 0 && emailInput.checkValidity();
    const consentChecked = consent.checked;

    if (!consentChecked) {
      showMsg('Please confirm your consent to receive the newsletter.', 'error');
      return;
    }
    if (!emailValid) {
      emailInput.setAttribute('aria-invalid', 'true');
      showMsg('Please enter a valid e-mail address.', 'error');
      return;
    }

    submitBtn.disabled = true;
    showMsg('Thank you for subscribing to our news!', 'success');

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      showMsg('', 'success');
    }, 3000);
  });
}
