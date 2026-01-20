// Main Application Module
import { state, updateState } from './utils/state.js';
import { articleManager } from './pages/article-manager.js';
import { themeManager } from './pages/theme-manager.js';
import { toastManager } from './components/notifications.js';
import { lazyLoadingManager } from './utils/lazy-loading.js';
import { cacheDashboard } from './components/cache-dashboard.js';
import { storageManager } from './utils/enhanced-storage.js';
import { storageDashboard } from './components/storage-dashboard.js';
import { analyticsManager } from './utils/analytics.js';
import { analyticsDashboard } from './components/analytics-dashboard.js';

class BlogifyApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    async init() {
        try {
            // Initialize lazy loading first
            lazyLoadingManager.init();
            
            // Initialize analytics
            analyticsManager.init();
            
            // Initialize theme and language
            themeManager.init();
            
            // Initialize article manager
            articleManager.init();
            
            // Setup navigation
            this.setupNavigation();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup modals
            this.setupModals();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Load initial page
            this.navigateTo(state.currentPage || 'home');
            
            // Show welcome message
            toastManager.success('Welcome to Blogify! 📝');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            toastManager.error('Failed to initialize application');
        }
    }

    setupNavigation() {
        // Navigation buttons
        const navButtons = {
            'about-btn': 'about',
            'bookmarks-btn': 'bookmarks',
            'new-article-btn': 'editor',
            'user-profile-btn': 'user-profile',
            'analytics-btn': 'analytics'
        };

        Object.entries(navButtons).forEach(([btnId, page]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => this.navigateTo(page));
            }
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo('home'));
        });

        // Tools menu
        const toolsMenuBtn = document.getElementById('tools-menu-btn');
        const toolsMenu = document.getElementById('tools-menu');
        
        if (toolsMenuBtn && toolsMenu) {
            toolsMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toolsMenu.style.display = toolsMenu.style.display === 'block' ? 'none' : 'block';
            });

            // Close menu when clicking outside
            document.addEventListener('click', () => {
                toolsMenu.style.display = 'none';
            });

            // Tools menu items
            document.getElementById('export-btn')?.addEventListener('click', () => this.exportArticles());
            document.getElementById('import-btn')?.addEventListener('click', () => this.importArticles());
            document.getElementById('rss-feed-btn')?.addEventListener('click', () => this.showRSSFeed());
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New Article
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.navigateTo('editor');
            }
            
            // Ctrl/Cmd + F: Focus Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
            }
            
            // Ctrl/Cmd + S: Save Draft
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.currentPage === 'editor') {
                    articleManager.saveDraft();
                }
            }
            
            // Ctrl/Cmd + Enter: Publish
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.currentPage === 'editor') {
                    document.getElementById('article-form')?.dispatchEvent(new Event('submit'));
                }
            }
            
            // ?: Show shortcuts
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.showShortcuts();
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupModals() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    setupPerformanceMonitoring() {
        // Toggle performance stats display with keyboard shortcut
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P to toggle performance stats
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                const perfStats = document.getElementById('performance-stats');
                if (perfStats) {
                    perfStats.style.display = perfStats.style.display === 'none' ? 'block' : 'none';
                }
            }
            
            // Ctrl+Shift+C to toggle cache dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                cacheDashboard.toggle();
            }
            
            // Ctrl+Shift+S to toggle storage dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                storageDashboard.toggle();
            }
            
            // Ctrl+Shift+A to toggle analytics dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                analyticsDashboard.toggle();
            }
        });

        // Listen for performance updates
        document.addEventListener('performanceUpdate', (e) => {
            const stats = e.detail;
            const perfStats = document.getElementById('performance-stats');
            
            if (perfStats && perfStats.style.display !== 'none') {
                document.getElementById('articles-loaded-count').textContent = stats.articlesLoaded;
                document.getElementById('images-loaded-count').textContent = stats.imagesLoaded;
                document.getElementById('avg-load-time').textContent = stats.averageLoadTime + 'ms';
                document.getElementById('memory-usage').textContent = stats.memoryUsage.used + 'MB';
            }
        });
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            updateState('currentPage', page);
            
            // Update navigation state
            this.updateNavigationState(page);
            
            // Page-specific initialization
            this.initializePage(page);
        }
    }

    updateNavigationState(page) {
        // Update active states
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show/hide back button
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.style.display = page === 'home' ? 'none' : 'block';
        });
    }

    initializePage(page) {
        switch (page) {
            case 'home':
                articleManager.loadArticles();
                break;
            case 'bookmarks':
                this.loadBookmarks();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'user-profile':
                this.loadUserProfile();
                break;
        }
    }

    viewArticle(articleId) {
        const article = state.articles.find(a => a.id === articleId);
        if (!article) return;

        // Update view count
        article.views = (article.views || 0) + 1;
        updateState('articles', state.articles);
        articleManager.saveArticles();

        // Display article
        const articleContent = document.getElementById('article-content-detail');
        if (articleContent) {
            articleContent.innerHTML = `
                <h1>${article.title}</h1>
                <div class="article-meta">
                    <span class="article-category">${article.category}</span>
                    <span class="article-date">${this.formatDate(article.createdAt)}</span>
                    <span class="article-views">${article.views} views</span>
                </div>
                <div class="article-content-body">
                    ${article.content}
                </div>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
        }

        // Update reading time
        this.updateReadingTime(article.content);

        // Load related articles
        this.loadRelatedArticles(article);

        this.navigateTo('article-detail');
    }

    editArticle(articleId) {
        articleManager.editArticle(articleId);
    }

    deleteArticle(articleId) {
        articleManager.deleteArticle(articleId);
    }

    loadBookmarks() {
        const bookmarkedArticles = state.articles.filter(article => 
            state.bookmarked.includes(article.id)
        );
        
        const grid = document.getElementById('bookmarked-articles-grid');
        if (grid) {
            if (bookmarkedArticles.length === 0) {
                grid.innerHTML = '<p>No bookmarked articles yet.</p>';
            } else {
                grid.innerHTML = '';
                bookmarkedArticles.forEach(article => {
                    const card = articleManager.createArticleCard(article);
                    grid.appendChild(card);
                });
            }
        }
    }

    loadAnalytics() {
        // Update statistics
        document.getElementById('total-articles').textContent = state.articles.length;
        
        const totalViews = state.articles.reduce((sum, article) => sum + (article.views || 0), 0);
        document.getElementById('total-views').textContent = totalViews;
        
        const totalComments = Object.values(state.comments).reduce((sum, comments) => sum + comments.length, 0);
        document.getElementById('total-comments').textContent = totalComments;
        
        const avgReadingTime = Math.round(state.articles.reduce((sum, article) => 
            sum + this.calculateReadingTime(article.content), 0) / state.articles.length) || 0;
        document.getElementById('avg-reading-time').textContent = `${avgReadingTime} min`;

        // Load popular articles
        this.loadPopularArticles();
        
        // Load category chart
        this.loadCategoryChart();
    }

    loadUserProfile() {
        // Update profile display
        document.getElementById('profile-display-name').textContent = state.userProfile.name;
        document.getElementById('profile-bio').textContent = state.userProfile.bio;
        document.getElementById('profile-articles-count').textContent = state.articles.length;
        
        const totalViews = state.articles.reduce((sum, article) => sum + (article.views || 0), 0);
        document.getElementById('profile-views-count').textContent = totalViews;
        
        // Update form
        document.getElementById('profile-name').value = state.userProfile.name;
        document.getElementById('profile-email').value = state.userProfile.email;
        document.getElementById('profile-bio-input').value = state.userProfile.bio;
        
        // Setup form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.onsubmit = (e) => {
                e.preventDefault();
                
                state.userProfile = {
                    ...state.userProfile,
                    name: document.getElementById('profile-name').value,
                    email: document.getElementById('profile-email').value,
                    bio: document.getElementById('profile-bio-input').value
                };
                
                updateState('userProfile', state.userProfile);
                toastManager.success('Profile updated successfully!');
            };
        }
    }

    exportArticles() {
        try {
            const exportData = {
                articles: state.articles,
                comments: state.comments,
                bookmarks: state.bookmarked,
                userProfile: state.userProfile,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `blogify-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            toastManager.success('Articles exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toastManager.error('Failed to export articles');
        }
    }

    importArticles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Merge data
                    if (importData.articles) {
                        state.articles = [...state.articles, ...importData.articles];
                    }
                    if (importData.comments) {
                        Object.assign(state.comments, importData.comments);
                    }
                    if (importData.bookmarks) {
                        state.bookmarked = [...new Set([...state.bookmarked, ...importData.bookmarks])];
                    }
                    
                    articleManager.saveArticles();
                    toastManager.success('Articles imported successfully!');
                    this.navigateTo('home');
                } catch (error) {
                    console.error('Import failed:', error);
                    toastManager.error('Failed to import articles');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    showRSSFeed() {
        // Generate RSS feed
        const rssItems = state.articles.map(article => `
            <item>
                <title>${article.title}</title>
                <description>${this.stripHtml(article.content)}</description>
                <link>#article-${article.id}</link>
                <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
                <author>${article.author}</author>
            </item>
        `).join('');
        
        const rssContent = `
            <rss version="2.0">
                <channel>
                    <title>Blogify RSS Feed</title>
                    <description>Latest articles from Blogify</description>
                    <link>${window.location.href}</link>
                    ${rssItems}
                </channel>
            </rss>
        `;
        
        const rssModal = document.getElementById('rss-feed-modal');
        const rssContentDiv = document.getElementById('rss-feed-content');
        
        if (rssContentDiv) {
            rssContentDiv.innerHTML = `<pre>${rssContent}</pre>`;
        }
        
        if (rssModal) {
            rssModal.style.display = 'block';
        }
    }

    showShortcuts() {
        const modal = document.getElementById('shortcuts-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    calculateReadingTime(content) {
        const words = this.stripHtml(content).split(/\s+/).length;
        return Math.ceil(words / 200); // Average reading speed: 200 words per minute
    }

    updateReadingTime(content) {
        const readingTimeElement = document.getElementById('reading-time');
        if (readingTimeElement) {
            const minutes = this.calculateReadingTime(content);
            readingTimeElement.textContent = `${minutes} min read`;
        }
    }

    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    loadRelatedArticles(currentArticle) {
        const related = state.articles
            .filter(article => 
                article.id !== currentArticle.id && (
                    article.category === currentArticle.category ||
                    article.tags.some(tag => currentArticle.tags.includes(tag))
                )
            )
            .slice(0, 3);
        
        const grid = document.getElementById('related-articles-grid');
        if (grid) {
            grid.innerHTML = '';
            related.forEach(article => {
                const card = articleManager.createArticleCard(article);
                grid.appendChild(card);
            });
        }
    }

    loadPopularArticles() {
        const popular = [...state.articles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
        
        const list = document.getElementById('popular-articles-list');
        if (list) {
            list.innerHTML = popular.map(article => `
                <div class="popular-article">
                    <h4>${article.title}</h4>
                    <span>${article.views || 0} views</span>
                </div>
            `).join('');
        }
    }

    loadCategoryChart() {
        const categoryData = {};
        state.articles.forEach(article => {
            categoryData[article.category] = (categoryData[article.category] || 0) + 1;
        });
        
        // Simple chart implementation (fallback if Chart.js not available)
        const canvas = document.getElementById('category-chart');
        if (canvas && typeof Chart === 'undefined') {
            const ctx = canvas.getContext('2d');
            const data = Object.entries(categoryData);
            
            // Draw simple bar chart
            const width = canvas.width = 300;
            const height = canvas.height = 200;
            const barWidth = width / data.length;
            
            ctx.clearRect(0, 0, width, height);
            
            data.forEach(([category, count], index) => {
                const barHeight = (count / Math.max(...Object.values(categoryData))) * (height - 40);
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(index * barWidth + 10, height - barHeight - 20, barWidth - 20, barHeight);
                
                ctx.fillStyle = '#374151';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(category, index * barWidth + barWidth/2, height - 5);
                ctx.fillText(count, index * barWidth + barWidth/2, height - barHeight - 25);
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BlogifyApp();
});

export default BlogifyApp;
