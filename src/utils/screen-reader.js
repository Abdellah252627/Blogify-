// Screen Reader Support System
export class ScreenReaderManager {
    constructor() {
        this.announcements = [];
        this.liveRegion = null;
        this.politeRegion = null;
        this.assertiveRegion = null;
        this.isScreenReaderActive = false;
        this.announcementQueue = [];
        this.isAnnouncing = false;
        this.init();
    }

    init() {
        this.createLiveRegions();
        this.detectScreenReader();
        this.setupEventListeners();
        this.setupAnnouncementSystem();
    }

    createLiveRegions() {
        // Create ARIA live regions for different types of announcements
        this.liveRegion = this.createLiveRegion('polite', 'screen-reader-live');
        this.politeRegion = this.createLiveRegion('polite', 'screen-reader-polite');
        this.assertiveRegion = this.createLiveRegion('assertive', 'screen-reader-assertive');
        
        document.body.appendChild(this.liveRegion);
        document.body.appendChild(this.politeRegion);
        document.body.appendChild(this.assertiveRegion);
    }

    createLiveRegion(politeness, id) {
        const region = document.createElement('div');
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.setAttribute('id', id);
        region.className = 'sr-only';
        region.style.position = 'absolute';
        region.style.left = '-10000px';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.overflow = 'hidden';
        return region;
    }

    detectScreenReader() {
        // Detect if screen reader is active
        this.isScreenReaderActive = this.checkScreenReaderActive();
        
        // Listen for screen reader state changes
        setInterval(() => {
            const wasActive = this.isScreenReaderActive;
            this.isScreenReaderActive = this.checkScreenReaderActive();
            
            if (wasActive !== this.isScreenReaderActive) {
                this.emitScreenReaderEvent('stateChanged', {
                    isActive: this.isScreenReaderActive,
                    timestamp: Date.now()
                });
            }
        }, 5000);
    }

    checkScreenReaderActive() {
        // Multiple detection methods
        return (
            // Check for screen reader software
            window.speechSynthesis !== undefined ||
            window.navigator.userAgent.match(/(JAWS|NVDA|VoiceOver|ChromeVox|ZoomText)/) ||
            
            // Check for reduced motion preference
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            
            // Check for high contrast preference
            window.matchMedia('(prefers-contrast: high)').matches ||
            
            // Check for screen reader specific CSS
            window.getComputedStyle(document.body).getPropertyValue('--sr-only') !== ''
        );
    }

    setupEventListeners() {
        // Listen for focus changes
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
        
        // Listen for content changes
        document.addEventListener('DOMNodeInserted', this.handleContentChange.bind(this));
        document.addEventListener('DOMCharacterDataModified', this.handleContentChange.bind(this));
        
        // Listen for ARIA attribute changes
        document.addEventListener('DOMAttrModified', this.handleAttributeChange.bind(this));
        
        // Listen for keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        // Listen for custom screen reader events
        document.addEventListener('screenReaderAnnounce', this.handleCustomAnnouncement.bind(this));
        document.addEventListener('screenReaderFocus', this.handleCustomFocus.bind(this));
        document.addEventListener('screenReaderDescribe', this.handleCustomDescription.bind(this));
    }

    setupAnnouncementSystem() {
        // Process announcement queue
        setInterval(() => {
            this.processAnnouncementQueue();
        }, 100);
    }

    handleFocusIn(e) {
        const element = e.target;
        
        // Announce focus change
        this.announceElementFocus(element);
        
        // Update ARIA attributes
        this.updateElementAccessibility(element);
        
        // Emit focus event
        this.emitScreenReaderEvent('focus', {
            element: element,
            timestamp: Date.now()
        });
    }

    handleFocusOut(e) {
        const element = e.target;
        
        // Emit blur event
        this.emitScreenReaderEvent('blur', {
            element: element,
            timestamp: Date.now()
        });
    }

    handleContentChange(e) {
        // Announce important content changes
        if (this.isImportantContentChange(e.target)) {
            this.announceContentChange(e.target);
        }
    }

    handleAttributeChange(e) {
        // Handle ARIA attribute changes
        if (e.attrName.startsWith('aria-')) {
            this.announceAttributeChange(e.target, e.attrName, e.prevValue, e.newValue);
        }
    }

    handleKeyboardNavigation(e) {
        // Handle keyboard navigation patterns
        if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
            this.announceNavigationAction(e);
        }
    }

    handleCustomAnnouncement(e) {
        const { message, priority = 'polite', timeout = 0 } = e.detail;
        this.announce(message, priority, timeout);
    }

    handleCustomFocus(e) {
        const { element, message } = e.detail;
        this.announceElementFocus(element, message);
        this.focusElement(element);
    }

    handleCustomDescription(e) {
        const { element, description } = e.detail;
        this.describeElement(element, description);
    }

    // Announcement methods
    announce(message, priority = 'polite', timeout = 0) {
        const announcement = {
            message,
            priority,
            timeout,
            timestamp: Date.now()
        };
        
        if (timeout > 0) {
            announcement.timeoutId = setTimeout(() => {
                this.makeAnnouncement(announcement);
            }, timeout);
        } else {
            this.announcementQueue.push(announcement);
        }
    }

    announcePolite(message, timeout = 0) {
        this.announce(message, 'polite', timeout);
    }

    announceAssertive(message, timeout = 0) {
        this.announce(message, 'assertive', timeout);
    }

    makeAnnouncement(announcement) {
        if (this.isAnnouncing) {
            return;
        }
        
        this.isAnnouncing = true;
        
        const region = this.getRegionForPriority(announcement.priority);
        if (region) {
            region.textContent = announcement.message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
                this.isAnnouncing = false;
            }, 100);
        }
    }

    processAnnouncementQueue() {
        if (this.announcementQueue.length === 0 || this.isAnnouncing) {
            return;
        }
        
        const announcement = this.announcementQueue.shift();
        this.makeAnnouncement(announcement);
    }

    getRegionForPriority(priority) {
        switch (priority) {
            case 'assertive':
                return this.assertiveRegion;
            case 'polite':
            default:
                return this.politeRegion;
        }
    }

    announceElementFocus(element, customMessage = null) {
        let message = customMessage;
        
        if (!message) {
            message = this.getElementDescription(element);
        }
        
        if (message) {
            this.announcePolite(`Focused: ${message}`);
        }
    }

    announceContentChange(element) {
        const message = this.getContentChangeMessage(element);
        if (message) {
            this.announcePolite(message);
        }
    }

    announceAttributeChange(element, attributeName, oldValue, newValue) {
        const message = this.getAttributeChangeMessage(element, attributeName, oldValue, newValue);
        if (message) {
            this.announcePolite(message);
        }
    }

    announceNavigationAction(e) {
        const message = this.getNavigationActionMessage(e);
        if (message) {
            this.announcePolite(message);
        }
    }

    // Element description methods
    getElementDescription(element) {
        // Priority order for element description
        const description = (
            this.getAriaLabel(element) ||
            this.getAriaLabelledBy(element) ||
            this.getTitle(element) ||
            this.getAltText(element) ||
            this.getPlaceholder(element) ||
            this.getRoleBasedDescription(element) ||
            this.getContentBasedDescription(element)
        );
        
        return description;
    }

    getAriaLabel(element) {
        return element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
    }

    getAriaLabelledBy(element) {
        const labelledById = element.getAttribute('aria-labelledby');
        if (labelledById) {
            const labelElement = document.getElementById(labelledById);
            return labelElement ? labelElement.textContent : null;
        }
        return null;
    }

    getTitle(element) {
        return element.getAttribute('title');
    }

    getAltText(element) {
        return element.getAttribute('alt');
    }

    getPlaceholder(element) {
        return element.getAttribute('placeholder');
    }

    getRoleBasedDescription(element) {
        const role = element.getAttribute('role') || this.inferRole(element);
        const tagName = element.tagName.toLowerCase();
        
        const roleDescriptions = {
            'button': 'Button',
            'link': 'Link',
            'heading': 'Heading',
            'navigation': 'Navigation',
            'main': 'Main content',
            'search': 'Search',
            'complementary': 'Complementary content',
            'contentinfo': 'Content information',
            'banner': 'Banner',
            'form': 'Form',
            'table': 'Table',
            'list': 'List',
            'listitem': 'List item',
            'checkbox': 'Checkbox',
            'radio': 'Radio button',
            'textbox': 'Text input',
            'combobox': 'Combo box',
            'slider': 'Slider',
            'progressbar': 'Progress bar',
            'dialog': 'Dialog',
            'alert': 'Alert',
            'log': 'Log',
            'marquee': 'Marquee',
            'timer': 'Timer',
            'tooltip': 'Tooltip'
        };
        
        return roleDescriptions[role] || roleDescriptions[tagName] || '';
    }

    getContentBasedDescription(element) {
        const text = element.textContent || element.innerText || '';
        return text.trim().substring(0, 100);
    }

    inferRole(element) {
        const tagName = element.tagName.toLowerCase();
        
        const roleMap = {
            'a': 'link',
            'button': 'button',
            'input': 'textbox',
            'textarea': 'textbox',
            'select': 'combobox',
            'h1': 'heading',
            'h2': 'heading',
            'h3': 'heading',
            'h4': 'heading',
            'h5': 'heading',
            'h6': 'heading',
            'nav': 'navigation',
            'main': 'main',
            'aside': 'complementary',
            'header': 'banner',
            'footer': 'contentinfo',
            'section': 'region',
            'article': 'article',
            'ul': 'list',
            'ol': 'list',
            'li': 'listitem',
            'table': 'table',
            'tr': 'row',
            'td': 'cell',
            'th': 'columnheader',
            'img': 'img',
            'progress': 'progressbar',
            'dialog': 'dialog',
            'alert': 'alert'
        };
        
        return roleMap[tagName] || '';
    }

    // Content change detection
    isImportantContentChange(element) {
        const importantSelectors = [
            '[role="alert"]',
            '[role="status"]',
            '[role="log"]',
            '.error-message',
            '.success-message',
            '.notification',
            '.toast'
        ];
        
        return importantSelectors.some(selector => {
            try {
                return element.matches(selector) || element.closest(selector);
            } catch (e) {
                return false;
            }
        });
    }

    getContentChangeMessage(element) {
        const role = element.getAttribute('role') || this.inferRole(element);
        const text = element.textContent || element.innerText || '';
        
        const messages = {
            'alert': `Alert: ${text}`,
            'status': `Status: ${text}`,
            'log': `Log: ${text}`,
            'error': `Error: ${text}`,
            'success': `Success: ${text}`,
            'notification': `Notification: ${text}`,
            'toast': `Toast: ${text}`
        };
        
        return messages[role] || `Content changed: ${text}`;
    }

    getAttributeChangeMessage(element, attributeName, oldValue, newValue) {
        if (attributeName === 'aria-expanded') {
            const isExpanded = newValue === 'true';
            return isExpanded ? 'Expanded' : 'Collapsed';
        }
        
        if (attributeName === 'aria-selected') {
            const isSelected = newValue === 'true';
            return isSelected ? 'Selected' : 'Deselected';
        }
        
        if (attributeName === 'aria-disabled') {
            const isDisabled = newValue === 'true';
            return isDisabled ? 'Disabled' : 'Enabled';
        }
        
        return null;
    }

    getNavigationActionMessage(e) {
        if (e.key === 'Tab') {
            return e.shiftKey ? 'Previous focusable element' : 'Next focusable element';
        }
        
        if (e.key === 'Enter') {
            return 'Activated';
        }
        
        if (e.key === ' ') {
            return 'Selected';
        }
        
        return null;
    }

    // Accessibility enhancement methods
    updateElementAccessibility(element) {
        // Add missing ARIA attributes
        this.addMissingAriaAttributes(element);
        
        // Improve keyboard accessibility
        this.improveKeyboardAccessibility(element);
        
        // Add focus management
        this.improveFocusManagement(element);
    }

    addMissingAriaAttributes(element) {
        const tagName = element.tagName.toLowerCase();
        
        // Add missing roles
        if (!element.getAttribute('role') && this.shouldHaveRole(element)) {
            const role = this.inferRole(element);
            if (role) {
                element.setAttribute('role', role);
            }
        }
        
        // Add missing labels
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby') && this.shouldHaveLabel(element)) {
            const label = this.generateLabel(element);
            if (label) {
                element.setAttribute('aria-label', label);
            }
        }
        
        // Add missing descriptions
        if (!element.getAttribute('aria-describedby') && this.shouldHaveDescription(element)) {
            const description = this.generateDescription(element);
            if (description) {
                element.setAttribute('aria-describedby', description);
            }
        }
    }

    shouldHaveRole(element) {
        const tagName = element.tagName.toLowerCase();
        const hasImplicitRole = ['a', 'button', 'input', 'textarea', 'select'].includes(tagName);
        return !hasImplicitRole;
    }

    shouldHaveLabel(element) {
        const tagName = element.tagName.toLowerCase();
        const needsLabel = ['input', 'textarea', 'select', 'button'].includes(tagName);
        return needsLabel && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby');
    }

    shouldHaveDescription(element) {
        const tagName = element.tagName.toLowerCase();
        const needsDescription = ['img', 'canvas', 'svg', 'iframe'].includes(tagName);
        return needsDescription && !element.getAttribute('aria-describedby');
    }

    generateLabel(element) {
        const tagName = element.tagName.toLowerCase();
        const type = element.getAttribute('type');
        
        if (tagName === 'input') {
            if (type === 'submit' || type === 'button') {
                return element.getAttribute('value') || 'Submit';
            }
            if (element.getAttribute('placeholder')) {
                return element.getAttribute('placeholder');
            }
            if (element.getAttribute('name')) {
                return element.getAttribute('name');
            }
        }
        
        return null;
    }

    generateDescription(element) {
        const tagName = element.tagName.toLowerCase();
        const alt = element.getAttribute('alt');
        const title = element.getAttribute('title');
        
        if (tagName === 'img' && alt) {
            return alt;
        }
        
        if (title) {
            return title;
        }
        
        return null;
    }

    improveKeyboardAccessibility(element) {
        const tagName = element.tagName.toLowerCase();
        
        // Add keyboard support for custom elements
        if (tagName === 'div' && element.getAttribute('role') === 'button') {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', 'button');
        }
        
        // Add keyboard navigation for dropdowns
        if (tagName === 'div' && element.classList.contains('dropdown')) {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', 'combobox');
            element.setAttribute('aria-expanded', 'false');
            element.setAttribute('aria-haspopup', 'listbox');
        }
    }

    improveFocusManagement(element) {
        // Add focus indicators
        if (!element.hasAttribute('data-focus-added')) {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
            
            element.setAttribute('data-focus-added', 'true');
        }
    }

    // Focus management
    focusElement(element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
            
            // Scroll into view if needed
            if (!this.isElementInViewport(element)) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }

    // Screen reader utilities
    describeElement(element, description) {
        // Create or update description
        let descriptionId = element.getAttribute('aria-describedby');
        
        if (!descriptionId) {
            descriptionId = `sr-desc-${Date.now()}`;
            element.setAttribute('aria-describedby', descriptionId);
        }
        
        let descriptionElement = document.getElementById(descriptionId);
        if (!descriptionElement) {
            descriptionElement = document.createElement('div');
            descriptionElement.setAttribute('id', descriptionId);
            descriptionElement.className = 'sr-only';
            descriptionElement.style.position = 'absolute';
            descriptionElement.style.left = '-10000px';
            descriptionElement.style.width = '1px';
            descriptionElement.style.height = '1px';
            descriptionElement.style.overflow = 'hidden';
            document.body.appendChild(descriptionElement);
        }
        
        descriptionElement.textContent = description;
    }

    // Event emission
    emitScreenReaderEvent(type, data) {
        const event = new CustomEvent('screenReader', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    isActive() {
        return this.isScreenReaderActive;
    }

    announceToScreenReader(message, priority = 'polite') {
        this.announce(message, priority);
    }

    announceError(message) {
        this.announceAssertive(`Error: ${message}`);
    }

    announceSuccess(message) {
        this.announcePolite(`Success: ${message}`);
    }

    announceWarning(message) {
        this.announcePolite(`Warning: ${message}`);
    }

    announceInfo(message) {
        this.announcePolite(`Info: ${message}`);
    }

    // Page structure announcements
    announcePageTitle(title) {
        this.announcePolite(`Page: ${title}`);
    }

    announceNavigation(target) {
        this.announcePolite(`Navigated to: ${target}`);
    }

    announceLoadingState(isLoading, message = 'Loading') {
        if (isLoading) {
            this.announcePolite(`${message} started`);
        } else {
            this.announcePolite(`${message} completed`);
        }
    }

    // Form announcements
    announceFormValidation(errors) {
        if (errors.length > 0) {
            const errorMessage = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}`;
            this.announceAssertive(errorMessage);
            
            // Announce each error
            errors.forEach((error, index) => {
                setTimeout(() => {
                    this.announcePolite(`Error ${index + 1}: ${error.message}`);
                }, 100 * (index + 1));
            });
        }
    }

    announceFormSubmission(success, message = '') {
        if (success) {
            this.announcePolite(`Form submitted successfully${message ? ': ' + message : ''}`);
        } else {
            this.announceAssertive(`Form submission failed${message ? ': ' + message : ''}`);
        }
    }

    // Content announcements
    announceContentUpdate(content, type = 'updated') {
        this.announcePolite(`Content ${type}: ${content}`);
    }

    announceSearchResults(count, query) {
        if (count === 0) {
            this.announcePolite(`No results found for: ${query}`);
        } else {
            this.announcePolite(`${count} result${count > 1 ? 's' : ''} found for: ${query}`);
        }
    }

    // Cleanup
    destroy() {
        // Remove live regions
        if (this.liveRegion) this.liveRegion.remove();
        if (this.politeRegion) this.politeRegion.remove();
        if (this.assertiveRegion) this.assertiveRegion.remove();
        
        // Clear announcements
        this.announcementQueue = [];
        this.isAnnouncing = false;
        
        // Remove event listeners
        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);
        document.removeEventListener('DOMNodeInserted', this.handleContentChange);
        document.removeEventListener('DOMCharacterDataModified', this.handleContentChange);
        document.removeEventListener('DOMAttrModified', this.handleAttributeChange);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        document.removeEventListener('screenReaderAnnounce', this.handleCustomAnnouncement);
        document.removeEventListener('screenReaderFocus', this.handleCustomFocus);
        document.removeEventListener('screenReaderDescribe', this.handleCustomDescription);
    }
}

// Create singleton instance
export const screenReaderManager = new ScreenReaderManager();
