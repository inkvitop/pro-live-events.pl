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

const DBG = true;
const log = (...a) => DBG && console.log('[INIT]', ...a);

// ✅ ИНИЦИАЛИЗАЦИЯ ЯЗЫКА - польский по умолчанию
let defaultLang = initI18n();

let componentsInitialized = false;
let backupInitCalled = false;

function markInited(el) { 
    if (el) el.dataset.init = '1'; 
}

function isInited(el) { 
    return el && el.dataset.init === '1'; 
}

function ensureLangSwitcher() {
    const el = document.querySelector('.header-box-options-lang');
    if (el && !el.dataset.inited) { 
        log('🔤 initLangSwitcher'); 
        initLangSwitcher(); 
        el.dataset.inited = 'true';
    }
}

function ensureThemeToggle() {
    const el = document.querySelector('[data-theme-toggle]');
    if (el && !el.dataset.inited) { 
        log('🌗 initThemeToggle'); 
        initThemeToggle(); 
        el.dataset.inited = 'true';
    }
}

function ensureMap() {
    const el = document.querySelector('#map');
    if (el && !isInited(el)) { 
        log('🗺️ initLeafletMap'); 
        initLeafletMap(); 
        markInited(el); 
    }
}

function ensureProlive() {
    const section = document.querySelector('#proliveevents');
    if (!section || isInited(section)) return;
    
    if (section.querySelector('.proliveevents-viewport') &&
        section.querySelector('.proliveevents-wrapper') &&
        section.querySelector('.proliveevents-block')) {
        log('🎛️ prolive ready'); 
        markInited(section);
    }
}

function ensureGallery() {
    const section = document.querySelector('#gallery');
    if (section && !isInited(section)) { 
        const viewport = section.querySelector('.gallery__viewport');
        const track = section.querySelector('.gallery__track');
        
        if (viewport && track) {
            log('🖼️ initGallery'); 
            initGallery('#gallery'); 
            markInited(section);
        } else {
            log('⏳ Gallery DOM not ready - viewport or track missing');
        }
    }
}

function ensureArtists() {
    const section = document.querySelector('#artists');
    if (section && !isInited(section)) {
        log('🎤 initArtists');
        initArtists();
        markInited(section);
    }
}

function ensureForm() {
    const form = document.querySelector('.form--contact');
    if (form && !isInited(form)) {
        log('📝 initForm');
        initForm();
        markInited(form);
    }
}

// ✅ УЛУЧШЕННАЯ ФУНКЦИЯ ДЛЯ FLESH СЕКЦИИ
async function ensureFlesh() {
    const section = document.querySelector('.flesh');
    if (section && !isInited(section)) {
        try {
            log('🛍️ initFlesh');
            
            // Проверяем, что fleshRenderer существует и имеет метод init
            if (fleshRenderer && typeof fleshRenderer.init === 'function') {
                // Используем await для асинхронной инициализации
                await fleshRenderer.init();
                markInited(section);
                log('✅ Flesh initialized successfully');
            } else {
                console.error('❌ fleshRenderer not available or missing init method');
                // Помечаем как инициализированную, чтобы не пытаться снова
                markInited(section);
            }
        } catch (error) {
            console.error('💥 Error initializing Flesh:', error);
            // Помечаем как инициализированную, чтобы не пытаться снова
            markInited(section);
        }
    }
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

        // Инициализируем компоненты, требующие DOM
        ensureMap();
        ensureProlive();
        ensureGallery();
        ensureArtists();
        ensureForm();
        
        // ✅ FLESH инициализируем асинхронно с await
        await ensureFlesh();
        
        componentsInitialized = true;
        log('✅ All components initialized successfully');
        
    } catch (error) {
        console.error('💥 Error during components initialization:', error);
        componentsInitialized = false; // Разрешаем повторную попытку
    }
}

// ✅ Слушаем событие загрузки partials
document.addEventListener('partialsLoaded', async () => {
    log('📦 Partials loaded event received');
    if (!componentsInitialized) {
        try {
            // Применяем переводы к новым элементам
            applyTranslations(defaultLang);
            await initAllComponents();
        } catch (error) {
            console.error('💥 Error during partials initialization:', error);
        }
    }
});

// ✅ УЛУЧШЕННАЯ Резервная инициализация
async function backupInitialization() {
    if (!componentsInitialized && !backupInitCalled) {
        backupInitCalled = true;
        log('⏱️ Backup initialization after timeout');
        await initAllComponents();
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

// Экспортируем для использования в других модулях
export { componentsInitialized, backupInitialization };