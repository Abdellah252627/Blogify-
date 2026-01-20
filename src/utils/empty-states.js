// Empty States System
export class EmptyStateManager {
    constructor() {
        this.emptyStates = new Map();
        this.defaultConfig = {
            icon: 'inbox',
            title: 'No data available',
            description: 'There are no items to display at the moment.',
            action: null,
            actionText: 'Get Started',
            illustration: null,
            theme: 'default',
            size: 'medium'
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupEmptyStateTypes();
        this.setupEventListeners();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Empty states base styles */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 3rem 2rem;
                color: var(--muted-foreground, #666);
                min-height: 300px;
                border-radius: var(--radius, 8px);
                background: var(--muted, #f8f9fa);
                border: 2px dashed var(--border, #e0e0e0);
                transition: all 0.3s ease;
            }

            .empty-state:hover {
                border-color: var(--primary, #007bff);
                background: var(--accent, #f8f9fa);
            }

            .empty-state.small {
                padding: 2rem 1rem;
                min-height: 200px;
            }

            .empty-state.large {
                padding: 4rem 2rem;
                min-height: 400px;
            }

            .empty-state-icon {
                font-size: 3rem;
                color: var(--muted-foreground, #666);
                margin-bottom: 1rem;
                opacity: 0.6;
            }

            .empty-state.large .empty-state-icon {
                font-size: 4rem;
            }

            .empty-state.small .empty-state-icon {
                font-size: 2rem;
            }

            .empty-state-illustration {
                width: 200px;
                height: 200px;
                margin-bottom: 1.5rem;
                opacity: 0.8;
                border-radius: var(--radius, 8px);
                background: var(--background, #fff);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .empty-state.large .empty-state-illustration {
                width: 300px;
                height: 300px;
            }

            .empty-state.small .empty-state-illustration {
                width: 150px;
                height: 150px;
            }

            .empty-state-illustration img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .empty-state-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--foreground, #333);
                margin-bottom: 0.5rem;
                line-height: 1.4;
            }

            .empty-state.large .empty-state-title {
                font-size: 1.5rem;
            }

            .empty-state.small .empty-state-title {
                font-size: 1.125rem;
            }

            .empty-state-description {
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
                max-width: 500px;
            }

            .empty-state.large .empty-state-description {
                font-size: 1.125rem;
            }

            .empty-state.small .empty-state-description {
                font-size: 0.875rem;
            }

            .empty-state-action {
                margin-top: 1rem;
            }

            .empty-state-action .btn {
                background: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: var(--radius, 4px);
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }

            .empty-state-action .btn:hover {
                background: var(--primary-hover, #0056b3);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }

            .empty-state-action .btn:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .empty-state-action .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            /* Empty state themes */
            .empty-state.default {
                --empty-icon: '📭';
                --empty-color: var(--muted-foreground, #666);
            }

            .empty-state.search {
                --empty-icon: '🔍';
                --empty-color: var(--primary, #007bff);
            }

            .empty-state.articles {
                --empty-icon: '📄';
                --empty-color: var(--success, #28a745);
            }

            .empty-state.comments {
                --empty-icon: '💬';
                --empty-color: var(--info, #17a2b8);
            }

            .empty-state.bookmarks {
                --empty-icon: '🔖';
                --empty-color: var(--warning, #ffc107);
            }

            .empty-state.users {
                --empty-icon: '👥';
                --empty-color: var(--secondary, #6c757d);
            }

            .empty-state.error {
                --empty-icon: '⚠️';
                --empty-color: var(--destructive, #dc3545);
            }

            .empty-state.success {
                --empty-icon: '✅';
                --empty-color: var(--success, #28a745);
            }

            .empty-state.info {
                --empty-icon: 'ℹ️';
                --empty-color: var(--info, #17a2b8);
            }

            .empty-state.warning {
                --empty-icon: '⚠️';
                --empty-color: var(--warning, #ffc107);
            }

            /* Icon styles */
            .empty-state-icon::before {
                content: var(--empty-icon, '📭');
                font-size: inherit;
                color: var(--empty-color, var(--muted-foreground, #666));
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .empty-state {
                    padding: 2rem 1rem;
                    min-height: 250px;
                }

                .empty-state-illustration {
                    width: 150px;
                    height: 150px;
                }

                .empty-state-title {
                    font-size: 1.125rem;
                }

                .empty-state-description {
                    font-size: 0.875rem;
                }

                .empty-state-action .btn {
                    padding: 0.625rem 1.25rem;
                    font-size: 0.875rem;
                }
            }

            /* Dark mode support */
            .dark .empty-state {
                background: var(--muted, #374151);
                border-color: var(--border, #4b5563);
                color: var(--muted-foreground, #9ca3af);
            }

            .dark .empty-state-title {
                color: var(--foreground, #f3f4f6);
            }

            .dark .empty-state:hover {
                border-color: var(--primary, #3b82f6);
                background: var(--accent, #1f2937);
            }

            /* Animation support */
            .empty-state.animate-in {
                animation: emptyStateFadeIn 0.5s ease-out;
            }

            @keyframes emptyStateFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .empty-state.animate-out {
                animation: emptyStateFadeOut 0.3s ease-in;
            }

            @keyframes emptyStateFadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }

            /* Pulse animation for icons */
            .empty-state.pulse .empty-state-icon {
                animation: emptyStatePulse 2s infinite;
            }

            @keyframes emptyStatePulse {
                0%, 100% {
                    opacity: 0.6;
                    transform: scale(1);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
            }

            /* Bounce animation */
            .empty-state.bounce .empty-state-icon {
                animation: emptyStateBounce 2s infinite;
            }

            @keyframes emptyStateBounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translateY(0);
                }
                40%, 43% {
                    transform: translateY(-10px);
                }
                70% {
                    transform: translateY(-5px);
                }
            }

            /* Float animation */
            .empty-state.float .empty-state-icon {
                animation: emptyStateFloat 3s ease-in-out infinite;
            }

            @keyframes emptyStateFloat {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }

            /* Spin animation */
            .empty-state.spin .empty-state-icon {
                animation: emptyStateSpin 2s linear infinite;
            }

            @keyframes emptyStateSpin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .empty-state.animate-in,
                .empty-state.animate-out,
                .empty-state.pulse,
                .empty-state.bounce,
                .empty-state.float,
                .empty-state.spin {
                    animation: none;
                }
            }

            /* Accessibility */
            .empty-state:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .empty-state .btn:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            /* Performance optimizations */
            .empty-state {
                will-change: opacity, transform;
                contain: layout style paint;
            }

            /* Custom empty state components */
            .empty-state-search {
                background: linear-gradient(135deg, var(--primary, #007bff) 0%, var(--primary-dark, #0056b3) 100%);
                color: var(--primary-foreground, #fff);
                border: none;
            }

            .empty-state-search .empty-state-icon::before {
                content: '🔍';
            }

            .empty-state-search .empty-state-title,
            .empty-state-search .empty-state-description {
                color: var(--primary-foreground, #fff);
            }

            .empty-state-search .empty-state-action .btn {
                background: var(--primary-foreground, #fff);
                color: var(--primary, #007bff);
            }

            .empty-state-search .empty-state-action .btn:hover {
                background: var(--accent, #f8f9fa);
                color: var(--primary, #007bff);
            }

            /* Card empty state */
            .empty-state-card {
                background: var(--card, #fff);
                border: 1px solid var(--border, #e0e0e0);
                box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
            }

            /* List empty state */
            .empty-state-list {
                border: none;
                background: transparent;
                margin: 2rem 0;
            }

            /* Table empty state */
            .empty-state-table {
                border: none;
                background: transparent;
                margin: 1rem 0;
            }

            /* Modal empty state */
            .empty-state-modal {
                background: var(--background, #fff);
                border: none;
                box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.2));
            }

            /* Inline empty state */
            .empty-state-inline {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem;
                background: transparent;
                border: none;
                min-height: auto;
            }

            .empty-state-inline .empty-state-icon {
                font-size: 1.5rem;
                margin-bottom: 0;
                margin-right: 0.5rem;
            }

            .empty-state-inline .empty-state-title {
                font-size: 1rem;
                margin-bottom: 0;
                margin-right: 0.5rem;
            }

            .empty-state-inline .empty-state-description {
                display: none;
            }

            .empty-state-inline .empty-state-action {
                margin-top: 0;
            }
        `;
        document.head.appendChild(style);
    }

    setupEmptyStateTypes() {
        // Define empty state types
        this.emptyStates.set('default', {
            icon: '📭',
            title: 'No data available',
            description: 'There are no items to display at the moment.',
            action: null,
            actionText: 'Get Started',
            illustration: null,
            theme: 'default'
        });

        this.emptyStates.set('search', {
            icon: '🔍',
            title: 'No results found',
            description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
            action: 'clearSearch',
            actionText: 'Clear Search',
            illustration: null,
            theme: 'search'
        });

        this.emptyStates.set('articles', {
            icon: '📄',
            title: 'No articles yet',
            description: 'Start writing your first article to share your thoughts with the world.',
            action: 'writeArticle',
            actionText: 'Write Article',
            illustration: null,
            theme: 'articles'
        });

        this.emptyStates.set('comments', {
            icon: '💬',
            title: 'No comments yet',
            description: 'Be the first to share your thoughts on this article.',
            action: 'writeComment',
            actionText: 'Write Comment',
            illustration: null,
            theme: 'comments'
        });

        this.emptyStates.set('bookmarks', {
            icon: '🔖',
            title: 'No bookmarks yet',
            description: 'Save your favorite articles for easy access later.',
            action: 'browseArticles',
            actionText: 'Browse Articles',
            illustration: null,
            theme: 'bookmarks'
        });

        this.emptyStates.set('users', {
            icon: '👥',
            title: 'No users found',
            description: 'No users match your current search criteria.',
            action: 'clearFilters',
            actionText: 'Clear Filters',
            illustration: null,
            theme: 'users'
        });

        this.emptyStates.set('error', {
            icon: '⚠️',
            title: 'Something went wrong',
            description: 'We encountered an error while loading the content. Please try again later.',
            action: 'retry',
            actionText: 'Try Again',
            illustration: null,
            theme: 'error'
        });

        this.emptyStates.set('network', {
            icon: '🌐',
            title: 'No internet connection',
            description: 'Please check your internet connection and try again.',
            action: 'retry',
            actionText: 'Retry',
            illustration: null,
            theme: 'default'
        });

        this.emptyStates.set('404', {
            icon: '🔍',
            title: 'Page not found',
            description: 'The page you\'re looking for doesn\'t exist or has been moved.',
            action: 'goHome',
            actionText: 'Go Home',
            illustration: null,
            theme: 'default'
        });

        this.emptyStates.set('500', {
            icon: '⚠️',
            title: 'Server error',
            description: 'Something went wrong on our end. We\'re working to fix it.',
            action: 'retry',
            actionText: 'Try Again',
            illustration: null,
            theme: 'error'
        });

        this.emptyStates.set('offline', {
            icon: '📵',
            title: 'You\'re offline',
            description: 'Check your internet connection and try again.',
            action: 'retry',
            actionText: 'Retry',
            illustration: null,
            theme: 'default'
        });

        this.emptyStates.set('loading', {
            icon: '⏳',
            title: 'Loading...',
            description: 'Please wait while we fetch the content.',
            action: null,
            actionText: '',
            illustration: null,
            theme: 'default',
            animation: 'pulse'
        });

        this.emptyStates.set('success', {
            icon: '✅',
            title: 'Success!',
            description: 'Your action was completed successfully.',
            action: null,
            actionText: '',
            illustration: null,
            theme: 'success',
            animation: 'bounce'
        });

        this.emptyStates.set('info', {
            icon: 'ℹ️',
            title: 'Information',
            description: 'Here\'s some helpful information for you.',
            action: null,
            actionText: '',
            illustration: null,
            theme: 'info'
        });

        this.emptyStates.set('warning', {
            icon: '⚠️',
            title: 'Warning',
            description: 'Please review this information carefully.',
            action: null,
            actionText: '',
            illustration: null,
            theme: 'warning'
        });
    }

    setupEventListeners() {
        // Listen for empty state requests
        document.addEventListener('showEmptyState', (e) => {
            this.handleShowEmptyState(e.detail);
        });

        document.addEventListener('hideEmptyState', (e) => {
            this.handleHideEmptyState(e.detail);
        });

        // Listen for action clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.empty-state-action .btn')) {
                this.handleActionClick(e.target.closest('.empty-state-action .btn'));
            }
        });
    }

    // Empty state creation methods
    createEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        
        // Remove existing empty state
        this.hideEmptyState(container);
        
        // Create empty state element
        const emptyState = document.createElement('div');
        emptyState.className = `empty-state ${config.theme} ${config.animation ? 'animate-in' : ''}`;
        emptyState.setAttribute('data-empty-type', type);
        
        // Set CSS variables
        emptyState.style.setProperty('--empty-icon', config.icon);
        emptyState.style.setProperty('--empty-color', config.color || '');
        
        // Build empty state content
        let content = '';
        
        // Add illustration if provided
        if (config.illustration) {
            if (typeof config.illustration === 'string') {
                content += `<div class="empty-state-illustration"><img src="${config.illustration}" alt="${config.title}" /></div>`;
            } else if (config.illustration instanceof HTMLElement) {
                const illustrationDiv = document.createElement('div');
                illustrationDiv.className = 'empty-state-illustration';
                illustrationDiv.appendChild(config.illustration);
                emptyState.appendChild(illustrationDiv);
            }
        }
        
        // Add icon
        content += '<div class="empty-state-icon"></div>';
        
        // Add title
        if (config.title) {
            content += `<h3 class="empty-state-title">${config.title}</h3>`;
        }
        
        // Add description
        if (config.description) {
            content += `<p class="empty-state-description">${config.description}</p>`;
        }
        
        // Add action button
        if (config.action && config.actionText) {
            content += `
                <div class="empty-state-action">
                    <button class="btn" data-action="${config.action}">
                        ${config.actionText}
                    </button>
                </div>
            `;
        }
        
        emptyState.innerHTML = content;
        
        // Add to container
        container.appendChild(emptyState);
        
        // Track active empty state
        this.activeEmptyState = emptyState;
        
        // Emit event
        this.emitEmptyStateEvent('emptyStateShown', {
            type,
            container,
            element: emptyState,
            config,
            timestamp: Date.now()
        });
        
        return emptyState;
    }

    hideEmptyState(container) {
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.classList.add('animate-out');
            setTimeout(() => {
                emptyState.remove();
            }, 300);
            
            this.emitEmptyStateEvent('emptyStateHidden', {
                container,
                element: emptyState,
                timestamp: Date.now()
            });
        }
        
        this.activeEmptyState = null;
    }

    showEmptyState(container, type, options = {}) {
        return this.createEmptyState(container, type, options);
    }

    // Predefined empty state methods
    showNoResults(container, options = {}) {
        return this.showEmptyState(container, 'search', options);
    }

    showNoArticles(container, options = {}) {
        return this.createEmptyState(container, 'articles', options);
    }

    showNoComments(container, options = {}) {
        return this.createEmptyState(container, 'comments', options);
    }

    showNoBookmarks(container, options = {}) {
        return this.createEmptyState(container, 'bookmarks', options);
    }

    showNoUsers(container, options = {}) {
        return this.createEmptyState(container, 'users', options);
    }

    showError(container, options = {}) {
        return this.createEmptyState(container, 'error', options);
    }

    showNetworkError(container, options = {}) {
        return this.createEmptyState(container, 'network', options);
    }

    show404(container, options = {}) {
        return this.createEmptyState(container, '404', options);
    }

    show500(container, options = {}) {
        return this.createEmptyState(container, '500', options);
    }

    showOffline(container, options = {}) {
        return this.createEmptyState(container, 'offline', options);
    }

    showLoading(container, options = {}) {
        return this.createEmptyState(container, 'loading', options);
    }

    showSuccess(container, options = {}) {
        return this.createEmptyState(container, 'success', options);
    }

    showInfo(container, options = {}) {
        return this.createEmptyState(container, 'info', options);
    }

    showWarning(container, options = {}) {
        return this.createEmptyState(container, 'warning', options);
    }

    // Inline empty states
    showInlineEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-inline';
        emptyState.setAttribute('data-empty-type', type);
        
        let content = '';
        
        // Add icon
        content += '<div class="empty-state-icon"></div>';
        
        // Add title
        if (config.title) {
            content += `<span class="empty-state-title">${config.title}</span>`;
        }
        
        // Add action if provided
        if (config.action && config.actionText) {
            content += `
                <button class="btn btn-sm" data-action="${config.action}">
                    ${config.actionText}
                </button>
            `;
        }
        
        emptyState.innerHTML = content;
        
        // Add to container
        container.appendChild(emptyState);
        
        return emptyState;
    }

    // Card empty state
    showCardEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        config.size = 'medium';
        
        const emptyState = this.createEmptyState(container, type, config);
        emptyState.classList.add('empty-state-card');
        
        return emptyState;
    }

    // List empty state
    showListEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        
        const emptyState = this.createEmptyState(container, type, config);
        emptyState.classList.add('empty-state-list');
        
        return emptyState;
    }

    // Table empty state
    showTableEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        
        const emptyState = this.createEmptyState(container, type, config);
        emptyState.classList.add('empty-state-table');
        
        return emptyState;
    }

    // Modal empty state
    showModalEmptyState(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...this.emptyStates.get(type), ...options };
        
        const emptyState = this.createEmptyState(container, type, config);
        emptyState.classList.add('empty-state-modal');
        
        return emptyState;
    }

    // Dynamic empty state creation
    createCustomEmptyState(container, config) {
        return this.createEmptyState(container, 'default', config);
    }

    // Action handling
    handleShowEmptyState(detail) {
        const { container, type, options } = detail;
        this.showEmptyState(container, type, options);
    }

    handleHideEmptyState(detail) {
        const { container } = detail;
        this.hideEmptyState(container);
    }

    handleActionClick(button) {
        const action = button.getAttribute('data-action');
        
        // Emit action event
        this.emitEmptyStateEvent('emptyStateAction', {
            action,
            button,
            timestamp: Date.now()
        });
        
        // Handle common actions
        switch (action) {
            case 'clearSearch':
                this.handleClearSearch();
                break;
            case 'writeArticle':
                this.handleWriteArticle();
                break;
            case 'writeComment':
                this.handleWriteComment();
                break;
            case 'browseArticles':
                this.handleBrowseArticles();
                break;
            case 'clearFilters':
                this.handleClearFilters();
                break;
            case 'goHome':
                this.handleGoHome();
                break;
            case 'retry':
                this.handleRetry();
                break;
            default:
                this.handleCustomAction(action);
                break;
        }
    }

    handleClearSearch() {
        // Clear search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        // Emit clear search event
        const event = new CustomEvent('clearSearch');
        document.dispatchEvent(event);
    }

    handleWriteArticle() {
        // Navigate to editor
        const event = new CustomEvent('navigateTo', { detail: { page: 'editor' } });
        document.dispatchEvent(event);
    }

    handleWriteComment() {
        // Focus on comment input
        const commentInput = document.querySelector('.comment-input');
        if (commentInput) {
            commentInput.focus();
        }
        
        // Emit write comment event
        const event = new CustomEvent('writeComment');
        document.dispatchEvent(event);
    }

    handleBrowseArticles() {
        // Navigate to articles
        const event = new CustomEvent('navigateTo', { detail: { page: 'articles' } });
        document.dispatchEvent(event);
    }

    handleClearFilters() {
        // Clear filters
        const event = new CustomEvent('clearFilters');
        document.dispatchEvent(event);
    }

    handleGoHome() {
        // Navigate to home
        const event = new CustomEvent('navigateTo', { detail: { page: 'home' } });
        document.dispatchEvent(event);
    }

    handleRetry() {
        // Retry last action
        const event = new CustomEvent('retry');
        document.dispatchEvent(event);
    }

    handleCustomAction(action) {
        // Emit custom action event
        const event = new CustomEvent('emptyStateCustomAction', {
            detail: { action }
        });
        document.dispatchEvent(event);
    }

    // Update empty state
    updateEmptyState(container, updates) {
        const emptyState = container.querySelector('.empty-state');
        
        if (emptyState) {
            const type = emptyState.getAttribute('data-empty-type');
            const config = { ...this.emptyStates.get(type), ...updates };
            
            // Update content
            if (updates.title) {
                const titleElement = emptyState.querySelector('.empty-state-title');
                if (titleElement) {
                    titleElement.textContent = updates.title;
                }
            }
            
            if (updates.description) {
                const descriptionElement = emptyState.querySelector('.empty-state-description');
                if (descriptionElement) {
                    descriptionElement.textContent = updates.description;
                }
            }
            
            if (updates.actionText) {
                const actionButton = emptyState.querySelector('.empty-state-action .btn');
                if (actionButton) {
                    actionButton.textContent = updates.actionText;
                }
            }
            
            if (updates.icon) {
                emptyState.style.setProperty('--empty-icon', updates.icon);
            }
            
            if (updates.theme) {
                emptyState.className = emptyState.className.replace(/skeleton-\w+/, `skeleton-${updates.theme}`);
            }
            
            // Emit update event
            this.emitEmptyStateEvent('emptyStateUpdated', {
                container,
                element: emptyState,
                updates,
                timestamp: Date.now()
            });
        }
    }

    // Animation methods
    animateIn(container, type, options = {}) {
        const emptyState = this.showEmptyState(container, type, { ...options, animation: 'in' });
        return emptyState;
    }

    animateOut(container) {
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.classList.add('animate-out');
            setTimeout(() => {
                this.hideEmptyState(container);
            }, 300);
        }
    }

    // Utility methods
    getActiveEmptyState() {
        return this.activeEmptyState;
    }

    isEmptyStateVisible(container) {
        return container.querySelector('.empty-state') !== null;
    }

    setDefaultConfig(config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    addEmptyStateType(type, config) {
        this.emptyStates.set(type, { ...this.defaultConfig, ...config });
    }

    removeEmptyStateType(type) {
        this.emptyStates.delete(type);
    }

    // Event emission
    emitEmptyStateEvent(type, data) {
        const event = new CustomEvent('emptyStateManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup
    destroy() {
        // Hide all active empty states
        const containers = document.querySelectorAll('.empty-state');
        containers.forEach(container => {
            this.hideEmptyState(container);
        });
        
        // Clear tracking
        this.activeEmptyState = null;
    }
}

// Create singleton instance
export const emptyStateManager = new EmptyStateManager();
