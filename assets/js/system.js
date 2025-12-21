// ByteWard v0.1.7 RQB - Sistem Autentikasi Deterministik Stabil
// Enhanced dengan Login-Only Redirect & Hard Block Protection
// ROLE HIERARCHY: Admin = Superuser, Siswa = Strict

console.log('🚀 Memuat ByteWard v0.1.7 RQB - Sistem Navigasi Deterministik Stabil...');

// =======================
// Global State
// =======================
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let profileListener = null;

// =======================
// Constants
// =======================
const DEFAULT_AVATARS = [
    {
        id: 'github',
        name: 'GitHub Identicon',
        url: null,
        color: '#1f2937'
    },
    {
        id: 'male1',
        name: 'Male Avatar',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=5b6af0',
        color: '#5b6af0'
    },
    {
        id: 'female1',
        name: 'Female Avatar',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=9d4edd',
        color: '#9d4edd'
    },
    {
        id: 'robot',
        name: 'Robot',
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=10b981',
        color: '#10b981'
    },
    {
        id: 'cat',
        name: 'Cat',
        url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=f59e0b',
        color: '#f59e0b'
    },
    {
        id: 'alien',
        name: 'Alien',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alien&backgroundColor=8b5cf6',
        color: '#8b5cf6'
    }
];

// =======================
// Profile State
// =======================
let profileState = {
    isProfileComplete: false,
    selectedAvatar: null,
    customAvatar: null,
    tempName: '',
    isLoading: false,
    hasChanges: false
};

// =======================
// Core Utilities
// =======================
function getBasePath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment);
    
    if (segments.length > 0 && ['admin', 'siswa', 'ujian'].includes(segments[0])) {
        return `/${segments[0]}`;
    }
    
    return '';
}

function isLoginPage() {
    const currentPath = getNormalizedPath();
    return currentPath === '/login' || currentPath === '/login.html';
}

function generateGitHubAvatar(email) {
    const hash = email.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `https://github.com/identicons/${Math.abs(hash)}.png`;
}

// =======================
// Loading System (CSS-free)
// =======================
function showAuthLoading(text = 'Memverifikasi sesi login…') {
    let el = document.getElementById('loadingIndicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.className = 'byteward-loading';
        el.innerHTML = `
            <div class="byteward-spinner"></div>
            <p>${text}</p>
        `;
        document.body.appendChild(el);
    }
    
    el.style.display = 'flex';
    const p = el.querySelector('p');
    if (p) p.textContent = text;
    
    console.log('[BYTEWARD]', text);
}

function hideAuthLoading() {
    const el = document.getElementById('loadingIndicator');
    if (el) el.style.display = 'none';
}

// =======================
// Redirect System (Login-Only)
// =======================
function performLoginRedirect() {
    if (!isLoginPage()) {
        console.log('[REDIRECT] Skipping - bukan halaman login');
        return;
    }
    
    if (!currentUser || !userRole) {
        console.log('[REDIRECT] Skipping - user belum login');
        return;
    }
    
    const messages = {
        admin: 'Memindahkan Anda ke halaman admin…',
        siswa: 'Memindahkan Anda ke halaman siswa…'
    };
    
    const message = messages[userRole] || 'Memindahkan Anda…';
    showAuthLoading(message);
    
    setTimeout(() => {
        const targetPath = userRole === 'admin' ? '/admin/index.html' : '/siswa/index.html';
        const fullPath = getBasePath() + targetPath;
        
        console.log(`[REDIRECT] Mengarahkan ${userRole} ke ${fullPath}`);
        window.location.replace(fullPath);
    }, 800);
}

// =======================
// Login Page Guard (Satu-satunya Gerbang Redirect)
// =======================
function handleLoginPageGuard() {
    if (!isLoginPage()) return false;
    
    if (currentUser && userRole) {
        console.log('[LOGIN-GUARD] User sudah login, redirect sesuai role');
        performLoginRedirect();
        return true;
    }
    
    return false;
}

// =======================
// Role Resolution System
// =======================
function resolveUserRole(peranData) {
    const validRoles = ['admin', 'siswa'];
    
    if (!peranData || typeof peranData !== 'string') {
        console.warn('[ROLE] Data role tidak valid, default ke siswa');
        return 'siswa';
    }
    
    const normalizedRole = peranData.toLowerCase().trim();
    
    if (validRoles.includes(normalizedRole)) {
        return normalizedRole;
    }
    
    console.warn(`[ROLE] Role "${peranData}" tidak dikenali, default ke siswa`);
    return 'siswa';
}

// =======================
// Profile Completeness Check
// =======================
function checkProfileCompleteness(data) {
    if (!data) return false;
    
    const hasName = data.nama && data.nama.trim().length > 0;
    const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;
    
    return hasName && hasAvatar;
}

// =======================
// Profile Button System
// =======================
function createProfileButton() {
    const existing = document.querySelector('.profile-button-container');
    if (existing) existing.remove();
    
    const container = document.createElement('div');
    container.className = 'profile-button-container';
    
    const button = document.createElement('button');
    button.className = 'profile-button';
    button.id = 'profileTrigger';
    button.innerHTML = `
        <img src="${userData?.foto_profil || generateGitHubAvatar(currentUser.email)}" 
             alt="Profile" 
             class="profile-image"
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280'">
    `;
    
    if (!profileState.isProfileComplete) {
        const indicator = document.createElement('div');
        indicator.className = 'profile-indicator';
        indicator.textContent = '!';
        indicator.title = 'Profil belum lengkap';
        button.appendChild(indicator);
    }
    
    button.addEventListener('click', showProfilePanel);
    
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateProfileButton() {
    const button = document.getElementById('profileTrigger');
    if (!button) return;
    
    const img = button.querySelector('.profile-image');
    if (img && userData?.foto_profil) {
        img.src = userData.foto_profil;
    }
    
    const indicator = button.querySelector('.profile-indicator');
    if (profileState.isProfileComplete) {
        if (indicator) indicator.remove();
    } else {
        if (!indicator) {
            const newIndicator = document.createElement('div');
            newIndicator.className = 'profile-indicator';
            newIndicator.textContent = '!';
            newIndicator.title = 'Profil belum lengkap';
            button.appendChild(newIndicator);
        }
    }
}

// =======================
// Profile Panel System
// =======================
function createProfilePanel() {
    const existing = document.getElementById('profilePanel');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profileOverlay';
    
    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';
    
    panel.innerHTML = `
        <div class="profile-header">
            <h2>${profileState.isProfileComplete ? 'Profil Saya' : 'Lengkapi Profil'}</h2>
            <button class="close-profile" id="closeProfile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
            
        <div class="profile-content">
            <div class="current-profile">
                <img src="${userData?.foto_profil || generateGitHubAvatar(currentUser.email)}" 
                     alt="Current Avatar" 
                     class="current-avatar"
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280'">
                <div class="current-name">${userData?.nama || currentUser.displayName || 'Nama belum diisi'}</div>
            </div>
                
            <div class="edit-section">
                <div class="name-input-group">
                    <label for="profileName">Nama Lengkap</label>
                    <input type="text" 
                           id="profileName" 
                           class="name-input" 
                           placeholder="Masukkan nama lengkap"
                           value="${userData?.nama || ''}">
                </div>
                    
                <div class="avatar-options">
                    <div class="option-title">Pilih Avatar</div>
                    <div class="option-grid" id="avatarOptions"></div>
                        
                    <div class="custom-upload">
                        <label class="upload-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Unggah Foto Sendiri
                            <input type="file" 
                                   id="avatarUpload" 
                                   class="upload-input" 
                                   accept="image/*">
                        </label>
                            
                        <div class="preview-container" id="previewContainer">
                            <div class="preview-title">Pratinjau:</div>
                            <img class="preview-image" id="previewImage">
                        </div>
                    </div>
                </div>
                    
                <div class="status-message" id="statusMessage"></div>
                    
                <div class="profile-actions">
                    <button class="save-btn" id="saveProfile" disabled>
                        <span id="saveText">Simpan Perubahan</span>
                        <span class="save-loading" id="saveLoading">
                            <span class="spinner"></span>
                            Menyimpan...
                        </span>
                    </button>
                    <button class="cancel-btn" id="cancelEdit">Batal</button>
                </div>
            </div>
        </div>
    `;
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    initializeProfilePanel();
}

function initializeProfilePanel() {
    populateAvatarOptions();
    
    document.getElementById('closeProfile').addEventListener('click', hideProfilePanel);
    document.getElementById('cancelEdit').addEventListener('click', hideProfilePanel);
    document.getElementById('profileOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'profileOverlay') hideProfilePanel();
    });
    
    const nameInput = document.getElementById('profileName');
    nameInput.addEventListener('input', () => {
        profileState.tempName = nameInput.value.trim();
        checkForChanges();
    });
    
    const uploadInput = document.getElementById('avatarUpload');
    uploadInput.addEventListener('change', handleAvatarUpload);
    
    document.getElementById('saveProfile').addEventListener('click', saveProfile);
    
    profileState.tempName = userData?.nama || '';
    checkForChanges();
}

function populateAvatarOptions() {
    const container = document.getElementById('avatarOptions');
    if (!container) return;
    
    container.innerHTML = '';
    
    DEFAULT_AVATARS.forEach(avatar => {
        const option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.id = avatar.id;
        
        if (avatar.id === 'github') {
            const githubUrl = generateGitHubAvatar(currentUser.email);
            option.innerHTML = `
                <img src="${githubUrl}" 
                     alt="${avatar.name}"
                     onerror="this.parentElement.innerHTML='<div class="option-label">${avatar.name}</div>'">
            `;
        } else {
            option.innerHTML = `<img src="${avatar.url}" alt="${avatar.name}">`;
        }
        
        if (userData?.foto_profil) {
            const currentUrl = userData.foto_profil;
            if (avatar.id === 'github' && currentUrl.includes('github.com/identicons/')) {
                option.classList.add('selected');
                profileState.selectedAvatar = 'github';
            } else if (currentUrl === avatar.url) {
                option.classList.add('selected');
                profileState.selectedAvatar = avatar.id;
            }
        }
        
        option.addEventListener('click', () => selectAvatar(avatar.id));
        container.appendChild(option);
    });
}

function selectAvatar(avatarId) {
    profileState.selectedAvatar = avatarId;
    profileState.customAvatar = null;
    
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.id === avatarId) {
            opt.classList.add('selected');
        }
    });
    
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    previewContainer.classList.remove('active');
    previewImage.src = '';
    
    checkForChanges();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showStatus('Hanya file gambar yang diperbolehkan', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showStatus('Ukuran gambar maksimal 2MB', 'error');
        return;
    }
    
    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileState.customAvatar = e.target.result;
            profileState.selectedAvatar = 'custom';
            
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            const previewContainer = document.getElementById('previewContainer');
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            previewContainer.classList.add('active');
            
            checkForChanges();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        showStatus('Gagal membaca file', 'error');
        console.error('Upload error:', error);
    }
}

function checkForChanges() {
    const nameChanged = profileState.tempName !== (userData?.nama || '');
    
    let avatarChanged = false;
    if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {
        avatarChanged = profileState.customAvatar !== userData?.foto_profil;
    } else if (profileState.selectedAvatar === 'github') {
        const githubUrl = generateGitHubAvatar(currentUser.email);
        avatarChanged = githubUrl !== userData?.foto_profil;
    } else if (profileState.selectedAvatar) {
        const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);
        avatarChanged = selected?.url !== userData?.foto_profil;
    }
    
    profileState.hasChanges = nameChanged || avatarChanged;
    
    const saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
        saveBtn.disabled = !profileState.hasChanges || profileState.isLoading;
    }
}

function showProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');
    
    if (!overlay || !panel) {
        createProfilePanel();
        setTimeout(() => {
            document.getElementById('profileOverlay').classList.add('active');
            document.getElementById('profilePanel').classList.add('active');
        }, 10);
    } else {
        overlay.classList.add('active');
        setTimeout(() => panel.classList.add('active'), 10);
    }
    
    const nameInput = document.getElementById('profileName');
    if (nameInput) {
        nameInput.value = userData?.nama || '';
        profileState.tempName = userData?.nama || '';
    }
    
    showStatus('', '');
    checkForChanges();
}

function hideProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');
    
    if (panel) panel.classList.remove('active');
    if (overlay) {
        setTimeout(() => {
            overlay.classList.remove('active');
            const uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) uploadInput.value = '';
        }, 300);
    }
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'status-message';
    
    if (type === 'success') {
        statusEl.classList.add('status-success');
        statusEl.style.display = 'block';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    } else if (type === 'error') {
        statusEl.classList.add('status-error');
        statusEl.style.display = 'block';
    } else {
        statusEl.style.display = 'none';
    }
}

async function saveProfile() {
    if (profileState.isLoading || !profileState.hasChanges) return;
    
    try {
        profileState.isLoading = true;
        updateSaveButtonState();
        
        const updates = {};
        
        if (profileState.tempName && profileState.tempName !== userData?.nama) {
            updates.nama = profileState.tempName.trim();
        }
        
        let newAvatarUrl = userData?.foto_profil;
        
        if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {
            newAvatarUrl = profileState.customAvatar;
        } else if (profileState.selectedAvatar === 'github') {
            newAvatarUrl = generateGitHubAvatar(currentUser.email);
        } else if (profileState.selectedAvatar) {
            const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);
            newAvatarUrl = selected?.url;
        }
        
        if (newAvatarUrl && newAvatarUrl !== userData?.foto_profil) {
            updates.foto_profil = newAvatarUrl;
        }
        
        const willBeComplete = checkProfileCompleteness({
            ...userData,
            ...updates
        });
        
        updates.profilLengkap = willBeComplete;
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        await firebaseDb.collection('users').doc(currentUser.uid).update(updates);
        
        userData = { ...userData, ...updates };
        profileState.isProfileComplete = willBeComplete;
        profileState.hasChanges = false;
        
        updateProfileButton();
        showStatus('Profil berhasil diperbarui!', 'success');
        
        const currentAvatar = document.querySelector('.current-avatar');
        const currentName = document.querySelector('.current-name');
        
        if (currentAvatar && updates.foto_profil) {
            currentAvatar.src = updates.foto_profil;
        }
        if (currentName && updates.nama) {
            currentName.textContent = updates.nama;
        }
        
        if (willBeComplete && !userData.profilLengkap) {
            setTimeout(() => {
                hideProfilePanel();
            }, 1500);
        }
        
    } catch (error) {
        console.error('Save profile error:', error);
        showStatus('Gagal menyimpan perubahan: ' + error.message, 'error');
    } finally {
        profileState.isLoading = false;
        updateSaveButtonState();
    }
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveProfile');
    const saveText = document.getElementById('saveText');
    const saveLoading = document.getElementById('saveLoading');
    
    if (!saveBtn) return;
    
    saveBtn.disabled = !profileState.hasChanges || profileState.isLoading;
    
    if (profileState.isLoading) {
        saveText.style.display = 'none';
        saveLoading.classList.add('active');
    } else {
        saveText.style.display = 'inline';
        saveLoading.classList.remove('active');
    }
}

// =======================
// CSS Injection
// =======================
function injectByteWardCSS() {
    if (!document.querySelector('link[href*="byteward-loading.css"]')) {
        const loadingLink = document.createElement('link');
        loadingLink.rel = 'stylesheet';
        loadingLink.href = `${getBasePath()}/assets/css/byteward-loading.css`;
        loadingLink.id = 'byteward-loading-css';
        document.head.appendChild(loadingLink);
    }
    
    if (!document.querySelector('link[href*="byteward-profile.css"]')) {
        const profileLink = document.createElement('link');
        profileLink.rel = 'stylesheet';
        profileLink.href = `${getBasePath()}/assets/css/byteward-profile.css`;
        profileLink.id = 'byteward-profile-css';
        document.head.appendChild(profileLink);
    }
}

// =======================
// User Data Management
// =======================
async function fetchUserData(userId) {
    console.log('📡 Mengambil data user dari Firestore...');
    
    if (profileListener) {
        profileListener();
    }
    
    const ref = firebaseDb.collection('users').doc(userId);
    
    return new Promise((resolve, reject) => {
        profileListener = ref.onSnapshot(async (snap) => {
            try {
                if (snap.exists) {
                    userData = snap.data();
                    userRole = resolveUserRole(userData.peran);
                    
                    profileState.isProfileComplete = checkProfileCompleteness(userData);
                    
                    console.log('✅ Data user diperbarui:', { 
                        role: userRole, 
                        name: userData.nama,
                        profileComplete: profileState.isProfileComplete 
                    });
                    
                    resolve(userData);
                    
                    if (currentUser) {
                        updateProfileButton();
                        
                        if (document.getElementById('profilePanel')) {
                            const currentAvatar = document.querySelector('.current-avatar');
                            const currentName = document.querySelector('.current-name');
                            
                            if (currentAvatar) {
                                currentAvatar.src = userData.foto_profil || generateGitHubAvatar(currentUser.email);
                            }
                            if (currentName) {
                                currentName.textContent = userData.nama || 'Nama belum diisi';
                            }
                        }
                    }
                    
                } else {
                    console.log('📝 Data user belum ada, membuat data baru...');
                    await createUserData(userId);
                }
            } catch (error) {
                console.error('Error in user data listener:', error);
                reject(error);
            }
        }, (error) => {
            console.error('Firestore listener error:', error);
            reject(error);
        });
    });
}

async function createUserData(userId) {
    const user = firebaseAuth.currentUser;
    
    const payload = {
        id: userId,
        nama: user.displayName || '',
        email: user.email,
        foto_profil: generateGitHubAvatar(user.email),
        peran: 'siswa',
        profilLengkap: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await firebaseDb.collection('users').doc(userId).set(payload);
    console.log('✅ Data user baru berhasil dibuat');
    return payload;
}

// =======================
// Authentication
// =======================
async function authLogin() {
    try {
        console.log('🔐 Memulai login Google...');
        showAuthLoading('Membuka Google Login…');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await firebaseAuth.signInWithPopup(provider);
        
        console.log('✅ Login sukses:', result.user.email);
        showAuthLoading('Login berhasil, menyiapkan sistem…');
        
        return result.user;
    } catch (error) {
        console.error('❌ Error login:', error);
        hideAuthLoading();
        throw new Error(error.message || 'Login Google gagal');
    }
}

async function authLogout() {
    try {
        showAuthLoading('Logout…');
        
        if (profileListener) {
            profileListener();
            profileListener = null;
        }
        
        await firebaseAuth.signOut();
        console.log('✅ Logout berhasil');
        
        const profileContainer = document.querySelector('.profile-button-container');
        if (profileContainer) profileContainer.remove();
        
        const profilePanel = document.getElementById('profileOverlay');
        if (profilePanel) profilePanel.remove();
        
        window.location.href = `${getBasePath()}/login.html`;
    } catch (error) {
        console.error('❌ Error logout:', error);
        showError('Gagal logout.');
    }
}

// =======================
// RQB ACCESS CONTROL SYSTEM
// =======================
const ROLE_PERMISSIONS = {
    siswa: [
        '/siswa',
        '/ujian'
    ]
    // ❌ Admin dihapus - menjadi superuser via logic
};

const LOGIN_PAGE = '/login';

function getNormalizedPath() {
    let path = window.location.pathname;

    // Normalisasi path tanpa campur HTML
    if (path.endsWith('/')) path = path.slice(0, -1);
    if (path.endsWith('/index.html')) path = path.replace('/index.html', '');
    if (path.endsWith('.html')) path = path.replace('.html', '');

    return path || '/';
}

function isPathAllowed(path, role) {
    // Login & public pages - diizinkan untuk semua
    if (path === '/' || path === '/login') {
        return true;
    }

    // ADMIN = SUPERUSER (full access)
    if (role === 'admin') {
        return true;
    }

    // SISWA = STRICT (hanya path yang diizinkan)
    const allowedPaths = ROLE_PERMISSIONS.siswa;

    return allowedPaths.some(
        p => path === p || path.startsWith(p + '/')
    );
}

function showHardBlockPage() {
    document.documentElement.innerHTML = '';
    
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Akses Ditolak - ByteWard</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: system-ui, -apple-system, sans-serif;
                background: #111;
                color: #fff;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 20px;
            }
            
            .error-code {
                font-size: 120px;
                font-weight: bold;
                color: #ef4444;
                margin-bottom: 20px;
                line-height: 1;
            }
            
            .message {
                font-size: 28px;
                line-height: 1.4;
                margin-bottom: 40px;
                text-transform: uppercase;
                max-width: 600px;
            }
            
            .footer {
                font-size: 18px;
                color: #9ca3af;
                margin-top: 40px;
            }
        </style>
    </head>
    <body>
        <div class="error-code">444</div>
        <div class="message">
            MAAF KAMU TIDAK MEMPUNYAI AKSES<br>
            UNTUK MASUK KE HALAMAN INI
        </div>
        <div class="footer">ByteWard</div>
    </body>
    </html>
    `;
    
    document.open();
    document.write(html);
    document.close();
    
    window.stop();
    
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
    
    console.error('⛔ HARD BLOCK: Akses ditolak untuk role', userRole, 'ke path', getNormalizedPath());
}

async function checkPageAccess() {
    const currentPath = getNormalizedPath();
    console.log(`🔒 Mengecek akses: ${currentPath} | Role: ${userRole}`);
    
    if (!currentUser) {
        // Non-authenticated user hanya boleh akses login page
        if (currentPath === LOGIN_PAGE || currentPath === '/') {
            console.log('✅ Akses diizinkan (non-authenticated)');
            return true;
        }
        console.log('⛔ Non-authenticated user mencoba akses terlarang');
        showHardBlockPage();
        return false;
    }
    
    if (!isPathAllowed(currentPath, userRole)) {
        console.warn('⛔ Akses ditolak untuk role:', userRole, 'ke path:', currentPath);
        showHardBlockPage();
        return false;
    }
    
    console.log('✅ Akses diizinkan untuk role:', userRole);
    return true;
}

// =======================
// System Initialization v0.1.7 RQB
// =======================
async function initializeSystem() {
    console.log('⚙️ Menginisialisasi ByteWard v0.1.7 RQB...');
    console.log('📍 Base Path:', getBasePath());
    console.log('📍 Current Path:', window.location.pathname);
    console.log('📍 Normalized Path:', getNormalizedPath());
    console.log('📍 Is Login Page:', isLoginPage());
    
    showAuthLoading('Mengecek status autentikasi…');
    
    injectByteWardCSS();
    
    firebaseAuth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                console.log('👤 User terautentikasi:', user.email);
                currentUser = user;
                
                showAuthLoading('Mengambil data pengguna…');
                
                await fetchUserData(user.uid);
                
                const accessGranted = await checkPageAccess();
                if (!accessGranted) return;
                
                if (isLoginPage()) {
                    if (handleLoginPageGuard()) {
                        return;
                    }
                }
                
                createProfileButton();
                authReady = true;
                hideAuthLoading();
                
            } else {
                console.log('👤 User belum login');
                currentUser = null;
                userRole = null;
                userData = null;
                authReady = true;
                hideAuthLoading();
                
                await checkPageAccess();
            }
        } catch (err) {
            console.error('❌ Auth flow error:', err);
            hideAuthLoading();
            showError('Terjadi kesalahan sistem autentikasi');
        }
    });
}

// =======================
// Error Handling
// =======================
function showError(message) {
    let el = document.getElementById('systemError');
    
    if (!el) {
        el = document.createElement('div');
        el.id = 'systemError';
        el.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            z-index: 10000;
            max-width: 420px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            font-family: system-ui, -apple-system, sans-serif;
        `;
        document.body.appendChild(el);
    }
    
    el.textContent = `ByteWard Error: ${message}`;
    el.style.display = 'block';
    
    setTimeout(() => (el.style.display = 'none'), 5000);
}

// =======================
// Debug & Testing
// =======================
window.debugByteWard = function() {
    console.log('=== ByteWard Debug Info v0.1.7 RQB ===');
    console.log('Version: 0.1.7 RQB');
    console.log('Current User:', currentUser);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', profileState.isProfileComplete);
    console.log('Base Path:', getBasePath());
    console.log('Normalized Path:', getNormalizedPath());
    console.log('Is Login Page:', isLoginPage());
    console.log('Current Path:', window.location.pathname);
    console.log('Role Permissions:', ROLE_PERMISSIONS);
    console.log('==========================');
};

// =======================
// Bootstrap System
// =======================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('❌ Firebase belum siap');
            showError('Firebase tidak tersedia');
            return;
        }
        
        initializeSystem();
    }, 300);
});

// =======================
// Global Exports
// =======================
window.authLogin = authLogin;
window.authLogout = authLogout;
window.checkPageAccess = checkPageAccess;
window.showProfilePanel = showProfilePanel;
window.debugByteWard = debugByteWard;

console.log('🛡️ ByteWard v0.1.7 RQB AKTIF. Sistem dengan ROLE HIERARCHY: Admin = Superuser, Siswa = Strict');
