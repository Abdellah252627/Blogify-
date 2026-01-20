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
            hideDelay: 3000
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
        if (options.status) {
            element.setAttribute('data-status', options.status);
        }

        // Merge options
        Object.assign(originalOptions, options);
    }

    complete(id, message = 'Complete!') {
        const barData = this.bars.get(id);
        if (!barData) return;

        this.update(id, { progress: 100, title: message });
        
        setTimeout(() => {
            this.remove(id);
        }, 1000);
    }

    error(id, message = 'Error occurred!') {
        const barData = this.bars.get(id);
        if (!barData) return;

        const { element } = barData;
        element.setAttribute('data-status', 'error');
        element.querySelector('.progress-title').textContent = message;
        
        setTimeout(() => {
            this.remove(id);
        }, 3000);
    }

    remove(id) {
        const barData = this.bars.get(id);
        if (!barData) return;

        const { element } = barData;
        element.style.opacity = '0';
        element.style.transform = 'translate(-50%, -50%) scale(0.9)';

        setTimeout(() => {
            element.remove();
            this.bars.delete(id);
        }, 300);
    }

    clear() {
        this.bars.forEach((_, id) => this.remove(id));
    }

    get(id) {
        return this.bars.get(id);
    }

    has(id) {
        return this.bars.has(id);
    }
}

export const progressManager = new ProgressBarManager();
