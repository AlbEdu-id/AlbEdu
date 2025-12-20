// =============================================
// FIREBASE CONFIGURATION - UPDATE WITH STORAGE
// =============================================
console.log('🔥 Memuat konfigurasi Firebase AlbEdu...');

// Konfigurasi Firebase AlbEdu
const firebaseConfig = {
    apiKey: "AIzaSyDKuJNrl1wil7McXgNBejtMaBJb27S38cU",
    authDomain: "albyte-education.firebaseapp.com",
    projectId: "albyte-education",
    storageBucket: "albyte-education.firebasestorage.app",
    messagingSenderId: "108273928870",
    appId: "1:108273928870:web:f6017fc10e49dc0fb9c267",
    measurementId: "G-92QMTRWDEF"
};

// Inisialisasi Firebase
try {
    // Cek apakah Firebase sudah diinisialisasi
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase berhasil diinisialisasi');
    } else {
        console.log('ℹ️ Firebase sudah diinisialisasi sebelumnya');
        firebase.app(); // Gunakan app yang sudah ada
    }
    
    // Inisialisasi services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage(); // Tambahkan storage
    
    // Enable offline persistence untuk Firestore
    db.enablePersistence()
        .then(() => {
            console.log('💾 Firestore offline persistence diaktifkan');
        })
        .catch((err) => {
            console.warn('⚠️ Firestore offline persistence gagal:', err.code);
        });
    
    // Configure Firestore settings
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // Configure Auth settings
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log('🔐 Auth persistence: LOCAL');
        })
        .catch((error) => {
            console.warn('⚠️ Auth persistence error:', error);
        });
    
    // Export untuk digunakan di file lain
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    window.firebaseStorage = storage; // Export storage
    window.firebaseApp = firebase.app();
    
    console.log('🎉 Semua Firebase services siap digunakan');
    
} catch (error) {
    console.error('❌ Error inisialisasi Firebase:', error);
    
    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        text-align: center;
        padding: 20px;
    `;
    errorDiv.innerHTML = `
        <h2 style="color: #ef4444; margin-bottom: 20px;">⚠️ Sistem Error</h2>
        <p style="margin-bottom: 10px;">Terjadi kesalahan dalam menginisialisasi sistem.</p>
        <p style="margin-bottom: 30px; opacity: 0.8;">${error.message}</p>
        <button onclick="location.reload()" style="
            background: #5b6af0;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        ">Refresh Halaman</button>
    `;
    document.body.appendChild(errorDiv);
}
