// Плавный скролл по якорям с грубой коррекцией (tweak) от фактической видимой высоты хедера
export function initAnchorScroll(options = {}) {
  const {
    headerSelector = ".header",
    extraOffset = 10,   // небольшой запас под хедером
    tweak = 20          // СКОЛЬКО пикселей ОТНЯТЬ (грубая коррекция)
  } = options;

  const root   = document.documentElement;
  const header = document.querySelector(headerSelector);

  // текущая видимая высота хедера (если он частично скрыт)
  const getVisibleHeaderHeight = () => {
    if (!header) return 0;
    const r = header.getBoundingClientRect();
    const top = Math.max(r.top, 0);
    const bottom = Math.min(r.bottom, window.innerHeight);
    return Math.max(0, bottom - top);
  };

  // эффективный оффсет с учётом грубой коррекции
  const computeOffset = () => {
    const raw = getVisibleHeaderHeight() + extraOffset;
    const effective = Math.max(0, raw - tweak); // ← "минусуем" tweak
    root.style.setProperty("--header-offset", `${effective}px`);
    return effective;
  };

  const scrollToHash = (hash) => {
    if (!hash || hash === "#" || hash === "#!") return;

    if (hash === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    const offset = computeOffset();

    // позиция с учётом откорректированного оффсета
    const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({ top: y, behavior: "smooth" });

    // доступность
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  const onAnchorClick = (e) => {
    const a = e.currentTarget;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    // если цели нет (кроме #top) — не перехватываем
    if (!document.querySelector(href) && href !== "#top") return;

    e.preventDefault();
    scrollToHash(href);
    history.pushState(null, "", href);
  };

  const bindAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.removeEventListener("click", onAnchorClick);
      a.addEventListener("click", onAnchorClick);
    });
  };

  // init
  bindAnchors();
  window.addEventListener("resize", computeOffset);

  if (location.hash) {
    setTimeout(() => scrollToHash(location.hash), 0);
  }

  window.addEventListener("hashchange", () => scrollToHash(location.hash));
}
