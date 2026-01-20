// Advanced Cache Management System with TTL, LRU, and Statistics
const CACHE_CONFIG = {
    ttl: 5 * 60 * 1000, // 5 minutes TTL
    maxSize: 50, // Max items per cache type
    cleanupInterval: 60 * 1000, // Cleanup every minute
    enableStats: true,
    enableLRU: true,
    compressionThreshold: 1024 // Compress items larger than 1KB
};

export const cache = {
    articles: new Map(), // Cache for loaded article content
    images: new Map(), // Cache for loaded images
    templates: new Map(), // Cache for HTML templates
    data: new Map(), // Cache for filtered data
    stats: {
        hits: 0,
        misses: 0,
        size: 0,
        maxSize: 100, // Max cache items
        evictions: 0,
        cleanups: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        lastCleanup: Date.now(),
        hitRate: 0,
        missRate: 0
    }
};

export class AdvancedCacheManager {
    constructor(name, options = {}) {
        this.name = name;
        this.cache = new Map();
        this.accessOrder = new Map(); // For LRU tracking
        this.ttl = options.ttl || CACHE_CONFIG.ttl;
        this.maxSize = options.maxSize || CACHE_CONFIG.maxSize;
        this.enableStats = options.enableStats !== false;
        this.enableLRU = options.enableLRU !== false;
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            cleanups: 0,
            totalRequests: 0,
            totalResponseTime: 0,
            averageResponseTime: 0,
            memoryUsage: 0,
            lastAccess: Date.now(),
            createdAt: Date.now(),
            hitRate: 0,
            missRate: 0,
            evictionRate: 0
        };
        
        // Performance tracking
        this.performanceMetrics = {
            getTimes: [],
            setTimes: [],
            cleanupTimes: []
        };
        
        // Start automatic cleanup
        this.startCleanupTimer();
    }

    get(key) {
        const startTime = performance.now();
        this.stats.totalRequests++;
        
        try {
            const item = this.cache.get(key);
            
            if (!item) {
                this.stats.misses++;
                this.updateStats();
                this.recordPerformance('get', performance.now() - startTime);
                return null;
            }

            // Check TTL expiration
            if (Date.now() > item.expiry) {
                this.cache.delete(key);
                this.accessOrder.delete(key);
                this.stats.misses++;
                this.stats.cleanups++;
                this.updateStats();
                this.recordPerformance('get', performance.now() - startTime);
                return null;
            }

            // Update access order for LRU
            if (this.enableLRU) {
                this.accessOrder.set(key, Date.now());
            }

            this.stats.hits++;
            item.lastAccessed = Date.now();
            item.accessCount++;
            
            this.updateStats();
            this.recordPerformance('get', performance.now() - startTime);
            
            return item.data;
            
        } catch (error) {
            console.error(`Cache get error for ${this.name}:`, error);
            this.stats.misses++;
            this.updateStats();
            return null;
        }
    }

    set(key, data, customTtl = null) {
        const startTime = performance.now();
        
        try {
            const ttl = customTtl || this.ttl;
            const expiry = Date.now() + ttl;
            
            // Check if we need to evict items
            if (this.cache.size >= this.maxSize) {
                this.evictLRU();
            }

            const item = {
                data: data,
                expiry: expiry,
                createdAt: Date.now(),
                lastAccessed: Date.now(),
                accessCount: 0,
                size: this.calculateSize(data)
            };

            this.cache.set(key, item);
            
            if (this.enableLRU) {
                this.accessOrder.set(key, Date.now());
            }

            this.stats.sets++;
            this.updateStats();
            this.recordPerformance('set', performance.now() - startTime);
            
            return true;
            
        } catch (error) {
            console.error(`Cache set error for ${this.name}:`, error);
            return false;
        }
    }

    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;
        
        // Check TTL
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            return false;
        }
        
        return true;
    }

    delete(key) {
        const deleted = this.cache.delete(key);
        this.accessOrder.delete(key);
        
        if (deleted) {
            this.stats.deletes++;
            this.updateStats();
        }
        
        return deleted;
    }

    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessOrder.clear();
        
        this.stats.deletes += size;
        this.updateStats();
    }

    // LRU Eviction
    evictLRU() {
        if (!this.enableLRU || this.accessOrder.size === 0) return;
        
        // Find least recently used item
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, time] of this.accessOrder.entries()) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessOrder.delete(oldestKey);
            this.stats.evictions++;
            this.updateStats();
        }
    }

    // Automatic cleanup of expired items
    cleanup() {
        const startTime = performance.now();
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                this.accessOrder.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            this.stats.cleanups++;
            this.updateStats();
        }
        
        this.recordPerformance('cleanup', performance.now() - startTime);
        return cleanedCount;
    }

    // Get cache statistics
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        
        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: this.calculateMemoryUsage(),
            hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
            missRate: total > 0 ? (this.stats.misses / total * 100).toFixed(2) + '%' : '0%',
            evictionRate: this.stats.sets > 0 ? (this.stats.evictions / this.stats.sets * 100).toFixed(2) + '%' : '0%',
            averageResponseTime: this.stats.totalRequests > 0 ? 
                Math.round(this.stats.totalResponseTime / this.stats.totalRequests) : 0,
            uptime: Date.now() - this.stats.createdAt,
            efficiency: this.calculateEfficiency()
        };
    }

    // Get detailed performance metrics
    getPerformanceMetrics() {
        return {
            get: {
                count: this.performanceMetrics.getTimes.length,
                average: this.calculateAverage(this.performanceMetrics.getTimes),
                min: Math.min(...this.performanceMetrics.getTimes),
                max: Math.max(...this.performanceMetrics.getTimes)
            },
            set: {
                count: this.performanceMetrics.setTimes.length,
                average: this.calculateAverage(this.performanceMetrics.setTimes),
                min: Math.min(...this.performanceMetrics.setTimes),
                max: Math.max(...this.performanceMetrics.setTimes)
            },
            cleanup: {
                count: this.performanceMetrics.cleanupTimes.length,
                average: this.calculateAverage(this.performanceMetrics.cleanupTimes),
                min: Math.min(...this.performanceMetrics.cleanupTimes),
                max: Math.max(...this.performanceMetrics.cleanupTimes)
            }
        };
    }

    // Export cache data for backup
    export() {
        const data = {};
        const now = Date.now();
        
        for (const [key, item] of this.cache.entries()) {
            if (now <= item.expiry) {
                data[key] = {
                    data: item.data,
                    expiry: item.expiry,
                    createdAt: item.createdAt,
                    accessCount: item.accessCount
                };
            }
        }
        
        return {
            name: this.name,
            data: data,
            stats: this.getStats(),
            exportedAt: Date.now()
        };
    }

    // Import cache data
    import(importedData) {
        if (!importedData || !importedData.data) return false;
        
        try {
            this.clear();
            
            const now = Date.now();
            for (const [key, item] of Object.entries(importedData.data)) {
                if (now <= item.expiry) {
                    this.cache.set(key, {
                        data: item.data,
                        expiry: item.expiry,
                        createdAt: item.createdAt,
                        lastAccessed: now,
                        accessCount: item.accessCount || 0,
                        size: this.calculateSize(item.data)
                    });
                    
                    if (this.enableLRU) {
                        this.accessOrder.set(key, now);
                    }
                }
            }
            
            this.updateStats();
            return true;
            
        } catch (error) {
            console.error(`Cache import error for ${this.name}:`, error);
            return false;
        }
    }

    // Private methods
    updateStats() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? (this.stats.hits / total) : 0;
        this.stats.missRate = total > 0 ? (this.stats.misses / total) : 0;
        this.stats.memoryUsage = this.calculateMemoryUsage();
        this.stats.lastAccess = Date.now();
        
        // Update global cache stats
        cache.stats.hits = this.stats.hits;
        cache.stats.misses = this.stats.misses;
        cache.stats.size = this.cache.size;
        cache.stats.evictions = this.stats.evictions;
        cache.stats.cleanups = this.stats.cleanups;
        cache.stats.hitRate = this.stats.hitRate;
        cache.stats.missRate = this.stats.missRate;
    }

    calculateSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch (error) {
            return 0;
        }
    }

    calculateMemoryUsage() {
        let totalSize = 0;
        for (const item of this.cache.values()) {
            totalSize += item.size || 0;
        }
        return totalSize;
    }

    calculateEfficiency() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return 0;
        
        const hitRate = this.stats.hits / total;
        const evictionRate = this.stats.sets > 0 ? this.stats.evictions / this.stats.sets : 0;
        
        // Efficiency = hit rate - eviction penalty
        return Math.max(0, (hitRate - evictionRate * 0.5) * 100).toFixed(2) + '%';
    }

    calculateAverage(times) {
        if (times.length === 0) return 0;
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    recordPerformance(operation, time) {
        this.stats.totalResponseTime += time;
        
        // Keep only last 100 measurements for each operation
        const measurements = this.performanceMetrics[operation + 'Times'];
        measurements.push(time);
        
        if (measurements.length > 100) {
            measurements.shift();
        }
    }

    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, CACHE_CONFIG.cleanupInterval);
    }
}

// Create enhanced cache instances
export const articleCache = new AdvancedCacheManager('articles', { maxSize: 100 });
export const imageCache = new AdvancedCacheManager('images', { maxSize: 200, ttl: 10 * 60 * 1000 }); // 10 minutes
export const templateCache = new AdvancedCacheManager('templates', { maxSize: 50, ttl: 30 * 60 * 1000 }); // 30 minutes
export const dataCache = new AdvancedCacheManager('data', { maxSize: 150 });

// Global cache management
export class CacheManager {
    static getAllStats() {
        return {
            articles: articleCache.getStats(),
            images: imageCache.getStats(),
            templates: templateCache.getStats(),
            data: dataCache.getStats(),
            global: cache.stats
        };
    }
    
    static getAllPerformanceMetrics() {
        return {
            articles: articleCache.getPerformanceMetrics(),
            images: imageCache.getPerformanceMetrics(),
            templates: templateCache.getPerformanceMetrics(),
            data: dataCache.getPerformanceMetrics()
        };
    }
    
    static cleanupAll() {
        return {
            articles: articleCache.cleanup(),
            images: imageCache.cleanup(),
            templates: templateCache.cleanup(),
            data: dataCache.cleanup()
        };
    }
    
    static clearAll() {
        articleCache.clear();
        imageCache.clear();
        templateCache.clear();
        dataCache.clear();
    }
    
    static exportAll() {
        return {
            articles: articleCache.export(),
            images: imageCache.export(),
            templates: templateCache.export(),
            data: dataCache.export(),
            exportedAt: Date.now()
        };
    }
    
    static importAll(data) {
        const results = {
            articles: false,
            images: false,
            templates: false,
            data: false
        };
        
        if (data.articles) results.articles = articleCache.import(data.articles);
        if (data.images) results.images = imageCache.import(data.images);
        if (data.templates) results.templates = templateCache.import(data.templates);
        if (data.data) results.data = dataCache.import(data.data);
        
        return results;
    }
}
