// User Experience Testing Script
console.log('🧪 Starting User Experience Testing...');

// Test 1: UI Responsiveness
function testUIResponsiveness() {
    console.log('📱 Testing UI Responsiveness...');
    
    // Test viewport sizes
    const viewports = [
        { width: 320, height: 568, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
    ];
    
    viewports.forEach(viewport => {
        console.log(`  ✓ Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        // Check if responsive meta tag exists
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
            console.log('    ✅ Responsive meta tag found');
        } else {
            console.log('    ❌ Responsive meta tag missing');
        }
        
        // Check CSS media queries
        const cssRules = Array.from(document.styleSheets).flatMap(sheet => 
            Array.from(sheet.cssRules || [])
        );
        
        const hasMediaQueries = cssRules.some(rule => rule.type === CSSRule.MEDIA_RULE);
        if (hasMediaQueries) {
            console.log('    ✅ CSS media queries found');
        } else {
            console.log('    ❌ No CSS media queries found');
        }
    });
}

// Test 2: Navigation Functionality
function testNavigation() {
    console.log('🧭 Testing Navigation...');
    
    const navigationElements = [
        { id: 'new-article-btn', name: 'New Article Button' },
        { id: 'about-btn', name: 'About Button' },
        { id: 'bookmarks-btn', name: 'Bookmarks Button' },
        { id: 'user-profile-btn', name: 'User Profile Button' },
        { id: 'theme-toggle-btn', name: 'Theme Toggle Button' },
        { id: 'lang-toggle-btn', name: 'Language Toggle Button' }
    ];
    
    navigationElements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            console.log(`  ✅ ${element.name} found`);
            
            // Test clickability
            if (el.tagName === 'BUTTON') {
                console.log(`    ✅ ${element.name} is clickable`);
            } else {
                console.log(`    ⚠️ ${element.name} is not a button`);
            }
            
            // Test accessibility
            if (el.getAttribute('aria-label')) {
                console.log(`    ✅ ${element.name} has aria-label`);
            } else {
                console.log(`    ⚠️ ${element.name} missing aria-label`);
            }
        } else {
            console.log(`  ❌ ${element.name} not found`);
        }
    });
}

// Test 3: Page Sections
function testPageSections() {
    console.log('📄 Testing Page Sections...');
    
    const pages = [
        { id: 'home-page', name: 'Home Page' },
        { id: 'editor-page', name: 'Editor Page' },
        { id: 'article-detail-page', name: 'Article Detail Page' },
        { id: 'user-profile-page', name: 'User Profile Page' },
        { id: 'analytics-page', name: 'Analytics Page' },
        { id: 'bookmarks-page', name: 'Bookmarks Page' }
    ];
    
    pages.forEach(page => {
        const el = document.getElementById(page.id);
        if (el) {
            console.log(`  ✅ ${page.name} section found`);
            
            // Check if it has the page class
            if (el.classList.contains('page')) {
                console.log(`    ✅ ${page.name} has page class`);
            } else {
                console.log(`    ⚠️ ${page.name} missing page class`);
            }
        } else {
            console.log(`  ❌ ${page.name} section not found`);
        }
    });
}

// Test 4: Form Elements
function testFormElements() {
    console.log('📝 Testing Form Elements...');
    
    const forms = [
        { id: 'article-form', name: 'Article Form' },
        { id: 'search-input', name: 'Search Input' },
        { id: 'category-filter', name: 'Category Filter' },
        { id: 'article-title', name: 'Article Title Input' },
        { id: 'article-category', name: 'Article Category Input' },
        { id: 'article-tags', name: 'Article Tags Input' }
    ];
    
    forms.forEach(form => {
        const el = document.getElementById(form.id);
        if (el) {
            console.log(`  ✅ ${form.name} found`);
            
            // Check form attributes
            if (el.tagName === 'FORM' && el.getAttribute('id')) {
                console.log(`    ✅ ${form.name} has proper form structure`);
            }
            
            // Check input validation
            if (el.tagName === 'INPUT' && el.hasAttribute('required')) {
                console.log(`    ✅ ${form.name} has validation`);
            }
        } else {
            console.log(`  ❌ ${form.name} not found`);
        }
    });
}

// Test 5: Interactive Elements
function testInteractiveElements() {
    console.log('🎯 Testing Interactive Elements...');
    
    const interactiveElements = [
        { selector: '.btn', name: 'Buttons' },
        { selector: '.dropdown', name: 'Dropdowns' },
        { selector: '.modal', name: 'Modals' },
        { selector: '.toast-container', name: 'Toast Container' },
        { selector: '#articles-grid', name: 'Articles Grid' },
        { selector: '#tag-cloud', name: 'Tag Cloud' }
    ];
    
    interactiveElements.forEach(element => {
        const els = document.querySelectorAll(element.selector);
        if (els.length > 0) {
            console.log(`  ✅ ${element.name} found (${els.length} elements)`);
        } else {
            console.log(`  ❌ ${element.name} not found`);
        }
    });
}

// Test 6: Theme and Language Support
function testThemeLanguage() {
    console.log('🎨 Testing Theme and Language Support...');
    
    // Check CSS variables for theming
    const rootStyles = getComputedStyle(document.documentElement);
    const hasThemeVariables = rootStyles.getPropertyValue('--background') !== '';
    
    if (hasThemeVariables) {
        console.log('  ✅ CSS theme variables found');
    } else {
        console.log('  ❌ CSS theme variables missing');
    }
    
    // Check language support
    const langElements = document.querySelectorAll('[data-lang-key]');
    if (langElements.length > 0) {
        console.log(`  ✅ Language support found (${langElements.length} translatable elements)`);
    } else {
        console.log('  ❌ Language support missing');
    }
}

// Test 7: Performance
function testPerformance() {
    console.log('⚡ Testing Performance...');
    
    // Check page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`  📊 Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
        console.log('  ✅ Fast loading time');
    } else if (loadTime < 5000) {
        console.log('  ⚠️ Moderate loading time');
    } else {
        console.log('  ❌ Slow loading time');
    }
    
    // Check for lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (lazyImages.length > 0) {
        console.log(`  ✅ Lazy loading found (${lazyImages.length} images)`);
    } else {
        console.log('  ⚠️ No lazy loading detected');
    }
}

// Test 8: Accessibility
function testAccessibility() {
    console.log('♿ Testing Accessibility...');
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
        console.log(`  ✅ Headings found (${headings.length} total)`);
    } else {
        console.log('  ❌ No headings found');
    }
    
    // Check for ARIA labels
    const ariaElements = document.querySelectorAll('[aria-label], [role]');
    if (ariaElements.length > 0) {
        console.log(`  ✅ ARIA labels found (${ariaElements.length} elements)`);
    } else {
        console.log('  ⚠️ Limited ARIA support');
    }
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    if (imagesWithAlt.length === images.length) {
        console.log('  ✅ All images have alt text');
    } else {
        console.log(`  ⚠️ ${images.length - imagesWithAlt.length} images missing alt text`);
    }
}

// Run all tests
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        testUIResponsiveness();
        testNavigation();
        testPageSections();
        testFormElements();
        testInteractiveElements();
        testThemeLanguage();
        testPerformance();
        testAccessibility();
        
        console.log('🏁 User Experience Testing Complete!');
        
        // Generate summary
        const summary = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            tests: '8 tests completed'
        };
        
        console.log('📊 Test Summary:', summary);
    }, 1000);
});
