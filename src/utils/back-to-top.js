// Back to Top Button System
export class BackToTopManager {
    constructor() {
        this.button = null;
        this.isVisible = false;
        this.scrollThreshold = 300;
        this.scrollDuration = 500;
        this.config = {
            position: 'bottom-right',
            size: 'medium',
            color: 'primary',
            icon: '↑',
            text: 'Back to Top',
            showText: false,
            showProgress: false,
            smoothScroll: true,
            autoHide: true,
            hideDelay: 1000,
            zIndex: 1000
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.createButton();
        this.setupEventListeners();
        this.setupScrollListener();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Back to top button base styles */
            .back-to-top {
                position: fixed;
                z-index: var(--back-to-top-z-index, 1000);
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                font-family: inherit;
                font-size: inherit;
                line-height: 1;
                text-decoration: none;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            }

            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .back-to-top:hover {
                background: var(--primary-hover, #0056b3);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
            }

            .back-to-top:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .back-to-top:active {
                transform: translateY(0);
                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }

            /* Position variants */
            .back-to-top.bottom-right {
                bottom: 2rem;
                right: 2rem;
            }

            .back-to-top.bottom-left {
                bottom: 2rem;
                left: 2rem;
            }

            .back-to-top.top-right {
                top: 2rem;
                right: 2rem;
            }

            .back-to-top.top-left {
                top: 2rem;
                left: 2rem;
            }

            .back-to-top.center-right {
                top: 50%;
                right: 2rem;
                transform: translateY(-50%) translateY(20px);
            }

            .back-to-top.center-right.visible {
                transform: translateY(-50%) translateY(0);
            }

            .back-to-top.center-left {
                top: 50%;
                left: 2rem;
                transform: translateY(-50%) translateY(20px);
            }

            .back-to-top.center-left.visible {
                transform: translateY(-50%) translateY(0);
            }

            /* Size variants */
            .back-to-top.small {
                width: 48px;
                height: 48px;
                font-size: 1.25rem;
            }

            .back-to-top.medium {
                width: 56px;
                height: 56px;
                font-size: 1.5rem;
            }

            .back-to-top.large {
                width: 64px;
                height: 64px;
                font-size: 1.75rem;
            }

            .back-to-top.xlarge {
                width: 72px;
                height: 72px;
                font-size: 2rem;
            }

            /* Color variants */
            .back-to-top.primary {
                background: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
            }

            .back-to-top.primary:hover {
                background: var(--primary-hover, #0056b3);
            }

            .back-to-top.secondary {
                background: var(--secondary, #6c757d);
                color: var(--secondary-foreground, #fff);
            }

            .back-to-top.secondary:hover {
                background: var(--secondary-hover, #545b62);
            }

            .back-to-top.success {
                background: var(--success, #28a745);
                color: var(--success-foreground, #fff);
            }

            .back-to-top.success:hover {
                background: var(--success-hover, #1e7e34);
            }

            .back-to-top.danger {
                background: var(--destructive, #dc3545);
                color: var(--destructive-foreground, #fff);
            }

            .back-to-top.danger:hover {
                background: var(--destructive-hover, #c82333);
            }

            .back-to-top.warning {
                background: var(--warning, #ffc107);
                color: var(--warning-foreground, #212529);
            }

            .back-to-top.warning:hover {
                background: var(--warning-hover, #e0a800);
            }

            .back-to-top.info {
                background: var(--info, #17a2b8);
                color: var(--info-foreground, #fff);
            }

            .back-to-top.info:hover {
                background: var(--info-hover, #138496);
            }

            .back-to-top.light {
                background: var(--light, #f8f9fa);
                color: var(--light-foreground, #212529);
                border: 1px solid var(--border, #dee2e6);
            }

            .back-to-top.light:hover {
                background: var(--light-hover, #e2e6ea);
            }

            .back-to-top.dark {
                background: var(--dark, #343a40);
                color: var(--dark-foreground, #fff);
            }

            .back-to-top.dark:hover {
                background: var(--dark-hover, #1d2124);
            }

            /* With text */
            .back-to-top.with-text {
                border-radius: 2rem;
                padding: 0.75rem 1.5rem;
                gap: 0.5rem;
                width: auto;
                min-width: 120px;
            }

            .back-to-top.with-text.small {
                padding: 0.5rem 1rem;
                min-width: 100px;
            }

            .back-to-top.with-text.medium {
                padding: 0.75rem 1.5rem;
                min-width: 120px;
            }

            .back-to-top.with-text.large {
                padding: 1rem 2rem;
                min-width: 140px;
            }

            .back-to-top.with-text.xlarge {
                padding: 1.25rem 2.5rem;
                min-width: 160px;
            }

            /* With progress */
            .back-to-top.with-progress {
                position: relative;
                overflow: hidden;
            }

            .back-to-top-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transform-origin: left;
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }

            /* Icon styles */
            .back-to-top-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 1em;
                height: 1em;
            }

            .back-to-top-text {
                font-weight: 500;
                white-space: nowrap;
            }

            /* Animation variants */
            .back-to-top.bounce {
                animation: backToTopBounce 2s infinite;
            }

            @keyframes backToTopBounce {
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

            .back-to-top.pulse {
                animation: backToTopPulse 2s infinite;
            }

            @keyframes backToTopPulse {
                0% {
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
                50% {
                    box-shadow: 0 4px 20px rgba(0, 123, 255, 0.6);
                }
                100% {
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
            }

            .back-to-top.rotate {
                animation: backToTopRotate 2s linear infinite;
            }

            @keyframes backToTopRotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .back-to-top.bottom-right {
                    bottom: 1rem;
                    right: 1rem;
                }

                .back-to-top.bottom-left {
                    bottom: 1rem;
                    left: 1rem;
                }

                .back-to-top.top-right {
                    top: 1rem;
                    right: 1rem;
                }

                .back-to-top.top-left {
                    top: 1rem;
                    left: 1rem;
                }

                .back-to-top.center-right,
                .back-to-top.center-left {
                    display: none;
                }

                .back-to-top.small {
                    width: 44px;
                    height: 44px;
                    font-size: 1.125rem;
                }

                .back-to-top.medium {
                    width: 48px;
                    height: 48px;
                    font-size: 1.25rem;
                }

                .back-to-top.large {
                    width: 52px;
                    height: 52px;
                    font-size: 1.375rem;
                }

                .back-to-top.xlarge {
                    width: 56px;
                    height: 56px;
                    font-size: 1.5rem;
                }

                .back-to-top.with-text {
                    padding: 0.5rem 1rem;
                    min-width: 100px;
                }
            }

            /* Dark mode support */
            .dark .back-to-top {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .dark .back-to-top:hover {
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .back-to-top {
                    transition: none;
                }

                .back-to-top.bounce,
                .back-to-top.pulse,
                .back-to-top.rotate {
                    animation: none;
                }

                .back-to-top-progress {
                    transition: none;
                }
            }

            /* Accessibility */
            .back-to-top:focus-visible {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .back-to-top[aria-disabled="true"] {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            /* Performance optimizations */
            .back-to-top {
                will-change: transform, opacity;
                contain: layout style paint;
            }

            /* Print styles */
            @media print {
                .back-to-top {
                    display: none !important;
                }
            }

            /* Custom scrollbar progress */
            .back-to-top.scrollbar-progress {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--primary, #007bff);
                transform-origin: left;
                transform: scaleX(0);
                transition: transform 0.3s ease;
                z-index: calc(var(--back-to-top-z-index, 1000) - 1);
                border-radius: 0 0 2px 2px;
            }

            /* Floating label */
            .back-to-top-label {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: var(--foreground, #212529);
                color: var(--background, #fff);
                padding: 0.5rem 0.75rem;
                border-radius: var(--radius, 4px);
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                margin-bottom: 0.5rem;
                pointer-events: none;
            }

            .back-to-top-label::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: var(--foreground, #212529);
            }

            .back-to-top:hover .back-to-top-label {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    createButton() {
        // Create button element
        this.button = document.createElement('button');
        this.button.className = 'back-to-top';
        this.button.setAttribute('aria-label', 'Back to top');
        this.button.setAttribute('title', 'Back to top');
        this.button.innerHTML = `
            <span class="back-to-top-icon">${this.config.icon}</span>
            ${this.config.showText ? `<span class="back-to-top-text">${this.config.text}</span>` : ''}
            ${this.config.showProgress ? '<div class="back-to-top-progress"></div>' : ''}
            <span class="back-to-top-label">Back to top</span>
        `;

        // Apply configuration
        this.applyConfig();

        // Add to page
        document.body.appendChild(this.button);

        // Setup progress tracking
        if (this.config.showProgress) {
            this.setupProgressTracking();
        }
    }

    applyConfig() {
        if (!this.button) return;

        // Set classes
        this.button.className = `back-to-top ${this.config.position} ${this.config.size} ${this.config.color}`;
        
        if (this.config.showText) {
            this.button.classList.add('with-text');
        }
        
        if (this.config.showProgress) {
            this.button.classList.add('with-progress');
        }

        // Set z-index
        this.button.style.setProperty('--back-to-top-z-index', this.config.zIndex.toString());

        // Update content
        this.button.innerHTML = `
            <span class="back-to-top-icon">${this.config.icon}</span>
            ${this.config.showText ? `<span class="back-to-top-text">${this.config.text}</span>` : ''}
            ${this.config.showProgress ? '<div class="back-to-top-progress"></div>' : ''}
            <span class="back-to-top-label">Back to top</span>
        `;
    }

    setupEventListeners() {
        // Click handler
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });

        // Keyboard handler
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });

        // Touch handler
        this.button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });

        // Listen for configuration changes
        document.addEventListener('updateBackToTopConfig', (e) => {
            this.updateConfig(e.detail);
        });

        // Listen for show/hide requests
        document.addEventListener('showBackToTop', () => {
            this.show();
        });

        document.addEventListener('hideBackToTop', () => {
            this.hide();
        });

        // Listen for destroy request
        document.addEventListener('destroyBackToTop', () => {
            this.destroy();
        });
    }

    setupScrollListener() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Check scroll position
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const shouldShow = scrollTop > this.scrollThreshold;
            
            if (shouldShow && !this.isVisible) {
                this.show();
            } else if (!shouldShow && this.isVisible) {
                this.hide();
            }
            
            // Update progress if enabled
            if (this.config.showProgress) {
                this.updateProgress();
            }
            
            // Auto-hide after scrolling stops
            if (this.config.autoHide && this.isVisible) {
                scrollTimeout = setTimeout(() => {
                    this.hide();
                }, this.config.hideDelay);
            }
        }, { passive: true });

        // Initial check
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > this.scrollThreshold) {
            this.show();
        }
    }

    setupProgressTracking() {
        // Progress is updated in scroll listener
        this.updateProgress();
    }

    updateProgress() {
        if (!this.config.showProgress || !this.button) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / scrollHeight, 1);

        const progressBar = this.button.querySelector('.back-to-top-progress');
        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }
    }

    scrollToTop() {
        if (this.config.smoothScroll) {
            this.smoothScrollToTop();
        } else {
            this.instantScrollToTop();
        }

        // Emit scroll event
        this.emitBackToTopEvent('scrolledToTop', {
            timestamp: Date.now()
        });
    }

    smoothScrollToTop() {
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const startTime = performance.now();
        const duration = this.scrollDuration;

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentPosition = startPosition * (1 - easeProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                window.scrollTo(0, 0);
                
                // Emit completion event
                this.emitBackToTopEvent('scrollCompleted', {
                    duration: Date.now() - startTime,
                    timestamp: Date.now()
                });
            }
        };

        requestAnimationFrame(animateScroll);
    }

    instantScrollToTop() {
        window.scrollTo(0, 0);
        
        // Emit completion event
        this.emitBackToTopEvent('scrollCompleted', {
            duration: 0,
            timestamp: Date.now()
        });
    }

    show() {
        if (this.button && !this.isVisible) {
            this.button.classList.add('visible');
            this.isVisible = true;
            
            // Emit show event
            this.emitBackToTopEvent('buttonShown', {
                timestamp: Date.now()
            });
        }
    }

    hide() {
        if (this.button && this.isVisible) {
            this.button.classList.remove('visible');
            this.isVisible = false;
            
            // Emit hide event
            this.emitBackToTopEvent('buttonHidden', {
                timestamp: Date.now()
            });
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.applyConfig();
        
        // Update scroll threshold
        if (newConfig.scrollThreshold !== undefined) {
            this.scrollThreshold = newConfig.scrollThreshold;
        }
        
        // Update scroll duration
        if (newConfig.scrollDuration !== undefined) {
            this.scrollDuration = newConfig.scrollDuration;
        }
        
        // Update progress tracking
        if (newConfig.showProgress !== undefined) {
            if (newConfig.showProgress && !this.config.showProgress) {
                this.setupProgressTracking();
            }
        }
        
        // Emit update event
        this.emitBackToTopEvent('configUpdated', {
            config: this.config,
            timestamp: Date.now()
        });
    }

    // Animation methods
    addAnimation(animation) {
        if (this.button) {
            this.button.classList.add(animation);
        }
    }

    removeAnimation(animation) {
        if (this.button) {
            this.button.classList.remove(animation);
        }
    }

    // Position methods
    setPosition(position) {
        const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center-right', 'center-left'];
        
        if (positions.includes(position)) {
            // Remove existing position classes
            positions.forEach(pos => {
                this.button.classList.remove(pos);
            });
            
            // Add new position class
            this.button.classList.add(position);
            this.config.position = position;
        }
    }

    // Size methods
    setSize(size) {
        const sizes = ['small', 'medium', 'large', 'xlarge'];
        
        if (sizes.includes(size)) {
            // Remove existing size classes
            sizes.forEach(s => {
                this.button.classList.remove(s);
            });
            
            // Add new size class
            this.button.classList.add(size);
            this.config.size = size;
        }
    }

    // Color methods
    setColor(color) {
        const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
        
        if (colors.includes(color)) {
            // Remove existing color classes
            colors.forEach(c => {
                this.button.classList.remove(c);
            });
            
            // Add new color class
            this.button.classList.add(color);
            this.config.color = color;
        }
    }

    // Icon methods
    setIcon(icon) {
        this.config.icon = icon;
        const iconElement = this.button.querySelector('.back-to-top-icon');
        if (iconElement) {
            iconElement.textContent = icon;
        }
    }

    // Text methods
    setText(text) {
        this.config.text = text;
        const textElement = this.button.querySelector('.back-to-top-text');
        if (textElement) {
            textElement.textContent = text;
        }
    }

    showText(show) {
        this.config.showText = show;
        
        if (show) {
            this.button.classList.add('with-text');
            const textElement = this.button.querySelector('.back-to-top-text');
            if (!textElement) {
                this.button.innerHTML = `
                    <span class="back-to-top-icon">${this.config.icon}</span>
                    <span class="back-to-top-text">${this.config.text}</span>
                    ${this.config.showProgress ? '<div class="back-to-top-progress"></div>' : ''}
                    <span class="back-to-top-label">Back to top</span>
                `;
            }
        } else {
            this.button.classList.remove('with-text');
            const textElement = this.button.querySelector('.back-to-top-text');
            if (textElement) {
                textElement.remove();
            }
        }
    }

    // Progress methods
    showProgress(show) {
        this.config.showProgress = show;
        
        if (show) {
            this.button.classList.add('with-progress');
            const progressElement = this.button.querySelector('.back-to-top-progress');
            if (!progressElement) {
                this.button.innerHTML += '<div class="back-to-top-progress"></div>';
                this.setupProgressTracking();
            }
        } else {
            this.button.classList.remove('with-progress');
            const progressElement = this.button.querySelector('.back-to-top-progress');
            if (progressElement) {
                progressElement.remove();
            }
        }
    }

    // State methods
    isButtonVisible() {
        return this.isVisible;
    }

    getScrollPosition() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    getScrollProgress() {
        const scrollTop = this.getScrollPosition();
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(scrollTop / scrollHeight, 1);
    }

    // Utility methods
    emitBackToTopEvent(type, data) {
        const event = new CustomEvent('backToTopManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getButton() {
        return this.button;
    }

    getConfig() {
        return { ...this.config };
    }

    setScrollThreshold(threshold) {
        this.scrollThreshold = threshold;
        this.config.scrollThreshold = threshold;
    }

    setScrollDuration(duration) {
        this.scrollDuration = duration;
        this.config.scrollDuration = duration;
    }

    // Cleanup
    destroy() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
        
        this.isVisible = false;
        
        // Emit destroy event
        this.emitBackToTopEvent('destroyed', {
            timestamp: Date.now()
        });
    }
}

// Create singleton instance
export const backToTopManager = new BackToTopManager();
