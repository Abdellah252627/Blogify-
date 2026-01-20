// Advanced Analytics System with Real-time Tracking
export class AnalyticsManager {
    constructor() {
        this.stats = {
            // Article Statistics
            articles: {
                total: 0,
                published: 0,
                drafts: 0,
                totalViews: 0,
                totalReadTime: 0,
                avgReadTime: 0,
                categories: {},
                tags: {},
                popular: [],
                recent: []
            },
            
            // User Statistics
            users: {
                total: 1,
                active: 1,
                new: 0,
                returning: 0,
                sessions: [],
                currentSession: {
                    startTime: Date.now(),
                    pageViews: 0,
                    timeSpent: 0,
                    articlesRead: 0,
                    bounceRate: 0
                }
            },
            
            // Performance Statistics
            performance: {
                pageLoadTime: 0,
                renderTime: 0,
                cacheHitRate: 0,
                errorRate: 0,
                uptime: Date.now()
            },
            
            // Time-based Statistics
            time: {
                daily: {},
                weekly: {},
                monthly: {},
                hourly: {}
            },
            
            // Engagement Statistics
            engagement: {
                avgSessionDuration: 0,
                pagesPerSession: 0,
                articlesPerSession: 0,
                scrollDepth: 0,
                interactions: 0
            }
        };
        
        this.isTracking = true;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        this.loadStoredStats();
        this.setupEventListeners();
        this.startRealTimeTracking();
        this.calculateInitialStats();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadStoredStats() {
        try {
            const stored = localStorage.getItem('blogify_analytics');
            if (stored) {
                const data = JSON.parse(stored);
                this.stats = { ...this.stats, ...data };
            }
        } catch (error) {
            console.error('Failed to load analytics stats:', error);
        }
    }

    saveStats() {
        try {
            localStorage.setItem('blogify_analytics', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save analytics stats:', error);
        }
    }

    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTracking();
            } else {
                this.resumeTracking();
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Track scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (this.isTracking) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.trackScrollDepth();
                }, 1000);
            }
        });

        // Track mouse movements (for engagement)
        let mouseTimeout;
        let mouseMovements = 0;
        window.addEventListener('mousemove', () => {
            if (this.isTracking) {
                mouseMovements++;
                clearTimeout(mouseTimeout);
                mouseTimeout = setTimeout(() => {
                    this.stats.engagement.interactions += mouseMovements;
                    mouseMovements = 0;
                }, 5000);
            }
        });

        // Track clicks
        window.addEventListener('click', (e) => {
            if (this.isTracking) {
                this.trackInteraction(e.target);
            }
        });

        // Listen for custom analytics events
        document.addEventListener('analyticsEvent', (e) => {
            this.handleCustomEvent(e.detail);
        });
    }

    startRealTimeTracking() {
        // Update stats every 30 seconds
        setInterval(() => {
            if (this.isTracking) {
                this.updateRealTimeStats();
                this.saveStats();
            }
        }, 30000);

        // Update session stats every 5 seconds
        setInterval(() => {
            if (this.isTracking) {
                this.updateSessionStats();
            }
        }, 5000);
    }

    pauseTracking() {
        this.isTracking = false;
        this.stats.users.currentSession.timeSpent = Date.now() - this.stats.users.currentSession.startTime;
    }

    resumeTracking() {
        this.isTracking = true;
        this.stats.users.currentSession.startTime = Date.now() - this.stats.users.currentSession.timeSpent;
    }

    endSession() {
        const session = this.stats.users.currentSession;
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        // Add to sessions array
        this.stats.users.sessions.push({
            id: this.sessionId,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            pageViews: session.pageViews,
            articlesRead: session.articlesRead,
            bounceRate: session.pageViews === 1 ? 1 : 0
        });

        // Update user statistics
        this.updateUserStats();
        this.saveStats();
    }

    updateRealTimeStats() {
        const now = Date.now();
        const uptime = now - this.stats.performance.uptime;
        
        // Update time-based stats
        this.updateTimeBasedStats(now);
        
        // Update engagement metrics
        this.updateEngagementStats();
        
        // Update performance metrics
        this.updatePerformanceStats();
    }

    updateSessionStats() {
        const session = this.stats.users.currentSession;
        session.timeSpent = Date.now() - session.startTime;
        session.pageViews = this.stats.users.currentSession.pageViews;
        session.articlesRead = this.stats.users.currentSession.articlesRead;
    }

    updateTimeBasedStats(now) {
        const date = new Date(now);
        
        // Hourly stats
        const hourKey = date.getHours().toString();
        if (!this.stats.time.hourly[hourKey]) {
            this.stats.time.hourly[hourKey] = {
                views: 0,
                reads: 0,
                timeSpent: 0
            };
        }
        
        // Daily stats
        const dayKey = date.toISOString().split('T')[0];
        if (!this.stats.time.daily[dayKey]) {
            this.stats.time.daily[dayKey] = {
                views: 0,
                reads: 0,
                timeSpent: 0,
                articles: 0,
                users: 0
            };
        }
        
        // Weekly stats
        const weekKey = this.getWeekKey(date);
        if (!this.stats.time.weekly[weekKey]) {
            this.stats.time.weekly[weekKey] = {
                views: 0,
                reads: 0,
                timeSpent: 0,
                articles: 0,
                users: 0
            };
        }
        
        // Monthly stats
        const monthKey = date.toISOString().slice(0, 7);
        if (!this.stats.time.monthly[monthKey]) {
            this.stats.time.monthly[monthKey] = {
                views: 0,
                reads: 0,
                timeSpent: 0,
                articles: 0,
                users: 0
            };
        }
    }

    updateEngagementStats() {
        const sessions = this.stats.users.sessions;
        if (sessions.length === 0) return;
        
        const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalPageViews = sessions.reduce((sum, session) => sum + session.pageViews, 0);
        const totalArticlesRead = sessions.reduce((sum, session) => sum + session.articlesRead, 0);
        
        this.stats.engagement.avgSessionDuration = totalDuration / sessions.length;
        this.stats.engagement.pagesPerSession = totalPageViews / sessions.length;
        this.stats.engagement.articlesPerSession = totalArticlesRead / sessions.length;
    }

    updatePerformanceStats() {
        // Calculate cache hit rate (would be provided by cache manager)
        // This is a placeholder - actual implementation would integrate with cache system
        this.stats.performance.cacheHitRate = 0.85; // Example value
        
        // Calculate error rate
        this.stats.performance.errorRate = 0.02; // Example value
    }

    trackPageView(page) {
        if (!this.isTracking) return;
        
        this.stats.users.currentSession.pageViews++;
        
        // Update time-based stats
        const now = Date.now();
        const date = new Date(now);
        const dayKey = date.toISOString().split('T')[0];
        
        if (this.stats.time.daily[dayKey]) {
            this.stats.time.daily[dayKey].views++;
        }
        
        const weekKey = this.getWeekKey(date);
        if (this.stats.time.weekly[weekKey]) {
            this.stats.time.weekly[weekKey].views++;
        }
        
        const monthKey = date.toISOString().slice(0, 7);
        if (this.stats.time.monthly[monthKey]) {
            this.stats.time.monthly[monthKey].views++;
        }
    }

    trackArticleView(articleId) {
        if (!this.isTracking) return;
        
        // Update article statistics
        if (!this.stats.articles.popular) {
            this.stats.articles.popular = [];
        }
        
        // Find or create article entry
        let article = this.stats.articles.popular.find(a => a.id === articleId);
        if (!article) {
            article = {
                id: articleId,
                title: '',
                views: 0,
                readTime: 0,
                category: '',
                tags: [],
                lastViewed: null,
                firstViewed: Date.now(),
                readSessions: []
            };
            this.stats.articles.popular.push(article);
        }
        
        article.views++;
        article.lastViewed = Date.now();
        
        // Update category stats
        const articleData = this.getArticleData(articleId);
        if (articleData) {
            article.title = articleData.title;
            article.category = articleData.category;
            article.tags = articleData.tags || [];
            
            // Update category statistics
            if (article.category) {
                if (!this.stats.articles.categories[article.category]) {
                    this.stats.articles.categories[article.category] = {
                        count: 0,
                        views: 0,
                        readTime: 0
                    };
                }
                this.stats.articles.categories[article.category].count++;
                this.stats.articles.categories[article.category].views++;
            }
            
            // Update tag statistics
            article.tags.forEach(tag => {
                if (!this.stats.articles.tags[tag]) {
                    this.stats.articles.tags[tag] = {
                        count: 0,
                        views: 0,
                        readTime: 0
                    };
                }
                this.stats.articles.tags[tag].count++;
                this.stats.articles.tags[tag].views++;
            });
        }
        
        // Sort articles by views
        this.stats.articles.popular.sort((a, b) => b.views - a.views);
        
        // Update total views
        this.stats.articles.totalViews = this.stats.articles.popular.reduce((sum, a) => sum + a.views, 0);
        
        // Update session stats
        this.stats.users.currentSession.articlesRead++;
        
        // Update time-based stats
        const now = Date.now();
        const date = new Date(now);
        const dayKey = date.toISOString().split('T')[0];
        
        if (this.stats.time.daily[dayKey]) {
            this.stats.time.daily[dayKey].reads++;
        }
        
        const weekKey = this.getWeekKey(date);
        if (this.stats.time.weekly[weekKey]) {
            this.stats.time.weekly[weekKey].reads++;
        }
        
        const monthKey = date.toISOString().slice(0, 7);
        if (this.stats.time.monthly[monthKey]) {
            this.stats.time.monthly[monthKey].reads++;
        }
        
        // Emit analytics event
        this.emitAnalyticsEvent('articleView', {
            articleId,
            timestamp: now,
            sessionId: this.sessionId
        });
    }

    trackArticleRead(articleId, readTime) {
        if (!this.isTracking) return;
        
        // Update article statistics
        const article = this.stats.articles.popular.find(a => a.id === articleId);
        if (article) {
            article.readTime += readTime;
            article.readSessions.push({
                sessionId: this.sessionId,
                readTime: readTime,
                timestamp: Date.now()
            });
            
            // Update total read time
            this.stats.articles.totalReadTime += readTime;
            this.stats.articles.avgReadTime = this.stats.articles.totalReadTime / this.stats.articles.totalViews;
            
            // Update category read time
            if (article.category && this.stats.articles.categories[article.category]) {
                this.stats.articles.categories[article.category].readTime += readTime;
            }
            
            // Update tag read time
            article.tags.forEach(tag => {
                if (this.stats.articles.tags[tag]) {
                    this.stats.articles.tags[tag].readTime += readTime;
                }
            });
        }
        
        // Update session stats
        this.stats.users.currentSession.articlesRead++;
        
        // Emit analytics event
        this.emitAnalyticsEvent('articleRead', {
            articleId,
            readTime,
            timestamp: Date.now(),
            sessionId: this.sessionId
        });
    }

    trackInteraction(element) {
        if (!this.isTracking) return;
        
        const interaction = {
            element: element.tagName.toLowerCase(),
            className: element.className,
            id: element.id,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        // Store interaction for analysis
        if (!this.stats.interactions) {
            this.stats.interactions = [];
        }
        this.stats.interactions.push(interaction);
        
        // Keep only last 1000 interactions
        if (this.stats.interactions.length > 1000) {
            this.stats.interactions.shift();
        }
    }

    trackScrollDepth() {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDepth = (scrollTop / scrollHeight) * 100;
        
        this.stats.engagement.scrollDepth = Math.max(this.stats.engagement.scrollDepth, scrollDepth);
    }

    calculateReadingTime(content) {
        // Average reading speed: 200 words per minute
        const words = this.countWords(content);
        return Math.ceil(words / 200);
    }

    countWords(text) {
        // Remove HTML tags and count words
        const plainText = text.replace(/<[^>]*>/g, '').trim();
        return plainText.split(/\s+/).filter(word => word.length > 0).length;
    }

    getWeekKey(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek.toISOString().split('T')[0];
    }

    getArticleData(articleId) {
        // This would typically come from the article manager or cache
        // For now, return mock data
        return {
            title: 'Article ' + articleId,
            category: 'Technology',
            tags: ['web', 'javascript'],
            content: 'Sample content...'
        };
    }

    updateUserStats() {
        const sessions = this.stats.users.sessions;
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        // Count new vs returning users
        const newUsers = sessions.filter(s => s.startTime > oneWeekAgo).length;
        const returningUsers = sessions.filter(s => s.startTime <= oneWeekAgo).length;
        
        this.stats.users.new = newUsers;
        this.stats.users.returning = returningUsers;
        this.stats.users.total = sessions.length;
        this.stats.users.active = sessions.filter(s => 
            now - s.endTime < 30 * 60 * 1000 // Active in last 30 minutes
        ).length;
    }

    calculateInitialStats() {
        // Calculate initial statistics from existing articles
        this.calculateArticleStats();
        this.calculateCategoryStats();
        this.calculateTagStats();
        this.calculatePopularArticles();
    }

    calculateArticleStats() {
        // This would typically get data from the article manager
        // For now, use mock data
        this.stats.articles.total = 10;
        this.stats.articles.published = 8;
        this.stats.articles.drafts = 2;
    }

    calculateCategoryStats() {
        // Calculate category distribution
        this.stats.articles.categories = {
            'Technology': { count: 5, views: 150, readTime: 25 },
            'Lifestyle': { count: 3, views: 80, readTime: 15 },
            'Business': { count: 2, views: 45, readTime: 10 }
        };
    }

    calculateTagStats() {
        // Calculate tag distribution
        this.stats.articles.tags = {
            'javascript': { count: 4, views: 120, readTime: 20 },
            'web': { count: 3, views: 90, readTime: 15 },
            'tutorial': { count: 2, views: 60, readTime: 12 }
        };
    }

    calculatePopularArticles() {
        // Sort articles by views and engagement
        this.stats.articles.popular = [
            { id: '1', title: 'Getting Started with JavaScript', views: 150, readTime: 25, category: 'Technology', tags: ['javascript', 'tutorial'] },
            { id: '2', title: 'Modern CSS Techniques', views: 120, readTime: 20, category: 'Technology', tags: ['css', 'web'] },
            { id: '3', title: 'Productivity Tips', views: 80, readTime: 15, category: 'Lifestyle', tags: ['productivity'] },
            { id: '4', title: 'Business Strategy 2024', views: 45, readTime: 10, category: 'Business', tags: ['business'] },
            { id: '5', title: 'Web Development Trends', views: 40, readTime: 8, category: 'Technology', tags: ['web', 'trends'] }
        ];
    }

    emitAnalyticsEvent(eventType, data) {
        const event = new CustomEvent('analyticsEvent', {
            detail: {
                type: eventType,
                data: data,
                timestamp: Date.now(),
                sessionId: this.sessionId
            }
        });
        document.dispatchEvent(event);
    }

    handleCustomEvent(eventData) {
        const { type, data } = eventData;
        
        switch (type) {
            case 'articleCreated':
                this.handleArticleCreated(data);
                break;
            case 'articleUpdated':
                this.handleArticleUpdated(data);
                break;
            case 'articleDeleted':
                this.handleArticleDeleted(data);
                break;
            case 'userRegistered':
                this.handleUserRegistered(data);
                break;
            case 'userLoggedIn':
                this.handleUserLoggedIn(data);
                break;
        }
    }

    handleArticleCreated(data) {
        this.stats.articles.total++;
        if (data.published) {
            this.stats.articles.published++;
        } else {
            this.stats.articles.drafts++;
        }
        
        // Update category and tag stats
        if (data.category) {
            if (!this.stats.articles.categories[data.category]) {
                this.stats.articles.categories[data.category] = {
                    count: 0,
                    views: 0,
                    readTime: 0
                };
            }
            this.stats.articles.categories[data.category].count++;
        }
        
        if (data.tags) {
            data.tags.forEach(tag => {
                if (!this.stats.articles.tags[tag]) {
                    this.stats.articles.tags[tag] = {
                        count: 0,
                        views: 0,
                        readTime: 0
                    };
                }
                this.stats.articles.tags[tag].count++;
            });
        }
        
        this.saveStats();
    }

    handleArticleUpdated(data) {
        // Update article in popular list if it exists
        const article = this.stats.articles.popular.find(a => a.id === data.id);
        if (article) {
            Object.assign(article, data);
            // Re-sort by views
            this.stats.articles.popular.sort((a, b) => b.views - a.views);
        }
        
        this.saveStats();
    }

    handleArticleDeleted(data) {
        // Remove from popular list
        this.stats.articles.popular = this.stats.articles.popular.filter(a => a.id !== data.id);
        
        // Update total count
        this.stats.articles.total--;
        if (data.published) {
            this.stats.articles.published--;
        } else {
            this.stats.articles.drafts--;
        }
        
        // Update category and tag stats
        if (data.category && this.stats.articles.categories[data.category]) {
            this.stats.articles.categories[data.category].count--;
            if (this.stats.articles.categories[data.category].count === 0) {
                delete this.stats.articles.categories[data.category];
            }
        }
        
        if (data.tags) {
            data.tags.forEach(tag => {
                if (this.stats.articles.tags[tag]) {
                    this.stats.articles.tags[tag].count--;
                    if (this.stats.articles.tags[tag].count === 0) {
                        delete this.stats.articles.tags[tag];
                    }
                }
            });
        }
        
        this.saveStats();
    }

    handleUserRegistered(data) {
        this.stats.users.total++;
        this.stats.users.new++;
        this.saveStats();
    }

    handleUserLoggedIn(data) {
        // Track returning user
        const existingSession = this.stats.users.sessions.find(s => 
            s.userId === data.userId
        );
        
        if (!existingSession) {
            this.stats.users.returning++;
        }
        
        this.saveStats();
    }

    getStats() {
        return {
            ...this.stats,
            generatedAt: Date.now()
        };
    }

    getCategoryStats() {
        return this.stats.articles.categories;
    }

    getTagStats() {
        return this.stats.articles.tags;
    }

    getPopularArticles(limit = 10) {
        return this.stats.articles.popular.slice(0, limit);
    }

    getTimeStats(period = 'daily') {
        return this.stats.time[period] || {};
    }

    getUserStats() {
        return this.stats.users;
    }

    getEngagementStats() {
        return this.stats.engagement;
    }

    getPerformanceStats() {
        return this.stats.performance;
    }

    exportStats() {
        return {
            stats: this.getStats(),
            exportedAt: Date.now(),
            version: '1.0.0'
        };
    }

    importStats(data) {
        if (data && data.stats) {
            this.stats = { ...this.stats, ...data.stats };
            this.saveStats();
        }
    }

    resetStats() {
        // Keep basic structure but reset counts
        const categories = this.stats.articles.categories;
        const tags = this.stats.articles.tags;
        
        this.stats.articles = {
            total: 0,
            published: 0,
            drafts: 0,
            totalViews: 0,
            totalReadTime: 0,
            avgReadTime: 0,
            categories: {},
            tags: {},
            popular: [],
            recent: []
        };
        
        // Restore categories and tags structure
        Object.keys(categories).forEach(key => {
            this.stats.articles.categories[key] = {
                count: categories[key].count || 0,
                views: 0,
                readTime: 0
            };
        });
        
        Object.keys(tags).forEach(key => {
            this.stats.articles.tags[key] = {
                count: tags[key].count || 0,
                views: 0,
                readTime: 0
            };
        });
        
        this.saveStats();
    }

    destroy() {
        this.endSession();
        this.isTracking = false;
    }
}

// Create singleton instance
export const analyticsManager = new AnalyticsManager();
