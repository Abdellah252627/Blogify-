// Analytics Dashboard with Real-time Charts and Statistics
import { analyticsManager } from '../utils/analytics.js';

export class AnalyticsDashboard {
    constructor() {
        this.isVisible = false;
        this.updateInterval = null;
        this.container = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.createDashboard();
        this.setupEventListeners();
        this.startAutoUpdate();
        this.initializeCharts();
    }

    createDashboard() {
        // Create dashboard container
        this.container = document.createElement('div');
        this.container.id = 'analytics-dashboard';
        this.container.className = 'analytics-dashboard';
        this.container.innerHTML = `
            <div class="analytics-dashboard-header">
                <h3>📊 Analytics Dashboard</h3>
                <div class="dashboard-controls">
                    <button class="btn btn-sm" id="refresh-analytics">🔄 Refresh</button>
                    <button class="btn btn-sm" id="export-analytics">📊 Export</button>
                    <button class="btn btn-sm" id="reset-analytics">🔄 Reset</button>
                    <button class="btn btn-sm" id="toggle-analytics-auto-update">⏸️ Pause</button>
                    <button class="btn btn-sm btn-secondary" id="close-analytics-dashboard">✕</button>
                </div>
            </div>
            
            <div class="analytics-dashboard-content">
                <div class="analytics-overview">
                    <div class="overview-card">
                        <h4>📈 Article Statistics</h4>
                        <div id="article-overview-stats"></div>
                    </div>
                    <div class="overview-card">
                        <h4>👥 User Statistics</h4>
                        <div id="user-overview-stats"></div>
                    </div>
                    <div class="overview-card">
                        <h4>⚡ Performance</h4>
                        <div id="performance-overview-stats"></div>
                    </div>
                    <div class="overview-card">
                        <h4>📈 Engagement</h4>
                        <div id="engagement-overview-stats"></div>
                    </div>
                </div>
                
                <div class="analytics-details">
                    <div class="analytics-section">
                        <h4>📊 Category Distribution</h4>
                        <div class="category-chart-container">
                            <canvas id="category-chart" width="400" height="300"></canvas>
                        </div>
                        <div class="category-stats-list"></div>
                    </div>
                    
                    <div class="analytics-section">
                        <h4>🏷️ Popular Articles</h4>
                        <div class="popular-articles-list"></div>
                    </div>
                    
                    <div class="analytics-section">
                        <h4>📈 Time-based Analytics</h4>
                        <div class="time-tabs">
                            <button class="tab-btn active" data-period="daily">Daily</button>
                            <button class="tab-btn" data-period="weekly">Weekly</button>
                            <button class="tab-btn" data-period="monthly">Monthly</button>
                        </div>
                        <div class="time-content">
                            <div class="time-chart-container">
                                <canvas id="time-chart" width="400" height="200"></canvas>
                            </div>
                            <div class="time-stats-list"></div>
                        </div>
                    </div>
                    
                    <div class="analytics-section">
                        <h4>🏷️ Tag Performance</h4>
                        <div class="tag-chart-container">
                            <canvas id="tag-chart" width="400" height="300"></canvas>
                        </div>
                        <div class="tag-stats-list"></div>
                    </div>
                </div>
                
                <div class="analytics-charts">
                    <div class="chart-container large">
                        <h4>📈 Views Over Time</h4>
                        <canvas id="views-timeline-chart" width="800" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>📊 Read Time Distribution</h4>
                        <canvas id="readtime-chart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>👥 User Activity</h4>
                        <canvas id="user-activity-chart" width="400" height="300"></canvas>
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
            // Ctrl+Shift+A to toggle analytics dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Dashboard controls
        this.container.querySelector('#refresh-analytics').addEventListener('click', () => {
            this.updateDashboard();
        });

        this.container.querySelector('#export-analytics').addEventListener('click', () => {
            this.exportAnalytics();
        });

        this.container.querySelector('#reset-analytics').addEventListener('click', () => {
            if (confirm('Are you you sure you want to reset all analytics data? This action cannot be undone.')) {
                analyticsManager.resetStats();
                this.updateDashboard();
            }
        });

        this.container.querySelector('#toggle-analytics-auto-update').addEventListener('click', (e) => {
            this.toggleAutoUpdate(e.target);
        });

        this.container.querySelector('#close-analytics-dashboard').addEventListener('click', () => {
            this.hide();
        });

        // Time period tabs
        this.container.querySelectorAll('.tab-btn[data-period]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTimePeriod(btn.dataset.period);
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
        }, 5000); // Update every 5 seconds
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

    switchTimePeriod(period) {
        // Update active tab
        this.container.querySelectorAll('.tab-btn[data-period]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        // Update time content
        this.updateTimeBasedStats(period);
    }

    updateDashboard() {
        const stats = analyticsManager.getStats();
        
        // Update overview statistics
        this.updateOverviewStats(stats);
        
        // Update category charts
        this.updateCategoryChart(stats);
        
        // Update popular articles
        this.updatePopularArticles(stats);
        
        // Update time-based stats
        this.updateTimeBasedStats('daily');
        
        // Update tag charts
        this.updateTagChart(stats);
        
        // Update engagement stats
        this.updateEngagementStats(stats);
        
        // Update performance stats
        this.updatePerformanceStats(stats);
        
        // Update timeline charts
        this.updateTimelineCharts(stats);
    }

    updateOverviewStats(stats) {
        const container = this.container.querySelector('#article-overview-stats');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Articles:</span>
                <span class="stat-value">${stats.articles.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Published:</span>
                <span class="stat-value">${stats.articles.published}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Drafts:</span>
                <span class="stat-value">${stats.articles.drafts}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Views:</span>
                <span class="stat-value">${stats.articles.totalViews.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Read Time:</span>
                <span class="stat-value">${stats.articles.avgReadTime.toFixed(1)} min</span>
            </div>
        `;
    }

    updateUserStats(stats) {
        const container = this.container.querySelector('#user-overview-stats');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Users:</span>
                <span class="stat-value">${stats.users.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Active Users:</span>
                <span class="stat-value">${stats.users.active}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">New Users:</span>
                <span class="stat-value">${stats.users.new}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Returning:</span>
                <span class="stat-value">${stats.users.returning}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sessions:</span>
                <span class="stat-value">${stats.users.sessions.length}</span>
            </div>
        `;
    }

    updatePerformanceStats(stats) {
        const container = this.container.querySelector('#performance-overview-stats');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Uptime:</span>
                <span class="stat-value">${this.formatDuration(stats.performance.uptime)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Cache Hit Rate:</span>
                <span class="stat-value">${(stats.performance.cacheHitRate * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Error Rate:</span>
                <span class="stat-value">${(stats.performance.errorRate * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Page Load Time:</span>
                <span class="stat-value">${stats.performance.pageLoadTime.toFixed(0)}ms</span>
            </div>
        `;
    }

    updateEngagementStats(stats) {
        const container = this.container.querySelector('#engagement-overview-stats');
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Avg Session:</span>
                <span class="stat-value">${this.formatDuration(stats.engagement.avgSessionDuration)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pages/Session:</span>
                <span class="stat-value">${stats.engagement.pagesPerSession.toFixed(1)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Articles/Session:</span>
                <span class="stat-value">${stats.engagement.articlesPerSession.toFixed(1)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Scroll Depth:</span>
                <span class="stat-value">${stats.engagement.scrollDepth.toFixed(1)}%</span>
            </div>
            <div class="item">
                <span class="stat-label">Interactions:</span>
                <span class="stat-value">${stats.engagement.interactions}</span>
            </div>
        `;
    }

    updateCategoryChart(stats) {
        const container = this.container.querySelector('.category-chart-container');
        const statsList = this.container.querySelector('.category-stats-list');
        const canvas = this.container.querySelector('#category-chart');
        
        const categories = stats.articles.categories;
        const data = Object.entries(categories).map(([name, stats]) => ({
            name,
            count: stats.count,
            views: stats.views,
            readTime: stats.readTime
        }));
        
        // Update stats list
        statsList.innerHTML = data.map(item => `
            <div class="stat-item">
                <span class="stat-label">${item.name}</span>
                <span class="stat-value">${item.count} articles</span>
                <span class="stat-value">${item.views} views</span>
                <span class="stat-value">${this.formatDuration(item.readTime)}</span>
            </div>
        `).join('');
        
        // Draw chart
        this.drawPieChart(canvas, data, 'views');
    }

    updateTagChart(stats) {
        const container = this.container.querySelector('.tag-chart-container');
        const statsList = this.container.querySelector('.tag-stats-list');
        const canvas = this.container.querySelector('#tag-chart');
        
        const tags = stats.articles.tags;
        const data = Object.entries(tags).map(([name, stats]) => ({
            name,
            count: stats.count,
            views: stats.views,
            readTime: stats.readTime
        })).slice(0, 10); // Top 10 tags
        
        // Update stats list
        statsList.innerHTML = data.map(item => `
            <div class="stat-item">
                <span class="stat-label">${item.name}</span>
                <span class="stat-value">${item.count} articles</span>
                <span class="stat-value">${item.views} views</span>
                <span class="stat-value">${this.formatDuration(item.readTime)}</span>
            </div>
        `).join('');
        
        // Draw chart
        this.drawBarChart(canvas, data, 'views');
    }

    updatePopularArticles(stats) {
        const container = this.container.querySelector('.popular-articles-list');
        const popular = analyticsManager.getPopularArticles(10);
        
        container.innerHTML = popular.map((article, index) => `
            <div class="popular-article">
                <div class="popular-rank">#${index + 1}</div>
                <div class="popular-info">
                    <h5 class="popular-title">${article.title}</h5>
                    <div class="popular-meta">
                        <span class="popular-views">${article.views.toLocaleString()} views</span>
                        <span class="popular-category">${article.category}</span>
                        <span class="popular-time">${this.formatDate(article.lastViewed)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateTimeBasedStats(period) {
        const timeStats = analyticsManager.getTimeStats(period);
        const container = this.container.querySelector('.time-stats-list');
        const canvas = this.container.querySelector('#time-chart');
        
        if (!timeStats || Object.keys(timeStats).length === 0) {
            container.innerHTML = '<p class="no-data">No data available for this period</p>';
            return;
        }
        
        // Update stats list
        const sortedData = Object.entries(timeStats).sort((a, b) => 
            new Date(a[0]).getTime() - new Date(b[0]).getTime()
        );
        
        container.innerHTML = sortedData.map(([date, stats]) => `
            <div class="stat-item">
                <span class="stat-label">${this.formatDate(date)}</span>
                <span class="stat-value">${stats.views} views</span>
                <span class="stat-value">${stats.reads} reads</span>
                <span class="stat-value">${this.formatDuration(stats.timeSpent)}</span>
            </div>
        `).join('');
        
        // Draw time chart
        this.drawLineChart(canvas, sortedData, 'views');
    }

    updateTimelineCharts(stats) {
        // Generate timeline data (last 30 days)
        const timelineData = this.generateTimelineData(stats);
        
        // Update views timeline
        this.drawLineChart(
            this.container.querySelector('#views-timeline-chart'),
            timelineData.views,
            'Views'
        );
        
        // Update read time timeline
        this.drawLineChart(
            this.container.querySelector('#readtime-chart'),
            timelineData.readTime,
            'Read Time (min)'
        );
        
        // Update user activity timeline
        this.drawLineChart(
            this.container.querySelector('#user-activity-chart'),
            timelineData.users,
            'Active Users'
        );
    }

    drawPieChart(canvas, data, valueField) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const total = data.reduce((sum, item) => sum + item[valueField], 0);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, width, height);
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach((item, index) => {
            const sliceAngle = (item[valueField] / total) * 2 * Math.PI;
            const endAngle = currentAngle + sliceAngle;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
            ctx.closePath();
            
            // Color based on value
            const hue = (index / data.length) * 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = middle;
            
            if (sliceAngle > 0.1) {
                ctx.fillText(item.name, labelX, labelY);
            }
            
            currentAngle = endAngle;
        });
    }

    drawBarChart(canvas, data, valueField) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.length * 0.6;
        const barSpacing = chartWidth / data.length * 0.4;
        
        ctx.clearRect(0, 0, width, height);
        
        const maxValue = Math.max(...data.map(item => item[valueField]));
        const minValue = Math.min(...data.map(item => item[valueField]));
        const range = maxValue - minValue || 1;
        
        data.forEach((item, index) => {
            const barHeight = (item[valueField] / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - padding - barHeight;
            
            // Draw bar
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = middle;
            ctx.fillText(item.name, x + barWidth / 2, y - 10);
            
            // Draw value
            ctx.fillText(item[valueField].toLocaleString(), x + barWidth / 2, y + 20);
        });
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(width - padding, padding);
        ctx.stroke();
    }

    drawLineChart(canvas, data, label) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        const maxValue = Math.max(...data.map(item => item.value));
        const minValue = Math.min(...data.map(item => item.value));
        const range = maxValue - minValue || 1;
        
        // Draw line chart
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        
        data.forEach((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((item.value - minValue) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        data.forEach((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((item.value - minValue) / range) * chartHeight;
            
            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '10px sans-serif';
            ctx.textAlign = center;
            ctx.textBaseline = middle;
            ctx.fillText(item.label, x, y - 10);
        });
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(width - padding, padding);
        ctx.stroke();
        
        // Draw title
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.textAlign = center;
        ctx.textBaseline = top;
        ctx.fillText(label, width / 2, 20);
    }

    generateTimelineData(stats) {
        const now = Date.now();
        const data = [];
        
        // Generate last 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date(now - (i * 24 * 60 * 60 * 1000));
            const dateKey = date.toISOString().split('T')[0];
            
            // Get or generate data for this date
            const dayData = stats.time.daily[dateKey] || {
                views: Math.floor(Math.random() * 100),
                reads: Math.floor(Math.random() * 50),
                timeSpent: Math.floor(Math.random() * 3600),
                articles: Math.floor(Math.random() * 10)
            };
            
            data.push({
                date: dateKey,
                views: dayData.views,
                reads: dayData.reads,
                timeSpent: dayData.timeSpent,
                articles: dayData.articles,
                users: Math.floor(Math.random() * 50) + 10
            });
        }
        
        return data.reverse(); // Most recent first
    }

    exportAnalytics() {
        const data = analyticsManager.exportStats();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Analytics data exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `analytics-notification analytics-${type}`;
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
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .analytics-dashboard {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 95vw;
                max-width: 1400px;
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
            
            .analytics-dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                background: var(--muted);
            }
            
            .analytics-dashboard-header h3 {
                margin: 0;
                color: var(--foreground);
            }
            
            .dashboard-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .analytics-dashboard-content {
                padding: 1rem;
                overflow-y: auto;
                max-height: calc(90vh - 80px);
            }
            
            .analytics-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .overview-card {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
                box-shadow: var(--shadow-sm);
            }
            
            .overview-card h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
            }
            
            .stat-label {
                color: var(--muted-foreground);
            }
            
            .stat-value {
                font-weight: 600;
                color: var(--foreground);
            }
            
            .analytics-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .analytics-section {
                background: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.5rem;
                box-shadow: var(--shadow-sm);
            }
            
            .analytics-section h4 {
                margin: 0 0 1rem 0;
                color: var(--foreground);
            }
            
            .chart-container {
                margin-bottom: 1rem;
            }
            
            .chart-container.large {
                grid-column: span 2;
            }
            
            .category-stats-list,
            .tag-stats-list,
            .time-stats-list,
            .popular-articles-list {
                max-height: 200px;
                overflow-y: auto;
                margin-top: 1rem;
            }
            
            .popular-article {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem;
                border-bottom: 1px solid var(--border);
                transition: all var(--transition-fast);
            }
            
            .popular-article:hover {
                background: var(--accent);
            }
            
            .popular-rank {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--primary);
                width: 2rem;
                text-align: center;
            }
            
            .popular-info {
                flex: 1;
            }
            
            .popular-title {
                margin: 0;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--foreground);
                line-height: 1.4;
            }
            
            .popular-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: var(--muted-foreground);
            }
            
            .time-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .tab-btn {
                padding: 0.5rem 1rem;
                border: none;
                background: var(--background);
                color: var(--muted-foreground);
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all var(--transition-fast);
            }
            
            .tab-btn:hover {
                color: var(--foreground);
                background: var(--accent);
            }
            
            .tab-btn.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
                background: var(--background);
            }
            
            .time-content {
                margin-top: 1rem;
            }
            
            .analytics-charts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .no-data {
                text-align: center;
                color: var(--muted-foreground);
                font-style: italic;
                padding: 2rem;
            }
            
            .analytics-notification {
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
            
            .analytics-notification.success { border-left: 4px solid var(--success); }
            .analytics-notification.error { border-left: 4px solid var(--destructive); }
            .analytics-notification.warning { border-left: 4px solid var(--warning); }
            .analytics-notification.info { border-left: 4px solid var(--info); }
            
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
                .analytics-dashboard {
                    width: 95vw;
                    height: 95vh;
                }
                
                .analytics-overview {
                    grid-template-columns: 1fr;
                }
                
                .analytics-details {
                    grid-template-columns: 1fr;
                }
                
                .analytics-charts {
                    grid-template-columns: 1fr;
                }
                
                .chart-container.large {
                    grid-column: span 1;
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
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart.destroy) chart.destroy();
        });
    }
}

// Create singleton instance
export const analyticsDashboard = new AnalyticsDashboard();
