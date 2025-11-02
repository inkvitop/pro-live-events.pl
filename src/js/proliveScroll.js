// // src/js/proliveScroll.js
// export function initProliveScroll() {
//   const section = document.querySelector('#proliveevents');
//   if (!section) {
//     console.warn('[Prolive] ❌ #proliveevents not found');
//     return;
//   }

//   // ===== Settings =====
//   const HEADER_H = getHeaderHeight();
//   const STICK_TIME = parseInt(section.dataset.stickTime, 10) || 5000; // ms
//   const HYST = 12; // px гистерезис вокруг линии хедера

//   // ===== State =====
//   let stuck = false;
//   let armed = true;
//   let justReleased = false;
//   let prevTop = null;
//   let placeholder = null;
//   let lastCross = 'none';

//   // ===== Debug overlay =====
//   const overlay = makeOverlay();

//   // ===== Listeners =====
//   window.addEventListener('scroll', onScroll, { passive: true });
//   window.addEventListener('resize', onResize, { passive: true });

//   // First paint
//   onScroll();

//   function onScroll() {
//     const rect = section.getBoundingClientRect();
//     const top = rect.top;
//     const inBand = rect.bottom > HEADER_H && rect.top < window.innerHeight;

//     updateOverlay({ top, inBand });

//     if (stuck) {
//       debug('SCROLL: stuck; ignore', { top });
//       prevTop = top;
//       return;
//     }

//     if (justReleased) {
//       const away = (top <= HEADER_H - HYST) || (top >= HEADER_H + HYST);
//       debug('SCROLL: justReleased', { top, away, armed });
//       if (away) {
//         armed = true;
//         justReleased = false;
//         debug('RE-ARM after release');
//       }
//       prevTop = top;
//       return;
//     }

//     if (prevTop === null) {
//       prevTop = top;
//       debug('SCROLL: priming prevTop', { top });
//       return;
//     }

//     // === Пересечение с учётом направления + округления ===
//     const prevRounded = Math.round(prevTop);
//     const topRounded = Math.round(top);

//     const dirDown = top < prevTop; // прокрутка вниз: top уменьшается
//     const dirUp   = top > prevTop; // прокрутка вверх: top растёт

//     const crossedDown = dirDown && prevRounded > HEADER_H + HYST && topRounded <= HEADER_H;
//     const crossedUp   = dirUp   && prevRounded < HEADER_H - HYST && topRounded >= HEADER_H;

//     if (armed && (crossedDown || crossedUp) && inBand) {
//       lastCross = crossedDown ? 'down' : 'up';
//       debug('TRIGGER pin', { lastCross, prevTop, top, prevRounded, topRounded, dirDown, dirUp });
//       pinFor(STICK_TIME);
//     } else {
//       debug('SCROLL: no-trigger', { prevTop, top, prevRounded, topRounded, crossedDown, crossedUp, dirDown, dirUp, armed, inBand });
//     }

//     prevTop = top;
//   }

//   function pinFor(ms) {
//     const rect = section.getBoundingClientRect();
//     placeholder = document.createElement('div');
//     placeholder.className = 'proliveevents-placeholder';
//     placeholder.style.height = `${rect.height}px`;
//     section.parentNode.insertBefore(placeholder, section);

//     section.style.position = 'fixed';
//     section.style.top = `${HEADER_H}px`;
//     section.style.left = `${rect.left}px`;
//     section.style.width = `${rect.width}px`;
//     section.style.zIndex = '10';
//     section.style.margin = '0';

//     stuck = true;
//     armed = false;

//     updateOverlay();
//     debug('PIN start', { ms, rectH: rect.height });

//     setTimeout(unpin, ms);
//   }

//   function unpin() {
//     section.style.position = '';
//     section.style.top = '';
//     section.style.left = '';
//     section.style.width = '';
//     section.style.zIndex = '';
//     section.style.margin = '';

//     if (placeholder && placeholder.parentNode) {
//       placeholder.parentNode.removeChild(placeholder);
//       placeholder = null;
//     }

//     stuck = false;
//     justReleased = true; // ждём ухода на HYST, затем снова вооружимся в onScroll()

//     updateOverlay();
//     debug('PIN end → release; waiting for hysteresis', { HYST });
//   }

//   function onResize() {
//     if (!stuck) return;
//     const r = section.getBoundingClientRect();
//     section.style.left = `${r.left}px`;
//     section.style.width = `${r.width}px`;
//     debug('RESIZE while pinned', { left: r.left, width: r.width });
//   }

//   function getHeaderHeight() {
//     const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim();
//     if (cssVar && cssVar.endsWith('px')) {
//       const px = parseInt(cssVar, 10);
//       if (!Number.isNaN(px)) return px;
//     }
//     const header = document.querySelector('header');
//     return header?.offsetHeight || 50;
//   }

//   function debug(label, obj = {}) {
//     if (/TRIGGER|PIN start|PIN end|RE-ARM|stuck;|no-trigger|priming|justReleased|RESIZE/.test(label)) {
//       console.log('[Prolive]', label, obj);
//     }
//   }

//   function makeOverlay() {
//     const el = document.createElement('div');
//     Object.assign(el.style, {
//       position: 'fixed',
//       top: '8px',
//       right: '8px',
//       zIndex: 9999,
//       background: 'rgba(0,0,0,.7)',
//       color: '#fff',
//       font: '12px/1.35 ui-monospace, Menlo, Consolas, monospace',
//       padding: '8px 10px',
//       borderRadius: '8px',
//       pointerEvents: 'none',
//       whiteSpace: 'pre',
//     });
//     document.body.appendChild(el);
//     return el;
//   }

//   function updateOverlay(extra = {}) {
//     const r = section.getBoundingClientRect();
//     overlay.textContent =
// `Prolive DEBUG
// HEADER_H: ${HEADER_H}
// STICK_TIME: ${STICK_TIME} ms
// HYST: ${HYST}
// stuck: ${stuck}
// armed: ${armed}
// justReleased: ${justReleased}
// lastCross: ${lastCross}
// top: ${Math.round(r.top)}
// bottom: ${Math.round(r.bottom)}
// height: ${Math.round(r.height)}
// in-band: ${r.bottom > HEADER_H && r.top < innerHeight}
// ${extra && Object.keys(extra).length ? 'extra: ' + JSON.stringify(extra) : ''}`;
//   }
// }