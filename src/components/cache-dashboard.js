// Cache Performance Monitoring Dashboard
import { CacheManager, articleCache, imageCache, templateCache, dataCache } from '../utils/cache.js';

export class CacheDashboard {
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
        this.container.id = 'cache-dashboard';
        this.container.className = 'cache-dashboard';
        this.container.innerHTML = `
            <div class="cache-dashboard-header">
                <h3>📊 Cache Performance Monitor</h3>
                <div class="dashboard-controls">
                    <button class="btn btn-sm" id="refresh-cache-stats">🔄 Refresh</button>
                    <button class="btn btn-sm" id="clear-all-cache">🗑️ Clear All</button>
                    <button class="btn btn-sm" id="export-cache">💾 Export</button>
                    <button class="btn btn-sm" id="toggle-auto-update">⏸️ Pause</button>
                    <button class="btn btn-sm btn-secondary" id="close-dashboard">✕</button>
                </div>
            </div>
            
            <div class="cache-dashboard-content">
                <div class="cache-overview">
                    <div class="overview-card">
                        <h4>Global Statistics</h4>
                        <div id="global-stats"></div>
                    </div>
                    <div class="overview-card">
                        <h4>Performance Metrics</h4>
                        <div id="performance-metrics"></div>
                    </div>
                </div>
                
                <div class="cache-details">
                    <div class="cache-section" id="articles-cache">
                        <h4>📝 Articles Cache</h4>
                        <div class="cache-stats"></div>
                        <div class="cache-actions">
                            <button class="btn btn-sm" data-cache="articles" data-action="clear">Clear</button>
                            <button class="btn btn-sm" data-cache="articles" data-action="cleanup">Cleanup</button>
                        </div>
                    </div>
                    
                    <div class="cache-section" id="images-cache">
                        <h4>🖼️ Images Cache</h4>
                        <div class="cache-stats"></div>
                        <div class="cache-actions">
                            <button class="btn btn-sm" data-cache="images" data-action="clear">Clear</button>
                            <button class="btn btn-sm" data-cache="images" data-action="cleanup">Cleanup</button>
                        </div>
                    </div>
                    
                    <div class="cache-section" id="templates-cache">
                        <h4>🎨 Templates Cache</h4>
                        <div class="cache-stats"></div>
                        <div class="cache-actions">
                            <button class="btn btn-sm" data-cache="templates" data-action="clear">Clear</button>
                            <button class="btn btn-sm" data-cache="templates" data-action="cleanup">Cleanup</button>
                        </div>
                    </div>
                    
                    <div class="cache-section" id="data-cache">
                        <h4>📊 Data Cache</h4>
                        <div class="cache-stats"></div>
                        <div class="cache-actions">
                            <button class="btn btn-sm" data-cache="data" data-action="clear">Clear</button>
                            <button class="btn btn-sm" data-cache="data" data-action="cleanup">Cleanup</button>
                        </div>
                    </div>
                </div>
                
                <div class="cache-charts">
                    <div class="chart-container">
                        <h4>Hit Rate Chart</h4>
                        <canvas id="hit-rate-chart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Memory Usage Chart</h4>
                        <canvas id="memory-chart" width="300" height="200"></canvas>
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
            // Ctrl+Shift+C to toggle cache dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Dashboard controls
        this.container.querySelector('#refresh-cache-stats').addEventListener('click', () => {
            this.updateDashboard();
        });

        this.container.querySelector('#clear-all-cache').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all caches?')) {
                CacheManager.clearAll();
                this.updateDashboard();
            }
        });

        this.container.querySelector('#export-cache').addEventListener('click', () => {
            this.exportCacheData();
        });

        this.container.querySelector('#toggle-auto-update').addEventListener('click', (e) => {
            this.toggleAutoUpdate(e.target);
        });

        this.container.querySelector('#close-dashboard').addEventListener('click', () => {
            this.hide();
        });

        // Individual cache actions
        this.container.querySelectorAll('[data-cache][data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cache = e.target.dataset.cache;
                const action = e.target.dataset.action;
                this.handleCacheAction(cache, action);
            });
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
        }, 2000); // Update every 2 seconds
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
        const allStats = CacheManager.getAllStats();
        const allMetrics = CacheManager.getAllPerformanceMetrics();

        // Update global statistics
        this.updateGlobalStats(allStats);
        
        // Update performance metrics
        this.updatePerformanceMetrics(allMetrics);
        
        // Update individual cache sections
        this.updateCacheSection('articles', allStats.articles);
        this.updateCacheSection('images', allStats.images);
        this.updateCacheSection('templates', allStats.templates);
        this.updateCacheSection('data', allStats.data);
        
        // Update charts
        this.updateCharts(allStats);
    }

    updateGlobalStats(stats) {
        const container = this.container.querySelector('#global-stats');
        const global = stats.global;
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Hits:</span>
                <span class="stat-value">${global.hits}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Misses:</span>
                <span class="stat-value">${global.misses}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Hit Rate:</span>
                <span class="stat-value ${parseFloat(global.hitRate) > 70 ? 'good' : parseFloat(global.hitRate) > 40 ? 'warning' : 'poor'}">${global.hitRate}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Evictions:</span>
                <span class="stat-value">${global.evictions}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Cleanups:</span>
                <span class="stat-value">${global.cleanups}</span>
            </div>
        `;
    }

    updatePerformanceMetrics(metrics) {
        const container = this.container.querySelector('#performance-metrics');
        
        // Calculate averages
        const avgGetTime = this.calculateAverageResponseTime(metrics, 'get');
        const avgSetTime = this.calculateAverageResponseTime(metrics, 'set');
        const avgCleanupTime = this.calculateAverageResponseTime(metrics, 'cleanup');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Avg Get Time:</span>
                <span class="stat-value">${avgGetTime.toFixed(2)}ms</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Set Time:</span>
                <span class="stat-value">${avgSetTime.toFixed(2)}ms</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Cleanup Time:</span>
                <span class="stat-value">${avgCleanupTime.toFixed(2)}ms</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Memory:</span>
                <span class="stat-value">${this.formatBytes(this.calculateTotalMemory(metrics))}</span>
            </div>
        `;
    }

    updateCacheSection(cacheName, stats) {
        const section = this.container.querySelector(`#${cacheName}-cache`);
        const statsContainer = section.querySelector('.cache-stats');
        
        statsContainer.innerHTML = `
            <div class="cache-stat-row">
                <div class="stat-item">
                    <span class="stat-label">Size:</span>
                    <span class="stat-value">${stats.size}/${stats.maxSize}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Hit Rate:</span>
                    <span class="stat-value ${parseFloat(stats.hitRate) > 70 ? 'good' : parseFloat(stats.hitRate) > 40 ? 'warning' : 'poor'}">${stats.hitRate}</span>
                </div>
            </div>
            <div class="cache-stat-row">
                <div class="stat-item">
                    <span class="stat-label">Memory:</span>
                    <span class="stat-value">${this.formatBytes(stats.memoryUsage)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Efficiency:</span>
                    <span class="stat-value ${parseFloat(stats.efficiency) > 70 ? 'good' : parseFloat(stats.efficiency) > 40 ? 'warning' : 'poor'}">${stats.efficiency}</span>
                </div>
            </div>
            <div class="cache-stat-row">
                <div class="stat-item">
                    <span class="stat-label">Evictions:</span>
                    <span class="stat-value">${stats.evictions}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Uptime:</span>
                    <span class="stat-value">${this.formatDuration(stats.uptime)}</span>
                </div>
            </div>
        `;
    }

    updateCharts(stats) {
        this.drawHitRateChart(stats);
        this.drawMemoryChart(stats);
    }

    drawHitRateChart(stats) {
        const canvas = this.container.querySelector('#hit-rate-chart');
        const ctx = canvas.getContext('2d');
        
        const data = [
            { label: 'Articles', value: parseFloat(stats.articles.hitRate) },
            { label: 'Images', value: parseFloat(stats.images.hitRate) },
            { label: 'Templates', value: parseFloat(stats.templates.hitRate) },
            { label: 'Data', value: parseFloat(stats.data.hitRate) }
        ];
        
        this.drawBarChart(ctx, data, canvas.width, canvas.height);
    }

    drawMemoryChart(stats) {
        const canvas = this.container.querySelector('#memory-chart');
        const ctx = canvas.getContext('2d');
        
        const data = [
            { label: 'Articles', value: stats.articles.memoryUsage },
            { label: 'Images', value: stats.images.memoryUsage },
            { label: 'Templates', value: stats.templates.memoryUsage },
            { label: 'Data', value: stats.data.memoryUsage }
        ];
        
        this.drawBarChart(ctx, data, canvas.width, canvas.height, true);
    }

    drawBarChart(ctx, data, width, height, isMemory = false) {
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.length * 0.6;
        const barSpacing = chartWidth / data.length * 0.4;
        
        // Find max value
        const maxValue = Math.max(...data.map(d => d.value));
        
        // Draw bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - padding - barHeight;
            
            // Draw bar
            ctx.fillStyle = this.getBarColor(item.value, isMemory);
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - 20);
            
            // Draw value
            const value = isMemory ? this.formatBytes(item.value) : item.value.toFixed(1) + '%';
            ctx.fillText(value, x + barWidth / 2, y - 5);
        });
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    }

    getBarColor(value, isMemory) {
        if (isMemory) {
            if (value > 1024 * 1024) return '#ef4444'; // Red for > 1MB
            if (value > 512 * 1024) return '#f59e0b'; // Orange for > 512KB
            return '#22c55e'; // Green for less
        } else {
            if (value > 70) return '#22c55e'; // Green for > 70%
            if (value > 40) return '#f59e0b'; // Orange for > 40%
            return '#ef4444'; // Red for less
        }
    }

    handleCacheAction(cacheName, action) {
        const cacheMap = {
            articles: articleCache,
            images: imageCache,
            templates: templateCache,
            data: dataCache
        };
        
        const cache = cacheMap[cacheName];
        if (!cache) return;
        
        switch (action) {
            case 'clear':
                cache.clear();
                break;
            case 'cleanup':
                cache.cleanup();
                break;
        }
        
        this.updateDashboard();
    }

    exportCacheData() {
        const data = CacheManager.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cache-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Utility methods
    calculateAverageResponseTime(metrics, operation) {
        const values = Object.values(metrics)
            .map(m => m[operation]?.average || 0)
            .filter(v => v > 0);
        
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    calculateTotalMemory(metrics) {
        return Object.values(metrics).reduce((total, m) => {
            const cache = Object.values(CacheManager.getAllStats()).find((stat, index) => 
                Object.keys(metrics)[index] === Object.keys(stat)[0]
            );
            return total + (cache?.memoryUsage || 0);
        }, 0);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cache-dashboard {
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
            
            .cache-dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                background: var(--muted);
            }
            
            .cache-dashboard-header h3 {
                margin: 0;
                color: var(--foreground);
            }
            
            .dashboard-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .cache-dashboard-content {
                padding: 1rem;
                overflow-y: auto;
                max-height: calc(90vh - 80px);
            }
            
            .cache-overview {
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
            
            .cache-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .cache-section {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
            }
            
            .cache-section h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
            }
            
            .cache-stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.25rem;
            }
            
            .stat-label {
                color: var(--muted-foreground);
                font-size: 0.875rem;
            }
            
            .stat-value {
                font-weight: 600;
                color: var(--foreground);
            }
            
            .stat-value.good { color: var(--success); }
            .stat-value.warning { color: var(--warning); }
            .stat-value.poor { color: var(--destructive); }
            
            .cache-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border);
            }
            
            .cache-charts {
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
            
            @media (max-width: 768px) {
                .cache-dashboard {
                    width: 95vw;
                    height: 95vh;
                }
                
                .cache-overview {
                    grid-template-columns: 1fr;
                }
                
                .dashboard-controls {
                    flex-wrap: wrap;
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
export const cacheDashboard = new CacheDashboard();
