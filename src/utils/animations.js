// Smooth Animations and Transitions System
export class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.animationDuration = 300;
        this.easingFunctions = {
            ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
            easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
            easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
            easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
            easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
            easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
            easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
            easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
            easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
            easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
            easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupIntersectionObserver();
        this.setupReducedMotionListener();
        this.setupAnimationQueue();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Animation base styles */
            .animate {
                animation-duration: ${this.animationDuration}ms;
                animation-fill-mode: both;
                animation-timing-function: var(--animation-easing, ease);
            }

            .animate-in {
                animation-name: fadeIn;
            }

            .animate-out {
                animation-name: fadeOut;
            }

            .animate-up {
                animation-name: slideUp;
            }

            .animate-down {
                animation-name: slideDown;
            }

            .animate-left {
                animation-name: slideLeft;
            }

            .animate-right {
                animation-name: slideRight;
            }

            .animate-scale {
                animation-name: scale;
            }

            .animate-rotate {
                animation-name: rotate;
            }

            .animate-bounce {
                animation-name: bounce;
            }

            .animate-pulse {
                animation-name: pulse;
            }

            .animate-shake {
                animation-name: shake;
            }

            .animate-flash {
                animation-name: flash;
            }

            /* Keyframe animations */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes slideDown {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes slideLeft {
                from {
                    transform: translateX(20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideRight {
                from {
                    transform: translateX(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes scale {
                from {
                    transform: scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes rotate {
                from {
                    transform: rotate(-180deg);
                    opacity: 0;
                }
                to {
                    transform: rotate(0);
                    opacity: 1;
                }
            }

            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0, 0, 0);
                }
                40%, 43% {
                    transform: translate3d(0, -30px, 0);
                }
                70% {
                    transform: translate3d(0, -15px, 0);
                }
                90% {
                    transform: translate3d(0, -4px, 0);
                }
            }

            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }

            @keyframes shake {
                0%, 100% {
                    transform: translateX(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateX(-10px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateX(10px);
                }
            }

            @keyframes flash {
                0%, 50%, 100% {
                    opacity: 1;
                }
                25%, 75% {
                    opacity: 0;
                }
            }

            /* Stagger animations */
            .stagger-children > * {
                animation-delay: calc(var(--stagger-delay, 100ms) * var(--stagger-index, 0));
            }

            /* Hover animations */
            .hover-lift {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .hover-lift:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .hover-scale {
                transition: transform 0.3s ease;
            }

            .hover-scale:hover {
                transform: scale(1.05);
            }

            .hover-rotate {
                transition: transform 0.3s ease;
            }

            .hover-rotate:hover {
                transform: rotate(5deg);
            }

            /* Loading animations */
            .loading-spinner {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

            .loading-dots {
                display: inline-flex;
                gap: 4px;
            }

            .loading-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: loadingDot 1.4s infinite ease-in-out both;
            }

            .loading-dots span:nth-child(1) {
                animation-delay: -0.32s;
            }

            .loading-dots span:nth-child(2) {
                animation-delay: -0.16s;
            }

            @keyframes loadingDot {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Page transitions */
            .page-transition-enter {
                animation: pageEnter 0.5s ease-out;
            }

            .page-transition-leave {
                animation: pageLeave 0.5s ease-in;
            }

            @keyframes pageEnter {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes pageLeave {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-100px);
                }
            }

            /* Modal animations */
            .modal-enter {
                animation: modalEnter 0.3s ease-out;
            }

            .modal-leave {
                animation: modalLeave 0.3s ease-in;
            }

            @keyframes modalEnter {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes modalLeave {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9);
                }
            }

            /* Notification animations */
            .notification-enter {
                animation: notificationEnter 0.3s ease-out;
            }

            .notification-leave {
                animation: notificationLeave 0.3s ease-in;
            }

            @keyframes notificationEnter {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes notificationLeave {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }

                .animate,
                .hover-lift,
                .hover-scale,
                .hover-rotate {
                    animation: none !important;
                    transition: none !important;
                }

                .loading-spinner {
                    animation: none;
                    border: 2px solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                }
            }

            /* Performance optimizations */
            .will-change-transform {
                will-change: transform;
            }

            .will-change-opacity {
                will-change: opacity;
            }

            .gpu-accelerated {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
        `;
        document.head.appendChild(style);
    }

    setupIntersectionObserver() {
        // Observe elements for scroll animations
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Auto-observe elements with animation classes
        this.observeAnimatedElements();
    }

    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener((matches) => {
            this.isReducedMotion = matches;
            this.emitAnimationEvent('reducedMotionChanged', {
                isReducedMotion: matches,
                timestamp: Date.now()
            });
        });
    }

    setupAnimationQueue() {
        this.animationQueue = [];
        this.isProcessingQueue = false;
    }

    observeAnimatedElements() {
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(element => {
            const animation = element.dataset.animate;
            element.classList.add('animate', animation);
            this.intersectionObserver.observe(element);
        });
    }

    // Animation methods
    animateElement(element, animation, options = {}) {
        if (this.isReducedMotion) {
            return Promise.resolve();
        }

        const config = {
            duration: options.duration || this.animationDuration,
            easing: options.easing || 'ease',
            delay: options.delay || 0,
            onComplete: options.onComplete || (() => {}),
            onStart: options.onStart || (() => {})
        };

        return new Promise((resolve) => {
            // Remove existing animation classes
            element.classList.remove('animate', ...this.getAnimationClasses());
            
            // Add new animation classes
            element.classList.add('animate', animation);
            
            // Set CSS variables
            element.style.setProperty('--animation-easing', this.easingFunctions[config.easing]);
            element.style.setProperty('--animation-duration', `${config.duration}ms`);
            element.style.setProperty('--animation-delay', `${config.delay}ms`);
            
            // Start animation
            config.onStart();
            
            // Handle completion
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                config.onComplete();
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    animateElements(elements, animation, options = {}) {
        const promises = Array.from(elements).map((element, index) => {
            const staggerDelay = options.stagger ? index * (options.staggerDelay || 100) : 0;
            return this.animateElement(element, animation, {
                ...options,
                delay: (options.delay || 0) + staggerDelay
            });
        });
        
        return Promise.all(promises);
    }

    fadeIn(element, options = {}) {
        return this.animateElement(element, 'animate-in', options);
    }

    fadeOut(element, options = {}) {
        return this.animateElement(element, 'animate-out', options);
    }

    slideUp(element, options = {}) {
        return this.animateElement(element, 'animate-up', options);
    }

    slideDown(element, options = {}) {
        return this.animateElement(element, 'animate-down', options);
    }

    slideLeft(element, options = {}) {
        return this.animateElement(element, 'animate-left', options);
    }

    slideRight(element, options = {}) {
        return this.animateElement(element, 'animate-right', options);
    }

    scale(element, options = {}) {
        return this.animateElement(element, 'animate-scale', options);
    }

    bounce(element, options = {}) {
        return this.animateElement(element, 'animate-bounce', options);
    }

    pulse(element, options = {}) {
        return this.animateElement(element, 'animate-pulse', options);
    }

    shake(element, options = {}) {
        return this.animateElement(element, 'animate-shake', options);
    }

    // Stagger animations
    staggerIn(elements, options = {}) {
        return this.animateElements(elements, 'animate-in', {
            stagger: true,
            ...options
        });
    }

    staggerUp(elements, options = {}) {
        return this.animateElements(elements, 'animate-up', {
            stagger: true,
            ...options
        });
    }

    staggerScale(elements, options = {}) {
        return this.animateElements(elements, 'animate-scale', {
            stagger: true,
            ...options
        });
    }

    // Page transitions
    pageTransition(type, options = {}) {
        const page = document.querySelector('.page-content') || document.body;
        
        if (type === 'enter') {
            page.classList.add('page-transition-enter');
            setTimeout(() => {
                page.classList.remove('page-transition-enter');
            }, 500);
        } else if (type === 'leave') {
            page.classList.add('page-transition-leave');
            setTimeout(() => {
                page.classList.remove('page-transition-leave');
            }, 500);
        }
    }

    // Modal animations
    showModal(modal, options = {}) {
        modal.classList.add('modal-enter');
        setTimeout(() => {
            modal.classList.remove('modal-enter');
        }, 300);
    }

    hideModal(modal, options = {}) {
        modal.classList.add('modal-leave');
        setTimeout(() => {
            modal.classList.remove('modal-leave');
        }, 300);
    }

    // Notification animations
    showNotification(notification, options = {}) {
        notification.classList.add('notification-enter');
        setTimeout(() => {
            notification.classList.remove('notification-enter');
        }, 300);
    }

    hideNotification(notification, options = {}) {
        notification.classList.add('notification-leave');
        setTimeout(() => {
            notification.classList.remove('notification-leave');
        }, 300);
    }

    // Loading animations
    showLoadingSpinner(container, options = {}) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
        `;
        
        container.appendChild(spinner);
        return spinner;
    }

    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }

    showLoadingDots(container, options = {}) {
        const dots = document.createElement('div');
        dots.className = 'loading-dots';
        dots.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        container.appendChild(dots);
        return dots;
    }

    hideLoadingDots(dots) {
        if (dots && dots.parentNode) {
            dots.parentNode.removeChild(dots);
        }
    }

    // Hover effects
    addHoverEffect(element, type = 'lift') {
        element.classList.add(`hover-${type}`);
    }

    removeHoverEffect(element, type = 'lift') {
        element.classList.remove(`hover-${type}`);
    }

    // Scroll animations
    scrollToElement(element, options = {}) {
        const config = {
            duration: options.duration || 500,
            easing: options.easing || 'easeInOutCubic',
            offset: options.offset || 0,
            onComplete: options.onComplete || (() => {})
        };

        const targetPosition = element.offsetTop - config.offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            
            const easeProgress = this.easeInOutCubic(progress);
            const currentPosition = startPosition + (distance * easeProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                config.onComplete();
            }
        };

        requestAnimationFrame(animateScroll);
    }

    // Easing functions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Utility methods
    getAnimationClasses() {
        return [
            'animate-in', 'animate-out', 'animate-up', 'animate-down',
            'animate-left', 'animate-right', 'animate-scale', 'animate-rotate',
            'animate-bounce', 'animate-pulse', 'animate-shake', 'animate-flash'
        ];
    }

    setAnimationDuration(duration) {
        this.animationDuration = duration;
        document.documentElement.style.setProperty('--animation-duration', `${duration}ms`);
    }

    setEasingFunction(name, easing) {
        this.easingFunctions[name] = easing;
    }

    // Performance optimization
    optimizeForPerformance() {
        // Add GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.animate');
        animatedElements.forEach(element => {
            element.classList.add('gpu-accelerated');
        });

        // Use will-change for complex animations
        const complexElements = document.querySelectorAll('.animate-scale, .animate-rotate');
        complexElements.forEach(element => {
            element.classList.add('will-change-transform');
        });
    }

    // Event emission
    emitAnimationEvent(type, data) {
        const event = new CustomEvent('animationManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    pauseAnimations() {
        const animatedElements = document.querySelectorAll('.animate');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const animatedElements = document.querySelectorAll('.animate');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }

    stopAnimations() {
        const animatedElements = document.querySelectorAll('.animate');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = '';
        });
    }

    // Cleanup
    destroy() {
        // Disconnect intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // Remove event listeners
        // (Would need to store references to remove them properly)
    }
}

// Create singleton instance
export const animationManager = new AnimationManager();
