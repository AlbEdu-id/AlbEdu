// ByteWard Auth Module v0.3.0 - Terintegrasi dengan HyperOS Notifications
console.log('🔐 Memuat Auth Module v0.3.0...');

// Global State
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let redirectInProgress = false;

// Fungsi untuk menampilkan notifikasi dengan fallback
function showNotification(type, title, message, duration) {
    // Priority 1: HyperOS Notification System
    if (window.HyperOS && window.HyperOS.Notifications) {
        return window.HyperOS.Notifications[type](title, message, duration);
    }
    
    // Priority 2: window.notify shortcut
    if (window.notify && window.notify[type]) {
        return window.notify[type](title, message, duration);
    }
    
    // Priority 3: Legacy notification system (if exists)
    if (window.UI && window.UI.Notification) {
        const types = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        if (window.UI.Notification[type]) {
            return window.UI.Notification[type](title, message, duration);
        }
    }
    
    // Fallback: console log
    console[type === 'error' ? 'error' : 'log'](`${title}: ${message}`);
    return null;
}

// Fungsi global untuk generate avatar default (DiceBear)
function generateDefaultAvatar(seed) {
    const defaultSeed = seed || 'user' + Date.now();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
}

// Avatar constants
const PROFILE_AVATARS = [
    {
        id: 'male1',
        name: 'Male Avatar 1',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=5b6af0&radius=50',
        color: '#5b6af0'
    },
    {
        id: 'female1',
        name: 'Female Avatar 1',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=9d4edd&radius=50',
        color: '#9d4edd'
    },
    {
        id: 'robot',
        name: 'Robot',
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=10b981&radius=50',
        color: '#10b981'
    },
    {
        id: 'cat',
        name: 'Cat',
        url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=f59e0b&radius=50',
        color: '#f59e0b'
    },
    {
        id: 'alien',
        name: 'Alien',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alien&backgroundColor=8b5cf6&radius=50',
        color: '#8b5cf6'
    },
    {
        id: 'person1',
        name: 'Person 1',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person1&backgroundColor=ef4444&radius=50',
        color: '#ef4444'
    },
    {
        id: 'person2',
        name: 'Person 2',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person2&backgroundColor=14b8a6&radius=50',
        color: '#14b8a6'
    },
    {
        id: 'person3',
        name: 'Person 3',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person3&backgroundColor=8b5cf6&radius=50',
        color: '#8b5cf6'
    }
];

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
// User Data Management
// =======================
async function fetchUserData(userId) {
    console.log('📡 Mengambil data user dari Firestore...');

    return new Promise((resolve, reject) => {
        if (profileListener) {
            profileListener();
            profileListener = null;
        }

        const ref = firebaseDb.collection('users').doc(userId);
        let resolved = false;

        profileListener = ref.onSnapshot(async (snap) => {
            try {
                if (snap.exists) {
                    userData = snap.data();
                    userRole = userData.peran || 'siswa';

                    if (!userProfileState) {
                        userProfileState = {
                            isProfileComplete: false,
                            selectedAvatar: null,
                            customAvatar: null,
                            tempName: '',
                            isLoading: false,
                            hasChanges: false,
                            autoCloseTriggered: false
                        };
                    }

                    userProfileState.isProfileComplete = checkProfileCompleteness(userData);

                    console.log('✅ Data user diperbarui:', {
                        role: userRole,
                        name: userData.nama,
                        profileComplete: userProfileState.isProfileComplete
                    });

                    if (!resolved) {
                        resolved = true;
                        resolve(userData);
                    }

                    if (currentUser && window.UI) {
                        window.UI.updateProfileButton();

                        if (document.getElementById('profilePanel')) {
                            const currentAvatar = document.querySelector('.current-avatar');
                            const currentName = document.querySelector('.current-name');

                            if (currentAvatar) {
                                currentAvatar.src = userData.foto_profil || generateDefaultAvatar(currentUser.email);
                                currentAvatar.onerror = function() {
                                    this.src = generateDefaultAvatar(currentUser.email);
                                };
                            }
                            if (currentName) {
                                currentName.textContent = userData.nama || 'Nama belum diisi';
                            }
                        }
                    }

                } else {
                    console.log('📝 Data user belum ada, membuat data baru...');
                    showNotification('info', 'Info', 'Membuat profil baru...', 3000);
                    const newData = await createUserData(userId);
                    if (!resolved) {
                        resolved = true;
                        resolve(newData);
                    }
                }
            } catch (error) {
                console.error('Error in user data listener:', error);
                showNotification('error', 'Kesalahan Data', 'Gagal memuat data pengguna', 5000);
                if (!resolved) {
                    reject(error);
                }
            }
        }, (error) => {
            console.error('Firestore listener error:', error);
            showNotification('error', 'Koneksi Gagal', 'Gagal terhubung ke database', 5000);
            if (!resolved) {
                reject(error);
            }
        });
    });
}

async function createUserData(userId) {
    const user = firebaseAuth.currentUser;
    const avatarSeed = user.email || user.uid || 'user' + Date.now();

    const payload = {
        id: userId,
        nama: user.displayName || '',
        email: user.email,
        foto_profil: generateDefaultAvatar(avatarSeed),
        peran: 'siswa',
        profilLengkap: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebaseDb.collection('users').doc(userId).set(payload);
    showNotification('success', 'Profil Baru', 'Profil berhasil dibuat', 4000);
    console.log('✅ Data user baru berhasil dibuat');
    return payload;
}

// =======================
// Authentication Functions
// =======================
async function authLogin() {
    try {
        console.log('🔐 Memulai login Google...');
        if (window.UI) window.UI.showAuthLoading('Membuka Google Login…');

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await firebaseAuth.signInWithPopup(provider);

        console.log('✅ Login sukses:', result.user.email);
        showNotification('success', 'Login Berhasil', `Selamat datang, ${result.user.displayName || result.user.email}`, 4000);
        
        if (window.UI) window.UI.showAuthLoading('Login berhasil, menyiapkan sistem…');

        return result.user;
    } catch (error) {
        console.error('❌ Error login:', error);
        showNotification('error', 'Login Gagal', error.message || 'Terjadi kesalahan saat login', 5000);
        if (window.UI) window.UI.hideAuthLoading();
        throw new Error(error.message || 'Login Google gagal');
    }
}

async function authLogout() {
    try {
        if (window.UI) window.UI.showAuthLoading('Logout…');

        if (profileListener) {
            profileListener();
            profileListener = null;
        }

        await firebaseAuth.signOut();
        console.log('✅ Logout berhasil');
        showNotification('info', 'Logout Berhasil', 'Anda telah keluar dari sistem', 3000);

        const profileContainer = document.querySelector('.profile-button-container');
        if (profileContainer) profileContainer.remove();

        const profilePanel = document.getElementById('profileOverlay');
        if (profilePanel) profilePanel.remove();

        currentUser = null;
        userRole = null;
        userData = null;
        authReady = false;
        userProfileState = null;

        if (window.ByteWard) window.ByteWard.redirectAfterLogout();
    } catch (error) {
        console.error('❌ Error logout:', error);
        showNotification('error', 'Logout Gagal', 'Gagal melakukan logout', 5000);
        if (window.UI) window.UI.showError('Gagal logout.');
    }
}

// =======================
// System Initialization
// =======================
async function initializeSystem() {
    console.log('⚙️ Menginisialisasi ByteWard v0.3.0...');
    console.log('📍 Konfigurasi:', window.ByteWard ? window.ByteWard.APP_CONFIG : 'N/A');
    console.log('📍 Base Path:', window.ByteWard ? window.ByteWard.getBasePath() : 'N/A');
    console.log('📍 Current Path:', window.location.pathname);
    console.log('📍 Is Login Page:', window.ByteWard ? window.ByteWard.isLoginPage() : 'N/A');
    console.log('📍 Within App Scope:', window.ByteWard ? window.ByteWard.isWithinAppScope() : 'N/A');

    // Check for HyperOS Notifications
    if (window.HyperOS && window.HyperOS.Notifications) {
        console.log('✅ HyperOS Notification System terdeteksi');
    } else if (window.notify) {
        console.log('✅ window.notify shortcut terdeteksi');
    } else {
        console.warn('⚠️ Notification system tidak ditemukan, menggunakan console fallback');
    }

    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        showNotification('error', 'Firebase Error', 'Firebase belum dimuat. Silakan refresh halaman.', 5000);
        if (window.UI) window.UI.hideAuthLoading();
        return;
    }

    if (window.location.pathname.includes('404') || document.title.includes('404')) {
        console.log('🔧 Deteksi halaman 404, memanggil handler...');
        if (window.ByteWard) window.ByteWard.handle404Page();
    }

    if (window.UI) window.UI.showAuthLoading('Mengecek status autentikasi…');
    if (window.UI) window.UI.injectProfileCSS();

    firebaseAuth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                console.log('👤 User terautentikasi:', user.email);
                currentUser = user;

                if (window.UI) window.UI.showAuthLoading('Mengambil data pengguna…');
                await fetchUserData(user.uid);

                if (window.UI) window.UI.showAuthLoading('Memverifikasi akses halaman…');
                const accessGranted = await (window.ByteWard ? window.ByteWard.checkPageAccess() : Promise.resolve(true));

                if (!(window.ByteWard ? window.ByteWard.isLoginPage() : false) && accessGranted && window.UI) {
                    window.UI.createProfileButton();
                }

                authReady = true;
                if (window.UI) window.UI.hideAuthLoading();

            } else {
                console.log('👤 User belum login');
                currentUser = null;
                userRole = null;
                userData = null;
                userProfileState = null;
                authReady = true;
                if (window.UI) window.UI.hideAuthLoading();

                if (!(window.ByteWard ? window.ByteWard.isLoginPage() : false) && (window.ByteWard ? window.ByteWard.isWithinAppScope() : true)) {
                    if (window.ByteWard) window.ByteWard.redirectToLogin();
                }
            }
        } catch (err) {
            console.error('❌ Auth flow error DETAIL:', {
                message: err.message,
                code: err.code,
                stack: err.stack
            });

            if (window.UI) window.UI.hideAuthLoading();

            let errorMsg = 'Terjadi kesalahan sistem autentikasi';
            if (err.message) errorMsg += ': ' + err.message;
            if (err.code) errorMsg += ' (Code: ' + err.code + ')';

            showNotification('error', 'Auth Error', errorMsg, 5000);
        } finally {
            if (window.UI) window.UI.hideAuthLoading();
        }
    });

    console.log('✅ Auth observer berjalan');
}

// =======================
// Debug & Testing
// =======================
function debugByteWard() {
    console.log('=== ByteWard Debug Info v0.3.0 ===');
    console.log('Configuration:', window.ByteWard ? window.ByteWard.APP_CONFIG : 'N/A');
    console.log('Base Path Function:', window.ByteWard ? window.ByteWard.getBasePath() : 'N/A');
    console.log('Full Login Path:', window.ByteWard ? window.ByteWard.buildFullPath(window.ByteWard.APP_CONFIG.REDIRECT_PATHS.login) : 'N/A');
    console.log('Current User:', currentUser);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', userProfileState?.isProfileComplete);
    console.log('Current Path:', window.location.pathname);
    console.log('Is Login Page:', window.ByteWard ? window.ByteWard.isLoginPage() : 'N/A');
    console.log('Within App Scope:', window.ByteWard ? window.ByteWard.isWithinAppScope() : 'N/A');
    console.log('Auth Ready:', authReady);
    console.log('Redirect in Progress:', redirectInProgress);
    console.log('Notification System:', window.HyperOS ? 'HyperOS' : window.notify ? 'Notify Shortcut' : 'None');
    console.log('==========================');
}

// =======================
// Bootstrap System
// =======================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('❌ Firebase belum siap');
            showNotification('error', 'Firebase Error', 'Firebase tidak tersedia', 5000);
            return;
        }

        initializeSystem();
    }, 300);
});

// =======================
// Global Exports
// =======================
window.Auth = {
    authLogin,
    authLogout,
    fetchUserData,
    createUserData,
    initializeSystem,
    debugByteWard,
    checkProfileCompleteness,
    generateDefaultAvatar,
    PROFILE_AVATARS,
    showNotification // Ekspos fungsi notifikasi
};

// Property-based state access
Object.defineProperties(window.Auth, {
    currentUser: {
        get: () => currentUser,
        set: (value) => { currentUser = value; }
    },
    userRole: {
        get: () => userRole,
        set: (value) => { userRole = value; }
    },
    userData: {
        get: () => userData,
        set: (value) => { userData = value; }
    },
    profileState: {
        get: () => userProfileState,
        set: (value) => { userProfileState = value; }
    },
    authReady: {
        get: () => authReady,
        set: (value) => { authReady = value; }
    },
    redirectInProgress: {
        get: () => redirectInProgress,
        set: (value) => { redirectInProgress = value; }
    }
});

console.log('🔐 Auth Module v0.3.0 - Authentication siap dengan HyperOS Integration.');
