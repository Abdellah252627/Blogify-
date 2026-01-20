// RSS Feed Generation System
export class RSSFeedManager {
    constructor() {
        this.feedConfig = {
            title: 'Blogify Blog',
            description: 'Latest articles from Blogify',
            language: 'en-us',
            copyright: `Copyright ${new Date().getFullYear()} Blogify`,
            managingEditor: '',
            webMaster: '',
            category: 'Technology',
            ttl: 60, // Time to live in minutes
            maxItems: 20,
            includeImages: true,
            includeFullContent: false,
            customFields: {}
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFeedGeneration();
    }

    setupEventListeners() {
        // Listen for feed generation requests
        document.addEventListener('generateRSSFeed', (e) => {
            this.handleFeedGenerationRequest(e.detail);
        });

        // Listen for feed configuration updates
        document.addEventListener('updateFeedConfig', (e) => {
            this.updateFeedConfig(e.detail);
        });

        // Listen for article updates to regenerate feed
        document.addEventListener('articleUpdated', () => {
            this.regenerateFeed();
        });

        document.addEventListener('articleCreated', () => {
            this.regenerateFeed();
        });

        document.addEventListener('articleDeleted', () => {
            this.regenerateFeed();
        });
    }

    setupFeedGeneration() {
        // Initialize feed generation
        this.generateFeed();
    }

    // Main feed generation method
    async generateFeed(options = {}) {
        const config = { ...this.feedConfig, ...options };
        
        try {
            // Get articles
            const articles = await this.getArticlesForFeed(config);
            
            // Generate RSS XML
            const rssXML = this.createRSSFeed(articles, config);
            
            // Save feed to storage
            await this.saveFeedToStorage(rssXML, config);
            
            // Update feed URL
            this.updateFeedURL();
            
            // Emit success event
            this.emitFeedEvent('feedGenerated', {
                itemCount: articles.length,
                config: config,
                timestamp: Date.now()
            });

            return rssXML;

        } catch (error) {
            console.error('RSS feed generation failed:', error);
            
            // Emit error event
            this.emitFeedEvent('feedError', {
                error: error.message,
                timestamp: Date.now()
            });

            throw error;
        }
    }

    async getArticlesForFeed(config) {
        // Get articles from state or API
        const articles = window.state?.articles || [];
        
        // Filter published articles
        const publishedArticles = articles.filter(article => article.published);
        
        // Sort by date (newest first)
        const sortedArticles = publishedArticles.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Limit to max items
        const limitedArticles = sortedArticles.slice(0, config.maxItems);
        
        // Process articles for feed
        return limitedArticles.map(article => this.processArticleForFeed(article, config));
    }

    processArticleForFeed(article, config) {
        const processed = {
            ...article,
            guid: article.id,
            link: this.getArticleURL(article),
            pubDate: new Date(article.createdAt).toUTCString(),
            description: config.includeFullContent ? 
                this.getFullContent(article) : 
                this.getExcerpt(article),
            category: article.category,
            author: article.author,
            enclosure: null,
            source: {
                url: window.location.origin,
                title: config.title
            }
        };

        // Add image enclosure if enabled
        if (config.includeImages && article.image) {
            processed.enclosure = {
                url: article.image,
                type: this.getImageMimeType(article.image),
                length: 0 // Would need to fetch image size
            };
        }

        // Add custom fields
        if (config.customFields) {
            Object.entries(config.customFields).forEach(([key, value]) => {
                processed[key] = value;
            });
        }

        return processed;
    }

    createRSSFeed(articles, config) {
        let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
        rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n';
        
        // Channel header
        rss += '  <channel>\n';
        rss += `    <title>${this.escapeXML(config.title)}</title>\n`;
        rss += `    <description>${this.escapeXML(config.description)}</description>\n`;
        rss += `    <link>${window.location.origin}</link>\n`;
        rss += `    <language>${config.language}</language>\n`;
        rss += `    <copyright>${this.escapeXML(config.copyright)}</copyright>\n`;
        
        if (config.managingEditor) {
            rss += `    <managingEditor>${this.escapeXML(config.managingEditor)}</managingEditor>\n`;
        }
        
        if (config.webMaster) {
            rss += `    <webMaster>${this.escapeXML(config.webMaster)}</webMaster>\n`;
        }
        
        rss += `    <pubDate>${new Date().toUTCString()}</pubDate>\n`;
        rss += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
        rss += `    <category>${this.escapeXML(config.category)}</category>\n`;
        rss += `    <generator>Blogify RSS Generator</generator>\n`;
        rss += `    <docs>https://www.rssboard.org/rss-specification</docs>\n`;
        rss += `    <ttl>${config.ttl}</ttl>\n`;
        
        // Atom self link
        rss += `    <atom:link href="${window.location.origin}/feed.xml" rel="self" type="application/rss+xml" />\n`;
        
        // Add items
        articles.forEach(article => {
            rss += this.createRSSItem(article, config);
        });
        
        rss += '  </channel>\n';
        rss += '</rss>';
        
        return rss;
    }

    createRSSItem(article, config) {
        let item = '    <item>\n';
        item += `      <title>${this.escapeXML(article.title)}</title>\n`;
        item += `      <link>${article.link}</link>\n`;
        item += `      <description>${this.escapeXML(article.description)}</description>\n`;
        item += `      <guid isPermaLink="true">${article.link}</guid>\n`;
        item += `      <pubDate>${article.pubDate}</pubDate>\n`;
        
        // Add category
        if (article.category) {
            item += `      <category>${this.escapeXML(article.category)}</category>\n`;
        }
        
        // Add author
        if (article.author) {
            item += `      <dc:creator>${this.escapeXML(article.author)}</dc:creator>\n`;
        }
        
        // Add full content if enabled
        if (config.includeFullContent) {
            item += `      <content:encoded><![CDATA[${article.content}]]></content:encoded>\n`;
        }
        
        // Add enclosure (image)
        if (article.enclosure) {
            item += `      <enclosure url="${article.enclosure.url}" type="${article.enclosure.type}" length="${article.enclosure.length}" />\n`;
        }
        
        // Add source
        if (article.source) {
            item += `      <source url="${article.source.url}">${this.escapeXML(article.source.title)}</source>\n`;
        }
        
        // Add custom fields
        Object.entries(article).forEach(([key, value]) => {
            if (!['title', 'link', 'description', 'guid', 'pubDate', 'category', 'author', 'content', 'enclosure', 'source'].includes(key) && value) {
                item += `      <${key}>${this.escapeXML(value.toString())}</${key}>\n`;
            }
        });
        
        item += '    </item>\n';
        return item;
    }

    getArticleURL(article) {
        return `${window.location.origin}/article/${article.id}`;
    }

    getExcerpt(article) {
        const content = article.content || '';
        const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 300);
        return excerpt + (content.length > 300 ? '...' : '');
    }

    getFullContent(article) {
        return article.content || '';
    }

    getImageMimeType(imageUrl) {
        const extension = imageUrl.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };
        return mimeTypes[extension] || 'image/jpeg';
    }

    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async saveFeedToStorage(rssXML, config) {
        // Save to localStorage for client-side access
        try {
            localStorage.setItem('blogify_rss_feed', rssXML);
            localStorage.setItem('blogify_rss_config', JSON.stringify(config));
            localStorage.setItem('blogify_rss_updated', new Date().toISOString());
        } catch (error) {
            console.warn('Failed to save RSS feed to localStorage:', error);
        }
    }

    updateFeedURL() {
        // Update feed meta tag in head
        let feedLink = document.querySelector('link[type="application/rss+xml"]');
        
        if (!feedLink) {
            feedLink = document.createElement('link');
            feedLink.rel = 'alternate';
            feedLink.type = 'application/rss+xml';
            feedLink.title = this.feedConfig.title;
            document.head.appendChild(feedLink);
        }
        
        feedLink.href = '/feed.xml';
    }

    // Feed generation for different types
    async generateCategoryFeed(category, options = {}) {
        const config = { ...this.feedConfig, ...options };
        config.title = `${this.feedConfig.title} - ${category}`;
        config.description = `Latest ${category} articles from Blogify`;
        
        const articles = await this.getArticlesForFeed(config);
        const categoryArticles = articles.filter(article => article.category === category);
        
        const rssXML = this.createRSSFeed(categoryArticles, config);
        
        // Save category feed
        await this.saveCategoryFeed(category, rssXML, config);
        
        return rssXML;
    }

    async generateTagFeed(tag, options = {}) {
        const config = { ...this.feedConfig, ...options };
        config.title = `${this.feedConfig.title} - Tag: ${tag}`;
        config.description = `Articles tagged with "${tag}" from Blogify`;
        
        const articles = await this.getArticlesForFeed(config);
        const tagArticles = articles.filter(article => article.tags && article.tags.includes(tag));
        
        const rssXML = this.createRSSFeed(tagArticles, config);
        
        // Save tag feed
        await this.saveTagFeed(tag, rssXML, config);
        
        return rssXML;
    }

    async generateAuthorFeed(author, options = {}) {
        const config = { ...this.feedConfig, ...options };
        config.title = `${this.feedConfig.title} - By ${author}`;
        config.description = `Articles by ${author} from Blogify`;
        
        const articles = await this.getArticlesForFeed(config);
        const authorArticles = articles.filter(article => article.author === author);
        
        const rssXML = this.createRSSFeed(authorArticles, config);
        
        // Save author feed
        await this.saveAuthorFeed(author, rssXML, config);
        
        return rssXML;
    }

    async saveCategoryFeed(category, rssXML, config) {
        try {
            localStorage.setItem(`blogify_rss_category_${category}`, rssXML);
            localStorage.setItem(`blogify_rss_category_${category}_config`, JSON.stringify(config));
        } catch (error) {
            console.warn(`Failed to save category feed for ${category}:`, error);
        }
    }

    async saveTagFeed(tag, rssXML, config) {
        try {
            localStorage.setItem(`blogify_rss_tag_${tag}`, rssXML);
            localStorage.setItem(`blogify_rss_tag_${tag}_config`, JSON.stringify(config));
        } catch (error) {
            console.warn(`Failed to save tag feed for ${tag}:`, error);
        }
    }

    async saveAuthorFeed(author, rssXML, config) {
        try {
            localStorage.setItem(`blogify_rss_author_${author}`, rssXML);
            localStorage.setItem(`blogify_rss_author_${author}_config`, JSON.stringify(config));
        } catch (error) {
            console.warn(`Failed to save author feed for ${author}:`, error);
        }
    }

    // Feed validation
    validateFeed(rssXML) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rssXML, 'text/xml');
            
            // Check for XML parsing errors
            if (xmlDoc.querySelector('parsererror')) {
                return { valid: false, errors: ['Invalid XML format'] };
            }
            
            // Check required RSS elements
            const requiredElements = ['rss', 'channel', 'title', 'description', 'link'];
            const errors = [];
            
            requiredElements.forEach(element => {
                if (!xmlDoc.querySelector(element)) {
                    errors.push(`Missing required element: ${element}`);
                }
            });
            
            return { valid: errors.length === 0, errors };
            
        } catch (error) {
            return { valid: false, errors: [error.message] };
        }
    }

    // Feed statistics
    getFeedStats() {
        const stats = {
            mainFeed: {
                lastUpdated: localStorage.getItem('blogify_rss_updated'),
                itemCount: 0,
                size: 0
            },
            categoryFeeds: {},
            tagFeeds: {},
            authorFeeds: {}
        };

        // Main feed stats
        const mainFeed = localStorage.getItem('blogify_rss_feed');
        if (mainFeed) {
            stats.mainFeed.size = mainFeed.length;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(mainFeed, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            stats.mainFeed.itemCount = items.length;
        }

        // Category feeds
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('blogify_rss_category_') && !key.includes('_config')) {
                const category = key.replace('blogify_rss_category_', '');
                const feed = localStorage.getItem(key);
                if (feed) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(feed, 'text/xml');
                    const items = xmlDoc.querySelectorAll('item');
                    stats.categoryFeeds[category] = {
                        itemCount: items.length,
                        size: feed.length
                    };
                }
            }
        }

        // Tag feeds
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('blogify_rss_tag_') && !key.includes('_config')) {
                const tag = key.replace('blogify_rss_tag_', '');
                const feed = localStorage.getItem(key);
                if (feed) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(feed, 'text/xml');
                    const items = xmlDoc.querySelectorAll('item');
                    stats.tagFeeds[tag] = {
                        itemCount: items.length,
                        size: feed.length
                    };
                }
            }
        }

        // Author feeds
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('blogify_rss_author_') && !key.includes('_config')) {
                const author = key.replace('blogify_rss_author_', '');
                const feed = localStorage.getItem(key);
                if (feed) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(feed, 'text/xml');
                    const items = xmlDoc.querySelectorAll('item');
                    stats.authorFeeds[author] = {
                        itemCount: items.length,
                        size: feed.length
                    };
                }
            }
        }

        return stats;
    }

    // Feed discovery
    getAvailableFeeds() {
        const feeds = {
            main: {
                url: '/feed.xml',
                title: this.feedConfig.title,
                description: this.feedConfig.description
            },
            categories: {},
            tags: {},
            authors: {}
        };

        // Get unique categories
        const articles = window.state?.articles || [];
        const categories = [...new Set(articles.map(article => article.category).filter(Boolean))];
        
        categories.forEach(category => {
            feeds.categories[category] = {
                url: `/feed/category/${category}.xml`,
                title: `${this.feedConfig.title} - ${category}`,
                description: `Latest ${category} articles`
            };
        });

        // Get unique tags
        const allTags = articles.flatMap(article => article.tags || []);
        const tags = [...new Set(allTags)];
        
        tags.forEach(tag => {
            feeds.tags[tag] = {
                url: `/feed/tag/${tag}.xml`,
                title: `${this.feedConfig.title} - Tag: ${tag}`,
                description: `Articles tagged with "${tag}"`
            };
        });

        // Get unique authors
        const authors = [...new Set(articles.map(article => article.author).filter(Boolean))];
        
        authors.forEach(author => {
            feeds.authors[author] = {
                url: `/feed/author/${author}.xml`,
                title: `${this.feedConfig.title} - By ${author}`,
                description: `Articles by ${author}`
            };
        });

        return feeds;
    }

    // Feed subscription
    subscribeToFeed(feedUrl, title) {
        // Create subscription data
        const subscription = {
            url: feedUrl,
            title: title,
            subscribedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString()
        };

        // Get existing subscriptions
        let subscriptions = JSON.parse(localStorage.getItem('blogify_rss_subscriptions') || '[]');
        
        // Check if already subscribed
        if (!subscriptions.find(sub => sub.url === feedUrl)) {
            subscriptions.push(subscription);
            localStorage.setItem('blogify_rss_subscriptions', JSON.stringify(subscriptions));
            
            this.emitFeedEvent('feedSubscribed', {
                feedUrl,
                title,
                timestamp: Date.now()
            });
            
            return true;
        }
        
        return false;
    }

    unsubscribeFromFeed(feedUrl) {
        let subscriptions = JSON.parse(localStorage.getItem('blogify_rss_subscriptions') || '[]');
        
        const initialLength = subscriptions.length;
        subscriptions = subscriptions.filter(sub => sub.url !== feedUrl);
        
        if (subscriptions.length < initialLength) {
            localStorage.setItem('blogify_rss_subscriptions', JSON.stringify(subscriptions));
            
            this.emitFeedEvent('feedUnsubscribed', {
                feedUrl,
                timestamp: Date.now()
            });
            
            return true;
        }
        
        return false;
    }

    getSubscriptions() {
        return JSON.parse(localStorage.getItem('blogify_rss_subscriptions') || '[]');
    }

    // Feed auto-discovery
    generateAutoDiscovery() {
        const feeds = this.getAvailableFeeds();
        let discoveryHTML = '';
        
        // Main feed
        discoveryHTML += `<link rel="alternate" type="application/rss+xml" title="${feeds.main.title}" href="${feeds.main.url}" />\n`;
        
        // Category feeds
        Object.values(feeds.categories).forEach(feed => {
            discoveryHTML += `<link rel="alternate" type="application/rss+xml" title="${feed.title}" href="${feed.url}" />\n`;
        });
        
        return discoveryHTML;
    }

    updateAutoDiscovery() {
        // Remove existing discovery links
        const existingLinks = document.querySelectorAll('link[type="application/rss+xml"]');
        existingLinks.forEach(link => link.remove());
        
        // Add new discovery links
        const discoveryHTML = this.generateAutoDiscovery();
        
        // Parse and add to head
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = discoveryHTML;
        
        Array.from(tempDiv.children).forEach(link => {
            document.head.appendChild(link);
        });
    }

    // Event handlers
    handleFeedGenerationRequest(detail) {
        const { type, options } = detail;
        
        switch (type) {
            case 'main':
                this.generateFeed(options);
                break;
            case 'category':
                this.generateCategoryFeed(detail.category, options);
                break;
            case 'tag':
                this.generateTagFeed(detail.tag, options);
                break;
            case 'author':
                this.generateAuthorFeed(detail.author, options);
                break;
            default:
                this.generateFeed(options);
        }
    }

    updateFeedConfig(newConfig) {
        this.feedConfig = { ...this.feedConfig, ...newConfig };
        this.regenerateFeed();
    }

    regenerateFeed() {
        this.generateFeed();
        this.updateAutoDiscovery();
    }

    // Utility methods
    emitFeedEvent(type, data) {
        const event = new CustomEvent('rssFeed', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getFeed() {
        return localStorage.getItem('blogify_rss_feed');
    }

    getCategoryFeed(category) {
        return localStorage.getItem(`blogify_rss_category_${category}`);
    }

    getTagFeed(tag) {
        return localStorage.getItem(`blogify_rss_tag_${tag}`);
    }

    getAuthorFeed(author) {
        return localStorage.getItem(`blogify_rss_author_${author}`);
    }

    getConfig() {
        return { ...this.feedConfig };
    }

    setConfig(config) {
        this.updateFeedConfig(config);
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        document.removeEventListener('generateRSSFeed', this.handleFeedGenerationRequest);
        document.removeEventListener('updateFeedConfig', this.updateFeedConfig);
        document.removeEventListener('articleUpdated', this.regenerateFeed);
        document.removeEventListener('articleCreated', this.regenerateFeed);
        document.removeEventListener('articleDeleted', this.regenerateFeed);
    }
}

// Create singleton instance
export const rssFeedManager = new RSSFeedManager();
