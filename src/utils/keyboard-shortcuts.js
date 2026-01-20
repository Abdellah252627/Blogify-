// Comprehensive Keyboard Shortcuts System
export class KeyboardShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.globalShortcuts = new Map();
        this.contextShortcuts = new Map();
        this.currentContext = 'global';
        this.isListening = false;
        this.helpModal = null;
        this.defaultShortcuts = {
            // Navigation
            'Ctrl+Home': { action: 'navigateHome', description: 'Navigate to Home' },
            'Ctrl+Shift+H': { action: 'navigateHome', description: 'Navigate to Home' },
            'Alt+H': { action: 'navigateHome', description: 'Navigate to Home' },
            
            'Ctrl+E': { action: 'navigateEditor', description: 'Navigate to Editor' },
            'Ctrl+Shift+E': { action: 'navigateEditor', description: 'Navigate to Editor' },
            'Alt+E': { action: 'navigateEditor', description: 'Navigate to Editor' },
            
            'Ctrl+Shift+B': { action: 'navigateBookmarks', description: 'Navigate to Bookmarks' },
            'Alt+B': { action: 'navigateBookmarks', description: 'Navigate to Bookmarks' },
            
            'Ctrl+Shift+A': { action: 'navigateAnalytics', description: 'Navigate to Analytics' },
            'Alt+A': { action: 'navigateAnalytics', description: 'Navigate to Analytics' },
            
            'Ctrl+Shift+T': { action: 'navigateTheme', description: 'Navigate to Theme Manager' },
            'Alt+T': { action: 'navigateTheme', description: 'Navigate to Theme Manager' },
            
            'Ctrl+Shift+P': { action: 'togglePerformance', description: 'Toggle Performance Stats' },
            'Alt+P': { action: 'togglePerformance', description: 'Toggle Performance Stats' },
            
            'Ctrl+Shift+C': { action: 'toggleCache', description: 'Toggle Cache Dashboard' },
            'Alt+C': { action: 'toggleCache', description: 'Toggle Cache Dashboard' },
            
            'Ctrl+Shift+S': { action: 'toggleStorage', description: 'Toggle Storage Dashboard' },
            'Alt+S': { action: 'toggleStorage', description: 'Toggle Storage Dashboard' },
            
            // Search
            'Ctrl+F': { action: 'focusSearch', description: 'Focus Search' },
            'Ctrl+K': { action: 'focusSearch', description: 'Focus Search' },
            'F3': { action: 'findNext', description: 'Find Next' },
            'Shift+F3': { action: 'findPrevious', description: 'Find Previous' },
            'Ctrl+Shift+F': { action: 'advancedSearch', description: 'Advanced Search' },
            
            // Article Management
            'Ctrl+N': { action: 'newArticle', description: 'New Article' },
            'Ctrl+Shift+N': { action: 'newArticle', description: 'New Article' },
            'Alt+N': { action: 'newArticle', description: 'New Article' },
            
            'Ctrl+S': { action: 'saveArticle', description: 'Save Article' },
            'Ctrl+Shift+S': { action: 'saveDraft', description: 'Save Draft' },
            'Alt+S': { action: 'saveDraft', description: 'Save Draft' },
            
            'Ctrl+O': { action: 'openArticle', description: 'Open Article' },
            'Ctrl+Shift+O': { action: 'importArticle', description: 'Import Article' },
            'Alt+O': { action: 'importArticle', description: 'Import Article' },
            
            'Ctrl+P': { action: 'printArticle', description: 'Print Article' },
            'Ctrl+Shift+P': { action: 'exportArticle', description: 'Export Article' },
            'Alt+P': { action: 'exportArticle', description: 'Export Article' },
            
            // Editor Shortcuts
            'Ctrl+B': { action: 'editorBold', description: 'Bold Text', context: 'editor' },
            'Ctrl+I': { action: 'editorItalic', description: 'Italic Text', context: 'editor' },
            'Ctrl+U': { action: 'editorUnderline', description: 'Underline Text', context: 'editor' },
            'Ctrl+Shift+S': { action: 'editorStrikethrough', description: 'Strikethrough Text', context: 'editor' },
            
            'Ctrl+L': { action: 'editorLink', description: 'Insert Link', context: 'editor' },
            'Ctrl+Shift+L': { action: 'editorImage', description: 'Insert Image', context: 'editor' },
            'Ctrl+K': { action: 'editorCode', description: 'Insert Code Block', context: 'editor' },
            
            'Ctrl+Z': { action: 'editorUndo', description: 'Undo', context: 'editor' },
            'Ctrl+Y': { action: 'editorRedo', description: 'Redo', context: 'editor' },
            'Ctrl+Shift+Z': { action: 'editorRedo', description: 'Redo', context: 'editor' },
            
            // List shortcuts
            'Ctrl+Shift+7': { action: 'editorOrderedList', description: 'Ordered List', context: 'editor' },
            'Ctrl+Shift+8': { action: 'editorUnorderedList', description: 'Unordered List', context: 'editor' },
            
            // Heading shortcuts
            'Ctrl+Alt+1': { action: 'editorHeading1', description: 'Heading 1', context: 'editor' },
            'Ctrl+Alt+2': { action: 'editorHeading2', description: 'Heading 2', context: 'editor' },
            'Ctrl+Alt+3': { action: 'editorHeading3', description: 'Heading 3', context: 'editor' },
            'Ctrl+Alt+4': { action: 'editorHeading4', description: 'Heading 4', context: 'editor' },
            'Ctrl+Alt+5': { action: 'editorHeading5', description: 'Heading 5', context: 'editor' },
            'Ctrl+Alt+6': { action: 'editorHeading6', description: 'Heading 6', context: 'editor' },
            
            // Theme & Accessibility
            'Ctrl+Shift+D': { action: 'toggleDarkMode', description: 'Toggle Dark Mode' },
            'Alt+D': { action: 'toggleDarkMode', description: 'Toggle Dark Mode' },
            
            'Ctrl+Shift+L': { action: 'increaseFontSize', description: 'Increase Font Size' },
            'Ctrl+Shift+M': { action: 'decreaseFontSize', description: 'Decrease Font Size' },
            'Ctrl+0': { action: 'resetFontSize', description: 'Reset Font Size' },
            
            'Ctrl+Shift+R': { action: 'toggleHighContrast', description: 'Toggle High Contrast' },
            'Alt+R': { action: 'toggleHighContrast', description: 'Toggle High Contrast' },
            
            // Utility
            'Ctrl+Shift+H': { action: 'showHelp', description: 'Show Keyboard Shortcuts' },
            'F1': { action: 'showHelp', description: 'Show Keyboard Shortcuts' },
            '?': { action: 'showHelp', description: 'Show Keyboard Shortcuts' },
            'Ctrl+/': { action: 'showHelp', description: 'Show Keyboard Shortcuts' },
            
            'Escape': { action: 'escape', description: 'Escape/Cancel' },
            'Enter': { action: 'confirm', description: 'Confirm/Submit' },
            'Space': { action: 'select', description: 'Select/Toggle' },
            
            'Tab': { action: 'nextFocus', description: 'Next Focusable Element' },
            'Shift+Tab': { action: 'previousFocus', description: 'Previous Focusable Element' },
            
            'ArrowUp': { action: 'navigateUp', description: 'Navigate Up' },
            'ArrowDown': { action: 'navigateDown', description: 'Navigate Down' },
            'ArrowLeft': { action: 'navigateLeft', description: 'Navigate Left' },
            'ArrowRight': { action: 'navigateRight', description: 'Navigate Right' },
            
            'PageUp': { action: 'pageUp', description: 'Page Up' },
            'PageDown': { action: 'pageDown', description: 'Page Down' },
            'Home': { action: 'goToStart', description: 'Go to Start' },
            'End': { action: 'goToEnd', description: 'Go to End' },
            
            // Media
            'Space': { action: 'playPause', description: 'Play/Pause', context: 'media' },
            'ArrowLeft': { action: 'seekBackward', description: 'Seek Backward', context: 'media' },
            'ArrowRight': { action: 'seekForward', description: 'Seek Forward', context: 'media' },
            'ArrowUp': { action: 'volumeUp', description: 'Volume Up', context: 'media' },
            'ArrowDown': { action: 'volumeDown', description: 'Volume Down', context: 'media' },
            'M': { action: 'toggleMute', description: 'Toggle Mute', context: 'media' },
            'F': { action: 'toggleFullscreen', description: 'Toggle Fullscreen', context: 'media' }
        };
        this.init();
    }

    init() {
        this.setupDefaultShortcuts();
        this.setupEventListeners();
        this.startListening();
    }

    setupDefaultShortcuts() {
        Object.entries(this.defaultShortcuts).forEach(([shortcut, config]) => {
            this.registerShortcut(shortcut, config.action, config.description, config.context);
        });
    }

    setupEventListeners() {
        // Listen for keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Listen for context changes
        document.addEventListener('contextChange', (e) => {
            this.setContext(e.detail.context);
        });
        
        // Listen for focus changes
        document.addEventListener('focusin', (e) => {
            this.updateContextFromElement(e.target);
        });
        
        // Listen for modal changes
        document.addEventListener('modalOpen', (e) => {
            this.setContext('modal');
        });
        
        document.addEventListener('modalClose', () => {
            this.setContext('global');
        });
    }

    handleKeyDown(e) {
        if (!this.isListening) return;
        
        const key = this.getKeyString(e);
        const shortcut = this.findShortcut(key);
        
        if (shortcut) {
            e.preventDefault();
            e.stopPropagation();
            
            this.executeShortcut(shortcut, e);
        }
    }

    handleKeyUp(e) {
        // Handle key up events if needed
        const key = this.getKeyString(e);
        const shortcut = this.findShortcut(key);
        
        if (shortcut && shortcut.onKeyUp) {
            shortcut.onKeyUp(e);
        }
    }

    getKeyString(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Meta');
        
        let key = e.key;
        
        // Handle special keys
        if (key === ' ') key = 'Space';
        if (key === 'Escape') key = 'Escape';
        if (key === 'Enter') key = 'Enter';
        if (key === 'Tab') key = 'Tab';
        if (key === 'Delete') key = 'Delete';
        if (key === 'Backspace') key = 'Backspace';
        
        // Handle arrow keys
        if (key.startsWith('Arrow')) {
            key = key.replace('Arrow', '');
        }
        
        // Handle function keys
        if (key.startsWith('F')) {
            key = key;
        }
        
        parts.push(key);
        
        return parts.join('+');
    }

    findShortcut(keyString) {
        // Check context-specific shortcuts first
        if (this.currentContext !== 'global') {
            const contextShortcuts = this.contextShortcuts.get(this.currentContext);
            if (contextShortcuts && contextShortcuts.has(keyString)) {
                return contextShortcuts.get(keyString);
            }
        }
        
        // Check global shortcuts
        return this.globalShortcuts.get(keyString) || this.shortcuts.get(keyString);
    }

    executeShortcut(shortcut, event) {
        const action = shortcut.action;
        
        // Execute action based on type
        if (typeof action === 'function') {
            action(event);
        } else if (typeof action === 'string') {
            this.executeAction(action, event);
        }
        
        // Emit shortcut event
        this.emitShortcutEvent('shortcutExecuted', {
            action: action,
            key: shortcut.key,
            context: this.currentContext,
            timestamp: Date.now()
        });
    }

    executeAction(action, event) {
        switch (action) {
            // Navigation actions
            case 'navigateHome':
                this.navigateTo('home');
                break;
            case 'navigateEditor':
                this.navigateTo('editor');
                break;
            case 'navigateBookmarks':
                this.navigateTo('bookmarks');
                break;
            case 'navigateAnalytics':
                this.navigateTo('analytics');
                break;
            case 'navigateTheme':
                this.navigateTo('theme');
                break;
                
            // Search actions
            case 'focusSearch':
                this.focusSearch();
                break;
            case 'findNext':
                this.findNext();
                break;
            case 'findPrevious':
                this.findPrevious();
                break;
            case 'advancedSearch':
                this.openAdvancedSearch();
                break;
                
            // Article management
            case 'newArticle':
                this.createNewArticle();
                break;
            case 'saveArticle':
                this.saveCurrentArticle();
                break;
            case 'saveDraft':
                this.saveDraft();
                break;
            case 'openArticle':
                this.openArticle();
                break;
            case 'importArticle':
                this.importArticle();
                break;
            case 'exportArticle':
                this.exportCurrentArticle();
                break;
            case 'printArticle':
                this.printCurrentArticle();
                break;
                
            // Editor actions
            case 'editorBold':
                this.execEditorCommand('bold');
                break;
            case 'editorItalic':
                this.execEditorCommand('italic');
                break;
            case 'editorUnderline':
                this.execEditorCommand('underline');
                break;
            case 'editorStrikethrough':
                this.execEditorCommand('strikethrough');
                break;
            case 'editorLink':
                this.execEditorCommand('link');
                break;
            case 'editorImage':
                this.execEditorCommand('image');
                break;
            case 'editorCode':
                this.execEditorCommand('code');
                break;
            case 'editorUndo':
                this.execEditorCommand('undo');
                break;
            case 'editorRedo':
                this.execEditorCommand('redo');
                break;
            case 'editorOrderedList':
                this.execEditorCommand('insertOrderedList');
                break;
            case 'editorUnorderedList':
                this.execEditorCommand('insertUnorderedList');
                break;
            case 'editorHeading1':
                this.execEditorCommand('formatBlock', 'h1');
                break;
            case 'editorHeading2':
                this.execEditorCommand('formatBlock', 'h2');
                break;
            case 'editorHeading3':
                this.execEditorCommand('formatBlock', 'h3');
                break;
            case 'editorHeading4':
                this.execEditorCommand('formatBlock', 'h4');
                break;
            case 'editorHeading5':
                this.execEditorCommand('formatBlock', 'h5');
                break;
            case 'editorHeading6':
                this.execEditorCommand('formatBlock', 'h6');
                break;
                
            // Theme & accessibility
            case 'toggleDarkMode':
                this.toggleDarkMode();
                break;
            case 'increaseFontSize':
                this.adjustFontSize(1);
                break;
            case 'decreaseFontSize':
                this.adjustFontSize(-1);
                break;
            case 'resetFontSize':
                this.resetFontSize();
                break;
            case 'toggleHighContrast':
                this.toggleHighContrast();
                break;
                
            // Utility
            case 'showHelp':
                this.showHelpModal();
                break;
            case 'escape':
                this.handleEscape();
                break;
            case 'confirm':
                this.handleConfirm();
                break;
            case 'select':
                this.handleSelect();
                break;
            case 'nextFocus':
                this.focusNextElement();
                break;
            case 'previousFocus':
                this.focusPreviousElement();
                break;
            case 'navigateUp':
                this.navigateDirection('up');
                break;
            case 'navigateDown':
                this.navigateDirection('down');
                break;
            case 'navigateLeft':
                this.navigateDirection('left');
                break;
            case 'navigateRight':
                this.navigateDirection('right');
                break;
            case 'pageUp':
                this.navigatePage('up');
                break;
            case 'pageDown':
                this.navigatePage('down');
                break;
            case 'goToStart':
                this.navigatePage('start');
                break;
            case 'goToEnd':
                this.navigatePage('end');
                break;
                
            // Media controls
            case 'playPause':
                this.toggleMediaPlayback();
                break;
            case 'seekBackward':
                this.seekMedia(-10);
                break;
            case 'seekForward':
                this.seekMedia(10);
                break;
            case 'volumeUp':
                this.adjustMediaVolume(0.1);
                break;
            case 'volumeDown':
                this.adjustMediaVolume(-0.1);
                break;
            case 'toggleMute':
                this.toggleMediaMute();
                break;
            case 'toggleFullscreen':
                this.toggleMediaFullscreen();
                break;
        }
    }

    // Action implementations
    navigateTo(page) {
        if (window.app && window.app.navigateTo) {
            window.app.navigateTo(page);
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('.search-input, #search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    findNext() {
        if (window.find) {
            window.find();
        }
    }

    findPrevious() {
        if (window.find) {
            window.find('', false, true);
        }
    }

    openAdvancedSearch() {
        // Open advanced search modal or panel
        const event = new CustomEvent('openAdvancedSearch');
        document.dispatchEvent(event);
    }

    createNewArticle() {
        this.navigateTo('editor');
        // Clear form for new article
        const form = document.getElementById('article-form');
        if (form) {
            form.reset();
        }
    }

    saveCurrentArticle() {
        const event = new CustomEvent('saveArticle');
        document.dispatchEvent(event);
    }

    saveDraft() {
        const event = new CustomEvent('saveDraft');
        document.dispatchEvent(event);
    }

    openArticle() {
        const event = new CustomEvent('openArticle');
        document.dispatchEvent(event);
    }

    importArticle() {
        const event = new CustomEvent('importArticle');
        document.dispatchEvent(event);
    }

    exportCurrentArticle() {
        const event = new CustomEvent('exportArticle');
        document.dispatchEvent(event);
    }

    printCurrentArticle() {
        window.print();
    }

    execEditorCommand(command, value = null) {
        if (document.execCommand) {
            document.execCommand(command, false, value);
        }
        
        // Emit editor command event
        const event = new CustomEvent('editorCommand', {
            detail: { command, value }
        });
        document.dispatchEvent(event);
    }

    toggleDarkMode() {
        const event = new CustomEvent('toggleDarkMode');
        document.dispatchEvent(event);
    }

    adjustFontSize(delta) {
        const event = new CustomEvent('adjustFontSize', {
            detail: { delta }
        });
        document.dispatchEvent(event);
    }

    resetFontSize() {
        const event = new CustomEvent('resetFontSize');
        document.dispatchEvent(event);
    }

    toggleHighContrast() {
        const event = new CustomEvent('toggleHighContrast');
        document.dispatchEvent(event);
    }

    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.remove();
        }
        
        this.helpModal = this.createHelpModal();
        document.body.appendChild(this.helpModal);
        
        // Focus first element in modal
        const firstFocusable = this.helpModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    createHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'shortcuts-title');
        modal.setAttribute('aria-modal', 'true');
        
        const categories = this.groupShortcutsByCategory();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
                    <button class="modal-close" aria-label="Close keyboard shortcuts" onclick="this.parentElement.parentElement.parentElement.remove()">
                        &times;
                    </button>
                </div>
                <div class="modal-body">
                    ${Object.entries(categories).map(([category, shortcuts]) => `
                        <div class="shortcuts-category">
                            <h3>${category}</h3>
                            <div class="shortcuts-grid">
                                ${shortcuts.map(shortcut => `
                                    <div class="shortcut-item">
                                        <div class="shortcut-keys">
                                            <kbd>${this.formatShortcutKey(shortcut.key)}</kbd>
                                        </div>
                                        <div class="shortcut-description">
                                            ${shortcut.description}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.helpModal = null;
            }
        });
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                this.helpModal = null;
            }
        });
        
        return modal;
    }

    groupShortcutsByCategory() {
        const categories = {};
        
        this.getAllShortcuts().forEach(shortcut => {
            const category = this.getShortcutCategory(shortcut.action);
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(shortcut);
        });
        
        return categories;
    }

    getShortcutCategory(action) {
        const categoryMap = {
            // Navigation
            'navigateHome': 'Navigation',
            'navigateEditor': 'Navigation',
            'navigateBookmarks': 'Navigation',
            'navigateAnalytics': 'Navigation',
            'navigateTheme': 'Navigation',
            
            // Search
            'focusSearch': 'Search',
            'findNext': 'Search',
            'findPrevious': 'Search',
            'advancedSearch': 'Search',
            
            // Article Management
            'newArticle': 'Article Management',
            'saveArticle': 'Article Management',
            'saveDraft': 'Article Management',
            'openArticle': 'Article Management',
            'importArticle': 'Article Management',
            'exportArticle': 'Article Management',
            'printArticle': 'Article Management',
            
            // Editor
            'editorBold': 'Editor',
            'editorItalic': 'Editor',
            'editorUnderline': 'Editor',
            'editorStrikethrough': 'Editor',
            'editorLink': 'Editor',
            'editorImage': 'Editor',
            'editorCode': 'Editor',
            'editorUndo': 'Editor',
            'editorRedo': 'Editor',
            'editorOrderedList': 'Editor',
            'editorUnorderedList': 'Editor',
            'editorHeading1': 'Editor',
            'editorHeading2': 'Editor',
            'editorHeading3': 'Editor',
            'editorHeading4': 'Editor',
            'editorHeading5': 'Editor',
            'editorHeading6': 'Editor',
            
            // Theme & Accessibility
            'toggleDarkMode': 'Theme & Accessibility',
            'increaseFontSize': 'Theme & Accessibility',
            'decreaseFontSize': 'Theme & Accessibility',
            'resetFontSize': 'Theme & Accessibility',
            'toggleHighContrast': 'Theme & Accessibility',
            
            // Utility
            'showHelp': 'Utility',
            'escape': 'Utility',
            'confirm': 'Utility',
            'select': 'Utility',
            'nextFocus': 'Navigation',
            'previousFocus': 'Navigation',
            'navigateUp': 'Navigation',
            'navigateDown': 'Navigation',
            'navigateLeft': 'Navigation',
            'navigateRight': 'Navigation',
            'pageUp': 'Navigation',
            'pageDown': 'Navigation',
            'goToStart': 'Navigation',
            'goToEnd': 'Navigation',
            
            // Media
            'playPause': 'Media Controls',
            'seekBackward': 'Media Controls',
            'seekForward': 'Media Controls',
            'volumeUp': 'Media Controls',
            'volumeDown': 'Media Controls',
            'toggleMute': 'Media Controls',
            'toggleFullscreen': 'Media Controls'
        };
        
        return categoryMap[action] || 'Other';
    }

    formatShortcutKey(key) {
        return key.split('+').map(part => {
            return `<kbd>${part}</kbd>`;
        }).join(' + ');
    }

    handleEscape() {
        const event = new CustomEvent('escape');
        document.dispatchEvent(event);
    }

    handleConfirm() {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.click) {
            activeElement.click();
        }
    }

    handleSelect() {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.type === 'checkbox' || activeElement.type === 'radio')) {
            activeElement.checked = !activeElement.checked;
            activeElement.dispatchEvent(new Event('change'));
        }
    }

    focusNextElement() {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        
        if (focusableElements[nextIndex]) {
            focusableElements[nextIndex].focus();
        }
    }

    focusPreviousElement() {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        
        if (focusableElements[prevIndex]) {
            focusableElements[prevIndex].focus();
        }
    }

    navigateDirection(direction) {
        const event = new CustomEvent('navigateDirection', {
            detail: { direction }
        });
        document.dispatchEvent(event);
    }

    navigatePage(direction) {
        const event = new CustomEvent('navigatePage', {
            detail: { direction }
        });
        document.dispatchEvent(event);
    }

    toggleMediaPlayback() {
        const media = document.querySelector('video, audio');
        if (media) {
            if (media.paused) {
                media.play();
            } else {
                media.pause();
            }
        }
    }

    seekMedia(seconds) {
        const media = document.querySelector('video, audio');
        if (media) {
            media.currentTime += seconds;
        }
    }

    adjustMediaVolume(delta) {
        const media = document.querySelector('video, audio');
        if (media) {
            media.volume = Math.max(0, Math.min(1, media.volume + delta));
        }
    }

    toggleMediaMute() {
        const media = document.querySelector('video, audio');
        if (media) {
            media.muted = !media.muted;
        }
    }

    toggleMediaFullscreen() {
        const media = document.querySelector('video');
        if (media) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                media.requestFullscreen();
            }
        }
    }

    updateContextFromElement(element) {
        let context = 'global';
        
        if (element.closest('.editor-container, .rich-editor')) {
            context = 'editor';
        } else if (element.closest('.modal')) {
            context = 'modal';
        } else if (element.closest('.search-container')) {
            context = 'search';
        } else if (element.closest('video, audio')) {
            context = 'media';
        }
        
        this.setContext(context);
    }

    getFocusableElements() {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(document.querySelectorAll(selector));
    }

    // Public API methods
    registerShortcut(key, action, description = '', context = 'global') {
        const shortcut = {
            key,
            action,
            description,
            context
        };
        
        if (context === 'global') {
            this.globalShortcuts.set(key, shortcut);
        } else {
            if (!this.contextShortcuts.has(context)) {
                this.contextShortcuts.set(context, new Map());
            }
            this.contextShortcuts.get(context).set(key, shortcut);
        }
        
        this.shortcuts.set(key, shortcut);
    }

    unregisterShortcut(key, context = 'global') {
        if (context === 'global') {
            this.globalShortcuts.delete(key);
        } else {
            const contextMap = this.contextShortcuts.get(context);
            if (contextMap) {
                contextMap.delete(key);
            }
        }
        
        this.shortcuts.delete(key);
    }

    setContext(context) {
        this.currentContext = context;
        this.emitShortcutEvent('contextChanged', { context });
    }

    getContext() {
        return this.currentContext;
    }

    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }

    getShortcutsForContext(context) {
        if (context === 'global') {
            return Array.from(this.globalShortcuts.values());
        }
        
        const contextMap = this.contextShortcuts.get(context);
        return contextMap ? Array.from(contextMap.values()) : [];
    }

    startListening() {
        this.isListening = true;
    }

    stopListening() {
        this.isListening = false;
    }

    isListening() {
        return this.isListening;
    }

    emitShortcutEvent(type, data) {
        const event = new CustomEvent('keyboardShortcut', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Export/Import shortcuts
    exportShortcuts() {
        const data = {
            globalShortcuts: Object.fromEntries(this.globalShortcuts),
            contextShortcuts: Object.fromEntries(this.contextShortcuts),
            exportedAt: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `keyboard-shortcuts-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importShortcuts(data) {
        if (data.globalShortcuts) {
            Object.entries(data.globalShortcuts).forEach(([key, shortcut]) => {
                this.registerShortcut(key, shortcut.action, shortcut.description, shortcut.context);
            });
        }
        
        if (data.contextShortcuts) {
            Object.entries(data.contextShortcuts).forEach(([context, shortcuts]) => {
                Object.entries(shortcuts).forEach(([key, shortcut]) => {
                    this.registerShortcut(key, shortcut.action, shortcut.description, context);
                });
            });
        }
    }

    // Cleanup
    destroy() {
        this.stopListening();
        
        if (this.helpModal) {
            this.helpModal.remove();
            this.helpModal = null;
        }
        
        this.shortcuts.clear();
        this.globalShortcuts.clear();
        this.contextShortcuts.clear();
    }
}

// Create singleton instance
export const keyboardShortcutManager = new KeyboardShortcutManager();
