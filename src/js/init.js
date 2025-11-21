import { initI18n, applyTranslations } from './i18n';
import { initLogoScroll } from './logoScroll.js';
import { initLangSwitcher } from './langSwitcher';
import { initThemeToggle } from './themeToggle';
import { initLeafletMap } from './leafletMap';
import { initGallery } from './gallery';
import { initArtists } from './artists';
import { initFooter } from './footer';
import { initAnchorScroll } from "./anchors";
import { initForm } from './form';
import { fleshRenderer } from './flesh.js';
import { initMenu } from './menu.js'; // Добавляем импорт меню

const DBG = true;
const log = (...a) => DBG && console.log('[INIT]', ...a);

// ✅ ИНИЦИАЛИЗАЦИЯ ЯЗЫКА - польский по умолчанию
let defaultLang = initI18n();

let componentsInitialized = false;
let backupInitCalled = false;
let fleshInitialized = false;
let partialsLoadedHandlerAdded = false;

function markInited(el) { 
    if (el) el.dataset.init = '1'; 
}

function isInited(el) { 
    return el && el.dataset.init === '1'; 
}

function ensureLangSwitcher() {
    const el = document.querySelector('.header-box-options-lang');
    if (el && !el.dataset.inited) { 
        try {
            log('🔤 initLangSwitcher'); 
            initLangSwitcher(); 
            el.dataset.inited = 'true';
        } catch (error) {
            console.error('❌ LangSwitcher init error:', error);
        }
    }
}

function ensureThemeToggle() {
    const el = document.querySelector('[data-theme-toggle]');
    if (el && !el.dataset.inited) { 
        try {
            log('🌗 initThemeToggle'); 
            initThemeToggle(); 
            el.dataset.inited = 'true';
        } catch (error) {
            console.error('❌ ThemeToggle init error:', error);
        }
    }
}

function ensureMap() {
    const el = document.querySelector('#map');
    if (el && !isInited(el)) { 
        try {
            log('🗺️ initLeafletMap'); 
            initLeafletMap(); 
            markInited(el); 
        } catch (error) {
            console.error('❌ Map init error:', error);
        }
    }
}

function ensureProlive() {
    const section = document.querySelector('#proliveevents');
    if (!section || isInited(section)) return;
    
    try {
        if (section.querySelector('.proliveevents-viewport') &&
            section.querySelector('.proliveevents-wrapper') &&
            section.querySelector('.proliveevents-block')) {
            log('🎛️ prolive ready'); 
            markInited(section);
        }
    } catch (error) {
        console.error('❌ Prolive init error:', error);
    }
}

function ensureGallery() {
    const section = document.querySelector('#gallery');
    if (section && !isInited(section)) { 
        try {
            const viewport = section.querySelector('.gallery__viewport');
            const track = section.querySelector('.gallery__track');
            
            if (viewport && track) {
                log('🖼️ initGallery'); 
                initGallery('#gallery'); 
                markInited(section);
            } else {
                log('⏳ Gallery DOM not ready - viewport or track missing');
            }
        } catch (error) {
            console.error('❌ Gallery init error:', error);
        }
    }
}

function ensureArtists() {
    const section = document.querySelector('#artists');
    if (section && !isInited(section)) {
        try {
            log('🎤 initArtists');
            initArtists();
            markInited(section);
        } catch (error) {
            console.error('❌ Artists init error:', error);
        }
    }
}

function ensureForm() {
    const form = document.querySelector('.form--contact');
    if (form && !isInited(form)) {
        try {
            log('📝 initForm');
            initForm();
            markInited(form);
        } catch (error) {
            console.error('❌ Form init error:', error);
        }
    }
}

// ✅ УПРОЩЕННАЯ Функция для инициализации меню
function ensureMenu() {
    try {
        log('🍔 initMenu');
        initMenu();
        // Помечаем как инициализированное, даже если элементов нет
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) markInited(hamburger);
    } catch (error) {
        console.error('❌ Menu init error:', error);
    }
}

// ✅ ОБНОВЛЕННАЯ ФУНКЦИЯ ДЛЯ FLESH СЕКЦИИ
function ensureFlesh() {
    if (fleshInitialized) {
        console.log('✅ Flesh already initialized, skipping...');
        return Promise.resolve();
    }
    
    const fleshContainer = document.querySelector('.flesh');
    if (!fleshContainer) {
        console.log('❌ Flesh container not found');
        return Promise.resolve();
    }
    
    // Проверяем, не инициализируется ли уже Flesh
    if (fleshContainer.dataset.initializing === 'true') {
        console.log('⏳ Flesh is already initializing, skipping...');
        return Promise.resolve();
    }
    
    fleshContainer.dataset.initializing = 'true';
    console.log('🛍️ Initializing Flesh...');
    
    return new Promise((resolve) => {
        // Используем импортированный fleshRenderer
        if (fleshRenderer && typeof fleshRenderer.init === 'function') {
            fleshRenderer.init().then(() => {
                fleshInitialized = true;
                fleshContainer.dataset.initializing = 'false';
                fleshContainer.dataset.initialized = 'true';
                console.log('✅ Flesh initialized successfully');
                resolve();
            }).catch((error) => {
                console.error('💥 Flesh initialization failed:', error);
                fleshInitialized = true; // Помечаем как инициализированную даже при ошибке
                fleshContainer.dataset.initializing = 'false';
                fleshContainer.dataset.initialized = 'true';
                resolve();
            });
        } else {
            console.log('❌ FleshRenderer not available');
            fleshInitialized = true;
            fleshContainer.dataset.initializing = 'false';
            resolve();
        }
    });
}

// ✅ УЛУЧШЕННАЯ ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
export async function initAllComponents() {
    if (componentsInitialized) {
        log('⚠️ Components already initialized - skipping');
        return;
    }
    
    log('🎯 Initializing all components');
    
    try {
        // ✅ ПРИМЕНЯЕМ ПЕРЕВОДЫ К ВСЕМУ ДОКУМЕНТУ
        applyTranslations(defaultLang);
        
        // Инициализируем базовые компоненты (синхронные)
        initLogoScroll();
        ensureLangSwitcher();
        ensureThemeToggle();
        initFooter();
        initAnchorScroll({ headerSelector: ".header", extraOffset: 10 });
        ensureMenu(); // Добавляем инициализацию меню

        // Инициализируем компоненты, требующие DOM
        ensureMap();
        ensureProlive();
        ensureGallery();
        ensureArtists();
        ensureForm();
        
        // ✅ FLESH инициализируем асинхронно
        await ensureFlesh();
        
        componentsInitialized = true;
        log('✅ All components initialized successfully');
        
    } catch (error) {
        console.error('💥 Error during components initialization:', error);
        componentsInitialized = false; // Разрешаем повторную попытку
    }
}

// ✅ Слушаем событие загрузки partials - ТОЛЬКО ОДИН РАЗ
if (!partialsLoadedHandlerAdded) {
    document.addEventListener('partialsLoaded', async () => {
        partialsLoadedHandlerAdded = true;
        log('📦 Partials loaded event received');
        
        if (!componentsInitialized) {
            try {
                // Применяем переводы к новым элементам
                applyTranslations(defaultLang);
                await initAllComponents();
            } catch (error) {
                console.error('💥 Error during partials initialization:', error);
            }
        } else {
            // Если компоненты уже инициализированы, но загрузились новые partials
            // Применяем переводы к новым элементам
            applyTranslations(defaultLang);
            
            // Переинициализируем меню, если появились новые элементы
            ensureMenu();
            
            log('🔄 Partials loaded, translations and menu applied to new elements');
        }
    });
}

// ✅ УЛУЧШЕННАЯ Резервная инициализация
async function backupInitialization() {
    if (!componentsInitialized && !backupInitCalled) {
        backupInitCalled = true;
        log('⏱️ Backup initialization after timeout');
        
        try {
            await initAllComponents();
        } catch (error) {
            console.error('💥 Backup initialization failed:', error);
        }
    }
}

// Резервная инициализация через 2 секунды
setTimeout(backupInitialization, 2000);

// Дополнительная резервная инициализация когда DOM полностью готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', backupInitialization);
} else {
    backupInitialization(); // DOM уже готов
}

// ✅ Обработчик для ручной повторной инициализации (например, после SPA навигации)
export function reinitComponents() {
    if (componentsInitialized) {
        log('🔄 Manual reinitialization requested');
        componentsInitialized = false;
        fleshInitialized = false;
        backupInitCalled = false;
        
        // Сбрасываем флаги инициализации у элементов
        document.querySelectorAll('[data-init]').forEach(el => {
            delete el.dataset.init;
        });
        
        document.querySelectorAll('[data-inited]').forEach(el => {
            delete el.dataset.inited;
        });
        
        document.querySelectorAll('[data-initializing], [data-initialized]').forEach(el => {
            delete el.dataset.initializing;
            delete el.dataset.initialized;
        });
        
        backupInitialization();
    }
}

// ✅ Функция для проверки состояния инициализации
export function getInitStatus() {
    return {
        componentsInitialized,
        fleshInitialized,
        backupInitCalled,
        partialsLoadedHandlerAdded
    };
}

// Экспортируем для использования в других модулях
export { componentsInitialized, backupInitialization };