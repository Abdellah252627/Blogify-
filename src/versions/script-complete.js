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

    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const newArticleBtn = document.getElementById('new-article-btn');
    const aboutBtn = document.getElementById('about-btn');
    const logo = document.querySelector('.logo');
    const userProfileBtn = document.getElementById('user-profile-btn');
    const analyticsBtn = document.getElementById('analytics-btn');
    const progressBar = document.getElementById('progress-bar');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const tagCloud = document.getElementById('tag-cloud');
    
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

    // Load Article Content with Animation
    function loadArticleContent(card) {
        const articleId = card.dataset.articleId;
        const article = state.articles.find(a => a.id === articleId);
        
        if (article) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            const tagsHTML = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const content = article.content.substring(0, 150).replace(/<[^>]*>/g, '');

            card.innerHTML = `
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

            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);

            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag')) {
                    state.selectedTag = e.target.textContent;
                    renderArticles();
                    renderTagCloud();
                    return;
                }
                viewArticle(article.id);
            });
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

    // Load Image with Lazy Loading
    function loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.style.opacity = '1';
            img.style.filter = 'blur(0)';
        }
    }

    // Process Images in Article Content
    function processImages(content) {
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
        
        return tempDiv.innerHTML;
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

    // Initialize everything
    function init() {
        initLazyLoading();
        renderArticles();
        
        // Add skeleton styles
        const skeletonStyles = `
            .skeleton-card {
                animation: pulse 1.5s ease-in-out infinite;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .skeleton-content,
            .skeleton-meta {
                background: linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
            }
            
            .skeleton-title {
                height: 24px;
                margin-bottom: 12px;
            }
            
            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }
            
            .skeleton-text:last-child {
                width: 60%;
            }
            
            .skeleton-meta {
                display: flex;
                justify-content: space-between;
                margin-top: 1rem;
            }
            
            .skeleton-tags {
                height: 24px;
                width: 100px;
            }
            
            .skeleton-date {
                height: 16px;
                width: 80px;
            }
            
            .lazy-image {
                opacity: 0.5;
                filter: blur(5px);
                transition: opacity 0.5s ease, filter 0.5s ease;
            }
            
            .lazy-image.loaded {
                opacity: 1;
                filter: blur(0);
            }
            
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .load-more-btn {
                margin: 2rem auto;
                display: block;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = skeletonStyles;
        document.head.appendChild(styleSheet);

        // Event listeners
        searchInput?.addEventListener('input', () => {
            resetArticlePagination();
            renderArticles();
        });
        
        categoryFilter?.addEventListener('change', () => {
            resetArticlePagination();
            renderArticles();
        });
    }

    // Placeholder functions for compatibility
    function renderTagCloud() {
        // Implementation would go here
    }
    
    function viewArticle(articleId) {
        // Implementation would go here
    }

    // Start the application
    init();
});
