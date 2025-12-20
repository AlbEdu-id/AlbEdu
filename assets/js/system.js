// =============================================
// ALBYTE GUARD v1.1 - SYSTEM.JS LENGKAP
// =============================================
console.log('🚀 AlByte Guard v1.1 - Sistem Proteksi AlbEdu...');

// =======================
// CONFIGURATION
// =======================
const SYSTEM_CONFIG = {
    version: '1.1.0',
    debug: true,
    defaultRole: 'siswa',
    profileRequired: true,
    avatarCount: 6,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// =======================
// GLOBAL STATE
// =======================
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let profilePanelOpen = false;
let userListener = null;
let profileFormData = {};

// =======================
// ROLE PERMISSIONS
// =======================
const ROLE_PERMISSIONS = {
    admin: {
        routes: ['/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian'],
        features: ['all']
    },
    siswa: {
        routes: ['/', '/login', '/siswa', '/ujian'],
        features: ['profile', 'exams', 'results']
    }
};

// =======================
// DEFAULT AVATARS
// =======================
const DEFAULT_AVATARS = [
    'https://avatars.dicebear.com/api/identicon/albyte.svg?background=%23000000&color=%235b6af0',
    'https://avatars.dicebear.com/api/identicon/student.svg?background=%23000000&color=%2310b981',
    'https://avatars.dicebear.com/api/identicon/albedu.svg?background=%23000000&color=%239d4edd',
    'https://avatars.dicebear.com/api/identicon/avatar1.svg?background=%23000000&color=%23f59e0b',
    'https://avatars.dicebear.com/api/identicon/avatar2.svg?background=%23000000&color=%23ef4444',
    'https://avatars.dicebear.com/api/identicon/avatar3.svg?background=%23000000&color=%230ea5e9'
];

// =======================
// UTILITY FUNCTIONS
// =======================
function getBasePath() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    return parts.length > 0 ? '/' + parts[0] : '';
}

function isLoginPage() {
    const path = window.location.pathname;
    const loginPatterns = ['/login', '/login.html', '/index.html'];
    return loginPatterns.some(pattern => path.includes(pattern));
}

function normalizePath(path) {
    let normalized = path.replace('.html', '').replace('.php', '');
    const base = getBasePath();
    if (normalized.startsWith(base)) {
        normalized = normalized.substring(base.length);
    }
    return normalized || '/';
}

function log(message, type = 'info') {
    if (!SYSTEM_CONFIG.debug) return;
    
    const styles = {
        info: 'color: #5b6af0;',
        success: 'color: #10b981;',
        warning: 'color: #f59e0b;',
        error: 'color: #ef4444;',
        system: 'color: #9d4edd; font-weight: bold;'
    };
    
    console.log(`%c[ALBYTE] ${message}`, styles[type] || styles.info);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =======================
// UI COMPONENTS
// =======================
function showAuthLoading(text = 'Memproses...') {
    let el = document.getElementById('authLoading');
    if (!el) {
        el = document.createElement('div');
        el.id = 'authLoading';
        el.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(15px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        el.innerHTML = `
            <div style="position: relative;">
                <div style="
                    width: 80px;
                    height: 80px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    position: relative;
                    margin-bottom: 30px;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: 3px solid transparent;
                        border-top-color: #5b6af0;
                        border-radius: 50%;
                        animation: spin 1.2s cubic-bezier(0.19, 1, 0.22, 1) infinite;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        width: 60px;
                        height: 60px;
                        border: 3px solid transparent;
                        border-top-color: #9d4edd;
                        border-radius: 50%;
                        animation: spin 1.5s cubic-bezier(0.19, 1, 0.22, 1) infinite reverse;
                    "></div>
                </div>
                <p style="font-size: 1.2rem; opacity: 0.9; margin: 0; text-align: center;"></p>
                <p style="font-size: 0.9rem; opacity: 0.6; margin-top: 10px;">AlByte Guard v${SYSTEM_CONFIG.version}</p>
            </div>
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    el.style.display = 'flex';
    const p = el.querySelector('p');
    if (p) p.textContent = text;
    log(text, 'system');
}

function hideAuthLoading() {
    const el = document.getElementById('authLoading');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.display = 'none';
            el.style.opacity = '1';
        }, 300);
    }
}

function showSuccess(message, duration = 3000) {
    let el = document.getElementById('successToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'successToast';
        el.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(34, 197, 94, 0.95);
            backdrop-filter: blur(20px);
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.4);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: none;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideUpBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUpBounce {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(30px);
                }
                70% {
                    transform: translateX(-50%) translateY(-10px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes checkmark {
                0% { transform: scale(0); }
                70% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    el.innerHTML = `
        <div style="
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: checkmark 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <span>${message}</span>
    `;
    
    el.style.display = 'flex';
    el.style.animation = 'slideUpBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => {
            el.style.display = 'none';
            el.style.opacity = '1';
            el.style.transform = 'translateX(-50%) translateY(0)';
        }, 300);
    }, duration);
    
    log(`Success: ${message}`, 'success');
}

function showError(message, duration = 5000) {
    let el = document.getElementById('errorToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'errorToast';
        el.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(239, 68, 68, 0.95);
            backdrop-filter: blur(20px);
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.4);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: none;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideInRight 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes errorShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    el.innerHTML = `
        <div style="
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: errorShake 0.5s ease;
        ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
        <span>${message}</span>
    `;
    
    el.style.display = 'flex';
    el.style.animation = 'slideInRight 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
    
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(10px)';
        setTimeout(() => {
            el.style.display = 'none';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        }, 300);
    }, duration);
    
    log(`Error: ${message}`, 'error');
}

function showWarning(message) {
    let el = document.getElementById('warningToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'warningToast';
        el.style.cssText = `
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(245, 158, 11, 0.95);
            backdrop-filter: blur(20px);
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.4);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: none;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideDown 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    el.innerHTML = `
        <div style="
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V11M12 15H12.01M10.29 3.86L1.82 18C1.64538 18.3024 1.55299 18.6453 1.552 18.9945C1.55101 19.3437 1.64146 19.6871 1.81445 19.9905C1.98744 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5318 3.5661 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4682 3.5661 10.29 3.86Z" 
                      stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <span>${message}</span>
    `;
    
    el.style.display = 'flex';
    el.style.animation = 'slideDown 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
    
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.display = 'none';
            el.style.opacity = '1';
        }, 300);
    }, 5000);
    
    log(`Warning: ${message}`, 'warning');
}

// =======================
// INITIALIZATION SYSTEM
// =======================
async function initializeSystem() {
    log('Initializing AlByte Guard v1.1...', 'system');
    showAuthLoading('Memulai sistem keamanan...');
    
    // Check Firebase availability
    if (typeof firebaseAuth === 'undefined') {
        log('Firebase not ready, waiting...', 'warning');
        setTimeout(initializeSystem, 1000);
        return;
    }
    
    try {
        // Setup auth state listener
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
    } catch (error) {
        log(`Initialization error: ${error.message}`, 'error');
        showError('Gagal memulai sistem');
        hideAuthLoading();
    }
}

async function handleAuthStateChange(user) {
    try {
        if (user) {
            await handleAuthenticatedUser(user);
        } else {
            await handleUnauthenticatedUser();
        }
    } catch (error) {
        log(`Auth state error: ${error.message}`, 'error');
        showError('Kesalahan sistem autentikasi');
        hideAuthLoading();
    }
}

async function handleAuthenticatedUser(user) {
    log(`User authenticated: ${user.email}`, 'success');
    currentUser = user;
    
    showAuthLoading('Memuat data pengguna...');
    await fetchUserData(user.uid);
    
    // Setup real-time listener
    setupUserDataListener(user.uid);
    
    // Delay for stability
    await sleep(500);
    
    showAuthLoading('Memverifikasi akses...');
    await checkPageAccess();
    
    authReady = true;
    hideAuthLoading();
    
    // Initialize profile system for siswa
    if (userRole === 'siswa' && window.location.pathname.includes('/siswa')) {
        await initializeProfileSystem();
    }
    
    log('System ready', 'success');
}

async function handleUnauthenticatedUser() {
    log('User not authenticated', 'warning');
    currentUser = null;
    userRole = null;
    userData = null;
    authReady = true;
    
    // Cleanup listeners
    if (userListener) {
        userListener();
        userListener = null;
    }
    
    hideAuthLoading();
    
    if (!isLoginPage()) {
        redirectToLogin();
    }
}

// =======================
// USER DATA MANAGEMENT
// =======================
async function fetchUserData(userId) {
    try {
        log(`Fetching user data for: ${userId}`, 'info');
        const docRef = firebaseDb.collection('users').doc(userId);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            userData = docSnap.data();
            userRole = userData.peran || SYSTEM_CONFIG.defaultRole;
            
            // Calculate profile completeness
            userData.profileComplete = calculateProfileCompleteness(userData);
            
            log(`User role: ${userRole}, Profile complete: ${userData.profileComplete}`, 'info');
        } else {
            log('User data not found, creating...', 'warning');
            await createUserData(userId);
            await fetchUserData(userId); // Recursive call to get new data
        }
    } catch (error) {
        log(`Error fetching user data: ${error.message}`, 'error');
        throw error;
    }
}

function calculateProfileCompleteness(data) {
    if (!data) return false;
    
    const requiredFields = ['nama', 'nis', 'kelas', 'foto_profil'];
    let completed = 0;
    
    requiredFields.forEach(field => {
        if (data[field] && data[field].trim().length > 0) {
            completed++;
        }
    });
    
    return completed === requiredFields.length;
}

async function createUserData(userId) {
    const user = firebaseAuth.currentUser;
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    
    const userData = {
        id: userId,
        nama: user.displayName || '',
        email: user.email,
        foto_profil: user.photoURL || randomAvatar,
        peran: SYSTEM_CONFIG.defaultRole,
        profilLengkap: false,
        profileComplete: false,
        kelas: '',
        nis: '',
        telepon: '',
        alamat: '',
        stats: {
            ujian_diikuti: 0,
            nilai_rata: 0,
            ranking: 0,
            last_active: new Date().toISOString()
        },
        preferences: {
            theme: 'dark',
            notifications: true,
            language: 'id'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await firebaseDb.collection('users').doc(userId).set(userData);
        log('New user data created successfully', 'success');
    } catch (error) {
        log(`Error creating user data: ${error.message}`, 'error');
        throw error;
    }
}

function setupUserDataListener(userId) {
    // Cleanup existing listener
    if (userListener) {
        userListener();
    }
    
    userListener = firebaseDb.collection('users').doc(userId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const newData = doc.data();
                const oldComplete = userData?.profileComplete;
                const oldRole = userData?.peran;
                
                userData = newData;
                userData.profileComplete = calculateProfileCompleteness(newData);
                userRole = newData.peran || userRole;
                
                // Update UI if profile status changed
                if (oldComplete !== userData.profileComplete) {
                    updateProfileBadge();
                    
                    if (profilePanelOpen) {
                        updateProfilePanel();
                    }
                }
                
                // Handle role change
                if (oldRole !== userRole) {
                    log(`Role changed from ${oldRole} to ${userRole}`, 'warning');
                    checkPageAccess();
                }
                
                log('User data updated in real-time', 'info');
            }
        }, (error) => {
            log(`User data listener error: ${error.message}`, 'error');
        });
}

// =======================
// PROFILE SYSTEM
// =======================
async function initializeProfileSystem() {
    log('Initializing profile system...', 'system');
    
    // Load CSS if not already loaded
    loadProfileCSS();
    
    // Wait for DOM to be ready
    await sleep(100);
    
    // Create profile badge
    if (!document.getElementById('profileBadge')) {
        createProfileBadge();
    }
    
    // Create profile panel
    if (!document.getElementById('profilePanel')) {
        createProfilePanel();
    }
    
    // Initialize form data
    profileFormData = {
        nama: userData?.nama || '',
        nis: userData?.nis || '',
        kelas: userData?.kelas || '',
        foto_profil: userData?.foto_profil || DEFAULT_AVATARS[0]
    };
    
    updateProfileBadge();
    log('Profile system ready', 'success');
}

function loadProfileCSS() {
    if (document.getElementById('profile-css')) return;
    
    const link = document.createElement('link');
    link.id = 'profile-css';
    link.rel = 'stylesheet';
    link.href = `${getBasePath()}/assets/css/profile.css`;
    
    link.onload = () => log('Profile CSS loaded', 'success');
    link.onerror = () => {
        log('Failed to load profile CSS, using fallback', 'warning');
        // Could add inline CSS fallback here
    };
    
    document.head.appendChild(link);
}

function createProfileBadge() {
    const badge = document.createElement('div');
    badge.id = 'profileBadge';
    badge.className = 'profile-badge';
    badge.innerHTML = `
        <div class="profile-btn" onclick="toggleProfilePanel()">
            <img id="profileBadgeImage" 
                 src="${userData?.foto_profil || DEFAULT_AVATARS[0]}" 
                 alt="Profile"
                 onerror="this.src='${DEFAULT_AVATARS[0]}'">
            <div class="profile-indicator" id="profileIndicator">!</div>
        </div>
    `;
    document.body.appendChild(badge);
    
    log('Profile badge created', 'info');
}

function updateProfileBadge() {
    const badgeImg = document.getElementById('profileBadgeImage');
    const indicator = document.getElementById('profileIndicator');
    
    if (!badgeImg || !indicator) return;
    
    // Update image
    const avatarUrl = userData?.foto_profil || DEFAULT_AVATARS[0];
    badgeImg.src = avatarUrl;
    
    // Update indicator
    if (SYSTEM_CONFIG.profileRequired && !userData?.profileComplete) {
        indicator.style.display = 'flex';
        indicator.title = 'Lengkapi profil Anda!';
    } else {
        indicator.style.display = 'none';
    }
    
    // Add pulse animation for incomplete profile
    if (!userData?.profileComplete) {
        badgeImg.style.animation = 'avatarGlow 3s ease-in-out infinite alternate';
    } else {
        badgeImg.style.animation = '';
    }
}

function createProfilePanel() {
    const panelContainer = document.createElement('div');
    panelContainer.id = 'profilePanel';
    panelContainer.className = 'profile-panel-container';
    
    const profileComplete = userData?.profileComplete || false;
    const warningHtml = !profileComplete ? `
        <div class="warning-badge">
            <span class="warning-badge-icon">⚠️</span>
            <span class="warning-badge-text">Lengkapi profil untuk akses penuh!</span>
        </div>
    ` : '';
    
    panelContainer.innerHTML = `
        <div class="profile-panel-backdrop" onclick="closeProfilePanel()"></div>
        <div class="profile-panel">
            ${warningHtml}
            
            <div class="profile-header">
                <div class="profile-avatar-container">
                    <img id="profilePanelAvatar" class="profile-avatar" 
                         src="${userData?.foto_profil || DEFAULT_AVATARS[0]}" 
                         alt="Profile"
                         onerror="this.src='${DEFAULT_AVATARS[0]}'">
                    <div class="avatar-edit-btn" onclick="openAvatarEditor()" title="Edit foto profil">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </div>
                </div>
                <h2 class="profile-name" id="profilePanelName">${userData?.nama || 'Belum diisi'}</h2>
                <p class="profile-email">${currentUser?.email || ''}</p>
            </div>
            
            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-value">${userData?.stats?.ujian_diikuti || 0}</div>
                    <div class="stat-label">Ujian Diikuti</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userData?.stats?.nilai_rata || 0}</div>
                    <div class="stat-label">Nilai Rata-rata</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">#${userData?.stats?.ranking || 0}</div>
                    <div class="stat-label">Ranking</div>
                </div>
            </div>
            
            <form class="profile-form" id="profileForm" onsubmit="updateProfile(event)">
                <div class="form-group">
                    <label class="form-label">Nama Lengkap *</label>
                    <input type="text" class="form-input" id="profileName" 
                           value="${userData?.nama || ''}" 
                           placeholder="Masukkan nama lengkap" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nomor Induk Siswa (NIS) *</label>
                    <input type="text" class="form-input" id="profileNIS" 
                           value="${userData?.nis || ''}" 
                           placeholder="Masukkan NIS" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Kelas *</label>
                    <input type="text" class="form-input" id="profileKelas" 
                           value="${userData?.kelas || ''}" 
                           placeholder="Contoh: XII IPA 1" required>
                </div>
                
                <div class="photo-options" id="avatarOptions" style="display: none;">
                    <div class="photo-options-title">Pilih Foto Profil</div>
                    <div class="photo-options-grid" id="avatarGrid">
                        <!-- Avatar options will be populated dynamically -->
                    </div>
                    <div class="custom-photo-upload">
                        <label class="upload-btn">
                            <span>📷 Upload Foto Sendiri</span>
                            <input type="file" id="photoUpload" accept="image/*" 
                                   onchange="handlePhotoUpload(event)">
                        </label>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeProfilePanel()">
                        Batal
                    </button>
                    <button type="submit" class="btn btn-primary" id="saveProfileBtn">
                        <span class="loading-spinner" style="display: none;"></span>
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(panelContainer);
    log('Profile panel created', 'info');
}

function toggleProfilePanel() {
    if (profilePanelOpen) {
        closeProfilePanel();
    } else {
        openProfilePanel();
    }
}

function openProfilePanel() {
    const panel = document.getElementById('profilePanel');
    if (!panel) return;
    
    panel.style.display = 'block';
    setTimeout(() => {
        panel.style.opacity = '1';
        profilePanelOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Populate avatar options
        populateAvatarOptions();
        
        // Update form with current data
        updateProfileForm();
        
        log('Profile panel opened', 'info');
    }, 10);
}

function closeProfilePanel() {
    const panel = document.getElementById('profilePanel');
    if (!panel) return;
    
    panel.style.opacity = '0';
    setTimeout(() => {
        panel.style.display = 'none';
        profilePanelOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Hide avatar options
        const avatarOptions = document.getElementById('avatarOptions');
        if (avatarOptions) avatarOptions.style.display = 'none';
        
        log('Profile panel closed', 'info');
    }, 300);
}

function updateProfileForm() {
    if (!userData) return;
    
    document.getElementById('profileName').value = userData.nama || '';
    document.getElementById('profileNIS').value = userData.nis || '';
    document.getElementById('profileKelas').value = userData.kelas || '';
    
    // Update panel avatar and name
    const panelAvatar = document.getElementById('profilePanelAvatar');
    const panelName = document.getElementById('profilePanelName');
    
    if (panelAvatar) panelAvatar.src = userData.foto_profil || DEFAULT_AVATARS[0];
    if (panelName) panelName.textContent = userData.nama || 'Belum diisi';
}

function populateAvatarOptions() {
    const avatarGrid = document.getElementById('avatarGrid');
    if (!avatarGrid) return;
    
    avatarGrid.innerHTML = '';
    
    DEFAULT_AVATARS.forEach((avatar, index) => {
        const isCurrent = avatar === (userData?.foto_profil || DEFAULT_AVATARS[0]);
        const option = document.createElement('div');
        option.className = `photo-option ${isCurrent ? 'active' : ''}`;
        option.onclick = () => selectAvatar(avatar);
        option.innerHTML = `<img src="${avatar}" alt="Avatar ${index + 1}" 
                               onerror="this.src='${DEFAULT_AVATARS[0]}'">`;
        avatarGrid.appendChild(option);
    });
    
    log('Avatar options populated', 'info');
}

function selectAvatar(avatarUrl) {
    const currentAvatar = document.getElementById('profilePanelAvatar');
    const badgeAvatar = document.getElementById('profileBadgeImage');
    
    if (currentAvatar) {
        currentAvatar.src = avatarUrl;
        currentAvatar.onerror = () => {
            currentAvatar.src = DEFAULT_AVATARS[0];
        };
    }
    
    if (badgeAvatar) {
        badgeAvatar.src = avatarUrl;
        badgeAvatar.onerror = () => {
            badgeAvatar.src = DEFAULT_AVATARS[0];
        };
    }
    
    // Update active state
    document.querySelectorAll('.photo-option').forEach(option => {
        const img = option.querySelector('img');
        option.classList.toggle('active', img.src === avatarUrl);
    });
    
    // Update form data
    profileFormData.foto_profil = avatarUrl;
    
    log('Avatar selected', 'info');
}

function openAvatarEditor() {
    const avatarOptions = document.getElementById('avatarOptions');
    if (avatarOptions) {
        avatarOptions.style.display = 'block';
        avatarOptions.style.animation = 'formSlideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards';
    }
}

async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!SYSTEM_CONFIG.allowedImageTypes.includes(file.type)) {
        showError('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.');
        return;
    }
    
    if (file.size > SYSTEM_CONFIG.maxFileSize) {
        showError(`Ukuran file maksimal ${SYSTEM_CONFIG.maxFileSize / 1024 / 1024}MB`);
        return;
    }
    
    try {
        showAuthLoading('Mengupload foto...');
        
        // Create preview
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target.result;
            
            // Update preview immediately
            const currentAvatar = document.getElementById('profilePanelAvatar');
            const badgeAvatar = document.getElementById('profileBadgeImage');
            
            if (currentAvatar) currentAvatar.src = base64Image;
            if (badgeAvatar) badgeAvatar.src = base64Image;
            
            try {
                // Upload to Firebase Storage
                const storageRef = firebase.storage().ref();
                const user = firebaseAuth.currentUser;
                const timestamp = Date.now();
                const fileName = `profile_photos/${user.uid}_${timestamp}.jpg`;
                const fileRef = storageRef.child(fileName);
                
                // Convert base64 to blob
                const response = await fetch(base64Image);
                const blob = await response.blob();
                
                // Upload with metadata
                const metadata = {
                    contentType: 'image/jpeg',
                    customMetadata: {
                        uploadedBy: user.uid,
                        uploadedAt: timestamp.toString()
                    }
                };
                
                await fileRef.put(blob, metadata);
                const downloadURL = await fileRef.getDownloadURL();
                
                // Update user data
                await firebaseDb.collection('users').doc(user.uid).update({
                    foto_profil: downloadURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update form data
                profileFormData.foto_profil = downloadURL;
                
                hideAuthLoading();
                showSuccess('Foto profil berhasil diupload!');
                
                log('Profile photo uploaded', 'success');
            } catch (uploadError) {
                hideAuthLoading();
                showError('Gagal mengupload foto. Coba lagi.');
                log(`Upload error: ${uploadError.message}`, 'error');
                
                // Revert to previous avatar
                if (currentAvatar) currentAvatar.src = userData?.foto_profil || DEFAULT_AVATARS[0];
                if (badgeAvatar) badgeAvatar.src = userData?.foto_profil || DEFAULT_AVATARS[0];
            }
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        hideAuthLoading();
        showError('Terjadi kesalahan saat memproses foto');
        log(`Photo processing error: ${error.message}`, 'error');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const saveBtn = document.getElementById('saveProfileBtn');
    const spinner = saveBtn.querySelector('.loading-spinner');
    const btnText = saveBtn.querySelector('span:not(.loading-spinner)');
    
    try {
        // Get form values
        const name = document.getElementById('profileName').value.trim();
        const nis = document.getElementById('profileNIS').value.trim();
        const kelas = document.getElementById('profileKelas').value.trim();
        const currentAvatar = document.getElementById('profilePanelAvatar').src;
        
        // Validate
        if (!name || !nis || !kelas) {
            showError('Harap isi semua field yang diperlukan');
            return;
        }
        
        // Update form data
        profileFormData = {
            nama: name,
            nis: nis,
            kelas: kelas,
            foto_profil: currentAvatar
        };
        
        // Show loading state
        saveBtn.disabled = true;
        spinner.style.display = 'inline-block';
        btnText.textContent = 'Menyimpan...';
        
        // Check if profile is now complete
        const isProfileComplete = !!name && !!nis && !!kelas && !!currentAvatar;
        
        // Prepare update data
        const updateData = {
            nama: name,
            nis: nis,
            kelas: kelas,
            foto_profil: currentAvatar,
            profilLengkap: isProfileComplete,
            profileComplete: isProfileComplete,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add stats if first time
        if (!userData?.stats) {
            updateData.stats = {
                ujian_diikuti: 0,
                nilai_rata: 0,
                ranking: 0,
                last_active: new Date().toISOString()
            };
        }
        
        // Update Firestore
        await firebaseDb.collection('users').doc(currentUser.uid).update(updateData);
        
        // Update local data
        userData = { ...userData, ...updateData };
        
        // Update UI
        updateProfileBadge();
        updateProfilePanel();
        
        // Show success
        showSuccess('Profil berhasil diperbarui!');
        
        // Close panel after delay
        setTimeout(() => {
            closeProfilePanel();
        }, 1500);
        
        log('Profile updated successfully', 'success');
        
    } catch (error) {
        console.error('[PROFILE] Update error:', error);
        showError('Gagal menyimpan profil. Coba lagi.');
        log(`Profile update error: ${error.message}`, 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Simpan Perubahan';
    }
}

function updateProfilePanel() {
    const nameElement = document.getElementById('profilePanelName');
    const avatarElement = document.getElementById('profilePanelAvatar');
    const badgeAvatar = document.getElementById('profileBadgeImage');
    
    if (nameElement && userData) {
        nameElement.textContent = userData.nama || 'Belum diisi';
        nameElement.style.color = userData.profileComplete ? 'white' : '#ef4444';
    }
    
    if (avatarElement && userData) {
        avatarElement.src = userData.foto_profil || DEFAULT_AVATARS[0];
    }
    
    if (badgeAvatar && userData) {
        badgeAvatar.src = userData.foto_profil || DEFAULT_AVATARS[0];
    }
    
    // Update form fields
    updateProfileForm();
}

// =======================
// AUTHENTICATION
// =======================
async function authLogin() {
    try {
        log('Starting Google login...', 'info');
        showAuthLoading('Membuka Google Login…');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        const result = await firebaseAuth.signInWithPopup(provider);
        
        log(`Login successful: ${result.user.email}`, 'success');
        showAuthLoading('Login berhasil, menyiapkan sistem…');
        
        return result;
    } catch (error) {
        log(`Login error: ${error.message}`, 'error');
        
        // Handle specific errors
        if (error.code === 'auth/popup-closed-by-user') {
            showWarning('Login dibatalkan oleh pengguna');
        } else if (error.code === 'auth/popup-blocked') {
            showError('Popup diblokir. Izinkan popup untuk melanjutkan login.');
        } else {
            showError(error.message || 'Login Google gagal');
        }
        
        hideAuthLoading();
        throw error;
    }
}

async function authLogout() {
    try {
        const confirmLogout = confirm('Apakah Anda yakin ingin logout?');
        if (!confirmLogout) return;
        
        showAuthLoading('Logout…');
        
        // Cleanup before logout
        if (userListener) {
            userListener();
            userListener = null;
        }
        
        await firebaseAuth.signOut();
        
        log('Logout successful', 'success');
        window.location.href = `${getBasePath()}/login.html`;
        
    } catch (error) {
        log(`Logout error: ${error.message}`, 'error');
        showError('Gagal logout.');
        hideAuthLoading();
    }
}

// =======================
// ACCESS CONTROL
// =======================
async function checkPageAccess() {
    // Wait for auth to be ready
    if (!authReady) {
        setTimeout(checkPageAccess, 100);
        return;
    }
    
    const currentPath = window.location.pathname;
    const normalizedPath = normalizePath(currentPath);
    
    log(`Checking access: ${normalizedPath} | Role: ${userRole} | Auth: ${!!currentUser}`, 'info');
    
    // Case 1: Not authenticated but not on login page
    if (!currentUser && !isLoginPage()) {
        log('Access denied: Not authenticated', 'warning');
        redirectToLogin();
        return;
    }
    
    // Case 2: Authenticated but on login page
    if (currentUser && isLoginPage()) {
        log('Already authenticated, redirecting...', 'info');
        setTimeout(() => redirectBasedOnRole(), 800);
        return;
    }
    
    // Case 3: Authenticated, check role permissions
    if (currentUser) {
        const roleConfig = ROLE_PERMISSIONS[userRole];
        
        if (!roleConfig || !roleConfig.routes.includes(normalizedPath)) {
            log(`Access denied for role ${userRole} to ${normalizedPath}`, 'warning');
            showAccessDenied();
            return;
        }
        
        // Additional check for siswa profile completeness
        if (userRole === 'siswa' && SYSTEM_CONFIG.profileRequired && 
            !userData?.profileComplete && normalizedPath !== '/siswa') {
            log('Profile incomplete, redirecting to profile', 'warning');
            showWarning('Lengkapi profil terlebih dahulu!');
            setTimeout(() => {
                window.location.href = `${getBasePath()}/siswa/`;
            }, 1500);
            return;
        }
        
        log('Access granted', 'success');
    }
}

function redirectBasedOnRole() {
    if (!userRole) return;
    
    const base = getBasePath();
    let target = `${base}/login.html`;
    
    if (userRole === 'admin') target = `${base}/admin/`;
    if (userRole === 'siswa') target = `${base}/siswa/`;
    
    // Don't redirect if already on target page
    const currentPath = window.location.pathname;
    if (currentPath === target || currentPath === target + 'index.html') {
        return;
    }
    
    log(`Redirecting to: ${target}`, 'info');
    window.location.href = target;
}

function redirectToLogin() {
    const base = getBasePath();
    const target = `${base}/login.html`;
    
    // Don't redirect if already on login page
    if (isLoginPage()) return;
    
    log(`Redirecting to login: ${target}`, 'info');
    window.location.href = target;
}

function showAccessDenied() {
    const base = getBasePath();
    
    if (userRole === 'admin') {
        window.location.href = `${base}/admin/`;
    } else if (userRole === 'siswa') {
        window.location.href = `${base}/siswa/`;
    } else {
        window.location.href = `${base}/login.html`;
    }
}

// =======================
// SYSTEM BOOTSTRAP
// =======================
document.addEventListener('DOMContentLoaded', () => {
    // Add global system styles
    const systemStyles = document.createElement('style');
    systemStyles.textContent = `
        /* System Animations */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Prevent text selection on buttons */
        .profile-btn, .btn, .avatar-edit-btn {
            user-select: none;
            -webkit-user-select: none;
        }
        
        /* Smooth transitions */
        .profile-panel-container,
        .profile-panel,
        .profile-btn {
            transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }
    `;
    document.head.appendChild(systemStyles);
    
    // Initialize system after short delay
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            log('Firebase not loaded', 'error');
            showError('Sistem Firebase belum siap. Refresh halaman.');
            return;
        }
        
        initializeSystem();
    }, 300);
});

// =======================
// GLOBAL EXPORTS
// =======================
window.authLogin = authLogin;
window.authLogout = authLogout;
window.checkPageAccess = checkPageAccess;
window.toggleProfilePanel = toggleProfilePanel;
window.openProfilePanel = openProfilePanel;
window.closeProfilePanel = closeProfilePanel;
window.updateProfile = updateProfile;
window.openAvatarEditor = openAvatarEditor;
window.selectAvatar = selectAvatar;
window.handlePhotoUpload = handlePhotoUpload;

// Export for debugging
window.ALBYTE_SYSTEM = {
    version: SYSTEM_CONFIG.version,
    user: () => currentUser,
    userData: () => userData,
    role: () => userRole,
    isProfileComplete: () => userData?.profileComplete || false,
    reloadUserData: () => currentUser ? fetchUserData(currentUser.uid) : null
};

log(`AlByte Guard v${SYSTEM_CONFIG.version} SISTEM AKTIF`, 'system');
