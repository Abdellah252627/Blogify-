// Blogify - Enhanced Frontend Functionality with Lazy Loading
document.addEventListener('DOMContentLoaded', () => {
    // State Management
    const state = {
        theme: localStorage.getItem('theme') || 'light',
        lang: localStorage.getItem('lang') || 'en',
        articles: JSON.parse(localStorage.getItem('articles')) || [],
        currentPage: 'home',
        userProfile: JSON.parse(localStorage.getItem('userProfile')) || {
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'Passionate blogger and writer',
            avatar: 'https://picsum.photos/seed/avatar/150/150.jpg'
        },
        articleToDelete: null,
        comments: JSON.parse(localStorage.getItem('comments')) || {},
        currentArticleId: null,
        selectedTag: null,
        bookmarked: JSON.parse(localStorage.getItem('bookmarked')) || [],
        articleToEditId: null,
    };

    // Lazy Loading State
    let articleObserver;
    let imageObserver;
    const ARTICLES_PER_PAGE = 6;
    let currentArticlePage = 0;

    // Advanced Caching System
    const cache = {
        articles: new Map(), // Cache for loaded article content
        images: new Map(), // Cache for loaded images
        templates: new Map(), // Cache for HTML templates
        data: new Map(), // Cache for filtered data
        stats: {
            hits: 0,
            misses: 0,
            size: 0,
            maxSize: 100 // Max cache items
        }
    };

    // Cache Configuration
    const CACHE_CONFIG = {
        ttl: 5 * 60 * 1000, // 5 minutes TTL
        maxSize: 50, // Max items per cache type
        cleanupInterval: 60 * 1000 // Cleanup every minute
    };

    // Cache Manager Class
    class CacheManager {
        constructor(name, ttl = CACHE_CONFIG.ttl, maxSize = CACHE_CONFIG.maxSize) {
            this.name = name;
            this.cache = new Map();
            this.ttl = ttl;
            this.maxSize = maxSize;
            this.hits = 0;
            this.misses = 0;
        }

        get(key) {
            const item = this.cache.get(key);
            if (!item) {
                this.misses++;
                cache.stats.misses++;
                return null;
            }

            if (Date.now() > item.expiry) {
                this.cache.delete(key);
                this.misses++;
                cache.stats.misses++;
                return null;
            }

            this.hits++;
            cache.stats.hits++;
            return item.data;
        }

        set(key, data) {
            // Remove oldest items if cache is full
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            this.cache.set(key, {
                data: data,
                expiry: Date.now() + this.ttl
            });
        }

        has(key) {
            const item = this.cache.get(key);
            return item && Date.now() <= item.expiry;
        }

        clear() {
            this.cache.clear();
            this.hits = 0;
            this.misses = 0;
        }

        getStats() {
            const total = this.hits + this.misses;
            return {
                hits: this.hits,
                misses: this.misses,
                hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%',
                size: this.cache.size,
                maxSize: this.maxSize
            };
        }
    }

    // Local Storage with Compression
    const storage = {
        // Compression configuration
        compression: {
            enabled: true,
            algorithm: 'lz-string',
            level: 6, // Compression level (1-9)
            threshold: 1024 // Only compress data larger than 1KB
        },
        
        // Storage quota management
        quota: {
            used: 0,
            available: 0,
            warning: 0.8, // Warn at 80%
            critical: 0.95 // Critical at 95%
        },
        
        // Compression statistics
        stats: {
            totalCompressed: 0,
            totalUncompressed: 0,
            compressionRatio: 0,
            savedSpace: 0
        }
    };

    // Simple LZ-String implementation (fallback)
    class SimpleLZString {
        static compress(str) {
            const dict = {};
            let result = [];
            let dictSize = 256;
            
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (dict[char]) {
                    result.push(dict[char]);
                } else {
                    let match = '';
                    let j = Math.max(i - dictSize + 1, 0);
                    while (j >= 0 && str[j] === char) {
                        match = char + match;
                        j--;
                    }
                    
                    if (match.length > 2) {
                        dict[char] = match;
                        result.push(255 - match.length);
                        result.push(...match);
                    } else {
                        dict[char] = char;
                        result.push(char);
                    }
                }
            }
            
            return new Uint8Array(result);
        }
        
        static decompress(data) {
            const dict = {};
            let result = [];
            let dictSize = 256;
            
            for (let i = 0; i < data.length; i++) {
                const code = data[i];
                
                if (code < 256) {
                    const char = dict[code] || String.fromCharCode(code);
                    result.push(char);
                } else {
                    const length = 255 - code;
                    let match = '';
                    
                    for (let j = 0; j < length; j++) {
                        if (dict[j]) {
                            match = dict[j];
                        } else {
                            match += String.fromCharCode(j);
                        }
                    }
                    
                    result.push(...match);
                    for (let j = 0; j < length; j++) {
                        dict[j] = match[j];
                    }
                }
            }
            
            return result.join('');
        }
    }

    // Enhanced Storage Manager with Compression
    class CompressedStorage {
        constructor() {
            this.prefix = 'blogify_';
            this.compressionEnabled = storage.compression.enabled;
        }

        // Compress data before storing
        compress(data) {
            if (!this.compressionEnabled) {
                return JSON.stringify(data);
            }

            try {
                const jsonString = JSON.stringify(data);
                
                // Use LZ-String if available, otherwise fallback
                if (typeof LZString !== 'undefined') {
                    const compressed = LZString.compress(jsonString);
                    return {
                        compressed: true,
                        data: Array.from(compressed),
                        originalSize: jsonString.length,
                        compressedSize: compressed.length
                    };
                } else {
                    const compressed = SimpleLZString.compress(jsonString);
                    return {
                        compressed: true,
                        data: Array.from(compressed),
                        originalSize: jsonString.length,
                        compressedSize: compressed.length
                    };
                }
            } catch (error) {
                console.warn('Compression failed:', error);
                return {
                    compressed: false,
                    data: jsonString
                };
            }
        }

        // Decompress data after retrieving
        decompress(compressedData) {
            if (!compressedData.compressed) {
                return JSON.parse(compressedData.data);
            }

            try {
                const uint8Array = new Uint8Array(compressedData.data);
                
                if (typeof LZString !== 'undefined') {
                    const decompressed = LZString.decompress(uint8Array);
                    return JSON.parse(decompressed);
                } else {
                    const decompressed = SimpleLZString.decompress(uint8Array);
                    return JSON.parse(decompressed);
                }
            } catch (error) {
                console.warn('Decompression failed:', error);
                return null;
            }
        }

        // Get storage quota information
        getQuota() {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                return navigator.storage.estimate().then(estimate => {
                    storage.quota.used = estimate.usage || 0;
                    storage.quota.available = estimate.quota || 0;
                    return storage.quota;
                });
            }
            
            // Fallback for older browsers
            const used = JSON.stringify(localStorage).length;
            const available = 5 * 1024 * 1024; // 5MB estimate
            storage.quota.used = used;
            storage.quota.available = Math.max(0, available - used);
            return Promise.resolve(storage.quota);
        }

        // Store data with compression
        setItem(key, data) {
            const compressed = this.compress(data);
            const storageKey = this.prefix + key;
            
            try {
                localStorage.setItem(storageKey, JSON.stringify(compressed));
                this.updateStats(compressed);
            } catch (error) {
                console.error('Storage failed:', error);
                this.handleStorageError(error);
            }
        }

        // Retrieve data with decompression
        getItem(key) {
            const storageKey = this.prefix + key;
            
            try {
                const item = localStorage.getItem(storageKey);
                if (!item) return null;
                
                const compressed = JSON.parse(item);
                return this.decompress(compressed);
            } catch (error) {
                console.error('Retrieval failed:', error);
                return null;
            }
        }

        // Update compression statistics
        updateStats(compressed) {
            if (compressed.compressed) {
                storage.stats.totalCompressed += compressed.compressedSize;
                storage.stats.totalUncompressed += compressed.originalSize;
                storage.stats.compressionRatio = 
                    ((compressed.originalSize - compressed.compressedSize) / compressed.originalSize * 100).toFixed(2);
                storage.stats.savedSpace = compressed.originalSize - compressed.compressedSize;
            }
        }

        // Handle storage errors
        handleStorageError(error) {
            if (error.name === 'QuotaExceededError') {
                this.showStorageWarning('Storage quota exceeded!');
            } else {
                console.error('Storage error:', error);
            }
        }

        // Show storage warning to user
        showStorageWarning(message) {
            const warning = document.createElement('div');
            warning.className = 'storage-warning';
            warning.innerHTML = `
                <div class="warning-content">
                    <h4>⚠️ Storage Warning</h4>
                    <p>${message}</p>
                    <button onclick="this.parentElement.remove()">Dismiss</button>
                </div>
            `;
            warning.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--card);
                border: 2px solid var(--destructive);
                border-radius: var(--radius);
                padding: 20px;
                z-index: 10000;
                box-shadow: var(--shadow-xl);
                max-width: 400px;
                text-align: center;
            `;
            document.body.appendChild(warning);
        }

        // Get compression statistics
        getStats() {
            return storage.stats;
        }

        // Clear storage
        clear() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            storage.stats = {
                totalCompressed: 0,
                totalUncompressed: 0,
                compressionRatio: 0,
                savedSpace: 0
            };
        }
    }

    // Loading States Management
    const loadingStates = {
        compression: {
            active: false,
            current: null,
            progress: 0,
            total: 0
        },
        storage: {
            active: false,
            current: null,
            progress: 0,
            total: 0
        },
        articles: {
            active: false,
            current: null,
            progress: 0,
            total: 0
        },
        images: {
            active: false,
            current: null,
            progress: 0,
            total: 0
        }
    };

    // Toast Notification System
    class ToastManager {
        constructor() {
            this.container = null;
            this.toasts = [];
            this.maxToasts = 5;
        }

        init() {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(this.container);
        }

        show(message, type = 'info', duration = 3000, progress = null) {
            if (!this.container) this.init();

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let content = `<div class="toast-content">${message}</div>`;
            
            if (progress !== null) {
                content += `
                    <div class="toast-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                `;
            }

            toast.innerHTML = content;
            toast.style.cssText = `
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 12px 16px;
                box-shadow: var(--shadow-lg);
                min-width: 250px;
                max-width: 350px;
                animation: slideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
            `;

            this.container.appendChild(toast);
            this.toasts.push(toast);

            // Auto remove
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    toast.remove();
                    this.toasts = this.toasts.filter(t => t !== toast);
                }, 300);
            }, duration);
        }

        clear() {
            this.toasts.forEach(toast => toast.remove());
            this.toasts = [];
        }
    }

    // Progress Bar System
    class ProgressBarManager {
        constructor() {
            this.bars = new Map();
        }

        create(id, options = {}) {
            const existing = this.bars.get(id);
            if (existing) {
                existing.update(options);
                return existing;
            }

            const bar = document.createElement('div');
            bar.className = 'progress-bar-container';
            bar.innerHTML = `
                <div class="progress-info">
                    <span class="progress-title">${options.title || 'Loading...'}</span>
                    <span class="progress-percentage">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                ${options.showCancel ? '<button class="progress-cancel">✕</button>' : ''}
            `;

            bar.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--card);
                border: 2px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
                z-index: 10001;
                box-shadow: var(--shadow-xl);
                min-width: 300px;
                text-align: center;
            `;

            document.body.appendChild(bar);
            this.bars.set(id, { element: bar, options });

            // Add cancel handler
            const cancelBtn = bar.querySelector('.progress-cancel');
            if (cancelBtn && options.onCancel) {
                cancelBtn.addEventListener('click', options.onCancel);
            }

            return bar;
        }

        update(id, options = {}) {
            const barData = this.bars.get(id);
            if (!barData) return;

            const { element, options: originalOptions } = barData;
            const mergedOptions = { ...originalOptions, ...options };

            // Update title
            const title = element.querySelector('.progress-title');
            if (title && options.title) {
                title.textContent = options.title;
            }

            // Update percentage
            const percentage = element.querySelector('.progress-percentage');
            const fill = element.querySelector('.progress-fill');
            if (percentage && fill && options.progress !== undefined) {
                percentage.textContent = `${Math.round(options.progress)}%`;
                fill.style.width = `${options.progress}%`;
            }

            // Update options
            this.bars.set(id, { element, options: mergedOptions });
        }

        remove(id) {
            const barData = this.bars.get(id);
            if (barData) {
                barData.element.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    barData.element.remove();
                    this.bars.delete(id);
                }, 300);
            }
        }
    }

    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const newArticleBtn = document.getElementById('new-article-btn');
    const aboutBtn = document.getElementById('about-btn');
    const bookmarksBtn = document.getElementById('bookmarks-btn');
    const logo = document.querySelector('.logo');
    const userProfileBtn = document.getElementById('user-profile-btn');
    const analyticsBtn = document.getElementById('analytics-btn');
    const progressBar = document.getElementById('progress-bar');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const tagCloud = document.getElementById('tag-cloud');
    
    // Tools dropdown elements
    const toolsMenuBtn = document.getElementById('tools-menu-btn');
    const toolsMenu = document.getElementById('tools-menu');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const rssFeedBtn = document.getElementById('rss-feed-btn');
    
    // Modal elements
    const importExportModal = document.getElementById('import-export-modal');
    const confirmExportBtn = document.getElementById('confirm-export-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const importFile = document.getElementById('import-file');
    
    const pages = {
        home: document.getElementById('home-page'),
        editor: document.getElementById('editor-page'),
        about: document.getElementById('about-page'),
        detail: document.getElementById('article-detail-page'),
        profile: document.getElementById('user-profile-page'),
        analytics: document.getElementById('analytics-page'),
        bookmarks: document.getElementById('bookmarks-page')
    };
    
    const articlesGrid = document.getElementById('articles-grid');
    const articleForm = document.getElementById('article-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const richEditor = document.getElementById('rich-editor');
    const editorToolbar = document.getElementById('editor-toolbar');
    const linkBtn = document.getElementById('link-btn');
    const linkModal = document.getElementById('link-modal');
    const confirmLinkBtn = document.getElementById('confirm-link-btn');
    const cancelLinkBtn = document.getElementById('cancel-link-btn');
    const linkUrlInput = document.getElementById('link-url');
    const articleTitleInput = document.getElementById('article-title');
    const articleContentDetail = document.getElementById('article-content-detail');
    const commentsModal = document.getElementById('comments-modal');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');

    let autosaveInterval;
    let categoryChartInstance = null;

    // Initialize cache managers
    const articleCache = new CacheManager('articles');
    const imageCache = new CacheManager('images');
    const templateCache = new CacheManager('templates');

    // Initialize Lazy Loading
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            articleObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        loadArticleContent(card);
                        articleObserver.unobserve(card);
                    }
                });
            }, {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            });

            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                root: null,
                rootMargin: '100px',
                threshold: 0.01
            });
        }
    }

    // Load Article Content with Caching
    function loadArticleContent(card) {
        const articleId = card.dataset.articleId;
        
        // Check cache first
        const cacheKey = `article-${articleId}`;
        let cachedContent = articleCache.get(cacheKey);
        
        if (!cachedContent) {
            // Generate content if not cached
            const article = state.articles.find(a => a.id === articleId);
            if (!article) return;
            
            const tagsHTML = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const content = article.content.substring(0, 150).replace(/<[^>]*>/g, '');
            
            cachedContent = `
                <div class="card-content">
                    <h3>${article.title}</h3>
                    <p>${content}...</p>
                </div>
                <div class="article-meta">
                    <div class="tags-container">${tagsHTML}</div>
                    ${article.category ? `<span class="category-tag">${article.category}</span>` : ''}
                    <span class="publish-date">${formatDate(article.publishDate)}</span>
                </div>
            `;
            
            // Cache the generated content
            articleCache.set(cacheKey, cachedContent);
        }
        
        // Apply content with animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.innerHTML = cachedContent;
        
        // Animate in
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);

        // Add event listeners (only once)
        if (!card.dataset.listenersAdded) {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag')) {
                    state.selectedTag = e.target.textContent;
                    resetArticlePagination();
                    renderArticles();
                    renderTagCloud();
                    return;
                }
                viewArticle(articleId);
            });
            card.dataset.listenersAdded = 'true';
        }
    }

    // Create Skeleton Card
    function createSkeletonCard() {
        const card = document.createElement('div');
        card.className = 'article-card skeleton-card';
        card.innerHTML = `
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-meta">
                <div class="skeleton-tags"></div>
                <div class="skeleton-date"></div>
            </div>
        `;
        return card;
    }

    // Load Image with Caching
    function loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Check image cache first
        const cachedImage = imageCache.get(src);
        if (cachedImage) {
            img.src = cachedImage;
            img.classList.add('loaded');
            img.style.opacity = '1';
            img.style.filter = 'blur(0)';
            return;
        }
        
        // Load and cache new image
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.style.opacity = '1';
            img.style.filter = 'blur(0)';
            
            // Cache the loaded image
            imageCache.set(src, src);
        };
        
        tempImg.onerror = () => {
            // Fallback on error
            img.src = src;
            img.classList.add('error');
            img.style.opacity = '0.7';
        };
        
        tempImg.src = src;
    }

    // Process Images in Article Content with Caching
    function processImages(content) {
        const cacheKey = `processed-${content.substring(0, 50)}`;
        let processedContent = templateCache.get(cacheKey);
        
        if (!processedContent) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            const images = tempDiv.querySelectorAll('img');
            images.forEach(img => {
                if (!img.dataset.processed) {
                    img.dataset.src = img.src;
                    img.src = '';
                    img.classList.add('lazy-image');
                    img.dataset.processed = 'true';
                    
                    if (imageObserver) {
                        imageObserver.observe(img);
                    } else {
                        setTimeout(() => loadImage(img), 200);
                    }
                }
            });
            
            processedContent = tempDiv.innerHTML;
            templateCache.set(cacheKey, processedContent);
        }
        
        return processedContent;
    }

    // Enhanced renderArticles with Lazy Loading
    function renderArticles() {
        if (!articlesGrid) return;
        
        const filteredArticles = filterArticles();
        
        if (currentArticlePage === 0) {
            articlesGrid.innerHTML = '';
        }
        
        if (filteredArticles.length === 0 && currentArticlePage === 0) {
            articlesGrid.innerHTML = `<p class="empty-state">${translations[state.lang].no_articles}</p>`;
            return;
        }

        const startIndex = currentArticlePage * ARTICLES_PER_PAGE;
        const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, filteredArticles.length);
        const articlesToShow = filteredArticles.slice(startIndex, endIndex);

        if (articlesToShow.length === 0 && currentArticlePage > 0) {
            return;
        }

        articlesToShow.forEach(article => {
            const skeletonCard = createSkeletonCard();
            skeletonCard.dataset.articleId = article.id;
            articlesGrid.appendChild(skeletonCard);
            
            if (articleObserver) {
                articleObserver.observe(skeletonCard);
            } else {
                setTimeout(() => loadArticleContent(skeletonCard), 100);
            }
        });

        currentArticlePage++;

        if (endIndex < filteredArticles.length) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'btn btn-secondary load-more-btn';
            loadMoreBtn.textContent = state.lang === 'ar' ? 'تحميل المزيد' : 'Load More Articles';
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.remove();
                renderArticles();
            });
            articlesGrid.appendChild(loadMoreBtn);
        }
    }

    // Modal and Export/Import Functions
    function showExportModal() {
        if (importExportModal) {
            importExportModal.classList.add('active');
            document.getElementById('export-section').style.display = 'block';
            document.getElementById('import-section').style.display = 'none';
            document.getElementById('import-export-title').textContent = 'Export Articles';
        }
    }

    function showImportModal() {
        if (importExportModal) {
            importExportModal.classList.add('active');
            document.getElementById('export-section').style.display = 'none';
            document.getElementById('import-section').style.display = 'block';
            document.getElementById('import-export-title').textContent = 'Import Articles';
        }
    }

    function exportArticles() {
        const data = {
            articles: state.articles,
            comments: state.comments,
            bookmarked: state.bookmarked,
            userProfile: state.userProfile,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blogify-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        importExportModal?.classList.remove('active');
        showToast('Articles exported successfully!', 'success');
    }

    function importArticles() {
        if (!importFile?.files?.length) {
            showToast('Please select a file to import', 'error');
            return;
        }
        
        const file = importFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Merge imported data with existing data
                if (data.articles && Array.isArray(data.articles)) {
                    state.articles = [...state.articles, ...data.articles];
                }
                if (data.comments) {
                    state.comments = { ...state.comments, ...data.comments };
                }
                if (data.bookmarked && Array.isArray(data.bookmarked)) {
                    state.bookmarked = [...new Set([...state.bookmarked, ...data.bookmarked])];
                }
                if (data.userProfile) {
                    state.userProfile = { ...state.userProfile, ...data.userProfile };
                }
                
                // Save to localStorage
                localStorage.setItem('articles', JSON.stringify(state.articles));
                localStorage.setItem('comments', JSON.stringify(state.comments));
                localStorage.setItem('bookmarked', JSON.stringify(state.bookmarked));
                localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
                
                renderArticles();
                importExportModal?.classList.remove('active');
                showToast('Articles imported successfully!', 'success');
            } catch (error) {
                showToast('Error importing file. Please check the file format.', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    }

    function generateRSSFeed() {
        const rssItems = state.articles.map(article => `
    <item>
      <title>${article.title || 'Untitled'}</title>
      <description>${article.excerpt || article.content?.substring(0, 200) + '...' || ''}</description>
      <link>${window.location.origin}#article/${article.id}</link>
      <guid>${article.id}</guid>
      <pubDate>${new Date(article.createdAt || Date.now()).toUTCString()}</pubDate>
    </item>`).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blogify Feed</title>
    <description>Latest articles from Blogify</description>
    <link>${window.location.origin}</link>
    <language>${state.lang === 'ar' ? 'ar-ar' : 'en-us'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

        const blob = new Blob([rss], { type: 'application/rss+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blogify-rss.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('RSS feed generated successfully!', 'success');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 12px 16px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Show/Hide Pages
    function showPage(pageName) {
        // Hide all pages
        Object.values(pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // Show selected page
        if (pages[pageName]) {
            pages[pageName].classList.add('active');
            state.currentPage = pageName;
        }
        
        // Update progress bar
        updateProgressBar();
    }

    // Update Language
    function updateLanguage() {
        // Update all elements with data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[state.lang] && translations[state.lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[state.lang][key];
                } else {
                    element.textContent = translations[state.lang][key];
                }
            }
        });
        
        // Update language toggle button
        if (langToggleBtn) {
            langToggleBtn.textContent = state.lang === 'ar' ? 'EN' : 'ع';
        }
        
        // Update document direction
        document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = state.lang;
    }

    // Update Progress Bar
    function updateProgressBar() {
        if (progressBar) {
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = scrollPercentage + '%';
        }
    }

    // Reset Article Pagination
    function resetArticlePagination() {
        currentArticlePage = 0;
        if (articleObserver) {
            articleObserver.disconnect();
        }
    }

    // Filter Articles
    function filterArticles() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        return state.articles.filter(article => {
            const matchesSearch = !searchTerm || 
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !selectedCategory || article.category === selectedCategory;
            const matchesTag = !state.selectedTag || article.tags.includes(state.selectedTag);
            
            return matchesSearch && matchesCategory && matchesTag;
        });
    }

    // Format Date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(state.lang === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Language Translations (simplified for demo)
    const translations = {
        en: { 
            no_articles: "No articles yet. Write one!",
            logo: "Blogify 📝"
        },
        ar: { 
            no_articles: "لا توجد مقالات بعد. اكتب واحدة!",
            logo: "تدوين 📝"
        }
    };

    // Cache Statistics and Monitoring
    function getCacheStats() {
        return {
            articles: articleCache.getStats(),
            images: imageCache.getStats(),
            templates: templateCache.getStats(),
            overall: {
                totalHits: cache.stats.hits,
                totalMisses: cache.stats.misses,
                hitRate: cache.stats.hits + cache.stats.misses > 0 ? 
                    ((cache.stats.hits / (cache.stats.hits + cache.stats.misses)) * 100).toFixed(2) + '%' : '0%',
                totalSize: cache.stats.size,
                memoryUsage: getMemoryUsage()
            }
        };
    }

    function getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            };
        }
        return { used: 'N/A', total: 'N/A', limit: 'N/A' };
    }

    function logCacheStats() {
        const stats = getCacheStats();
        console.group('📊 Cache Statistics');
        console.log('📝 Articles Cache:', stats.articles);
        console.log('🖼️ Images Cache:', stats.images);
        console.log('📋 Templates Cache:', stats.templates);
        console.log('💾 Overall:', stats.overall);
        console.groupEnd();
    }

    function updateCacheDisplay() {
        const stats = getCacheStats();
        const cacheDisplay = document.getElementById('cache-stats');
        if (cacheDisplay) {
            cacheDisplay.innerHTML = `
                <div class="cache-stats">
                    <span>🎯 Hit Rate: ${stats.overall.hitRate}</span>
                    <span>💾 Memory: ${stats.overall.memoryUsage.used}</span>
                    <span>📊 Cached: ${stats.overall.totalSize} items</span>
                </div>
            `;
        }
    }

    // Add cache monitoring to init function
    function init() {
        // Initialize theme
        if (state.theme === 'dark') {
            document.body.classList.add('dark');
        }
        if (themeToggleBtn) {
            themeToggleBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Initialize language
        updateLanguage();
        
        // Initialize page
        showPage(state.currentPage || 'home');
        
        initLazyLoading();
        renderArticles();

        // Event listeners
        searchInput?.addEventListener('input', () => {
            resetArticlePagination();
            renderArticles();
        });
        
        categoryFilter?.addEventListener('change', () => {
            resetArticlePagination();
            renderArticles();
        });

        // Main navigation buttons
        newArticleBtn?.addEventListener('click', () => {
            showPage('editor');
        });

        aboutBtn?.addEventListener('click', () => {
            showPage('about');
        });

        bookmarksBtn?.addEventListener('click', () => {
            showPage('bookmarks');
        });

        userProfileBtn?.addEventListener('click', () => {
            showPage('profile');
        });

        analyticsBtn?.addEventListener('click', () => {
            showPage('analytics');
        });

        // Tools dropdown functionality
        toolsMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toolsMenu?.classList.toggle('show');
            toolsMenuBtn?.setAttribute('aria-expanded', toolsMenu?.classList.contains('show'));
        });

        // Tools menu items
        exportBtn?.addEventListener('click', () => {
            showExportModal();
            toolsMenu?.classList.remove('active');
        });

        importBtn?.addEventListener('click', () => {
            showImportModal();
            toolsMenu?.classList.remove('active');
        });

        rssFeedBtn?.addEventListener('click', () => {
            generateRSSFeed();
            toolsMenu?.classList.remove('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            toolsMenu?.classList.remove('active');
            toolsMenuBtn?.setAttribute('aria-expanded', 'false');
        });

        // Modal functionality
        confirmExportBtn?.addEventListener('click', exportArticles);
        confirmImportBtn?.addEventListener('click', importArticles);

        // Close modal handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal')?.classList.remove('active');
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Theme toggle
        themeToggleBtn?.addEventListener('click', () => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', state.theme);
            themeToggleBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
        });

        // Language toggle
        langToggleBtn?.addEventListener('click', () => {
            state.lang = state.lang === 'en' ? 'ar' : 'en';
            localStorage.setItem('lang', state.lang);
            updateLanguage();
            renderArticles();
        });

        // Logo click - go to home
        logo?.addEventListener('click', () => {
            showPage('home');
        });

        // Back to top button
        backToTopBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide back to top button on scroll
        window.addEventListener('scroll', () => {
            if (backToTopBtn) {
                backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
            }
            updateProgressBar();
        });

    // Add cache controls
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                logCacheStats();
            }
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                // Clear caches safely
                if (typeof articleCache !== 'undefined') articleCache.clear();
                if (typeof imageCache !== 'undefined') imageCache.clear();
                if (typeof templateCache !== 'undefined') templateCache.clear();
                if (typeof cache !== 'undefined') {
                    cache.articles.clear();
                    cache.images.clear();
                    cache.templates.clear();
                    cache.data.clear();
                }
                console.log('🗑️ All caches cleared');
            }
        });
    }

// Start the application
init();
});
