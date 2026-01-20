// Loading Skeletons System
export class SkeletonLoader {
    constructor() {
        this.skeletons = new Map();
        this.activeSkeletons = new Set();
        this.defaultConfig = {
            animation: 'pulse',
            color: '#e0e0e0',
            borderRadius: '4px',
            duration: '1.5s',
            delay: '0.1s'
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupSkeletonTypes();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Skeleton base styles */
            .skeleton {
                background: linear-gradient(90deg, var(--skeleton-color, #e0e0e0) 25%, var(--skeleton-highlight, #f0f0f0) 50%, var(--skeleton-color, #e0e0e0) 75%);
                background-size: 200% 100%;
                border-radius: var(--skeleton-border-radius, 4px);
                animation: var(--skeleton-animation, pulse) var(--skeleton-duration, 1.5s) infinite;
                animation-delay: var(--skeleton-delay, 0.1s);
                display: inline-block;
                position: relative;
                overflow: hidden;
            }

            .skeleton::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmer 2s infinite;
            }

            /* Skeleton animations */
            @keyframes pulse {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            @keyframes wave {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }

            @keyframes fade {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }

            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            /* Skeleton variants */
            .skeleton-text {
                height: 1em;
                margin: 0.25em 0;
                width: 100%;
            }

            .skeleton-text.short {
                width: 60%;
            }

            .skeleton-text.medium {
                width: 80%;
            }

            .skeleton-text.long {
                width: 100%;
            }

            .skeleton-title {
                height: 1.5em;
                margin: 0.5em 0;
                width: 100%;
            }

            .skeleton-paragraph {
                margin: 1em 0;
            }

            .skeleton-paragraph .skeleton-text:last-child {
                width: 70%;
            }

            .skeleton-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }

            .skeleton-avatar.small {
                width: 32px;
                height: 32px;
            }

            .skeleton-avatar.large {
                width: 60px;
                height: 60px;
            }

            .skeleton-button {
                height: 40px;
                width: 120px;
                border-radius: 20px;
            }

            .skeleton-button.small {
                height: 32px;
                width: 80px;
                border-radius: 16px;
            }

            .skeleton-button.large {
                height: 48px;
                width: 160px;
                border-radius: 24px;
            }

            .skeleton-card {
                height: 200px;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .skeleton-card.large {
                height: 300px;
            }

            .skeleton-card.small {
                height: 150px;
            }

            .skeleton-image {
                width: 100%;
                height: 200px;
                border-radius: 8px;
            }

            .skeleton-image.square {
                aspect-ratio: 1;
            }

            .skeleton-image.landscape {
                aspect-ratio: 16/9;
            }

            .skeleton-image.portrait {
                aspect-ratio: 3/4;
            }

            .skeleton-input {
                height: 40px;
                border-radius: 4px;
                margin: 0.5rem 0;
            }

            .skeleton-input.small {
                height: 32px;
            }

            .skeleton-input.large {
                height: 48px;
            }

            .skeleton-badge {
                height: 24px;
                width: 60px;
                border-radius: 12px;
                display: inline-block;
            }

            .skeleton-tag {
                height: 28px;
                width: 80px;
                border-radius: 14px;
                display: inline-block;
                margin-right: 0.5rem;
            }

            .skeleton-circle {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: inline-block;
            }

            .skeleton-line {
                height: 1px;
                background: var(--skeleton-color, #e0e0e0);
                margin: 1rem 0;
            }

            .skeleton-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                margin: 0 4px;
            }

            /* Skeleton container layouts */
            .skeleton-container {
                padding: 1rem;
            }

            .skeleton-header {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
            }

            .skeleton-header .skeleton-avatar {
                margin-right: 1rem;
            }

            .skeleton-header .skeleton-text {
                flex: 1;
            }

            .skeleton-content {
                margin-bottom: 1rem;
            }

            .skeleton-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .skeleton-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .skeleton-list-item {
                display: flex;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 1px solid var(--border, #eee);
            }

            .skeleton-list-item:last-child {
                border-bottom: none;
            }

            .skeleton-list-item .skeleton-avatar {
                margin-right: 1rem;
            }

            .skeleton-list-item .skeleton-content {
                flex: 1;
            }

            .skeleton-table {
                width: 100%;
                border-collapse: collapse;
            }

            .skeleton-table th,
            .skeleton-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid var(--border, #eee);
            }

            .skeleton-table th {
                background: var(--muted, #f8f9fa);
            }

            /* Responsive skeletons */
            @media (max-width: 768px) {
                .skeleton-card {
                    height: 150px;
                }
                
                .skeleton-image {
                    height: 150px;
                }
                
                .skeleton-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .skeleton-header .skeleton-avatar {
                    margin-right: 0;
                    margin-bottom: 0.5rem;
                }
            }

            /* Dark mode support */
            .dark .skeleton {
                --skeleton-color: #374151;
                --skeleton-highlight: #4b5563;
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .skeleton {
                    animation: none;
                    background: var(--skeleton-color, #e0e0e0);
                }
                
                .skeleton::after {
                    animation: none;
                }
            }

            /* Performance optimizations */
            .skeleton {
                will-change: background;
                contain: layout style paint;
            }

            /* Loading states */
            .loading .skeleton {
                display: block;
            }

            .loaded .skeleton {
                display: none;
            }

            /* Accessibility */
            .skeleton {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                pointer-events: none;
            }

            /* Custom skeleton themes */
            .skeleton.dark {
                --skeleton-color: #374151;
                --skeleton-highlight: #4b5563;
            }

            .skeleton.light {
                --skeleton-color: #e0e0e0;
                --skeleton-highlight: #f0f0f0;
            }

            .skeleton.blue {
                --skeleton-color: #dbeafe;
                --skeleton-highlight: #bfdbfe;
            }

            .skeleton.green {
                --skeleton-color: #d1fae5;
                --skeleton-highlight: #a7f3d0;
            }

            .skeleton.red {
                --skeleton-color: #fee2e2;
                --skeleton-highlight: #fecaca;
            }

            .skeleton.yellow {
                --skeleton-color: #fef3c7;
                --skeleton-highlight: #fde68a;
            }

            .skeleton.purple {
                --skeleton-color: #f3e8ff;
                --skeleton-highlight: #e9d5ff;
            }

            .skeleton.pink {
                --skeleton-color: #fce7f3;
                --skeleton-highlight: #fbcfe8;
            }
        `;
        document.head.appendChild(style);
    }

    setupSkeletonTypes() {
        // Define skeleton types
        this.skeletonTypes = {
            article: () => this.createArticleSkeleton(),
            comment: () => this.createCommentSkeleton(),
            user: () => this.createUserSkeleton(),
            card: () => this.createCardSkeleton(),
            list: () => this.createListSkeleton(),
            table: () => this.createTableSkeleton(),
            form: () => this.createFormSkeleton(),
            button: () => this.createButtonSkeleton(),
            input: () => this.createInputSkeleton(),
            image: () => this.createImageSkeleton(),
            avatar: () => this.createAvatarSkeleton(),
            text: (length = 'medium') => this.createTextSkeleton(length),
            title: () => this.createTitleSkeleton(),
            paragraph: (lines = 3) => this.createParagraphSkeleton(lines)
        };
    }

    // Skeleton creation methods
    createArticleSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text short"></div>
                    <div class="skeleton-text medium"></div>
                </div>
            </div>
            <div class="skeleton-content">
                <div class="skeleton-paragraph">
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-image landscape"></div>
                <div class="skeleton-paragraph">
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
        return container;
    }

    createCommentSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-avatar small"></div>
                <div class="skeleton-content">
                    <div class="skeleton-text short"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
            <div class="skeleton-content">
                <div class="skeleton-paragraph">
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
        return container;
    }

    createUserSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-avatar large"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text medium"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
            <div class="skeleton-content">
                <div class="skeleton-paragraph">
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
        return container;
    }

    createCardSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
        return container;
    }

    createListSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <ul class="skeleton-list">
                <li class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </li>
                <li class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </li>
                <li class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </li>
                <li class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </li>
                <li class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </li>
            </ul>
        `;
        return container;
    }

    createTableSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <table class="skeleton-table">
                <thead>
                    <tr>
                        <th><div class="skeleton-text short"></div></th>
                        <th><div class="skeleton-text short"></div></th>
                        <th><div class="skeleton-text medium"></div></th>
                        <th><div class="skeleton-text short"></div></th>
                        <th><div class="skeleton-text short"></div></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text medium"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                    </tr>
                    <tr>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text medium"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                    </tr>
                    <tr>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text medium"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                    </tr>
                    <tr>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text medium"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                        <td><div class="skeleton-text short"></div></td>
                    </tr>
                </tbody>
            </table>
        `;
        return container;
    }

    createFormSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = `
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-input"></div>
                <div class="skeleton-input"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-input large"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-input"></div>
                <div class="skeleton-input"></div>
                <div class="skeleton-button"></div>
                <div class="skeleton-button"></div>
            </div>
        `;
        return container;
    }

    createButtonSkeleton() {
        const button = document.createElement('div');
        button.className = 'skeleton-button';
        return button;
    }

    createInputSkeleton() {
        const input = document.createElement('div');
        input.className = 'skeleton-input';
        return input;
    }

    createImageSkeleton() {
        const image = document.createElement('div');
        image.className = 'skeleton-image';
        return image;
    }

    createAvatarSkeleton() {
        const avatar = document.createElement('div');
        avatar.className = 'skeleton-avatar';
        return avatar;
    }

    createTextSkeleton(length = 'medium') {
        const text = document.createElement('div');
        text.className = `skeleton-text ${length}`;
        return text;
    }

    createTitleSkeleton() {
        const title = document.createElement('div');
        title.className = 'skeleton-title';
        return title;
    }

    createParagraphSkeleton(lines = 3) {
        const paragraph = document.createElement('div');
        paragraph.className = 'skeleton-paragraph';
        
        for (let i = 0; i < lines; i++) {
            const text = document.createElement('div');
            text.className = 'skeleton-text';
            if (i === lines - 1) {
                text.classList.add('short');
            }
            paragraph.appendChild(text);
        }
        
        return paragraph;
    }

    // Public API methods
    showSkeleton(container, type, options = {}) {
        const config = { ...this.defaultConfig, ...options };
        
        // Remove existing skeletons
        this.hideSkeleton(container);
        
        // Create new skeleton
        let skeleton;
        if (typeof type === 'string' && this.skeletonTypes[type]) {
            skeleton = this.skeletonTypes[type]();
        } else if (typeof type === 'function') {
            skeleton = type();
        } else {
            skeleton = this.createCardSkeleton();
        }
        
        // Apply configuration
        this.applySkeletonConfig(skeleton, config);
        
        // Add to container
        container.appendChild(skeleton);
        
        // Track active skeleton
        this.activeSkeletons.add(skeleton);
        
        // Add loading class
        container.classList.add('loading');
        
        return skeleton;
    }

    hideSkeleton(container) {
        // Remove all skeletons
        const skeletons = container.querySelectorAll('.skeleton, .skeleton-container');
        skeletons.forEach(skeleton => {
            this.activeSkeletons.delete(skeleton);
            skeleton.remove();
        });
        
        // Remove loading class
        container.classList.remove('loading');
    }

    replaceWithContent(container, content) {
        // Hide skeleton
        this.hideSkeleton(container);
        
        // Add content with fade-in animation
        container.classList.add('loaded');
        
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof Element) {
            container.appendChild(content);
        }
        
        // Remove loaded class after animation
        setTimeout(() => {
            container.classList.remove('loaded');
        }, 300);
    }

    applySkeletonConfig(skeleton, config) {
        skeleton.style.setProperty('--skeleton-color', config.color);
        skeleton.style.setProperty('--skeleton-highlight', this.lightenColor(config.color));
        skeleton.style.setProperty('--skeleton-border-radius', config.borderRadius);
        skeleton.style.setProperty('--skeleton-duration', config.duration);
        skeleton.style.setProperty('--skeleton-delay', config.delay);
        skeleton.style.setProperty('--skeleton-animation', config.animation);
        
        // Add theme class if specified
        if (config.theme) {
            skeleton.classList.add(`skeleton-${config.theme}`);
        }
    }

    lightenColor(color) {
        // Simple color lightening function
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const lighterR = Math.min(255, r + 40);
        const lighterG = Math.min(255, g + 40);
        const lighterB = Math.min(255, b + 40);
        
        return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    }

    // Batch operations
    showSkeletons(containers, type, options = {}) {
        return Array.from(containers).map(container => {
            return this.showSkeleton(container, type, options);
        });
    }

    hideSkeletons(containers) {
        return Array.from(containers).map(container => {
            this.hideSkeleton(container);
        });
    }

    // Global skeleton management
    showGlobalSkeleton(type, options = {}) {
        const container = document.body;
        const overlay = document.createElement('div');
        overlay.className = 'skeleton-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        
        const skeleton = this.showSkeleton(overlay, type, options);
        document.body.appendChild(overlay);
        
        return { overlay, skeleton };
    }

    hideGlobalSkeleton() {
        const overlay = document.querySelector('.skeleton-overlay');
        if (overlay) {
            this.hideSkeleton(overlay);
            overlay.remove();
        }
    }

    // Utility methods
    getActiveSkeletons() {
        return Array.from(this.activeSkeletons);
    }

    isLoading(container) {
        return container.classList.contains('loading');
    }

    setDefaultConfig(config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    // Event emission
    emitSkeletonEvent(type, data) {
        const event = new CustomEvent('skeletonLoader', {
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
        // Hide all active skeletons
        const containers = document.querySelectorAll('.loading');
        this.hideSkeletons(containers);
        
        // Clear tracking
        this.activeSkeletons.clear();
        this.skeletons.clear();
    }
}

// Create singleton instance
export const skeletonLoader = new SkeletonLoader();
