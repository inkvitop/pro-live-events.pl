// lang-switcher.js
// Полный, аккуратный скрипт для переключателя языка:
// - Открытие/закрытие по клику, закрытие по клику вне и по Esc
// - Выбор языка по клику НА БОКС и на сам флаг
// - Запоминание в localStorage
// - Первичная инициализация по saved lang или navigator.language
// - Перетаскивание выбранного флага в начало списка
// - Доступность: tabindex/aria-* + управление с клавиатуры

import { applyTranslations } from './i18n';

export const initLangSwitcher = () => {
  const wrapper  = document.querySelector('.header-box-options-lang');
  const dropdown = wrapper?.querySelector('.header-box-options-lang-dropdown');
  if (!wrapper || !dropdown) return;

  const OPEN_CLASS = 'dropdownOpen';

  // a11y на «кнопке»
  dropdown.setAttribute('tabindex', '0');
  dropdown.setAttribute('role', 'button');
  dropdown.setAttribute('aria-haspopup', 'listbox');
  dropdown.setAttribute('aria-expanded', 'false');

  const isOpen = () => dropdown.classList.contains(OPEN_CLASS);
  const open   = () => { dropdown.classList.add(OPEN_CLASS);  dropdown.setAttribute('aria-expanded', 'true'); };
  const close  = () => { dropdown.classList.remove(OPEN_CLASS); dropdown.setAttribute('aria-expanded', 'false'); };

  const setLanguage = (lang) => {
    if (!lang) return;
    applyTranslations(lang);
    localStorage.setItem('lang', lang);

    // Перетаскиваем выбранный флаг наверх
    const img   = dropdown.querySelector(`img[data-lang-btn="${lang}"]`);
    const box   = img?.closest('.header-box-options-lang-dropdown-box');
    const first = dropdown.firstElementChild;
    if (box && first && box !== first) dropdown.insertBefore(box, first);
  };

  // Инициализация выбранного языка
  (() => {
    const saved = localStorage.getItem('lang');
    if (saved) {
      setLanguage(saved);
      return;
    }
    const map = {
      pl: 'pl', 'pl-PL': 'pl',
      en: 'en', 'en-GB': 'en', 'en-US': 'en',
      de: 'de', 'de-DE': 'de',
      ru: 'ru', 'ru-RU': 'ru'
    };
    const guess = map[navigator.language] || 'en';
    setLanguage(guess);
  })();

  // Клик по виджету:
  // 1) если закрыт — всегда ОТКРЫВАЕМ, не пытаемся выбрать язык
  // 2) если открыт — выбираем язык по клику на бокс/флаг
  dropdown.addEventListener('click', (e) => {
    if (!isOpen()) { open(); return; }

    const box = e.target.closest('.header-box-options-lang-dropdown-box');
    if (!box) return;

    const img = box.querySelector('img[data-lang-btn]');
    if (!img) return;

    const lang = img.getAttribute('data-lang-btn');
    setLanguage(lang);
    close();
  });

  // Клавиатура: Enter/Space — toggle; Esc — close
  dropdown.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      isOpen() ? close() : open();
    } else if (e.key === 'Escape') {
      close();
      dropdown.blur();
    }
  });

  // Клик вне — закрываем
  const onDocClick = (e) => {
    if (!wrapper.contains(e.target)) close();
  };
  document.addEventListener('click', onDocClick);

  // На случай «утечек» при удалении узла (SPA/перерисовки)
  const cleanup = () => document.removeEventListener('click', onDocClick);
  // Если нужно — экспортируй cleanup наружу
  // return cleanup;
};

// Авто-инициализация, если модуль подключён напрямую
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLangSwitcher, { once: true });
} else {
  initLangSwitcher();
}