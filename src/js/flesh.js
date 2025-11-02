// flesh.js
class FleshAPI {
    constructor() {
        this.apiKey = '$2y$10$/deiWOgg0uNBLlgzD/2WueStRmjlINlDkndMi6cEytMylhRhA3Hqu';
        this.email = 'plinkvitop@gmail.com';
        this.baseURL = '/api';
        this.token = null;
        this.tokenExpiry = null;
    }

    async getAuthToken() {
        try {
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                console.log('🔐 Using cached token');
                return this.token;
            }

            console.log('🔐 Getting auth token from:', `${this.baseURL}/token`);
            
            const response = await fetch(`${this.baseURL}/token`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.email,
                    'Authorization': `Bearer ${this.apiKey}`
                },
                credentials: 'omit'
            });

            console.log('📡 Token response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Token error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Token response JSON:', data);
            
            // ПРОСТАЯ ПРОВЕРКА - если есть токен, то все ок
            if (!data.token) {
                throw new Error(`API error: No token received`);
            }
            
            this.token = data.token;
            this.tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
            
            console.log('🔑 Token received successfully, expires:', this.tokenExpiry);
            return this.token;
            
        } catch (error) {
            console.error('💥 Error getting auth token:', error);
            throw error;
        }
    }

    async getProducts() {
        try {
            const token = await this.getAuthToken();
            
            console.log('📦 Getting products from:', `${this.baseURL}/products`);
            
            const response = await fetch(`${this.baseURL}/products`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'omit'
            });

            console.log('📡 Products response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Products error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Products response JSON:', data);
            
            // ПРОСТАЯ ПРОВЕРКА - если есть list с продуктами, то все ок
            if (!data.list || !Array.isArray(data.list)) {
                console.warn('⚠️ No products list found in response');
                return [];
            }
            
            console.log('🛍️ Found products:', data.list.length, 'items');
            
            if (data.list.length > 0) {
                console.log('📋 First product sample:', data.list[0]);
            }
            
            return data.list;
            
        } catch (error) {
            console.error('💥 Error getting products:', error);
            return [];
        }
    }

    async getCategories() {
        try {
            const token = await this.getAuthToken();
            
            console.log('📂 Getting categories from:', `${this.baseURL}/categories`);
            
            const response = await fetch(`${this.baseURL}/categories`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'omit'
            });

            console.log('📡 Categories response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Categories error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Categories response JSON:', data);
            
            // ПРОСТАЯ ПРОВЕРКА - если есть list с категориями, то все ок
            if (!data.list || !Array.isArray(data.list)) {
                console.warn('⚠️ No categories list found in response');
                return [];
            }
            
            console.log('🏷️ Found categories:', data.list.length, 'items');
            
            if (data.list.length > 0) {
                console.log('📝 First category sample:', data.list[0]);
            }
            
            return data.list;
            
        } catch (error) {
            console.error('💥 Error getting categories:', error);
            return [];
        }
    }
}

class FleshRenderer {
    constructor() {
        this.api = new FleshAPI();
        this.container = null;
        this.isInitialized = false;
        
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.allProducts = [];
        this.filteredProducts = [];
        this.categories = [];
        this.uniqueCategories = [];
        this.currentCategory = 'all';
        
        // Для управления попапом
        this.modal = null;
        this.currentProduct = null;
    }

    async init() {
        try {
            this.container = document.querySelector('.flesh');
            if (!this.container) {
                console.log('❌ Flesh container not found');
                return;
            }
            
            if (this.isInitialized) {
                console.log('✅ Flesh already initialized');
                return;
            }

            console.log('🚀 Starting Flesh initialization...');
            this.showLoading();
            
            const [products, categories] = await Promise.all([
                this.api.getProducts(),
                this.api.getCategories()
            ]);

            this.allProducts = products;
            this.categories = categories;
            
            console.log('📦 Raw products:', products);
            console.log('🏷️ Raw categories:', categories);
            
            this.processCategories(categories);
            
            console.log('📊 Loaded - Products:', products.length, 'Unique Categories:', this.uniqueCategories.length);
            
            if (products.length === 0) {
                console.warn('⚠️ No products loaded, showing empty state');
                this.showEmptyState();
            } else {
                this.render();
                this.createModal(); // Создаем модальное окно
            }
            
            this.isInitialized = true;
            console.log('✅ Flesh initialized successfully');
            
        } catch (error) {
            console.error('💥 Flesh initialization error:', error);
            this.showError('Failed to load products. Please try again.');
        }
    }

    // НОВЫЙ МЕТОД: Прокрутка к началу секции
    scrollToSection() {
        // Несколько способов найти секцию для надежности
        const section = document.querySelector('.flesh') || 
                       document.querySelector('.flesh-container') || 
                       this.container;
        
        if (section) {
            try {
                // Способ 1: Используем scrollIntoView
                section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            } catch (error) {
                // Способ 2: Fallback на обычную прокрутку
                console.log('Using fallback scroll method');
                const yOffset = -100;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }

    createModal() {
        // Создаем HTML для модального окна
        const modalHTML = `
            <div class="flesh-modal" id="fleshModal">
                <div class="flesh-modal-overlay"></div>
                <div class="flesh-modal-content">
                    <button class="flesh-modal-close" id="fleshModalClose">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="flesh-modal-body" id="fleshModalBody">
                        <!-- Контент будет заполняться динамически -->
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('fleshModal');
        
        // Добавляем обработчики событий
        this.addModalEventListeners();
    }

    addModalEventListeners() {
        const closeBtn = document.getElementById('fleshModalClose');
        const overlay = this.modal.querySelector('.flesh-modal-overlay');
        
        const closeModal = () => {
            this.modal.classList.remove('active');
            document.body.style.overflow = ''; // Восстанавливаем прокрутку
            
            // ОЧИЩАЕМ содержимое модального окна при закрытии
            const modalBody = document.getElementById('fleshModalBody');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    showProductDetails(product) {
        this.currentProduct = product;
        const modalBody = document.getElementById('fleshModalBody');
        const modalContent = this.modal.querySelector('.flesh-modal-content');
        
        if (!modalBody || !modalContent) return;
        
        const productData = this.extractProductData(product);
        
        // ПРИНУДИТЕЛЬНО СБРАСЫВАЕМ СКРОЛЛ ПЕРЕД ОТКРЫТИЕМ
        modalBody.scrollTop = 0;
        modalContent.scrollTop = 0;
        
        modalBody.innerHTML = this.renderProductModal(productData);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        
        // ДОПОЛНИТЕЛЬНОЕ ОБЕСПЕЧЕНИЕ СБРОСА СКРОЛЛА
        setTimeout(() => {
            modalBody.scrollTop = 0;
            modalContent.scrollTop = 0;
            
            // Дополнительная проверка через небольшой интервал
            setTimeout(() => {
                modalBody.scrollTop = 0;
                modalContent.scrollTop = 0;
            }, 50);
        }, 10);
    }

    renderProductModal(product) {
        // ВСЕГДА используем польское описание если доступно
        const polishData = product.raw.lang?.pl || {};
        const fullDescription = polishData.description || product.raw.default_description || '';
        const specs = this.extractSpecifications(product.raw);
        
        return `
            <div class="flesh-modal-product">
                <div class="flesh-modal-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy">` : 
                        '<div class="no-image">No Image</div>'
                    }
                </div>
                
                <div class="flesh-modal-info">
                    <h2 class="flesh-modal-title">${this.escapeHtml(product.name)}</h2>
                    
                    <div class="flesh-modal-price">${product.price}</div>
                    
                    <div class="flesh-modal-meta">
                        <div class="flesh-modal-code"><strong>Product Code:</strong> ${product.code}</div>
                        ${product.brand ? `<div class="flesh-modal-brand"><strong>Brand:</strong> ${this.escapeHtml(product.brand)}</div>` : ''}
                        ${product.raw.ean ? `<div class="flesh-modal-ean"><strong>EAN:</strong> ${product.raw.ean}</div>` : ''}
                    </div>
                    
                    ${fullDescription ? `
                        <div class="flesh-modal-description">
                            <h3>Description</h3>
                            <div class="flesh-modal-description-content">${fullDescription}</div>
                        </div>
                    ` : ''}
                    
                    ${specs ? `
                        <div class="flesh-modal-specs">
                            <h3>Specifications</h3>
                            <div class="flesh-modal-specs-content">${specs}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    extractSpecifications(product) {
        // ВСЕГДА сначала ищем спецификации в польской локали
        const polishSpecs = product.lang?.pl?.specs;
        
        if (polishSpecs && Array.isArray(polishSpecs)) {
            return this.renderSpecsArray(polishSpecs);
        }
        
        // Если в польской локали нет, пробуем другие места как fallback
        if (product.specs && Array.isArray(product.specs)) {
            return this.renderSpecsArray(product.specs);
        }
        
        // Пробуем другие языки как последний fallback
        if (product.lang) {
            for (const [langCode, langData] of Object.entries(product.lang)) {
                if (langData.specs && Array.isArray(langData.specs)) {
                    console.log(`⚠️ Using specs from ${langCode} locale as fallback`);
                    return this.renderSpecsArray(langData.specs);
                }
            }
        }
        
        return '';
    }

    renderSpecsArray(specs) {
        if (!specs || !Array.isArray(specs)) return '';
        
        return specs.map(specGroup => {
            if (!specGroup.header || !specGroup.data) return '';
            
            return `
                <div class="flesh-modal-spec-group">
                    <h4>${this.escapeHtml(specGroup.header)}</h4>
                    <div class="flesh-modal-spec-list">
                        ${specGroup.data.map(spec => `
                            <div class="flesh-modal-spec-item">
                                <span class="flesh-modal-spec-name">${this.escapeHtml(spec.name)}:</span>
                                <span class="flesh-modal-spec-value">${this.escapeHtml(spec.value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    processCategories(categories) {
        const allCategoryStrings = [];
        
        // Обрабатываем категории из API
        categories.forEach(category => {
            if (typeof category === 'string') {
                allCategoryStrings.push(category);
            } else if (category.name) {
                allCategoryStrings.push(category.name);
            }
            // Также проверяем вложенные категории
            if (category.categories && Array.isArray(category.categories)) {
                category.categories.forEach(cat => {
                    if (typeof cat === 'string') allCategoryStrings.push(cat);
                });
            }
        });

        const uniqueCats = new Set();
        
        // Обрабатываем иерархические категории
        allCategoryStrings.forEach(catString => {
            if (catString && typeof catString === 'string') {
                if (catString.includes('>')) {
                    const parts = catString.split('>').map(part => part.trim());
                    parts.forEach(part => {
                        if (part) uniqueCats.add(part);
                    });
                } else {
                    uniqueCats.add(catString.trim());
                }
            }
        });

        this.uniqueCategories = Array.from(uniqueCats).filter(cat => cat).sort();
        console.log('📂 Processed categories:', this.uniqueCategories);
    }

    showEmptyState() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="flesh-empty">
                <h2>Our Products</h2>
                <p>No products available at the moment.</p>
                <p>Loaded ${this.allProducts.length} products and ${this.uniqueCategories.length} categories.</p>
                <button class="retry-btn">Try Again</button>
            </div>
        `;

        const retryBtn = this.container.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.isInitialized = false;
                this.init();
            });
        }
    }

    filterProductsByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        if (category === 'all') {
            this.filteredProducts = [...this.allProducts];
        } else {
            this.filteredProducts = this.allProducts.filter(product => {
                const productCategories = this.getProductCategories(product);
                return productCategories.some(cat => 
                    cat && category && (cat.includes(category) || category.includes(cat))
                );
            });
        }
        
        this.render();
        
        // Плавная прокрутка к началу секции после рендера
        setTimeout(() => {
            this.scrollToSection();
        }, 100);
    }

    getProductCategories(product) {
        const categories = [];
        
        // Сначала проверяем польскую локаль
        const polishCategories = product.lang?.pl?.categories;
        if (polishCategories && Array.isArray(polishCategories)) {
            polishCategories.forEach(cat => {
                if (typeof cat === 'string') categories.push(cat);
            });
        }
        
        // Затем другие источники как fallback
        if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach(cat => {
                if (typeof cat === 'string') categories.push(cat);
            });
        }
        
        if (product.default_categories && Array.isArray(product.default_categories)) {
            product.default_categories.forEach(cat => {
                if (typeof cat === 'string') categories.push(cat);
            });
        }
        
        if (product.lang) {
            Object.values(product.lang).forEach(langData => {
                if (langData.categories && Array.isArray(langData.categories)) {
                    langData.categories.forEach(cat => {
                        if (typeof cat === 'string') categories.push(cat);
                    });
                }
            });
        }
        
        return categories.filter(cat => cat); // Убираем пустые значения
    }

    getPaginatedProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        return this.filteredProducts.slice(startIndex, endIndex);
    }

    getTotalPages() {
        return Math.ceil(this.filteredProducts.length / this.productsPerPage);
    }

    changePage(page) {
        this.currentPage = page;
        this.render();
        
        // Плавная прокрутка к началу секции после рендера
        setTimeout(() => {
            this.scrollToSection();
        }, 100);
    }

    showLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="flesh-loading">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }

    showError(message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="flesh-error">
                <h2>Our Products</h2>
                <p>${message}</p>
                <button class="retry-btn">Try Again</button>
            </div>
        `;

        const retryBtn = this.container.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.isInitialized = false;
                this.init();
            });
        }
    }

    render() {
        if (!this.container) return;
        
        // Сбрасываем скролл контейнера перед рендером
        this.container.scrollTop = 0;
        
        // Если фильтрованные продукты пусты, показываем все
        if (this.filteredProducts.length === 0) {
            this.filteredProducts = [...this.allProducts];
        }
        
        const paginatedProducts = this.getPaginatedProducts();
        const totalPages = this.getTotalPages();
        
        let html = `
            <div class="flesh-container">
                <h2 class="flesh-title">Our Products</h2>
                
                <div class="flesh-stats">
                    <p>Showing ${paginatedProducts.length} of ${this.filteredProducts.length} products 
                       ${this.currentCategory !== 'all' ? `in "${this.currentCategory}"` : ''}
                    </p>
                </div>
        `;

        if (this.uniqueCategories.length > 0) {
            html += `
                <div class="flesh-categories">
                    <div class="categories-filter">
                        <button class="category-btn ${this.currentCategory === 'all' ? 'active' : ''}" 
                                data-category="all">
                            All Products (${this.allProducts.length})
                        </button>
                        ${this.uniqueCategories.map(category => {
                            const count = this.allProducts.filter(product => {
                                const productCats = this.getProductCategories(product);
                                return productCats.some(cat => cat && category && (cat.includes(category) || category.includes(cat)));
                            }).length;
                            
                            if (count > 0) {
                                return `
                                    <button class="category-btn ${this.currentCategory === category ? 'active' : ''}" 
                                            data-category="${this.escapeHtml(category)}">
                                        ${this.escapeHtml(category)} (${count})
                                    </button>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>
                </div>
            `;
        }

        if (paginatedProducts.length === 0) {
            html += `
                <div class="flesh-empty">
                    <p>No products found in this category</p>
                    <button class="show-all-btn">Show All Products</button>
                </div>
            `;
        } else {
            html += `
                <div class="flesh-products">
                    ${paginatedProducts.map((product, index) => {
                        const productData = this.extractProductData(product);
                        return this.renderProductCard(productData, index);
                    }).join('')}
                </div>
            `;

            if (totalPages > 1) {
                html += `
                    <div class="flesh-pagination">
                        <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                                data-page="${this.currentPage - 1}">
                            ← Previous
                        </button>
                        
                        <div class="pagination-numbers">
                            ${Array.from({length: totalPages}, (_, i) => i + 1)
                                .map(page => `
                                    <button class="pagination-btn ${this.currentPage === page ? 'active' : ''}" 
                                            data-page="${page}">
                                        ${page}
                                    </button>
                                `).join('')}
                        </div>
                        
                        <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                                data-page="${this.currentPage + 1}">
                            Next →
                        </button>
                    </div>
                `;
            }
        }

        html += `</div>`;
        this.container.innerHTML = html;
        this.addEventListeners();
    }

    extractProductData(rawProduct) {
        // Безопасное извлечение данных продукта
        const productCode = rawProduct.product_code || rawProduct.code || rawProduct.id || `ITEM-${Date.now()}`;
        
        // ВСЕГДА используем польскую локаль (pl) если доступна
        const polishData = rawProduct.lang?.pl || {};
        
        const productName = polishData.name || rawProduct.default_name || rawProduct.name || 'Unnamed Product';
        const productDescription = polishData.short_description || rawProduct.default_short_description || rawProduct.short_description || '';
        
        return {
            code: productCode,
            name: productName,
            description: productDescription,
            price: this.extractPrice(rawProduct),
            brand: rawProduct.brand || '',
            image: this.extractImage(rawProduct),
            inStock: this.extractStockStatus(rawProduct),
            isArchived: rawProduct.isArchived || false,
            raw: rawProduct
        };
    }

    extractPrice(product) {
        if (product.regular_netto !== undefined && product.regular_netto !== null) {
            const price = parseFloat(product.regular_netto);
            if (!isNaN(price)) {
                return `${price.toFixed(2)} PLN`;
            }
        }
        
        return 'Price on request';
    }

    extractImage(product) {
        if (product.images) {
            if (typeof product.images === 'string') {
                return product.images;
            }
            if (product.images.main) {
                return product.images.main;
            }
            if (Array.isArray(product.images) && product.images.length > 0) {
                return product.images[0];
            }
        }
        
        return '';
    }

    extractStockStatus(product) {
        if (product.amount !== undefined) {
            return product.amount > 0;
        }
        return true; // По умолчанию в наличии
    }

    renderProductCard(product, index) {
        const imageHtml = product.image ? 
            `<img src="${product.image}" alt="${product.name}" loading="lazy">` : 
            '<div class="no-image">No Image</div>';
        
        const stockBadge = !product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : '';
        
        return `
            <div class="flesh-product" data-product-code="${product.code}" data-index="${index}">
                <div class="product-image-container">
                    <div class="product-image">
                        ${imageHtml}
                        ${stockBadge}
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-content">
                        <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                        ${product.description ? `<p class="product-short-description">${this.escapeHtml(product.description)}</p>` : ''}
                    </div>
                    <div class="product-bottom-section">
                        <div class="product-price">${product.price}</div>
                        <button class="product-details-btn" data-product-code="${product.code}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        // Обработчики для клика по всей карточке продукта
        const productCards = this.container.querySelectorAll('.flesh-product');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Не открываем попап если кликнули на кнопку (чтобы избежать двойного срабатывания)
                if (e.target.closest('.product-details-btn')) return;
                
                const productCode = card.getAttribute('data-product-code');
                const product = this.allProducts.find(p => 
                    (p.product_code || p.code) === productCode
                );
                
                if (product) {
                    this.showProductDetails(product);
                }
            });
        });

        // Обработчики для кнопок категорий
        const categoryButtons = this.container.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.filterProductsByCategory(category);
            });
        });

        // Обработчики для пагинации
        const paginationButtons = this.container.querySelectorAll('.pagination-btn:not(.disabled)');
        paginationButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && page > 0) {
                    this.changePage(page);
                }
            });
        });

        // Кнопка "Show All Products"
        const showAllBtn = this.container.querySelector('.show-all-btn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterProductsByCategory('all');
            });
        }

        // Кнопки деталей продукта
        const detailButtons = this.container.querySelectorAll('.product-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие до карточки
                e.preventDefault();
                const productCode = e.target.getAttribute('data-product-code');
                const product = this.allProducts.find(p => 
                    (p.product_code || p.code) === productCode
                );
                
                if (product) {
                    this.showProductDetails(product);
                }
            });
        });
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Создаем глобальный экземпляр
const fleshRenderer = new FleshRenderer();

// Экспортируем для использования в других модулях
export { fleshRenderer };

// Инициализируем когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM ready, initializing Flesh...');
    fleshRenderer.init();
});

// Делаем доступным глобально для отладки
window.fleshRenderer = fleshRenderer;