// Enhanced Storage Management System with Compression and Quota Management
const STORAGE_CONFIG = {
    compression: {
        enabled: true,
        algorithm: 'lz-string',
        level: 6, // Compression level (1-9)
        threshold: 1024, // Only compress data larger than 1KB
        fallbackEnabled: true
    },
    quota: {
        enabled: true,
        warningThreshold: 0.8, // Warn at 80%
        criticalThreshold: 0.95, // Critical at 95%
        maxStorageSize: 5 * 1024 * 1024, // 5MB default
        checkInterval: 30 * 1000 // Check every 30 seconds
    },
    monitoring: {
        enabled: true,
        trackOperations: true,
        maxHistorySize: 1000
    }
};

// Enhanced LZ-String implementation with better compression
class EnhancedLZString {
    static compress(str) {
        if (!str || str.length < STORAGE_CONFIG.compression.threshold) {
            return str;
        }

        try {
            // Use dictionary-based compression
            const dict = {};
            let result = [];
            let dictSize = 256;
            let current = '';
            
            // Build dictionary
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const combined = current + char;
                
                if (dict[combined]) {
                    current = combined;
                } else {
                    if (current) {
                        result.push(dict[current] || current.charCodeAt(0));
                    }
                    dict[combined] = dictSize++;
                    current = char;
                }
            }
            
            if (current) {
                result.push(dict[current] || current.charCodeAt(0));
            }
            
            // Convert to compressed string using chunked approach to avoid RangeError
            let resultStr = '';
            const chunkSize = 1000; // Process in chunks to avoid call stack overflow
            
            for (let i = 0; i < result.length; i += chunkSize) {
                const chunk = result.slice(i, i + chunkSize);
                resultStr += String.fromCharCode(...chunk);
            }
            
            return resultStr;
            
        } catch (error) {
            console.warn('Enhanced compression failed:', error);
            return str; // Fallback to original
        }
    }

    static decompress(data) {
        if (!data) return '';
        
        try {
            const dict = {};
            let result = [];
            let dictSize = 256;
            let current = '';
            
            for (let i = 0; i < data.length; i++) {
                const code = data.charCodeAt(i);
                
                if (code < 256) {
                    const char = dict[code] || String.fromCharCode(code);
                    result.push(char);
                    
                    if (current) {
                        dict[dictSize++] = current + char;
                    }
                    current = char;
                } else {
                    // Handle compressed sequences
                    const entry = dict[code] || (current + current[0]);
                    result.push(entry);
                    
                    if (current) {
                        dict[dictSize++] = current + entry[0];
                    }
                    current = entry;
                }
            }
            
            return result.join('');
            
        } catch (error) {
            console.warn('Decompression failed:', error);
            return data; // Fallback to original
        }
    }

    // Alternative compression for larger data
    static compressLarge(str) {
        if (!str) return '';
        
        try {
            // Simple run-length encoding for repeated characters
            let compressed = '';
            let count = 1;
            let prevChar = str[0];
            
            for (let i = 1; i < str.length; i++) {
                const char = str[i];
                if (char === prevChar && count < 255) {
                    count++;
                } else {
                    if (count > 3) {
                        compressed += String.fromCharCode(255) + String.fromCharCode(count) + prevChar;
                    } else {
                        compressed += prevChar.repeat(count);
                    }
                    prevChar = char;
                    count = 1;
                }
            }
            
            // Add last sequence
            if (count > 3) {
                compressed += String.fromCharCode(255) + String.fromCharCode(count) + prevChar;
            } else {
                compressed += prevChar.repeat(count);
            }
            
            return compressed;
            
        } catch (error) {
            console.warn('Large compression failed:', error);
            return str;
        }
    }

    static decompressLarge(data) {
        if (!data) return '';
        
        try {
            let decompressed = '';
            let i = 0;
            
            while (i < data.length) {
                if (data.charCodeAt(i) === 255 && i + 2 < data.length) {
                    const count = data.charCodeAt(i + 1);
                    const char = data[i + 2];
                    decompressed += char.repeat(count);
                    i += 3;
                } else {
                    decompressed += data[i];
                    i++;
                }
            }
            
            return decompressed;
            
        } catch (error) {
            console.warn('Large decompression failed:', error);
            return data;
        }
    }
}

// Storage quota manager
class StorageQuotaManager {
    constructor() {
        this.quotaInfo = {
            used: 0,
            available: 0,
            percentage: 0,
            lastCheck: Date.now(),
            warnings: [],
            critical: false
        };
        
        this.operationHistory = [];
        this.maxHistorySize = STORAGE_CONFIG.monitoring.maxHistorySize;
        
        this.startQuotaMonitoring();
    }

    startQuotaMonitoring() {
        if (!STORAGE_CONFIG.quota.enabled) return;
        
        setInterval(() => {
            this.updateQuotaInfo();
            this.checkThresholds();
        }, STORAGE_CONFIG.quota.checkInterval);
        
        // Initial check
        this.updateQuotaInfo();
    }

    updateQuotaInfo() {
        try {
            const used = this.calculateStorageUsage();
            const available = STORAGE_CONFIG.quota.maxStorageSize - used;
            const percentage = used / STORAGE_CONFIG.quota.maxStorageSize;
            
            this.quotaInfo = {
                used: used,
                available: available,
                percentage: percentage,
                lastCheck: Date.now(),
                warnings: this.quotaInfo.warnings || [],
                critical: percentage >= STORAGE_CONFIG.quota.criticalThreshold
            };
            
        } catch (error) {
            console.error('Failed to update quota info:', error);
        }
    }

    calculateStorageUsage() {
        let total = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        
        return total;
    }

    checkThresholds() {
        const { percentage, critical } = this.quotaInfo;
        
        if (critical) {
            this.handleCriticalQuota();
        } else if (percentage >= STORAGE_CONFIG.quota.warningThreshold) {
            this.handleWarningQuota();
        }
    }

    handleWarningQuota() {
        const message = `Storage usage at ${(this.quotaInfo.percentage * 100).toFixed(1)}%. Consider cleaning up old data.`;
        
        if (!this.quotaInfo.warnings.includes(message)) {
            this.quotaInfo.warnings.push(message);
            this.showQuotaWarning(message, 'warning');
        }
    }

    handleCriticalQuota() {
        const message = `Storage usage critical at ${(this.quotaInfo.percentage * 100).toFixed(1)}%! Immediate cleanup required.`;
        
        this.showQuotaWarning(message, 'critical');
        
        // Emit critical event
        const event = new CustomEvent('storageQuotaCritical', {
            detail: this.quotaInfo
        });
        document.dispatchEvent(event);
    }

    showQuotaWarning(message, type = 'warning') {
        const warning = document.createElement('div');
        warning.className = `storage-warning storage-${type}`;
        warning.innerHTML = `
            <div class="warning-content">
                <h4>⚠️ Storage ${type === 'critical' ? 'Critical' : 'Warning'}</h4>
                <p>${message}</p>
                <div class="warning-actions">
                    <button onclick="this.closest('.storage-warning').remove()" class="btn btn-sm">Dismiss</button>
                    <button onclick="storageManager.cleanup()" class="btn btn-sm btn-primary">Cleanup</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    recordOperation(operation, key, size, compressedSize = null) {
        if (!STORAGE_CONFIG.monitoring.enabled) return;
        
        const record = {
            operation,
            key,
            size,
            compressedSize,
            timestamp: Date.now(),
            compressionRatio: compressedSize ? (1 - compressedSize / size) : 0
        };
        
        this.operationHistory.push(record);
        
        // Limit history size
        if (this.operationHistory.length > this.maxHistorySize) {
            this.operationHistory.shift();
        }
    }

    getQuotaInfo() {
        return { ...this.quotaInfo };
    }

    getOperationHistory(limit = 100) {
        return this.operationHistory.slice(-limit);
    }

    getCompressionStats() {
        const compressionOps = this.operationHistory.filter(op => op.compressedSize !== null);
        
        if (compressionOps.length === 0) {
            return {
                totalOperations: 0,
                totalOriginalSize: 0,
                totalCompressedSize: 0,
                averageCompressionRatio: 0,
                totalSpaceSaved: 0
            };
        }
        
        const totalOriginalSize = compressionOps.reduce((sum, op) => sum + op.size, 0);
        const totalCompressedSize = compressionOps.reduce((sum, op) => sum + op.compressedSize, 0);
        const averageCompressionRatio = compressionOps.reduce((sum, op) => sum + op.compressionRatio, 0) / compressionOps.length;
        const totalSpaceSaved = totalOriginalSize - totalCompressedSize;
        
        return {
            totalOperations: compressionOps.length,
            totalOriginalSize,
            totalCompressedSize,
            averageCompressionRatio: averageCompressionRatio * 100,
            totalSpaceSaved
        };
    }
}

// Enhanced Storage Manager with Compression and Quota Management
export class EnhancedStorageManager {
    constructor() {
        this.prefix = 'blogify_';
        this.compressionEnabled = STORAGE_CONFIG.compression.enabled;
        this.quotaManager = new StorageQuotaManager();
        
        // Compression statistics
        this.compressionStats = {
            totalCompressed: 0,
            totalUncompressed: 0,
            compressionRatio: 0,
            spaceSaved: 0,
            operations: 0,
            failures: 0
        };
        
        // Performance tracking
        this.performanceMetrics = {
            getTimes: [],
            setTimes: [],
            compressionTimes: [],
            decompressionTimes: []
        };
    }

    compress(data) {
        if (!this.compressionEnabled) {
            return { compressed: false, data };
        }

        const startTime = performance.now();
        
        try {
            const jsonString = JSON.stringify(data);
            const originalSize = jsonString.length;
            
            // Check compression threshold
            if (originalSize < STORAGE_CONFIG.compression.threshold) {
                return { compressed: false, data, originalSize };
            }
            
            let compressed;
            let algorithm = 'enhanced-lz';
            
            // Try LZ-String if available
            if (typeof LZString !== 'undefined') {
                compressed = LZString.compress(jsonString);
                algorithm = 'lz-string';
            } else {
                // Use our enhanced implementation
                compressed = EnhancedLZString.compress(jsonString);
                algorithm = 'enhanced-lz';
            }
            
            // Fallback to large compression if needed
            if (compressed.length >= originalSize * 0.9) {
                compressed = EnhancedLZString.compressLarge(jsonString);
                algorithm = 'run-length';
            }
            
            const compressionTime = performance.now() - startTime;
            this.performanceMetrics.compressionTimes.push(compressionTime);
            
            // Keep only last 100 measurements
            if (this.performanceMetrics.compressionTimes.length > 100) {
                this.performanceMetrics.compressionTimes.shift();
            }
            
            const result = {
                compressed: true,
                data: Array.from(compressed),
                originalSize: originalSize,
                compressedSize: compressed.length,
                compressionRatio: 1 - (compressed.length / originalSize),
                algorithm: algorithm,
                compressionTime: compressionTime
            };
            
            // Update statistics
            this.updateCompressionStats(result);
            
            return result;
            
        } catch (error) {
            console.error('Compression failed:', error);
            this.compressionStats.failures++;
            return { compressed: false, data };
        }
    }

    decompress(compressedData) {
        if (!compressedData.compressed) {
            return compressedData.data;
        }

        const startTime = performance.now();
        
        try {
            const uint8Array = new Uint8Array(compressedData.data);
            let decompressed;
            
            // Use appropriate decompression algorithm
            switch (compressedData.algorithm) {
                case 'lz-string':
                    if (typeof LZString !== 'undefined') {
                        decompressed = LZString.decompress(uint8Array);
                    } else {
                        decompressed = EnhancedLZString.decompress(String.fromCharCode(...uint8Array));
                    }
                    break;
                case 'enhanced-lz':
                    decompressed = EnhancedLZString.decompress(String.fromCharCode(...uint8Array));
                    break;
                case 'run-length':
                    decompressed = EnhancedLZString.decompressLarge(String.fromCharCode(...uint8Array));
                    break;
                default:
                    decompressed = EnhancedLZString.decompress(String.fromCharCode(...uint8Array));
            }
            
            const decompressionTime = performance.now() - startTime;
            this.performanceMetrics.decompressionTimes.push(decompressionTime);
            
            // Keep only last 100 measurements
            if (this.performanceMetrics.decompressionTimes.length > 100) {
                this.performanceMetrics.decompressionTimes.shift();
            }
            
            return JSON.parse(decompressed);
            
        } catch (error) {
            console.error('Decompression failed:', error);
            this.compressionStats.failures++;
            return null;
        }
    }

    setItem(key, data) {
        const startTime = performance.now();
        
        try {
            const compressed = this.compress(data);
            const storageKey = this.prefix + key;
            const serialized = JSON.stringify(compressed);
            
            // Check quota before setting
            if (this.quotaManager.quotaInfo.percentage >= STORAGE_CONFIG.quota.criticalThreshold) {
                throw new Error('Storage quota exceeded');
            }
            
            localStorage.setItem(storageKey, serialized);
            
            const setTime = performance.now() - startTime;
            this.performanceMetrics.setTimes.push(setTime);
            
            // Keep only last 100 measurements
            if (this.performanceMetrics.setTimes.length > 100) {
                this.performanceMetrics.setTimes.shift();
            }
            
            // Record operation
            this.quotaManager.recordOperation(
                'set',
                key,
                compressed.originalSize || serialized.length,
                compressed.compressedSize
            );
            
            // Update quota info
            this.quotaManager.updateQuotaInfo();
            
            return true;
            
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                this.quotaManager.handleCriticalQuota();
            }
            console.error('Storage set failed:', error);
            return false;
        }
    }

    getItem(key) {
        const startTime = performance.now();
        
        try {
            const storageKey = this.prefix + key;
            const item = localStorage.getItem(storageKey);
            
            if (!item) return null;
            
            const compressed = JSON.parse(item);
            const decompressed = this.decompress(compressed);
            
            const getTime = performance.now() - startTime;
            this.performanceMetrics.getTimes.push(getTime);
            
            // Keep only last 100 measurements
            if (this.performanceMetrics.getTimes.length > 100) {
                this.performanceMetrics.getTimes.shift();
            }
            
            // Record operation
            this.quotaManager.recordOperation(
                'get',
                key,
                compressed.originalSize || item.length,
                compressed.compressedSize
            );
            
            return decompressed;
            
        } catch (error) {
            console.error('Storage get failed:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            const storageKey = this.prefix + key;
            const existed = localStorage.getItem(storageKey) !== null;
            
            localStorage.removeItem(storageKey);
            
            if (existed) {
                this.quotaManager.recordOperation('remove', key, 0);
                this.quotaManager.updateQuotaInfo();
            }
            
            return existed;
            
        } catch (error) {
            console.error('Storage remove failed:', error);
            return false;
        }
    }

    clear() {
        try {
            const keysToRemove = [];
            
            for (let key in localStorage) {
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Reset statistics
            this.compressionStats = {
                totalCompressed: 0,
                totalUncompressed: 0,
                compressionRatio: 0,
                spaceSaved: 0,
                operations: 0,
                failures: 0
            };
            
            this.quotaManager.updateQuotaInfo();
            
            return true;
            
        } catch (error) {
            console.error('Storage clear failed:', error);
            return false;
        }
    }

    cleanup() {
        let cleanedCount = 0;
        const now = Date.now();
        
        try {
            for (let key in localStorage) {
                if (key.startsWith(this.prefix)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        
                        // Remove expired items (older than 30 days)
                        if (item.timestamp && (now - item.timestamp) > 30 * 24 * 60 * 60 * 1000) {
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    } catch (error) {
                        // Remove corrupted items
                        localStorage.removeItem(key);
                        cleanedCount++;
                    }
                }
            }
            
            this.quotaManager.updateQuotaInfo();
            
            // Show cleanup result
            const message = `Cleanup completed. Removed ${cleanedCount} items.`;
            this.quotaManager.showQuotaWarning(message, 'info');
            
            return cleanedCount;
            
        } catch (error) {
            console.error('Storage cleanup failed:', error);
            return 0;
        }
    }

    updateCompressionStats(compressionResult) {
        this.compressionStats.operations++;
        this.compressionStats.totalCompressed += compressionResult.compressedSize;
        this.compressionStats.totalUncompressed += compressionResult.originalSize;
        this.compressionStats.spaceSaved += compressionResult.originalSize - compressionResult.compressedSize;
        
        if (this.compressionStats.totalUncompressed > 0) {
            this.compressionStats.compressionRatio = 
                (this.compressionStats.spaceSaved / this.compressionStats.totalUncompressed) * 100;
        }
    }

    getStorageStats() {
        return {
            quota: this.quotaManager.getQuotaInfo(),
            compression: this.compressionStats,
            performance: this.getPerformanceStats(),
            quotaStats: this.quotaManager.getCompressionStats()
        };
    }

    getPerformanceStats() {
        const calculateAverage = (times) => {
            if (times.length === 0) return 0;
            return times.reduce((sum, time) => sum + time, 0) / times.length;
        };
        
        return {
            get: {
                count: this.performanceMetrics.getTimes.length,
                average: calculateAverage(this.performanceMetrics.getTimes),
                min: Math.min(...this.performanceMetrics.getTimes),
                max: Math.max(...this.performanceMetrics.getTimes)
            },
            set: {
                count: this.performanceMetrics.setTimes.length,
                average: calculateAverage(this.performanceMetrics.setTimes),
                min: Math.min(...this.performanceMetrics.setTimes),
                max: Math.max(...this.performanceMetrics.setTimes)
            },
            compression: {
                count: this.performanceMetrics.compressionTimes.length,
                average: calculateAverage(this.performanceMetrics.compressionTimes),
                min: Math.min(...this.performanceMetrics.compressionTimes),
                max: Math.max(...this.performanceMetrics.compressionTimes)
            },
            decompression: {
                count: this.performanceMetrics.decompressionTimes.length,
                average: calculateAverage(this.performanceMetrics.decompressionTimes),
                min: Math.min(...this.performanceMetrics.decompressionTimes),
                max: Math.max(...this.performanceMetrics.decompressionTimes)
            }
        };
    }

    exportStorage() {
        const data = {};
        
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                const originalKey = key.substring(this.prefix.length);
                const item = this.getItem(originalKey);
                if (item !== null) {
                    data[originalKey] = item;
                }
            }
        }
        
        return {
            data: data,
            stats: this.getStorageStats(),
            exportedAt: Date.now()
        };
    }

    importStorage(importedData) {
        if (!importedData || !importedData.data) return false;
        
        try {
            for (const [key, value] of Object.entries(importedData.data)) {
                this.setItem(key, value);
            }
            
            return true;
            
        } catch (error) {
            console.error('Storage import failed:', error);
            return false;
        }
    }
}

// Create singleton instance
export const storageManager = new EnhancedStorageManager();

// Global storage events
document.addEventListener('storageQuotaCritical', (e) => {
    console.warn('Storage quota critical:', e.detail);
    // Auto-cleanup can be triggered here
    storageManager.cleanup();
});
