// navigasi.js - Global Navigation Logic for Multi-Page Admin
// Sidebar Animation dengan CASCADE OVERLAP + Page Transitions

document.addEventListener('DOMContentLoaded', function() {
    
    /* =======================  
       DOM ELEMENTS  
    ======================= */  
    const menuItems = document.querySelectorAll('.menu-item');  
    const pageTitle = document.getElementById('page-title');  
    const menuToggle = document.getElementById('menu-toggle');  
    const sidebar = document.querySelector('.sidebar');  
    const notificationBtn = document.querySelector('.notification-btn');  
    const logoutBtn = document.getElementById('logout-btn-header');  
    const badge = document.querySelector('.badge');  
      
    // SIDEBAR ITEMS (semua: logo, menu, user profile)  
    const sidebarItems = document.querySelectorAll('.sidebar-item');  
    const logoIcon = document.querySelector('.logo i');  
    const logoText = document.querySelector('.logo h2');  
      
    // State untuk animasi  
    let isAnimating = false;  
    let animationTimeouts = [];  
    let currentAnimationId = 0;  
      
    // Page Load Animation
    const pageTransition = document.querySelector('.page-transition');
    
    /* =======================  
       PAGE LOAD ANIMATION  
    ======================= */  
    function showPageTransition() {
        if (pageTransition) {
            pageTransition.classList.remove('hidden');
        }
    }
    
    function hidePageTransition() {
        if (pageTransition) {
            setTimeout(() => {
                pageTransition.classList.add('hidden');
            }, 300);
        }
    }
    
    // Hide page transition after load
    window.addEventListener('load', hidePageTransition);
    setTimeout(hidePageTransition, 1000); // Fallback
    
    /* =======================  
       NAVIGATION LINK HANDLING  
    ======================= */  
    function handleNavigation(linkElement) {
        const href = linkElement.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:')) {
            // Add click effect
            linkElement.style.transform = 'scale(0.98)';  
            setTimeout(() => {  
                linkElement.style.transform = '';  
            }, 150);
            
            // Show loading animation
            showPageTransition();
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 500);
            
            return false;
        }
        return true;
    }
    
    // Add click handlers to menu items
    menuItems.forEach(item => {
        const link = item.querySelector('.menu-item-content');
        if (link) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                handleNavigation(link);
                
                // Close sidebar on mobile
                if (window.innerWidth <= 992) {  
                    sidebar.classList.remove('active');  
                    menuToggle.querySelector('i').classList.remove('fa-times');  
                    menuToggle.querySelector('i').classList.add('fa-bars');  
                    animateSidebarExit();  
                }
            });
        }
    });
    
    /* =======================  
       ANIMASI SIDEBAR CASCADE OVERLAP  
    ======================= */  
    
    // RESET SEMUA ANIMASI  
    function resetAllAnimations() {  
        animationTimeouts.forEach(timeout => clearTimeout(timeout));  
        animationTimeouts = [];  
          
        isAnimating = false;  
        currentAnimationId++;  
          
        [logoIcon, logoText].forEach(el => {  
            if (el) el.classList.remove('show');  
        });  
          
        sidebarItems.forEach(item => {  
            item.classList.remove('show');  
              
            const icon = item.querySelector('.sidebar-icon');  
            const text = item.querySelector('.sidebar-text');  
              
            if (icon) icon.classList.remove('show');  
            if (text) text.classList.remove('show');  
        });  
    }  
      
    // ANIMASI MASUK DENGAN TIMING OVERLAP  
    function animateSidebarSuperNiat() {  
        // Hentikan animasi sebelumnya  
        resetAllAnimations();  
          
        const animationId = ++currentAnimationId;  
        isAnimating = true;  
          
        // Logo pertama (ikon + teks overlap)  
        if (logoIcon) {  
            animationTimeouts.push(setTimeout(() => {  
                if (currentAnimationId !== animationId) return;  
                logoIcon.classList.add('show');  
            }, 50));  
        }  
          
        if (logoText) {  
            animationTimeouts.push(setTimeout(() => {  
                if (currentAnimationId !== animationId) return;  
                logoText.classList.add('show');  
            }, 100));  
        }  
          
        // Menu items dengan timing cascade overlap  
        sidebarItems.forEach((item, index) => {  
            const itemDelay = 150 + (index * 15);  
              
            // Item container  
            animationTimeouts.push(setTimeout(() => {  
                if (currentAnimationId !== animationId) return;  
                item.classList.add('show');  
                  
                // Icon muncul lebih cepat (5ms setelah item)  
                const icon = item.querySelector('.sidebar-icon');  
                if (icon) {  
                    animationTimeouts.push(setTimeout(() => {  
                        icon.classList.add('show');  
                    }, 5));  
                }  
                  
                // Text muncul 10ms setelah icon (overlap)  
                const text = item.querySelector('.sidebar-text');  
                if (text) {  
                    animationTimeouts.push(setTimeout(() => {  
                        text.classList.add('show');  
                    }, 15));  
                }  
                  
            }, itemDelay));  
        });  
          
        // User profile muncul SEBELUM semua item selesai (overlap)  
        const lastItemIndex = sidebarItems.length - 1;  
        const userProfileDelay = 150 + (lastItemIndex * 15) - 100;  
          
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId !== animationId) return;  
            const userProfile = document.querySelector('.user-profile');  
            if (userProfile) {  
                userProfile.style.opacity = '0';  
                userProfile.style.transform = 'translateY(10px)';  
                  
                setTimeout(() => {  
                    userProfile.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';  
                    userProfile.style.opacity = '1';  
                    userProfile.style.transform = 'translateY(0)';  
                }, 10);  
            }  
        }, userProfileDelay));  
          
        const totalAnimationTime = 150 + (sidebarItems.length * 15) + 200;  
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId === animationId) {  
                isAnimating = false;  
            }  
        }, totalAnimationTime));  
    }  
    
    // ANIMASI KELUAR CASCADE OVERLAP  
    function animateSidebarExit() {  
        const animationId = ++currentAnimationId;  
          
        const userProfile = document.querySelector('.user-profile');  
        if (userProfile) {  
            userProfile.style.transition = 'all 0.3s ease';  
            userProfile.style.opacity = '0';  
            userProfile.style.transform = 'translateY(10px)';  
        }  
          
        const reversedItems = Array.from(sidebarItems).reverse();  
          
        reversedItems.forEach((item, index) => {  
            const exitDelay = 50 + (index * 20);  
              
            animationTimeouts.push(setTimeout(() => {  
                item.classList.remove('show');  
                  
                const icon = item.querySelector('.sidebar-icon');  
                const text = item.querySelector('.sidebar-text');  
                  
                if (icon) icon.classList.remove('show');  
                if (text) text.classList.remove('show');  
            }, exitDelay));  
        });  
          
        animationTimeouts.push(setTimeout(() => {  
            if (logoText) logoText.classList.remove('show');  
        }, 50 + (reversedItems.length * 20) + 30));  
          
        animationTimeouts.push(setTimeout(() => {  
            if (logoIcon) logoIcon.classList.remove('show');  
        }, 50 + (reversedItems.length * 20) + 50));  
    }  
    
    /* =======================  
       INITIAL LOAD DENGAN OVERLAP  
    ======================= */  
    function initializePage() {  
        // Set active menu item based on current page
        const currentPage = window.location.pathname.split('/').pop();
        const menuMapping = {
            'profile.html': 'profil',
            'buat-ujian.html': 'buat-ujian',
            'data-hasil.html': 'data-hasil',
            'ujian-siswa.html': 'ujian-siswa'
        };
        
        const currentTab = menuMapping[currentPage] || 'profil';
        const activeMenuItem = document.querySelector(`.menu-item[data-tab="${currentTab}"]`);
        if (activeMenuItem) {
            menuItems.forEach(item => item.classList.remove('active'));
            activeMenuItem.classList.add('active');
        }
          
        // Tunggu 100ms untuk DOM, lalu jalankan animasi overlap  
        setTimeout(() => {  
            animateSidebarSuperNiat();  
        }, 100);  
    }  
      
    initializePage();  
      
    /* =======================  
       MENU TOGGLE (MOBILE)  
    ======================= */  
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {  
            const wasActive = sidebar.classList.contains('active');  
            sidebar.classList.toggle('active');  
            const icon = this.querySelector('i');  
              
            if (sidebar.classList.contains('active')) {  
                icon.classList.replace('fa-bars', 'fa-times');  
                setTimeout(() => {  
                    animateSidebarSuperNiat();  
                }, 50);  
            } else {  
                icon.classList.replace('fa-times', 'fa-bars');  
                animateSidebarExit();  
            }  
        });  
    }
      
    /* =======================  
       CLICK OUTSIDE (MOBILE)  
    ======================= */  
    document.addEventListener('click', function(event) {  
        if (  
            window.innerWidth <= 992 &&  
            sidebar && !sidebar.contains(event.target) &&  
            menuToggle && !menuToggle.contains(event.target) &&  
            sidebar.classList.contains('active')  
        ) {  
            sidebar.classList.remove('active');  
            if (menuToggle.querySelector('i')) {
                menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
            }
            animateSidebarExit();  
        }  
    });  
      
    /* =======================  
       NOTIFICATION  
    ======================= */  
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {  
            this.style.transform = 'scale(0.95)';  
            setTimeout(() => this.style.transform = '', 150);  
              
            this.style.animation = 'shake 0.5s';  
            setTimeout(() => this.style.animation = '', 500);  
              
            if (badge && badge.textContent !== '0') {  
                badge.textContent = '0';  
                badge.style.background = '#10b981';  
                badge.style.transform = 'scale(1.2)';  
                setTimeout(() => badge.style.transform = '', 300);  
                  
                showToast('Notifikasi telah dibersihkan!', 'success');  
            } else {  
                showToast('Tidak ada notifikasi baru', 'info');  
            }  
        });  
    }
      
    /* =======================  
       LOGOUT  
    ======================= */  
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {  
            this.style.transform = 'scale(0.95)';  
            setTimeout(() => this.style.transform = '', 150);  
              
            // Efek konfirmasi dengan animasi  
            const modal = document.createElement('div');  
            modal.className = 'logout-modal';  
            modal.innerHTML = `  
                <div class="modal-content">  
                    <i class="fas fa-sign-out-alt"></i>  
                    <h3>Konfirmasi Logout</h3>  
                    <p>Apakah Anda yakin ingin keluar dari sistem?</p>  
                    <div class="modal-buttons">  
                        <button class="btn-cancel">Batal</button>  
                        <button class="btn-confirm">Keluar</button>  
                    </div>  
                </div>  
            `;  
              
            document.body.appendChild(modal);  
              
            // Animasi masuk modal  
            setTimeout(() => {  
                modal.style.opacity = '1';  
                modal.style.transform = 'scale(1)';  
            }, 10);  
              
            // Event listeners untuk modal  
            modal.querySelector('.btn-cancel').addEventListener('click', function() {  
                modal.style.opacity = '0';  
                modal.style.transform = 'scale(0.8)';  
                setTimeout(() => modal.remove(), 300);  
            });  
              
            modal.querySelector('.btn-confirm').addEventListener('click', function() {  
                modal.querySelector('.modal-content').innerHTML = `  
                    <i class="fas fa-check-circle" style="color:#10b981;font-size:48px;margin-bottom:20px;"></i>  
                    <h3>Berhasil Logout</h3>  
                    <p>Anda telah keluar dari sistem.</p>  
                `;  
                  
                setTimeout(() => {  
                    modal.style.opacity = '0';  
                    setTimeout(() => {
                        modal.remove();
                        // Panggil logout dari Auth system
                        if (window.Auth && window.Auth.authLogout) {
                            window.Auth.authLogout().then(() => {
                                showToast('Berhasil logout dari admin panel', 'success');
                                setTimeout(() => {
                                    window.location.href = '../login.html';
                                }, 1500);
                            }).catch(err => {
                                showToast('Gagal logout: ' + err.message, 'error');
                            });
                        }
                    }, 300);  
                }, 1500);  
            });  
              
            // Klik di luar modal untuk tutup  
            modal.addEventListener('click', function(e) {  
                if (e.target === modal) {  
                    modal.style.opacity = '0';  
                    modal.style.transform = 'scale(0.8)';  
                    setTimeout(() => modal.remove(), 300);  
                }  
            });  
        });
    }
      
    /* =======================  
       RESIZE HANDLER  
    ======================= */  
    let resizeTimer;  
    window.addEventListener('resize', function() {  
        clearTimeout(resizeTimer);  
        resizeTimer = setTimeout(() => {  
            if (window.innerWidth > 992) {  
                // Desktop: sidebar selalu terlihat  
                if (sidebar) {
                    sidebar.classList.remove('active');  
                    if (menuToggle && menuToggle.querySelector('i')) {
                        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
                    }
                      
                    // Jalankan animasi masuk  
                    setTimeout(() => {  
                        animateSidebarSuperNiat();  
                    }, 100);  
                }
            } else {  
                // Mobile: jika sidebar tidak aktif, reset animasi  
                if (sidebar && !sidebar.classList.contains('active')) {  
                    resetAllAnimations();  
                }  
            }  
        }, 250);  
    });  
    
    /* =======================  
       UTILITY FUNCTIONS  
    ======================= */  
    function showToast(message, type = 'info') {  
        const toast = document.createElement('div');  
        toast.className = `toast toast-${type}`;  
        toast.innerHTML = `  
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>  
            <span>${message}</span>  
        `;  
          
        document.body.appendChild(toast);  
          
        // Animasi masuk  
        setTimeout(() => {  
            toast.style.opacity = '1';  
            toast.style.transform = 'translateY(0)';  
        }, 10);  
          
        // Auto remove setelah 3 detik  
        setTimeout(() => {  
            toast.style.opacity = '0';  
            toast.style.transform = 'translateY(20px)';  
            setTimeout(() => toast.remove(), 300);  
        }, 3000);  
    }
});

// Expose utility functions globally
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');  
    toast.className = `toast toast-${type}`;  
    toast.innerHTML = `  
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>  
        <span>${message}</span>  
    `;  
      
    document.body.appendChild(toast);  
      
    // Animasi masuk  
    setTimeout(() => {  
        toast.style.opacity = '1';  
        toast.style.transform = 'translateY(0)';  
    }, 10);  
      
    // Auto remove setelah 3 detik  
    setTimeout(() => {  
        toast.style.opacity = '0';  
        toast.style.transform = 'translateY(20px)';  
        setTimeout(() => toast.remove(), 300);  
    }, 3000);  
};