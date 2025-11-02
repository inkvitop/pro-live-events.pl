export function initLogoScroll() {
  const bigLogo = document.querySelector('.header-logo-img');
  const smallLogo = document.querySelector('.header-box-logo-img');
  if (!bigLogo || !smallLogo) return;

  // На каком расстоянии (px) происходит полный переход с большого на малый
  const fadePoint = 100;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function apply() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const ratio = clamp(y / fadePoint, 0, 1);

    // Большой логотип (под шапкой)
    bigLogo.style.opacity = String(1 - ratio);
    bigLogo.style.transform = `scale(${1 - 0.1 * ratio})`;

    // Малый логотип (в шапке)
    smallLogo.style.opacity = String(ratio);
    smallLogo.style.transform = `scale(${0.9 + 0.1 * ratio})`;
  }

  // rAF-троттлинг для плавности
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      apply();
      ticking = false;
    });
  }

  // ВАЖНО: сразу применяем состояние — покрывает reload/HMR внизу страницы
  apply();

  // Слушатели
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', apply);
  window.addEventListener('resize', apply);
}