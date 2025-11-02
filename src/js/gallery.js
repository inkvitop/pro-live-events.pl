// Центральный квадрат 550x550 (адаптивный через CSS переменную), видны соседи,
// плавный переход, fade по краям, бесконечный цикл, починены стрелки.

// ✅ Функция для автоматического обнаружения всех изображений в папке gallery
function importAllFromGallery() {
  try {
    const galleryContext = require.context(
      '../assets/gallery', 
      false, 
      /\.(png|jpe?g|webp|gif|avif|svg)$/i
    );
    
    const imagePaths = galleryContext.keys();
    
    if (imagePaths.length === 0) {
      console.warn('⚠️ No images found in assets/gallery folder');
      return createPlaceholderImages();
    }
    
    const sortedPaths = imagePaths.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    const images = sortedPaths.map((path, index) => {
      const imageModule = galleryContext(path);
      const filename = path.split('/').pop();
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      
      return {
        src: imageModule.default || imageModule,
        name: nameWithoutExt,
        filename: filename,
        index: index + 1
      };
    });
    
    // console.log(`✅ Gallery: loaded ${images.length} images`);
    return images;
    
  } catch (error) {
    console.error('❌ Error scanning gallery folder:', error);
    return createPlaceholderImages();
  }
}

// ✅ Функция создания placeholder изображений (fallback)
function createPlaceholderImages(count = 8) {
  const placeholderImages = [];
  for (let i = 1; i <= count; i++) {
    placeholderImages.push({
      src: `https://picsum.photos/550/550?random=${i}&grayscale=1&blur=2`,
      name: `Gallery Image ${String(i).padStart(2, '0')}`,
      filename: `placeholder-${i}.jpg`,
      index: i,
      isPlaceholder: true
    });
  }
  
  return placeholderImages;
}

// ✅ Функция для создания DOM структуры слайдов
function buildSlides(track, items) {
  if (!track) {
    console.error('❌ Gallery track element is null');
    return;
  }

  track.innerHTML = '';
  
  items.forEach((item, i) => {
    if (!item || !item.src) {
      console.warn('⚠️ Invalid gallery item:', item);
      return;
    }

    const li = document.createElement('li');
    li.className = 'gallery__slide';
    li.dataset.index = i;
    li.dataset.name = item.name;

    const img = document.createElement('img');
    img.className = 'gallery__image';
    img.src = item.src;
    img.setAttribute('width', '550');
    img.setAttribute('height', '550');
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.alt = `Galeria ${String(i + 1).padStart(2, '0')}: ${item.name}`;
    img.title = item.name;

    img.onerror = function() {
      console.error(`❌ Failed to load image: ${item.name}`);
      this.style.backgroundColor = '#f0f0f0';
      this.style.display = 'flex';
      this.style.alignItems = 'center';
      this.style.justifyContent = 'center';
      this.alt = `Failed to load: ${item.name}`;
    };

    li.appendChild(img);
    track.appendChild(li);
  });
}

// ✅ Основная функция инициализации галереи
export function initGallery(selector = '#gallery') {
  // console.log(`🎬 Initializing gallery`);
  
  const root = document.querySelector(selector);
  if (!root) {
    console.error(`❌ Gallery element not found: ${selector}`);
    return;
  }

  const viewport = root.querySelector('.gallery__viewport');
  const track = root.querySelector('.gallery__track');
  const prevBtn = root.querySelector('.gallery__btn--prev');
  const nextBtn = root.querySelector('.gallery__btn--next');

  if (!viewport || !track) {
    console.error('❌ Gallery viewport or track not found');
    return;
  }

  // 1) Загружаем изображения и создаем слайды
  const images = importAllFromGallery();
  
  if (!images.length) {
    console.error('❌ No images available for gallery');
    track.innerHTML = `
      <li class="gallery__slide gallery__slide--error">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-family: sans-serif; text-align: center; padding: 20px;">
          No gallery images found<br>
          <small>Please add images to src/assets/gallery/ folder</small>
        </div>
      </li>
    `;
    return;
  }

  buildSlides(track, images);

  // 2) Клоны для бесконечного цикла
  let slides = Array.from(root.querySelectorAll('.gallery__slide'));
  
  if (slides.length === 0) {
    console.error('❌ No slides created');
    return;
  }

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  
  firstClone.dataset.clone = 'first';
  lastClone.dataset.clone = 'last';
  
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);
  
  slides = Array.from(root.querySelectorAll('.gallery__slide'));

  // 3) Настройка анимации
  const getNumericPx = (str) => Number(String(str).replace('px', '')) || 0;
  
  const getMetrics = () => {
    const gap = getNumericPx(getComputedStyle(track).gap);
    const slideW = slides[0]?.offsetWidth || 550;
    const sidePad = (viewport.clientWidth - slideW) / 2;
    const step = slideW + gap;
    return { gap, slideW, sidePad, step };
  };

  let { step, sidePad } = getMetrics();
  
  // ✅ ПРОСТАЯ И НАДЕЖНАЯ СИСТЕМА
  let currentIndex = 1;
  let animationFrame = null;
  let animationStartTime = null;
  const DURATION = 350; // Быстрая анимация

  // Функция установки позиции
  const setPosition = (targetIndex, instant = false) => {
    // Останавливаем текущую анимацию
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    const targetPosition = -targetIndex * step + sidePad;
    
    if (instant) {
      // Мгновенный переход
      track.style.transition = 'none';
      track.style.transform = `translate3d(${targetPosition}px, 0, 0)`;
      track.offsetHeight; // Force reflow
      track.style.transition = '';
      currentIndex = targetIndex;
    } else {
      // Плавный переход
      track.style.transform = `translate3d(${targetPosition}px, 0, 0)`;
      currentIndex = targetIndex;
    }
  };

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ПЕРЕХОДА
  const goToSlide = (newIndex) => {
    // Мгновенно прерываем текущую анимацию и переходим к новому слайду
    setPosition(newIndex, false);
    
    // Проверяем границы после анимации
    setTimeout(() => {
      const currentSlide = slides[currentIndex];
      if (currentSlide?.dataset.clone === 'first') {
        setPosition(1, true);
      } else if (currentSlide?.dataset.clone === 'last') {
        setPosition(slides.length - 2, true);
      }
    }, DURATION + 10);
  };

  const next = () => {
    goToSlide(currentIndex + 1);
  };

  const prev = () => {
    goToSlide(currentIndex - 1);
  };

  // Устанавливаем начальную позицию
  setPosition(currentIndex, true);

  // Ресайз обсервер
  const ro = new ResizeObserver(() => {
    ({ step, sidePad } = getMetrics());
    setPosition(currentIndex, true);
  });
  ro.observe(viewport);

  // Кнопки навигации
  if (prevBtn) {
    prevBtn.addEventListener('click', prev);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', next);
  }

  // Клавиатурная навигация
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };
  
  root.addEventListener('keydown', handleKeydown);
  
  if (!root.hasAttribute('tabindex')) {
    root.setAttribute('tabindex', '0');
  }

  // Автоплей
  const delay = Number(root.dataset.autoplay) || 0;
  let timer = null;
  
  const startAuto = () => {
    if (!delay) return;
    stopAuto();
    timer = setInterval(next, delay);
  };
  
  const stopAuto = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  
  if (delay > 0) {
    startAuto();
  }

  // Управление автоплеем
  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  // Drag / Swipe функциональность
  let startX = 0, currentX = 0, dragging = false;
  let startPosition = 0;

  const pointerDown = (x) => {
    dragging = true;
    startX = x;
    currentX = x;
    startPosition = -currentIndex * step + sidePad;
    track.style.transition = 'none';
    stopAuto();
  };

  const pointerMove = (x) => {
    if (!dragging) return;
    currentX = x;
    const delta = currentX - startX;
    const xPos = startPosition + delta;
    track.style.transform = `translate3d(${xPos}px, 0, 0)`;
  };

  const pointerUp = () => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    
    const delta = currentX - startX;
    const threshold = Math.max(40, step * 0.25);
    
    if (delta > threshold) {
      prev();
    } else if (delta < -threshold) {
      next();
    } else {
      // Возвращаем на текущую позицию
      setPosition(currentIndex, false);
    }
    
    startAuto();
  };

  // Мышиные события
  viewport.addEventListener('mousedown', (e) => pointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);

  // Touch события
  viewport.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pointerDown(e.touches[0].clientX);
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    e.preventDefault();
    pointerMove(e.touches[0].clientX);
  }, { passive: false });

  viewport.addEventListener('touchend', (e) => {
    e.preventDefault();
    pointerUp();
  });

  // Функция очистки
  root._destroyGallery = () => {
    stopAuto();
    ro.disconnect();
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    if (prevBtn) prevBtn.removeEventListener('click', prev);
    if (nextBtn) nextBtn.removeEventListener('click', next);
    root.removeEventListener('keydown', handleKeydown);
    root.removeEventListener('mouseenter', stopAuto);
    root.removeEventListener('mouseleave', startAuto);
    root.removeEventListener('focusin', stopAuto);
    root.removeEventListener('focusout', startAuto);
    viewport.removeEventListener('mousedown', pointerDown);
    window.removeEventListener('mousemove', pointerMove);
    window.removeEventListener('mouseup', pointerUp);
    viewport.removeEventListener('touchstart', pointerDown);
    viewport.removeEventListener('touchmove', pointerMove);
    viewport.removeEventListener('touchend', pointerUp);
  };

  // console.log(`✅ Gallery initialized with ${images.length} images`);
  return root._destroyGallery;
}

export { importAllFromGallery, buildSlides, createPlaceholderImages };