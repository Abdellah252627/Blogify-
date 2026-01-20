// Enhanced Progress Bar Manager with Cancellation and Advanced Features
export class ProgressManager {
    constructor() {
        this.progressBars = new Map();
        this.queue = [];
        this.maxConcurrent = 3;
        this.defaultOptions = {
            showCancel: true,
            showPercentage: true,
            showTimeRemaining: true,
            animate: true,
            persistent: false,
            autoHide: true,
            hideDelay: 3000,
            showDetails: false
        };
    }

    create(id, options = {}) {
        // Check if progress bar already exists
        if (this.progressBars.has(id)) {
            return this.update(id, options);
        }

        const config = { ...this.defaultOptions, ...options };
        const progressBar = {
            id,
            config,
            startTime: Date.now(),
            currentProgress: 0,
            isCancelled: false,
            isCompleted: false,
            error: null,
            element: null,
            updateInterval: null,
            timeRemaining: null
        };

        // Add to queue if too many concurrent operations
        if (this.progressBars.size >= this.maxConcurrent) {
            this.queue.push(progressBar);
            return progressBar;
        }

        this.renderProgressBar(progressBar);
        this.progressBars.set(id, progressBar);

        // Start time tracking
        if (config.showTimeRemaining) {
            this.startTimeTracking(progressBar);
        }

        return progressBar;
    }

    renderProgressBar(progressBar) {
        const container = document.getElementById('progress-container') || this.createContainer();
        
        const element = document.createElement('div');
        element.className = 'progress-bar-container';
        element.id = `progress-${progressBar.id}`;
        element.innerHTML = `
            <div class="progress-header">
                <div class="progress-info">
                    <span class="progress-title">${progressBar.config.title || 'Processing...'}</span>
                    <span class="progress-percentage">0%</span>
                    ${progressBar.config.showTimeRemaining ? '<span class="progress-time">Calculating...</span>' : ''}
                </div>
                ${progressBar.config.showCancel ? '<button class="progress-cancel" title="Cancel operation">✕</button>' : ''}
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-status">Initializing...</div>
            </div>
            ${progressBar.config.showDetails ? '<div class="progress-details"></div>' : ''}
        `;

        container.appendChild(element);
        progressBar.element = element;

        // Setup event listeners
        this.setupEventListeners(progressBar);

        // Animate entrance
        if (progressBar.config.animate) {
            this.animateEntrance(element);
        }
    }

    setupEventListeners(progressBar) {
        const cancelBtn = progressBar.element.querySelector('.progress-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancel(progressBar.id);
            });
        }
    }

    update(id, updates) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return false;

        // Update progress
        if (updates.progress !== undefined) {
            progressBar.currentProgress = Math.max(0, Math.min(100, updates.progress));
            this.updateProgressDisplay(progressBar);
        }

        // Update title
        if (updates.title) {
            progressBar.config.title = updates.title;
            const titleElement = progressBar.element.querySelector('.progress-title');
            if (titleElement) titleElement.textContent = updates.title;
        }

        // Update status
        if (updates.status) {
            const statusElement = progressBar.element.querySelector('.progress-status');
            if (statusElement) statusElement.textContent = updates.status;
        }

        // Update details
        if (updates.details && progressBar.config.showDetails) {
            const detailsElement = progressBar.element.querySelector('.progress-details');
            if (detailsElement) detailsElement.innerHTML = updates.details;
        }

        // Check for completion
        if (progressBar.currentProgress >= 100 && !progressBar.isCompleted) {
            this.complete(id);
        }

        return true;
    }

    updateProgressDisplay(progressBar) {
        const fill = progressBar.element.querySelector('.progress-fill');
        const percentage = progressBar.element.querySelector('.progress-percentage');
        const status = progressBar.element.querySelector('.progress-status');

        if (fill) {
            fill.style.width = `${progressBar.currentProgress}%`;
            
            // Add color based on progress
            if (progressBar.currentProgress < 30) {
                fill.className = 'progress-fill progress-warning';
            } else if (progressBar.currentProgress < 70) {
                fill.className = 'progress-fill progress-info';
            } else {
                fill.className = 'progress-fill progress-success';
            }
        }

        if (percentage && progressBar.config.showPercentage) {
            percentage.textContent = `${Math.round(progressBar.currentProgress)}%`;
        }

        if (status) {
            if (progressBar.currentProgress < 30) {
                status.textContent = 'Starting...';
            } else if (progressBar.currentProgress < 70) {
                status.textContent = 'Processing...';
            } else {
                status.textContent = 'Almost done...';
            }
        }

        // Update time remaining
        if (progressBar.config.showTimeRemaining && progressBar.timeRemaining) {
            this.updateTimeRemaining(progressBar);
        }
    }

    startTimeTracking(progressBar) {
        const updateInterval = setInterval(() => {
            if (progressBar.isCancelled || progressBar.isCompleted) {
                clearInterval(updateInterval);
                return;
            }

            const elapsed = Date.now() - progressBar.startTime;
            const progress = progressBar.currentProgress;
            
            if (progress > 0) {
                const estimatedTotal = (elapsed / progress) * 100;
                const remaining = estimatedTotal - elapsed;
                progressBar.timeRemaining = remaining;
                this.updateTimeRemaining(progressBar);
            }
        }, 1000);

        progressBar.updateInterval = updateInterval;
    }

    updateTimeRemaining(progressBar) {
        const timeElement = progressBar.element.querySelector('.progress-time');
        if (timeElement && progressBar.timeRemaining) {
            timeElement.textContent = this.formatTime(progressBar.timeRemaining);
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m remaining`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s remaining`;
        } else {
            return `${seconds}s remaining`;
        }
    }

    complete(id, options = {}) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar || progressBar.isCompleted) return false;

        progressBar.isCompleted = true;
        progressBar.currentProgress = 100;

        // Clear time tracking
        if (progressBar.updateInterval) {
            clearInterval(progressBar.updateInterval);
        }

        // Update display
        this.update(id, { 
            progress: 100, 
            status: options.status || 'Completed!',
            details: options.details || ''
        });

        // Add completion styling
        const element = progressBar.element;
        element.classList.add('progress-completed');
        
        const fill = element.querySelector('.progress-fill');
        if (fill) fill.className = 'progress-fill progress-success';

        // Auto-hide if configured
        if (progressBar.config.autoHide) {
            setTimeout(() => {
                this.hide(id);
            }, progressBar.config.hideDelay);
        }

        // Process queue
        this.processQueue();

        // Emit completion event
        this.emitEvent('progressComplete', { id, progressBar });

        return true;
    }

    cancel(id) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar || progressBar.isCancelled || progressBar.isCompleted) return false;

        progressBar.isCancelled = true;

        // Clear time tracking
        if (progressBar.updateInterval) {
            clearInterval(progressBar.updateInterval);
        }

        // Update display
        const element = progressBar.element;
        element.classList.add('progress-cancelled');
        
        const fill = element.querySelector('.progress-fill');
        if (fill) fill.className = 'progress-fill progress-danger';

        const status = element.querySelector('.progress-status');
        if (status) status.textContent = 'Cancelled';

        const percentage = element.querySelector('.progress-percentage');
        if (percentage) percentage.textContent = 'Cancelled';

        // Auto-hide cancelled progress bars
        setTimeout(() => {
            this.hide(id);
        }, 2000);

        // Process queue
        this.processQueue();

        // Emit cancellation event
        this.emitEvent('progressCancel', { id, progressBar });

        return true;
    }

    error(id, error) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return false;

        progressBar.error = error;
        progressBar.isCompleted = true;

        // Clear time tracking
        if (progressBar.updateInterval) {
            clearInterval(progressBar.updateInterval);
        }

        // Update display
        const element = progressBar.element;
        element.classList.add('progress-error');
        
        const fill = element.querySelector('.progress-fill');
        if (fill) fill.className = 'progress-fill progress-danger';

        const status = element.querySelector('.progress-status');
        if (status) status.textContent = 'Error: ' + (error.message || 'Unknown error');

        // Show error details if available
        if (progressBar.config.showDetails && error.details) {
            const detailsElement = element.querySelector('.progress-details');
            if (detailsElement) {
                detailsElement.innerHTML = `<div class="error-details">${error.details}</div>`;
            }
        }

        // Auto-hide error progress bars
        setTimeout(() => {
            this.hide(id);
        }, 5000);

        // Process queue
        this.processQueue();

        // Emit error event
        this.emitEvent('progressError', { id, progressBar, error });

        return true;
    }

    hide(id) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return false;

        // Clear time tracking
        if (progressBar.updateInterval) {
            clearInterval(progressBar.updateInterval);
        }

        // Animate removal
        if (progressBar.element) {
            this.animateRemoval(progressBar.element, () => {
                progressBar.element.remove();
            });
        }

        this.progressBars.delete(id);

        // Emit hide event
        this.emitEvent('progressHide', { id, progressBar });

        return true;
    }

    clear() {
        // Clear all progress bars
        const ids = Array.from(this.progressBars.keys());
        ids.forEach(id => this.hide(id));
        
        // Clear queue
        this.queue = [];
    }

    processQueue() {
        if (this.queue.length > 0 && this.progressBars.size < this.maxConcurrent) {
            const next = this.queue.shift();
            this.renderProgressBar(next);
            this.progressBars.set(next.id, next);
            
            // Start time tracking
            if (next.config.showTimeRemaining) {
                this.startTimeTracking(next);
            }
        }
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'progress-container';
        container.className = 'progress-container';
        document.body.appendChild(container);
        return container;
    }

    animateEntrance(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    animateRemoval(element, callback) {
        element.style.transition = 'all 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    emitEvent(eventType, data) {
        const event = new CustomEvent('progressEvent', {
            detail: {
                type: eventType,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    getProgress(id) {
        return this.progressBars.get(id);
    }

    getAllProgress() {
        return Array.from(this.progressBars.values());
    }

    getQueueLength() {
        return this.queue.length;
    }

    setMaxConcurrent(max) {
        this.maxConcurrent = Math.max(1, max);
    }

    // Static methods for convenience
    static show(title, options = {}) {
        const manager = new ProgressManager();
        return manager.create('default', { title, ...options });
    }

    static hide(id = 'default') {
        const container = document.getElementById('progress-container');
        if (container) {
            const element = container.querySelector(`#progress-${id}`);
            if (element) {
                element.remove();
                return true;
            }
        }
        return false;
    }
}

// Create singleton instance
export const progressManager = new ProgressManager();
