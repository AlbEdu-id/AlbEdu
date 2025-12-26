onsole.log('🔐 Auth Module v0.1.5 - Authentication siap.');
// ByteWard Auth Module v0.1.5 - Authentication & User Data

console.log('🔐 Memuat Auth Module v0.1.5...');

// Global State
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let userProfileState = null;
let profileListener = null;
let redirectInProgress = false;

// Avatar constants
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
// Profile Completeness Check
// =======================
function checkProfileCompleteness(data) {
  if (!data) return false;
  const hasName = data.nama && data.nama.trim().length > 0;
  const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;
  return hasName && hasAvatar;
}

function generateGitHubAvatar(email) {
  const hash = email.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `https://github.com/identicons/${Math.abs(hash)}.png`;
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
                currentAvatar.src = userData.foto_profil || generateGitHubAvatar(currentUser.email);
              }
              if (currentName) {
                currentName.textContent = userData.nama || 'Nama belum diisi';
              }
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
        if (!resolved) {
          reject(error);
        }
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      if (!resolved) {
        reject(error);
      }
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
    if (window.UI) window.UI.showAuthLoading('Login berhasil, menyiapkan sistem…');

    return result.user;
  } catch (error) {
    console.error('❌ Error login:', error);
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

// =======================
// System Initialization
// =======================
async function initializeSystem() {
  console.log('⚙️ Menginisialisasi ByteWard v0.1.5...');
  console.log('📍 Konfigurasi:', window.ByteWard ? window.ByteWard.APP_CONFIG : 'N/A');
  console.log('📍 Base Path:', window.ByteWard ? window.ByteWard.getBasePath() : 'N/A');
  console.log('📍 Current Path:', window.location.pathname);
  console.log('📍 Is Login Page:', window.ByteWard ? window.ByteWard.isLoginPage() : 'N/A');
  console.log('📍 Within App Scope:', window.ByteWard ? window.ByteWard.isWithinAppScope() : 'N/A');

  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('❌ Firebase tidak tersedia');
    if (window.UI) window.UI.showError('Firebase belum dimuat. Silakan refresh halaman.');
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

      if (window.UI) window.UI.showError(errorMsg);
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
  console.log('=== ByteWard Debug Info v0.1.5 ===');
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
  console.log('==========================');
}

// =======================
// Bootstrap System
// =======================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof firebaseAuth === 'undefined') {
      console.error('❌ Firebase belum siap');
      if (window.UI) window.UI.showError('Firebase tidak tersedia');
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
  generateGitHubAvatar,
  DEFAULT_AVATARS
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

console.log('🔐 Auth Module v0.1.5 - Authentication siap.');
