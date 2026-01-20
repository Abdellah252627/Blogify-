// Bookmark System Manager
export class BookmarkManager {
    constructor() {
        this.bookmarks = [];
        this.categories = ['General', 'Reading', 'Research', 'Favorites', 'Archive'];
        this.maxBookmarks = 1000;
        this.init();
    }

    init() {
        this.loadBookmarks();
        this.setupEventListeners();
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Listen for bookmark requests
        document.addEventListener('addBookmark', (e) => {
            this.handleAddBookmark(e.detail);
        });

        document.addEventListener('removeBookmark', (e) => {
            this.handleRemoveBookmark(e.detail);
        });

        document.addEventListener('updateBookmark', (e) => {
            this.handleUpdateBookmark(e.detail);
        });

        // Listen for category management
        document.addEventListener('addBookmarkCategory', (e) => {
            this.addCategory(e.detail.category);
        });

        document.addEventListener('removeBookmarkCategory', (e) => {
            this.removeCategory(e.detail.category);
        });

        // Listen for bookmark search
        document.addEventListener('searchBookmarks', (e) => {
            this.handleBookmarkSearch(e.detail);
        });

        // Listen for bookmark export
        document.addEventListener('exportBookmarks', (e) => {
            this.exportBookmarks(e.detail.format);
        });

        // Listen for bookmark import
        document.addEventListener('importBookmarks', (e) => {
            this.importBookmarks(e.detail.file);
        });
    }

    setupAutoSave() {
        // Auto-save bookmarks every 30 seconds
        setInterval(() => {
            this.saveBookmarks();
        }, 30000);

        // Save on window unload
        window.addEventListener('beforeunload', () => {
            this.saveBookmarks();
        });
    }

    loadBookmarks() {
        try {
            const saved = localStorage.getItem('blogify_bookmarks');
            if (saved) {
                this.bookmarks = JSON.parse(saved);
            }

            const savedCategories = localStorage.getItem('blogify_bookmark_categories');
            if (savedCategories) {
                this.categories = JSON.parse(savedCategories);
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            this.bookmarks = [];
            this.categories = ['General', 'Reading', 'Research', 'Favorites', 'Archive'];
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem('blogify_bookmarks', JSON.stringify(this.bookmarks));
            localStorage.setItem('blogify_bookmark_categories', JSON.stringify(this.categories));
            
            this.emitBookmarkEvent('bookmarksSaved', {
                count: this.bookmarks.length,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
        }
    }

    // Bookmark CRUD operations
    addBookmark(articleId, options = {}) {
        const bookmark = {
            id: this.generateId(),
            articleId: articleId,
            userId: options.userId || 'current-user',
            category: options.category || 'General',
            notes: options.notes || '',
            tags: options.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPrivate: options.isPrivate || false,
            isFavorite: options.isFavorite || false,
            readLater: options.readLater || false,
            priority: options.priority || 'medium' // low, medium, high
        };

        // Check if bookmark already exists
        const existingBookmark = this.bookmarks.find(b => 
            b.articleId === articleId && b.userId === bookmark.userId
        );

        if (existingBookmark) {
            throw new Error('Article already bookmarked');
        }

        // Check bookmark limit
        if (this.bookmarks.length >= this.maxBookmarks) {
            throw new Error(`Maximum bookmark limit (${this.maxBookmarks}) reached`);
        }

        // Add bookmark
        this.bookmarks.unshift(bookmark);
        this.saveBookmarks();

        // Emit success event
        this.emitBookmarkEvent('bookmarkAdded', {
            bookmark: bookmark,
            timestamp: Date.now()
        });

        return bookmark;
    }

    removeBookmark(bookmarkId) {
        const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
        
        if (index === -1) {
            throw new Error('Bookmark not found');
        }

        const removedBookmark = this.bookmarks[index];
        this.bookmarks.splice(index, 1);
        this.saveBookmarks();

        // Emit success event
        this.emitBookmarkEvent('bookmarkRemoved', {
            bookmark: removedBookmark,
            timestamp: Date.now()
        });

        return removedBookmark;
    }

    updateBookmark(bookmarkId, updates) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        
        if (!bookmark) {
            throw new Error('Bookmark not found');
        }

        // Update bookmark
        const updatedBookmark = {
            ...bookmark,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
        this.bookmarks[index] = updatedBookmark;
        this.saveBookmarks();

        // Emit success event
        this.emitBookmarkEvent('bookmarkUpdated', {
            bookmark: updatedBookmark,
            timestamp: Date.now()
        });

        return updatedBookmark;
    }

    getBookmark(bookmarkId) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        
        if (!bookmark) {
            throw new Error('Bookmark not found');
        }

        return bookmark;
    }

    getBookmarksByArticle(articleId) {
        return this.bookmarks.filter(b => b.articleId === articleId);
    }

    getBookmarksByUser(userId = 'current-user') {
        return this.bookmarks.filter(b => b.userId === userId);
    }

    getBookmarksByCategory(category) {
        return this.bookmarks.filter(b => b.category === category);
    }

    getBookmarksByTag(tag) {
        return this.bookmarks.filter(b => b.tags && b.tags.includes(tag));
    }

    getFavoriteBookmarks() {
        return this.bookmarks.filter(b => b.isFavorite);
    }

    getReadLaterBookmarks() {
        return this.bookmarks.filter(b => b.readLater);
    }

    getRecentBookmarks(limit = 10) {
        return this.bookmarks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Category management
    addCategory(categoryName) {
        if (!categoryName || categoryName.trim() === '') {
            throw new Error('Category name cannot be empty');
        }

        if (this.categories.includes(categoryName)) {
            throw new Error('Category already exists');
        }

        this.categories.push(categoryName);
        this.saveBookmarks();

        this.emitBookmarkEvent('categoryAdded', {
            category: categoryName,
            timestamp: Date.now()
        });

        return categoryName;
    }

    removeCategory(categoryName) {
        const index = this.categories.indexOf(categoryName);
        
        if (index === -1) {
            throw new Error('Category not found');
        }

        // Move bookmarks from removed category to 'General'
        this.bookmarks.forEach(bookmark => {
            if (bookmark.category === categoryName) {
                bookmark.category = 'General';
                bookmark.updatedAt = new Date().toISOString();
            }
        });

        this.categories.splice(index, 1);
        this.saveBookmarks();

        this.emitBookmarkEvent('categoryRemoved', {
            category: categoryName,
            timestamp: Date.now()
        });

        return categoryName;
    }

    getCategories() {
        return [...this.categories];
    }

    getCategoryStats() {
        const stats = {};
        
        this.categories.forEach(category => {
            stats[category] = this.bookmarks.filter(b => b.category === category).length;
        });

        return stats;
    }

    // Search and filtering
    searchBookmarks(query, filters = {}) {
        let results = [...this.bookmarks];

        // Text search
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(bookmark => {
                const article = this.getArticleById(bookmark.articleId);
                if (!article) return false;

                return (
                    article.title.toLowerCase().includes(searchTerm) ||
                    article.content.toLowerCase().includes(searchTerm) ||
                    bookmark.notes.toLowerCase().includes(searchTerm) ||
                    (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
            });
        }

        // Category filter
        if (filters.category) {
            results = results.filter(b => b.category === filters.category);
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(b => 
                b.tags && filters.tags.some(tag => b.tags.includes(tag))
            );
        }

        // Favorite filter
        if (filters.isFavorite !== undefined) {
            results = results.filter(b => b.isFavorite === filters.isFavorite);
        }

        // Read later filter
        if (filters.readLater !== undefined) {
            results = results.filter(b => b.readLater === filters.readLater);
        }

        // Priority filter
        if (filters.priority) {
            results = results.filter(b => b.priority === filters.priority);
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            results = results.filter(b => new Date(b.createdAt) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            results = results.filter(b => new Date(b.createdAt) <= toDate);
        }

        // Sort results
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';

        results.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return results;
    }

    // Export/Import functionality
    exportBookmarks(format = 'json') {
        const exportData = {
            bookmarks: this.bookmarks,
            categories: this.categories,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                totalBookmarks: this.bookmarks.length
            }
        };

        let content;
        let filename;
        let mimeType;

        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                filename = `bookmarks-${this.getTimestamp()}.json`;
                mimeType = 'application/json';
                break;
                
            case 'csv':
                content = this.exportToCSV();
                filename = `bookmarks-${this.getTimestamp()}.csv`;
                mimeType = 'text/csv';
                break;
                
            case 'html':
                content = this.exportToHTML();
                filename = `bookmarks-${this.getTimestamp()}.html`;
                mimeType = 'text/html';
                break;
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        this.downloadFile(content, filename, mimeType);

        this.emitBookmarkEvent('bookmarksExported', {
            format,
            filename,
            count: this.bookmarks.length,
            timestamp: Date.now()
        });
    }

    exportToCSV() {
        let csv = 'ID,Article ID,Title,Category,Notes,Tags,Is Favorite,Read Later,Created At\n';
        
        this.bookmarks.forEach(bookmark => {
            const article = this.getArticleById(bookmark.articleId);
            const title = article ? this.escapeCSV(article.title) : '';
            const notes = this.escapeCSV(bookmark.notes);
            const tags = bookmark.tags ? this.escapeCSV(bookmark.tags.join(';')) : '';
            
            csv += `${bookmark.id},${bookmark.articleId},${title},${bookmark.category},${notes},${tags},${bookmark.isFavorite},${bookmark.readLater},${bookmark.createdAt}\n`;
        });

        return csv;
    }

    exportToHTML() {
        let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
        html += '<meta charset="UTF-8">\n';
        html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
        html += '<title>Bookmarks Export</title>\n';
        html += '<style>\n';
        html += 'body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n';
        html += 'h1, h2 { color: #333; }\n';
        html += '.bookmark { border-bottom: 1px solid #ccc; padding: 20px 0; }\n';
        html += '.bookmark-title { font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em; }\n';
        html += '.bookmark-meta { color: #666; font-size: 0.9em; margin-bottom: 0.5em; }\n';
        html += '.bookmark-notes { color: #333; margin-bottom: 0.5em; }\n';
        html += '.bookmark-tags { margin-top: 0.5em; }\n';
        html += '.tag { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; margin-right: 5px; }\n';
        html += '.favorite { color: #ff6b6b; }\n';
        html += '.read-later { color: #4ecdc4; }\n';
        html += '</style>\n';
        html += '</head>\n<body>\n';
        html += '<h1>Bookmarks Export</h1>\n';
        html += `<p>Exported on: ${new Date().toLocaleDateString()}</p>\n`;

        // Group by category
        const groupedBookmarks = {};
        this.bookmarks.forEach(bookmark => {
            if (!groupedBookmarks[bookmark.category]) {
                groupedBookmarks[bookmark.category] = [];
            }
            groupedBookmarks[bookmark.category].push(bookmark);
        });

        Object.entries(groupedBookmarks).forEach(([category, bookmarks]) => {
            html += `<h2>${category}</h2>\n`;
            
            bookmarks.forEach(bookmark => {
                const article = this.getArticleById(bookmark.articleId);
                html += '<div class="bookmark">\n';
                
                if (article) {
                    html += `<div class="bookmark-title">${this.escapeHTML(article.title)}</div>\n`;
                    html += `<div class="bookmark-meta">Article ID: ${bookmark.articleId} | `;
                    html += `Created: ${new Date(bookmark.createdAt).toLocaleDateString()}</div>\n`;
                } else {
                    html += `<div class="bookmark-title">Article ID: ${bookmark.articleId}</div>\n`;
                    html += `<div class="bookmark-meta">Created: ${new Date(bookmark.createdAt).toLocaleDateString()}</div>\n`;
                }
                
                if (bookmark.notes) {
                    html += `<div class="bookmark-notes">${this.escapeHTML(bookmark.notes)}</div>\n`;
                }
                
                if (bookmark.tags && bookmark.tags.length > 0) {
                    html += '<div class="bookmark-tags">\n';
                    bookmark.tags.forEach(tag => {
                        html += `<span class="tag">${this.escapeHTML(tag)}</span>`;
                    });
                    html += '</div>\n';
                }
                
                if (bookmark.isFavorite) {
                    html += '<span class="favorite">⭐ Favorite</span>\n';
                }
                
                if (bookmark.readLater) {
                    html += '<span class="read-later">📖 Read Later</span>\n';
                }
                
                html += '</div>\n';
            });
        });

        html += '</body>\n</html>';
        return html;
    }

    async importBookmarks(file) {
        try {
            const content = await this.readFile(file);
            const data = JSON.parse(content);

            // Validate import data
            if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                throw new Error('Invalid bookmark data format');
            }

            // Import categories
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(category => {
                    if (!this.categories.includes(category)) {
                        this.categories.push(category);
                    }
                });
            }

            // Import bookmarks
            let importedCount = 0;
            let skippedCount = 0;

            data.bookmarks.forEach(bookmarkData => {
                try {
                    // Check if bookmark already exists
                    const existing = this.bookmarks.find(b => 
                        b.articleId === bookmarkData.articleId && b.userId === bookmarkData.userId
                    );

                    if (!existing) {
                        const bookmark = {
                            ...bookmarkData,
                            id: this.generateId(), // Generate new ID
                            createdAt: bookmarkData.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        this.bookmarks.push(bookmark);
                        importedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.warn('Failed to import bookmark:', error);
                    skippedCount++;
                }
            });

            this.saveBookmarks();

            this.emitBookmarkEvent('bookmarksImported', {
                importedCount,
                skippedCount,
                total: data.bookmarks.length,
                timestamp: Date.now()
            });

            return {
                importedCount,
                skippedCount,
                total: data.bookmarks.length
            };

        } catch (error) {
            console.error('Failed to import bookmarks:', error);
            throw error;
        }
    }

    // Statistics and analytics
    getBookmarkStats() {
        const stats = {
            totalBookmarks: this.bookmarks.length,
            categories: this.getCategoryStats(),
            tags: this.getTagStats(),
            favorites: this.bookmarks.filter(b => b.isFavorite).length,
            readLater: this.bookmarks.filter(b => b.readLater).length,
            recentActivity: this.getRecentActivity(),
            topCategories: this.getTopCategories(),
            topTags: this.getTopTags()
        };

        return stats;
    }

    getTagStats() {
        const tagCounts = {};
        
        this.bookmarks.forEach(bookmark => {
            if (bookmark.tags) {
                bookmark.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return tagCounts;
    }

    getRecentActivity() {
        const recentBookmarks = this.bookmarks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        return recentBookmarks.map(bookmark => ({
            id: bookmark.id,
            articleId: bookmark.articleId,
            action: 'bookmarked',
            timestamp: bookmark.createdAt
        }));
    }

    getTopCategories(limit = 5) {
        const categoryStats = this.getCategoryStats();
        
        return Object.entries(categoryStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([category, count]) => ({ category, count }));
    }

    getTopTags(limit = 10) {
        const tagStats = this.getTagStats();
        
        return Object.entries(tagStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }

    // Utility methods
    getArticleById(articleId) {
        // This would typically come from the article manager or state
        return window.state?.articles?.find(article => article.id === articleId);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            
            reader.readAsText(file);
        });
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    escapeCSV(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event handlers
    handleAddBookmark(detail) {
        try {
            const bookmark = this.addBookmark(detail.articleId, detail.options);
            
            this.emitBookmarkEvent('addBookmarkSuccess', {
                bookmark,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitBookmarkEvent('addBookmarkError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleRemoveBookmark(detail) {
        try {
            const bookmark = this.removeBookmark(detail.bookmarkId);
            
            this.emitBookmarkEvent('removeBookmarkSuccess', {
                bookmark,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitBookmarkEvent('removeBookmarkError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUpdateBookmark(detail) {
        try {
            const bookmark = this.updateBookmark(detail.bookmarkId, detail.updates);
            
            this.emitBookmarkEvent('updateBookmarkSuccess', {
                bookmark,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitBookmarkEvent('updateBookmarkError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleBookmarkSearch(detail) {
        const results = this.searchBookmarks(detail.query, detail.filters);
        
        this.emitBookmarkEvent('bookmarkSearchResults', {
            results,
            query: detail.query,
            filters: detail.filters,
            timestamp: Date.now()
        });
    }

    // Event emission
    emitBookmarkEvent(type, data) {
        const event = new CustomEvent('bookmarkManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getAllBookmarks() {
        return [...this.bookmarks];
    }

    getBookmarkCount() {
        return this.bookmarks.length;
    }

    isBookmarked(articleId, userId = 'current-user') {
        return this.bookmarks.some(b => b.articleId === articleId && b.userId === userId);
    }

    toggleFavorite(bookmarkId) {
        const bookmark = this.getBookmark(bookmarkId);
        return this.updateBookmark(bookmarkId, { isFavorite: !bookmark.isFavorite });
    }

    toggleReadLater(bookmarkId) {
        const bookmark = this.getBookmark(bookmarkId);
        return this.updateBookmark(bookmarkId, { readLater: !bookmark.readLater });
    }

    // Cleanup
    destroy() {
        // Save final state
        this.saveBookmarks();
        
        // Remove event listeners
        document.removeEventListener('addBookmark', this.handleAddBookmark);
        document.removeEventListener('removeBookmark', this.handleRemoveBookmark);
        document.removeEventListener('updateBookmark', this.handleUpdateBookmark);
        document.removeEventListener('searchBookmarks', this.handleBookmarkSearch);
    }
}

// Create singleton instance
export const bookmarkManager = new BookmarkManager();
