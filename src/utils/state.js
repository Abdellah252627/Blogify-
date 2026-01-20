// State Management Module
export const state = {
    theme: (() => {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch (error) {
            console.error('Error reading theme from localStorage:', error);
            return 'light';
        }
    })(),
    lang: (() => {
        try {
            return localStorage.getItem('lang') || 'en';
        } catch (error) {
            console.error('Error reading language from localStorage:', error);
            return 'en';
        }
    })(),
    articles: (() => {
        try {
            return JSON.parse(localStorage.getItem('articles')) || [];
        } catch (error) {
            console.error('Error parsing articles from localStorage:', error);
            return [];
        }
    })(),
    currentPage: 'home',
    userProfile: (() => {
        try {
            return JSON.parse(localStorage.getItem('userProfile')) || {
                name: 'John Doe',
                email: 'john@example.com',
                bio: 'Passionate blogger and writer',
                avatar: 'https://picsum.photos/seed/avatar/150/150.jpg'
            };
        } catch (error) {
            console.error('Error parsing userProfile from localStorage:', error);
            return {
                name: 'John Doe',
                email: 'john@example.com',
                bio: 'Passionate blogger and writer',
                avatar: 'https://picsum.photos/seed/avatar/150/150.jpg'
            };
        }
    })(),
    articleToDelete: null,
    comments: (() => {
        try {
            return JSON.parse(localStorage.getItem('comments')) || {};
        } catch (error) {
            console.error('Error parsing comments from localStorage:', error);
            return {};
        }
    })(),
    currentArticleId: null,
    selectedTag: null,
    bookmarked: (() => {
        try {
            return JSON.parse(localStorage.getItem('bookmarked')) || [];
        } catch (error) {
            console.error('Error parsing bookmarked from localStorage:', error);
            return [];
        }
    })(),
    articleToEditId: null,
};

// Lazy Loading State
export let articleObserver;
export let imageObserver;
export const ARTICLES_PER_PAGE = 6;
export let currentArticlePage = 0;

// State update functions
export function updateState(key, value) {
    state[key] = value;
    saveStateToStorage();
}

export function saveStateToStorage() {
    localStorage.setItem('theme', state.theme);
    localStorage.setItem('lang', state.lang);
    localStorage.setItem('articles', JSON.stringify(state.articles));
    localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
    localStorage.setItem('comments', JSON.stringify(state.comments));
    localStorage.setItem('bookmarked', JSON.stringify(state.bookmarked));
}
