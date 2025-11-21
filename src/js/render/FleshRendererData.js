// src/js/render/FleshRendererData.js
import { Helpers } from '../utils/helpers.js';

export class FleshRendererData {
    constructor(renderer) {
        this.renderer = renderer;
        
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.allProducts = [];
        this.filteredProducts = [];
        this.categories = [];
        this.uniqueCategories = [];
        this.currentCategory = 'all';
    }

    async loadData() {
        try {
            console.log('🔄 Loading data from API...');
            
            const [products, categories] = await Promise.all([
                this.renderer.api.getProducts(),
                this.renderer.api.getCategories()
            ]);

            // Проверяем, что данные действительно получены
            if (this.isDataValid(products, categories)) {
                console.log('✅ Data loaded successfully');
                this.processLoadedData(products, categories);
            } else {
                throw new Error('Invalid data received from server');
            }
            
        } catch (error) {
            console.error('💥 Data loading failed:', error);
            this.handleError(error);
        }
    }

    isDataValid(products, categories) {
        // Проверяем, что products - массив (может быть пустым, но должен быть массивом)
        if (!Array.isArray(products)) {
            console.warn('⚠️ Products is not an array:', products);
            return false;
        }
        
        // Проверяем, что categories - массив
        if (!Array.isArray(categories)) {
            console.warn('⚠️ Categories is not an array:', categories);
            return false;
        }
        
        console.log(`📊 Data validation: ${products.length} products, ${categories.length} categories`);
        return true;
    }

    handleError(error) {
        console.error('💥 Final data loading error:', error);
        
        let errorMessage = 'Service temporarily unavailable. Please try again later.';
        
        // Более информативные сообщения об ошибках
        if (error.message.includes('CORS') || error.message.includes('Network')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Please check your network connection.';
        }
        
        this.renderer.ui.handleFinalError(errorMessage);
    }

    processLoadedData(products, categories) {
        this.allProducts = products;
        this.categories = categories;
        
        console.log('📦 Raw products:', products);
        console.log('🏷️ Raw categories:', categories);
        
        this.processCategories(categories);
        
        console.log('📊 Loaded - Products:', products.length, 'Unique Categories:', this.uniqueCategories.length);
        
        if (products.length === 0) {
            console.warn('⚠️ No products loaded, showing empty state');
            this.renderer.ui.showEmptyState();
        } else {
            this.renderer.ui.render();
            this.renderer.modal.createModal();
        }
        
        this.renderer.isInitialized = true;
        console.log('✅ Flesh initialized successfully');
    }

    // ... остальные методы без изменений ...
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
        
        this.renderer.ui.render();
        
        setTimeout(() => {
            this.renderer.scrollToSection();
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
        this.renderer.ui.render();
        
        setTimeout(() => {
            this.renderer.scrollToSection();
        }, 100);
    }

    getAllProductImages(product) {
        const images = [];
        
        if (product.images?.main) {
            images.push(Helpers.fixImageUrl(product.images.main));
        }
        
        if (product.images?.other && Array.isArray(product.images.other)) {
            product.images.other.forEach(img => {
                if (img) {
                    images.push(Helpers.fixImageUrl(img));
                }
            });
        }
        
        return images;
    }
}