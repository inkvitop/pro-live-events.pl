// src/js/api/FleshAPI.js
export class FleshAPI {
    constructor() {
        this.apiKey = '$2y$10$/deiWOgg0uNBLlgzD/2WueStRmjlINlDkndMi6cEytMylhRhA3Hqu';
        this.email = 'plinkvitop@gmail.com';
        this.baseURL = this.getBaseURL();
        this.token = null;
        this.tokenExpiry = null;
    }

    getBaseURL() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // ДЛЯ GitHub Pages: используем CORS proxy с правильным URL
            return 'https://corsproxy.io/?https://flashpro.pl/en/api';
        } else {
            // ДЛЯ локальной разработки: прокси через ваш сервер
            return '/api/proxy';
        }
    }

    async getAuthToken() {
        try {
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                console.log('🔐 Using cached token');
                return this.token;
            }

            // БЕЗ .php - согласно документации
            const apiUrl = `${this.baseURL}/token`;
            console.log('🔐 Getting auth token from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.email,
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Token response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Token error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Token response JSON:', data);
            
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
            
            // БЕЗ .php - согласно документации
            const apiUrl = `${this.baseURL}/products`;
            console.log('📦 Getting products from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Products response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Products error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Products response JSON:', data);
            
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
            
            // БЕЗ .php - согласно документации
            const apiUrl = `${this.baseURL}/categories`;
            console.log('📂 Getting categories from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Categories response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.log('❌ Categories error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Categories response JSON:', data);
            
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