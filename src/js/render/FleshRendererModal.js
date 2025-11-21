// src/js/render/FleshRendererModal.js
import { Helpers } from '../utils/helpers.js';

export class FleshRendererModal {
    constructor(renderer) {
        this.renderer = renderer;
        this.modal = null;
        this.currentProduct = null;
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
        const allImages = this.renderer.data.getAllProductImages(product);
        
        modalBody.scrollTop = 0;
        modalContent.scrollTop = 0;
        
        modalBody.innerHTML = this.renderProductModal(productData, allImages);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.addModalGalleryEventListeners(allImages);
        
        setTimeout(() => {
            modalBody.scrollTop = 0;
            modalContent.scrollTop = 0;
            
            setTimeout(() => {
                modalBody.scrollTop = 0;
                modalContent.scrollTop = 0;
            }, 50);
        }, 10);
    }

    addModalGalleryEventListeners(allImages) {
        const modalThumbnails = this.modal.querySelectorAll('.modal-thumbnail');
        modalThumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', (e) => {
                e.preventDefault();
                
                const mainImage = this.modal.querySelector('.modal-gallery-main img');
                if (mainImage && allImages[index]) {
                    modalThumbnails.forEach(thumb => {
                        thumb.classList.remove('active');
                    });
                    
                    thumbnail.classList.add('active');
                    mainImage.src = allImages[index];
                }
            });
        });
    }

    renderProductModal(product, allImages) {
        const polishData = product.raw.lang?.pl || {};
        const fullDescription = polishData.description || product.raw.default_description || '';
        const specs = Helpers.extractSpecifications(product.raw);
        
        return `
            <div class="flesh-modal-product">
                <div class="flesh-modal-gallery">
                    ${this.renderModalGallery(allImages)}
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

    renderModalGallery(images) {
        if (!images || images.length === 0) {
            return `
                <div class="modal-gallery-main">
                    <div class="no-image">No Image</div>
                </div>
            `;
        }
        
        const mainImage = images[0];
        const thumbnails = images.slice(0, 8);
        
        return `
            <div class="modal-gallery-main">
                <img src="${mainImage}" alt="Product image" loading="lazy"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
            </div>
            ${thumbnails.length > 1 ? `
                <div class="modal-gallery-thumbnails">
                    ${thumbnails.map((img, idx) => `
                        <div class="modal-thumbnail ${idx === 0 ? 'active' : ''}" data-image-index="${idx}">
                            <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy"
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1nPC90ZXh0Pjwvc3ZnPg==';">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
}