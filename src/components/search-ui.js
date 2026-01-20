// Advanced Search UI Component with Real-time Features
import { searchManager } from '../utils/search-manager.js';

export class SearchUI {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showFilters: true,
            showSort: true,
            showHistory: true,
            showSuggestions: true,
            placeholder: 'Search articles...',
            debounceDelay: 300,
            ...options
        };
        this.isActive = false;
        this.currentResults = [];
        this.init();
    }

    init() {
        this.createSearchUI();
        this.setupEventListeners();
        this.setupSearchEvents();
    }

    createSearchUI() {
        this.container.innerHTML = `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <div class="search-input-container">
                        <input type="text" 
                               class="search-input" 
                               placeholder="${this.options.placeholder}"
                               autocomplete="off">
                        <button class="search-clear" title="Clear search" style="display: none;">✕</button>
                        <div class="search-spinner" style="display: none;">
                            <div class="spinner"></div>
                        </div>
                    </div>
                    
                    ${this.options.showSuggestions ? `
                        <div class="search-suggestions" style="display: none;">
                            <div class="suggestions-list"></div>
                        </div>
                    ` : ''}
                </div>
                
                ${this.options.showFilters ? `
                    <div class="search-filters">
                        <div class="filter-section">
                            <h4>Categories</h4>
                            <div class="category-filters"></div>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Tags</h4>
                            <div class="tag-filters"></div>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Date Range</h4>
                            <div class="date-filters">
                                <select class="date-range-select">
                                    <option value="">All time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="week">This week</option>
                                    <option value="month">This month</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button class="btn btn-sm btn-secondary clear-filters">Clear Filters</button>
                        </div>
                    </div>
                ` : ''}
                
                ${this.options.showSort ? `
                    <div class="search-sort">
                        <label for="sort-select">Sort by:</label>
                        <select id="sort-select" class="sort-select">
                            <option value="relevance:desc">Relevance</option>
                            <option value="date:desc">Newest First</option>
                            <option value="date:asc">Oldest First</option>
                            <option value="title:asc">Title A-Z</option>
                            <option value="title:desc">Title Z-A</option>
                            <option value="views:desc">Most Viewed</option>
                            <option value="readingTime:desc">Longest Read</option>
                        </select>
                    </div>
                ` : ''}
                
                ${this.options.showHistory ? `
                    <div class="search-history" style="display: none;">
                        <h4>Recent Searches</h4>
                        <div class="history-list"></div>
                        <button class="btn btn-sm btn-secondary clear-history">Clear History</button>
                    </div>
                ` : ''}
                
                <div class="search-results-info" style="display: none;">
                    <div class="results-count"></div>
                    <div class="search-time"></div>
                    <div class="active-filters"></div>
                </div>
            </div>
        `;

        // Get references
        this.searchInput = this.container.querySelector('.search-input');
        this.clearButton = this.container.querySelector('.search-clear');
        this.suggestionsContainer = this.container.querySelector('.search-suggestions');
        this.historyContainer = this.container.querySelector('.search-history');
        this.resultsInfo = this.container.querySelector('.search-results-info');
        this.spinner = this.container.querySelector('.search-spinner');
    }

    setupEventListeners() {
        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.handleInputChange(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            this.showSuggestions();
        });

        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.clearSearch();
        });

        // Sort select
        const sortSelect = this.container.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [field, direction] = e.target.value.split(':');
                searchManager.setSort(field, direction);
            });
        }

        // Filter events
        this.setupFilterListeners();

        // History events
        this.setupHistoryListeners();

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideSuggestions();
                this.hideHistory();
            }
        });
    }

    setupFilterListeners() {
        // Category filters
        const categoryContainer = this.container.querySelector('.category-filters');
        if (categoryContainer) {
            categoryContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('category-filter')) {
                    this.toggleCategoryFilter(e.target.dataset.category);
                }
            });
        }

        // Tag filters
        const tagContainer = this.container.querySelector('.tag-filters');
        if (tagContainer) {
            tagContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-filter')) {
                    this.toggleTagFilter(e.target.dataset.tag);
                }
            });
        }

        // Date range
        const dateSelect = this.container.querySelector('.date-range-select');
        if (dateSelect) {
            dateSelect.addEventListener('change', (e) => {
                this.setDateRangeFilter(e.target.value);
            });
        }

        // Clear filters
        const clearFiltersBtn = this.container.querySelector('.clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    setupHistoryListeners() {
        const historyList = this.container.querySelector('.history-list');
        if (historyList) {
            historyList.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-item')) {
                    this.searchInput.value = e.target.dataset.query;
                    this.handleInputChange(e.target.dataset.query);
                }
            });
        }

        const clearHistoryBtn = this.container.querySelector('.clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    }

    setupSearchEvents() {
        // Listen for search results
        document.addEventListener('searchResults', (e) => {
            this.handleSearchResults(e.detail);
        });
    }

    handleInputChange(query) {
        // Show/hide clear button
        this.clearButton.style.display = query.trim() ? 'block' : 'none';
        
        // Show spinner during search
        if (query.trim()) {
            this.showSpinner();
        } else {
            this.hideSpinner();
        }
        
        // Trigger search
        const event = new CustomEvent('searchQuery', {
            detail: { query, options: this.options }
        });
        document.dispatchEvent(event);
        
        // Update suggestions
        if (this.options.showSuggestions) {
            this.updateSuggestions(query);
        }
    }

    handleKeydown(e) {
        const suggestions = this.container.querySelectorAll('.suggestion-item');
        const currentIndex = Array.from(suggestions).findIndex(item => item.classList.contains('selected'));
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < suggestions.length - 1) {
                    if (currentIndex >= 0) {
                        suggestions[currentIndex].classList.remove('selected');
                    }
                    suggestions[currentIndex + 1].classList.add('selected');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    suggestions[currentIndex].classList.remove('selected');
                    suggestions[currentIndex - 1].classList.add('selected');
                }
                break;
            case 'Enter':
                e.preventDefault();
                const selected = this.container.querySelector('.suggestion-item.selected');
                if (selected) {
                    this.searchInput.value = selected.dataset.query;
                    this.handleInputChange(selected.dataset.query);
                    this.hideSuggestions();
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                this.hideHistory();
                this.searchInput.blur();
                break;
        }
    }

    handleSearchResults(detail) {
        const { results, metadata } = detail;
        this.currentResults = results;
        this.hideSpinner();
        
        // Update results info
        this.updateResultsInfo(metadata);
        
        // Update active filters display
        this.updateActiveFilters(metadata.filters);
        
        // Emit results event for other components
        const resultsEvent = new CustomEvent('searchResultsUpdated', {
            detail: { results, metadata }
        });
        document.dispatchEvent(resultsEvent);
    }

    updateSuggestions(query) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = searchManager.getSuggestions(query, 5);
        const suggestionsList = this.container.querySelector('.suggestions-list');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item ${index === 0 ? 'selected' : ''}" data-query="${suggestion}">
                <div class="suggestion-text">${this.highlightSuggestion(suggestion, query)}</div>
            </div>
        `).join('');
        
        this.showSuggestions();
    }

    highlightSuggestion(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showSuggestions() {
        if (this.options.showSuggestions && this.suggestionsContainer) {
            this.suggestionsContainer.style.display = 'block';
        }
    }

    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.style.display = 'none';
        }
    }

    showHistory() {
        if (this.options.showHistory && this.historyContainer) {
            const history = searchManager.getSearchHistory(5);
            const historyList = this.container.querySelector('.history-list');
            
            if (history.length === 0) {
                this.historyContainer.style.display = 'none';
                return;
            }
            
            historyList.innerHTML = history.map(item => `
                <div class="history-item" data-query="${item.query}">
                    <div class="history-query">${item.query}</div>
                    <div class="history-time">${this.formatTime(item.timestamp)}</div>
                </div>
            `).join('');
            
            this.historyContainer.style.display = 'block';
        }
    }

    hideHistory() {
        if (this.historyContainer) {
            this.historyContainer.style.display = 'none';
        }
    }

    showSpinner() {
        if (this.spinner) {
            this.spinner.style.display = 'block';
        }
    }

    hideSpinner() {
        if (this.spinner) {
            this.spinner.style.display = 'none';
        }
    }

    updateResultsInfo(metadata) {
        if (!this.resultsInfo) return;
        
        this.resultsInfo.style.display = 'block';
        
        const resultsCount = this.resultsInfo.querySelector('.results-count');
        const searchTime = this.resultsInfo.querySelector('.search-time');
        
        if (resultsCount) {
            resultsCount.textContent = `${metadata.totalResults} results`;
        }
        
        if (searchTime) {
            searchTime.textContent = `${metadata.searchTime.toFixed(2)}s`;
        }
    }

    updateActiveFilters(filters) {
        const activeFiltersContainer = this.container.querySelector('.active-filters');
        if (!activeFiltersContainer) return;
        
        const activeFilters = [];
        
        if (filters.categories.length > 0) {
            activeFilters.push(...filters.categories.map(cat => 
                `<span class="active-filter category-filter">${cat}</span>`
            ));
        }
        
        if (filters.tags.length > 0) {
            activeFilters.push(...filters.tags.map(tag => 
                `<span class="active-filter tag-filter">${tag}</span>`
            ));
        }
        
        if (filters.author) {
            activeFilters.push(`<span class="active-filter author-filter">${filters.author}</span>`);
        }
        
        if (filters.dateRange) {
            activeFilters.push(`<span class="active-filter date-filter">Date range</span>`);
        }
        
        activeFiltersContainer.innerHTML = activeFilters.length > 0 ? 
            `<div class="active-filters-list">${activeFilters.join('')}</div>` : '';
    }

    // Filter methods
    toggleCategoryFilter(category) {
        searchManager.addCategoryFilter(category);
        this.updateFilterUI();
    }

    toggleTagFilter(tag) {
        searchManager.addTagFilter(tag);
        this.updateFilterUI();
    }

    setDateRangeFilter(range) {
        if (range) {
            searchManager.setDateRangeFilter(range);
        } else {
            searchManager.setDateRangeFilter(null);
        }
        this.updateFilterUI();
    }

    clearAllFilters() {
        searchManager.clearFilters();
        this.updateFilterUI();
    }

    updateFilterUI() {
        const activeFilters = searchManager.getActiveFilters();
        
        // Update category filters
        const categoryContainer = this.container.querySelector('.category-filters');
        if (categoryContainer) {
            // This would be populated with available categories
            // For now, show active filters
            categoryContainer.innerHTML = activeFilters.categories.map(cat => 
                `<span class="filter-tag category-filter active" data-category="${cat}">${cat} ✕</span>`
            ).join('');
        }
        
        // Update tag filters
        const tagContainer = this.container.querySelector('.tag-filters');
        if (tagContainer) {
            tagContainer.innerHTML = activeFilters.tags.map(tag => 
                `<span class="filter-tag tag-filter active" data-tag="${tag}">${tag} ✕</span>`
            ).join('');
        }
        
        // Update date range select
        const dateSelect = this.container.querySelector('.date-range-select');
        if (dateSelect && activeFilters.dateRange) {
            // Set appropriate value based on date range
            // This would need more sophisticated logic
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.clearButton.style.display = 'none';
        this.hideSuggestions();
        this.handleInputChange('');
    }

    clearHistory() {
        searchManager.clearHistory();
        this.hideHistory();
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return 'Just now';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} min ago`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} hours ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Public methods
    focus() {
        this.searchInput.focus();
    }

    blur() {
        this.searchInput.blur();
    }

    getValue() {
        return this.searchInput.value;
    }

    setValue(value) {
        this.searchInput.value = value;
        this.handleInputChange(value);
    }

    getResults() {
        return this.currentResults;
    }

    isActive() {
        return this.isActive;
    }

    activate() {
        this.isActive = true;
        this.container.classList.add('active');
    }

    deactivate() {
        this.isActive = false;
        this.container.classList.remove('active');
        this.hideSuggestions();
        this.hideHistory();
    }

    // Static methods
    static create(container, options = {}) {
        return new SearchUI(container, options);
    }
}

// Create singleton instance for global use
export const searchUI = new SearchUI(document.createElement('div'));
