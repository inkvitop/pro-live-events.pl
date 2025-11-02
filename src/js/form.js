// form.js
import { getCurrentLanguage } from './i18n.js';
import { FormSubmit } from './formSubmit.js';

export function initForm() {
    const form = document.querySelector('.form--contact');
    if (!form) {
        // console.log('📝 Form not found');
        return;
    }

    // console.log('📝 Form initialization started');
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const submitButton = document.querySelector('.form__submit');

    if (!nameInput || !emailInput || !phoneInput || !messageInput || !submitButton) {
        // console.log('📝 Form inputs not found');
        return;
    }

    // Создаем контейнер для уведомлений рядом с кнопкой
    function createNotificationsContainer() {
        let container = document.querySelector('.form-notifications');
        if (!container) {
            container = document.createElement('div');
            container.className = 'form-notifications';
            container.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 15px;
                min-width: 300px;
                max-width: 400px;
                pointer-events: none;
            `;
            
            // Вставляем контейнер перед кнопкой
            submitButton.parentNode.insertBefore(container, submitButton);
        }
        return container;
    }

    // Используем вашу существующую систему переводов
    function getTranslation(key) {
        const lang = getCurrentLanguage();
        const translations = {
            pl: {
                'contacts.form.errors.nameRequired': 'Imię i nazwisko jest wymagane',
                'contacts.form.errors.contactRequired': 'Proszę podać adres email lub numer telefonu',
                'contacts.form.errors.messageRequired': 'Wiadomość jest wymagana',
                'contacts.form.errors.success': 'Formularz został wysłany pomyślnie!',
                'contacts.form.errors.emailInvalid': 'Proszę podać poprawny adres email'
            },
            en: {
                'contacts.form.errors.nameRequired': 'Full name is required',
                'contacts.form.errors.contactRequired': 'Please provide email or phone number',
                'contacts.form.errors.messageRequired': 'Message is required',
                'contacts.form.errors.success': 'Form submitted successfully!',
                'contacts.form.errors.emailInvalid': 'Please provide a valid email address'
            }
        };
        
        return translations[lang]?.[key] || key;
    }

    function validateForm() {
        const errors = [];

        // console.log('🔍 DEBUG validateForm:');
        // console.log('  - Current language:', getCurrentLanguage());

        // Проверка имени (обязательное поле)
        const nameValue = nameInput.value.trim();
        // console.log('  - Name value:', nameValue);
        if (nameValue === '') {
            const errorText = getTranslation('contacts.form.errors.nameRequired');
            // console.log('  - Name error text:', errorText);
            errors.push(errorText);
        }

        // Проверка email или телефона (минимум одно должно быть заполнено)
        const emailValue = emailInput.value.trim();
        const phoneValue = phoneInput.value.trim();
        // console.log('  - Email value:', emailValue);
        // console.log('  - Phone value:', phoneValue);
        if (emailValue === '' && phoneValue === '') {
            const errorText = getTranslation('contacts.form.errors.contactRequired');
            // console.log('  - Contact error text:', errorText);
            errors.push(errorText);
        }

        // Валидация email если указан
        if (emailValue && !isValidEmail(emailValue)) {
            const errorText = getTranslation('contacts.form.errors.emailInvalid');
            // console.log('  - Email invalid error text:', errorText);
            errors.push(errorText);
        }

        // Проверка сообщения (не должно быть пустым или только пробелы)
        const messageValue = messageInput.value.trim();
        // console.log('  - Message value:', messageValue);
        if (messageValue === '') {
            const errorText = getTranslation('contacts.form.errors.messageRequired');
            // console.log('  - Message error text:', errorText);
            errors.push(errorText);
        }

        // console.log('  - Total errors:', errors);
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Делаем функцию глобально доступной для FormSubmit
    window.showNotification = function(message, type = 'error') {
        const container = createNotificationsContainer();
        
        const notification = document.createElement('div');
        notification.className = `form-notification form-notification--${type}`;
        notification.style.cssText = `
            background: ${type === 'error' ? 'rgba(255, 77, 79, 0.95)' : 'rgba(82, 196, 26, 0.95)'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-weight: 500;
            font-size: 14px;
            line-height: 1.4;
            animation: slideInDown 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'error' ? 'rgba(255, 77, 79, 0.3)' : 'rgba(82, 196, 26, 0.3)'};
            text-align: center;
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        `;

        // Добавляем стрелочку
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid ${type === 'error' ? 'rgba(255, 77, 79, 0.95)' : 'rgba(82, 196, 26, 0.95)'};
        `;

        notification.textContent = message;
        notification.appendChild(arrow);
        container.appendChild(notification);

        // Автоматическое удаление через 5 секунд
        const removeTimeout = setTimeout(() => {
            removeNotification(notification);
        }, 5000);

        // Возможность закрыть кликом
        notification.addEventListener('click', () => {
            clearTimeout(removeTimeout);
            removeNotification(notification);
        });

        // Добавляем hover эффект
        notification.addEventListener('mouseenter', () => {
            notification.style.transform = 'translateY(-2px)';
            notification.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        });

        notification.addEventListener('mouseleave', () => {
            notification.style.transform = 'translateY(0)';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
    };

    function removeNotification(notification) {
        notification.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            // Удаляем контейнер если он пустой
            const container = document.querySelector('.form-notifications');
            if (container && container.children.length === 0) {
                container.parentNode.removeChild(container);
            }
        }, 300);
    }

    // Валидация в реальном времени
    function initRealTimeValidation() {
        // Валидация email
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !isValidEmail(email)) {
                    this.setCustomValidity('Please enter a valid email address');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });
        }

        // Валидация обязательных полей
        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.setCustomValidity('This field is required');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });
        });

        // Очистка валидации при вводе
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', function() {
                this.setCustomValidity('');
            });
        });
    }

    // Обработчик отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // console.log('🔄 Form submission started');
        const validation = validateForm();
        
        if (!validation.isValid) {
            // console.log('❌ Form validation failed:', validation.errors);
            // Показываем все ошибки как отдельные уведомления
            validation.errors.forEach(error => {
                window.showNotification(error, 'error');
            });
            return;
        }

        // Если форма валидна, данные будут отправлены через FormSubmit
        // console.log('✅ Form validation passed - FormSubmit will handle submission');
    });

    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from { 
                opacity: 0; 
                transform: translateY(-20px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        @keyframes slideOutUp {
            from { 
                opacity: 1; 
                transform: translateY(0); 
            }
            to { 
                opacity: 0; 
                transform: translateY(-20px); 
            }
        }
    `;
    document.head.appendChild(style);

    // Инициализируем валидацию в реальном времени
    initRealTimeValidation();

    // Инициализируем систему отправки EmailJS
    new FormSubmit(form);

    // console.log('📝 Form and EmailJS FormSubmit initialized successfully');
}