// src/js/utils/helpers.js
export class Helpers {
    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static extractProductData(rawProduct) {
        const productCode = rawProduct.product_code || rawProduct.code || rawProduct.id || `ITEM-${Date.now()}`;
        
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

    static extractPrice(product) {
        if (product.regular_netto !== undefined && product.regular_netto !== null) {
            const price = parseFloat(product.regular_netto);
            if (!isNaN(price)) {
                return `${price.toFixed(2)} PLN`;
            }
        }
        
        return 'Price on request';
    }

    static extractImage(product) {
        if (product.images) {
            let imageUrl = '';
            
            if (typeof product.images === 'string') {
                imageUrl = product.images;
            } else if (product.images.main) {
                imageUrl = product.images.main;
            } else if (Array.isArray(product.images) && product.images.length > 0) {
                imageUrl = product.images[0];
            }
            
            return this.fixImageUrl(imageUrl);
        }
        
        return '';
    }

    static fixImageUrl(url) {
        if (!url) return '';
        
        console.log('🖼️ Original image URL:', url);
        
        if (url.startsWith('//')) {
            return 'https:' + url;
        }
        
        if (url.startsWith('/')) {
            return 'https://flashpro.pl' + url;
        }
        
        if (url.includes('http://flashpro.pl:8080')) {
            return url.replace('http://flashpro.pl:8080', 'https://flashpro.pl');
        }
        
        if (url.startsWith('flashpro.pl:8080')) {
            return 'https://flashpro.pl' + url.substring('flashpro.pl:8080'.length);
        }
        
        if (url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }
        
        if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('/')) {
            return 'https://flashpro.pl/' + url;
        }
        
        return url;
    }

    static extractStockStatus(product) {
        if (product.amount !== undefined) {
            return product.amount > 0;
        }
        return true;
    }

    static extractSpecifications(product) {
        const polishSpecs = product.lang?.pl?.specs;
        
        if (polishSpecs && Array.isArray(polishSpecs)) {
            return this.renderSpecsArray(polishSpecs);
        }
        
        if (product.specs && Array.isArray(product.specs)) {
            return this.renderSpecsArray(product.specs);
        }
        
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

    static renderSpecsArray(specs) {
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
}