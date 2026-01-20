// Lazy Loading Utilities with IntersectionObserver
export class LazyLoadingManager {
    constructor() {
        this.articleObserver = null;
        this.imageObserver = null;
        this.infiniteScrollObserver = null;
        this.isInitialized = false;
        this.loadingThreshold = 0.1;
        this.rootMargin = '50px';
        
        // Performance tracking
        this.performanceStats = {
            articlesLoaded: 0,
            imagesLoaded: 0,
            totalLoadTime: 0,
            averageLoadTime: 0,
            memoryUsage: this.getMemoryUsage()
        };
    }

    init() {
        if (this.isInitialized) return;
        
        this.initArticleObserver();
        this.initImageObserver();
        this.initInfiniteScroll();
        this.isInitialized = true;
        
        console.log('🚀 Lazy Loading initialized');
    }

    // Article Observer for lazy loading article content
    initArticleObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported - using fallback');
            return;
        }

        this.articleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    this.loadArticleContent(card);
                    this.articleObserver.unobserve(card);
                    
                    // Track performance
                    this.performanceStats.articlesLoaded++;
                    this.updatePerformanceStats();
                }
            });
        }, {
            root: null,
            rootMargin: this.rootMargin,
            threshold: this.loadingThreshold
        });
    }

    // Image Observer for lazy loading images with blur effect
    initImageObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImageWithBlur(img);
                    this.imageObserver.unobserve(img);
                    
                    // Track performance
                    this.performanceStats.imagesLoaded++;
                    this.updatePerformanceStats();
                }
            });
        }, {
            root: null,
            rootMargin: this.rootMargin,
            threshold: 0.01
        });
    }

    // Infinite Scroll Observer
    initInfiniteScroll() {
        if (!('IntersectionObserver' in window)) return;

        this.infiniteScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const trigger = entry.target;
                    this.handleInfiniteScroll();
                }
            });
        }, {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        });
    }

    // Load article content with skeleton replacement
    async loadArticleContent(card) {
        const startTime = performance.now();
        const articleId = card.dataset.articleId;
        
        if (!articleId) return;

        try {
            // Show loading state
            card.classList.add('loading');
            
            // Simulate content loading (replace with actual data fetching)
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Get article data (from cache or storage)
            const article = await this.getArticleData(articleId);
            
            if (article) {
                // Replace skeleton with actual content
                const contentCard = this.createArticleCard(article);
                card.replaceWith(contentCard);
                
                // Observe images in the new card
                const images = contentCard.querySelectorAll('img[data-src]');
                images.forEach(img => this.observeImage(img));
            }
            
            // Track performance
            const loadTime = performance.now() - startTime;
            this.performanceStats.totalLoadTime += loadTime;
            this.updatePerformanceStats();
            
        } catch (error) {
            console.error('Failed to load article:', error);
            card.classList.add('error');
            card.innerHTML = `
                <div class="error-state">
                    <p>Failed to load article</p>
                    <button onclick="this.closest('.article-card').remove()" class="btn btn-sm">Remove</button>
                </div>
            `;
        }
    }

    // Load image with blur effect
    loadImageWithBlur(img) {
        const startTime = performance.now();
        
        // Add blur placeholder
        img.classList.add('loading');
        img.style.filter = 'blur(10px)';
        img.style.transition = 'filter 0.3s ease';
        
        const src = img.dataset.src;
        if (!src) return;

        // Create temporary image to preload
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.style.filter = 'blur(0)';
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Track performance
            const loadTime = performance.now() - startTime;
            this.performanceStats.totalLoadTime += loadTime;
            this.updatePerformanceStats();
        };
        
        tempImg.onerror = () => {
            img.classList.add('error');
            img.style.filter = 'blur(0)';
            console.error('Failed to load image:', src);
        };
        
        tempImg.src = src;
    }

    // Create skeleton card for loading state
    createSkeletonCard() {
        const card = document.createElement('div');
        card.className = 'article-card skeleton-card';
        card.innerHTML = `
            <div class="skeleton-image">
                <div class="skeleton-shimmer"></div>
            </div>
            <div class="skeleton-content">
                <div class="skeleton-title">
                    <div class="skeleton-shimmer"></div>
                </div>
                <div class="skeleton-text">
                    <div class="skeleton-shimmer"></div>
                </div>
                <div class="skeleton-text short">
                    <div class="skeleton-shimmer"></div>
                </div>
                <div class="skeleton-meta">
                    <div class="skeleton-category">
                        <div class="skeleton-shimmer"></div>
                    </div>
                    <div class="skeleton-date">
                        <div class="skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    // Create actual article card
    createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'article-card';
        card.dataset.articleId = article.id;
        
        const imageUrl = article.image || `https://picsum.photos/seed/${article.id}/400/200.jpg`;
        
        card.innerHTML = `
            <div class="article-image">
                <img data-src="${imageUrl}" 
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3C/svg%3E" 
                     alt="${article.title}" 
                     loading="lazy">
            </div>
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${this.getExcerpt(article.content, 150)}</p>
                <div class="article-meta">
                    <span class="article-category">${article.category}</span>
                    <span class="article-date">${this.formatDate(article.createdAt)}</span>
                </div>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="article-actions">
                    <button class="btn btn-sm" onclick="app.viewArticle('${article.id}')">Read More</button>
                    <button class="btn btn-sm btn-secondary" onclick="app.editArticle('${article.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteArticle('${article.id}')">Delete</button>
                </div>
            </div>
        `;

        // Observe images for lazy loading
        const images = card.querySelectorAll('img[data-src]');
        images.forEach(img => this.observeImage(img));

        return card;
    }

    // Observe article card
    observeArticle(card) {
        if (this.articleObserver) {
            this.articleObserver.observe(card);
        } else {
            // Fallback for older browsers
            setTimeout(() => this.loadArticleContent(card), 100);
        }
    }

    // Observe image
    observeImage(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            // Fallback
            setTimeout(() => this.loadImageWithBlur(img), 200);
        }
    }

    // Observe infinite scroll trigger
    observeInfiniteScroll(trigger) {
        if (this.infiniteScrollObserver) {
            this.infiniteScrollObserver.observe(trigger);
        }
    }

    // Handle infinite scroll
    handleInfiniteScroll() {
        // Emit custom event for infinite scroll
        const event = new CustomEvent('infiniteScroll', {
            detail: { 
                loaded: this.performanceStats.articlesLoaded,
                stats: this.performanceStats
            }
        });
        document.dispatchEvent(event);
    }

    // Get article data (placeholder - implement with actual data source)
    async getArticleData(articleId) {
        // This should be implemented with your actual data source
        // For now, return mock data
        return {
            id: articleId,
            title: `Article ${articleId}`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
            category: 'Technology',
            tags: ['web', 'javascript'],
            createdAt: new Date().toISOString(),
            views: Math.floor(Math.random() * 1000)
        };
    }

    // Performance monitoring
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return { used: 0, total: 0, limit: 0 };
    }

    updatePerformanceStats() {
        const total = this.performanceStats.articlesLoaded + this.performanceStats.imagesLoaded;
        if (total > 0) {
            this.performanceStats.averageLoadTime = 
                Math.round(this.performanceStats.totalLoadTime / total);
        }
        
        this.performanceStats.memoryUsage = this.getMemoryUsage();
        
        // Emit performance update event
        const event = new CustomEvent('performanceUpdate', {
            detail: this.performanceStats
        });
        document.dispatchEvent(event);
    }

    // Get performance stats
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            memoryUsage: this.getMemoryUsage()
        };
    }

    // Reset observers
    reset() {
        if (this.articleObserver) {
            this.articleObserver.disconnect();
        }
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.infiniteScrollObserver) {
            this.infiniteScrollObserver.disconnect();
        }
        
        this.performanceStats = {
            articlesLoaded: 0,
            imagesLoaded: 0,
            totalLoadTime: 0,
            averageLoadTime: 0,
            memoryUsage: this.getMemoryUsage()
        };
    }

    // Utility methods
    getExcerpt(content, length) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const text = temp.textContent || temp.innerText || '';
        return text.length > length ? text.substr(0, length) + '...' : text;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Create singleton instance
export const lazyLoadingManager = new LazyLoadingManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadingManager.init();
});
