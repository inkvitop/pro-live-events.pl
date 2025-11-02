// Интерактив для секции Артисты:
// - hover по программе: подмена фото артиста, фона карточки, описания
// - клик по программе: лайтбокс с постером + заголовок/описание под изображением
// - фиксация предпросмотра: при открытом попапе главная фотка остаётся в "костюме" программы

let lbRoot, lbBackdrop, lbImg, lbTitle, lbDesc;
let LB_ON_CLOSE = null; // колбэк при закрытии попапа

function ensureLightbox() {
  lbRoot    = document.getElementById('artists-lightbox');
  lbBackdrop= document.getElementById('artists-lightbox-backdrop');
  lbImg     = document.getElementById('artists-lightbox-img');
  lbTitle   = document.getElementById('artists-lightbox-title');
  lbDesc    = document.getElementById('artists-lightbox-desc');

  if (!lbRoot || !lbBackdrop || !lbImg) return;

  const close = () => {
    lbRoot.classList.remove('is-open');
    lbRoot.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    lbImg.alt = '';
    if (lbTitle) lbTitle.textContent = '';
    if (lbDesc)  lbDesc.textContent = '';
    if (typeof LB_ON_CLOSE === 'function') {
      const fn = LB_ON_CLOSE;
      LB_ON_CLOSE = null;
      fn();
    }
  };

  lbBackdrop.addEventListener('click', close);
  lbImg.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (lbRoot.classList.contains('is-open') && (e.key === 'Escape' || e.key === 'Esc')) {
      close();
    }
  });
}

function openArtistsLightbox(src, alt, onClose, titleText = '', descText = '') {
  if (!lbRoot) ensureLightbox();
  if (!lbRoot || !lbImg) return;

  LB_ON_CLOSE = onClose || null;
  lbImg.src = src;
  lbImg.alt = alt || 'Program image';
  if (lbTitle) lbTitle.textContent = titleText || alt || '';
  if (lbDesc)  lbDesc.textContent  = descText || '';

  lbRoot.classList.add('is-open');
  lbRoot.setAttribute('aria-hidden', 'false');
}

function bindArtistCard(card) {
  const baseBg = card.getAttribute('data-bg') || '';
  if (baseBg) card.style.backgroundImage = `url('${baseBg}')`;

  const photo    = card.querySelector('.artist__photo');
  const desc     = card.querySelector('.artist__desc');
  const programs = card.querySelector('.artist__programs');
  if (!photo || !desc || !programs) return;

  const basePhoto = photo.getAttribute('src');
  const baseDesc  = desc.textContent;

  // Состояние предпросмотра
  let lockPreview = false; // пока попап открыт — не сбрасывать предпросмотр
  let currentPreview = { photo: basePhoto, bg: baseBg, desc: baseDesc };

  const setPreviewFromTile = (tile) => {
    const newPhoto = tile.getAttribute('data-swap-photo') || basePhoto;
    const newBg    = tile.getAttribute('data-swap-bg')   || baseBg;
    const newDesc  = tile.getAttribute('data-prog-desc') || baseDesc;

    currentPreview = { photo: newPhoto, bg: newBg, desc: newDesc };

    if (newPhoto) photo.src = newPhoto;
    card.style.backgroundImage = newBg ? `url('${newBg}')` : '';
    desc.textContent = newDesc;
  };

  const resetToBase = () => {
    currentPreview = { photo: basePhoto, bg: baseBg, desc: baseDesc };
    photo.src = basePhoto;
    card.style.backgroundImage = baseBg ? `url('${baseBg}')` : '';
    desc.textContent = baseDesc;
  };

  // Hover-предпросмотр
  programs.addEventListener('mouseover', (e) => {
    const tile = e.target.closest('.program');
    if (!tile) return;
    setPreviewFromTile(tile);
  });

  programs.addEventListener('mouseleave', () => {
    if (lockPreview) return; // если попап открыт — ничего не возвращаем
    resetToBase();
  });

  // Клик: открыть попап, зафиксировать предпросмотр
  programs.addEventListener('click', (e) => {
    const tile = e.target.closest('.program');
    if (!tile) return;

    // гарантируем предпросмотр для выбранной плитки
    setPreviewFromTile(tile);
    lockPreview = true;

    const imgSrc = tile.getAttribute('data-prog-img');
    const alt    = tile.getAttribute('aria-label') || '';
    const title  = alt || (tile.querySelector('.program__title')?.textContent || '');
    const pdesc  = tile.getAttribute('data-prog-desc') || '';

    openArtistsLightbox(imgSrc, alt, () => {
      // попап закрыт — снимаем блокировку предпросмотра
      lockPreview = false;

      // если курсор всё ещё над плиткой — остаёмся в предпросмотре этой плитки
      const hoveredTile = card.querySelector('.program:hover');
      if (hoveredTile) {
        setPreviewFromTile(hoveredTile);
      } else {
        resetToBase();
      }
    }, title, pdesc);
  });
}

/* Публично */
export function initArtists() {
  ensureLightbox();
  document.querySelectorAll('#artists .artist').forEach(bindArtistCard);
}

/* Автоинициализация при отложенной подгрузке partial */
const observer = new MutationObserver(() => {
  const list = document.querySelector('#artists #artists-list');
  if (list && list.children.length) {
    initArtists();
    observer.disconnect();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
