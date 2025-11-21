// src/js/i18n.js

// Импортируем JSON файлы
import plTranslations from '../lang/pl.json';
import enTranslations from '../lang/en.json';

const translations = {
  pl: plTranslations,
  en: enTranslations
};

let currentLang = 'pl';

/**
 * Установка языка
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;

    // сохраняем в localStorage
    localStorage.setItem('lang', lang);

    // ставим атрибуты языка
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('data-lang', lang);

    // применять перевод
    applyTranslations(lang);

    return true;
  }
  return false;
}

/**
 * Получение текущего языка
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Применение переводов к элементам DOM
 */
export function applyTranslations(lang = currentLang, rootElement = document.body) {
  const langData = translations[lang];
  if (!langData) {
    console.warn(`No translations found for language: ${lang}`);
    return;
  }

  const elements = rootElement.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(langData, key);

    if (value !== undefined) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = value;
      } else {
        element.textContent = value;
      }
    } else {
      console.warn(`❌ Translation key not found: ${key} (${lang})`);
    }
  });

  // обновляем атрибуты языка
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-lang', lang);
}

/**
 * Вспомогательная функция получения вложенных значений по ключам "a.b.c"
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Инициализация языка при загрузке страницы
 * (по твоей логике — всегда PL)
 */
export function initI18n() {
  // сбрасываем прошлый язык
  localStorage.removeItem('lang');

  const lang = 'pl';
  setLanguage(lang);

  return lang;
}

/* ============================================================
   🌐 ГЛОБАЛЬНЫЙ ЭКСПОРТ (главное изменение!)
   ============================================================ */

// Теперь FleshRendererUI, FleshRendererModal и все динамические
// секции могут безопасно вызывать window.applyTranslations().
window.applyTranslations = applyTranslations;
window.getCurrentLanguage = getCurrentLanguage;
window.setLanguage = setLanguage;
