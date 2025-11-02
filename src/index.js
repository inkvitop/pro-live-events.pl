import './styles.scss';
import 'leaflet/dist/leaflet.css';

import { loadHTMLPartials } from './js/html-loader';
import { initAllComponents } from './js/init';

// ✅ ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ: сначала загружаем HTML, потом инициализируем
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM loaded - starting application');
  
  // 1. Загружаем HTML partials
  await loadHTMLPartials();
  
  // 2. Инициализируем все компоненты после загрузки HTML
  initAllComponents();
});