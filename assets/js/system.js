// AlbEdu - AlByte Guard (Level 2)
// Sistem Proteksi Pusat untuk AlbEdu
// Refactor Edition (Popup Auth + Loading State)

console.log('Memuat AlByte Guard - Sistem Proteksi AlbEdu...');

// =======================
// Global State
// =======================
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;

// =======================
// Role Permissions
// =======================
const rolePermissions = {
    admin: ['/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian'],
    siswa: ['/', '/login', '/siswa', '/ujian']
};

// =======================
// Utils
// =======================
function getBasePath() {
    const parts = window.location.pathname.split('/');
    return `/${parts[1]}`;
}

function isLoginPage() {
    const path = window.location.pathname;
    return path.includes('login') || path.endsWith('/');
}

// =======================
// Loading State
// =======================
function showAuthLoading(text = 'Memverifikasi sesi login…') {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;

    el.style.display = 'flex';
    const p = el.querySelector('p');
    if (p) p.textContent = text;

    console.log('[AUTH]', text);
}

function hideAuthLoading() {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;
    el.style.display = 'none';
}

// =======================
// Init System
// =======================
async function initializeSystem() {
    console.log('Menginisialisasi sistem AlbEdu...');
    showAuthLoading('Mengecek status autentikasi…');

    firebaseAuth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                console.log('User terautentikasi:', user.email);
                currentUser = user;

                showAuthLoading('Mengambil data pengguna…');
                await fetchUserData(user.uid);

                showAuthLoading('Memverifikasi akses halaman…');
                await checkPageAccess();

                authReady = true;
                hideAuthLoading();

                if (userRole === 'siswa' && userData && !userData.profilLengkap) {
                    showProfilePopup();
                }

            } else {
                console.log('User belum login');
                currentUser = null;
                userRole = null;
                userData = null;
                authReady = true;
                hideAuthLoading();

                if (!isLoginPage()) redirectToLogin();
            }
        } catch (err) {
            console.error('Auth flow error:', err);
            hideAuthLoading();
            showError('Terjadi kesalahan sistem autentikasi');
        }
    });
}

// =======================
// Firestore User
// =======================
async function fetchUserData(userId) {
    console.log('Mengambil data user dari Firestore...');

    const ref = firebaseDb.collection('users').doc(userId);
    const snap = await ref.get();

    if (snap.exists) {
        userData = snap.data();
        userRole = userData.peran || 'siswa';
        console.log('Role user:', userRole, userData);
    } else {
        console.log('Data user belum ada, membuat data baru...');
        await createUserData(userId);
        await fetchUserData(userId);
    }
}

async function createUserData(userId) {
    const user = firebaseAuth.currentUser;

    const payload = {
        id: userId,
        nama: user.displayName || '',
        email: user.email,
        foto_profil:
            user.photoURL ||
            `https://github.com/identicons/${user.email}.png`,
        peran: 'siswa',
        profilLengkap: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebaseDb.collection('users').doc(userId).set(payload);
    console.log('Data user baru berhasil dibuat');
}

// =======================
// AUTH
// =======================
async function authLogin() {
    try {
        console.log('Memulai login Google (popup mode)...');
        showAuthLoading('Membuka Google Login…');

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await firebaseAuth.signInWithPopup(provider);

        console.log('Login sukses:', result.user.email);
        showAuthLoading('Login berhasil, menyiapkan sistem…');

    } catch (error) {
        console.error('Error login:', error);
        hideAuthLoading();
        throw new Error(error.message || 'Login Google gagal');
    }
}

async function authLogout() {
    try {
        showAuthLoading('Logout…');
        await firebaseAuth.signOut();
        console.log('Logout berhasil');
        window.location.href = `${getBasePath()}/login.html`;
    } catch (error) {
        console.error('Error logout:', error);
        showError('Gagal logout.');
    }
}

// =======================
// Access Control
// =======================
async function checkPageAccess() {
    const currentPath = window.location.pathname.replace('.html', '');
    console.log(
        `Mengecek akses: ${currentPath} | Role: ${userRole}`
    );

    if (!currentUser) {
        if (!isLoginPage()) redirectToLogin();
        return;
    }

    if (isLoginPage()) {
        redirectBasedOnRole();
        return;
    }

    const allowed = rolePermissions[userRole] || [];
    if (!allowed.includes(currentPath)) {
        console.warn('Akses ditolak');
        showAccessDenied();
        return;
    }

    console.log('Akses diizinkan');
}

// =======================
// Redirects
// =======================
function redirectBasedOnRole() {
    if (!userRole) return;

    const base = getBasePath();
    let target = `${base}/login.html`;

    if (userRole === 'admin') target = `${base}/admin/`;
    if (userRole === 'siswa') target = `${base}/siswa/`;

    console.log('Redirect ke:', target);
    setTimeout(() => (window.location.href = target), 800);
}

function redirectToLogin() {
    window.location.href = `${getBasePath()}/login.html`;
}

// =======================
// Profile Popup
// =======================
function showProfilePopup() {
    console.log('Menampilkan popup kelengkapan profil...');
    // BIARKAN IMPLEMENTASI KAMU
}

// =======================
// Error UI
// =======================
function showAccessDenied() {
    const base = getBasePath();
    if (userRole === 'admin') window.location.href = `${base}/admin/`;
    else if (userRole === 'siswa') window.location.href = `${base}/siswa/`;
    else window.location.href = `${base}/login.html`;
}

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
            z-index: 1000;
            max-width: 420px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(el);
    }

    el.textContent = `Error: ${message}`;
    el.style.display = 'block';

    setTimeout(() => (el.style.display = 'none'), 5000);
}

// =======================
// BOOTSTRAP
// =======================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('Firebase belum siap');
            showError('Firebase tidak tersedia');
            return;
        }

        initializeSystem();
    }, 300);
});

// =======================
// Export
// =======================
window.authLogin = authLogin;
window.authLogout = authLogout;
window.checkPageAccess = checkPageAccess;

console.log('AlByte Guard AKTIF. AlbEdu terlindungi.');
