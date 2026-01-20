// Toast Notification System
export class ToastManager {
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
            pointer-events: none;
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
            margin-bottom: 8px;
            box-shadow: var(--shadow-lg);
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        // Add type-specific styling
        switch (type) {
            case 'success':
                toast.style.borderLeft = '4px solid var(--success)';
                break;
            case 'error':
                toast.style.borderLeft = '4px solid var(--destructive)';
                break;
            case 'warning':
                toast.style.borderLeft = '4px solid var(--warning)';
                break;
            case 'info':
                toast.style.borderLeft = '4px solid var(--info)';
                break;
        }

        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Limit number of toasts
        if (this.toasts.length > this.maxToasts) {
            const oldToast = this.toasts.shift();
            this.remove(oldToast);
        }

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentElement) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    progress(message, progress) {
        return this.show(message, 'info', 0, progress);
    }
}

export const toastManager = new ToastManager();
