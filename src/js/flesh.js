// src/js/flesh.js
import { FleshRenderer } from './render/FleshRenderer.js';

// Создаем глобальный экземпляр
const fleshRenderer = new FleshRenderer();

// Экспортируем для использования в других модулях
export { fleshRenderer };

// Инициализируем когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM ready, initializing Flesh...');
    console.log('📍 Current hostname:', window.location.hostname);
    console.log('🔍 GitHub Pages detection:', window.location.hostname.includes('github.io'));
    fleshRenderer.init();
});

// Делаем доступным глобально для отладки
window.fleshRenderer = fleshRenderer;