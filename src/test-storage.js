// Test Local Storage and Data Management
console.log('🧪 Testing Local Storage and Data Management...');

// Test 1: Local Storage Availability
try {
    const testKey = 'blogify_test';
    const testValue = { test: 'data', timestamp: Date.now() };
    
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);
    
    if (retrieved.test === 'data') {
        console.log('✅ Local Storage: Working correctly');
    } else {
        console.log('❌ Local Storage: Data corruption detected');
    }
} catch (error) {
    console.log('❌ Local Storage: Not available', error);
}

// Test 2: Data Manager Functions
try {
    // Import and test data manager
    import('./utils/data-manager.js').then(({ dataManager }) => {
        console.log('✅ Data Manager: Module loaded successfully');
        
        // Test article creation
        const testArticle = {
            title: 'Test Article',
            content: 'This is a test article for functionality verification.',
            category: 'test',
            tags: ['test', 'verification']
        };
        
        const saveResult = dataManager.saveArticle(testArticle);
        if (saveResult) {
            console.log('✅ Data Manager: Article saving works');
            
            // Test article retrieval
            const articles = dataManager.getAllArticles();
            if (articles.length > 0 && articles[0].title === 'Test Article') {
                console.log('✅ Data Manager: Article retrieval works');
            } else {
                console.log('❌ Data Manager: Article retrieval failed');
            }
            
            // Test search functionality
            const searchResults = dataManager.searchArticles('test');
            if (searchResults.length > 0) {
                console.log('✅ Data Manager: Search functionality works');
            } else {
                console.log('❌ Data Manager: Search functionality failed');
            }
            
            // Test bookmark functionality
            const bookmarkResult = dataManager.toggleBookmark(articles[0].id);
            if (bookmarkResult) {
                console.log('✅ Data Manager: Bookmark functionality works');
            } else {
                console.log('❌ Data Manager: Bookmark functionality failed');
            }
            
        } else {
            console.log('❌ Data Manager: Article saving failed');
        }
        
        // Test statistics
        const stats = dataManager.getStats();
        if (stats && typeof stats.totalArticles === 'number') {
            console.log('✅ Data Manager: Statistics generation works');
        } else {
            console.log('❌ Data Manager: Statistics generation failed');
        }
        
    }).catch(error => {
        console.log('❌ Data Manager: Module loading failed', error);
    });
} catch (error) {
    console.log('❌ Data Manager: Testing failed', error);
}

// Test 3: State Management
try {
    import('./utils/state.js').then(({ state, updateState }) => {
        console.log('✅ State Manager: Module loaded successfully');
        
        // Test state reading
        if (state && typeof state.theme === 'string') {
            console.log('✅ State Manager: State reading works');
        } else {
            console.log('❌ State Manager: State reading failed');
        }
        
        // Test state updating
        const originalTheme = state.theme;
        updateState('theme', 'dark');
        if (state.theme === 'dark') {
            console.log('✅ State Manager: State updating works');
            // Restore original theme
            updateState('theme', originalTheme);
        } else {
            console.log('❌ State Manager: State updating failed');
        }
        
    }).catch(error => {
        console.log('❌ State Manager: Module loading failed', error);
    });
} catch (error) {
    console.log('❌ State Manager: Testing failed', error);
}

// Test 4: Enhanced Storage
try {
    import('./utils/enhanced-storage.js').then(() => {
        console.log('✅ Enhanced Storage: Module loaded successfully');
    }).catch(error => {
        console.log('❌ Enhanced Storage: Module loading failed', error);
    });
} catch (error) {
    console.log('❌ Enhanced Storage: Testing failed', error);
}

console.log('🏁 Storage and Data Management Testing Complete!');
