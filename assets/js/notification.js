/**
 * Notification System v3.1 - Core Module with Smart CSS Loader
 * Modern, responsive notification system
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.maxDesktop = 8;
        this.maxMobile = 3;
        this.autoId = 0;
        
        // Default configurations
        this.config = {
            success: {
                icon: "check_circle",
                title: "Berhasil",
                msg: "Data berhasil sinkron"
            },
            error: {
                icon: "error",
                title: "Gagal",
                msg: "Terjadi kesalahan sistem"
            },
            warning: {
                icon: "warning",
                title: "Peringatan",
                msg: "Baterai mulai lemah"
            },
            info: {
                icon: "info",
                title: "Info",
                msg: "Pembaruan tersedia"
            }
        };
        
        this.init();
    }
    
    init() {
        // 1. Smart CSS Loader (Load otomatis dengan fallback)
        this.loadStyles();

        // Create container if not exists
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            
            // --- TAMBAHKAN BARIS INI ---
// Memastikan notifikasi selalu di atas segalanya (termasuk Modal/Panel)
this.container.style.zIndex = '999999';
// ---------------------------
            
            // Add to body
            document.body.appendChild(this.container);
            
            // Load fonts
            this.loadFonts();
            
            // Set initial mode
            this.updateMode();
            
            // Listen for resize
            window.addEventListener('resize', () => this.updateMode());
            
            console.log('🔔 Notification System Initialized');
        }
    }

    /**
     * Smart CSS Loader
     * Mencoba memuat CSS dari beberapa path secara berurutan (Fallback Mechanism)
     */
    loadStyles() {
        // Cek apakah CSS sudah pernah diload sebelumnya
        if (document.getElementById('notification-styles')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'notification-styles';

        // Daftar path yang akan dicoba secara berurutan
        const paths = [
            'assets/css/notification.css',      // Path utama (jika file html di root)
            '../assets/css/notification.css'     // Path alternatif (jika js di dalam folder assets/js)
        ];

        let attemptIndex = 0;

        // Fungsi internal untuk mencoba load
        const tryLoad = (index) => {
            link.href = paths[index];
            console.log(`[Notify] 🔍 Mencoba memuat CSS dari: ${paths[index]}`);
        };

        // Handler jika gagal (Error 404/Path Salah)
        link.onerror = () => {
            attemptIndex++;
            if (attemptIndex < paths.length) {
                console.warn(`[Notify] ⚠️ Path sebelumnya gagal, mencoba alternatif...`);
                tryLoad(attemptIndex); // Coba path berikutnya
            } else {
                console.error(`[Notify] ❌ Gagal memuat CSS dari semua path yang disediakan. Pastikan file notification.css ada.`);
                // Fallback visual: Tampilkan inline style minimal agar tidak berantakan total jika css hilang
                this.injectEmergencyFallback();
            }
        };

        // Handler jika sukses
        link.onload = () => {
            console.log(`[Notify] ✅ CSS Berhasil dimuat dari: ${link.href}`);
        };

        // Mulai percobaan dari path pertama
        tryLoad(0);
        document.head.appendChild(link);
    }

    /**
     * Fallback inline CSS jika file eksternal benar-benar hilang
     * (Hanya untuk menjaga agar notifikasi tetap terlihat)
     */
    injectEmergencyFallback() {
        if (document.getElementById('notification-emergency-style')) return;
        const style = document.createElement('style');
        style.id = 'notification-emergency-style';
        style.textContent = `
            .notification-container { position: fixed; inset: 0; pointer-events: none; z-index: 10000; }
            .notification-item { position: absolute; right: 20px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); pointer-events: auto; display: flex; align-items: center; gap: 10px; transition: all 0.3s; transform: translateX(120%); }
            .notification-item.active { transform: translateX(0); }
            .notification-icon { font-size: 20px; }
            .notification-text { font-family: sans-serif; }
        `;
        document.head.appendChild(style);
    }
    
    loadFonts() {
        // Material Icons
        if (!document.querySelector('link[href*="material-icons"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        // Inter font
        if (!document.querySelector('link[href*="inter"]')) {
            const interLink = document.createElement('link');
            interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            interLink.rel = 'stylesheet';
            document.head.appendChild(interLink);
        }
    }
    
    updateMode() {
        if (!this.container) return;
        
        const isDesktop = window.innerWidth > 768;
        this.container.className = `notification-container ${isDesktop ? 'desktop-mode' : 'mobile-mode'}`;
        
        // Update all notifications
        this.notifications.forEach(notification => {
            if (!notification.isDead) {
                notification.isDesktop = isDesktop;
                this.updateUI(notification);
            }
        });
    }
    
    show(options) {
        const {
            type = 'info',
            title = null,
            message = null,
            duration = 4000,
            icon = null,
            dismissible = true
        } = options;
        
        // Type mapping for bahasa Indonesia
        const typeMap = {
            'sukses': 'success',
            'gagal': 'error',
            'peringatan': 'warning',
            'informasi': 'info'
        };
        
        const finalType = typeMap[type] || type;
        
        // Get config
        const config = this.config[finalType] || this.config.info;
        const finalTitle = title || config.title;
        const finalMessage = message || config.msg;
        const finalIcon = icon || config.icon;
        
        const id = `notification-${Date.now()}-${this.autoId++}`;
        const isDesktop = window.innerWidth > 768;
        
        // Create element
        const element = document.createElement('div');
        element.id = id;
        element.className = `notification-item ${finalType} spawn`;
        
        // Prepare stagger classes
        const iconClass = isDesktop ? 'stagger' : '';
        const textSmallClass = isDesktop ? 'stagger' : '';
        const textMainClass = isDesktop ? 'stagger' : '';
        
        // HTML Structure
        element.innerHTML = `
            <div class="notification-icon ${iconClass}">
                <div class="icon-blob">
                    <span class="material-icons-round">${finalIcon}</span>
                </div>
            </div>
            <div class="notification-text">
                <div class="text-small ${textSmallClass}">${finalTitle}</div>
                <div class="text-main ${textMainClass}">${finalMessage}</div>
            </div>
            <div class="progress-track">
                <div class="progress-bar" id="progress-${id}"></div>
            </div>
        `;
        
        const notification = {
            id,
            element,
            isDead: false,
            duration,
            isDesktop,
            type: finalType,
            createdAt: Date.now(),
            timer: null,
            dismissible,
            pausedProgress: null
        };
        
        // Store
        this.notifications.set(id, notification);
        
        // Add to container
        this.container.appendChild(element);
        
        // Animate in
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.refreshUI();
                
                // Start progress bar
                const progressBar = element.querySelector(`#progress-${id}`);
                if (progressBar && duration > 0) {
                    progressBar.style.transition = `transform ${duration}ms linear`;
                    progressBar.style.transform = isDesktop ? "scaleY(1)" : "scaleX(1)";
                    
                    requestAnimationFrame(() => {
                        progressBar.style.transform = isDesktop ? "scaleY(0)" : "scaleX(0)";
                    });
                }
            }, 40);
        });
        
        // Auto dismiss
        if (duration > 0) {
            notification.timer = setTimeout(() => this.dismiss(id), duration);
        }
        
        // Desktop hover
        if (isDesktop && dismissible) {
            element.addEventListener('mouseenter', () => this.pause(id));
            element.addEventListener('mouseleave', () => this.resume(id));
        } else if (!isDesktop && dismissible) {
            // Mobile swipe
            this.bindSwipe(notification);
        }
        
        // Limit notifications
        this.cleanup(isDesktop);
        
        return id;
    }
    
    refreshUI() {
        if (!this.container) return;
        
        const isDesktop = this.container.classList.contains('desktop-mode');
        const alive = Array.from(this.notifications.values())
            .filter(n => !n.isDead)
            .sort((a, b) => b.createdAt - a.createdAt);
        
        alive.forEach((notification, index) => {
            const element = notification.element;
            
            // Remove classes
            element.classList.remove('spawn', 'active', 'layer-1', 'layer-2');
            
            if (isDesktop) {
                // Desktop stacking
                const yOffset = index * -(145 + 12);
                element.style.setProperty('--y-offset', `${yOffset}px`);
                element.classList.add('active');
            } else {
                // Mobile stacking
                const delay = Math.min(index * 0.05, 0.3);
                element.style.transitionDelay = `${delay}s`;
                
                if (index === 0) element.classList.add('active');
                else if (index === 1) element.classList.add('layer-1');
                else if (index === 2) element.classList.add('layer-2');
            }
        });
    }
    
    updateUI(notification) {
        const element = notification.element;
        
        // Update progress orientation
        const progressBar = element.querySelector('.progress-bar');
        if (progressBar && !notification.isDead) {
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.match(/\d+\.?\d*/)[0]) : 1;
            
            progressBar.style.transform = notification.isDesktop ? 
                `scaleY(${currentScale})` : `scaleX(${currentScale})`;
        }
        
        this.refreshUI();
    }
    
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        notification.isDead = true;
        clearTimeout(notification.timer);
        
        const element = notification.element;
        element.classList.add('exit');
        element.classList.remove('active', 'layer-1', 'layer-2');
        
        this.refreshUI();
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 800);
    }
    
    pause(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || notification.duration <= 0) return;
        
        clearTimeout(notification.timer);
        
        const progressBar = notification.element.querySelector('.progress-bar');
        if (progressBar) {
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.match(/\d+\.?\d*/)[0]) : 1;
            
            progressBar.style.transitionDuration = '0ms';
            notification.pausedProgress = currentScale;
        }
    }
    
    resume(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || notification.duration <= 0) return;
        
        setTimeout(() => {
            if (notification.isDead) return;
            
            const progressBar = notification.element.querySelector('.progress-bar');
            if (progressBar && notification.pausedProgress !== null) {
                const remaining = Math.max(1000, notification.duration * notification.pausedProgress);
                
                progressBar.style.transition = `transform ${remaining}ms linear`;
                progressBar.style.transform = notification.isDesktop ? "scaleY(0)" : "scaleX(0)";
                
                notification.timer = setTimeout(() => this.dismiss(id), remaining);
                notification.pausedProgress = null;
            }
        }, 500);
    }
    
    bindSwipe(notification) {
        let startY = 0;
        const element = notification.element;
        
        element.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            if (startY - endY > 40) {
                this.dismiss(notification.id);
            }
        }, { passive: true });
    }
    
    cleanup(isDesktop) {
        const max = isDesktop ? this.maxDesktop : this.maxMobile;
        const active = Array.from(this.notifications.values())
            .filter(n => !n.isDead && n.isDesktop === isDesktop)
            .sort((a, b) => a.createdAt - b.createdAt);
        
        if (active.length > max) {
            const toRemove = active.slice(0, active.length - max);
            toRemove.forEach(n => this.dismiss(n.id));
        }
    }
    
    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.dismiss(id);
        });
    }
    
    // Quick methods
    success(title, message, duration = 4000) {
        return this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }
    
    error(title, message, duration = 5000) {
        return this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }
    
    warning(title, message, duration = 4000) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }
    
    info(title, message, duration = 3000) {
        return this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }
    
    // Indonesian aliases
    sukses(title, message, duration = 4000) {
        return this.success(title, message, duration);
    }
    
    gagal(title, message, duration = 5000) {
        return this.error(title, message, duration);
    }
    
    peringatan(title, message, duration = 4000) {
        return this.warning(title, message, duration);
    }
    
    informasi(title, message, duration = 3000) {
        return this.info(title, message, duration);
    }
    
    // Config methods
    setConfig(type, config) {
        this.config[type] = { ...this.config[type], ...config };
    }
    
    addType(type, config) {
        this.config[type] = config;
    }
    
    getCount() {
        return Array.from(this.notifications.values()).filter(n => !n.isDead).length;
    }
}

// Initialize
let Notifications;

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Notifications = new NotificationSystem();
        setupGlobal();
    });
} else {
    Notifications = new NotificationSystem();
    setupGlobal();
}

function setupGlobal() {
    // Export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Notifications;
    }
    
    // Global access
    window.Notifications = Notifications;
    
    // Quick access with error handling
    window.notify = {
        // English methods
        success: (t, m, d) => Notifications.success(t, m, d),
        error: (t, m, d) => Notifications.error(t, m, d),
        warning: (t, m, d) => Notifications.warning(t, m, d),
        info: (t, m, d) => Notifications.info(t, m, d),
        
        // Indonesian methods
        sukses: (t, m, d) => Notifications.sukses(t, m, d),
        gagal: (t, m, d) => Notifications.gagal(t, m, d),
        peringatan: (t, m, d) => Notifications.peringatan(t, m, d),
        informasi: (t, m, d) => Notifications.informasi(t, m, d),
        
        // Advanced
        show: (o) => Notifications.show(o),
        dismiss: (id) => Notifications.dismiss(id),
        clearAll: () => Notifications.clearAll(),
        getCount: () => Notifications.getCount(),
        setConfig: (t, c) => Notifications.setConfig(t, c),
        addType: (t, c) => Notifications.addType(t, c)
    };
    
    console.log('🔔 Notification System Ready');
}

