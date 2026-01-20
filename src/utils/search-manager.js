// Advanced Search and Filtering System with Real-time Capabilities
export class SearchManager {
    constructor() {
        this.searchIndex = new Map();
        this.searchHistory = [];
        this.maxHistorySize = 50;
        this.debounceDelay = 300;
        this.currentQuery = '';
        this.filters = {
            categories: new Set(),
            tags: new Set(),
            dateRange: null,
            author: null
        };
        this.sortOptions = {
            field: 'relevance',
            direction: 'desc'
        };
        this.searchStats = {
            totalSearches: 0,
            averageQueryTime: 0,
            queryTimes: [],
            lastQueryTime: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.buildSearchIndex();
    }

    setupEventListeners() {
        // Listen for search events
        document.addEventListener('searchQuery', (e) => {
            this.handleSearchQuery(e.detail);
        });

        document.addEventListener('filterChange', (e) => {
            this.handleFilterChange(e.detail);
        });

        document.addEventListener('sortChange', (e) => {
            this.handleSortChange(e.detail);
        });
    }

    buildSearchIndex() {
        // This would typically build an index from articles
        // For now, we'll create a basic structure
        this.searchIndex.clear();
        
        // Index would be built from article data
        // Each entry would contain: title, content, tags, category, author, date
    }

    updateSearchIndex(articles) {
        this.searchIndex.clear();
        
        articles.forEach(article => {
            const indexEntry = {
                id: article.id,
                title: article.title || '',
                content: this.stripHtml(article.content || ''),
                tags: article.tags || [],
                category: article.category || '',
                author: article.author || '',
                date: article.createdAt || '',
                excerpt: this.getExcerpt(article.content || ''),
                wordCount: this.countWords(article.content || ''),
                readingTime: article.readTime || 0,
                views: article.views || 0
            };
            
            this.searchIndex.set(article.id, indexEntry);
        });
    }

    handleSearchQuery(detail) {
        const { query, options = {} } = detail;
        
        // Add to search history
        this.addToHistory(query);
        
        // Update search stats
        this.updateSearchStats();
        
        // Perform search with debouncing
        this.debounceSearch(query, options);
    }

    debounceSearch(query, options) {
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query, options);
        }, this.debounceDelay);
    }

    performSearch(query, options = {}) {
        const startTime = performance.now();
        this.currentQuery = query;
        
        // Parse search query
        const searchQuery = this.parseQuery(query);
        
        // Get all results
        let results = Array.from(this.searchIndex.values());
        
        // Apply text search
        if (searchQuery.text) {
            results = this.textSearch(results, searchQuery.text);
        }
        
        // Apply filters
        results = this.applyFilters(results, searchQuery.filters);
        
        // Apply sorting
        results = this.sortResults(results, searchQuery.sort);
        
        // Highlight matches
        results = this.highlightMatches(results, searchQuery.text);
        
        // Calculate search time
        const searchTime = performance.now() - startTime;
        this.searchStats.lastQueryTime = searchTime;
        this.searchStats.queryTimes.push(searchTime);
        
        // Keep only last 100 query times
        if (this.searchStats.queryTimes.length > 100) {
            this.searchStats.queryTimes.shift();
        }
        
        // Calculate average
        this.searchStats.averageQueryTime = 
            this.searchStats.queryTimes.reduce((sum, time) => sum + time, 0) / 
            this.searchStats.queryTimes.length;
        
        // Emit results
        this.emitSearchResults(results, {
            query: searchQuery,
            searchTime: searchTime,
            totalResults: results.length,
            filters: this.getActiveFilters()
        });
        
        return results;
    }

    parseQuery(query) {
        const parsed = {
            text: '',
            filters: { ...this.filters },
            sort: { ...this.sortOptions }
        };
        
        // Extract special syntax
        const specialSyntax = {
            category: /category:(\w+)/gi,
            tag: /tag:(\w+)/gi,
            author: /author:(\w+)/gi,
            date: /date:(.+)/gi,
            sort: /sort:(\w+)(?:\:(asc|desc))?/gi
        };
        
        // Extract filters from query
        Object.entries(specialSyntax).forEach(([type, regex]) => {
            const matches = query.match(regex);
            if (matches) {
                matches.forEach(match => {
                    switch (type) {
                        case 'category':
                            const categoryMatch = match.match(/category:(\w+)/i);
                            if (categoryMatch) {
                                parsed.filters.categories.add(categoryMatch[1]);
                            }
                            break;
                        case 'tag':
                            const tagMatch = match.match(/tag:(\w+)/i);
                            if (tagMatch) {
                                parsed.filters.tags.add(tagMatch[1]);
                            }
                            break;
                        case 'author':
                            const authorMatch = match.match(/author:(\w+)/i);
                            if (authorMatch) {
                                parsed.filters.author = authorMatch[1];
                            }
                            break;
                        case 'date':
                            const dateMatch = match.match(/date:(.+)/i);
                            if (dateMatch) {
                                parsed.filters.dateRange = this.parseDateRange(dateMatch[1]);
                            }
                            break;
                        case 'sort':
                            const sortMatch = match.match(/sort:(\w+)(?::(asc|desc))?/i);
                            if (sortMatch) {
                                parsed.sort.field = sortMatch[1];
                                parsed.sort.direction = sortMatch[2] || 'desc';
                            }
                            break;
                    }
                    
                    // Remove special syntax from text query
                    query = query.replace(match, '').trim();
                });
            }
        });
        
        // Clean remaining text
        parsed.text = query;
        
        return parsed;
    }

    parseDateRange(dateString) {
        const now = new Date();
        let startDate, endDate;
        
        switch (dateString.toLowerCase()) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            default:
                // Try to parse specific date range
                const dateRange = dateString.split('..');
                if (dateRange.length === 2) {
                    startDate = new Date(dateRange[0]);
                    endDate = new Date(dateRange[1]);
                } else {
                    startDate = new Date(dateString);
                    endDate = new Date(dateString);
                    endDate.setDate(endDate.getDate() + 1);
                }
        }
        
        return { startDate, endDate };
    }

    textSearch(results, query) {
        if (!query.trim()) return results;
        
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        return results.map(item => {
            const score = this.calculateRelevanceScore(item, searchTerms);
            return {
                ...item,
                searchScore: score,
                matchedTerms: this.getMatchedTerms(item, searchTerms)
            };
        }).filter(item => item.searchScore > 0);
    }

    calculateRelevanceScore(item, searchTerms) {
        let score = 0;
        
        searchTerms.forEach(term => {
            // Title matches (highest weight)
            if (item.title.toLowerCase().includes(term)) {
                score += 10;
                if (item.title.toLowerCase().startsWith(term)) {
                    score += 5; // Bonus for starts with
                }
            }
            
            // Content matches (medium weight)
            if (item.content.toLowerCase().includes(term)) {
                score += 3;
                const occurrences = (item.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
                score += Math.min(occurrences, 5); // Cap at 5 points
            }
            
            // Tag matches (high weight)
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(term)) {
                    score += 7;
                }
            });
            
            // Category match (medium weight)
            if (item.category.toLowerCase().includes(term)) {
                score += 5;
            }
            
            // Author match (low weight)
            if (item.author.toLowerCase().includes(term)) {
                score += 2;
            }
        });
        
        // Boost recent articles
        const daysSinceCreation = (Date.now() - new Date(item.date)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 7) {
            score += 2;
        } else if (daysSinceCreated < 30) {
            score += 1;
        }
        
        // Boost popular articles
        if (item.views > 100) {
            score += 1;
        }
        
        return score;
    }

    getMatchedTerms(item, searchTerms) {
        const matched = new Set();
        
        searchTerms.forEach(term => {
            if (item.title.toLowerCase().includes(term) ||
                item.content.toLowerCase().includes(term) ||
                item.tags.some(tag => tag.toLowerCase().includes(term)) ||
                item.category.toLowerCase().includes(term) ||
                item.author.toLowerCase().includes(term)) {
                matched.add(term);
            }
        });
        
        return Array.from(matched);
    }

    applyFilters(results, filters) {
        return results.filter(item => {
            // Category filter
            if (filters.categories.size > 0) {
                if (!filters.categories.has(item.category.toLowerCase())) {
                    return false;
                }
            }
            
            // Tag filter
            if (filters.tags.size > 0) {
                const itemTags = item.tags.map(tag => tag.toLowerCase());
                const hasMatchingTag = filters.tags.has(tag => itemTags.includes(tag));
                if (!hasMatchingTag) {
                    return false;
                }
            }
            
            // Author filter
            if (filters.author) {
                if (!item.author.toLowerCase().includes(filters.author.toLowerCase())) {
                    return false;
                }
            }
            
            // Date range filter
            if (filters.dateRange) {
                const itemDate = new Date(item.date);
                if (filters.dateRange.startDate && itemDate < filters.dateRange.startDate) {
                    return false;
                }
                if (filters.dateRange.endDate && itemDate > filters.dateRange.endDate) {
                    return false;
                }
            }
            
            return true;
        });
    }

    sortResults(results, sortOptions) {
        const { field, direction } = sortOptions;
        
        return results.sort((a, b) => {
            let comparison = 0;
            
            switch (field) {
                case 'relevance':
                    comparison = (b.searchScore || 0) - (a.searchScore || 0);
                    break;
                case 'date':
                    comparison = new Date(b.date) - new Date(a.date);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'views':
                    comparison = (b.views || 0) - (a.views || 0);
                    break;
                case 'readingTime':
                    comparison = (b.readingTime || 0) - (a.readingTime || 0);
                    break;
                default:
                    comparison = (b.searchScore || 0) - (a.searchScore || 0);
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    highlightMatches(results, query) {
        if (!query.trim()) return results;
        
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        
        return results.map(item => {
            return {
                ...item,
                highlightedTitle: this.highlightText(item.title, searchTerms),
                highlightedContent: this.highlightText(item.excerpt, searchTerms),
                highlightedTags: item.tags.map(tag => this.highlightText(tag, searchTerms))
            };
        });
    }

    highlightText(text, searchTerms) {
        if (!text || searchTerms.length === 0) return text;
        
        let highlightedText = text;
        
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    handleFilterChange(detail) {
        const { type, value } = detail;
        
        switch (type) {
            case 'category':
                if (this.filters.categories.has(value)) {
                    this.filters.categories.delete(value);
                } else {
                    this.filters.categories.add(value);
                }
                break;
            case 'tag':
                if (this.filters.tags.has(value)) {
                    this.filters.tags.delete(value);
                } else {
                    this.filters.tags.add(value);
                }
                break;
            case 'author':
                this.filters.author = value;
                break;
            case 'dateRange':
                this.filters.dateRange = value;
                break;
        }
        
        // Re-run search with current query
        if (this.currentQuery) {
            this.performSearch(this.currentQuery);
        }
    }

    handleSortChange(detail) {
        const { field, direction } = detail;
        this.sortOptions.field = field;
        this.sortOptions.direction = direction;
        
        // Re-run search with current query
        if (this.currentQuery) {
            this.performSearch(this.currentQuery);
        }
    }

    addToHistory(query) {
        if (!query.trim()) return;
        
        // Remove existing entry
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift({
            query: query,
            timestamp: Date.now(),
            filters: { ...this.filters },
            sort: { ...this.sortOptions }
        });
        
        // Maintain size limit
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
        
        // Update search stats
        this.searchStats.totalSearches++;
    }

    updateSearchStats() {
        // Stats are updated in performSearch method
    }

    emitSearchResults(results, metadata) {
        const event = new CustomEvent('searchResults', {
            detail: {
                results: results,
                metadata: metadata,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Filter management methods
    addCategoryFilter(category) {
        this.filters.categories.add(category.toLowerCase());
        this.handleFilterChange({ type: 'category', value: category.toLowerCase() });
    }

    removeCategoryFilter(category) {
        this.filters.categories.delete(category.toLowerCase());
        this.handleFilterChange({ type: 'category', value: category.toLowerCase() });
    }

    addTagFilter(tag) {
        this.filters.tags.add(tag.toLowerCase());
        this.handleFilterChange({ type: 'tag', value: tag.toLowerCase() });
    }

    removeTagFilter(tag) {
        this.filters.tags.delete(tag.toLowerCase());
        this.handleFilterChange({ type: 'tag', value: tag.toLowerCase() });
    }

    setAuthorFilter(author) {
        this.filters.author = author.toLowerCase();
        this.handleFilterChange({ type: 'author', value: author.toLowerCase() });
    }

    setDateRangeFilter(startDate, endDate) {
        this.filters.dateRange = { startDate, endDate };
        this.handleFilterChange({ type: 'dateRange', value: this.filters.dateRange });
    }

    clearFilters() {
        this.filters = {
            categories: new Set(),
            tags: new Set(),
            dateRange: null,
            author: null
        };
        
        // Re-run search with current query
        if (this.currentQuery) {
            this.performSearch(this.currentQuery);
        }
    }

    // Sort management methods
    setSort(field, direction = 'desc') {
        this.sortOptions.field = field;
        this.sortOptions.direction = direction;
        this.handleSortChange({ field, direction });
    }

    // Utility methods
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    getExcerpt(content, maxLength = 200) {
        const text = this.stripHtml(content);
        return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
    }

    countWords(text) {
        const plainText = this.stripHtml(text);
        return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    getActiveFilters() {
        return {
            categories: Array.from(this.filters.categories),
            tags: Array.from(this.filters.tags),
            author: this.filters.author,
            dateRange: this.filters.dateRange
        };
    }

    getSearchHistory(limit = 10) {
        return this.searchHistory.slice(0, limit);
    }

    getSearchStats() {
        return {
            ...this.searchStats,
            historySize: this.searchHistory.length,
            indexSize: this.searchIndex.size,
            activeFilters: this.getActiveFilters()
        };
    }

    // Suggestion methods
    getSuggestions(query, limit = 5) {
        if (!query || query.length < 2) return [];
        
        const suggestions = new Set();
        const lowerQuery = query.toLowerCase();
        
        // Get suggestions from titles
        this.searchIndex.forEach(item => {
            if (item.title.toLowerCase().includes(lowerQuery)) {
                suggestions.add(item.title);
            }
        });
        
        // Get suggestions from tags
        this.searchIndex.forEach(item => {
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(lowerQuery)) {
                    suggestions.add(tag);
                }
            });
        });
        
        // Get suggestions from categories
        this.searchIndex.forEach(item => {
            if (item.category.toLowerCase().includes(lowerQuery)) {
                suggestions.add(item.category);
            }
        });
        
        return Array.from(suggestions).slice(0, limit);
    }

    // Advanced search methods
    fuzzySearch(query, threshold = 0.6) {
        // Implementation of fuzzy search would go here
        // For now, return regular search results
        return this.performSearch(query);
    }

    semanticSearch(query) {
        // Implementation of semantic search would go here
        // For now, return regular search results
        return this.performSearch(query);
    }

    // Export/Import methods
    exportSearchHistory() {
        const data = {
            history: this.searchHistory,
            stats: this.searchStats,
            exportedAt: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importSearchHistory(data) {
        if (data && data.history) {
            this.searchHistory = data.history;
            this.searchStats = { ...this.searchStats, ...data.stats };
        }
    }

    // Cleanup
    clearHistory() {
        this.searchHistory = [];
        this.searchStats.totalSearches = 0;
        this.searchStats.queryTimes = [];
        this.searchStats.averageQueryTime = 0;
    }

    destroy() {
        clearTimeout(this.searchTimeout);
        this.clearHistory();
        this.searchIndex.clear();
    }
}

// Create singleton instance
export const searchManager = new SearchManager();
