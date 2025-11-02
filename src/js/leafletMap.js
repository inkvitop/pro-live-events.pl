import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import customIconUrl from '../assets/pin_proLiveEvents.png'; // путь к иконке

let leafletInstance = null;

export const initLeafletMap = () => {
  const mapContainer = document.getElementById('map');

  if (!mapContainer) {
    console.warn('🗺️ Контейнер карты не найден!');
    return;
  }

  if (leafletInstance) {
    console.log('🗺️ Карта уже инициализирована — пропуск');
    return;
  }

  leafletInstance = L.map(mapContainer, {
  attributionControl: false
}).setView([50.712511, 17.991178], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attributionControl: false, // полностью отключает атрибуцию
  }).addTo(leafletInstance);

  setTimeout(() => {
    leafletInstance.invalidateSize();
  }, 200);

  // ✅ Кастомная иконка
  const customIcon = L.icon({
    iconUrl: customIconUrl,
    iconSize: [50, 70],       // размеры подгони под свой пин
    iconAnchor: [30, 70],     // точка "острия"
    popupAnchor: [0, -70]
  });

  // ✅ Маркер с кастомной иконкой
  L.marker([50.712511, 17.991178], { icon: customIcon })
    .addTo(leafletInstance)
    .bindPopup('Tu nas znajdziesz');
};