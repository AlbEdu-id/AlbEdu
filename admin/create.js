// create.js - Sidebar Animation SUPER "NIAT" dengan CASCADE OVERLAP
document.addEventListener('DOMContentLoaded', function() {
    
  /* =======================  
     DOM ELEMENTS  
  ======================= */  
  const menuItems = document.querySelectorAll('.menu-item');  
  const tabContents = document.querySelectorAll('.tab-content');  
  const pageTitle = document.getElementById('page-title');  
  const menuToggle = document.getElementById('menu-toggle');  
  const sidebar = document.querySelector('.sidebar');  
  const notificationBtn = document.querySelector('.notification-btn');  
  const logoutBtn = document.querySelector('.logout-btn');  
  const badge = document.querySelector('.badge');  
    
  // SIDEBAR ITEMS (semua: logo, menu, user profile)  
  const sidebarItems = document.querySelectorAll('.sidebar-item');  
  const logoIcon = document.querySelector('.logo i');  
  const logoText = document.querySelector('.logo h2');  
    
  // State untuk animasi  
  let isAnimating = false;  
  let animationTimeouts = [];  
  let currentAnimationId = 0;  
    
  /* =======================  
     TAB TITLE MAPPING  
  ======================= */  
  const tabTitles = {  
    'profil': 'Profil Admin',  
    'buat-ujian': 'Buat Ujian',  
    'data-hasil': 'Data Hasil Siswa',  
    'ujian-siswa': 'Ujian Siswa'  
  };  
    
  /* =======================  
     PREVENT PROFILE BUTTON IN ADMIN PAGE  
  ======================= */  
  if (window.UI && window.UI.Profile) {
      const originalInit = window.UI.Profile.init;
      window.UI.Profile.init = function() {
          console.log('🚫 Profil tombol dinonaktifkan untuk halaman admin');
          return Promise.resolve();
      };
  }
    
  /* =======================  
     TAB SWITCH - DIPERBAIKI  
  ======================= */  
  function switchTab(tabId) {  
    window.location.hash = tabId;  
    pageTitle.textContent = tabTitles[tabId] || 'Dashboard';  
    
    // RESET SEMUA ACTIVE STATES
    menuItems.forEach(item => {
        item.classList.remove('active');
        // Reset transform dan hover effects
        item.style.transform = '';
        item.style.background = '';
        item.style.boxShadow = '';
        item.style.borderLeft = '';
    });
    
    // Reset user profile jika ada active state
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.classList.remove('active');
        userProfile.style.transform = '';
        userProfile.style.background = '';
        userProfile.style.boxShadow = '';
        
        // Reset ke state normal
        setTimeout(() => {
            userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
        }, 10);
    }
    
    tabContents.forEach(content => content.classList.remove('active'));  
      
    const activeMenuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);  
    const activeTabContent = document.getElementById(tabId);  
      
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        // Force reflow untuk memastikan transition berjalan
        void activeMenuItem.offsetWidth;
    }
    
    if (activeTabContent) activeTabContent.classList.add('active');  
    
    // Initialize admin profile if profil tab is active
    if (tabId === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 300);
    }
  }
    
  /* =======================  
     RESET SEMUA HOVER STATES  
  ======================= */  
  function resetAllHoverStates() {
    menuItems.forEach(item => {
        // Reset inline styles
        item.style.transform = '';
        item.style.background = '';
        item.style.boxShadow = '';
        item.style.borderLeft = '';
        
        // Force reflow
        void item.offsetWidth;
    });
    
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.style.transform = '';
        userProfile.style.background = '';
        userProfile.style.boxShadow = '';
        
        // Reset ke state normal
        setTimeout(() => {
            userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
        }, 10);
    }
  }
    
  /* =======================  
     ANIMASI SIDEBAR CASCADE OVERLAP  
  ======================= */  
    
  // RESET SEMUA ANIMASI  
  function resetAllAnimations() {  
    // Hentikan semua timeout yang berjalan  
    animationTimeouts.forEach(timeout => clearTimeout(timeout));  
    animationTimeouts = [];  
      
    isAnimating = false;  
    currentAnimationId++;  
      
    // Reset semua elemen  
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
        }, 50)); // Start immediately  
    }  
      
    if (logoText) {  
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId !== animationId) return;  
            logoText.classList.add('show');  
        }, 100)); // 50ms overlap  
    }  
      
    // Menu items dengan timing cascade overlap  
    sidebarItems.forEach((item, index) => {  
        // BASE TIMING: 150ms untuk item pertama, +30ms untuk setiap berikutnya  
        // TAPI dengan overlap, jadi perbedaan hanya 15ms  
        const itemDelay = 150 + (index * 15); // Hanya 15ms gap  
          
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
    const userProfileDelay = 150 + (lastItemIndex * 15) - 100; // Muncul 100ms sebelum item terakhir  
      
    animationTimeouts.push(setTimeout(() => {  
        if (currentAnimationId !== animationId) return;  
        // Animasikan user profile section  
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
      
    // Setelah semua animasi selesai  
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
      
    // Animasikan user profile pertama (reverse)  
    const userProfile = document.querySelector('.user-profile');  
    if (userProfile) {  
        userProfile.style.transition = 'all 0.3s ease';  
        userProfile.style.opacity = '0';  
        userProfile.style.transform = 'translateY(10px)';  
    }  
      
    // Menu items keluar dengan timing overlap (terbalik)  
    const reversedItems = Array.from(sidebarItems).reverse();  
      
    reversedItems.forEach((item, index) => {  
        // Timing overlap: 20ms gap, mulai dari 50ms  
        const exitDelay = 50 + (index * 20);  
          
        animationTimeouts.push(setTimeout(() => {  
            item.classList.remove('show');  
              
            // Icon dan text keluar bersamaan (tidak perlu delay)  
            const icon = item.querySelector('.sidebar-icon');  
            const text = item.querySelector('.sidebar-text');  
              
            if (icon) icon.classList.remove('show');  
            if (text) text.classList.remove('show');  
        }, exitDelay));  
    });  
      
    // Logo terakhir (teks dulu, lalu ikon)  
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
    const hash = window.location.hash.substring(1) || 'profil';  
    switchTab(hash);  
      
    // Tunggu 100ms untuk DOM, lalu jalankan animasi overlap  
    setTimeout(() => {  
        animateSidebarSuperNiat();  
    }, 100);  
  }  
    
  initializePage();  
    
  /* =======================  
     MENU ITEM CLICK - DIPERBAIKI  
  ======================= */  
  menuItems.forEach(item => {  
    item.addEventListener('click', function(e) {  
      e.preventDefault();
      
      const tabId = this.getAttribute('data-tab');  
      switchTab(tabId);  
        
      // Reset semua hover states terlebih dahulu
      resetAllHoverStates();
        
      // Efek klik kecil  
      this.style.transform = 'scale(0.98)';  
      setTimeout(() => {  
        this.style.transform = '';  
      }, 150);  
        
      // Pastikan user profile tidak stuck
      const userProfile = document.querySelector('.user-profile');
      if (userProfile) {
          userProfile.classList.remove('active');
          userProfile.style.transform = '';
          userProfile.style.background = '';
          userProfile.style.boxShadow = '';
          
          // Reset ke state normal
          setTimeout(() => {
              userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
          }, 10);
      }
          
      if (window.innerWidth <= 992) {  
        sidebar.classList.remove('active');  
        menuToggle.querySelector('i').classList.remove('fa-times');  
        menuToggle.querySelector('i').classList.add('fa-bars');  
        animateSidebarExit();  
      }  
    });  
  });  
    
  /* =======================  
     MENU TOGGLE (MOBILE)  
  ======================= */  
  menuToggle.addEventListener('click', function() {  
    const wasActive = sidebar.classList.contains('active');  
    sidebar.classList.toggle('active');  
    const icon = this.querySelector('i');  
      
    if (sidebar.classList.contains('active')) {  
      // Sidebar dibuka  
      icon.classList.replace('fa-bars', 'fa-times');  
        
      // Reset hover states saat sidebar dibuka
      resetAllHoverStates();
        
      // Delay untuk memastikan transisi CSS selesai  
      setTimeout(() => {  
        animateSidebarSuperNiat();  
      }, 50);  
    } else {  
      // Sidebar ditutup  
      icon.classList.replace('fa-times', 'fa-bars');  
      animateSidebarExit();  
    }  
  });  
    
  /* =======================  
     CLICK OUTSIDE (MOBILE)  
  ======================= */  
  document.addEventListener('click', function(event) {  
    if (  
      window.innerWidth <= 992 &&  
      !sidebar.contains(event.target) &&  
      !menuToggle.contains(event.target) &&  
      sidebar.classList.contains('active')  
    ) {  
      sidebar.classList.remove('active');  
      menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
      animateSidebarExit();  
    }  
  });  
    
  /* =======================  
     NOTIFICATION  
  ======================= */  
  notificationBtn.addEventListener('click', function() {  
    this.style.transform = 'scale(0.95)';  
    setTimeout(() => this.style.transform = '', 150);  
      
    // Efek getar  
    this.style.animation = 'shake 0.5s';  
    setTimeout(() => this.style.animation = '', 500);  
      
    if (badge.textContent !== '0') {  
      badge.textContent = '0';  
      badge.style.background = '#10b981';  
      badge.style.transform = 'scale(1.2)';  
      setTimeout(() => badge.style.transform = '', 300);  
        
      // Notifikasi  
      showToast('Notifikasi telah dibersihkan!', 'success');  
    } else {  
      showToast('Tidak ada notifikasi baru', 'info');  
    }  
  });  
    
  /* =======================  
     LOGOUT  
  ======================= */  
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
        setTimeout(() => modal.remove(), 300);  
        // window.location.href = 'login.html';  
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
    
  /* =======================  
     RESIZE HANDLER  
  ======================= */  
  let resizeTimer;  
  window.addEventListener('resize', function() {  
    clearTimeout(resizeTimer);  
    resizeTimer = setTimeout(() => {  
      if (window.innerWidth > 992) {  
        // Desktop: sidebar selalu terlihat  
        sidebar.classList.remove('active');  
        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
          
        // Reset hover states
        resetAllHoverStates();
          
        // Jalankan animasi masuk  
        setTimeout(() => {  
          animateSidebarSuperNiat();  
        }, 100);  
      } else {  
        // Mobile: jika sidebar tidak aktif, reset animasi  
        if (!sidebar.classList.contains('active')) {  
          resetAllAnimations();  
        }  
      }  
    }, 250);  
  });  
    
  /* =======================  
     HASH CHANGE  
  ======================= */  
  window.addEventListener('hashchange', function() {  
    const hash = window.location.hash.substring(1) || 'profil';  
    switchTab(hash);  
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
    
  /* =======================  
     STYLE UNTUK MODAL & TOAST  
  ======================= */  
  const style = document.createElement('style');  
  style.textContent = `  
    .logout-modal {  
      position: fixed;  
      top: 0;  
      left: 0;  
      width: 100%;  
      height: 100%;  
      background: rgba(0, 0, 0, 0.5);  
      display: flex;  
      align-items: center;  
      justify-content: center;  
      z-index: 9999;  
      opacity: 0;  
      transform: scale(0.8);  
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
    }  
      
    .modal-content {  
      background: white;  
      padding: 30px;  
      border-radius: 16px;  
      text-align: center;  
      max-width: 400px;  
      width: 90%;  
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);  
    }  
      
    .modal-content i {  
      font-size: 48px;  
      color: #0ea5e9;  
      margin-bottom: 20px;  
    }  
      
    .modal-content h3 {  
      color: #0c4a6e;  
      margin-bottom: 10px;  
    }  
      
    .modal-content p {  
      color: #0369a1;  
      margin-bottom: 25px;  
    }  
      
    .modal-buttons {  
      display: flex;  
      gap: 15px;  
      justify-content: center;  
    }  
      
    .modal-buttons button {  
      padding: 12px 24px;  
      border-radius: 10px;  
      border: none;  
      font-weight: 600;  
      cursor: pointer;  
      transition: all 0.3s ease;  
    }  
      
    .btn-cancel {  
      background: #e0f2fe;  
      color: #0369a1;  
      border: 1px solid #7dd3fc;  
    }  
      
    .btn-cancel:hover {  
      background: #bae6fd;  
      transform: translateY(-2px);  
    }  
      
    .btn-confirm {  
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);  
      color: white;  
    }  
      
    .btn-confirm:hover {  
      transform: translateY(-2px);  
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);  
    }  
      
    .toast {  
      position: fixed;  
      bottom: 30px;  
      right: 30px;  
      background: white;  
      padding: 15px 20px;  
      border-radius: 10px;  
      display: flex;  
      align-items: center;  
      gap: 12px;  
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);  
      z-index: 9998;  
      opacity: 0;  
      transform: translateY(20px);  
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
      border-left: 4px solid #0ea5e9;  
    }  
      
    .toast-success {  
      border-left-color: #10b981;  
    }  
      
    .toast i {  
      color: #0ea5e9;  
      font-size: 20px;  
    }  
      
    .toast-success i {  
      color: #10b981;  
    }  
      
    .toast span {  
      color: #0c4a6e;  
      font-weight: 500;  
    }  
      
    @keyframes shake {  
      0%, 100% { transform: translateX(0); }  
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }  
      20%, 40%, 60%, 80% { transform: translateX(2px); }  
    }  
  `;  
  document.head.appendChild(style);  
    
});

/* =======================  
   PROFIL ADMIN FUNCTIONALITY  
======================= */  

// Initialize Admin Profile
function initializeAdminProfile() {
    console.log('🔄 Menginisialisasi Profil Admin');
    
    // Load data from Auth if available
    if (window.Auth && window.Auth.userData) {
        updateAdminProfile(window.Auth.userData);
    } else {
        // Use default admin data
        updateAdminProfile({
            nama: 'Admin AlbEdu',
            email: 'admin@alb.edu',
            foto_profil: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=0ea5e9',
            id: 'ADM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            peran: 'Administrator'
        });
    }
    
    // Load statistics (mock data for now)
    loadAdminStatistics();
    
    // Setup event listeners
    setupProfileEventListeners();
}

// Update admin profile display
function updateAdminProfile(userData) {
    // Update avatar
    const avatarElement = document.getElementById('admin-avatar');
    if (userData.foto_profil) {
        avatarElement.innerHTML = `<img src="${userData.foto_profil}" alt="${userData.nama}" onerror="this.onerror=null; this.innerHTML='<i class=\"fas fa-user-circle\"></i>';">`;
    }
    
    // Update name and email
    document.getElementById('admin-name').textContent = userData.nama || 'Admin AlbEdu';
    document.getElementById('admin-email').textContent = userData.email || 'admin@alb.edu';
    document.getElementById('admin-id').textContent = userData.id || 'ADM-001';
    
    // Set join date (mock for now)
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 2); // 2 months ago
    document.getElementById('admin-join-date').textContent = joinDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Set last login
    const lastLogin = new Date();
    document.getElementById('admin-last-login').textContent = lastLogin.toLocaleString('id-ID', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load admin statistics (mock data)
function loadAdminStatistics() {
    // Mock data - in real app, fetch from API
    const mockStats = {
        totalExams: 24,
        totalStudents: 156,
        examsGraded: 187,
        avgScore: 78.5
    };
    
    document.getElementById('total-exams').textContent = mockStats.totalExams;
    document.getElementById('total-students').textContent = mockStats.totalStudents;
    document.getElementById('exams-graded').textContent = mockStats.examsGraded;
    document.getElementById('avg-score').textContent = mockStats.avgScore.toFixed(1);
}

// Setup event listeners for profile actions
function setupProfileEventListeners() {
    // Edit Profile Button
    document.getElementById('btn-edit-profile')?.addEventListener('click', showEditProfileModal);
    
    // Change Password Button
    document.getElementById('btn-change-password')?.addEventListener('click', showChangePasswordModal);
    
    // Notification Settings Button
    document.getElementById('btn-notification-settings')?.addEventListener('click', showNotificationSettings);
    
    // Privacy Settings Button
    document.getElementById('btn-privacy')?.addEventListener('click', showPrivacySettings);
    
    // Avatar Edit Button
    document.getElementById('btn-avatar-edit')?.addEventListener('click', showAvatarPicker);
    
    // Save Profile Button
    document.getElementById('btn-save-profile')?.addEventListener('click', saveProfileChanges);
    
    // Logout Button
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
        if (window.Auth && window.Auth.authLogout) {
            window.Auth.authLogout().then(() => {
                showToast('Berhasil logout dari admin panel', 'success');
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1500);
            }).catch(err => {
                showToast('Gagal logout: ' + err.message, 'error');
            });
        } else {
            showToast('Fitur logout tidak tersedia', 'error');
        }
    });
}

// Show Edit Profile Modal
function showEditProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'editProfileModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Profil Admin</h3>
                <button class="modal-close" id="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editFullName">Nama Lengkap</label>
                    <input type="text" id="editFullName" class="form-control" 
                           value="${document.getElementById('admin-name').textContent}">
                </div>
                <div class="form-group">
                    <label for="editAdminEmail">Email</label>
                    <input type="email" id="editAdminEmail" class="form-control" 
                           value="${document.getElementById('admin-email').textContent}">
                </div>
                <div class="form-group">
                    <label for="editTimezone">Zona Waktu</label>
                    <select id="editTimezone" class="form-control">
                        <option value="WIB" selected>WIB (GMT+7)</option>
                        <option value="WITA">WITA (GMT+8)</option>
                        <option value="WIT">WIT (GMT+9)</option>
                    </select>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelEdit">Batal</button>
                <button class="btn-modal btn-modal-save" id="saveEdit">Simpan Perubahan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
        
        // Focus on first input
        document.getElementById('editFullName').focus();
    }, 10);
    
    // Event listeners for modal
    modal.querySelector('#closeEditModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelEdit').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#saveEdit').addEventListener('click', () => {
        const newName = document.getElementById('editFullName').value;
        const newEmail = document.getElementById('editAdminEmail').value;
        
        if (!newName.trim()) {
            showToast('Nama tidak boleh kosong', 'error');
            return;
        }
        
        // Update display
        document.getElementById('admin-name').textContent = newName;
        document.getElementById('admin-email').textContent = newEmail;
        
        // Update in Auth system if available
        if (window.Auth && window.Auth.userData) {
            window.Auth.userData.nama = newName;
            window.Auth.userData.email = newEmail;
            
            // Update in Firestore if user is logged in
            if (window.Auth.currentUser) {
                firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                    nama: newName,
                    email: newEmail,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showToast('Profil berhasil diperbarui di database', 'success');
                }).catch(err => {
                    console.error('Error updating profile:', err);
                    showToast('Gagal menyimpan ke database', 'error');
                });
            }
        }
        
        showToast('Profil berhasil diperbarui', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Show Avatar Picker
function showAvatarPicker() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'avatarPickerModal';
    
    // Generate random avatars (SAME SYSTEM as UI.Profile for consistency)
    const avatars = [];
    const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles',
                   'fun-emoji', 'icons', 'identicon', 'initials', 'micah', 'miniavs',
                   'open-peeps', 'personas', 'pixel-art', 'shapes', 'thumbs'];
    
    for (let i = 1; i <= 15; i++) {
        const style = styles[(i - 1) % styles.length];
        avatars.push({
            id: `admin-avatar${i}`,
            url: `https://api.dicebear.com/7.x/${style}/svg?seed=Admin${i}&backgroundColor=0ea5e9`,
            style: style
        });
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-circle"></i> Pilih Avatar Baru</h3>
                <button class="modal-close" id="closeAvatarModal">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #64748b; margin-bottom: 20px;">Pilih avatar untuk profil Anda:</p>
                <div class="avatar-picker" id="avatarPicker">
                    ${avatars.map((avatar, index) => `
                        <div class="avatar-option ${index === 0 ? 'selected' : ''}" 
                             data-avatar="${avatar.url}">
                            <img src="${avatar.url}" alt="Avatar ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelAvatar">Batal</button>
                <button class="btn-modal btn-modal-save" id="saveAvatar">Simpan Avatar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Event listeners
    let selectedAvatar = avatars[0].url;
    
    modal.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', () => {
            modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
        });
    });
    
    modal.querySelector('#closeAvatarModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelAvatar').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#saveAvatar').addEventListener('click', () => {
        // Update avatar display
        const avatarElement = document.getElementById('admin-avatar');
        avatarElement.innerHTML = `<img src="${selectedAvatar}" alt="Avatar Baru">`;
        
        // Update in Auth system if available
        if (window.Auth && window.Auth.userData) {
            window.Auth.userData.foto_profil = selectedAvatar;
            
            // Update in Firestore if user is logged in
            if (window.Auth.currentUser) {
                firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                    foto_profil: selectedAvatar,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showToast('Avatar berhasil disimpan ke database', 'success');
                }).catch(err => {
                    console.error('Error updating avatar:', err);
                    showToast('Gagal menyimpan avatar ke database', 'error');
                });
            }
        }
        
        showToast('Avatar berhasil diubah', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Show Change Password Modal
function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'changePasswordModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-key"></i> Ubah Password</h3>
                <button class="modal-close" id="closePasswordModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="currentPassword">Password Saat Ini</label>
                    <input type="password" id="currentPassword" class="form-control" 
                           placeholder="Masukkan password saat ini">
                </div>
                <div class="form-group">
                    <label for="newPassword">Password Baru</label>
                    <input type="password" id="newPassword" class="form-control" 
                           placeholder="Masukkan password baru">
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Konfirmasi Password Baru</label>
                    <input type="password" id="confirmPassword" class="form-control" 
                           placeholder="Konfirmasi password baru">
                </div>
                <p style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    <i class="fas fa-info-circle"></i> Password harus minimal 8 karakter
                </p>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelPassword">Batal</button>
                <button class="btn-modal btn-modal-save" id="savePassword">Ubah Password</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
        document.getElementById('currentPassword').focus();
    }, 10);
    
    // Event listeners
    modal.querySelector('#closePasswordModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelPassword').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#savePassword').addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Semua field harus diisi', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Password baru tidak cocok', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showToast('Password minimal 8 karakter', 'error');
            return;
        }
        
        // Simulate password change (in real app, this would call Firebase)
        showToast('Fitur ubah password akan segera hadir', 'info');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Show Notification Settings
function showNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'notificationModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-bell"></i> Pengaturan Notifikasi</h3>
                <button class="modal-close" id="closeNotificationModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="notifExam" checked>
                        <span>Notifikasi ujian baru</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="notifResult" checked>
                        <span>Notifikasi hasil ujian</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="notifSystem" checked>
                        <span>Notifikasi sistem</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="notifEmail" checked>
                        <span>Email notifikasi</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="notifPush">
                        <span>Push notification</span>
                    </label>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelNotification">Batal</button>
                <button class="btn-modal btn-modal-save" id="saveNotification">Simpan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Event listeners
    modal.querySelector('#closeNotificationModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelNotification').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#saveNotification').addEventListener('click', () => {
        showToast('Pengaturan notifikasi berhasil disimpan', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Show Privacy Settings
function showPrivacySettings() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'privacyModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-lock"></i> Privasi & Keamanan</h3>
                <button class="modal-close" id="closePrivacyModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="privacyProfile" checked>
                        <span>Profil dapat dilihat oleh admin lain</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="privacyActivity" checked>
                        <span>Aktivitas dapat dilihat</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="privacyEmail" checked>
                        <span>Sembunyikan email dari publik</span>
                    </label>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="privacy2FA">
                        <span>Aktifkan Two-Factor Authentication</span>
                    </label>
                </div>
                <div class="form-group">
                    <label for="sessionTimeout">Timeout Sesi (menit)</label>
                    <select id="sessionTimeout" class="form-control">
                        <option value="30">30 menit</option>
                        <option value="60" selected>60 menit</option>
                        <option value="120">2 jam</option>
                        <option value="240">4 jam</option>
                    </select>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelPrivacy">Batal</button>
                <button class="btn-modal btn-modal-save" id="savePrivacy">Simpan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Event listeners
    modal.querySelector('#closePrivacyModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelPrivacy').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#savePrivacy').addEventListener('click', () => {
        showToast('Pengaturan privasi berhasil disimpan', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Save Profile Changes
function saveProfileChanges() {
    showToast('Perubahan profil disimpan', 'success');
}

// Close Modal Helper
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Toast Helper
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    toast.innerHTML = `
        <span style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'}; font-weight: bold;">${icon}</span>
        <span style="color: #0c4a6e; font-weight: 500;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize admin profile on page load if profil tab is active
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1) || 'profil';
    if (hash === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 1000);
    }
});

// Also initialize when switching to profil tab via hash change
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1) || 'profil';
    if (hash === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 300);
    }
});
