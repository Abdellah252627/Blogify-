// Error Boundaries System
export class ErrorBoundaryManager {
    constructor() {
        this.errorBoundaries = new Map();
        this.errorHistory = [];
        this.maxErrorHistory = 100;
        this.defaultConfig = {
            showErrorDetails: false,
            logErrors: true,
            showRetryButton: true,
            showFallbackUI: true,
            customFallback: null,
            onError: null,
            onRecovery: null,
            maxRetries: 3,
            retryDelay: 1000
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupGlobalErrorHandlers();
        this.setupErrorReporting();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Error boundary styles */
            .error-boundary {
                position: relative;
                min-height: 100px;
            }

            .error-boundary.has-error {
                border: 2px solid var(--destructive, #dc3545);
                border-radius: var(--radius, 4px);
                background: var(--destructive-light, #f8d7da);
                padding: 1rem;
            }

            .error-boundary-fallback {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                text-align: center;
                color: var(--destructive, #dc3545);
                background: var(--destructive-light, #f8d7da);
                border: 2px solid var(--destructive, #dc3545);
                border-radius: var(--radius, 8px);
                margin: 1rem 0;
            }

            .error-boundary-fallback.minimal {
                padding: 1rem;
                background: transparent;
                border: 1px solid var(--destructive, #dc3545);
            }

            .error-boundary-fallback.inline {
                display: inline-flex;
                padding: 0.5rem 1rem;
                background: var(--destructive-light, #f8d7da);
                border: 1px solid var(--destructive, #dc3545);
                border-radius: var(--radius, 4px);
                margin: 0.5rem 0;
            }

            .error-boundary-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
                opacity: 0.8;
            }

            .error-boundary-fallback.minimal .error-boundary-icon {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }

            .error-boundary-fallback.inline .error-boundary-icon {
                font-size: 1rem;
                margin-bottom: 0;
                margin-right: 0.5rem;
            }

            .error-boundary-title {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--destructive, #dc3545);
            }

            .error-boundary-fallback.minimal .error-boundary-title {
                font-size: 1rem;
                margin-bottom: 0.25rem;
            }

            .error-boundary-fallback.inline .error-boundary-title {
                font-size: 0.875rem;
                margin-bottom: 0;
                margin-right: 0.5rem;
            }

            .error-boundary-message {
                font-size: 1rem;
                margin-bottom: 1rem;
                color: var(--destructive, #dc3545);
                line-height: 1.5;
            }

            .error-boundary-fallback.minimal .error-boundary-message {
                font-size: 0.875rem;
                margin-bottom: 0.75rem;
            }

            .error-boundary-fallback.inline .error-boundary-message {
                font-size: 0.875rem;
                margin-bottom: 0;
            }

            .error-boundary-details {
                background: var(--background, #fff);
                border: 1px solid var(--border, #e0e0e0);
                border-radius: var(--radius, 4px);
                padding: 1rem;
                margin: 1rem 0;
                font-family: monospace;
                font-size: 0.875rem;
                color: var(--foreground, #333);
                max-height: 200px;
                overflow-y: auto;
                text-align: left;
                width: 100%;
            }

            .error-boundary-details summary {
                cursor: pointer;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--primary, #007bff);
            }

            .error-boundary-details pre {
                margin: 0;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .error-boundary-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }

            .error-boundary-fallback.minimal .error-boundary-actions {
                margin-top: 0.75rem;
            }

            .error-boundary-fallback.inline .error-boundary-actions {
                margin-top: 0;
                gap: 0.25rem;
            }

            .error-boundary-btn {
                background: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: var(--radius, 4px);
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
            }

            .error-boundary-btn:hover {
                background: var(--primary-hover, #0056b3);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }

            .error-boundary-btn:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .error-boundary-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .error-boundary-btn.secondary {
                background: var(--secondary, #6c757d);
                color: var(--secondary-foreground, #fff);
            }

            .error-boundary-btn.secondary:hover {
                background: var(--secondary-hover, #545b62);
            }

            .error-boundary-btn.outline {
                background: transparent;
                color: var(--primary, #007bff);
                border: 1px solid var(--primary, #007bff);
            }

            .error-boundary-btn.outline:hover {
                background: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
            }

            .error-boundary-fallback.inline .error-boundary-btn {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
            }

            /* Error boundary states */
            .error-boundary.loading {
                opacity: 0.6;
                pointer-events: none;
            }

            .error-boundary.recovering {
                animation: errorBoundaryRecover 0.5s ease-out;
            }

            @keyframes errorBoundaryRecover {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Error boundary animations */
            .error-boundary-fallback {
                animation: errorBoundaryFadeIn 0.3s ease-out;
            }

            @keyframes errorBoundaryFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .error-boundary-fallback.hiding {
                animation: errorBoundaryFadeOut 0.3s ease-in;
            }

            @keyframes errorBoundaryFadeOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }

            /* Dark mode support */
            .dark .error-boundary-fallback {
                background: var(--destructive-dark, #721c24);
                color: var(--destructive-light, #f8d7da);
            }

            .dark .error-boundary-title {
                color: var(--destructive-light, #f8d7da);
            }

            .dark .error-boundary-message {
                color: var(--destructive-light, #f8d7da);
            }

            .dark .error-boundary-details {
                background: var(--card, #1f2937);
                border-color: var(--border, #4b5563);
                color: var(--foreground, #f3f4f6);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .error-boundary-fallback {
                    padding: 1.5rem;
                }

                .error-boundary-actions {
                    flex-direction: column;
                    align-items: stretch;
                }

                .error-boundary-btn {
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                }
            }

            /* Accessibility */
            .error-boundary-fallback:focus-within {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            .error-boundary-btn:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            /* Performance optimizations */
            .error-boundary {
                contain: layout style paint;
            }

            .error-boundary-fallback {
                will-change: opacity, transform;
            }

            /* Error boundary types */
            .error-boundary-fallback.network {
                --error-icon: '🌐';
                --error-color: var(--warning, #ffc107);
            }

            .error-boundary-fallback.javascript {
                --error-icon: '⚠️';
                --error-color: var(--destructive, #dc3545);
            }

            .error-boundary-fallback.permission {
                --error-icon: '🔒';
                --error-color: var(--info, #17a2b8);
            }

            .error-boundary-fallback.timeout {
                --error-icon: '⏰';
                --error-color: var(--warning, #ffc107);
            }

            .error-boundary-fallback.parse {
                --error-icon: '📄';
                --error-color: var(--secondary, #6c757d);
            }

            .error-boundary-fallback.security {
                --error-icon: '🛡️';
                --error-color: var(--destructive, #dc3545);
            }

            .error-boundary-fallback.resource {
                --error-icon: '📁';
                --error-color: var(--warning, #ffc107);
            }

            .error-boundary-fallback.unknown {
                --error-icon: '❓';
                --error-color: var(--secondary, #6c757d);
            }

            /* Icon styles */
            .error-boundary-icon::before {
                content: var(--error-icon, '⚠️');
                font-size: inherit;
                color: var(--error-color, var(--destructive, #dc3545));
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .error-boundary-fallback,
                .error-boundary.recovering,
                .error-boundary-fallback.hiding {
                    animation: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: Date.now()
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                timestamp: Date.now()
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleGlobalError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    setupErrorReporting() {
        // Setup error reporting interval
        setInterval(() => {
            this.reportErrors();
        }, 30000); // Report every 30 seconds
    }

    // Error boundary creation
    createErrorBoundary(container, config = {}) {
        const boundaryConfig = { ...this.defaultConfig, ...config };
        const boundaryId = this.generateId();
        
        const boundary = {
            id: boundaryId,
            container: container,
            config: boundaryConfig,
            errorCount: 0,
            lastError: null,
            retryCount: 0,
            isRecovering: false
        };

        this.errorBoundaries.set(boundaryId, boundary);

        // Wrap container content with error boundary
        this.wrapContainerWithBoundary(container, boundary);

        return boundaryId;
    }

    wrapContainerWithBoundary(container, boundary) {
        // Store original content
        const originalContent = container.innerHTML;
        
        // Create error boundary wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'error-boundary';
        wrapper.setAttribute('data-boundary-id', boundary.id);
        wrapper.innerHTML = originalContent;

        // Clear container and add wrapper
        container.innerHTML = '';
        container.appendChild(wrapper);

        // Store original content for recovery
        boundary.originalContent = originalContent;
        boundary.wrapper = wrapper;
    }

    // Error handling
    handleError(boundaryId, error, errorInfo = {}) {
        const boundary = this.errorBoundaries.get(boundaryId);
        
        if (!boundary) {
            console.warn('Error boundary not found:', boundaryId);
            return;
        }

        // Create error object
        const errorObj = {
            id: this.generateId(),
            boundaryId: boundaryId,
            type: this.getErrorType(error),
            message: error.message || 'Unknown error',
            stack: error.stack || '',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...errorInfo
        };

        // Add to error history
        this.addErrorToHistory(errorObj);

        // Update boundary state
        boundary.errorCount++;
        boundary.lastError = errorObj;

        // Log error if enabled
        if (boundary.config.logErrors) {
            console.error('Error Boundary Error:', errorObj);
        }

        // Call custom error handler
        if (boundary.config.onError) {
            try {
                boundary.config.onError(errorObj, boundary);
            } catch (handlerError) {
                console.error('Error in custom error handler:', handlerError);
            }
        }

        // Show fallback UI
        if (boundary.config.showFallbackUI) {
            this.showFallbackUI(boundary, errorObj);
        }

        // Emit error event
        this.emitErrorEvent('errorBoundaryError', {
            boundary,
            error: errorObj,
            timestamp: Date.now()
        });

        return errorObj;
    }

    showFallbackUI(boundary, error) {
        const wrapper = boundary.wrapper;
        
        // Create fallback UI
        const fallback = this.createFallbackUI(boundary, error);
        
        // Add fallback to wrapper
        wrapper.innerHTML = '';
        wrapper.appendChild(fallback);
        
        // Add error class
        wrapper.classList.add('has-error');
    }

    createFallbackUI(boundary, error) {
        const fallback = document.createElement('div');
        fallback.className = `error-boundary-fallback ${boundary.config.fallbackType || 'default'}`;
        
        // Set error type for styling
        fallback.style.setProperty('--error-icon', this.getErrorIcon(error.type));
        fallback.style.setProperty('--error-color', this.getErrorColor(error.type));

        let content = '';

        // Add icon
        content += '<div class="error-boundary-icon"></div>';

        // Add title
        const title = this.getErrorTitle(error.type);
        content += `<h3 class="error-boundary-title">${title}</h3>`;

        // Add message
        const message = this.getErrorMessage(error.type, error.message);
        content += `<p class="error-boundary-message">${message}</p>`;

        // Add error details if enabled
        if (boundary.config.showErrorDetails) {
            content += `
                <details class="error-boundary-details">
                    <summary>Error Details</summary>
                    <pre>${this.formatErrorDetails(error)}</pre>
                </details>
            `;
        }

        // Add action buttons
        content += '<div class="error-boundary-actions">';

        // Add retry button if enabled
        if (boundary.config.showRetryButton && boundary.retryCount < boundary.config.maxRetries) {
            content += `
                <button class="error-boundary-btn" data-action="retry">
                    🔄 Retry
                </button>
            `;
        }

        // Add reload button
        content += `
            <button class="error-boundary-btn secondary" data-action="reload">
                🔄 Reload Page
            </button>
        `;

        // Add report button
        content += `
            <button class="error-boundary-btn outline" data-action="report">
                📋 Report Issue
            </button>
        `;

        content += '</div>';

        fallback.innerHTML = content;

        // Add event listeners
        this.setupFallbackEventListeners(fallback, boundary, error);

        return fallback;
    }

    setupFallbackEventListeners(fallback, boundary, error) {
        // Handle button clicks
        fallback.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            
            switch (action) {
                case 'retry':
                    this.retryBoundary(boundary.id);
                    break;
                case 'reload':
                    this.reloadPage();
                    break;
                case 'report':
                    this.reportError(error);
                    break;
            }
        });
    }

    retryBoundary(boundaryId) {
        const boundary = this.errorBoundaries.get(boundaryId);
        
        if (!boundary) {
            console.warn('Error boundary not found:', boundaryId);
            return;
        }

        // Check retry limit
        if (boundary.retryCount >= boundary.config.maxRetries) {
            console.warn('Max retry limit reached for boundary:', boundaryId);
            return;
        }

        // Increment retry count
        boundary.retryCount++;
        boundary.isRecovering = true;

        // Add recovering class
        boundary.wrapper.classList.add('recovering');

        // Wait for retry delay
        setTimeout(() => {
            try {
                // Restore original content
                boundary.wrapper.innerHTML = boundary.originalContent;
                boundary.wrapper.classList.remove('has-error', 'recovering');

                // Reset error state
                boundary.lastError = null;

                // Call recovery handler
                if (boundary.config.onRecovery) {
                    boundary.config.onRecovery(boundary);
                }

                // Emit recovery event
                this.emitErrorEvent('errorBoundaryRecovered', {
                    boundary,
                    timestamp: Date.now()
                });

            } catch (recoveryError) {
                // If recovery fails, handle the error
                this.handleError(boundaryId, recoveryError, { 
                    isRetryError: true,
                    retryCount: boundary.retryCount 
                });
            }
        }, boundary.config.retryDelay);
    }

    reloadPage() {
        window.location.reload();
    }

    reportError(error) {
        // Create report data
        const reportData = {
            ...error,
            reportedAt: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now()
        };

        // Add to error history
        this.addErrorToHistory(reportData);

        // Try to send report (in a real app, this would send to a server)
        this.sendErrorReport(reportData);

        // Show confirmation
        this.showReportConfirmation();
    }

    showReportConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'error-boundary-fallback inline';
        confirmation.innerHTML = `
            <div class="error-boundary-icon"></div>
            <span class="error-boundary-title">Error reported successfully</span>
        `;

        // Add to page
        document.body.appendChild(confirmation);

        // Remove after 3 seconds
        setTimeout(() => {
            confirmation.classList.add('hiding');
            setTimeout(() => {
                confirmation.remove();
            }, 300);
        }, 3000);
    }

    // Error type detection
    getErrorType(error) {
        if (error instanceof TypeError) return 'javascript';
        if (error instanceof ReferenceError) return 'javascript';
        if (error instanceof SyntaxError) return 'javascript';
        if (error instanceof NetworkError) return 'network';
        if (error instanceof DOMException) return 'javascript';
        
        // Check error message patterns
        const message = error.message || '';
        if (message.includes('network') || message.includes('fetch')) return 'network';
        if (message.includes('permission') || message.includes('denied')) return 'permission';
        if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
        if (message.includes('parse') || message.includes('JSON')) return 'parse';
        if (message.includes('security') || message.includes('CORS')) return 'security';
        if (message.includes('resource') || message.includes('404')) return 'resource';
        
        return 'unknown';
    }

    getErrorIcon(type) {
        const icons = {
            'javascript': '⚠️',
            'network': '🌐',
            'permission': '🔒',
            'timeout': '⏰',
            'parse': '📄',
            'security': '🛡️',
            'resource': '📁',
            'unknown': '❓'
        };
        return icons[type] || '❓';
    }

    getErrorColor(type) {
        const colors = {
            'javascript': 'var(--destructive, #dc3545)',
            'network': 'var(--warning, #ffc107)',
            'permission': 'var(--info, #17a2b8)',
            'timeout': 'var(--warning, #ffc107)',
            'parse': 'var(--secondary, #6c757d)',
            'security': 'var(--destructive, #dc3545)',
            'resource': 'var(--warning, #ffc107)',
            'unknown': 'var(--secondary, #6c757d)'
        };
        return colors[type] || 'var(--secondary, #6c757d)';
    }

    getErrorTitle(type) {
        const titles = {
            'javascript': 'JavaScript Error',
            'network': 'Network Error',
            'permission': 'Permission Denied',
            'timeout': 'Request Timeout',
            'parse': 'Parse Error',
            'security': 'Security Error',
            'resource': 'Resource Error',
            'unknown': 'Unknown Error'
        };
        return titles[type] || 'Unknown Error';
    }

    getErrorMessage(type, originalMessage) {
        const messages = {
            'javascript': 'A JavaScript error occurred while rendering this component.',
            'network': 'A network error occurred while fetching data.',
            'permission': 'Permission was denied for this operation.',
            'timeout': 'The request timed out. Please try again.',
            'parse': 'Failed to parse the response data.',
            'security': 'A security error occurred.',
            'resource': 'Failed to load a required resource.',
            'unknown': 'An unexpected error occurred.'
        };

        const baseMessage = messages[type] || messages.unknown;
        
        // Include original message if it's helpful and not too long
        if (originalMessage && originalMessage.length < 100) {
            return `${baseMessage} ${originalMessage}`;
        }
        
        return baseMessage;
    }

    formatErrorDetails(error) {
        const details = [];
        
        details.push(`Type: ${error.type}`);
        details.push(`Message: ${error.message}`);
        details.push(`Timestamp: ${new Date(error.timestamp).toISOString()}`);
        
        if (error.stack) {
            details.push(`Stack Trace:\n${error.stack}`);
        }
        
        if (error.filename) {
            details.push(`File: ${error.filename}:${error.lineno}:${error.colno}`);
        }
        
        if (error.url) {
            details.push(`URL: ${error.url}`);
        }
        
        if (error.userAgent) {
            details.push(`User Agent: ${error.userAgent}`);
        }
        
        return details.join('\n\n');
    }

    // Error history management
    addErrorToHistory(error) {
        this.errorHistory.unshift(error);
        
        // Limit history size
        if (this.errorHistory.length > this.maxErrorHistory) {
            this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory);
        }
    }

    getErrorHistory() {
        return [...this.errorHistory];
    }

    clearErrorHistory() {
        this.errorHistory = [];
    }

    // Error reporting
    handleGlobalError(error) {
        this.addErrorToHistory(error);
        
        // Log error
        console.error('Global Error:', error);
        
        // Emit global error event
        this.emitErrorEvent('globalError', {
            error,
            timestamp: Date.now()
        });
    }

    sendErrorReport(error) {
        // In a real application, this would send to a server
        console.log('Error Report:', error);
        
        // Store in localStorage for demo purposes
        const reports = JSON.parse(localStorage.getItem('blogify_error_reports') || '[]');
        reports.push(error);
        
        // Limit reports
        if (reports.length > 50) {
            reports.splice(0, reports.length - 50);
        }
        
        localStorage.setItem('blogify_error_reports', JSON.stringify(reports));
    }

    reportErrors() {
        // Report accumulated errors
        if (this.errorHistory.length > 0) {
            const report = {
                errors: this.errorHistory.slice(0, 10), // Report last 10 errors
                reportedAt: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            this.sendErrorReport(report);
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event emission
    emitErrorEvent(type, data) {
        const event = new CustomEvent('errorBoundaryManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getErrorBoundary(boundaryId) {
        return this.errorBoundaries.get(boundaryId);
    }

    getAllErrorBoundaries() {
        return Array.from(this.errorBoundaries.values());
    }

    removeErrorBoundary(boundaryId) {
        const boundary = this.errorBoundaries.get(boundaryId);
        
        if (boundary) {
            // Restore original content
            if (boundary.wrapper && boundary.originalContent) {
                boundary.wrapper.innerHTML = boundary.originalContent;
                boundary.wrapper.classList.remove('has-error');
            }
            
            // Remove from tracking
            this.errorBoundaries.delete(boundaryId);
        }
    }

    setDefaultConfig(config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    // Cleanup
    destroy() {
        // Remove all error boundaries
        this.errorBoundaries.forEach((boundary, id) => {
            this.removeErrorBoundary(id);
        });
        
        // Clear error history
        this.clearErrorHistory();
        
        // Clear tracking
        this.errorBoundaries.clear();
    }
}

// Create singleton instance
export const errorBoundaryManager = new ErrorBoundaryManager();
