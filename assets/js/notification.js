/**
 * HyperOS Notification System
 * Modern, responsive notification system with mobile/desktop modes
 * Compatible with original HyperOS styling
 */

class HyperOSNotification {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.maxDesktopNotifications = 8;
        this.maxMobileNotifications = 3;
        this.autoIncrementId = 0;
        
        // Default configurations - SAME AS ORIGINAL HTML
        this.config = {
            sukses: {
                icon: "check_circle",
                title: "Berhasil",
                msg: "Data berhasil sinkron",
                color: "#34c759"
            },
            gagal: {
                icon: "error",
                title: "Gagal",
                msg: "Terjadi kesalahan sistem",
                color: "#ff3b30"
            },
            peringatan: {
                icon: "warning",
                title: "Peringatan",
                msg: "Baterai mulai lemah",
                color: "#ff9500"
            },
            informasi: {
                icon: "info",
                title: "Info",
                msg: "Pembaruan tersedia",
                color: "#007aff"
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize the notification system
     */
    init() {
        // Create container if not exists
        if (!document.getElementById('hyperos-notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'hyperos-notification-container';
            this.container.className = 'hyperos-notification-container';
            document.body.appendChild(this.container);
            
            // Load Material Icons and Inter font
            this.loadFonts();
            
            // Set initial mode
            this.updateMode();
            
            // Listen for resize events
            window.addEventListener('resize', () => this.updateMode());
            
            console.log('🔔 HyperOS Notification System Initialized');
        } else {
            this.container = document.getElementById('hyperos-notification-container');
        }
    }
    
    /**
     * Load required fonts
     */
    loadFonts() {
        // Material Icons
        if (!document.querySelector('link[href*="material-icons"]')) {
            const materialLink = document.createElement('link');
            materialLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
            materialLink.rel = 'stylesheet';
            materialLink.crossOrigin = 'anonymous';
            document.head.appendChild(materialLink);
        }
        
        // Inter font
        if (!document.querySelector('link[href*="inter"]')) {
            const interLink = document.createElement('link');
            interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            interLink.rel = 'stylesheet';
            interLink.crossOrigin = 'anonymous';
            document.head.appendChild(interLink);
        }
    }
    
    /**
     * Update container mode (mobile/desktop) based on screen width
     */
    updateMode() {
        const isDesktop = window.innerWidth > 768;
        const currentMode = this.container.classList.contains('desktop-mode') ? 'desktop' : 'mobile';
        const newMode = isDesktop ? 'desktop-mode' : 'mobile-mode';
        
        if ((isDesktop && currentMode !== 'desktop') || (!isDesktop && currentMode !== 'mobile')) {
            this.container.className = `hyperos-notification-container ${newMode}`;
            
            // Update all active notifications
            this.notifications.forEach((notification) => {
                if (!notification.isDead) {
                    notification.isDesktop = isDesktop;
                    this.updateNotificationUI(notification);
                }
            });
        }
    }
    
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @returns {string} Notification ID
     */
    show(options) {
        const {
            type = 'informasi',
            title = null,
            message = null,
            duration = 4000,
            icon = null,
            dismissible = true
        } = options;
        
        // Type mapping for compatibility
        const typeMap = {
            'success': 'sukses',
            'error': 'gagal',
            'warning': 'peringatan',
            'info': 'informasi'
        };
        
        const finalType = typeMap[type] || type;
        
        // Use default config if title/message not provided
        const config = this.config[finalType] || this.config.informasi;
        const finalTitle = title || config.title;
        const finalMessage = message || config.msg;
        const finalIcon = icon || config.icon;
        const finalColor = config.color;
        
        const id = `hyperos-notif-${Date.now()}-${this.autoIncrementId++}`;
        const isDesktop = window.innerWidth > 768;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `hyperos-notification ${finalType} spawn`;
        
        // Prepare classes for desktop animation
        const iconClass = isDesktop ? 'hyperos-stagger' : '';
        const textSmallClass = isDesktop ? 'hyperos-stagger' : '';
        const textMainClass = isDesktop ? 'hyperos-stagger' : '';
        
        // Build notification HTML - SAME STRUCTURE AS ORIGINAL
        notification.innerHTML = `
            <div class="hyperos-notification-icon ${iconClass}">
                <div class="hyperos-icon-blob">
                    <span class="material-icons-round">${finalIcon}</span>
                </div>
            </div>
            <div class="hyperos-notification-text">
                <div class="hyperos-text-small ${textSmallClass}">${finalTitle}</div>
                <div class="hyperos-text-main ${textMainClass}">${finalMessage}</div>
            </div>
            <div class="hyperos-progress-track">
                <div class="hyperos-progress-bar" id="hyperos-pb-${id}"></div>
            </div>
        `;
        
        const notificationData = {
            id,
            element: notification,
            isDead: false,
            duration,
            isDesktop,
            type: finalType,
            createdAt: Date.now(),
            timer: null,
            dismissible,
            pausedProgress: null
        };
        
        // Store notification
        this.notifications.set(id, notificationData);
        
        // Add to container
        this.container.appendChild(notification);
        
        // Animate in with exact timing as original
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.refreshUI();
                
                // Start progress bar
                const progressBar = notification.querySelector(`#hyperos-pb-${id}`);
                if (progressBar && duration > 0) {
                    progressBar.style.transition = `transform ${duration}ms linear`;
                    progressBar.style.transform = isDesktop ? "scaleY(1)" : "scaleX(1)";
                    
                    // Trigger animation
                    requestAnimationFrame(() => {
                        progressBar.style.transform = isDesktop ? "scaleY(0)" : "scaleX(0)";
                    });
                }
            }, 40);
        });
        
        // Set auto-dismiss timer if duration > 0
        if (duration > 0) {
            notificationData.timer = setTimeout(() => this.dismiss(id), duration);
        }
        
        // Desktop hover interactions
        if (isDesktop && dismissible) {
            notification.addEventListener('mouseenter', () => this.pauseDismiss(id));
            notification.addEventListener('mouseleave', () => this.resumeDismiss(id));
        } else if (!isDesktop && dismissible) {
            // Mobile swipe to dismiss
            this.bindSwipe(notificationData);
        }
        
        // Limit number of notifications
        this.cleanupExcessNotifications(isDesktop);
        
        return id;
    }
    
    /**
     * Update notification UI based on position in stack
     */
    refreshUI() {
        const isDesktop = this.container.classList.contains('desktop-mode');
        const aliveNotifications = Array.from(this.notifications.values())
            .filter(item => !item.isDead)
            .sort((a, b) => b.createdAt - a.createdAt); // Newest first
        
        aliveNotifications.forEach((notification, index) => {
            const element = notification.element;
            
            // Remove all state classes
            element.classList.remove('spawn', 'active', 'layer-1', 'layer-2');
            
            if (isDesktop) {
                // Stack vertically for desktop
                const yOffset = index * -(145 + 12);
                element.style.setProperty('--y-offset', `${yOffset}px`);
                element.classList.add('active');
            } else {
                // Mobile: Only show top 3 notifications
                const delay = Math.min(index * 0.05, 0.3);
                element.style.transitionDelay = `${delay}s`;
                
                if (index === 0) element.classList.add('active');
                else if (index === 1) element.classList.add('layer-1');
                else if (index === 2) element.classList.add('layer-2');
                else element.classList.add('layer-2'); // Others also layer-2
            }
        });
    }
    
    /**
     * Update individual notification UI after mode change
     */
    updateNotificationUI(notification) {
        const element = notification.element;
        
        // Update progress bar orientation
        const progressBar = element.querySelector('.hyperos-progress-bar');
        if (progressBar && !notification.isDead) {
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.match(/\d+\.?\d*/)[0]) : 1;
            
            progressBar.style.transform = notification.isDesktop ? 
                `scaleY(${currentScale})` : `scaleX(${currentScale})`;
        }
        
        this.refreshUI();
    }
    
    /**
     * Dismiss a notification
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        notification.isDead = true;
        clearTimeout(notification.timer);
        
        const element = notification.element;
        element.classList.add('exit');
        element.classList.remove('active', 'layer-1', 'layer-2');
        
        // Remove event listeners
        element.replaceWith(element.cloneNode(true));
        
        this.refreshUI();
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 800);
    }
    
    /**
     * Pause auto-dismiss on hover (desktop only)
     */
    pauseDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || notification.duration <= 0) return;
        
        clearTimeout(notification.timer);
        
        const progressBar = notification.element.querySelector('.hyperos-progress-bar');
        if (progressBar) {
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.match(/\d+\.?\d*/)[0]) : 1;
            
            progressBar.style.transitionDuration = '0ms';
            notification.pausedProgress = currentScale;
        }
    }
    
    /**
     * Resume auto-dismiss after hover (desktop only)
     */
    resumeDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || notification.duration <= 0) return;
        
        setTimeout(() => {
            if (notification.isDead) return;
            
            const progressBar = notification.element.querySelector('.hyperos-progress-bar');
            if (progressBar && notification.pausedProgress !== undefined && notification.pausedProgress !== null) {
                const remaining = Math.max(1000, notification.duration * notification.pausedProgress);
                
                progressBar.style.transition = `transform ${remaining}ms linear`;
                progressBar.style.transform = notification.isDesktop ? "scaleY(0)" : "scaleX(0)";
                
                notification.timer = setTimeout(() => this.dismiss(id), remaining);
                notification.pausedProgress = null;
            }
        }, 500);
    }
    
    /**
     * Bind swipe gesture for mobile dismiss
     */
    bindSwipe(notification) {
        let startY = 0;
        let isSwiping = false;
        const element = notification.element;
        const threshold = 40;
        
        element.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;
            
            if (diff > 0) {
                const opacity = 1 - (diff / 100);
                const translateY = Math.min(diff, 50);
                
                element.style.opacity = opacity;
                element.style.transform = `translate(-50%, ${25 - translateY}px)`;
            }
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            
            isSwiping = false;
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (diff > threshold) {
                this.dismiss(notification.id);
            } else {
                element.style.opacity = '';
                element.style.transform = '';
            }
        }, { passive: true });
    }
    
    /**
     * Remove excess notifications
     */
    cleanupExcessNotifications(isDesktop) {
        const maxNotifications = isDesktop ? this.maxDesktopNotifications : this.maxMobileNotifications;
        const activeNotifications = Array.from(this.notifications.values())
            .filter(item => !item.isDead && item.isDesktop === isDesktop)
            .sort((a, b) => a.createdAt - b.createdAt); // Oldest first
        
        if (activeNotifications.length > maxNotifications) {
            const notificationsToRemove = activeNotifications.slice(0, activeNotifications.length - maxNotifications);
            notificationsToRemove.forEach(item => this.dismiss(item.id));
        }
    }
    
    /**
     * Clear all notifications
     */
    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.dismiss(id);
        });
    }
    
    /**
     * Quick method to show success notification
     */
    success(title, message, duration = 4000) {
        return this.show({
            type: 'sukses',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show error notification
     */
    error(title, message, duration = 5000) {
        return this.show({
            type: 'gagal',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show warning notification
     */
    warning(title, message, duration = 4000) {
        return this.show({
            type: 'peringatan',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show info notification
     */
    info(title, message, duration = 3000) {
        return this.show({
            type: 'informasi',
            title,
            message,
            duration
        });
    }
    
    /**
     * Show persistent notification (no auto-dismiss)
     */
    persistent(type, title, message, icon = null) {
        return this.show({
            type,
            title,
            message,
            duration: 0,
            icon
        });
    }
    
    /**
     * Update existing notification
     */
    update(id, options) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        const { title, message, type, icon } = options;
        const element = notification.element;
        
        if (title) {
            const titleEl = element.querySelector('.hyperos-text-small');
            if (titleEl) titleEl.textContent = title;
        }
        
        if (message) {
            const messageEl = element.querySelector('.hyperos-text-main');
            if (messageEl) messageEl.textContent = message;
        }
        
        if (type && (this.config[type] || type === 'sukses' || type === 'gagal' || type === 'peringatan' || type === 'informasi')) {
            // Remove old type classes
            element.classList.remove('sukses', 'gagal', 'peringatan', 'informasi');
            element.classList.add(type);
            
            if (!icon) {
                const iconEl = element.querySelector('.material-icons-round');
                if (iconEl) iconEl.textContent = this.config[type]?.icon || 'info';
            }
        }
        
        if (icon) {
            const iconEl = element.querySelector('.material-icons-round');
            if (iconEl) iconEl.textContent = icon;
        }
    }
    
    /**
     * Update default configuration
     */
    setConfig(type, config) {
        if (this.config[type]) {
            this.config[type] = { ...this.config[type], ...config };
        }
    }
    
    /**
     * Add custom notification type
     */
    addType(type, config) {
        this.config[type] = config;
    }
    
    /**
     * Get notification count
     */
    getCount() {
        return Array.from(this.notifications.values()).filter(item => !item.isDead).length;
    }
    
    /**
     * Check if notification system is ready
     */
    isReady() {
        return this.container !== null;
    }
}

// Initialize and setup global access
let HyperOSNotifications;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        HyperOSNotifications = new HyperOSNotification();
        setupGlobalAccess();
    });
} else {
    HyperOSNotifications = new HyperOSNotification();
    setupGlobalAccess();
}

function setupGlobalAccess() {
    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HyperOSNotifications;
    }
    
    // Attach to window for global access
    window.HyperOS = window.HyperOS || {};
    window.HyperOS.Notifications = HyperOSNotifications;
    
    // Quick access methods with error handling
    window.notify = {
        // Quick methods
        success: (title, message, duration) => {
            try {
                return HyperOSNotifications.success(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        error: (title, message, duration) => {
            try {
                return HyperOSNotifications.error(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        warning: (title, message, duration) => {
            try {
                return HyperOSNotifications.warning(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        info: (title, message, duration) => {
            try {
                return HyperOSNotifications.info(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        
        // Persistent notifications
        persistent: (type, title, message, icon) => {
            try {
                return HyperOSNotifications.persistent(type, title, message, icon);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        
        // Advanced methods
        show: (options) => {
            try {
                return HyperOSNotifications.show(options);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        update: (id, options) => {
            try {
                return HyperOSNotifications.update(id, options);
            } catch (error) {
                console.error('Notification error:', error);
                return false;
            }
        },
        dismiss: (id) => {
            try {
                return HyperOSNotifications.dismiss(id);
            } catch (error) {
                console.error('Notification error:', error);
                return false;
            }
        },
        clearAll: () => {
            try {
                return HyperOSNotifications.clearAll();
            } catch (error) {
                console.error('Notification error:', error);
                return false;
            }
        },
        
        // Info methods
        getCount: () => HyperOSNotifications.getCount(),
        isReady: () => HyperOSNotifications.isReady(),
        
        // Configuration methods
        setConfig: (type, config) => HyperOSNotifications.setConfig(type, config),
        addType: (type, config) => HyperOSNotifications.addType(type, config)
    };
    
    console.log('🔔 HyperOS Notification System Ready');
    console.log('📱 Available methods: notify.success(), notify.error(), notify.warning(), notify.info()');
    console.log('⚙️  Advanced: notify.show(options), notify.dismiss(id), notify.clearAll()');
}

// Auto-demo on page load (optional, can be removed)
if (window.location.href.includes('demo=true')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            notify.success("Sistem Siap", "Notifikasi berhasil dimuat");
        }, 1000);
    });
}

// Support for CommonJS, AMD, and browser globals
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return HyperOSNotifications;
    });
}

// Error boundary for initialization
window.addEventListener('error', function(e) {
    if (e.message.includes('HyperOS') || e.message.includes('notify')) {
        console.warn('HyperOS Notification System encountered an error, attempting recovery...');
        
        // Try to reinitialize
        setTimeout(() => {
            if (!window.HyperOS?.Notifications?.isReady?.()) {
                HyperOSNotifications = new HyperOSNotification();
                setupGlobalAccess();
            }
        }, 1000);
    }
});
