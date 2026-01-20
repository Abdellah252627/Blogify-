// Touch Gestures Support System
export class TouchGestureManager {
    constructor() {
        this.gestures = new Map();
        this.touchPoints = new Map();
        this.currentGesture = null;
        this.gestureConfig = {
            swipeThreshold: 50,
            swipeVelocity: 0.3,
            tapThreshold: 10,
            doubleTapThreshold: 300,
            longPressThreshold: 500,
            pinchThreshold: 20,
            rotationThreshold: 15
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGestureHandlers();
    }

    setupEventListeners() {
        // Touch events
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

        // Mouse events for desktop testing
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (this.currentGesture) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupGestureHandlers() {
        // Register common gestures
        this.registerGesture('swipe', this.handleSwipe.bind(this));
        this.registerGesture('tap', this.handleTap.bind(this));
        this.registerGesture('doubleTap', this.handleDoubleTap.bind(this));
        this.registerGesture('longPress', this.handleLongPress.bind(this));
        this.registerGesture('pinch', this.handlePinch.bind(this));
        this.registerGesture('rotate', this.handleRotate.bind(this));
        this.registerGesture('pan', this.handlePan.bind(this));
    }

    registerGesture(name, handler) {
        this.gestures.set(name, handler);
    }

    handleTouchStart(e) {
        const touches = Array.from(e.touches);
        
        touches.forEach((touch, index) => {
            this.touchPoints.set(touch.identifier, {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now(),
                lastTapTime: this.touchPoints.get(touch.identifier)?.lastTapTime || 0
            });
        });

        // Start gesture detection
        if (touches.length === 1) {
            this.currentGesture = 'single';
        } else if (touches.length === 2) {
            this.currentGesture = 'multi';
        }

        // Emit touch start event
        this.emitTouchEvent('touchStart', {
            touches: touches,
            gesture: this.currentGesture
        });
    }

    handleTouchMove(e) {
        const touches = Array.from(e.touches);
        
        touches.forEach(touch => {
            const point = this.touchPoints.get(touch.identifier);
            if (point) {
                point.currentX = touch.clientX;
                point.currentY = touch.clientY;
                point.moveX = touch.clientX - point.startX;
                point.moveY = touch.clientY - point.startY;
                point.velocityX = (touch.clientX - point.currentX) / 16; // ~60fps
                point.velocityY = (touch.clientY - point.currentY) / 16;
            }
        });

        // Handle multi-touch gestures
        if (touches.length === 2) {
            this.handleMultiTouchMove(touches);
        }

        // Emit touch move event
        this.emitTouchEvent('touchMove', {
            touches: touches,
            gesture: this.currentGesture,
            points: this.getTouchPoints()
        });
    }

    handleTouchEnd(e) {
        const touches = Array.from(e.changedTouches);
        const currentTime = Date.now();
        
        touches.forEach(touch => {
            const point = this.touchPoints.get(touch.identifier);
            if (point) {
                const duration = currentTime - point.startTime;
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - point.startX, 2) + 
                    Math.pow(touch.clientY - point.startY, 2)
                );

                // Detect gesture type
                this.detectGesture(point, duration, distance, touch);
                
                this.touchPoints.delete(touch.identifier);
            }
        });

        // Clear current gesture
        if (this.touchPoints.size === 0) {
            this.currentGesture = null;
        }

        // Emit touch end event
        this.emitTouchEvent('touchEnd', {
            touches: touches,
            gesture: this.currentGesture
        });
    }

    handleTouchCancel(e) {
        const touches = Array.from(e.changedTouches);
        
        touches.forEach(touch => {
            this.touchPoints.delete(touch.identifier);
        });

        this.currentGesture = null;

        // Emit touch cancel event
        this.emitTouchEvent('touchCancel', {
            touches: touches
        });
    }

    // Mouse event handlers for desktop testing
    handleMouseDown(e) {
        if (e.touches) return; // Ignore if touch event
        
        this.touchPoints.set('mouse', {
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
            startTime: Date.now(),
            lastTapTime: this.touchPoints.get('mouse')?.lastTapTime || 0
        });

        this.currentGesture = 'single';
    }

    handleMouseMove(e) {
        if (e.touches) return; // Ignore if touch event
        
        const point = this.touchPoints.get('mouse');
        if (point) {
            point.currentX = e.clientX;
            point.currentY = e.clientY;
            point.moveX = e.clientX - point.startX;
            point.moveY = e.clientY - point.startY;
        }
    }

    handleMouseUp(e) {
        if (e.touches) return; // Ignore if touch event
        
        const point = this.touchPoints.get('mouse');
        if (point) {
            const duration = Date.now() - point.startTime;
            const distance = Math.sqrt(
                Math.pow(e.clientX - point.startX, 2) + 
                Math.pow(e.clientY - point.startY, 2)
            );

            this.detectGesture(point, duration, distance, e);
            this.touchPoints.delete('mouse');
        }

        this.currentGesture = null;
    }

    handleMultiTouchMove(touches) {
        if (touches.length !== 2) return;

        const [touch1, touch2] = touches;
        const point1 = this.touchPoints.get(touch1.identifier);
        const point2 = this.touchPoints.get(touch2.identifier);

        if (point1 && point2) {
            // Calculate pinch and rotation
            const currentDistance = this.getDistance(touch1, touch2);
            const initialDistance = this.getDistance(
                { clientX: point1.startX, clientY: point1.startY },
                { clientX: point2.startX, clientY: point2.startY }
            );

            const scale = currentDistance / initialDistance;

            const currentAngle = this.getAngle(touch1, touch2);
            const initialAngle = this.getAngle(
                { clientX: point1.startX, clientY: point1.startY },
                { clientX: point2.startX, clientY: point2.startY }
            );

            const rotation = currentAngle - initialAngle;

            // Emit multi-touch events
            if (Math.abs(scale - 1) > this.gestureConfig.pinchThreshold / 100) {
                this.emitGestureEvent('pinch', {
                    scale: scale,
                    centerX: (touch1.clientX + touch2.clientX) / 2,
                    centerY: (touch1.clientY + touch2.clientY) / 2
                });
            }

            if (Math.abs(rotation) > this.gestureConfig.rotationThreshold) {
                this.emitGestureEvent('rotate', {
                    rotation: rotation,
                    centerX: (touch1.clientX + touch2.clientX) / 2,
                    centerY: (touch1.clientY + touch2.clientY) / 2
                });
            }
        }
    }

    detectGesture(point, duration, distance, touch) {
        // Long press detection
        if (duration > this.gestureConfig.longPressThreshold && distance < this.gestureConfig.tapThreshold) {
            this.emitGestureEvent('longPress', {
                x: touch.clientX,
                y: touch.clientY,
                target: touch.target
            });
            return;
        }

        // Double tap detection
        const timeSinceLastTap = Date.now() - point.lastTapTime;
        if (distance < this.gestureConfig.tapThreshold && 
            duration < this.gestureConfig.doubleTapThreshold && 
            timeSinceLastTap < this.gestureConfig.doubleTapThreshold) {
            this.emitGestureEvent('doubleTap', {
                x: touch.clientX,
                y: touch.clientY,
                target: touch.target
            });
            return;
        }

        // Tap detection
        if (distance < this.gestureConfig.tapThreshold && duration < this.gestureConfig.doubleTapThreshold) {
            this.emitGestureEvent('tap', {
                x: touch.clientX,
                y: touch.clientY,
                target: touch.target
            });
            return;
        }

        // Swipe detection
        if (distance > this.gestureConfig.swipeThreshold) {
            const angle = Math.atan2(touch.clientY - point.startY, touch.clientX - point.startX);
            const direction = this.getSwipeDirection(angle);
            
            this.emitGestureEvent('swipe', {
                direction: direction,
                distance: distance,
                velocity: Math.sqrt(Math.pow(point.velocityX, 2) + Math.pow(point.velocityY, 2)),
                startX: point.startX,
                startY: point.startY,
                endX: touch.clientX,
                endY: touch.clientY,
                target: touch.target
            });
            return;
        }

        // Pan detection
        if (distance > this.gestureConfig.tapThreshold) {
            this.emitGestureEvent('pan', {
                deltaX: touch.clientX - point.startX,
                deltaY: touch.clientY - point.startY,
                startX: point.startX,
                startY: point.startY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                target: touch.target
            });
        }
    }

    handleSwipe(data) {
        // Handle swipe gestures for navigation
        switch (data.direction) {
            case 'left':
                this.handleSwipeLeft(data);
                break;
            case 'right':
                this.handleSwipeRight(data);
                break;
            case 'up':
                this.handleSwipeUp(data);
                break;
            case 'down':
                this.handleSwipeDown(data);
                break;
        }
    }

    handleTap(data) {
        // Handle tap gestures
        const target = data.target;
        
        // Check if target is clickable
        if (target.closest('a, button, .clickable, .article-card')) {
            // Simulate click
            target.click();
        } else {
            // Emit tap event for custom handling
            this.emitGestureEvent('tapHandled', data);
        }
    }

    handleDoubleTap(data) {
        // Handle double tap for zoom or special actions
        this.emitGestureEvent('doubleTapHandled', data);
    }

    handleLongPress(data) {
        // Handle long press for context menu
        this.emitGestureEvent('longPressHandled', data);
    }

    handlePinch(data) {
        // Handle pinch for zoom
        this.emitGestureEvent('pinchHandled', data);
    }

    handleRotate(data) {
        // Handle rotation
        this.emitGestureEvent('rotateHandled', data);
    }

    handlePan(data) {
        // Handle pan for scrolling or dragging
        this.emitGestureEvent('panHandled', data);
    }

    handleSwipeLeft(data) {
        // Navigate to next page or item
        this.emitNavigationEvent('next', data);
    }

    handleSwipeRight(data) {
        // Navigate to previous page or item
        this.emitNavigationEvent('previous', data);
    }

    handleSwipeUp(data) {
        // Scroll up or minimize
        this.emitNavigationEvent('up', data);
    }

    handleSwipeDown(data) {
        // Scroll down or expand
        this.emitNavigationEvent('down', data);
    }

    // Utility methods
    getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }

    getAngle(touch1, touch2) {
        return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    }

    getSwipeDirection(angle) {
        const degrees = angle * 180 / Math.PI;
        
        if (degrees >= -45 && degrees < 45) {
            return 'right';
        } else if (degrees >= 45 && degrees < 135) {
            return 'down';
        } else if (degrees >= 135 || degrees < -135) {
            return 'left';
        } else {
            return 'up';
        }
    }

    getTouchPoints() {
        const points = [];
        this.touchPoints.forEach(point => {
            points.push({
                x: point.currentX,
                y: point.currentY,
                deltaX: point.moveX,
                deltaY: point.moveY,
                velocityX: point.velocityX,
                velocityY: point.velocityY
            });
        });
        return points;
    }

    emitGestureEvent(type, data) {
        const handler = this.gestures.get(type);
        if (handler) {
            handler(data);
        }

        // Emit custom event
        const event = new CustomEvent('gesture', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    emitTouchEvent(type, data) {
        const event = new CustomEvent('touchEvent', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    emitNavigationEvent(direction, data) {
        const event = new CustomEvent('navigation', {
            detail: {
                direction: direction,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Configuration methods
    setGestureConfig(config) {
        this.gestureConfig = { ...this.gestureConfig, ...config };
    }

    getGestureConfig() {
        return { ...this.gestureConfig };
    }

    // Enable/disable specific gestures
    enableGesture(name) {
        // Implementation would depend on specific gesture system
    }

    disableGesture(name) {
        // Implementation would depend on specific gesture system
    }

    // Touch detection utilities
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    getTouchSupport() {
        return {
            touch: this.isTouchDevice(),
            mobile: this.isMobileDevice(),
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchAction: window.CSS && CSS.supports('touch-action', 'none')
        };
    }

    // Cleanup
    destroy() {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchcancel', this.handleTouchCancel);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        this.gestures.clear();
        this.touchPoints.clear();
        this.currentGesture = null;
    }
}

// Create singleton instance
export const touchGestureManager = new TouchGestureManager();
