// User Profile Management System
export class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.profiles = [];
        this.defaultProfile = {
            id: 'guest',
            name: 'Guest User',
            email: '',
            avatar: '',
            bio: '',
            website: '',
            location: '',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                emailNotifications: true,
                pushNotifications: false,
                publicProfile: true,
                showEmail: false,
                showWebsite: true,
                showLocation: false,
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h'
            },
            stats: {
                articlesWritten: 0,
                commentsPosted: 0,
                bookmarksCreated: 0,
                likesReceived: 0,
                viewsReceived: 0,
                followers: 0,
                following: 0
            },
            social: {
                twitter: '',
                github: '',
                linkedin: '',
                facebook: '',
                instagram: ''
            },
            privacy: {
                allowMessages: true,
                allowFollowers: true,
                allowComments: true,
                showOnlineStatus: true,
                profileVisibility: 'public' // public, friends, private
            },
            security: {
                twoFactorEnabled: false,
                lastPasswordChange: new Date().toISOString(),
                loginAttempts: 0,
                lockedUntil: null
            }
        };
        this.init();
    }

    init() {
        this.loadProfiles();
        this.loadCurrentUser();
        this.setupEventListeners();
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Listen for profile requests
        document.addEventListener('createProfile', (e) => {
            this.handleCreateProfile(e.detail);
        });

        document.addEventListener('updateProfile', (e) => {
            this.handleUpdateProfile(e.detail);
        });

        document.addEventListener('deleteProfile', (e) => {
            this.handleDeleteProfile(e.detail);
        });

        document.addEventListener('login', (e) => {
            this.handleLogin(e.detail);
        });

        document.addEventListener('logout', (e) => {
            this.handleLogout(e.detail);
        });

        // Listen for profile updates
        document.addEventListener('updatePreferences', (e) => {
            this.handleUpdatePreferences(e.detail);
        });

        document.addEventListener('updatePrivacy', (e) => {
            this.handleUpdatePrivacy(e.detail);
        });

        document.addEventListener('updateSocial', (e) => {
            this.handleUpdateSocial(e.detail);
        });

        // Listen for profile search
        document.addEventListener('searchProfiles', (e) => {
            this.handleProfileSearch(e.detail);
        });

        // Listen for follow/unfollow
        document.addEventListener('followUser', (e) => {
            this.handleFollowUser(e.detail);
        });

        document.addEventListener('unfollowUser', (e) => {
            this.handleUnfollowUser(e.detail);
        });
    }

    setupAutoSave() {
        // Auto-save profiles every 30 seconds
        setInterval(() => {
            this.saveProfiles();
        }, 30000);

        // Save on window unload
        window.addEventListener('beforeunload', () => {
            this.saveProfiles();
        });
    }

    loadProfiles() {
        try {
            const saved = localStorage.getItem('blogify_user_profiles');
            if (saved) {
                this.profiles = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load user profiles:', error);
            this.profiles = [];
        }
    }

    saveProfiles() {
        try {
            localStorage.setItem('blogify_user_profiles', JSON.stringify(this.profiles));
            
            this.emitProfileEvent('profilesSaved', {
                count: this.profiles.length,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save user profiles:', error);
        }
    }

    loadCurrentUser() {
        try {
            const saved = localStorage.getItem('blogify_current_user');
            if (saved) {
                this.currentUser = JSON.parse(saved);
                this.updateLastLogin();
            }
        } catch (error) {
            console.error('Failed to load current user:', error);
            this.currentUser = null;
        }
    }

    saveCurrentUser() {
        try {
            localStorage.setItem('blogify_current_user', JSON.stringify(this.currentUser));
            
            this.emitProfileEvent('currentUserSaved', {
                user: this.currentUser,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save current user:', error);
        }
    }

    // Profile CRUD operations
    createProfile(userData) {
        const profile = {
            ...this.defaultProfile,
            ...userData,
            id: this.generateId(),
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Validate profile data
        const validation = this.validateProfile(profile);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Check if email already exists
        if (userData.email && this.getProfileByEmail(userData.email)) {
            throw new Error('Email already exists');
        }

        // Add profile
        this.profiles.push(profile);
        this.saveProfiles();

        // Emit success event
        this.emitProfileEvent('profileCreated', {
            profile: profile,
            timestamp: Date.now()
        });

        return profile;
    }

    updateProfile(userId, updates) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Validate updates
        const updatedProfile = { ...profile, ...updates };
        const validation = this.validateProfile(updatedProfile);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Check email uniqueness if email is being updated
        if (updates.email && updates.email !== profile.email) {
            if (this.getProfileByEmail(updates.email)) {
                throw new Error('Email already exists');
            }
        }

        // Update profile
        const index = this.profiles.findIndex(p => p.id === userId);
        this.profiles[index] = updatedProfile;
        this.saveProfiles();

        // Update current user if it's the same profile
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = updatedProfile;
            this.saveCurrentUser();
        }

        // Emit success event
        this.emitProfileEvent('profileUpdated', {
            profile: updatedProfile,
            timestamp: Date.now()
        });

        return updatedProfile;
    }

    deleteProfile(userId, password) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Verify password (in a real app, this would be server-side)
        if (password !== 'delete123') {
            throw new Error('Invalid password');
        }

        // Cannot delete the last admin user
        if (this.profiles.length === 1) {
            throw new Error('Cannot delete the last user');
        }

        // Remove profile
        const index = this.profiles.findIndex(p => p.id === userId);
        const deletedProfile = this.profiles[index];
        this.profiles.splice(index, 1);
        this.saveProfiles();

        // Logout if it's the current user
        if (this.currentUser && this.currentUser.id === userId) {
            this.logout();
        }

        // Emit success event
        this.emitProfileEvent('profileDeleted', {
            profile: deletedProfile,
            timestamp: Date.now()
        });

        return deletedProfile;
    }

    getProfile(userId) {
        return this.profiles.find(p => p.id === userId);
    }

    getProfileByEmail(email) {
        return this.profiles.find(p => p.email === email);
    }

    getAllProfiles() {
        return [...this.profiles];
    }

    // Authentication
    login(email, password) {
        const profile = this.getProfileByEmail(email);
        
        if (!profile) {
            throw new Error('Invalid email or password');
        }

        // Check if account is locked
        if (profile.security.lockedUntil && new Date(profile.security.lockedUntil) > new Date()) {
            throw new Error('Account is locked. Try again later.');
        }

        // Verify password (in a real app, this would use proper password hashing)
        if (password !== 'password123') {
            // Increment login attempts
            profile.security.loginAttempts = (profile.security.loginAttempts || 0) + 1;
            
            // Lock account after 5 failed attempts
            if (profile.security.loginAttempts >= 5) {
                profile.security.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
            }
            
            this.updateProfile(profile.id, { security: profile.security });
            
            throw new Error('Invalid email or password');
        }

        // Reset login attempts on successful login
        profile.security.loginAttempts = 0;
        profile.security.lockedUntil = null;
        profile.lastLogin = new Date().toISOString();
        
        this.updateProfile(profile.id, { security: profile.security, lastLogin: profile.lastLogin });

        // Set current user
        this.currentUser = profile;
        this.saveCurrentUser();

        // Emit success event
        this.emitProfileEvent('loginSuccess', {
            user: profile,
            timestamp: Date.now()
        });

        return profile;
    }

    logout() {
        const previousUser = this.currentUser;
        this.currentUser = null;
        
        // Clear current user from storage
        localStorage.removeItem('blogify_current_user');

        // Emit success event
        this.emitProfileEvent('logoutSuccess', {
            previousUser: previousUser,
            timestamp: Date.now()
        });

        return previousUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateLastLogin() {
        if (this.currentUser) {
            this.currentUser.lastLogin = new Date().toISOString();
            this.saveCurrentUser();
        }
    }

    // Preferences management
    updatePreferences(userId, preferences) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        const updatedProfile = this.updateProfile(userId, {
            preferences: { ...profile.preferences, ...preferences }
        });

        this.emitProfileEvent('preferencesUpdated', {
            userId,
            preferences: updatedProfile.preferences,
            timestamp: Date.now()
        });

        return updatedProfile.preferences;
    }

    // Privacy management
    updatePrivacy(userId, privacy) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        const updatedProfile = this.updateProfile(userId, {
            privacy: { ...profile.privacy, ...privacy }
        });

        this.emitProfileEvent('privacyUpdated', {
            userId,
            privacy: updatedProfile.privacy,
            timestamp: Date.now()
        });

        return updatedProfile.privacy;
    }

    // Social media management
    updateSocial(userId, social) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        const updatedProfile = this.updateProfile(userId, {
            social: { ...profile.social, ...social }
        });

        this.emitProfileEvent('socialUpdated', {
            userId,
            social: updatedProfile.social,
            timestamp: Date.now()
        });

        return updatedProfile.social;
    }

    // Follow system
    followUser(followerId, followingId) {
        const follower = this.getProfile(followerId);
        const following = this.getProfile(followingId);
        
        if (!follower || !following) {
            throw new Error('User not found');
        }

        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }

        // Check if already following
        if (this.isFollowing(followerId, followingId)) {
            throw new Error('Already following this user');
        }

        // Add following relationship
        follower.stats.following = (follower.stats.following || 0) + 1;
        following.stats.followers = (following.stats.followers || 0) + 1;

        // Store following relationships
        if (!follower.followingList) {
            follower.followingList = [];
        }
        follower.followingList.push(followingId);

        if (!following.followersList) {
            following.followersList = [];
        }
        following.followersList.push(followerId);

        this.updateProfile(followerId, { stats: follower.stats, followingList: follower.followingList });
        this.updateProfile(followingId, { stats: following.stats, followersList: following.followersList });

        this.emitProfileEvent('userFollowed', {
            followerId,
            followingId,
            timestamp: Date.now()
        });

        return { followerId, followingId };
    }

    unfollowUser(followerId, followingId) {
        const follower = this.getProfile(followerId);
        const following = this.getProfile(followingId);
        
        if (!follower || !following) {
            throw new Error('User not found');
        }

        // Check if following
        if (!this.isFollowing(followerId, followingId)) {
            throw new Error('Not following this user');
        }

        // Remove following relationship
        follower.stats.following = Math.max(0, (follower.stats.following || 0) - 1);
        following.stats.followers = Math.max(0, (following.stats.followers || 0) - 1);

        // Remove from lists
        if (follower.followingList) {
            follower.followingList = follower.followingList.filter(id => id !== followingId);
        }

        if (following.followersList) {
            following.followersList = following.followersList.filter(id => id !== followerId);
        }

        this.updateProfile(followerId, { stats: follower.stats, followingList: follower.followingList });
        this.updateProfile(followingId, { stats: following.stats, followersList: following.followersList });

        this.emitProfileEvent('userUnfollowed', {
            followerId,
            followingId,
            timestamp: Date.now()
        });

        return { followerId, followingId };
    }

    isFollowing(followerId, followingId) {
        const follower = this.getProfile(followerId);
        return follower && follower.followingList && follower.followingList.includes(followingId);
    }

    getFollowers(userId) {
        const profile = this.getProfile(userId);
        return profile ? (profile.followersList || []) : [];
    }

    getFollowing(userId) {
        const profile = this.getProfile(userId);
        return profile ? (profile.followingList || []) : [];
    }

    // Search and filtering
    searchProfiles(query, filters = {}) {
        let results = [...this.profiles];

        // Text search
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(profile => 
                profile.name.toLowerCase().includes(searchTerm) ||
                profile.bio.toLowerCase().includes(searchTerm) ||
                (profile.email && profile.email.toLowerCase().includes(searchTerm))
            );
        }

        // Filter by privacy
        if (filters.privacy) {
            results = results.filter(p => p.privacy.profileVisibility === filters.privacy);
        }

        // Filter by join date
        if (filters.joinDateFrom) {
            const fromDate = new Date(filters.joinDateFrom);
            results = results.filter(p => new Date(p.joinDate) >= fromDate);
        }

        if (filters.joinDateTo) {
            const toDate = new Date(filters.joinDateTo);
            results = results.filter(p => new Date(p.joinDate) <= toDate);
        }

        // Filter by stats
        if (filters.minArticles) {
            results = results.filter(p => (p.stats.articlesWritten || 0) >= filters.minArticles);
        }

        if (filters.minFollowers) {
            results = results.filter(p => (p.stats.followers || 0) >= filters.minFollowers);
        }

        // Sort results
        const sortBy = filters.sortBy || 'joinDate';
        const sortOrder = filters.sortOrder || 'desc';

        results.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'joinDate' || sortBy === 'lastLogin') {
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

    // Statistics
    getProfileStats(userId) {
        const profile = this.getProfile(userId);
        
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Calculate additional stats
        const stats = {
            ...profile.stats,
            profileCompletion: this.calculateProfileCompletion(profile),
            accountAge: this.calculateAccountAge(profile),
            lastLoginAgo: this.calculateLastLoginAgo(profile),
            followerGrowth: this.calculateFollowerGrowth(profile),
            engagementRate: this.calculateEngagementRate(profile)
        };

        return stats;
    }

    calculateProfileCompletion(profile) {
        const fields = [
            'name', 'email', 'bio', 'website', 'location', 'avatar'
        ];
        
        const completedFields = fields.filter(field => {
            const value = profile[field];
            return value && value.trim() !== '';
        }).length;

        return Math.round((completedFields / fields.length) * 100);
    }

    calculateAccountAge(profile) {
        const joinDate = new Date(profile.joinDate);
        const now = new Date();
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    calculateLastLoginAgo(profile) {
        const lastLogin = new Date(profile.lastLogin);
        const now = new Date();
        const diffTime = Math.abs(now - lastLogin);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        return diffHours;
    }

    calculateFollowerGrowth(profile) {
        // This would require historical data
        // For now, return a placeholder
        return 0;
    }

    calculateEngagementRate(profile) {
        const totalInteractions = (profile.stats.likesReceived || 0) + (profile.stats.commentsPosted || 0);
        const totalContent = (profile.stats.articlesWritten || 0) + (profile.stats.commentsPosted || 0);
        
        if (totalContent === 0) return 0;
        
        return Math.round((totalInteractions / totalContent) * 100) / 100;
    }

    // Validation
    validateProfile(profile) {
        const errors = [];

        // Required fields
        if (!profile.name || profile.name.trim() === '') {
            errors.push('Name is required');
        }

        if (profile.name.length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (profile.name.length > 50) {
            errors.push('Name must not exceed 50 characters');
        }

        // Email validation
        if (profile.email && !this.isValidEmail(profile.email)) {
            errors.push('Invalid email address');
        }

        // URL validation
        if (profile.website && !this.isValidURL(profile.website)) {
            errors.push('Invalid website URL');
        }

        // Bio validation
        if (profile.bio && profile.bio.length > 500) {
            errors.push('Bio must not exceed 500 characters');
        }

        // Social media validation
        Object.entries(profile.social || {}).forEach(([platform, url]) => {
            if (url && !this.isValidSocialURL(platform, url)) {
                errors.push(`Invalid ${platform} URL`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isValidSocialURL(platform, url) {
        // Basic validation for social media URLs
        const socialPatterns = {
            twitter: /^https?:\/\/(www\.)?twitter\.com\/.+/,
            github: /^https?:\/\/(www\.)?github\.com\/.+/,
            linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
            facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
            instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/
        };

        const pattern = socialPatterns[platform.toLowerCase()];
        return pattern ? pattern.test(url) : this.isValidURL(url);
    }

    // Event handlers
    handleCreateProfile(detail) {
        try {
            const profile = this.createProfile(detail.userData);
            
            this.emitProfileEvent('createProfileSuccess', {
                profile,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('createProfileError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUpdateProfile(detail) {
        try {
            const profile = this.updateProfile(detail.userId, detail.updates);
            
            this.emitProfileEvent('updateProfileSuccess', {
                profile,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('updateProfileError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleDeleteProfile(detail) {
        try {
            const profile = this.deleteProfile(detail.userId, detail.password);
            
            this.emitProfileEvent('deleteProfileSuccess', {
                profile,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('deleteProfileError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleLogin(detail) {
        try {
            const user = this.login(detail.email, detail.password);
            
            this.emitProfileEvent('loginSuccess', {
                user,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('loginError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleLogout(detail) {
        try {
            const previousUser = this.logout();
            
            this.emitProfileEvent('logoutSuccess', {
                previousUser,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('logoutError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUpdatePreferences(detail) {
        try {
            const preferences = this.updatePreferences(detail.userId, detail.preferences);
            
            this.emitProfileEvent('updatePreferencesSuccess', {
                userId: detail.userId,
                preferences,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('updatePreferencesError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUpdatePrivacy(detail) {
        try {
            const privacy = this.updatePrivacy(detail.userId, detail.privacy);
            
            this.emitProfileEvent('updatePrivacySuccess', {
                userId: detail.userId,
                privacy,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('updatePrivacyError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUpdateSocial(detail) {
        try {
            const social = this.updateSocial(detail.userId, detail.social);
            
            this.emitProfileEvent('updateSocialSuccess', {
                userId: detail.userId,
                social,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('updateSocialError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleProfileSearch(detail) {
        const results = this.searchProfiles(detail.query, detail.filters);
        
        this.emitProfileEvent('profileSearchResults', {
            results,
            query: detail.query,
            filters: detail.filters,
            timestamp: Date.now()
        });
    }

    handleFollowUser(detail) {
        try {
            const result = this.followUser(detail.followerId, detail.followingId);
            
            this.emitProfileEvent('followUserSuccess', {
                result,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('followUserError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    handleUnfollowUser(detail) {
        try {
            const result = this.unfollowUser(detail.followerId, detail.followingId);
            
            this.emitProfileEvent('unfollowUserSuccess', {
                result,
                timestamp: Date.now()
            });
        } catch (error) {
            this.emitProfileEvent('unfollowUserError', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    // Event emission
    emitProfileEvent(type, data) {
        const event = new CustomEvent('userProfileManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Public API methods
    getPublicProfile(userId) {
        const profile = this.getProfile(userId);
        
        if (!profile || profile.privacy.profileVisibility === 'private') {
            return null;
        }

        // Return only public information
        return {
            id: profile.id,
            name: profile.name,
            bio: profile.bio,
            avatar: profile.avatar,
            website: profile.privacy.showWebsite ? profile.website : '',
            location: profile.privacy.showLocation ? profile.location : '',
            joinDate: profile.joinDate,
            stats: profile.stats,
            social: profile.social,
            isOnline: profile.privacy.showOnlineStatus ? this.isUserOnline(userId) : false
        };
    }

    isUserOnline(userId) {
        // This would typically check against a user activity tracking system
        // For now, return false (no online status tracking)
        return false;
    }

    // Cleanup
    destroy() {
        // Save final state
        this.saveProfiles();
        this.saveCurrentUser();
        
        // Remove event listeners
        document.removeEventListener('createProfile', this.handleCreateProfile);
        document.removeEventListener('updateProfile', this.handleUpdateProfile);
        document.removeEventListener('deleteProfile', this.handleDeleteProfile);
        document.removeEventListener('login', this.handleLogin);
        document.removeEventListener('logout', this.handleLogout);
        document.removeEventListener('updatePreferences', this.handleUpdatePreferences);
        document.removeEventListener('updatePrivacy', this.handleUpdatePrivacy);
        document.removeEventListener('updateSocial', this.handleUpdateSocial);
        document.removeEventListener('searchProfiles', this.handleProfileSearch);
        document.removeEventListener('followUser', this.handleFollowUser);
        document.removeEventListener('unfollowUser', this.handleUnfollowUser);
    }
}

// Create singleton instance
export const userProfileManager = new UserProfileManager();
