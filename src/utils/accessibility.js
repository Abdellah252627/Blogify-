// ARIA Labels and Semantic HTML System
export class AccessibilityManager {
    constructor() {
        this.semanticStructure = new Map();
        this.ariaLabels = new Map();
        this.focusableElements = new Set();
        this.skipLinks = [];
        this.breadcrumbs = [];
        this.landmarks = new Map();
        this.init();
    }

    init() {
        this.setupSemanticStructure();
        this.setupARIALabels();
        this.setupSkipLinks();
        this.setupBreadcrumbs();
        this.setupLandmarks();
        this.setupFocusManagement();
        this.setupKeyboardNavigation();
        this.setupColorContrast();
        this.setupReducedMotion();
    }

    setupSemanticStructure() {
        // Define semantic structure for the application
        this.semanticStructure.set('header', {
            selector: 'header, [role="banner"]',
            description: 'Main header with navigation'
        });
        
        this.semanticStructure.set('nav', {
            selector: 'nav, [role="navigation"]',
            description: 'Main navigation'
        });
        
        this.semanticStructure.set('main', {
            selector: 'main, [role="main"]',
            description: 'Main content area'
        });
        
        this.semanticStructure.set('aside', {
            selector: 'aside, [role="complementary"]',
            description: 'Complementary content'
        });
        
        this.semanticStructure.set('footer', {
            selector: 'footer, [role="contentinfo"]',
            description: 'Footer with site information'
        });
        
        this.semanticStructure.set('search', {
            selector: '[role="search"], .search-container',
            description: 'Search functionality'
        });
        
        this.semanticStructure.set('form', {
            selector: 'form, [role="form"]',
            description: 'Form elements'
        });
        
        this.semanticStructure.set('article', {
            selector: 'article, [role="article"]',
            description: 'Article content'
        });
        
        this.semanticStructure.set('section', {
            selector: 'section, [role="region"]',
            description: 'Content sections'
        });
    }

    setupARIALabels() {
        // Define common ARIA labels and patterns
        this.ariaLabels.set('navigation', {
            menu: 'Main navigation menu',
            submenu: 'Submenu',
            link: 'Navigation link',
            button: 'Navigation button',
            toggle: 'Toggle navigation'
        });
        
        this.ariaLabels.set('content', {
            article: 'Article',
            heading: 'Heading',
            paragraph: 'Paragraph',
            list: 'List',
            listitem: 'List item',
            link: 'Link',
            button: 'Button',
            form: 'Form',
            input: 'Input field',
            label: 'Label',
            error: 'Error message',
            success: 'Success message',
            warning: 'Warning message',
            info: 'Information message'
        });
        
        this.ariaLabels.set('interactive', {
            dialog: 'Dialog',
            modal: 'Modal window',
            tooltip: 'Tooltip',
            menu: 'Menu',
            combobox: 'Combo box',
            listbox: 'List box',
            tree: 'Tree view',
            grid: 'Grid',
            table: 'Table',
            tab: 'Tab',
            tablist: 'Tab list',
            progressbar: 'Progress bar',
            slider: 'Slider',
            spinner: 'Loading spinner',
            switch: 'Switch',
            checkbox: 'Checkbox',
            radio: 'Radio button',
            textbox: 'Text input',
            textarea: 'Text area',
            search: 'Search box',
            button: 'Button'
        });
        
        this.ariaLabels.set('media', {
            video: 'Video player',
            audio: 'Audio player',
            play: 'Play',
            pause: 'Pause',
            stop: 'Stop',
            mute: 'Mute',
            volume: 'Volume',
            seek: 'Seek',
            fullscreen: 'Fullscreen'
        });
    }

    setupSkipLinks() {
        // Create skip links for keyboard navigation
        this.createSkipLink('skip-to-main', 'Skip to main content', 'main');
        this.createSkipLink('skip-to-navigation', 'Skip to navigation', 'nav');
        this.createSkipLink('skip-to-search', 'Skip to search', '[role="search"]');
        this.createSkipLink('skip-to-footer', 'Skip to footer', 'footer');
    }

    createSkipLink(id, text, target) {
        const skipLink = document.createElement('a');
        skipLink.href = `#${target}`;
        skipLink.textContent = text;
        skipLink.id = id;
        skipLink.className = 'skip-link';
        skipLink.setAttribute('role', 'navigation');
        skipLink.setAttribute('aria-label', text);
        
        // Insert at the beginning of body
        if (document.body.firstChild) {
            document.body.insertBefore(skipLink, document.body.firstChild);
        } else {
            document.body.appendChild(skipLink);
        }
        
        this.skipLinks.push(skipLink);
    }

    setupBreadcrumbs() {
        // Create breadcrumb navigation
        const breadcrumbNav = document.createElement('nav');
        breadcrumbNav.setAttribute('aria-label', 'Breadcrumb navigation');
        breadcrumbNav.className = 'breadcrumb';
        
        const breadcrumbList = document.createElement('ol');
        breadcrumbList.setAttribute('role', 'list');
        breadcrumbList.className = 'breadcrumb-list';
        
        breadcrumbNav.appendChild(breadcrumbList);
        
        // Insert after header or at beginning of main
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        
        if (header) {
            header.parentNode.insertBefore(breadcrumbNav, header.nextSibling);
        } else if (main) {
            main.parentNode.insertBefore(breadcrumbNav, main);
        } else {
            document.body.insertBefore(breadcrumbNav, document.body.firstChild);
        }
    }

    setupLandmarks() {
        // Identify and enhance page landmarks
        this.identifyLandmarks();
        this.enhanceLandmarks();
    }

    identifyLandmarks() {
        const landmarkSelectors = [
            { selector: 'header, [role="banner"]', role: 'banner' },
            { selector: 'nav, [role="navigation"]', role: 'navigation' },
            { selector: 'main, [role="main"]', role: 'main' },
            { selector: 'aside, [role="complementary"]', role: 'complementary' },
            { selector: 'footer, [role="contentinfo"]', role: 'contentinfo' },
            { selector: 'section, [role="region"]', role: 'region' },
            { selector: 'form, [role="search"]', role: 'search' },
            { selector: 'article, [role="article"]', role: 'article' }
        ];
        
        landmarkSelectors.forEach(({ selector, role }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.getAttribute('role')) {
                    element.setAttribute('role', role);
                }
                
                // Add landmark label if missing
                if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                    const label = this.generateLandmarkLabel(element, role);
                    if (label) {
                        element.setAttribute('aria-label', label);
                    }
                }
                
                this.landmarks.set(role, element);
            });
        });
    }

    generateLandmarkLabel(element, role) {
        const roleLabels = {
            'banner': this.getPageTitle() || 'Site header',
            'navigation': 'Main navigation',
            'main': 'Main content',
            'complementary': 'Complementary content',
            'contentinfo': 'Site information',
            'region': this.getRegionLabel(element),
            'search': 'Search',
            'article': this.getArticleTitle(element)
        };
        
        return roleLabels[role];
    }

    getPageTitle() {
        const titleElement = document.querySelector('title');
        return titleElement ? titleElement.textContent : '';
    }

    getRegionLabel(element) {
        // Try to get label from heading
        const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
            return heading.textContent;
        }
        
        // Try to get label from aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
            return ariaLabel;
        }
        
        // Try to get label from id
        const id = element.getAttribute('id');
        if (id) {
            return id.replace(/-/g, ' ').replace(/_/g, ' ');
        }
        
        return 'Content region';
    }

    getArticleTitle(element) {
        // Try to get title from heading
        const heading = element.querySelector('h1, h2');
        if (heading) {
            return heading.textContent;
        }
        
        // Try to get title from title attribute
        const title = element.getAttribute('title');
        if (title) {
            return title;
        }
        
        return 'Article';
    }

    enhanceLandmarks() {
        // Add navigation between landmarks
        this.addLandmarkNavigation();
        
        // Add landmark announcements
        this.addLandmarkAnnouncements();
    }

    addLandmarkNavigation() {
        // Create landmark navigation menu
        const landmarkNav = document.createElement('nav');
        landmarkNav.setAttribute('aria-label', 'Page landmarks');
        landmarkNav.className = 'landmark-navigation';
        landmarkNav.innerHTML = `
            <h3>Page Landmarks</h3>
            <ul role="list">
                <li><a href="#banner" role="link">Header</a></li>
                <li><a href="#navigation" role="link">Navigation</a></li>
                <li><a href="#main" role="link">Main content</a></li>
                <li><a href="#complementary" role="link">Complementary</a></li>
                <li><a href="#contentinfo" role="link">Footer</a></li>
            </ul>
        `;
        
        // Add to page
        document.body.appendChild(landmarkNav);
    }

    addLandmarkAnnouncements() {
        // Announce when entering landmarks
        const landmarkElements = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
        
        landmarkElements.forEach(element => {
            element.addEventListener('focus', () => {
                const role = element.getAttribute('role');
                const label = element.getAttribute('aria-label') || role;
                this.announceLandmark(`Entered ${label}`);
            });
        });
    }

    setupFocusManagement() {
        // Improve focus management
        this.addFocusIndicators();
        this.addFocusTrapping();
        this.addFocusRestoration();
        this.addSkipToContent();
    }

    addFocusIndicators() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            /* Focus indicators */
            :focus {
                outline: 2px solid var(--primary);
                outline-offset: 2px;
            }
            
            /* High contrast focus */
            @media (prefers-contrast: high) {
                :focus {
                    outline: 3px solid #000;
                    background: #fff;
                    color: #000;
                }
            }
            
            /* Skip links focus */
            .skip-link:focus {
                position: absolute;
                top: 10px;
                left: 10px;
                background: var(--primary);
                color: var(--primary-foreground);
                padding: 0.5rem 1rem;
                text-decoration: none;
                border-radius: var(--radius);
                z-index: 10000;
            }
            
            /* Landmark navigation focus */
            .landmark-navigation a:focus {
                background: var(--accent);
                color: var(--foreground);
                outline: 2px solid var(--primary);
            }
        `;
        document.head.appendChild(style);
    }

    addFocusTrapping() {
        // Trap focus within modals and dialogs
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    addFocusRestoration() {
        // Save and restore focus
        let lastFocusedElement = null;
        
        document.addEventListener('focusin', (e) => {
            lastFocusedElement = e.target;
        });
        
        document.addEventListener('focusout', (e) => {
            lastFocusedElement = e.target;
        });
        
        // Restore focus when modal closes
        document.addEventListener('modalClose', () => {
            if (lastFocusedElement) {
                setTimeout(() => {
                    lastFocusedElement.focus();
                }, 100);
            }
        });
    }

    addSkipToContent() {
        // Already handled in setupSkipLinks
    }

    setupKeyboardNavigation() {
        // Enhance keyboard navigation
        this.addArrowKeyNavigation();
        this.addHomeEndNavigation();
        this.addPageUpDownNavigation();
        this.addEscapeKeyHandling();
    }

    addArrowKeyNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const container = document.activeElement?.closest('.dropdown, .menu, [role="listbox"], [role="tree"]');
                if (container) {
                    this.navigateWithArrows(e, container);
                }
            }
        });
    }

    addHomeEndNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Home' || e.key === 'End') {
                const container = document.activeElement?.closest('input[type="text"], textarea, [role="listbox"], [role="tree"]');
                if (container) {
                    if (e.key === 'Home') {
                        container.setSelectionRange(0, 0);
                    } else {
                        const length = container.value?.length || container.textContent?.length || 0;
                        container.setSelectionRange(length, length);
                    }
                    e.preventDefault();
                }
            }
        });
    }

    addPageUpDownNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PageUp' || e.key === 'PageDown') {
                const container = document.activeElement?.closest('[role="listbox"], [role="tree"]');
                if (container) {
                    this.navigateWithPageKeys(e, container);
                }
            }
        });
    }

    addEscapeKeyHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modals, dropdowns, etc.
                const modal = document.querySelector('.modal.show, [role="dialog"]');
                if (modal) {
                    const closeEvent = new CustomEvent('modalClose');
                    modal.dispatchEvent(closeEvent);
                }
                
                const dropdown = document.querySelector('.dropdown.show');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }

    navigateWithArrows(e, container) {
        const items = container.querySelectorAll('li, option, [role="option"], [role="treeitem"]');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
        
        let newIndex;
        if (e.key === 'ArrowDown') {
            newIndex = (currentIndex + 1) % items.length;
        } else {
            newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        }
        
        if (items[newIndex]) {
            items[newIndex].focus();
            e.preventDefault();
        }
    }

    navigateWithPageKeys(e, container) {
        // Implementation depends on specific container type
        // This is a placeholder for page up/down navigation
    }

    setupColorContrast() {
        // Detect and handle high contrast preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addListener((e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    setupReducedMotion() {
        // Detect and handle reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    // Public API methods
    addSemanticRole(element, role, label = null) {
        element.setAttribute('role', role);
        if (label) {
            element.setAttribute('aria-label', label);
        }
    }

    addARIALabel(element, label) {
        element.setAttribute('aria-label', label);
    }

    addARIAProperty(element, property, value) {
        element.setAttribute(`aria-${property}`, value);
    }

    removeARIAProperty(element, property) {
        element.removeAttribute(`aria-${property}`);
    }

    addFocusableElement(element) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        this.focusableElements.add(element);
    }

    removeFocusableElement(element) {
        element.removeAttribute('tabindex');
        this.focusableElements.delete(element);
    }

    announceToScreenReader(message, priority = 'polite') {
        const event = new CustomEvent('screenReaderAnnounce', {
            detail: { message, priority }
        });
        document.dispatchEvent(event);
    }

    updateBreadcrumbs(crumbs) {
        const breadcrumbList = document.querySelector('.breadcrumb-list');
        if (breadcrumbList) {
            breadcrumbList.innerHTML = crumbs.map((crumb, index) => `
                <li role="listitem">
                    ${index < crumbs.length - 1 ? 
                        `<a href="${crumb.url}" role="link">${crumb.label}</a>` : 
                        `<span>${crumb.label}</span>`
                    }
                </li>
            `).join('');
        }
    }

    addLandmark(role, element) {
        element.setAttribute('role', role);
        this.landmarks.set(role, element);
    }

    getLandmarks() {
        return Array.from(this.landmarks.entries()).map(([role, element]) => ({
            role,
            element,
            label: element.getAttribute('aria-label') || role
        }));
    }

    validateAccessibility() {
        const issues = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            issues.push({
                type: 'missing-alt',
                element: img,
                message: 'Image missing alt text',
                severity: 'error'
            });
        });
        
        // Check for missing labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([placeholder])');
        inputs.forEach(input => {
            issues.push({
                type: 'missing-label',
                element: input,
                message: 'Input missing label',
                severity: 'error'
            });
        });
        
        // Check for missing roles
        const landmarks = document.querySelectorAll('header:not([role]), nav:not([role]), main:not([role]), aside:not([role]), footer:not([role])');
        landmarks.forEach(element => {
            issues.push({
                type: 'missing-role',
                element: element,
                message: `${element.tagName} missing role attribute`,
                severity: 'warning'
            });
        });
        
        return issues;
    }

    generateAccessibilityReport() {
        const issues = this.validateAccessibility();
        const report = {
            timestamp: Date.now(),
            totalIssues: issues.length,
            errors: issues.filter(issue => issue.severity === 'error').length,
            warnings: issues.filter(issue => issue.severity === 'warning').length,
            issues: issues,
            score: this.calculateAccessibilityScore(issues)
        };
        
        return report;
    }

    calculateAccessibilityScore(issues) {
        const errorWeight = 10;
        const warningWeight = 3;
        
        let score = 100;
        issues.forEach(issue => {
            if (issue.severity === 'error') {
                score -= errorWeight;
            } else if (issue.severity === 'warning') {
                score -= warningWeight;
            }
        });
        
        return Math.max(0, score);
    }

    // Utility methods
    announceLandmark(message) {
        this.announceToScreenReader(message, 'polite');
    }

    createAccessibleButton(text, onClick, options = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', text);
        
        if (options.description) {
            button.setAttribute('aria-describedby', options.description);
        }
        
        if (options.expanded) {
            button.setAttribute('aria-expanded', options.expanded);
        }
        
        if (options.controls) {
            button.setAttribute('aria-controls', options.controls);
        }
        
        button.addEventListener('click', onClick);
        return button;
    }

    createAccessibleLink(text, href, options = {}) {
        const link = document.createElement('a');
        link.textContent = text;
        link.href = href;
        link.setAttribute('role', 'link');
        
        if (options.description) {
            link.setAttribute('aria-describedby', options.description);
        }
        
        if (options.current) {
            link.setAttribute('aria-current', options.current);
        }
        
        return link;
    }

    // Cleanup
    destroy() {
        // Remove skip links
        this.skipLinks.forEach(link => link.remove());
        this.skipLinks = [];
        
        // Remove landmark navigation
        const landmarkNav = document.querySelector('.landmark-navigation');
        if (landmarkNav) landmarkNav.remove();
        
        // Clear data structures
        this.semanticStructure.clear();
        this.ariaLabels.clear();
        this.focusableElements.clear();
        this.landmarks.clear();
        this.breadcrumbs = [];
    }
}

// Create singleton instance
export const accessibilityManager = new AccessibilityManager();
