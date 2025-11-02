// formSubmit.js
import { getCurrentLanguage } from './i18n.js';

export class FormSubmit {
    constructor(formElement) {
        this.form = formElement;
        this.isSubmitting = false;
        
        // EmailJS конфигурация
        this.emailjsConfig = {
            serviceId: 'service_g7nuqho',
            templateId: 'template_59zzxg7',
            publicKey: '6IU9ExLVLsK1m5nV0'
        };
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('❌ Form element not found');
            return;
        }

        // console.log('🔧 EmailJS Configuration:', this.emailjsConfig);

        // Инициализируем EmailJS
        this.initEmailJS();

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // console.log('✅ FormSubmit with EmailJS initialized');
    }

    initEmailJS() {
        // Добавляем скрипт EmailJS если его нет
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                // console.log('📧 EmailJS script loaded');
                this.initializeEmailJS();
            };
            script.onerror = () => {
                console.error('❌ Failed to load EmailJS script');
            };
            document.head.appendChild(script);
        } else {
            this.initializeEmailJS();
        }
    }

    initializeEmailJS() {
        try {
            emailjs.init(this.emailjsConfig.publicKey);
            // console.log('✅ EmailJS initialized successfully');
        } catch (error) {
            console.error('❌ EmailJS initialization error:', error);
        }
    }

    async handleSubmit() {
        if (this.isSubmitting) {
            // console.log('⏳ Form is already submitting, skipping...');
            return;
        }

        // console.log('🔄 Starting form submission process...');

        // Получаем данные формы
        const templateParams = this.getTemplateParams();
        
        // Валидация
        const validation = this.validateForm(templateParams);
        if (!validation.isValid) {
            // console.log('❌ Form validation failed:', validation.errors);
            this.showNotifications(validation.errors, 'error');
            return;
        }

        // console.log('✅ Form validation passed');

        // Начинаем отправку
        this.isSubmitting = true;
        this.setSubmitButtonState(true);

        try {
            // console.log('📤 Attempting to send via EmailJS...');
            // console.log('🔧 Sending with parameters:', {
            //     serviceId: this.emailjsConfig.serviceId,
            //     templateId: this.emailjsConfig.templateId,
            //     templateParams: templateParams
            // });

            const response = await this.sendViaEmailJS(templateParams);
            
            // console.log('✅ EmailJS response received:', response);
            this.showNotifications([this.getTranslation('contacts.form.errors.success')], 'success');
            this.form.reset();
            // console.log('🎉 Form submitted successfully via EmailJS');
        } catch (error) {
            console.error('❌ EmailJS submission error:', error);
            console.error('Error details:', {
                status: error.status,
                text: error.text,
                service: this.emailjsConfig.serviceId,
                template: this.emailjsConfig.templateId
            });
            
            let errorMessage = this.getTranslation('contacts.form.errors.submitFailed');
            
            // Более детальные ошибки
            if (error.status === 400) {
                errorMessage = 'Ошибка 400: Проверьте переменные шаблона';
            } else if (error.status === 403) {
                errorMessage = 'Ошибка 403: Проверьте Public Key';
            } else if (error.status === 404) {
                errorMessage = 'Ошибка 404: Шаблон или сервис не найден';
            }
            
            this.showNotifications([errorMessage], 'error');
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(false);
            // console.log('🏁 Form submission process completed');
        }
    }

    getTemplateParams() {
        const formData = new FormData(this.form);
        
        // console.log('📝 Raw form data:');
        for (let [key, value] of formData.entries()) {
            // console.log(`  ${key}:`, value);
        }

        // Собираем выбранные интересы
        const interestCheckboxes = this.form.querySelectorAll('input[name="interest"]:checked');
        // console.log('🎯 Selected interests:', interestCheckboxes.length);
        
        const interests = Array.from(interestCheckboxes)
            .map(checkbox => {
                const label = this.getInterestLabel(checkbox.value);
                // console.log(`  - ${checkbox.value} -> ${label}`);
                return label;
            })
            .join(', ');

        const now = new Date();
        const submissionDate = now.toLocaleString('pl-PL');
        const timeOnly = now.toLocaleTimeString('pl-PL');
        
        // console.log('📅 Date info:', { submissionDate, timeOnly });
        
        // Гарантируем что все значения - строки (БЕЗ to_email)
        const params = {
            from_name: String(formData.get('name')?.trim() || ''),
            from_email: String(formData.get('email')?.trim() || ''),
            phone: String(formData.get('phone')?.trim() || ''),
            message: String(formData.get('message')?.trim() || ''),
            interests: String(interests || 'None'),
            submission_date: String(submissionDate),
            time: String(timeOnly),
            language: String(getCurrentLanguage())
            // to_email удален - EmailJS использует email из настроек сервиса
        };

        console.log('📤 Final template parameters:');
        Object.entries(params).forEach(([key, value]) => {
            // console.log(`  ${key}:`, value, `(type: ${typeof value})`);
        });

        return params;
    }

    getInterestLabel(value) {
        const labels = {
            pl: {
                'concerts': 'Koncerty',
                'lighting': 'Oświetlenie',
                'artist': 'Artyści',
                'event-planning': 'Planowanie wydarzeń',
                'sponsorships': 'Sponsoring',
                'technical': 'Techniczne'
            },
            en: {
                'concerts': 'Concerts',
                'lighting': 'Lighting',
                'artist': 'Artists',
                'event-planning': 'Event Planning',
                'sponsorships': 'Sponsorships',
                'technical': 'Technical'
            }
        };
        
        const lang = getCurrentLanguage();
        const label = labels[lang]?.[value] || value;
        // console.log(`🌐 Interest label for "${value}" in ${lang}:`, label);
        return label;
    }

    validateForm(data) {
        // console.log('🔍 Starting form validation...');
        const errors = [];
        const { from_name, from_email, phone, message } = data;

        // console.log('📋 Validation data:', { from_name, from_email, phone, message });

        // Проверка имени
        if (!from_name || from_name.trim() === '') {
            const error = this.getTranslation('contacts.form.errors.nameRequired');
            // console.log('❌ Name validation failed');
            errors.push(error);
        } else {
            // console.log('✅ Name validation passed');
        }

        // Проверка контактов (email или телефон)
        const hasEmail = from_email && from_email.trim() !== '';
        const hasPhone = phone && phone.trim() !== '';
        
        // console.log('📞 Contact validation:', { hasEmail, hasPhone });
        
        if (!hasEmail && !hasPhone) {
            const error = this.getTranslation('contacts.form.errors.contactRequired');
            // console.log('❌ Contact validation failed');
            errors.push(error);
        } else {
            // console.log('✅ Contact validation passed');
        }

        // Валидация email если указан
        if (hasEmail && !this.isValidEmail(from_email)) {
            const error = this.getTranslation('contacts.form.errors.emailInvalid');
            // console.log('❌ Email validation failed');
            errors.push(error);
        } else if (hasEmail) {
            // console.log('✅ Email validation passed');
        }

        // Проверка сообщения
        if (!message || message.trim() === '') {
            const error = this.getTranslation('contacts.form.errors.messageRequired');
            // console.log('❌ Message validation failed');
            errors.push(error);
        } else {
            // console.log('✅ Message validation passed');
        }

        // console.log('📊 Validation result:', { isValid: errors.length === 0, errors });
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    async sendViaEmailJS(templateParams) {
        // console.log('📧 Starting EmailJS send...');
        
        // Проверяем что EmailJS загружен
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not loaded');
            throw new Error('EmailJS not loaded');
        }

        // console.log('🔧 EmailJS function available:', typeof emailjs.send);

        try {
            const response = await emailjs.send(
                this.emailjsConfig.serviceId,
                this.emailjsConfig.templateId,
                templateParams
            );

            // console.log('✅ EmailJS send successful');
            // console.log('📨 Response details:', {
            //     status: response.status,
            //     text: response.text
            // });

            return response;
        } catch (error) {
            console.error('❌ EmailJS send failed');
            console.error('Error object:', error);
            throw error;
        }
    }

    // Вспомогательные методы
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        // console.log(`📧 Email validation for "${email}":`, isValid);
        return isValid;
    }

    setSubmitButtonState(loading) {
        const submitButton = this.form.querySelector('.form__submit');
        if (!submitButton) {
            console.error('❌ Submit button not found');
            return;
        }

        if (loading) {
            // console.log('⏳ Disabling submit button...');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading-spinner"></span> ' + this.getTranslation('contacts.form.sending');
        } else {
            // console.log('✅ Enabling submit button...');
            submitButton.disabled = false;
            submitButton.textContent = this.getTranslation('contacts.form.submit');
        }
    }

    showNotifications(messages, type) {
        // console.log(`📢 Showing ${type} notifications:`, messages);
        
        messages.forEach(message => {
            if (typeof showNotification === 'function') {
                showNotification(message, type);
            } else {
                // console.log(`📢 ${type.toUpperCase()}:`, message);
                // Fallback alert
                alert(`${type.toUpperCase()}: ${message}`);
            }
        });
    }

    getTranslation(key) {
        const lang = getCurrentLanguage();
        const translations = {
            pl: {
                'contacts.form.errors.nameRequired': 'Imię i nazwisko jest wymagane',
                'contacts.form.errors.contactRequired': 'Proszę podać adres email lub numer telefonu',
                'contacts.form.errors.messageRequired': 'Wiadomość jest wymagana',
                'contacts.form.errors.emailInvalid': 'Proszę podać poprawny adres email',
                'contacts.form.errors.submitFailed': 'Wystąpił błąд podczas wysyłania formularza',
                'contacts.form.errors.success': 'Formularz został wysłany pomyślnie!',
                'contacts.form.sending': 'Wysyłanie...',
                'contacts.form.submit': 'Wyślij wiadomość'
            },
            en: {
                'contacts.form.errors.nameRequired': 'Full name is required',
                'contacts.form.errors.contactRequired': 'Please provide email or phone number',
                'contacts.form.errors.messageRequired': 'Message is required',
                'contacts.form.errors.emailInvalid': 'Please provide a valid email address',
                'contacts.form.errors.submitFailed': 'An error occurred while submitting the form',
                'contacts.form.errors.success': 'Form submitted successfully!',
                'contacts.form.sending': 'Sending...',
                'contacts.form.submit': 'Send Message'
            }
        };
        
        const translation = translations[lang]?.[key] || key;
        // console.log(`🌐 Translation for "${key}" in ${lang}:`, translation);
        return translation;
    }
}

// CSS для спиннера загрузки
const loadStyles = () => {
    if (document.querySelector('#form-submit-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'form-submit-styles';
    style.textContent = `
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .form__submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
    // console.log('🎨 Form submit styles loaded');
};

// Инициализация когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    // console.log('🚀 DOM loaded, initializing FormSubmit...');
    loadStyles();
    const form = document.querySelector('.form--contact');
    if (form) {
        new FormSubmit(form);
        // console.log('✅ FormSubmit initialized successfully');
    } else {
        console.error('❌ Contact form not found in DOM');
    }
});

// Глобальная функция для отладки
window.debugFormSubmit = function() {
    const form = document.querySelector('.form--contact');
    if (form) {
        // console.log('🔍 Form Submit Debug Info:');
        // console.log('Form element:', form);
        // console.log('EmailJS config:', {
        //     serviceId: 'service_g7nuqho',
        //     templateId: 'template_59zzxg7',
        //     publicKey: '6IU9ExLVLsK1m5nV0'
        // });
        console.log('EmailJS loaded:', typeof emailjs !== 'undefined');
        if (typeof emailjs !== 'undefined') {
            // console.log('EmailJS init status:', emailjs.init);
        }
    }
};