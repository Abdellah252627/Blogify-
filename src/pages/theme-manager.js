// Theme and Language Management Module
import { state, updateState } from '../utils/state.js';
import { toastManager } from '../components/notifications.js';

export class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme(state.theme);
        this.applyLanguage(state.lang);
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle-btn');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Language toggle
        const langToggle = document.getElementById('lang-toggle-btn');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleTheme() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        updateState('theme', newTheme);
        
        // Update button icon
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }

        toastManager.info(`Switched to ${newTheme} mode`);
    }

    applyTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#1e293b' : '#ffffff';
        }
    }

    toggleLanguage() {
        const newLang = state.lang === 'en' ? 'ar' : 'en';
        this.applyLanguage(newLang);
        updateState('lang', newLang);
        
        // Update button text
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) {
            langBtn.textContent = newLang === 'en' ? 'ع' : 'En';
        }

        toastManager.info(`Switched to ${newLang === 'en' ? 'English' : 'Arabic'}`);
    }

    applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update all elements with data-lang-key
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const translation = this.getTranslation(key, lang);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key, lang) {
        const translations = {
            en: {
                logo: 'Blogify 📝',
                about: 'About',
                bookmarks: 'Bookmarks',
                new_article: 'New Article',
                export_articles: 'Export Articles',
                import_articles: 'Import Articles',
                rss_feed: 'RSS Feed',
                analytics: 'Analytics',
                recent_articles: 'Recent Articles',
                search_placeholder: 'Search articles...',
                all_categories: 'All Categories',
                write_article: 'Write a New Article',
                title: 'Title',
                category: 'Category',
                category_placeholder: 'e.g., Technology, Lifestyle...',
                tags: 'Tags',
                tags_placeholder: 'e.g., web, javascript, tutorial (comma separated)',
                content: 'Content',
                save_draft: 'Save Draft',
                publish: 'Publish',
                back: '← Back',
                related_articles: 'Related Articles',
                bookmarked_articles: 'Bookmarked Articles',
                about_title: 'About Blogify',
                about_text: 'Blogify is a modern, interactive, and professional blogging platform. It supports both light and dark modes, language switching (Arabic/English) with animations, and local storage for your articles. This project is built with pure HTML, CSS, and JavaScript to be lightweight and fast.',
                user_profile: 'User Profile',
                articles: 'Articles',
                views: 'Views',
                edit_profile: 'Edit Profile',
                name: 'Name',
                email: 'Email',
                bio: 'Bio',
                save_profile: 'Save Profile',
                analytics_dashboard: 'Analytics Dashboard',
                total_articles: 'Total Articles',
                total_views: 'Total Views',
                total_comments: 'Total Comments',
                avg_reading_time: 'Avg Reading Time',
                views_by_category: 'Views by Category',
                popular_articles: 'Popular Articles',
                confirm_delete_title: 'Confirm Deletion',
                confirm_delete_text: 'Are you sure you want to delete this article? This action cannot be undone.',
                cancel: 'Cancel',
                delete: 'Delete',
                comments: 'Comments',
                add_comment: 'Add Comment',
                comment: 'Comment',
                submit_comment: 'Submit Comment',
                export_description: 'Export all your articles as a JSON file for backup or migration.',
                download_export: 'Download Export',
                import_description: 'Import articles from a JSON file. Note: This will merge with existing articles.',
                select_file: 'Select File',
                rss_feed_title: 'RSS Feed',
                add_link: 'Add Link',
                link_url: 'URL',
                keyboard_shortcuts: 'Keyboard Shortcuts',
                shortcut_new_article: 'New Article',
                shortcut_search: 'Focus Search',
                shortcut_save: 'Save Draft',
                shortcut_publish: 'Publish Article',
                shortcut_escape: 'Close/Cancel',
                shortcut_help: 'Show Shortcuts'
            },
            ar: {
                logo: 'بلوجيفي 📝',
                about: 'حول',
                bookmarks: 'المرجعيات',
                new_article: 'مقال جديد',
                export_articles: 'تصدير المقالات',
                import_articles: 'استيراد المقالات',
                rss_feed: 'تغذية RSS',
                analytics: 'التحليلات',
                recent_articles: 'المقالات الأخيرة',
                search_placeholder: 'البحث في المقالات...',
                all_categories: 'جميع الفئات',
                write_article: 'اكتب مقالاً جديداً',
                title: 'العنوان',
                category: 'الفئة',
                category_placeholder: 'مثال: التكنولوجيا، نمط الحياة...',
                tags: 'الوسوم',
                tags_placeholder: 'مثال: ويب، جافاسكريبت، درس (فصل بينها بفواصل)',
                content: 'المحتوى',
                save_draft: 'حفظ المسودة',
                publish: 'نشر',
                back: '← رجوع',
                related_articles: 'مقالات ذات صلة',
                bookmarked_articles: 'المقالات المرجعية',
                about_title: 'حول بلوجيفي',
                about_text: 'بلوجيفي هو منصة تدوين حديثة وتفاعلية واحترافية. يدعم الوضع الفاتح والداكن، وتحويل اللغة (العربية/الإنجليزية) مع الرسوم المتحركة، والتخزين المحلي لمقالاتك. هذا المشروع مبني باستخدام HTML و CSS و JavaScript النقية ليكون خفيفاً وسريعاً.',
                user_profile: 'ملف المستخدم',
                articles: 'المقالات',
                views: 'المشاهدات',
                edit_profile: 'تعديل الملف الشخصي',
                name: 'الاسم',
                email: 'البريد الإلكتروني',
                bio: 'السيرة الذاتية',
                save_profile: 'حفظ الملف الشخصي',
                analytics_dashboard: 'لوحة التحليلات',
                total_articles: 'إجمالي المقالات',
                total_views: 'إجمالي المشاهدات',
                total_comments: 'إجمالي التعليقات',
                avg_reading_time: 'متوسط وقت القراءة',
                views_by_category: 'المشاهدات حسب الفئة',
                popular_articles: 'المقالات الشائعة',
                confirm_delete_title: 'تأكيد الحذف',
                confirm_delete_text: 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.',
                cancel: 'إلغاء',
                delete: 'حذف',
                comments: 'التعليقات',
                add_comment: 'إضافة تعليق',
                comment: 'تعليق',
                submit_comment: 'إرسال التعليق',
                export_description: 'تصدير جميع مقالاتك كملف JSON للنسخ الاحتياطي أو النقل.',
                download_export: 'تنزيل التصدير',
                import_description: 'استيراد المقالات من ملف JSON. ملاحظة: سيتم دمجها مع المقالات الموجودة.',
                select_file: 'اختر ملف',
                rss_feed_title: 'تغذية RSS',
                add_link: 'إضافة رابط',
                link_url: 'الرابط',
                keyboard_shortcuts: 'اختصارات لوحة المفاتيح',
                shortcut_new_article: 'مقال جديد',
                shortcut_search: 'التركيز على البحث',
                shortcut_save: 'حفظ المسودة',
                shortcut_publish: 'نشر المقال',
                shortcut_escape: 'إغلاق/إلغاء',
                shortcut_help: 'عرض الاختصارات'
            }
        };

        return translations[lang]?.[key] || key;
    }
}

export const themeManager = new ThemeManager();
