// Rich Text Editor with Advanced Features
export class RichTextEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            toolbar: true,
            markdown: true,
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            imageUpload: true,
            maxImageSize: 5 * 1024 * 1024, // 5MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            ...options
        };
        
        this.editor = null;
        this.markdownEditor = null;
        this.preview = null;
        this.toolbar = null;
        this.currentMode = 'rich'; // 'rich' or 'markdown'
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        
        this.init();
    }

    init() {
        this.createEditorStructure();
        this.setupToolbar();
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupMarkdownPreview();
    }

    createEditorStructure() {
        this.container.innerHTML = `
            <div class="rich-editor-container">
                ${this.options.toolbar ? this.createToolbarHTML() : ''}
                <div class="editor-content">
                    <div class="editor-tabs">
                        <button class="tab-btn active" data-mode="rich">Rich Text</button>
                        <button class="tab-btn" data-mode="markdown">Markdown</button>
                        <button class="tab-btn" data-mode="preview">Preview</button>
                    </div>
                    <div class="editor-panels">
                        <div class="editor-panel active" data-panel="rich">
                            <div class="rich-editor" contenteditable="true" data-placeholder="Start writing your article..."></div>
                        </div>
                        <div class="editor-panel" data-panel="markdown">
                            <textarea class="markdown-editor" placeholder="Write in Markdown..."></textarea>
                        </div>
                        <div class="editor-panel" data-panel="preview">
                            <div class="preview-content"></div>
                        </div>
                    </div>
                </div>
                <div class="editor-footer">
                    <div class="editor-stats">
                        <span class="word-count">0 words</span>
                        <span class="char-count">0 characters</span>
                        <span class="reading-time">0 min read</span>
                    </div>
                    <div class="editor-status">
                        <span class="save-status"></span>
                    </div>
                </div>
            </div>
        `;

        // Get references
        this.editor = this.container.querySelector('.rich-editor');
        this.markdownEditor = this.container.querySelector('.markdown-editor');
        this.preview = this.container.querySelector('.preview-content');
        this.toolbar = this.container.querySelector('.editor-toolbar');
    }

    createToolbarHTML() {
        return `
            <div class="editor-toolbar">
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-command="bold" title="Bold" aria-label="Bold text">
                        <strong>B</strong>
                    </button>
                    <button class="toolbar-btn" data-command="italic" title="Italic" aria-label="Italic text">
                        <em>I</em>
                    </button>
                    <button class="toolbar-btn" data-command="underline" title="Underline" aria-label="Underline text">
                        <u>U</u>
                    </button>
                    <button class="toolbar-btn" data-command="strikeThrough" title="Strikethrough" aria-label="Strikethrough text">
                        <s>S</s>
                    </button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <select class="toolbar-select" data-command="formatBlock" aria-label="Format block">
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                    </select>
                    <select class="toolbar-select" data-command="fontSize" aria-label="Font size">
                        <option value="1">Very Small</option>
                        <option value="2">Small</option>
                        <option value="3" selected>Normal</option>
                        <option value="4">Medium</option>
                        <option value="5">Large</option>
                        <option value="6">Very Large</option>
                        <option value="7">Huge</option>
                    </select>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <label for="font-color-picker" class="toolbar-btn" aria-label="Font color">
                        <span class="color-icon">A</span>
                        <input type="color" id="font-color-picker" data-command="foreColor" style="visibility: hidden; width: 0; height: 0;">
                    </label>
                    <label for="bg-color-picker" class="toolbar-btn" aria-label="Background color">
                        <span class="color-icon bg">A</span>
                        <input type="color" id="bg-color-picker" data-command="hiliteColor" style="visibility: hidden; width: 0; height: 0;">
                    </label>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-command="insertUnorderedList" title="Bullet List" aria-label="Insert bullet list">
                        •
                    </button>
                    <button class="toolbar-btn" data-command="insertOrderedList" title="Numbered List" aria-label="Insert numbered list">
                        1.
                    </button>
                    <button class="toolbar-btn" data-command="indent" title="Indent" aria-label="Increase indent">
                        →
                    </button>
                    <button class="toolbar-btn" data-command="outdent" title="Outdent" aria-label="Decrease indent">
                        ←
                    </button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-command="justifyLeft" title="Align Left" aria-label="Align text left">
                        ≡
                    </button>
                    <button class="toolbar-btn" data-command="justifyCenter" title="Align Center" aria-label="Align text center">
                        ≡
                    </button>
                    <button class="toolbar-btn" data-command="justifyRight" title="Align Right" aria-label="Align text right">
                        ≡
                    </button>
                    <button class="toolbar-btn" data-command="justifyFull" title="Justify" aria-label="Justify text">
                        ≡
                    </button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button class="toolbar-btn" id="link-btn" title="Insert Link" aria-label="Insert link">
                        🔗
                    </button>
                    <button class="toolbar-btn" id="image-upload-btn" title="Insert Image" aria-label="Insert image">
                        🖼️
                    </button>
                    <button class="toolbar-btn" id="code-block-btn" title="Code Block" aria-label="Insert code block">
                        &lt;/&gt;
                    </button>
                    <button class="toolbar-btn" id="table-btn" title="Insert Table" aria-label="Insert table">
                        ⊞
                    </button>
                    <button class="toolbar-btn" id="quote-btn" title="Block Quote" aria-label="Insert quote">
                        "
                    </button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-command="undo" title="Undo" aria-label="Undo">
                        ↶
                    </button>
                    <button class="toolbar-btn" data-command="redo" title="Redo" aria-label="Redo">
                        ↷
                    </button>
                    <button class="toolbar-btn" data-command="removeFormat" title="Clear Formatting" aria-label="Clear formatting">
                        ✕
                    </button>
                </div>
            </div>
        `;
    }

    setupToolbar() {
        if (!this.toolbar) return;

        // Text formatting buttons
        this.toolbar.querySelectorAll('[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.executeCommand(btn.dataset.command, btn.value);
            });
        });

        // Special buttons
        document.getElementById('link-btn')?.addEventListener('click', () => this.showLinkModal());
        document.getElementById('image-upload-btn')?.addEventListener('click', () => this.showImageUpload());
        document.getElementById('code-block-btn')?.addEventListener('click', () => this.insertCodeBlock());
        document.getElementById('table-btn')?.addEventListener('click', () => this.insertTable());
        document.getElementById('quote-btn')?.addEventListener('click', () => this.insertQuote());

        // Color pickers
        document.getElementById('font-color-picker')?.addEventListener('change', (e) => {
            this.executeCommand('foreColor', e.target.value);
        });

        document.getElementById('bg-color-picker')?.addEventListener('change', (e) => {
            this.executeCommand('hiliteColor', e.target.value);
        });

        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchMode(btn.dataset.mode);
            });
        });
    }

    setupEventListeners() {
        // Editor events
        this.editor?.addEventListener('input', () => {
            this.updateStats();
            this.updatePreview();
            this.updateSaveStatus();
        });

        this.editor?.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        this.markdownEditor?.addEventListener('input', () => {
            this.updateStats();
            this.updatePreview();
            this.updateSaveStatus();
            this.syncEditors('markdown-to-rich');
        });

        // Keyboard shortcuts
        this.container.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Selection change
        document.addEventListener('selectionchange', () => {
            this.updateToolbarState();
        });
    }

    setupAutoSave() {
        if (!this.options.autoSave) return;

        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.options.autoSaveInterval);
    }

    setupMarkdownPreview() {
        if (!this.options.markdown) return;

        // Simple markdown parser (in production, use a proper library)
        this.markdownParser = {
            parse: (markdown) => {
                return markdown
                    // Headers
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    // Bold
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    // Italic
                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                    // Code blocks
                    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
                    // Inline code
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    // Links
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                    // Images
                    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
                    // Line breaks
                    .replace(/\n/g, '<br>');
            }
        };
    }

    executeCommand(command, value = null) {
        if (this.currentMode === 'rich' && this.editor) {
            this.editor.focus();
            
            if (value) {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }
            
            this.updateStats();
            this.updateSaveStatus();
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tabs
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update panels
        this.container.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === mode);
        });
        
        // Sync content
        if (mode === 'preview') {
            this.updatePreview();
        } else if (mode === 'rich') {
            this.syncEditors('markdown-to-rich');
        } else if (mode === 'markdown') {
            this.syncEditors('rich-to-markdown');
        }
        
        // Focus appropriate editor
        if (mode === 'rich') {
            this.editor?.focus();
        } else if (mode === 'markdown') {
            this.markdownEditor?.focus();
        }
    }

    syncEditors(from) {
        if (from === 'rich-to-markdown' && this.markdownEditor) {
            // Convert HTML to Markdown (basic implementation)
            let html = this.editor.innerHTML;
            let markdown = html
                .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
                .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
                .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
                .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
                .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
                .replace(/<br[^>]*>/gi, '\n')
                .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
                .replace(/<[^>]+>/g, '');
            
            this.markdownEditor.value = markdown.trim();
        } else if (from === 'markdown-to-rich' && this.editor) {
            // Convert Markdown to HTML
            let markdown = this.markdownEditor.value;
            let html = this.markdownParser.parse(markdown);
            this.editor.innerHTML = html;
        }
    }

    updatePreview() {
        if (!this.preview) return;
        
        let content = '';
        if (this.currentMode === 'rich') {
            content = this.editor.innerHTML;
        } else if (this.currentMode === 'markdown') {
            content = this.markdownParser.parse(this.markdownEditor.value);
        }
        
        this.preview.innerHTML = content;
    }

    updateStats() {
        const content = this.currentMode === 'rich' ? 
            this.editor.innerText || this.editor.textContent : 
            this.markdownEditor.value;
        
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = content.length;
        const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
        
        const wordCountEl = this.container.querySelector('.word-count');
        const charCountEl = this.container.querySelector('.char-count');
        const readingTimeEl = this.container.querySelector('.reading-time');
        
        if (wordCountEl) wordCountEl.textContent = `${words} words`;
        if (charCountEl) charCountEl.textContent = `${chars} characters`;
        if (readingTimeEl) readingTimeEl.textContent = `${readingTime} min read`;
    }

    updateSaveStatus() {
        const statusEl = this.container.querySelector('.save-status');
        if (!statusEl) return;
        
        const now = Date.now();
        const timeSinceLastSave = this.lastSaveTime ? now - this.lastSaveTime : 0;
        
        if (timeSinceLastSave < 2000) {
            statusEl.textContent = 'Saved';
            statusEl.className = 'save-status saved';
        } else if (timeSinceLastSave < 10000) {
            statusEl.textContent = 'Saving...';
            statusEl.className = 'save-status saving';
        } else {
            statusEl.textContent = 'Unsaved';
            statusEl.className = 'save-status unsaved';
        }
    }

    updateToolbarState() {
        if (!this.toolbar) return;
        
        // Update button states based on current selection
        const buttons = this.toolbar.querySelectorAll('[data-command]');
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            try {
                btn.classList.toggle('active', document.queryCommandState(command));
            } catch (e) {
                // Some commands might not be supported
            }
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    this.executeCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.executeCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    this.executeCommand('underline');
                    break;
                case 's':
                    e.preventDefault();
                    this.autoSave();
                    break;
                case 'z':
                    e.preventDefault();
                    this.executeCommand('undo');
                    break;
                case 'y':
                    e.preventDefault();
                    this.executeCommand('redo');
                    break;
            }
        }
    }

    handlePaste(e) {
        e.preventDefault();
        
        const items = e.clipboardData?.items;
        if (!items) return;
        
        // Handle image paste
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    this.insertImageFile(file);
                    return;
                }
            }
        }
        
        // Handle text paste
        const text = e.clipboardData.getData('text/plain');
        if (text) {
            document.execCommand('insertText', false, text);
        }
    }

    showLinkModal() {
        const modal = document.createElement('div');
        modal.className = 'link-modal modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Insert Link</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="link-url">URL</label>
                        <input type="url" id="link-url" placeholder="https://example.com">
                    </div>
                    <div class="form-group">
                        <label for="link-text">Text</label>
                        <input type="text" id="link-text" placeholder="Link text">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="link-new-tab">
                            Open in new tab
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-link">Cancel</button>
                    <button class="btn" id="insert-link">Insert Link</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#cancel-link').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#insert-link').addEventListener('click', () => {
            const url = modal.querySelector('#link-url').value;
            const text = modal.querySelector('#link-text').value || url;
            const newTab = modal.querySelector('#link-new-tab').checked;
            
            if (url) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const link = document.createElement('a');
                    link.href = url;
                    link.textContent = text;
                    if (newTab) link.target = '_blank';
                    
                    range.deleteContents();
                    range.insertNode(link);
                } else {
                    this.executeCommand('insertHTML', `<a href="${url}" ${newTab ? 'target="_blank"' : ''}>${text}</a>`);
                }
            }
            
            modal.remove();
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showImageUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.options.allowedImageTypes.join(',');
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => this.insertImageFile(file));
        };
        
        input.click();
    }

    insertImageFile(file) {
        if (!this.options.imageUpload) return;
        
        if (file.size > this.options.maxImageSize) {
            alert('Image size must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
            this.executeCommand('insertHTML', img);
        };
        
        reader.readAsDataURL(file);
    }

    insertCodeBlock() {
        const selection = window.getSelection();
        const selectedText = selection.toString() || 'Your code here';
        
        const codeBlock = `<pre><code>${selectedText}</code></pre>`;
        this.executeCommand('insertHTML', codeBlock);
    }

    insertTable() {
        const table = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Header 1</th>
                        <th>Header 2</th>
                        <th>Header 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cell 1</td>
                        <td>Cell 2</td>
                        <td>Cell 3</td>
                    </tr>
                    <tr>
                        <td>Cell 4</td>
                        <td>Cell 5</td>
                        <td>Cell 6</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        this.executeCommand('insertHTML', table);
    }

    insertQuote() {
        const selection = window.getSelection();
        const selectedText = selection.toString() || 'Your quote here';
        
        const quote = `<blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin: 1rem 0; font-style: italic;">
            ${selectedText}
        </blockquote>`;
        
        this.executeCommand('insertHTML', quote);
    }

    autoSave() {
        if (!this.options.autoSave) return;
        
        const content = this.getContent();
        const timestamp = Date.now();
        
        // Save to localStorage
        const draftKey = 'blogify_draft_' + timestamp;
        localStorage.setItem(draftKey, JSON.stringify({
            content: content,
            mode: this.currentMode,
            timestamp: timestamp
        }));
        
        // Update last save time
        this.lastSaveTime = timestamp;
        this.updateSaveStatus();
        
        // Clean up old drafts (keep only last 5)
        this.cleanupOldDrafts();
    }

    cleanupOldDrafts() {
        const keys = Object.keys(localStorage);
        const draftKeys = keys.filter(key => key.startsWith('blogify_draft_'));
        
        if (draftKeys.length > 5) {
            draftKeys
                .sort((a, b) => {
                    const timeA = parseInt(a.split('_')[2]);
                    const timeB = parseInt(b.split('_')[2]);
                    return timeA - timeB;
                })
                .slice(0, -5)
                .forEach(key => localStorage.removeItem(key));
        }
    }

    getContent() {
        if (this.currentMode === 'rich') {
            return this.editor.innerHTML;
        } else if (this.currentMode === 'markdown') {
            return this.markdownEditor.value;
        }
        return '';
    }

    setContent(content, mode = 'rich') {
        this.switchMode(mode);
        
        if (mode === 'rich') {
            this.editor.innerHTML = content;
        } else if (mode === 'markdown') {
            this.markdownEditor.value = content;
        }
        
        this.updateStats();
        this.updatePreview();
    }

    focus() {
        if (this.currentMode === 'rich') {
            this.editor?.focus();
        } else if (this.currentMode === 'markdown') {
            this.markdownEditor?.focus();
        }
    }

    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // Clean up event listeners
        this.container.removeEventListener('keydown', this.handleKeyboardShortcuts);
        this.container.removeEventListener('selectionchange', this.updateToolbarState);
    }
}
