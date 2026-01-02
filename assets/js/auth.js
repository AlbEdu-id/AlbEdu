// ByteWard Auth Module v0.5.7 - Event-Driven dengan Base Path Fix
console.log('🔐 Memuat Auth Module v0.5.7 - Event-Driven dengan Redirect Logic Fix');

let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let isSystemInitialized = false;
let authStateChangeTimeout = null;

// ============================================
// CONFIGURATION - BASE PATH SUPPORT
// ============================================
const APP_CONFIG = {
    BASE_PATH: '/AlbEdu/',
    LOGIN_PAGE: 'login.html',
    getLoginUrl: function() {
        return this.BASE_PATH + this.LOGIN_PAGE;
    }
};

// ============================================
// KONTRAK AUTH ⇄ UI v0.5.7
// ============================================
// Auth HANYA berkomunikasi ke UI melalui:
// 1. UI.afterLogin()    - Saat login/session restore berhasil
// 2. UI.afterLogout()   - Saat logout/unauthorized
// 3. UI.hideAuthLoading() - SELALU dipanggil di finally
// ============================================

function generateDefaultAvatar(seed) {
    const defaultSeed = seed || 'user' + Date.now();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
}

function checkProfileCompleteness(data) {
    if (!data) return false;
    const hasName = data.nama && typeof data.nama === 'string' && data.nama.trim().length > 0;
    const hasAvatar = data.foto_profil && typeof data.foto_profil === 'string' && data.foto_profil.trim().length > 0;
    return hasName && hasAvatar;
}

// ============================================
// PATH HELPER FUNCTIONS
// ============================================
function redirectToLogin() {
    console.log('🔀 Redirect ke login page:', APP_CONFIG.getLoginUrl());
    window.location.href = APP_CONFIG.getLoginUrl();
}

function isLoginPage() {
    const currentPath = window.location.pathname;
    return currentPath.endsWith(APP_CONFIG.LOGIN_PAGE) || 
           currentPath.includes(APP_CONFIG.LOGIN_PAGE);
}

function isWithinAppScope() {
    const currentPath = window.location.pathname;
    return currentPath.includes(APP_CONFIG.BASE_PATH) &&
           !currentPath.includes(APP_CONFIG.LOGIN_PAGE) &&
           !currentPath.includes('404');
}

// ============================================
// EVENT-DRIVEN USER DATA FETCH
// ============================================
async function fetchUserData(userId) {
    console.log('📡 Mengambil data user dari Firestore...');

    return new Promise((resolve, reject) => {
        if (profileListener) {
            profileListener();
            profileListener = null;
        }

        const ref = firebaseDb.collection('users').doc(userId);
        let resolved = false;

        const fetchTimeout = setTimeout(() => {
            if (!resolved) {
                console.warn('⚠️ Fetch user data timeout, menggunakan data default');
                profileListener?.();
                profileListener = null;
                
                const defaultData = {
                    id: userId,
                    nama: currentUser?.displayName || '',
                    email: currentUser?.email || '',
                    foto_profil: generateDefaultAvatar(currentUser?.email || userId),
                    peran: 'siswa',
                    profilLengkap: false
                };
                
                userData = defaultData;
                userRole = 'siswa';
                userProfileState = {
                    isProfileComplete: false,
                    isLoading: false,
                    hasChanges: false
                };
                
                resolved = true;
                resolve(defaultData);
            }
        }, 8000);

        profileListener = ref.onSnapshot(async (snap) => {
            try {
                clearTimeout(fetchTimeout);
                
                if (snap.exists) {
                    const data = snap.data();
                    
                    if (!data.nama) data.nama = '';
                    if (!data.foto_profil) {
                        data.foto_profil = generateDefaultAvatar(data.email || userId);
                    }
                    if (!data.peran) data.peran = 'siswa';
                    
                    userData = data;
                    userRole = data.peran || 'siswa';

                    if (!userProfileState) {
                        userProfileState = {
                            isProfileComplete: false,
                            isLoading: false,
                            hasChanges: false
                        };
                    }
                    
                    userProfileState.isProfileComplete = checkProfileCompleteness(data);

                    if (!resolved) {
                        resolved = true;
                        resolve(data);
                    }

                } else {
                    console.log('📝 Data user belum ada, membuat data baru...');
                    const newData = await createUserData(userId);
                    if (!resolved) {
                        resolved = true;
                        resolve(newData);
                    }
                }
            } catch (error) {
                clearTimeout(fetchTimeout);
                console.error('Error in user data listener:', error);
                if (!resolved) reject(error);
            }
        }, (error) => {
            clearTimeout(fetchTimeout);
            console.error('Firestore listener error:', error);
            if (!resolved) reject(error);
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
    return payload;
}

// ============================================
// AUTH ACTIONS - UI-SAFE
// ============================================
async function authLogin() {
    try {
        console.log('🔐 Memulai login Google...');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await firebaseAuth.signInWithPopup(provider);
        console.log('✅ Login sukses:', result.user.email);
        
        return result.user;
    } catch (error) {
        console.error('❌ Error login:', error);
        
        let errorMsg = error.message;
        if (error.code === 'auth/popup-closed-by-user') {
            errorMsg = 'Login dibatalkan oleh pengguna.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMsg = 'Popup login diblokir oleh browser. Silakan izinkan popup.';
        }

        throw new Error(errorMsg);
    }
}

async function authLogout() {
    try {
        console.log('🚪 Memulai logout...');
        
        if (profileListener) {
            profileListener();
            profileListener = null;
        }

        await firebaseAuth.signOut();
        console.log('✅ Logout berhasil');
        
    } catch (error) {
        console.error('❌ Error logout:', error);
        throw new Error('Gagal logout: ' + error.message);
    }
}

// ============================================
// EVENT-DRIVEN AUTH STATE MANAGEMENT
// ============================================
async function handleAuthStateChange(user) {
    try {
        if (authStateChangeTimeout) {
            clearTimeout(authStateChangeTimeout);
            authStateChangeTimeout = null;
        }
        
        // Safety timeout
        authStateChangeTimeout = setTimeout(() => {
            console.warn('⚠️ Auth state change timeout - forcing resolution');
            authReady = true;
            if (window.UI && window.UI.hideAuthLoading) {
                window.UI.hideAuthLoading();
            }
        }, 10000);

        if (user) {
            console.log('👤 User terautentikasi:', user.email);
            currentUser = user;
            
            try {
                await fetchUserData(user.uid);
                authReady = true;
                
                // User sudah login, jika di login page redirect ke app
                if (isLoginPage()) {
                    console.log('📍 User sudah login, redirect dari login page...');
                    // Redirect ke base path (AlbEdu/)
                    setTimeout(() => {
                        window.location.href = APP_CONFIG.BASE_PATH;
                    }, 100);
                    return; // Stop execution
                }
                
                // User di app page, panggil UI
                if (window.UI && window.UI.afterLogin) {
                    window.UI.afterLogin();
                }
                
            } catch (fetchError) {
                console.error('❌ Gagal fetch user data:', fetchError);
                authReady = true;
                
                if (window.UI && window.UI.hideAuthLoading) {
                    window.UI.hideAuthLoading();
                }
                return;
            }
            
        } else {
            console.log('👤 User belum login');
            currentUser = null;
            userRole = null;
            userData = null;
            userProfileState = null;
            authReady = true;
            
            // User logout, jika di app page redirect ke login
            if (isWithinAppScope() && !isLoginPage()) {
                console.log('📍 User logout, redirect ke login page...');
                setTimeout(() => {
                    redirectToLogin();
                }, 300);
                return; // Stop execution
            }
            
            // User sudah di login page atau non-app page
            if (window.UI && window.UI.afterLogout) {
                window.UI.afterLogout();
            }
        }
        
    } catch (err) {
        console.error('❌ Auth flow error:', {
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        
        authReady = true;
        
    } finally {
        if (authStateChangeTimeout) {
            clearTimeout(authStateChangeTimeout);
            authStateChangeTimeout = null;
        }
        
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
    }
}

// ============================================
// INITIALIZATION - EVENT-DRIVEN
// ============================================
async function initializeSystem() {
    if (isSystemInitialized) {
        console.log('⚠️ Auth System sudah diinisialisasi.');
        return;
    }
    isSystemInitialized = true;

    console.log('⚙️ Menginisialisasi ByteWard Auth v0.5.7...');
    console.log('📁 Base Path:', APP_CONFIG.BASE_PATH);

    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
        return;
    }

    try {
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
        console.log('✅ Auth observer berjalan');
        
    } catch (initError) {
        console.error('❌ Gagal inisialisasi auth:', initError);
        authReady = true;
        
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
    }
}

function debugByteWard() {
    console.log('=== ByteWard Debug Info v0.5.7 ===');
    console.log('Base Path:', APP_CONFIG.BASE_PATH);
    console.log('Current Path:', window.location.pathname);
    console.log('Is Login Page:', isLoginPage());
    console.log('Is Within App:', isWithinAppScope());
    console.log('Current User:', currentUser?.email);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', userProfileState?.isProfileComplete);
    console.log('Auth Ready:', authReady);
    console.log('==========================');
}

// ============================================
// PUBLIC API - BACKWARD COMPATIBLE
// ============================================
window.Auth = {
    // Core Functions
    authLogin,
    authLogout,
    fetchUserData,
    createUserData,
    initializeSystem,
    debugByteWard,
    
    // Helper Functions
    checkProfileCompleteness,
    generateDefaultAvatar,
    
    // Path Functions
    redirectToLogin,
    isLoginPage,
    getBasePath: () => APP_CONFIG.BASE_PATH,
    
    // UI Event Handler
    setUserData: function(data) {
        userData = data;
        if (userProfileState) {
            userProfileState.isProfileComplete = checkProfileCompleteness(data);
        }
    }
};

Object.defineProperties(window.Auth, {
    currentUser: { 
        get: () => currentUser, 
        set: (value) => { 
            console.warn('⚠️ currentUser should only be set by Firebase auth state observer');
            currentUser = value; 
        } 
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
    }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('❌ Firebase belum siap');
            if (window.UI && window.UI.hideAuthLoading) {
                window.UI.hideAuthLoading();
            }
            return;
        }
        initializeSystem();
    }, 300);
});

console.log('🔐 Auth Module v0.5.7 - Event-Driven dengan Base Path Fix');
