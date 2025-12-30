/**
 * Notification System v4.2 - Enhanced Gesture Library
 * 
 * Perbaikan gesture:
 * - Threshold yang lebih fleksibel berdasarkan kecepatan (velocity-based)
 * - Smooth rubber band effect saat drag
 * - Animasi yang lebih natural dengan easing yang tepat
 * - Detection yang lebih akurat untuk swipe cepat
 * 
 * Cara Pakai:
 * notify.success('Judul', 'Pesan', 5000);
 */

class NotificationSystem {
    constructor() {
        // Core elements
        this.container = null;
        this.notifications = new Map();
        this.autoId = 0;
        
        // Configuration
        this.config = {
            success: { icon: "check_circle", title: "Berhasil", msg: "Operasi berhasil" },
            error: { icon: "error", title: "Gagal", msg: "Terjadi kesalahan" },
            warning: { icon: "warning", title: "Peringatan", msg: "Perhatian diperlukan" },
            info: { icon: "info", title: "Info", msg: "Informasi" }
        };

        // Engine state
        this.isLoopRunning = false;
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
        
        // Enhanced gesture constants
        this.MAX_DESKTOP = 8;
        this.MAX_MOBILE = 3;
        
        // Gesture settings - FLEKSIBEL
        this.GESTURE = {
            // Threshold dalam pixels
            DISMISS_THRESHOLD: 80,  // Lebih kecil dari sebelumnya
            MIN_SWIPE_DISTANCE: 40, // Minimal swipe untuk dianggap
            MAX_SWIPE_TIME: 500,    // Max waktu untuk swipe cepat (ms)
            
            // Rubber band effect
            RUBBER_BAND_STRENGTH: 0.5, // 0-1, semakin kecil semakin kuat rubber band
            RETURN_SPEED: 0.3,         // Kecepatan kembali ke posisi awal
            
            // Velocity thresholds (pixels/ms)
            MIN_VELOCITY: 0.3,         // Kecepatan minimal untuk dismiss
            VELOCITY_MULTIPLIER: 15,   // Pengali untuk velocity-based dismissal
            
            // Easing functions
            EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
            EASE_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        };

        // Initialization
        this.init();
    }

    /**
     * Inisialisasi sistem notifikasi
     */
    init() {
        // 1. Load required fonts
        this.loadFonts();
        
        // 2. Create notification container
        this.createContainer();
        
        // 3. Setup event listeners
        this.setupEventListeners();
        
        // 4. Start engine
        this.startEngine();
    }

    /**
     * Memuat font Material Icons dan Inter
     */
    loadFonts() {
        // Material Icons
        if (!document.querySelector('link[href*="material-icons"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        // Inter Font
        if (!document.querySelector('link[href*="inter"]')) {
            const interLink = document.createElement('link');
            interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            interLink.rel = 'stylesheet';
            document.head.appendChild(interLink);
        }
    }

    /**
     * Membuat container untuk notifikasi
     */
    createContainer() {
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            this.container.style.zIndex = '999999';
            document.body.appendChild(this.container);
            this.updateContainerMode();
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateContainerMode();
            }, 100);
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseEngine();
            } else {
                this.startEngine();
            }
        });
    }

    /**
     * Update mode container berdasarkan ukuran layar
     */
    updateContainerMode() {
        if (!this.container) return;
        
        const isDesktop = window.innerWidth > 768;
        this.container.className = `notification-container ${isDesktop ? 'desktop-mode' : 'mobile-mode'}`;
        
        // Update mode untuk semua notifikasi aktif
        this.notifications.forEach(notification => {
            if (!notification.isDead) {
                notification.isDesktop = isDesktop;
                // Reset state saat resize
                notification.dragX = 0;
                notification.dragY = 0;
                this.applyTransform(notification);
            }
        });
    }

    /**
     * Menampilkan notifikasi baru
     */
    show(options = {}) {
        const {
            type = 'info',
            title = null,
            message = null,
            duration = 4000,
            icon = null
        } = options;

        // Normalize type
        const typeMap = { 
            'sukses': 'success', 
            'gagal': 'error', 
            'peringatan': 'warning', 
            'informasi': 'info' 
        };
        const finalType = typeMap[type] || type;
        const config = this.config[finalType] || this.config.info;

        // Generate unique ID
        const id = `notification-${Date.now()}-${this.autoId++}`;
        const isDesktop = window.innerWidth > 768;

        // Create notification element
        const element = document.createElement('div');
        element.id = id;
        element.className = `notification-item ${finalType} spawn`;
        element.setAttribute('data-notification-id', id);

        // Build HTML
        const iconClass = isDesktop ? 'stagger' : '';
        const textSmallClass = isDesktop ? 'stagger' : '';
        const textMainClass = isDesktop ? 'stagger' : '';

        element.innerHTML = `
            <div class="notification-icon ${iconClass}">
                <div class="icon-blob">
                    <span class="material-icons-round">${icon || config.icon}</span>
                </div>
            </div>
            <div class="notification-text">
                <div class="text-small ${textSmallClass}">${title || config.title}</div>
                <div class="text-main ${textMainClass}">${message || config.msg}</div>
            </div>
            <div class="progress-track">
                <div class="progress-bar" id="progress-${id}"></div>
            </div>
        `;

        // Notification state object
        const notification = {
            id,
            element,
            isDead: false,
            isDesktop,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration,
            duration: duration,
            type: finalType,
            
            // Enhanced gesture tracking
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            dragX: 0,
            dragY: 0,
            dragStartTime: 0,
            velocityX: 0,
            velocityY: 0,
            lastDragX: 0,
            lastDragY: 0,
            lastDragTime: 0,
            
            // Animation state
            state: 'spawn',
            hasSpawned: false,
            isReturning: false,
            
            // Cleanup
            cleanup: null
        };

        // Store notification
        this.notifications.set(id, notification);
        this.container.appendChild(element);

        // Setup gesture handlers dengan sistem baru
        this.setupEnhancedGestureHandlers(notification);

        // Trigger spawn animation
        requestAnimationFrame(() => {
            notification.element.classList.remove('spawn');
            notification.element.classList.add('active');
            notification.hasSpawned = true;
            notification.state = 'active';
        });

        // Enforce stack limits
        this.enforceStackLimits(isDesktop);

        // Start engine
        this.startEngine();

        return id;
    }

    /**
     * Setup gesture handlers yang lebih fleksibel
     */
    setupEnhancedGestureHandlers(notification) {
        const element = notification.element;
        
        // Cleanup function
        const cleanup = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            element.removeEventListener('pointercancel', handlePointerCancel);
            cancelAnimationFrame(notification.returnAnimationId);
        };
        
        notification.cleanup = cleanup;
        
        const handlePointerDown = (e) => {
            if (notification.isDead || notification.state === 'exit') return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Cancel any ongoing return animation
            if (notification.returnAnimationId) {
                cancelAnimationFrame(notification.returnAnimationId);
                notification.returnAnimationId = null;
                notification.isReturning = false;
            }
            
            notification.isDragging = true;
            notification.dragStartX = e.clientX;
            notification.dragStartY = e.clientY;
            notification.dragX = 0;
            notification.dragY = 0;
            notification.dragStartTime = Date.now();
            notification.lastDragTime = Date.now();
            notification.lastDragX = 0;
            notification.lastDragY = 0;
            notification.velocityX = 0;
            notification.velocityY = 0;
            notification.state = 'drag';
            
            // Disable transitions selama drag
            element.style.transition = 'none';
            element.style.willChange = 'transform';
            
            element.setPointerCapture(e.pointerId);
        };
        
        const handlePointerMove = (e) => {
            if (!notification.isDragging || notification.isDead) return;
            
            e.preventDefault();
            
            const now = Date.now();
            const deltaTime = now - notification.lastDragTime;
            
            // Calculate delta
            const deltaX = e.clientX - notification.dragStartX;
            const deltaY = e.clientY - notification.dragStartY;
            
            // Calculate velocity (pixels per ms)
            if (deltaTime > 0) {
                notification.velocityX = (deltaX - notification.lastDragX) / deltaTime;
                notification.velocityY = (deltaY - notification.lastDragY) / deltaTime;
            }
            
            // Apply rubber band effect dengan batasan
            let targetX = 0, targetY = 0;
            
            if (notification.isDesktop) {
                // Desktop: horizontal swipe dengan rubber band
                targetX = this.applyRubberBand(deltaX, window.innerWidth * 0.5);
                targetX = Math.max(-window.innerWidth * 0.3, Math.min(targetX, window.innerWidth));
            } else {
                // Mobile: vertical swipe dengan rubber band
                targetY = this.applyRubberBand(deltaY, window.innerHeight * 0.3);
                targetY = Math.max(-window.innerHeight * 0.2, Math.min(targetY, window.innerHeight * 0.5));
            }
            
            // Smooth interpolation ke target
            notification.dragX += (targetX - notification.dragX) * 0.7;
            notification.dragY += (targetY - notification.dragY) * 0.7;
            
            // Update visual
            this.applyTransform(notification);
            
            // Update opacity berdasarkan distance dengan easing
            const maxDistance = notification.isDesktop ? 
                Math.min(window.innerWidth * 0.3, 200) : 
                Math.min(window.innerHeight * 0.2, 150);
            
            const dragDistance = notification.isDesktop ? 
                Math.abs(notification.dragX) : Math.abs(notification.dragY);
            
            const opacity = Math.max(0.3, 1 - (dragDistance / maxDistance));
            element.style.opacity = opacity;
            
            // Store last values
            notification.lastDragX = deltaX;
            notification.lastDragY = deltaY;
            notification.lastDragTime = now;
        };
        
        const handlePointerUp = (e) => {
            if (!notification.isDragging || notification.isDead) return;
            
            notification.isDragging = false;
            const dragTime = Date.now() - notification.dragStartTime;
            
            // Restore transitions
            element.style.transition = `transform 0.4s ${this.GESTURE.EASE_OUT}, opacity 0.4s ${this.GESTURE.EASE_OUT}`;
            element.style.willChange = '';
            
            // Calculate final metrics
            const dragDistance = notification.isDesktop ? 
                Math.abs(notification.dragX) : Math.abs(notification.dragY);
            
            const velocity = notification.isDesktop ? 
                Math.abs(notification.velocityX) : Math.abs(notification.velocityY);
            
            // FLEKSIBEL Dismiss Detection:
            // 1. Cek berdasarkan jarak
            const isDistanceEnough = dragDistance > this.GESTURE.DISMISS_THRESHOLD;
            
            // 2. Cek berdasarkan kecepatan (velocity-based)
            const isVelocityEnough = velocity > this.GESTURE.MIN_VELOCITY;
            const velocityBoost = velocity * this.GESTURE.VELOCITY_MULTIPLIER;
            const effectiveDistance = dragDistance + velocityBoost;
            
            // 3. Cek berdasarkan swipe cepat
            const isFastSwipe = dragTime < this.GESTURE.MAX_SWIPE_TIME && 
                               dragDistance > this.GESTURE.MIN_SWIPE_DISTANCE;
            
            // Gabungkan semua kondisi dengan OR (lebih fleksibel)
            const shouldDismiss = isDistanceEnough || isVelocityEnough || isFastSwipe;
            
            if (shouldDismiss) {
                // Dismiss dengan animasi berdasarkan arah dan kecepatan
                this.dismissWithEnhancedGesture(notification, velocity);
            } else {
                // Kembalikan ke posisi awal dengan animasi smooth
                this.returnToPosition(notification);
            }
            
            element.releasePointerCapture(e.pointerId);
        };
        
        const handlePointerCancel = (e) => {
            handlePointerUp(e);
        };
        
        // Attach event listeners
        element.addEventListener('pointerdown', handlePointerDown);
        const boundMove = handlePointerMove.bind(this);
        const boundUp = handlePointerUp.bind(this);
        const boundCancel = handlePointerCancel.bind(this);
        
        window.addEventListener('pointermove', boundMove, { passive: false });
        window.addEventListener('pointerup', boundUp);
        element.addEventListener('pointercancel', boundCancel);
        
        // Simpan references untuk cleanup
        notification._boundMove = boundMove;
        notification._boundUp = boundUp;
        notification._boundCancel = boundCancel;
    }

    /**
     * Terapkan rubber band effect
     */
    applyRubberBand(delta, maxDistance) {
        if (Math.abs(delta) > maxDistance) {
            const overflow = Math.abs(delta) - maxDistance;
            const resistance = 1 - (overflow / (overflow + maxDistance * this.GESTURE.RUBBER_BAND_STRENGTH));
            return delta > 0 ? 
                maxDistance + overflow * resistance : 
                -maxDistance - overflow * resistance;
        }
        return delta;
    }

    /**
     * Kembalikan notifikasi ke posisi awal dengan animasi
     */
    returnToPosition(notification) {
        notification.isReturning = true;
        notification.state = 'active';
        
        // Gunakan easing yang lebih natural
        notification.element.style.transition = `transform 0.5s ${this.GESTURE.EASE_BOUNCE}, opacity 0.3s ${this.GESTURE.EASE_OUT}`;
        notification.element.style.opacity = '';
        
        // Animate back to position
        const animateReturn = () => {
            notification.dragX *= 0.7;
            notification.dragY *= 0.7;
            
            this.applyTransform(notification);
            
            if (Math.abs(notification.dragX) > 0.5 || Math.abs(notification.dragY) > 0.5) {
                notification.returnAnimationId = requestAnimationFrame(animateReturn);
            } else {
                notification.dragX = 0;
                notification.dragY = 0;
                this.applyTransform(notification);
                notification.isReturning = false;
                notification.returnAnimationId = null;
            }
        };
        
        notification.returnAnimationId = requestAnimationFrame(animateReturn);
    }

    /**
     * Dismiss dengan gesture yang lebih smooth
     */
    dismissWithEnhancedGesture(notification, velocity) {
        if (notification.isDead || notification.state === 'exit') return;
        
        notification.state = 'exit';
        
        // Hitung target dismiss berdasarkan velocity
        const velocityBoost = Math.abs(velocity) * 50; // Tambah boost berdasarkan kecepatan
        const baseDistance = notification.isDesktop ? 
            window.innerWidth : window.innerHeight;
        
        let targetX = 0, targetY = 0;
        
        if (notification.isDesktop) {
            // Desktop: swipe ke kanan untuk dismiss
            const direction = notification.dragX >= 0 ? 1 : -1;
            targetX = notification.dragX + (baseDistance * 0.5 + velocityBoost) * direction;
            const rotation = notification.dragX * 0.08 * direction;
            notification.element.style.transform = `translateX(${targetX}px) rotate(${rotation}deg)`;
        } else {
            // Mobile: swipe ke atas untuk dismiss
            const direction = notification.dragY <= 0 ? -1 : 1;
            targetY = notification.dragY + (baseDistance * 0.3 + velocityBoost) * direction;
            notification.element.style.transform = `translate(-50%, ${targetY}px)`;
        }
        
        notification.element.style.opacity = '0';
        notification.element.style.transition = `transform 0.35s ${this.GESTURE.EASE_OUT}, opacity 0.35s ${this.GESTURE.EASE_OUT}`;
        
        // Hapus setelah animasi
        setTimeout(() => {
            this.cleanupNotification(notification.id);
        }, 350);
    }

    /**
     * Menerapkan transformasi CSS
     */
    applyTransform(notification) {
        const element = notification.element;
        
        if (notification.state === 'exit' || notification.isDead) {
            return;
        }
        
        if (notification.isDesktop) {
            // Desktop: translate horizontal dengan sedikit rotate saat drag
            let rotation = 0;
            if (Math.abs(notification.dragX) > 10) {
                rotation = notification.dragX * 0.03;
            }
            element.style.transform = `translateX(${notification.dragX}px) rotate(${rotation}deg)`;
        } else {
            // Mobile: translate vertical
            element.style.transform = `translate(-50%, ${notification.dragY}px)`;
        }
    }

    /**
     * Memulai engine loop
     */
    startEngine() {
        if (this.isLoopRunning) return;
        
        this.isLoopRunning = true;
        this.lastUpdateTime = Date.now();
        
        const engineLoop = () => {
            const hasActiveNotifications = Array.from(this.notifications.values())
                .some(n => !n.isDead);
            
            if (!hasActiveNotifications) {
                this.isLoopRunning = false;
                return;
            }
            
            const now = Date.now();
            const deltaTime = now - this.lastUpdateTime;
            
            // Update progress bars
            this.updateNotifications(now);
            
            // Update stacking
            this.updateStacking();
            
            this.lastUpdateTime = now;
            
            if (this.isLoopRunning) {
                this.animationFrameId = requestAnimationFrame(engineLoop);
            }
        };
        
        this.animationFrameId = requestAnimationFrame(engineLoop);
    }

    /**
     * Update progress bars
     */
    updateNotifications(now) {
        this.notifications.forEach(notification => {
            if (notification.isDead || notification.state === 'exit') return;
            
            // Skip update jika sedang drag atau returning
            if (notification.isDragging || notification.isReturning) return;
            
            const progressBar = notification.element.querySelector('.progress-bar');
            if (progressBar && notification.duration > 0) {
                const timeLeft = Math.max(0, notification.expiresAt - now);
                const percentage = Math.min(1, Math.max(0, timeLeft / notification.duration));
                
                progressBar.style.transition = 'transform 0.1s linear';
                
                if (notification.isDesktop) {
                    progressBar.style.transform = `scaleY(${percentage})`;
                } else {
                    progressBar.style.transform = `scaleX(${percentage})`;
                }
                
                if (timeLeft <= 0) {
                    this.dismiss(notification.id);
                }
            }
        });
    }

    /**
     * Update stacking positions
     */
    updateStacking() {
        const aliveNotifications = Array.from(this.notifications.values())
            .filter(n => !n.isDead && n.state !== 'exit')
            .sort((a, b) => b.createdAt - a.createdAt);
            
        aliveNotifications.forEach((notification, index) => {
            if (notification.isDead || notification.state === 'exit') return;
            
            notification.element.classList.remove('active', 'layer-1', 'layer-2');
            
            if (!notification.isDesktop) {
                if (index === 0) notification.element.classList.add('active');
                else if (index === 1) notification.element.classList.add('layer-1');
                else if (index === 2) notification.element.classList.add('layer-2');
            } else {
                notification.element.classList.add('active');
            }
            
            if (notification.isDesktop && !notification.isDragging) {
                const itemHeight = 145 + 12;
                const translateY = -(index * itemHeight);
                notification.element.style.setProperty('--y-offset', `${translateY}px`);
            }
        });
    }

    /**
     * Enforce stack limits
     */
    enforceStackLimits(isDesktop) {
        const max = isDesktop ? this.MAX_DESKTOP : this.MAX_MOBILE;
        const activeNotifications = Array.from(this.notifications.values())
            .filter(n => !n.isDead && n.isDesktop === isDesktop)
            .sort((a, b) => a.createdAt - b.createdAt);
        
        if (activeNotifications.length > max) {
            const toRemove = activeNotifications.slice(0, activeNotifications.length - max);
            toRemove.forEach(n => this.dismiss(n.id));
        }
    }

    /**
     * Menjeda engine
     */
    pauseEngine() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.isLoopRunning = false;
    }

    /**
     * Dismiss notifikasi
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        notification.state = 'exit';
        notification.isDead = true;
        
        notification.element.classList.remove('active', 'layer-1', 'layer-2');
        notification.element.classList.add('exit');
        
        setTimeout(() => {
            this.cleanupNotification(id);
        }, 400);
    }

    /**
     * Cleanup notifikasi
     */
    cleanupNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Cleanup semua event listeners
        if (notification.cleanup) notification.cleanup();
        if (notification._boundMove) window.removeEventListener('pointermove', notification._boundMove);
        if (notification._boundUp) window.removeEventListener('pointerup', notification._boundUp);
        if (notification._boundCancel) window.removeEventListener('pointercancel', notification._boundCancel);
        
        // Cancel return animation jika ada
        if (notification.returnAnimationId) {
            cancelAnimationFrame(notification.returnAnimationId);
        }
        
        // Hapus element
        if (notification.element && notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
        
        // Hapus dari map
        this.notifications.delete(id);
        
        // Hentikan engine jika tidak ada notifikasi
        const hasActiveNotifications = Array.from(this.notifications.values())
            .some(n => !n.isDead);
        
        if (!hasActiveNotifications) {
            this.pauseEngine();
        }
    }

    /**
     * Hapus semua notifikasi
     */
    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.dismiss(id);
        });
    }

    // ==========================
    // PUBLIC API METHODS
    // ==========================

    success(title, message, duration = 4000) {
        return this.show({ type: 'success', title, message, duration });
    }
    
    error(title, message, duration = 4000) {
        return this.show({ type: 'error', title, message, duration });
    }
    
    warning(title, message, duration = 4000) {
        return this.show({ type: 'warning', title, message, duration });
    }
    
    info(title, message, duration = 4000) {
        return this.show({ type: 'info', title, message, duration });
    }
    
    // Indonesian aliases
    sukses(title, message, duration = 4000) {
        return this.success(title, message, duration);
    }
    
    gagal(title, message, duration = 4000) {
        return this.error(title, message, duration);
    }
    
    peringatan(title, message, duration = 4000) {
        return this.warning(title, message, duration);
    }
    
    informasi(title, message, duration = 4000) {
        return this.info(title, message, duration);
    }
}

// ==========================
// GLOBAL EXPORTS
// ==========================
let Notifications;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Notifications = new NotificationSystem();
        setupGlobalAPI();
    });
} else {
    Notifications = new NotificationSystem();
    setupGlobalAPI();
}

/**
 * Setup global API
 */
function setupGlobalAPI() {
    window.Notifications = Notifications;
    window.notify = {
        success: (t, m, d) => Notifications.success(t, m, d),
        error: (t, m, d) => Notifications.error(t, m, d),
        warning: (t, m, d) => Notifications.warning(t, m, d),
        info: (t, m, d) => Notifications.info(t, m, d),
        show: (options) => Notifications.show(options),
        dismiss: (id) => Notifications.dismiss(id),
        clearAll: () => Notifications.clearAll(),
        
        // Indonesian aliases
        sukses: (t, m, d) => Notifications.sukses(t, m, d),
        gagal: (t, m, d) => Notifications.gagal(t, m, d),
        peringatan: (t, m, d) => Notifications.peringatan(t, m, d),
        informasi: (t, m, d) => Notifications.informasi(t, m, d)
    };
    
    console.log('🔔 Notification Library v4.2 - Enhanced Gesture System Loaded');
}

// Eksport untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
