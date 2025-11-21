// src/js/render/FleshRenderer.js
import { FleshAPI } from '../api/FleshAPI.js';
import { Helpers } from '../utils/helpers.js';

export class FleshRenderer {
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
            console.log('🌐 API Base URL:', this.api.baseURL);
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
                this.createModal();
            }
            
            this.isInitialized = true;
            console.log('✅ Flesh initialized successfully');
            
        } catch (error) {
            console.error('💥 Flesh initialization error:', error);
            this.showError('Failed to load products. Please try again.');
        }
    }

    scrollToSection() {
        const section = document.querySelector('.flesh') || 
                       document.querySelector('.flesh-container') || 
                       this.container;
        
        if (section) {
            try {
                section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            } catch (error) {
                console.log('Using fallback scroll method');
                const yOffset = -100;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }

    createModal() {
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
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('fleshModal');
        
        this.addModalEventListeners();
    }

    addModalEventListeners() {
        const closeBtn = document.getElementById('fleshModalClose');
        const overlay = this.modal.querySelector('.flesh-modal-overlay');
        
        const closeModal = () => {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            
            const modalBody = document.getElementById('fleshModalBody');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        
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
        
        const productData = Helpers.extractProductData(product);
        
        modalBody.scrollTop = 0;
        modalContent.scrollTop = 0;
        
        modalBody.innerHTML = this.renderProductModal(productData);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modalBody.scrollTop = 0;
            modalContent.scrollTop = 0;
            
            setTimeout(() => {
                modalBody.scrollTop = 0;
                modalContent.scrollTop = 0;
            }, 50);
        }, 10);
    }

    renderProductModal(product) {
        const polishData = product.raw.lang?.pl || {};
        const fullDescription = polishData.description || product.raw.default_description || '';
        const specs = Helpers.extractSpecifications(product.raw);
        
        return `
            <div class="flesh-modal-product">
                <div class="flesh-modal-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy" 
                              onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">` : 
                        '<div class="no-image">No Image</div>'
                    }
                </div>
                
                <div class="flesh-modal-info">
                    <h2 class="flesh-modal-title">${Helpers.escapeHtml(product.name)}</h2>
                    
                    <div class="flesh-modal-price">${product.price}</div>
                    
                    <div class="flesh-modal-meta">
                        <div class="flesh-modal-code"><strong>Product Code:</strong> ${product.code}</div>
                        ${product.brand ? `<div class="flesh-modal-brand"><strong>Brand:</strong> ${Helpers.escapeHtml(product.brand)}</div>` : ''}
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

    processCategories(categories) {
        const allCategoryStrings = [];
        
        categories.forEach(category => {
            if (typeof category === 'string') {
                allCategoryStrings.push(category);
            } else if (category.name) {
                allCategoryStrings.push(category.name);
            }
            if (category.categories && Array.isArray(category.categories)) {
                category.categories.forEach(cat => {
                    if (typeof cat === 'string') allCategoryStrings.push(cat);
                });
            }
        });

        const uniqueCats = new Set();
        
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
        
        setTimeout(() => {
            this.scrollToSection();
        }, 100);
    }

    getProductCategories(product) {
        const categories = [];
        
        const polishCategories = product.lang?.pl?.categories;
        if (polishCategories && Array.isArray(polishCategories)) {
            polishCategories.forEach(cat => {
                if (typeof cat === 'string') categories.push(cat);
            });
        }
        
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
        
        return categories.filter(cat => cat);
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
        
        this.container.scrollTop = 0;
        
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
                                            data-category="${Helpers.escapeHtml(category)}">
                                        ${Helpers.escapeHtml(category)} (${count})
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
                        const productData = Helpers.extractProductData(product);
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

    renderProductCard(product, index) {
        const imageHtml = product.image ? 
            `<img src="${product.image}" alt="${product.name}" loading="lazy" 
                  onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">` : 
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
                        <h3 class="product-name">${Helpers.escapeHtml(product.name)}</h3>
                        ${product.description ? `<p class="product-short-description">${Helpers.escapeHtml(product.description)}</p>` : ''}
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
        const productCards = this.container.querySelectorAll('.flesh-product');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
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

        const categoryButtons = this.container.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.filterProductsByCategory(category);
            });
        });

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

        const showAllBtn = this.container.querySelector('.show-all-btn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterProductsByCategory('all');
            });
        }

        const detailButtons = this.container.querySelectorAll('.product-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
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
}