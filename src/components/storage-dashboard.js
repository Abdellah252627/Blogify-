// Storage Monitoring Dashboard with Compression and Quota Management
import { storageManager } from '../utils/enhanced-storage.js';

export class StorageDashboard {
    constructor() {
        this.isVisible = false;
        this.updateInterval = null;
        this.container = null;
        this.init();
    }

    init() {
        this.createDashboard();
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    createDashboard() {
        // Create dashboard container
        this.container = document.createElement('div');
        this.container.id = 'storage-dashboard';
        this.container.className = 'storage-dashboard';
        this.container.innerHTML = `
            <div class="storage-dashboard-header">
                <h3>💾 Storage Performance Monitor</h3>
                <div class="dashboard-controls">
                    <button class="btn btn-sm" id="refresh-storage-stats">🔄 Refresh</button>
                    <button class="btn btn-sm" id="cleanup-storage">🧹 Cleanup</button>
                    <button class="btn btn-sm" id="export-storage">💾 Export</button>
                    <button class="btn btn-sm" id="import-storage">📁 Import</button>
                    <button class="btn btn-sm" id="toggle-storage-auto-update">⏸️ Pause</button>
                    <button class="btn btn-sm btn-secondary" id="close-storage-dashboard">✕</button>
                </div>
            </div>
            
            <div class="storage-dashboard-content">
                <div class="storage-overview">
                    <div class="overview-card">
                        <h4>Storage Quota</h4>
                        <div id="storage-quota-info"></div>
                        <div class="quota-progress-bar">
                            <div class="progress-fill" id="quota-progress"></div>
                        </div>
                    </div>
                    <div class="overview-card">
                        <h4>Compression Statistics</h4>
                        <div id="compression-stats"></div>
                    </div>
                </div>
                
                <div class="storage-details">
                    <div class="storage-section">
                        <h4>📊 Storage Performance</h4>
                        <div id="storage-performance"></div>
                    </div>
                    
                    <div class="storage-section">
                        <h4>🗜️ Compression Algorithms</h4>
                        <div id="compression-algorithms"></div>
                    </div>
                    
                    <div class="storage-section">
                        <h4>📈 Operation History</h4>
                        <div id="operation-history"></div>
                    </div>
                </div>
                
                <div class="storage-charts">
                    <div class="chart-container">
                        <h4>Storage Usage Over Time</h4>
                        <canvas id="storage-usage-chart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Compression Efficiency</h4>
                        <canvas id="compression-efficiency-chart" width="300" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Hide initially
        this.container.style.display = 'none';
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        // Toggle dashboard visibility
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+S to toggle storage dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Dashboard controls
        this.container.querySelector('#refresh-storage-stats').addEventListener('click', () => {
            this.updateDashboard();
        });

        this.container.querySelector('#cleanup-storage').addEventListener('click', () => {
            this.performCleanup();
        });

        this.container.querySelector('#export-storage').addEventListener('click', () => {
            this.exportStorage();
        });

        this.container.querySelector('#import-storage').addEventListener('click', () => {
            this.importStorage();
        });

        this.container.querySelector('#toggle-storage-auto-update').addEventListener('click', (e) => {
            this.toggleAutoUpdate(e.target);
        });

        this.container.querySelector('#close-storage-dashboard').addEventListener('click', () => {
            this.hide();
        });

        // Close on outside click
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.updateDashboard();
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateDashboard();
            }
        }, 3000); // Update every 3 seconds
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    toggleAutoUpdate(button) {
        if (this.updateInterval) {
            this.stopAutoUpdate();
            button.textContent = '▶️ Resume';
            button.classList.add('btn-warning');
        } else {
            this.startAutoUpdate();
            button.textContent = '⏸️ Pause';
            button.classList.remove('btn-warning');
        }
    }

    updateDashboard() {
        const stats = storageManager.getStorageStats();
        
        // Update storage quota
        this.updateStorageQuota(stats.quota);
        
        // Update compression statistics
        this.updateCompressionStats(stats.compression);
        
        // Update performance metrics
        this.updateStoragePerformance(stats.performance);
        
        // Update compression algorithms
        this.updateCompressionAlgorithms(stats.quotaStats);
        
        // Update operation history
        this.updateOperationHistory();
        
        // Update charts
        this.updateCharts(stats);
    }

    updateStorageQuota(quota) {
        const container = this.container.querySelector('#storage-quota-info');
        const progressBar = this.container.querySelector('#quota-progress');
        
        const percentage = quota.percentage * 100;
        const usedMB = (quota.used / 1024 / 1024).toFixed(2);
        const availableMB = (quota.available / 1024 / 1024).toFixed(2);
        
        container.innerHTML = `
            <div class="quota-item">
                <span class="quota-label">Used:</span>
                <span class="quota-value ${percentage > 80 ? 'warning' : percentage > 95 ? 'critical' : 'normal'}">${usedMB} MB</span>
            </div>
            <div class="quota-item">
                <span class="quota-label">Available:</span>
                <span class="quota-value">${availableMB} MB</span>
            </div>
            <div class="quota-item">
                <span class="quota-label">Usage:</span>
                <span class="quota-value ${percentage > 80 ? 'warning' : percentage > 95 ? 'critical' : 'normal'}">${percentage.toFixed(1)}%</span>
            </div>
            <div class="quota-item">
                <span class="quota-label">Status:</span>
                <span class="quota-value ${quota.critical ? 'critical' : percentage > 80 ? 'warning' : 'normal'}">
                    ${quota.critical ? '🚨 Critical' : percentage > 80 ? '⚠️ Warning' : '✅ Normal'}
                </span>
            </div>
        `;
        
        // Update progress bar
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        progressBar.className = `progress-fill ${percentage > 80 ? 'warning' : percentage > 95 ? 'critical' : 'normal'}`;
    }

    updateCompressionStats(stats) {
        const container = this.container.querySelector('#compression-stats');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Operations:</span>
                <span class="stat-value">${stats.operations}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Failures:</span>
                <span class="stat-value ${stats.failures > 0 ? 'warning' : 'normal'}">${stats.failures}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Compression Ratio:</span>
                <span class="stat-value ${stats.compressionRatio > 30 ? 'good' : 'normal'}">${stats.compressionRatio.toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Space Saved:</span>
                <span class="stat-value good">${this.formatBytes(stats.spaceSaved)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Compressed:</span>
                <span class="stat-value">${this.formatBytes(stats.totalCompressed)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Uncompressed:</span>
                <span class="stat-value">${this.formatBytes(stats.totalUncompressed)}</span>
            </div>
        `;
    }

    updateStoragePerformance(performance) {
        const container = this.container.querySelector('#storage-performance');
        
        container.innerHTML = `
            <div class="perf-section">
                <h5>Get Operations</h5>
                <div class="perf-item">
                    <span class="perf-label">Count:</span>
                    <span class="perf-value">${performance.get.count}</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Avg Time:</span>
                    <span class="perf-value">${performance.get.average.toFixed(2)}ms</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Min/Max:</span>
                    <span class="perf-value">${performance.get.min.toFixed(2)}ms / ${performance.get.max.toFixed(2)}ms</span>
                </div>
            </div>
            
            <div class="perf-section">
                <h5>Set Operations</h5>
                <div class="perf-item">
                    <span class="perf-label">Count:</span>
                    <span class="perf-value">${performance.set.count}</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Avg Time:</span>
                    <span class="perf-value">${performance.set.average.toFixed(2)}ms</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Min/Max:</span>
                    <span class="perf-value">${performance.set.min.toFixed(2)}ms / ${performance.set.max.toFixed(2)}ms</span>
                </div>
            </div>
            
            <div class="perf-section">
                <h5>Compression</h5>
                <div class="perf-item">
                    <span class="perf-label">Count:</span>
                    <span class="perf-value">${performance.compression.count}</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Avg Time:</span>
                    <span class="perf-value">${performance.compression.average.toFixed(2)}ms</span>
                </div>
                <div class="perf-item">
                    <span class="perf-label">Min/Max:</span>
                    <span class="perf-value">${performance.compression.min.toFixed(2)}ms / ${performance.compression.max.toFixed(2)}ms</span>
                </div>
            </div>
        `;
    }

    updateCompressionAlgorithms(quotaStats) {
        const container = this.container.querySelector('#compression-algorithms');
        
        container.innerHTML = `
            <div class="algo-item">
                <span class="algo-label">Total Operations:</span>
                <span class="algo-value">${quotaStats.totalOperations}</span>
            </div>
            <div class="algo-item">
                <span class="algo-label">Avg Compression:</span>
                <span class="algo-value ${quotaStats.averageCompressionRatio > 30 ? 'good' : 'normal'}">${quotaStats.averageCompressionRatio.toFixed(1)}%</span>
            </div>
            <div class="algo-item">
                <span class="algo-label">Space Saved:</span>
                <span class="algo-value good">${this.formatBytes(quotaStats.totalSpaceSaved)}</span>
            </div>
            <div class="algo-item">
                <span class="algo-label">Original Size:</span>
                <span class="algo-value">${this.formatBytes(quotaStats.totalOriginalSize)}</span>
            </div>
            <div class="algo-item">
                <span class="algo-label">Compressed Size:</span>
                <span class="algo-value">${this.formatBytes(quotaStats.totalCompressedSize)}</span>
            </div>
        `;
    }

    updateOperationHistory() {
        const container = this.container.querySelector('#operation-history');
        const history = storageManager.quotaManager.getOperationHistory(10);
        
        if (history.length === 0) {
            container.innerHTML = '<p class="no-data">No recent operations</p>';
            return;
        }
        
        const historyHTML = history.map(op => `
            <div class="history-item">
                <span class="history-operation ${op.operation}">${op.operation.toUpperCase()}</span>
                <span class="history-key">${op.key}</span>
                <span class="history-size">${this.formatBytes(op.size)}</span>
                ${op.compressedSize ? `
                    <span class="history-compressed">${this.formatBytes(op.compressedSize)}</span>
                    <span class="history-ratio">${(op.compressionRatio * 100).toFixed(1)}%</span>
                ` : ''}
                <span class="history-time">${this.formatTime(op.timestamp)}</span>
            </div>
        `).join('');
        
        container.innerHTML = historyHTML;
    }

    updateCharts(stats) {
        this.drawStorageUsageChart(stats.quota);
        this.drawCompressionEfficiencyChart(stats.compression);
    }

    drawStorageUsageChart(quota) {
        const canvas = this.container.querySelector('#storage-usage-chart');
        const ctx = canvas.getContext('2d');
        
        const used = quota.used;
        const available = quota.available;
        const total = used + available;
        
        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw used portion
        const usedAngle = (used / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + usedAngle);
        ctx.closePath();
        ctx.fillStyle = quota.percentage > 0.8 ? '#f59e0b' : quota.percentage > 0.95 ? '#ef4444' : '#22c55e';
        ctx.fill();
        
        // Draw available portion
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2 + usedAngle, Math.PI * 1.5);
        ctx.closePath();
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        
        // Draw labels
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Used: ${this.formatBytes(used)}`, centerX, centerY - 10);
        ctx.fillText(`Available: ${this.formatBytes(available)}`, centerX, centerY + 10);
    }

    drawCompressionEfficiencyChart(stats) {
        const canvas = this.container.querySelector('#compression-efficiency-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (stats.operations === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No compression data', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw efficiency gauge
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;
        
        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Efficiency arc
        const efficiency = stats.compressionRatio / 100;
        const efficiencyAngle = Math.PI + (efficiency * Math.PI);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, efficiencyAngle);
        ctx.strokeStyle = efficiency > 0.3 ? '#22c55e' : efficiency > 0.1 ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Center text
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${stats.compressionRatio.toFixed(1)}%`, centerX, centerY);
        
        ctx.font = '12px sans-serif';
        ctx.fillText('Compression Ratio', centerX, centerY + 20);
    }

    performCleanup() {
        const cleanedCount = storageManager.cleanup();
        
        // Show result
        const message = `Cleanup completed. Removed ${cleanedCount} expired items.`;
        this.showNotification(message, 'success');
        
        // Update dashboard
        this.updateDashboard();
    }

    exportStorage() {
        try {
            const data = storageManager.exportStorage();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `storage-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Storage exported successfully!', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export storage', 'error');
        }
    }

    importStorage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (storageManager.importStorage(data)) {
                        this.showNotification('Storage imported successfully!', 'success');
                        this.updateDashboard();
                    } else {
                        this.showNotification('Failed to import storage', 'error');
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showNotification('Invalid file format', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `storage-notification storage-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-sm">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Utility methods
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .storage-dashboard {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                max-width: 1200px;
                max-height: 90vh;
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .storage-dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                background: var(--muted);
            }
            
            .storage-dashboard-header h3 {
                margin: 0;
                color: var(--foreground);
            }
            
            .dashboard-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .storage-dashboard-content {
                padding: 1rem;
                overflow-y: auto;
                max-height: calc(90vh - 80px);
            }
            
            .storage-overview {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .overview-card {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
            }
            
            .overview-card h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
            }
            
            .quota-progress-bar {
                width: 100%;
                height: 8px;
                background: var(--border);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 1rem;
            }
            
            .progress-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .progress-fill.normal { background: var(--success); }
            .progress-fill.warning { background: var(--warning); }
            .progress-fill.critical { background: var(--destructive); }
            
            .storage-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .storage-section {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
            }
            
            .storage-section h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
            }
            
            .quota-item, .stat-item, .perf-item, .algo-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .quota-label, .stat-label, .perf-label, .algo-label {
                color: var(--muted-foreground);
                font-size: 0.875rem;
            }
            
            .quota-value, .stat-value, .perf-value, .algo-value {
                font-weight: 600;
                color: var(--foreground);
            }
            
            .quota-value.normal, .stat-value.normal, .perf-value.normal, .algo-value.normal { color: var(--foreground); }
            .quota-value.good, .stat-value.good, .perf-value.good, .algo-value.good { color: var(--success); }
            .quota-value.warning, .stat-value.warning, .perf-value.warning, .algo-value.warning { color: var(--warning); }
            .quota-value.critical, .stat-value.critical, .perf-value.critical, .algo-value.critical { color: var(--destructive); }
            
            .perf-section {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border);
            }
            
            .perf-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .perf-section h5 {
                margin: 0 0 0.5rem 0;
                color: var(--foreground);
                font-size: 0.875rem;
            }
            
            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                border-bottom: 1px solid var(--border);
                font-size: 0.75rem;
            }
            
            .history-item:last-child {
                border-bottom: none;
            }
            
            .history-operation {
                font-weight: 600;
                padding: 0.125rem 0.5rem;
                border-radius: 0.25rem;
            }
            
            .history-operation.get { background: var(--info); color: white; }
            .history-operation.set { background: var(--success); color: white; }
            .history-operation.remove { background: var(--destructive); color: white; }
            
            .history-key {
                flex: 1;
                margin: 0 0.5rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .storage-charts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1rem;
            }
            
            .chart-container {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
            }
            
            .chart-container h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
                text-align: center;
            }
            
            .storage-notification {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                z-index: 10001;
                animation: slideIn 0.3s ease;
            }
            
            .storage-notification.success { border-left: 4px solid var(--success); }
            .storage-notification.error { border-left: 4px solid var(--destructive); }
            .storage-notification.warning { border-left: 4px solid var(--warning); }
            .storage-notification.info { border-left: 4px solid var(--info); }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            
            .no-data {
                text-align: center;
                color: var(--muted-foreground);
                font-style: italic;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .storage-dashboard {
                    width: 95vw;
                    height: 95vh;
                }
                
                .storage-overview {
                    grid-template-columns: 1fr;
                }
                
                .dashboard-controls {
                    flex-wrap: wrap;
                }
                
                .history-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.25rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        this.stopAutoUpdate();
        if (this.container && this.container.parentElement) {
            this.container.remove();
        }
    }
}

// Create singleton instance
export const storageDashboard = new StorageDashboard();
