// Storage Management Module with Compression
const storage = {
    compression: {
        enabled: true,
        threshold: 1024 // Only compress data larger than 1KB
    },
    quota: {
        used: 0,
        available: 0,
        warningThreshold: 0.9 // Warn at 90% capacity
    }
};

// Simple LZ-String implementation (fallback)
class SimpleLZString {
    static compress(str) {
        const dict = {};
        let result = [];
        let dictSize = 256;
        let current = '';
        
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
        
        return String.fromCharCode(...result);
    }

    static decompress(data) {
        const dict = {};
        let dictSize = 256;
        let result = [];
        let current = '';
        
        for (let i = 0; i < data.length; i++) {
            const code = data[i];
            
            if (code < 256) {
                const char = dict[code] || String.fromCharCode(code);
                result.push(char);
                
                if (current) {
                    dict[dictSize++] = current + char;
                }
                current = char;
            } else {
                const entry = dict[code] || (current + current[0]);
                result.push(entry);
                
                if (current) {
                    dict[dictSize++] = current + entry[0];
                }
                current = entry;
            }
        }
        
        return result.join('');
    }
}

// Enhanced Storage Manager with Compression
export class CompressedStorage {
    constructor() {
        this.prefix = 'blogify_';
        this.compressionEnabled = storage.compression.enabled;
    }

    compress(data) {
        if (!this.compressionEnabled) {
            return { compressed: false, data };
        }

        try {
            const jsonString = JSON.stringify(data);
            
            // Use LZ-String if available, otherwise fallback
            if (typeof LZString !== 'undefined') {
                const compressed = LZString.compress(jsonString);
                return {
                    compressed: true,
                    data: Array.from(compressed),
                    originalSize: jsonString.length,
                    compressedSize: compressed.length
                };
            } else {
                const compressed = SimpleLZString.compress(jsonString);
                return {
                    compressed: true,
                    data: Array.from(compressed),
                    originalSize: jsonString.length,
                    compressedSize: compressed.length
                };
            }
        } catch (error) {
            console.warn('Compression failed:', error);
            return { compressed: false, data };
        }
    }

    decompress(compressedData) {
        if (!compressedData.compressed) {
            return compressedData.data;
        }

        try {
            const uint8Array = new Uint8Array(compressedData.data);
            
            if (typeof LZString !== 'undefined') {
                const decompressed = LZString.decompress(uint8Array);
                return JSON.parse(decompressed);
            } else {
                const decompressed = SimpleLZString.decompress(uint8Array);
                return JSON.parse(decompressed);
            }
        } catch (error) {
            console.error('Decompression failed:', error);
            return null;
        }
    }

    checkQuota() {
        try {
            const used = JSON.stringify(localStorage).length;
            const available = 5 * 1024 * 1024; // 5MB estimate
            storage.quota.used = used;
            storage.quota.available = Math.max(0, available - used);
            
            return {
                used,
                available,
                percentage: used / available
            };
        } catch (error) {
            console.error('Quota check failed:', error);
            return null;
        }
    }

    // Store data with compression
    setItem(key, data) {
        const compressed = this.compress(data);
        const storageKey = this.prefix + key;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(compressed));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.showStorageWarning('Storage quota exceeded. Please delete some articles or clear cache.');
            }
            return false;
        }
    }

    // Retrieve and decompress data
    getItem(key) {
        const storageKey = this.prefix + key;
        
        try {
            const item = localStorage.getItem(storageKey);
            if (!item) return null;
            
            const compressed = JSON.parse(item);
            return this.decompress(compressed);
        } catch (error) {
            console.error('Retrieval failed:', error);
            return null;
        }
    }

    removeItem(key) {
        const storageKey = this.prefix + key;
        localStorage.removeItem(storageKey);
    }

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Show storage warning to user
    showStorageWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'storage-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h4>⚠️ Storage Warning</h4>
                <p>${message}</p>
                <button onclick="this.parentElement.remove()">Dismiss</button>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }
}

export const storageManager = new CompressedStorage();
