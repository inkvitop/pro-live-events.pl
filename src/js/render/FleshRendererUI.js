// src/js/render/FleshRendererUI.js
import { Helpers } from '../utils/helpers.js';

export class FleshRendererUI {
    constructor(renderer) {
        this.renderer = renderer;
    }

    handleFinalError(message) {
        if (!this.renderer.container) return;
        
        this.renderer.container.innerHTML = `
            <div class="flesh-error">
                <h2 data-i18n="fleshProducts.title"></h2>
                <p>${message}</p>
                <button class="retry-btn" data-i18n="fleshProducts.refresh"></button>
            </div>
        `;

        this.applyI18n();

        const retryBtn = this.renderer.container.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.renderer.isInitialized = false;
                this.renderer.init();
            });
        }
    }

    showLoading() {
        if (!this.renderer.container) return;
        this.renderer.container.innerHTML = `
            <div class="flesh-loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    showEmptyState() {
        if (!this.renderer.container) return;

        this.renderer.container.innerHTML = `
            <div class="flesh-empty">
                <h2 data-i18n="fleshProducts.title"></h2>
                <p data-i18n="fleshProducts.empty"></p>
                <button class="retry-btn" data-i18n="fleshProducts.refresh"></button>
            </div>
        `;

        this.applyI18n();

        const retryBtn = this.renderer.container.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.renderer.isInitialized = false;
                this.renderer.init();
            });
        }
    }

    render() {
        if (!this.renderer.container) return;
        
        this.renderer.container.scrollTop = 0;
        
        if (this.renderer.data.filteredProducts.length === 0) {
            this.renderer.data.filteredProducts = [...this.renderer.data.allProducts];
        }
        
        const paginatedProducts = this.renderer.data.getPaginatedProducts();
        const totalPages = this.renderer.data.getTotalPages();
        
        let html = `
            <div class="flesh-container">
                <h2 class="flesh-title" data-i18n="fleshProducts.title"></h2>
        `;

        if (paginatedProducts.length === 0) {
            html += `
                <div class="flesh-empty">
                    <p data-i18n="fleshProducts.notFound"></p>
                    <button class="show-all-btn" data-i18n="fleshProducts.showAll"></button>
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
                        <button class="pagination-btn ${this.renderer.data.currentPage === 1 ? 'disabled' : ''}" 
                                data-page="${this.renderer.data.currentPage - 1}">
                            ←
                        </button>
                        
                        <div class="pagination-numbers">
                            ${Array.from({length: totalPages}, (_, i) => i + 1)
                                .map(page => `
                                    <button class="pagination-btn ${this.renderer.data.currentPage === page ? 'active' : ''}" 
                                            data-page="${page}">
                                        ${page}
                                    </button>
                                `).join('')}
                        </div>
                        
                        <button class="pagination-btn ${this.renderer.data.currentPage === totalPages ? 'disabled' : ''}" 
                                data-page="${this.renderer.data.currentPage + 1}">
                            →
                        </button>
                    </div>
                `;
            }
        }

        html += `</div>`;
        this.renderer.container.innerHTML = html;

        this.addEventListeners();
        this.applyI18n(); // <<< 🔥 ключевой вызов для динамического перевода
    }

    renderProductCard(product, index) {
        const allImages = this.renderer.data.getAllProductImages(product.raw);
        
        return `
            <div class="flesh-product" data-product-code="${product.code}" data-index="${index}">
                <div class="product-gallery">
                    ${this.renderProductGallery(allImages)}
                    ${!product.inStock ? '<div class="out-of-stock">Out of stock</div>' : ''}
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

    renderProductGallery(images) {
        if (!images || images.length === 0) {
            return `
                <div class="gallery-main">
                    <div class="no-image">No Image</div>
                </div>
            `;
        }
        
        const mainImage = images[0];
        const thumbnails = images.slice(0, 5);
        
        return `
            <div class="gallery-main">
                <img src="${mainImage}" alt="Product image" loading="lazy">
            </div>
            ${thumbnails.length > 1 ? `
                <div class="gallery-thumbnails">
                    ${thumbnails.map((img, idx) => `
                        <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image="${img}">
                            <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    addEventListeners() {
        const productCards = this.renderer.container.querySelectorAll('.flesh-product');
        
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.product-details-btn') || e.target.closest('.thumbnail')) return;
                
                const productCode = card.getAttribute('data-product-code');
                const product = this.renderer.data.allProducts.find(p => 
                    (p.product_code || p.code) === productCode
                );
                
                if (product) {
                    this.renderer.modal.showProductDetails(product);
                }
            });
        });

        const thumbnails = this.renderer.container.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const imageUrl = thumbnail.getAttribute('data-image');
                const productCard = thumbnail.closest('.flesh-product');
                const mainImage = productCard.querySelector('.gallery-main img');
                
                if (mainImage && imageUrl) {
                    productCard.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                    thumbnail.classList.add('active');
                    mainImage.src = imageUrl;
                }
            });
        });

        const showAllBtn = this.renderer.container.querySelector('.show-all-btn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                this.renderer.data.filterProductsByCategory('all');
            });
        }

        const detailButtons = this.renderer.container.querySelectorAll('.product-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCode = button.getAttribute('data-product-code');
                const product = this.renderer.data.allProducts.find(p => 
                    (p.product_code || p.code) === productCode
                );
                if (product) {
                    this.renderer.modal.showProductDetails(product);
                }
            });
        });
    }

    /**
     * 🔥 Применяет перевод только к секции Flesh
     */
    applyI18n() {
        if (window.applyTranslations && window.getCurrentLanguage) {
            window.applyTranslations(window.getCurrentLanguage(), this.renderer.container);
        }
    }
}
