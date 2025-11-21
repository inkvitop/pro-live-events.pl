// menu.js
export function initMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Создаем оверлей для затемнения фона
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }

    if (hamburger && mobileMenu) {
        console.log('🍔 Гамбургер меню инициализировано');
        
        const toggleMenu = () => {
            const isActive = hamburger.classList.contains('active');
            console.log('🍔 Гамбургер кликнут, состояние:', isActive ? 'активно' : 'неактивно');
            
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Блокируем скролл только если меню открыто
            if (!isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        hamburger.addEventListener('click', toggleMenu);

        // Закрытие меню при клике на оверлей
        overlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Закрытие меню при клике на ссылку
        const mobileMenuLinks = mobileMenu.querySelectorAll('.mobile-menu-nav-a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрытие меню при ресайзе (если перешли на десктоп)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1200) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Закрытие меню при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error('🍔 Элементы гамбургер меню не найдены:', {
            hamburger: hamburger,
            mobileMenu: mobileMenu
        });
    }

    // Отладочная информация
    console.log('🍔 DOM загружен, гамбургер:', document.querySelector('.hamburger'));
    console.log('🍔 Мобильное меню:', document.querySelector('.mobile-menu'));
    console.log('🍔 Оверлей:', document.querySelector('.mobile-menu-overlay'));
}

// Экспортируем по умолчанию для совместимости
export default initMenu;