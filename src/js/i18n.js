// Импортируем JSON файлы
import plTranslations from '../lang/pl.json';
import enTranslations from '../lang/en.json';

const translations = {
  pl: plTranslations,
  en: enTranslations
};

let currentLang = 'pl';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('data-lang', lang);
    applyTranslations(lang);
    return true;
  }
  return false;
}

export function getCurrentLanguage() {
  return currentLang;
}

export function applyTranslations(lang = currentLang, rootElement = document.body) {
  const langData = translations[lang];
  if (!langData) {
    console.warn(`No translations found for language: ${lang}`);
    return;
  }

  // ✅ УЛУЧШЕННАЯ ОТЛАДКА: показываем полную структуру JSON
  // console.log(`🔍 Applying translations for ${lang}, full structure:`, langData);
  // console.log(`🔍 Available top-level keys:`, Object.keys(langData));

  // Находим все элементы с data-i18n атрибутом
  const elements = rootElement.querySelectorAll('[data-i18n]');
  
  let appliedCount = 0;
  let missingCount = 0;
  
  // console.log(`🔍 Found ${elements.length} elements with data-i18n`);
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(langData, key);
    
    if (value !== undefined) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = value;
      } else {
        element.textContent = value;
      }
      appliedCount++;
      // console.log(`✅ Applied: ${key} = ${value}`);
    } else {
      missingCount++;
      console.warn(`❌ Translation key not found: ${key} in ${lang}`);
      
      // ✅ УЛУЧШЕННАЯ ОТЛАДКА: показываем доступные ключи для этого пути
      const keyParts = key.split('.');
      if (keyParts.length > 0) {
        const firstPart = keyParts[0];
        // console.log(`🔍 Available keys under '${firstPart}':`, langData[firstPart] ? Object.keys(langData[firstPart]) : 'NOT FOUND');
      }
    }
  });

  // Обновляем атрибуты lang
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-lang', lang);
  
  const elementName = rootElement === document.body ? 'document' : rootElement.tagName;
  // console.log(`✅ Translations applied to ${elementName}: ${lang} (${appliedCount} applied, ${missingCount} missing)`);
}

// Вспомогательная функция для получения вложенных значений
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Инициализация языка при загрузке
export function initI18n() {
  // Очищаем localStorage чтобы сбросить английский
  localStorage.removeItem('lang');
  
  const lang = 'pl';
  
  setLanguage(lang);
  // console.log(`🌍 Language forced to: ${lang}`);
  return lang;
}