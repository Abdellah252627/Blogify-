// Article Management Module
import { state, updateState } from '../utils/state.js';
import { articleCache } from '../utils/cache.js';
import { storageManager } from '../utils/enhanced-storage.js';
import { toastManager } from '../components/notifications.js';
import { progressManager } from '../components/progress.js';
import { lazyLoadingManager } from '../utils/lazy-loading.js';
import { RichTextEditor } from '../components/rich-editor.js';
import { analyticsManager } from '../utils/analytics.js';
import { searchManager } from '../utils/search-manager.js';
import { SearchUI } from '../components/search-ui.js';

export class ArticleManager {
    constructor() {
        // Pagination settings
        this.articlesPerPage = 6;
        this.currentPage = 0;
        this.isLoading = false;
        this.hasMoreArticles = true;
        
        // Rich editor instance
        this.richEditor = null;
        
        // Search UI instance
        this.searchUI = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInfiniteScroll();
        this.setupRichEditor();
        this.setupAnalytics();
        this.setupSearch();
        this.loadArticles();
    }

    setupEventListeners() {
        // Article form submission
        const form = document.getElementById('article-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleArticleSubmit(e));
        }

        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        }

        // Performance monitoring
        document.addEventListener('performanceUpdate', (e) => {
            this.updatePerformanceDisplay(e.detail);
        });

        // Infinite scroll
        document.addEventListener('infiniteScroll', (e) => {
            this.loadMoreArticles();
        });
    }

    setupInfiniteScroll() {
        // Create infinite scroll trigger
        const grid = document.getElementById('articles-grid');
        if (grid) {
            const trigger = document.createElement('div');
            trigger.className = 'infinite-scroll-trigger';
            trigger.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading more articles...</p>
                </div>
            `;
            grid.appendChild(trigger);
            
            // Observe trigger for infinite scroll
            lazyLoadingManager.observeInfiniteScroll(trigger);
        }
    }

    setupRichEditor() {
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer) {
            // Replace the existing editor with our rich editor
            this.richEditor = new RichTextEditor(editorContainer, {
                toolbar: true,
                markdown: true,
                autoSave: true,
                autoSaveInterval: 30000,
                imageUpload: true,
                maxImageSize: 5 * 1024 * 1024,
                allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });
        }
    }

    setupAnalytics() {
        // Track page view for articles page
        analyticsManager.trackPageView('articles');
        
        // Track article views when articles are displayed
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard && articleCard.dataset.articleId) {
                this.trackArticleView(articleCard.dataset.articleId);
            }
        });
        
        // Track article reads when article detail is viewed
        document.addEventListener('DOMContentLoaded', () => {
            const articleId = this.getArticleIdFromURL();
            if (articleId) {
                this.trackArticleRead(articleId);
            }
        });
    }

    setupSearch() {
        // Initialize search UI in search container
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            this.searchUI = new SearchUI(searchContainer, {
                showFilters: true,
                showSort: true,
                showHistory: true,
                showSuggestions: true,
                placeholder: 'Search articles, tags, categories...',
                debounceDelay: 300
            });
        }

        // Listen for search results
        document.addEventListener('searchResultsUpdated', (e) => {
            this.handleSearchResults(e.detail.results, e.detail.metadata);
        });

        // Update search index when articles change
        this.updateSearchIndex();
    }

    async loadArticles(reset = true) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            if (reset) {
                this.currentPage = 0;
                this.hasMoreArticles = true;
                
                // Show loading state
                const grid = document.getElementById('articles-grid');
                if (grid) {
                    grid.innerHTML = '';
                    for (let i = 0; i < 3; i++) {
                        grid.appendChild(lazyLoadingManager.createSkeletonCard());
                    }
                }
            }
            
            // Simulate API call with cache
            let articles = articleCache.get('all');
            
            if (!articles) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
                articles = state.articles || [];
                articleCache.set('all', articles);
            }
            
            // Update search index
            searchManager.updateSearchIndex(articles);
            
            // Apply pagination
            const startIndex = this.currentPage * this.articlesPerPage;
            const endIndex = startIndex + this.articlesPerPage;
            const paginatedArticles = articles.slice(startIndex, endIndex);
            
            this.hasMoreArticles = endIndex < articles.length;
            
            // Render articles
            this.renderArticles(paginatedArticles, reset);
            
            // Update performance display
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            if (window.performance && window.performance.memory) {
                const perfStats = {
                    articlesLoaded: articles.length,
                    imagesLoaded: 0,
                    averageLoadTime: loadTime,
                    memoryUsage: {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                    }
                };
                
                const event = new CustomEvent('performanceUpdate', {
                    detail: perfStats
                });
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error('Failed to load articles:', error);
            toastManager.error('Failed to load articles');
        } finally {
            this.isLoading = false;
        }
    }

    renderArticles(articles, reset = true) {
        const grid = document.getElementById('articles-grid');
        if (!grid) return;

        if (reset) {
            grid.innerHTML = '';
        }

        // Calculate pagination
        const startIndex = this.currentPage * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToShow = articles.slice(startIndex, endIndex);

        if (articlesToShow.length === 0 && reset) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No articles found. Create your first article!</p>
                    <button class="btn" onclick="app.navigateTo('editor')">New Article</button>
                </div>
            `;
            return;
        }

        // Create skeleton cards for lazy loading
        articlesToShow.forEach(article => {
            const skeletonCard = lazyLoadingManager.createSkeletonCard();
            skeletonCard.dataset.articleId = article.id;
            grid.appendChild(skeletonCard);
            
            // Observe for lazy loading
            lazyLoadingManager.observeArticle(skeletonCard);
        });

        // Update hasMoreArticles flag
        this.hasMoreArticles = endIndex < state.articles.length;
        
        // Show/hide infinite scroll trigger
        const trigger = grid.querySelector('.infinite-scroll-trigger');
        if (trigger) {
            trigger.style.display = this.hasMoreArticles ? 'block' : 'none';
        }
    }

    async loadMoreArticles() {
        if (!this.hasMoreArticles || this.isLoading) return;
        
        this.currentPage++;
        this.renderArticles(false);
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.loadArticles();
            return;
        }

        const filtered = state.articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        state.articles = filtered;
        this.renderArticles();
    }

    filterByCategory(category) {
        if (!category) {
            this.loadArticles();
            return;
        }

        const filtered = state.articles.filter(article => article.category === category);
        state.articles = filtered;
        this.renderArticles();
    }

    updatePerformanceDisplay(stats) {
        // Update performance display if element exists
        const perfDisplay = document.getElementById('performance-stats');
        if (perfDisplay) {
            perfDisplay.innerHTML = `
                <div class="perf-item">
                    <span>Articles Loaded:</span>
                    <span>${stats.articlesLoaded}</span>
                </div>
                <div class="perf-item">
                    <span>Images Loaded:</span>
                    <span>${stats.imagesLoaded}</span>
                </div>
                <div class="perf-item">
                    <span>Avg Load Time:</span>
                    <span>${stats.averageLoadTime}ms</span>
                </div>
                <div class="perf-item">
                    <span>Memory Usage:</span>
                    <span>${stats.memoryUsage.used}MB</span>
                </div>
            `;
        }
    }

    handleArticleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('article-title').value;
        const category = document.getElementById('article-category').value;
        const tags = document.getElementById('article-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Get content from rich editor
        let content = '';
        if (this.richEditor) {
            content = this.richEditor.getContent();
        } else {
            // Fallback to old editor
            const richEditor = document.getElementById('rich-editor');
            const markdownEditor = document.getElementById('markdown-editor');
            content = richEditor?.innerHTML || markdownEditor?.value || '';
        }

        const article = {
            id: state.articleToEditId || this.generateId(),
            title,
            category,
            tags,
            content,
            author: state.userProfile.name,
            createdAt: state.articleToEditId ? 
                state.articles.find(a => a.id === state.articleToEditId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
            views: state.articleToEditId ? 
                state.articles.find(a => a.id === state.articleToEditId)?.views || 0 : 
                0,
            readTime: analyticsManager.calculateReadingTime(content)
        };

        if (state.articleToEditId) {
            // Update existing article
            const index = state.articles.findIndex(a => a.id === state.articleToEditId);
            if (index !== -1) {
                state.articles[index] = article;
                toastManager.success('Article updated successfully!');
                
                // Track article update event
                this.emitAnalyticsEvent('articleUpdated', article);
            }
        } else {
            // Add new article
            state.articles.unshift(article);
            toastManager.success('Article published successfully!');
            
            // Track article creation event
            this.emitAnalyticsEvent('articleCreated', article);
        }

        this.saveArticles();
        this.renderArticles();
        
        // Reset form and navigate back
        this.resetForm();
        app.navigateTo('home');
    }

    saveDraft() {
        const title = document.getElementById('article-title').value;
        const category = document.getElementById('article-category').value;
        const tags = document.getElementById('article-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Get content from rich editor
        let content = '';
        if (this.richEditor) {
            content = this.richEditor.getContent();
        } else {
            // Fallback to old editor
            const richEditor = document.getElementById('rich-editor');
            const markdownEditor = document.getElementById('markdown-editor');
            content = richEditor?.innerHTML || markdownEditor?.value || '';
        }

        if (!title && !content) {
            toastManager.warning('Nothing to save');
            return;
        }

        const draft = {
            id: state.articleToEditId || this.generateId(),
            title: title || 'Untitled Draft',
            category: category || 'Uncategorized',
            tags,
            content,
            author: state.userProfile.name,
            createdAt: state.articleToEditId ? 
                state.articles.find(a => a.id === state.articleToEditId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false,
            views: state.articleToEditId ? 
                state.articles.find(a => a.id === state.articleToEditId)?.views || 0 : 
                0
        };

        if (state.articleToEditId) {
            const index = state.articles.findIndex(a => a.id === state.articleToEditId);
            if (index !== -1) {
                state.articles[index] = draft;
            }
        } else {
            state.articles.unshift(draft);
        }

        this.saveArticles();
        toastManager.info('Draft saved successfully!');
    }

    deleteArticle(articleId) {
        const article = state.articles.find(a => a.id === articleId);
        if (!article) return;

        if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
            state.articles = state.articles.filter(a => a.id !== articleId);
            this.saveArticles();
            this.renderArticles();
            toastManager.success('Article deleted successfully!');
        }
    }

    editArticle(articleId) {
        const article = state.articles.find(a => a.id === articleId);
        if (!article) return;

        state.articleToEditId = articleId;
        
        // Populate form
        document.getElementById('article-title').value = article.title;
        document.getElementById('article-category').value = article.category;
        document.getElementById('article-tags').value = article.tags.join(', ');
        
        // Set content in rich editor
        if (this.richEditor) {
            this.richEditor.setContent(article.content, 'rich');
        } else {
            // Fallback to old editor
            const richEditor = document.getElementById('rich-editor');
            const markdownEditor = document.getElementById('markdown-editor');
            
            if (richEditor) richEditor.innerHTML = article.content;
            if (markdownEditor) markdownEditor.value = article.content;
        }

        // Navigate to editor
        app.navigateTo('editor');
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderArticles();
            return;
        }

        const filtered = state.articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderArticles(filtered);
    }

    filterByCategory(category) {
        if (!category) {
            this.renderArticles();
            return;
        }

        const filtered = state.articles.filter(article => article.category === category);
        this.renderArticles(filtered);
    }

    updateCategoryFilter() {
        const filter = document.getElementById('category-filter');
        if (!filter) return;

        const categories = [...new Set(state.articles.map(article => article.category))];
        
        filter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filter.appendChild(option);
        });
    }

    saveArticles() {
        storageManager.setItem('articles', state.articles);
        articleCache.set('all', state.articles);
        updateState('articles', state.articles);
    }

    resetForm() {
        const form = document.getElementById('article-form');
        if (form) form.reset();
        
        // Reset rich editor
        if (this.richEditor) {
            this.richEditor.setContent('', 'rich');
        } else {
            // Fallback to old editor
            const richEditor = document.getElementById('rich-editor');
            const markdownEditor = document.getElementById('markdown-editor');
            
            if (richEditor) richEditor.innerHTML = '';
            if (markdownEditor) markdownEditor.value = '';
        }
        
        state.articleToEditId = null;
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

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

    // Analytics tracking methods
    trackArticleView(articleId) {
        analyticsManager.trackArticleView(articleId);
    }

    trackArticleRead(articleId) {
        const article = state.articles.find(a => a.id === articleId);
        if (article) {
            // Start tracking read time
            this.readStartTime = Date.now();
            this.currentArticleId = articleId;
            
            // Track when user leaves the page
            const handleReadEnd = () => {
                if (this.readStartTime && this.currentArticleId === articleId) {
                    const readTime = Date.now() - this.readStartTime;
                    analyticsManager.trackArticleRead(articleId, readTime);
                    this.readStartTime = null;
                    this.currentArticleId = null;
                }
            };
            
            // Track read end on page unload or navigation
            window.addEventListener('beforeunload', handleReadEnd);
            window.addEventListener('popstate', handleReadEnd);
            
            // Also track after a reasonable time (minimum 10 seconds)
            setTimeout(() => {
                if (this.readStartTime && this.currentArticleId === articleId) {
                    const readTime = Date.now() - this.readStartTime;
                    analyticsManager.trackArticleRead(articleId, readTime);
                    this.readStartTime = Date.now(); // Reset for continued tracking
                }
            }, 10000);
        }
    }

    getArticleIdFromURL() {
        // Extract article ID from URL or current state
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('article') || state.currentArticleId;
    }

    emitAnalyticsEvent(eventType, data) {
        const event = new CustomEvent('analyticsEvent', {
            detail: {
                type: eventType,
                data: data,
                timestamp: Date.now(),
                source: 'article-manager'
            }
        });
        document.dispatchEvent(event);
    }

    updateArticleAnalytics(articleId) {
        const article = state.articles.find(a => a.id === articleId);
        if (article) {
            // Update article with analytics data
            const analyticsData = analyticsManager.getStats();
            const popularArticles = analyticsManager.getPopularArticles();
            const articleStats = popularArticles.find(a => a.id === articleId);
            
            if (articleStats) {
                article.views = articleStats.views;
                article.readTime = articleStats.readTime;
                article.lastViewed = articleStats.lastViewed;
            }
            
            // Update article in state
            const index = state.articles.findIndex(a => a.id === articleId);
            if (index !== -1) {
                state.articles[index] = { ...state.articles[index], ...article };
            }
        }
    }

    // Search-related methods
    updateSearchIndex() {
        if (state.articles && state.articles.length > 0) {
            searchManager.updateSearchIndex(state.articles);
        }
    }

    handleSearchResults(results, metadata) {
        const grid = document.getElementById('articles-grid');
        if (!grid) return;

        // Clear existing content
        grid.innerHTML = '';

        if (results.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>No articles found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                    <div class="suggestions">
                        <h4>Suggestions:</h4>
                        <ul>
                            <li>Check spelling</li>
                            <li>Try different keywords</li>
                            <li>Use broader search terms</li>
                            <li>Clear filters</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        // Render search results
        results.forEach(article => {
            const articleCard = this.createSearchResultCard(article);
            grid.appendChild(articleCard);
        });

        // Hide infinite scroll for search results
        const trigger = grid.querySelector('.infinite-scroll-trigger');
        if (trigger) {
            trigger.style.display = 'none';
        }

        // Show search results info
        const resultsInfo = document.querySelector('.search-results-info');
        if (resultsInfo) {
            resultsInfo.style.display = 'flex';
        }
    }

    createSearchResultCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card search-result-item';
        card.dataset.articleId = article.id;

        const excerpt = this.getExcerpt(article.content, 150);
        const formattedDate = this.formatDate(article.date);
        
        card.innerHTML = `
            <div class="article-header">
                <h3 class="article-title">
                    ${article.highlightedTitle || article.title}
                </h3>
                <div class="article-meta">
                    <span class="article-category">${article.category}</span>
                    <span class="article-date">${formattedDate}</span>
                    <span class="article-views">${article.views || 0} views</span>
                </div>
            </div>
            <div class="article-content">
                <p class="article-excerpt">
                    ${article.highlightedContent || excerpt}
                </p>
            </div>
            <div class="article-footer">
                <div class="article-tags">
                    ${(article.highlightedTags || article.tags || []).map(tag => 
                        `<span class="article-tag">${tag}</span>`
                    ).join('')}
                </div>
                <div class="article-actions">
                    <button class="btn btn-sm" onclick="articleManager.editArticle('${article.id}')">Edit</button>
                    <button class="btn btn-sm btn-secondary" onclick="articleManager.deleteArticle('${article.id}')">Delete</button>
                </div>
            </div>
        `;

        // Add click handler for article view
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.article-actions')) {
                this.trackArticleView(article.id);
                // Navigate to article detail
                app.navigateTo('article-detail', { articleId: article.id });
            }
        });

        return card;
    }

    clearSearchResults() {
        const grid = document.getElementById('articles-grid');
        if (grid) {
            grid.innerHTML = '';
        }

        // Hide search results info
        const resultsInfo = document.querySelector('.search-results-info');
        if (resultsInfo) {
            resultsInfo.style.display = 'none';
        }

        // Restore infinite scroll trigger
        this.setupInfiniteScroll();
    }

    // Enhanced search methods
    performAdvancedSearch(query, filters = {}) {
        // Trigger search with advanced options
        const event = new CustomEvent('searchQuery', {
            detail: {
                query: query,
                options: {
                    filters: filters,
                    showFilters: true,
                    showSort: true
                }
            }
        });
        document.dispatchEvent(event);
    }

    applySearchFilters(filters) {
        // Apply filters to search
        Object.entries(filters).forEach(([type, value]) => {
            const event = new CustomEvent('filterChange', {
                detail: { type, value }
            });
            document.dispatchEvent(event);
        });
    }

    setSearchSort(field, direction = 'desc') {
        const event = new CustomEvent('sortChange', {
            detail: { field, direction }
        });
        document.dispatchEvent(event);
    }

    // Utility methods for search
    getSearchSuggestions(query) {
        return searchManager.getSuggestions(query, 5);
    }

    getSearchHistory() {
        return searchManager.getSearchHistory(10);
    }

    clearSearchHistory() {
        searchManager.clearHistory();
    }

    getSearchStats() {
        return searchManager.getSearchStats();
    }

    exportSearchData() {
        searchManager.exportSearchHistory();
    }

    // Override existing search methods to use advanced search
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            this.loadArticles();
            return;
        }

        // Use advanced search instead of simple filtering
        this.performAdvancedSearch(query);
    }

    filterByCategory(category) {
        if (!category) {
            this.clearSearchResults();
            this.loadArticles();
            return;
        }

        // Use advanced search with category filter
        this.performAdvancedSearch('', { categories: [category] });
    }

    filterByTags(tags) {
        if (!tags || tags.length === 0) {
            this.clearSearchResults();
            this.loadArticles();
            return;
        }

        // Use advanced search with tag filter
        this.performAdvancedSearch('', { tags: tags });
    }

    filterByDateRange(startDate, endDate) {
        if (!startDate && !endDate) {
            this.clearSearchResults();
            this.loadArticles();
            return;
        }

        // Use advanced search with date filter
        this.performAdvancedSearch('', { 
            dateRange: { startDate, endDate } 
        });
    }

    filterByAuthor(author) {
        if (!author) {
            this.clearSearchResults();
            this.loadArticles();
            return;
        }

        // Use advanced search with author filter
        this.performAdvancedSearch('', { author });
    }

    // Enhanced rendering with search support
    renderArticles(articles, reset = true) {
        const grid = document.getElementById('articles-grid');
        if (!grid) return;

        // Check if we have active search
        const hasSearch = this.searchUI && this.searchUI.getValue().trim();
        
        if (hasSearch) {
            // Let search results handler take care of rendering
            return;
        }

        if (reset) {
            grid.innerHTML = '';
        }

        // Calculate pagination
        const startIndex = this.currentPage * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToShow = articles.slice(startIndex, endIndex);

        if (articlesToShow.length === 0 && reset) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No articles found. Create your first article!</p>
                    <button class="btn" onclick="app.navigateTo('editor')">New Article</button>
                </div>
            `;
            return;
        }

        // Create skeleton cards for lazy loading
        articlesToShow.forEach(article => {
            const skeletonCard = lazyLoadingManager.createSkeletonCard();
            skeletonCard.dataset.articleId = article.id;
            grid.appendChild(skeletonCard);
            
            // Observe for lazy loading
            lazyLoadingManager.observeArticle(skeletonCard);
        });

        // Update hasMoreArticles flag
        this.hasMoreArticles = endIndex < state.articles.length;
        
        // Show/hide infinite scroll trigger
        const trigger = grid.querySelector('.infinite-scroll-trigger');
        if (trigger) {
            trigger.style.display = this.hasMoreArticles ? 'block' : 'none';
        }
    }
}

export const articleManager = new ArticleManager();
