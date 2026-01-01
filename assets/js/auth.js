// ByteWard Auth Module v0.5.5 - Event-Driven Architecture
console.log('🔐 Memuat Auth Module v0.5.5 - Event-Driven & UI-Safe');

let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let isSystemInitialized = false;
let authStateChangeTimeout = null;

// ============================================
// KONTRAK AUTH ⇄ UI v0.5.5
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
// EVENT-DRIVEN USER DATA FETCH
// ============================================
async function fetchUserData(userId) {
    console.log('📡 Mengambil data user dari Firestore...');

    return new Promise((resolve, reject) => {
        // Clean up previous listener
        if (profileListener) {
            profileListener();
            profileListener = null;
        }

        const ref = firebaseDb.collection('users').doc(userId);
        let resolved = false;

        // Safety timeout untuk mencegah stuck
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
        }, 8000); // 8 detik timeout

        profileListener = ref.onSnapshot(async (snap) => {
            try {
                clearTimeout(fetchTimeout);
                
                if (snap.exists) {
                    const data = snap.data();
                    
                    // Ensure required fields
                    if (!data.nama) data.nama = '';
                    if (!data.foto_profil) {
                        data.foto_profil = generateDefaultAvatar(data.email || userId);
                    }
                    if (!data.peran) data.peran = 'siswa';
                    
                    userData = data;
                    userRole = data.peran || 'siswa';

                    // Initialize profile state if needed
                    if (!userProfileState) {
                        userProfileState = {
                            isProfileComplete: false,
                            isLoading: false,
                            hasChanges: false
                        };
                    }
                    
                    // Update profile completeness
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
        
        // Clean up Firestore listener
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
        // Clear any existing timeout
        if (authStateChangeTimeout) {
            clearTimeout(authStateChangeTimeout);
            authStateChangeTimeout = null;
        }
        
        // Set safety timeout (10 detik)
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
                
                // Notify UI melalui lifecycle
                if (window.UI && window.UI.afterLogin) {
                    window.UI.afterLogin();
                }
                
            } catch (fetchError) {
                console.error('❌ Gagal fetch user data:', fetchError);
                // Tetap set authReady agar UI tidak stuck
                authReady = true;
                
                // Notify UI bahwa login gagal
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
            
            // Notify UI melalui lifecycle
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
        
        // Fallback: selalu set authReady meski error
        authReady = true;
        
    } finally {
        // SELALU tutup loading dan clear timeout
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

    console.log('⚙️ Menginisialisasi ByteWard Auth v0.5.5...');

    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
        return;
    }

    try {
        // Set up Firebase auth state observer (SATU-SATUNYA sumber kebenaran)
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
    console.log('=== ByteWard Debug Info v0.5.5 ===');
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
    
    // UI Event Handler (untuk komunikasi dari UI ke Auth)
    setUserData: function(data) {
        userData = data;
        // Update profile state
        if (userProfileState) {
            userProfileState.isProfileComplete = checkProfileCompleteness(data);
        }
    }
};

// Getters/Setters - Backward Compatible
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

// Initialize on DOM ready dengan timeout safety
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

console.log('🔐 Auth Module v0.5.5 - Event-Driven & UI-Safe Loaded');
