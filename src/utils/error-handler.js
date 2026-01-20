// Error Handling and User Feedback System
export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.defaultOptions = {
            showNotification: true,
            logToConsole: true,
            showToast: true,
            showDetails: false,
            allowRetry: false,
            retryCallback: null,
            fallbackMessage: 'An error occurred. Please try again.',
            userFriendly: true
        };
        this.init();
    }

    init() {
        this.setupGlobalErrorHandlers();
        this.setupPerformanceMonitoring();
    }

    setupGlobalErrorHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleRejection(event.reason, {
                type: 'unhandled_rejection',
                source: 'promise',
                severity: 'high'
            });
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError(event.error, {
                type: 'javascript_error',
                source: 'script',
                severity: 'high',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event.target, {
                    type: 'resource_error',
                    source: 'resource',
                    severity: 'medium'
                });
            }
        }, true);
    }

    setupPerformanceMonitoring() {
        // Monitor error rates
        this.errorMetrics = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySource: {},
            errorsByHour: {},
            lastError: null,
            errorRate: 0
        };

        // Update metrics periodically
        setInterval(() => {
            this.updateErrorMetrics();
        }, 60000); // Every minute
    }

    handle(error, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        
        // Create error object
        const errorObj = this.createErrorObject(error, config);
        
        // Log error
        if (config.logToConsole) {
            this.logError(errorObj);
        }
        
        // Add to error log
        this.addToErrorLog(errorObj);
        
        // Show user feedback
        if (config.showNotification || config.showToast) {
            this.showErrorFeedback(errorObj, config);
        }
        
        // Update metrics
        this.updateErrorMetrics(errorObj);
        
        // Emit error event
        this.emitErrorEvent(errorObj);
        
        return errorObj;
    }

    handleRejection(reason, options = {}) {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        return this.handle(error, {
            ...options,
            type: 'promise_rejection',
            source: 'promise'
        });
    }

    handleJavaScriptError(error, options = {}) {
        return this.handle(error, {
            ...options,
            type: 'javascript_error',
            source: 'script'
        });
    }

    handleResourceError(element, options = {}) {
        const error = new Error(`Failed to load resource: ${element.tagName} ${element.src || element.href}`);
        error.element = element;
        error.resourceType = element.tagName.toLowerCase();
        
        return this.handle(error, {
            ...options,
            type: 'resource_error',
            source: 'resource'
        });
    }

    handleAsyncError(promise, options = {}) {
        return promise.catch(error => {
            return this.handle(error, options);
        });
    }

    createErrorObject(error, options) {
        const errorObj = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            type: options.type || 'error',
            source: options.source || 'unknown',
            severity: options.severity || 'medium',
            message: this.getErrorMessage(error),
            originalError: error,
            stack: error.stack,
            userFriendly: options.userFriendly !== false,
            showNotification: options.showNotification,
            allowRetry: options.allowRetry,
            retryCallback: options.retryCallback,
            context: options.context || {},
            userAgent: navigator.userAgent,
            url: window.location.href,
            resolved: false
        };

        // Add additional context
        if (options.filename) errorObj.filename = options.filename;
        if (options.lineno) errorObj.lineno = options.lineno;
        if (options.colno) errorObj.colno = options.colno;

        return errorObj;
    }

    getErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error.message) {
            return error.message;
        }
        
        if (error.name) {
            return `${error.name}: ${error.toString()}`;
        }
        
        return 'Unknown error occurred';
    }

    getUserFriendlyMessage(error) {
        const friendlyMessages = {
            'NetworkError': 'Network connection issue. Please check your internet connection.',
            'TypeError': 'Invalid data format. Please check your input.',
            'ReferenceError': 'System error occurred. Please refresh the page.',
            'SyntaxError': 'Code syntax error. Please check your code.',
            'RangeError': 'Invalid value provided. Please check your input.',
            'AbortError': 'Operation was cancelled.',
            'TimeoutError': 'Operation timed out. Please try again.',
            'SecurityError': 'Security restriction prevented this action.',
            'ValidationError': 'Invalid input provided.',
            'AuthenticationError': 'Authentication failed. Please log in again.',
            'AuthorizationError': 'You don\'t have permission to perform this action.',
            'NotFoundError': 'Requested resource was not found.',
            'ConflictError': 'Data conflict occurred. Please refresh and try again.',
            'InternalServerError': 'Server error occurred. Please try again later.',
            'ServiceUnavailable': 'Service is temporarily unavailable. Please try again later.',
            'NetworkTimeoutError': 'Network request timed out. Please check your connection.'
        };

        const errorName = error.name || error.type || 'Error';
        return friendlyMessages[errorName] || 'An error occurred. Please try again.';
    }

    logError(errorObj) {
        // Add to console with appropriate level
        const logLevel = this.getLogLevel(errorObj.severity);
        
        const logData = {
            id: errorObj.id,
            type: errorObj.type,
            source: errorObj.source,
            severity: errorObj.severity,
            message: errorObj.message,
            timestamp: new Date(errorObj.timestamp).toISOString(),
            context: errorObj.context,
            stack: errorObj.stack
        };

        console[logLevel]('Error:', logData);
    }

    getLogLevel(severity) {
        switch (severity) {
            case 'low': return 'info';
            case 'medium': return 'warn';
            case 'high': return 'error';
            case 'critical': return 'error';
            default: return 'error';
        }
    }

    addToErrorLog(errorObj) {
        this.errorLog.push(errorObj);
        
        // Maintain log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
    }

    showErrorFeedback(errorObj, options) {
        // Show toast notification
        if (options.showToast) {
            const message = errorObj.userFriendly ? 
                errorObj.message : 
                this.getUserFriendlyMessage(errorObj);
            
            const toastType = this.getToastType(errorObj.severity);
            
            // Import toast manager dynamically to avoid circular dependency
            if (window.toastManager) {
                window.toastManager[toastType](message, {
                    duration: this.getToastDuration(errorObj.severity),
                    showClose: true,
                    onClick: errorObj.allowRetry ? () => this.retryError(errorObj) : null,
                    showDetails: options.showDetails,
                    details: this.getErrorDetails(errorObj)
                });
            }
        }

        // Show modal for critical errors
        if (errorObj.severity === 'critical' && options.showNotification) {
            this.showErrorModal(errorObj);
        }
    }

    getToastType(severity) {
        switch (severity) {
            case 'low': return 'info';
            case 'medium': return 'warning';
            case 'high': return 'error';
            case 'critical': return 'error';
            default: return 'error';
        }
    }

    getToastDuration(severity) {
        switch (severity) {
            case 'low': return 3000;
            case 'medium': return 5000;
            case 'high': return 8000;
            case 'critical': return 12000;
            default: return 5000;
        }
    }

    showErrorModal(errorObj, options = {}) {
        // Create error modal
        const modal = document.createElement('div');
        modal.className = 'error-modal modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Error Occurred</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="error-message">
                        <p>${errorObj.userFriendly ? errorObj.message : this.getUserFriendlyMessage(errorObj)}</p>
                    </div>
                    ${errorObj.allowRetry ? `
                        <div class="error-actions">
                            <button class="btn btn-primary" id="retry-btn">Retry</button>
                            <button class="btn btn-secondary" id="dismiss-btn">Dismiss</button>
                        </div>
                    ` : `
                        <div class="error-actions">
                            <button class="btn btn-secondary" id="dismiss-btn">Dismiss</button>
                        </div>
                    `}
                    ${options.showDetails ? `
                        <details class="error-details">
                            <summary>Technical Details</summary>
                            <pre>${this.getFormattedErrorDetails(errorObj)}</pre>
                        </details>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Setup modal listeners
        this.setupModalListeners(modal, errorObj);
    }

    setupModalListeners(modal, errorObj) {
        const closeBtn = modal.querySelector('.modal-close');
        const dismissBtn = modal.querySelector('#dismiss-btn');
        const retryBtn = modal.querySelector('#retry-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                modal.remove();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                modal.remove();
                this.retryError(errorObj);
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Auto-close after timeout for non-critical errors
        if (errorObj.severity !== 'critical') {
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.remove();
                }
            }, 10000);
        }
    }

    retryError(errorObj) {
        if (errorObj.retryCallback) {
            try {
                errorObj.retryCallback(errorObj);
            } catch (retryError) {
                this.handle(retryError, {
                    ...errorObj,
                    context: { ...errorObj.context, retryAttempt: true }
                });
            }
        }
    }

    updateErrorMetrics(errorObj) {
        this.errorMetrics.totalErrors++;
        
        // Track by type
        const type = errorObj.type || 'unknown';
        this.errorMetrics.errorsByType[type] = (this.errorMetrics.errorsByType[type] || 0) + 1;
        
        // Track by source
        const source = errorObj.source || 'unknown';
        this.errorMetrics.errorsBySource[source] = (this.errorMetrics.errorsBySource[source] || 0) + 1;
        
        // Track by hour
        const hour = new Date(errorObj.timestamp).getHours();
        this.errorMetrics.errorsByHour[hour] = (this.errorMetrics.errorsByHour[hour] || 0) + 1;
        
        this.errorMetrics.lastError = errorObj;
        
        // Calculate error rate (errors per minute in last hour)
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentErrors = this.errorLog.filter(e => e.timestamp > oneHourAgo);
        this.errorMetrics.errorRate = recentErrors.length / 60; // errors per minute
    }

    emitErrorEvent(errorObj) {
        const event = new CustomEvent('error', {
            detail: {
                error: errorObj,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    getErrorDetails(errorObj) {
        return {
            id: errorObj.id,
            type: errorObj.type,
            source: errorObj.source,
            severity: errorObj.severity,
            message: errorObj.message,
            timestamp: errorObj.timestamp,
            context: errorObj.context,
            stack: errorObj.stack,
            userAgent: errorObj.userAgent,
            url: errorObj.url
        };
    }

    getFormattedErrorDetails(errorObj) {
        const details = this.getErrorDetails(errorObj);
        return JSON.stringify(details, null, 2);
    }

    // Convenience methods for common error types
    networkError(message, options = {}) {
        const error = new Error(message || 'Network error occurred');
        error.name = 'NetworkError';
        return this.handle(error, { ...options, type: 'network_error', severity: 'medium' });
    }

    validationError(message, options = {}) {
        const error = new Error(message || 'Validation failed');
        error.name = 'ValidationError';
        return this.handle(error, { ...options, type: 'validation_error', severity: 'low' });
    }

    authenticationError(message, options = {}) {
        const error = new Error(message || 'Authentication failed');
        error.name = 'AuthenticationError';
        return this.handle(error, { ...options, type: 'authentication_error', severity: 'high' });
    }

    authorizationError(message, options = {}) {
        const error = new Error(message || 'Access denied');
        error.name = 'AuthorizationError';
        return this.handle(error, { ...options, type: 'authorization_error', severity: 'high' });
    }

    notFoundError(message, options = {}) {
        const error = new Error(message || 'Resource not found');
        error.name = 'NotFoundError';
        return this.handle(error, { ...options, type: 'not_found_error', severity: 'medium' });
    }

    serverError(message, options = {}) {
        const error = new Error(message || 'Server error occurred');
        error.name = 'ServerError';
        return this.handle(error, { ...options, type: 'server_error', severity: 'high' });
    }

    // Async error handling
    async wrapAsync(asyncFn, options = {}) {
        try {
            return await asyncFn();
        } catch (error) {
            this.handle(error, options);
            throw error;
        }
    }

    // Promise wrapper with error handling
    wrapPromise(promise, options = {}) {
        return promise.catch(error => {
            this.handle(error, options);
            throw error;
        });
    }

    // Get error statistics
    getErrorStats() {
        return {
            ...this.errorMetrics,
            recentErrors: this.errorLog.slice(-10),
            errorRate: this.errorMetrics.errorRate,
            totalErrors: this.errorMetrics.totalErrors,
            errorsByType: this.errorMetrics.errorsByType,
            errorsBySource: this.errorMetrics.errorsBySource,
            errorsByHour: this.errorMetrics.errorsByHour
        };
    }

    // Get error log
    getErrorLog(limit = 100) {
        return this.errorLog.slice(-limit);
    }

    // Clear error log
    clearErrorLog() {
        this.errorLog = [];
        this.errorMetrics = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySource: {},
            errorsByHour: {},
            lastError: null,
            errorRate: 0
        };
    }

    // Export error data
    exportErrors() {
        const data = {
            errors: this.getErrorLog(),
            stats: this.getErrorStats(),
            exportedAt: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Generate unique error ID
    generateErrorId() {
        return 'error-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Check if error is critical
    isCritical(error) {
        return error.severity === 'critical' || 
               error.type === 'security_error' ||
               error.type === 'authentication_error';
    }

    // Check if error is recoverable
    isRecoverable(error) {
        const recoverableTypes = [
            'network_error',
            'timeout_error',
            'validation_error',
            'not_found_error'
        ];
        
        return recoverableTypes.includes(error.type) && error.allowRetry;
    }

    // Get error suggestions
    getErrorSuggestions(error) {
        const suggestions = {
            'NetworkError': [
                'Check your internet connection',
                'Try refreshing the page',
                'Contact your network administrator'
            ],
            'ValidationError': [
                'Check your input format',
                'Ensure all required fields are filled',
                'Follow the specified format'
            ],
            'AuthenticationError': [
                'Check your login credentials',
                'Try logging out and logging back in',
                'Contact support if the issue persists'
            ],
            'NotFoundError': [
                'Verify the resource exists',
                'Check the URL for typos',
                'Contact support if needed'
            ],
            'ServerError': [
                'Try again in a few minutes',
                'Contact support if the issue persists',
                'Check service status'
            ]
        };

        return suggestions[error.type] || ['Try again later', 'Contact support if needed'];
    }

    // Create user-friendly error report
    createErrorReport(error) {
        return {
            id: error.id,
            type: error.type,
            severity: error.severity,
            message: error.userFriendly ? error.message : this.getUserFriendlyMessage(error),
            suggestions: this.getErrorSuggestions(error),
            timestamp: new Date(error.timestamp).toLocaleString(),
            context: error.context,
            canRetry: this.isRecoverable(error),
            isCritical: this.isCritical(error)
        };
    }

    // Destroy error handler
    destroy() {
        // Remove global error listeners
        window.removeEventListener('unhandledrejection', this.handleRejection);
        window.removeEventListener('error', this.handleJavaScriptError);
        
        // Clear error log
        this.clearErrorLog();
    }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();
