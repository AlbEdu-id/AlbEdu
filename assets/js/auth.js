// ByteWard Auth Module v0.5.6 - Complete Event-Driven with Smart Redirect
console.log('🔐 Memuat Auth Module v0.5.6 - Event-Driven & Smart Redirect');

// ============================================
// STATE VARIABLES
// ============================================
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let isSystemInitialized = false;
let authStateChangeTimeout = null;

// ============================================
// APP CONFIGURATION
// ============================================
const APP_CONFIG = {
    BASE_PATH: '/AlbEdu/',
    LOGIN_PAGE: 'login.html',
    
    // Role-based redirect paths
    getRoleRedirectPath: function(role) {
        const paths = {
            'siswa': 'ujian/index.html',
            'admin': 'admin/index.html',
            'guru': 'guru/index.html'
        };
        return this.BASE_PATH + (paths[role] || 'ujian/index.html');
    },
    
    getLoginUrl: function() {
        return this.BASE_PATH + this.LOGIN_PAGE;
    }
};

// ============================================
// HELPER FUNCTIONS
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

function isLoginPage() {
    const currentPath = window.location.pathname;
    const loginPath = APP_CONFIG.BASE_PATH + APP_CONFIG.LOGIN_PAGE;
    return currentPath === loginPath || currentPath.endsWith('/' + APP_CONFIG.LOGIN_PAGE);
}

function redirectBasedOnRole(role) {
    const redirectPath = APP_CONFIG.getRoleRedirectPath(role);
    const currentPath = window.location.pathname;
    
    if (currentPath === redirectPath) {
        console.log('✅ Sudah di halaman yang benar, tidak perlu redirect');
        return false;
    }
    
    console.log(`🔀 Redirect berdasarkan peran "${role}": ${redirectPath}`);
    setTimeout(() => {
        window.location.href = redirectPath;
    }, 300);
    return true;
}

function redirectToLogin() {
    const currentPath = window.location.pathname;
    const loginPath = APP_CONFIG.getLoginUrl();
    
    if (currentPath !== loginPath) {
        console.log('🔀 Redirect ke login page:', loginPath);
        window.location.href = loginPath;
    }
}

function isWithinAppScope() {
    const currentPath = window.location.pathname;
    return currentPath.startsWith(APP_CONFIG.BASE_PATH) && 
           !currentPath.includes(APP_CONFIG.LOGIN_PAGE);
}

// ============================================
// CORE AUTH FUNCTIONS
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
// EVENT-DRIVEN AUTH STATE HANDLER
// ============================================
async function handleAuthStateChange(user) {
    try {
        if (authStateChangeTimeout) {
            clearTimeout(authStateChangeTimeout);
            authStateChangeTimeout = null;
        }
        
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
                
                // SMART LOGIC: Hanya redirect jika di login page
                if (isLoginPage()) {
                    console.log('📍 Di login page, redirect berdasarkan peran...');
                    redirectBasedOnRole(userRole);
                    return; // Keluar, tidak panggil UI.afterLogin()
                }
                
                // Jika sudah di dalam app, hanya panggil UI.afterLogin()
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
            
            // SMART LOGIC: Hanya redirect jika di dalam app scope
            if (isWithinAppScope() && !isLoginPage()) {
                console.log('📍 Di dalam app tapi logout, redirect ke login...');
                setTimeout(() => {
                    redirectToLogin();
                }, 500);
                return; // Keluar, tidak panggil UI.afterLogout()
            }
            
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
// SYSTEM INITIALIZATION
// ============================================
async function initializeSystem() {
    if (isSystemInitialized) {
        console.log('⚠️ Auth System sudah diinisialisasi.');
        return;
    }
    isSystemInitialized = true;

    console.log('⚙️ Menginisialisasi ByteWard Auth v0.5.6...');
    console.log('📍 Current path:', window.location.pathname);
    console.log('📍 Is login page:', isLoginPage());
    console.log('📍 Base path:', APP_CONFIG.BASE_PATH);

    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
        return;
    }

    try {
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
        console.log('✅ Auth observer berjalan - Event-Driven Ready');
        
    } catch (initError) {
        console.error('❌ Gagal inisialisasi auth:', initError);
        authReady = true;
        
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
    }
}

function debugByteWard() {
    console.log('=== ByteWard Debug Info v0.5.6 ===');
    console.log('Base Path:', APP_CONFIG.BASE_PATH);
    console.log('Current Path:', window.location.pathname);
    console.log('Is Login Page:', isLoginPage());
    console.log('Is Within App:', isWithinAppScope());
    console.log('Current User:', currentUser?.email);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', userProfileState?.isProfileComplete);
    console.log('Auth Ready:', authReady);
    console.log('Profile Listener Active:', !!profileListener);
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
    isWithinAppScope,
    getBasePath: () => APP_CONFIG.BASE_PATH,
    getRoleRedirectPath: (role) => APP_CONFIG.getRoleRedirectPath(role),
    
    // UI Event Handler
    setUserData: function(data) {
        userData = data;
        if (userProfileState) {
            userProfileState.isProfileComplete = checkProfileCompleteness(data);
        }
    }
};

// Getters/Setters - Backward Compatible
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
    }
});

// ============================================
// AUTO-INITIALIZATION
// ============================================
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

console.log('🔐 Auth Module v0.5.6 - Complete & Ready');
