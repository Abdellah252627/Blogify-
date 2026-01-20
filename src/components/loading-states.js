// Loading States Management System
export class LoadingStateManager {
    constructor() {
        this.loadingStates = new Map();
        this.globalLoading = false;
        this.defaultOptions = {
            showOverlay: true,
            showSpinner: true,
            showProgress: false,
            showText: true,
            text: 'Loading...',
            overlayOpacity: 0.5,
            allowInteraction: false,
            minDuration: 500,
            maxDuration: 30000
        };
        this.init();
    }

    init() {
        this.createGlobalOverlay();
        this.setupEventListeners();
    }

    createGlobalOverlay() {
        if (!document.getElementById('global-loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading...</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    setupEventListeners() {
        // Handle escape key to cancel loading
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.globalLoading) {
                this.hideGlobal();
            }
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    start(id, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        
        // Check if loading state already exists
        if (this.loadingStates.has(id)) {
            return this.update(id, config);
        }

        const loadingState = {
            id,
            config,
            element: null,
            startTime: Date.now(),
            hideTimeout: null,
            isPaused: false,
            progress: 0
        };

        // Create loading element
        this.createLoadingElement(loadingState);
        this.loadingStates.set(id, loadingState);

        // Set minimum duration
        if (config.minDuration > 0) {
            loadingState.hideTimeout = setTimeout(() => {
                if (!loadingState.isPaused) {
                    this.stop(id);
                }
            }, config.maxDuration);
        }

        return loadingState;
    }

    createLoadingElement(loadingState) {
        const element = document.createElement('div');
        element.className = 'loading-state';
        element.id = `loading-${loadingState.id}`;
        
        let html = '';
        
        // Overlay
        if (loadingState.config.showOverlay) {
            html += '<div class="loading-overlay"></div>';
        }
        
        // Content
        html += '<div class="loading-content">';
        
        // Spinner
        if (loadingState.config.showSpinner) {
            html += '<div class="loading-spinner"></div>';
        }
        
        // Text
        if (loadingState.config.showText) {
            html += `<div class="loading-text">${loadingState.config.text}</div>`;
        }
        
        // Progress bar
        if (loadingState.config.showProgress) {
            html += '<div class="loading-progress"><div class="loading-progress-fill"></div></div>';
        }
        
        // Cancel button
        html += '<button class="loading-cancel" title="Cancel">✕</button>';
        
        html += '</div>';
        
        element.innerHTML = html;
        loadingState.element = element;

        // Add to container or body
        const container = loadingState.config.container || document.body;
        container.appendChild(element);

        // Setup event listeners
        this.setupLoadingListeners(loadingState);

        // Animate entrance
        this.animateEntrance(element);
    }

    setupLoadingListeners(loadingState) {
        const element = loadingState.element;
        
        // Cancel button
        const cancelBtn = element.querySelector('.loading-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.stop(loadingState.id);
            });
        }

        // Prevent interaction if configured
        if (!loadingState.config.allowInteraction) {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            element.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        }
    }

    update(id, updates) {
        const loadingState = this.loadingStates.get(id);
        if (!loadingState) return false;

        // Update text
        if (updates.text) {
            loadingState.config.text = updates.text;
            const textElement = loadingState.element.querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = updates.text;
            }
        }

        // Update progress
        if (updates.progress !== undefined && loadingState.config.showProgress) {
            loadingState.progress = Math.max(0, Math.min(100, updates.progress));
            const progressFill = loadingState.element.querySelector('.loading-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${loadingState.progress}%`;
            }
        }

        // Update spinner
        if (updates.spinner !== undefined) {
            loadingState.config.showSpinner = updates.spinner;
            const spinner = loadingState.element.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = updates.spinner ? 'block' : 'none';
            }
        }

        // Update overlay opacity
        if (updates.overlayOpacity !== undefined) {
            loadingState.config.overlayOpacity = updates.overlayOpacity;
            const overlay = loadingState.element.querySelector('.loading-overlay');
            if (overlay) {
                overlay.style.opacity = updates.overlayOpacity;
            }
        }

        return true;
    }

    stop(id) {
        const loadingState = this.loadingStates.get(id);
        if (!loadingState) return false;

        // Clear timeout
        if (loadingState.hideTimeout) {
            clearTimeout(loadingState.hideTimeout);
        }

        // Ensure minimum duration
        const elapsed = Date.now() - loadingState.startTime;
        const minDuration = loadingState.config.minDuration || 0;
        
        if (elapsed < minDuration) {
            // Wait for minimum duration
            setTimeout(() => {
                this.removeLoadingState(loadingState);
            }, minDuration - elapsed);
        } else {
            this.removeLoadingState(loadingState);
        }

        return true;
    }

    removeLoadingState(loadingState) {
        if (loadingState.element && loadingState.element.parentElement) {
            this.animateRemoval(loadingState.element, () => {
                loadingState.element.remove();
            });
        }
        this.loadingStates.delete(loadingState.id);
    }

    startGlobal(options = {}) {
        if (this.globalLoading) return;

        const config = { ...this.defaultOptions, ...options };
        this.globalLoading = true;

        const overlay = document.getElementById('global-loading-overlay');
        if (overlay) {
            // Update overlay content
            const content = overlay.querySelector('.loading-content');
            if (content) {
                let html = '';
                
                if (config.showSpinner) {
                    html += '<div class="loading-spinner"></div>';
                }
                
                if (config.showText) {
                    html += `<div class="loading-text">${config.text}</div>`;
                }
                
                content.innerHTML = html;
            }

            // Update overlay opacity
            overlay.style.opacity = config.overlayOpacity;
            
            // Show overlay
            overlay.style.display = 'flex';
            
            // Prevent interaction
            if (!config.allowInteraction) {
                overlay.style.pointerEvents = 'auto';
            }

            // Animate entrance
            this.animateEntrance(overlay);
        }
    }

    hideGlobal() {
        if (!this.globalLoading) return;

        const overlay = document.getElementById('global-loading-overlay');
        if (overlay) {
            this.animateRemoval(overlay, () => {
                overlay.style.display = 'none';
            });
        }
        
        this.globalLoading = false;
    }

    updateGlobal(updates) {
        if (!this.globalLoading) return false;

        const overlay = document.getElementById('global-loading-overlay');
        if (!overlay) return false;

        // Update text
        if (updates.text) {
            const textElement = overlay.querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = updates.text;
            }
        }

        // Update spinner
        if (updates.spinner !== undefined) {
            const spinner = overlay.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = updates.spinner ? 'block' : 'none';
            }
        }

        // Update opacity
        if (updates.opacity !== undefined) {
            overlay.style.opacity = updates.opacity;
        }

        return true;
    }

    // Convenience methods for common loading scenarios
    showSpinner(text = 'Loading...', options = {}) {
        return this.start('spinner', { 
            text, 
            showOverlay: true, 
            showSpinner: true, 
            showProgress: false,
            ...options 
        });
    }

    showProgress(text = 'Loading...', options = {}) {
        return this.start('progress', { 
            text, 
            showOverlay: true, 
            showSpinner: true, 
            showProgress: true,
            ...options 
        });
    }

    showText(text = 'Loading...', options = {}) {
        return this.start('text', { 
            text, 
            showOverlay: true, 
            showSpinner: false, 
            showProgress: false,
            ...options 
        });
    }

    showOverlay(text = 'Loading...', options = {}) {
        return this.start('overlay', { 
            text, 
            showOverlay: true, 
            showSpinner: false, 
            showProgress: false,
            allowInteraction: true,
            ...options 
        });
    }

    // Element-specific loading
    showElementLoading(element, options = {}) {
        const id = `element-${element.id || 'default'}`;
        const config = { 
            container: element,
            showOverlay: false,
            showSpinner: true,
            showText: false,
            ...options 
        };
        
        return this.start(id, config);
    }

    hideElementLoading(element) {
        const id = `element-${element.id || 'default'}`;
        return this.stop(id);
    }

    // Button loading states
    showButtonLoading(button, options = {}) {
        const originalText = button.textContent;
        const originalDisabled = button.disabled;
        
        // Store original state
        button.dataset.originalText = originalText;
        button.dataset.originalDisabled = originalDisabled;
        
        // Update button
        button.disabled = true;
        button.innerHTML = `
            <span class="button-spinner"></span>
            <span class="button-text">${options.text || 'Loading...'}</span>
        `;
        
        button.classList.add('loading');
        
        return {
            id: `button-${button.id || 'default'}`,
            restore: () => {
                button.disabled = button.dataset.originalDisabled === 'true';
                button.textContent = button.dataset.originalText;
                button.classList.remove('loading');
                delete button.dataset.originalText;
                delete button.dataset.originalDisabled;
            }
        };
    }

    hideButtonLoading(button) {
        if (button.dataset.originalText) {
            button.disabled = button.dataset.originalDisabled === 'true';
            button.textContent = button.dataset.originalText;
            button.classList.remove('loading');
            delete button.dataset.originalText;
            delete button.dataset.originalDisabled;
        }
    }

    // Form loading states
    showFormLoading(form, options = {}) {
        const id = `form-${form.id || 'default'}`;
        const config = { 
            container: form,
            showOverlay: true,
            showSpinner: true,
            showText: options.text || 'Submitting...',
            ...options 
        };
        
        // Disable form elements
        const elements = form.querySelectorAll('input, button, select, textarea');
        elements.forEach(el => {
            el.disabled = true;
            el.dataset.originalDisabled = 'true';
        });
        
        return this.start(id, config);
    }

    hideFormLoading(form) {
        const id = `form-${form.id || 'default'}`;
        
        // Re-enable form elements
        const elements = form.querySelectorAll('[data-original-disabled="true"]');
        elements.forEach(el => {
            el.disabled = false;
            delete el.dataset.originalDisabled;
        });
        
        return this.stop(id);
    }

    // Table loading states
    showTableLoading(table, options = {}) {
        const id = `table-${table.id || 'default'}`;
        
        // Create loading row
        const loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `
            <td colspan="${table.rows[0]?.cells.length || 1}">
                <div class="table-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${options.text || 'Loading...'}</div>
                </div>
            </td>
        `;
        
        // Add to table
        if (table.tBodies.length > 0) {
            table.tBodies[0].appendChild(loadingRow);
        } else {
            const tbody = document.createElement('tbody');
            tbody.appendChild(loadingRow);
            table.appendChild(tbody);
        }
        
        return {
            id,
            row: loadingRow,
            restore: () => {
                if (loadingRow.parentElement) {
                    loadingRow.remove();
                }
            }
        };
    }

    hideTableLoading(table, loadingState) {
        if (loadingState && loadingState.row) {
            if (loadingState.row.parentElement) {
                loadingState.row.remove();
            }
        }
    }

    // Utility methods
    animateEntrance(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    animateRemoval(element, callback) {
        element.style.transition = 'all 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    pauseAnimations() {
        this.loadingStates.forEach(loadingState => {
            if (loadingState.element) {
                const spinners = loadingState.element.querySelectorAll('.loading-spinner');
                spinners.forEach(spinner => {
                    spinner.style.animationPlayState = 'paused';
                });
            }
        });
    }

    resumeAnimations() {
        this.loadingStates.forEach(loadingState => {
            if (loadingState.element) {
                const spinners = loadingState.element.querySelectorAll('.loading-spinner');
                spinners.forEach(spinner => {
                    spinner.style.animationPlayState = 'running';
                });
            }
        });
    }

    // Getters
    isLoading(id) {
        return this.loadingStates.has(id);
    }

    getLoadingState(id) {
        return this.loadingStates.get(id);
    }

    getAllLoadingStates() {
        return Array.from(this.loadingStates.values());
    }

    getLoadingCount() {
        return this.loadingStates.size;
    }

    isGlobalLoading() {
        return this.globalLoading;
    }

    // Cleanup
    clear() {
        // Stop all loading states
        const ids = Array.from(this.loadingStates.keys());
        ids.forEach(id => this.stop(id));
        
        // Hide global loading
        this.hideGlobal();
    }

    destroy() {
        this.clear();
        
        // Remove global overlay
        const overlay = document.getElementById('global-loading-overlay');
        if (overlay && overlay.parentElement) {
            overlay.remove();
        }
    }
}

// Create singleton instance
export const loadingManager = new LoadingStateManager();
