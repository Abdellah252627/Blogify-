// Enhanced Toast Notification System with Queue and Advanced Features
export class ToastManager {
    constructor() {
        this.container = null;
        this.queue = [];
        this.maxVisible = 5;
        this.defaultOptions = {
            duration: 5000,
            type: 'info',
            position: 'top-right',
            showClose: true,
            showProgress: false,
            showIcon: true,
            animate: true,
            persistent: false,
            stack: true,
            allowHTML: false,
            onClick: null,
            onShow: null,
            onHide: null
        };
        this.toasts = new Map();
        this.init();
    }

    init() {
        this.createContainer();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        // Handle escape key to dismiss all toasts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.dismissAll();
            }
        });

        // Handle visibility change to pause/resume animations
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    show(message, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const id = this.generateId();
        
        const toast = {
            id,
            message,
            config,
            element: null,
            isVisible: false,
            isPaused: false,
            startTime: Date.now(),
            hideTimeout: null,
            progressInterval: null,
            currentProgress: 0
        };

        // Add to queue if too many visible toasts
        if (this.toasts.size >= this.maxVisible) {
            this.queue.push(toast);
            return toast;
        }

        this.renderToast(toast);
        this.toasts.set(id, toast);

        // Setup auto-hide
        if (!config.persistent && config.duration > 0) {
            toast.hideTimeout = setTimeout(() => {
                this.hide(id);
            }, config.duration);
        }

        // Setup progress bar if needed
        if (config.showProgress) {
            this.setupProgressBar(toast);
        }

        // Show callback
        if (config.onShow) {
            config.onShow(toast);
        }

        return toast;
    }

    renderToast(toast) {
        const element = document.createElement('div');
        element.className = `toast toast-${toast.config.type}`;
        element.id = `toast-${toast.id}`;
        
        // Build toast HTML
        let html = '<div class="toast-content">';
        
        // Icon
        if (toast.config.showIcon) {
            html += `<div class="toast-icon">${this.getIcon(toast.config.type)}</div>`;
        }
        
        // Message (allow HTML if configured)
        if (toast.config.allowHTML) {
            html += `<div class="toast-message">${toast.message}</div>`;
        } else {
            html += `<div class="toast-message">${this.escapeHtml(toast.message)}</div>`;
        }
        
        // Close button
        if (toast.config.showClose) {
            html += '<button class="toast-close" title="Dismiss">&times;</button>';
        }
        
        html += '</div>';
        
        // Progress bar
        if (toast.config.showProgress) {
            html += '<div class="toast-progress"><div class="toast-progress-fill"></div></div>';
        }
        
        element.innerHTML = html;
        toast.element = element;

        // Add to container
        this.container.appendChild(element);

        // Setup event listeners
        this.setupToastListeners(toast);

        // Animate entrance
        if (toast.config.animate) {
            this.animateEntrance(element, () => {
                toast.isVisible = true;
            });
        } else {
            toast.isVisible = true;
        }
    }

    setupToastListeners(toast) {
        const element = toast.element;
        
        // Click handler
        element.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast-close')) {
                if (toast.config.onClick) {
                    toast.config.onClick(toast);
                } else if (toast.config.persistent) {
                    // Persistent toasts require manual dismissal
                    return;
                } else {
                    this.hide(toast.id);
                }
            }
        });

        // Close button
        const closeBtn = element.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(toast.id);
            });
        }

        // Hover to pause auto-hide
        if (!toast.config.persistent) {
            element.addEventListener('mouseenter', () => {
                this.pauseAutoHide(toast);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resumeAutoHide(toast);
            });
        }
    }

    setupProgressBar(toast) {
        const progressFill = toast.element.querySelector('.toast-progress-fill');
        if (!progressFill) return;

        const duration = toast.config.duration || 5000;
        const interval = 50; // Update every 50ms
        const increment = (interval / duration) * 100;

        toast.progressInterval = setInterval(() => {
            if (toast.isPaused) return;
            
            toast.currentProgress = Math.min(100, toast.currentProgress + increment);
            progressFill.style.width = `${toast.currentProgress}%`;
            
            if (toast.currentProgress >= 100) {
                clearInterval(toast.progressInterval);
            }
        }, interval);
    }

    update(id, updates) {
        const toast = this.toasts.get(id);
        if (!toast) return false;

        // Update message
        if (updates.message) {
            toast.message = updates.message;
            const messageElement = toast.element.querySelector('.toast-message');
            if (messageElement) {
                messageElement.innerHTML = toast.config.allowHTML ? 
                    updates.message : 
                    this.escapeHtml(updates.message);
            }
        }

        // Update type
        if (updates.type) {
            toast.config.type = updates.type;
            toast.element.className = `toast toast-${updates.type}`;
            
            // Update icon
            const iconElement = toast.element.querySelector('.toast-icon');
            if (iconElement) {
                iconElement.textContent = this.getIcon(updates.type);
            }
        }

        // Update progress
        if (updates.progress !== undefined && toast.config.showProgress) {
            const progressFill = toast.element.querySelector('.toast-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${updates.progress}%`;
            }
        }

        return true;
    }

    hide(id) {
        const toast = this.toasts.get(id);
        if (!toast || !toast.isVisible) return false;

        // Clear timeouts
        if (toast.hideTimeout) {
            clearTimeout(toast.hideTimeout);
        }
        if (toast.progressInterval) {
            clearInterval(toast.progressInterval);
        }

        // Animate removal
        if (toast.config.animate) {
            this.animateRemoval(toast.element, () => {
                this.removeToast(toast);
            });
        } else {
            this.removeToast(toast);
        }

        // Process queue
        this.processQueue();

        // Hide callback
        if (toast.config.onHide) {
            toast.config.onHide(toast);
        }

        return true;
    }

    removeToast(toast) {
        if (toast.element && toast.element.parentElement) {
            toast.element.remove();
        }
        this.toasts.delete(toast.id);
    }

    dismissAll() {
        const ids = Array.from(this.toasts.keys());
        ids.forEach(id => this.hide(id));
        this.queue = [];
    }

    pauseAutoHide(toast) {
        if (toast.hideTimeout) {
            clearTimeout(toast.hideTimeout);
            toast.hideTimeout = null;
        }
        toast.isPaused = true;
    }

    resumeAutoHide(toast) {
        if (toast.isPaused && !toast.config.persistent && toast.config.duration > 0) {
            const remainingTime = toast.config.duration - (Date.now() - toast.startTime);
            if (remainingTime > 0) {
                toast.hideTimeout = setTimeout(() => {
                    this.hide(toast.id);
                }, remainingTime);
            }
        }
        toast.isPaused = false;
    }

    pauseAnimations() {
        this.toasts.forEach(toast => {
            if (toast.element) {
                toast.element.style.animationPlayState = 'paused';
            }
        });
    }

    resumeAnimations() {
        this.toasts.forEach(toast => {
            if (toast.element) {
                toast.element.style.animationPlayState = 'running';
            }
        });
    }

    processQueue() {
        if (this.queue.length > 0 && this.toasts.size < this.maxVisible) {
            const next = this.queue.shift();
            this.renderToast(next);
            this.toasts.set(next.id, next);
            
            // Setup auto-hide and progress for queued toast
            if (!next.config.persistent && next.config.duration > 0) {
                next.hideTimeout = setTimeout(() => {
                    this.hide(next.id);
                }, next.config.duration);
            }
            
            if (next.config.showProgress) {
                this.setupProgressBar(next);
            }
        }
    }

    animateEntrance(element, callback) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                if (callback) callback();
            }, 300);
        });
    }

    animateRemoval(element, callback) {
        element.style.transition = 'all 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[type] || icons.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateId() {
        return 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: 8000 });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning', duration: 6000 });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    loading(message, options = {}) {
        return this.show(message, { 
            ...options, 
            type: 'info', 
            persistent: true, 
            showProgress: true,
            showClose: false,
            duration: 0
        });
    }

    // Static methods
    static show(message, options = {}) {
        const manager = new ToastManager();
        return manager.show(message, options);
    }

    static success(message, options = {}) {
        const manager = new ToastManager();
        return manager.success(message, options);
    }

    static error(message, options = {}) {
        const manager = new ToastManager();
        return manager.error(message, options);
    }

    static warning(message, options = {}) {
        const manager = new ToastManager();
        return manager.warning(message, options);
    }

    static info(message, options = {}) {
        const manager = new ToastManager();
        return manager.info(message, options);
    }

    static loading(message, options = {}) {
        const manager = new ToastManager();
        return manager.loading(message, options);
    }

    // Configuration methods
    setMaxVisible(max) {
        this.maxVisible = Math.max(1, max);
    }

    setDefaultOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }

    // Getters
    getVisibleCount() {
        return this.toasts.size;
    }

    getQueueLength() {
        return this.queue.length;
    }

    getAllToasts() {
        return Array.from(this.toasts.values());
    }

    destroy() {
        this.dismissAll();
        if (this.container && this.container.parentElement) {
            this.container.remove();
        }
    }
}

// Create singleton instance
export const toastManager = new ToastManager();
