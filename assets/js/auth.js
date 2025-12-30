// ByteWard Auth Module v0.5.1 - FIXED (No Infinite Loop)
console.log('🔐 Memuat Auth Module v0.5.1 (Fixed)...');

let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let isSystemInitialized = false;

function generateDefaultAvatar(seed) {
    const defaultSeed = seed || 'user' + Date.now();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
}

const PROFILE_AVATARS = [
    { id: 'male1', name: 'Male Avatar 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=5b6af0&radius=50', color: '#5b6af0' },
    { id: 'female1', name: 'Female Avatar 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=9d4edd&radius=50', color: '#9d4edd' },
    { id: 'robot', name: 'Robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=10b981&radius=50', color: '#10b981' },
    { id: 'cat', name: 'Cat', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=f59e0b&radius=50', color: '#f59e0b' },
    { id: 'alien', name: 'Alien', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alien&backgroundColor=8b5cf6&radius=50', color: '#8b5cf6' },
    { id: 'person1', name: 'Person 1', url: 'https://api.dicebear.com/7.x/personas/svg?seed=person1&backgroundColor=ef4444&radius=50', color: '#ef4444' },
    { id: 'person2', name: 'Person 2', url: 'https://api.dicebear.com/7.x/personas/svg?seed=person2&backgroundColor=14b8a6&radius=50', color: '#14b8a6' },
    { id: 'person3', name: 'Person 3', url: 'https://api.dicebear.com/7.x/personas/svg?seed=person3&backgroundColor=8b5cf6&radius=50', color: '#8b5cf6' }
];

function checkProfileCompleteness(data) {
    if (!data) return false;
    const hasName = data.nama && typeof data.nama === 'string' && data.nama.trim().length > 0;
    const hasAvatar = data.foto_profil && typeof data.foto_profil === 'string' && data.foto_profil.trim().length > 0;
    return hasName && hasAvatar;
}

// ============================================
// PERBAIKAN UTAMA: fetchUserData
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

        profileListener = ref.onSnapshot(async (snap) => {
            try {
                if (snap.exists) {
                    const data = snap.data();
                    
                    if (!data.nama) data.nama = '';
                    if (!data.foto_profil) data.foto_profil = generateDefaultAvatar(data.email || userId);
                    if (!data.peran) data.peran = 'siswa';
                    
                    userData = data;
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
                    
                    userProfileState.isProfileComplete = userData.profilLengkap;

                    if (!resolved) {
                        resolved = true;
                        resolve(userData);
                    }

                    if (currentUser && window.UI) {
                        window.UI.updateProfileButton();
                        if (document.getElementById('profilePanel')) {
                            const currentAvatar = document.querySelector('.current-avatar');
                            const currentName = document.querySelector('.current-name');
                            if (currentAvatar) currentAvatar.src = userData.foto_profil;
                            if (currentName) currentName.textContent = userData.nama || 'Nama belum diisi';
                        }
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
                console.error('Error in user data listener:', error);
                if (!resolved) reject(error);
            }
        }, (error) => {
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
        if (window.UI) window.UI.showAuthLoading('Membuka Google Login…');

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await firebaseAuth.signInWithPopup(provider);

        console.log('✅ Login sukses:', result.user.email);
        
        if (window.UI) window.UI.showAuthLoading('Login berhasil, menyiapkan sistem…');

        return result.user;
    } catch (error) {
        console.error('❌ Error login:', error);
        
        let errorMsg = error.message;
        if (error.code === 'auth/popup-closed-by-user') {
            errorMsg = 'Login dibatalkan oleh pengguna.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMsg = 'Popup login diblokir oleh browser. Silakan izinkan popup.';
        }

        if (window.UI) window.UI.hideAuthLoading();
        throw new Error(errorMsg);
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
        if (window.UI) window.UI.showError('Gagal logout.');
    }
}

async function initializeSystem() {
    if (isSystemInitialized) {
        console.log('⚠️ Auth System sudah diinisialisasi.');
        return;
    }
    isSystemInitialized = true;

    console.log('⚙️ Menginisialisasi ByteWard v0.5.1...');

    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        if (window.UI) window.UI.hideAuthLoading();
        return;
    }

    if (window.location.pathname.includes('404') || document.title.includes('404')) {
        console.log('🔧 Deteksi halaman 404, memanggil handler...');
        if (window.ByteWard) window.ByteWard.handle404Page();
    }

    if (window.UI) {
        window.UI.showAuthLoading('Mengecek status autentikasi…');
        window.UI.injectProfileCSS();
    }

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
        } finally {
            if (window.UI) window.UI.hideAuthLoading();
        }
    });

    console.log('✅ Auth observer berjalan');
}

function debugByteWard() {
    console.log('=== ByteWard Debug Info v0.5.1 ===');
    console.log('Current User:', currentUser);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', userProfileState?.isProfileComplete);
    console.log('Auth Ready:', authReady);
    console.log('==========================');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('❌ Firebase belum siap');
            return;
        }
        initializeSystem();
    }, 300);
});

window.Auth = {
    authLogin,
    authLogout,
    fetchUserData,
    createUserData,
    initializeSystem,
    debugByteWard,
    checkProfileCompleteness,
    generateDefaultAvatar,
    PROFILE_AVATARS
};

Object.defineProperties(window.Auth, {
    currentUser: { get: () => currentUser, set: (value) => { currentUser = value; } },
    userRole: { get: () => userRole, set: (value) => { userRole = value; } },
    userData: { get: () => userData, set: (value) => { userData = value; } },
    profileState: { get: () => userProfileState, set: (value) => { userProfileState = value; } },
    authReady: { get: () => authReady, set: (value) => { authReady = value; } }
});

console.log('🔐 Auth Module v0.5.1 - Fixed (No Loop).');
