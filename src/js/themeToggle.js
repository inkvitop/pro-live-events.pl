export const initThemeToggle = () => {
  // console.log('🟡 initThemeToggle стартовал');

  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) {
    console.warn('⚠️ toggle не найден');
    return;
  }

  toggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // console.log(`🌗 Тема переключена на: ${newTheme}`);
  });

  // Применить сохранённую тему при загрузке
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    // console.log(`🔁 Применена сохранённая тема: ${savedTheme}`);
  }
};