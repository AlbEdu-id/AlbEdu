// 🔥 ALBEDU - KONFIGURASI FIREBASE v0.1.5  
// Kompatibel dengan ByteWard Modular System
  
console.log('🔥 Memuat konfigurasi Firebase AlbEdu v0.1.5...');  
  
// ============================================
// 🔧 KONFIGURASI FIREBASE ALBEDU
// ============================================
const firebaseConfig = {  
    apiKey: "AIzaSyDKuJNrl1wil7McXgNBejtMaBJb27S38cU",  
    authDomain: "albyte-education.firebaseapp.com",  
    projectId: "albyte-education",  
    storageBucket: "albyte-education.firebasestorage.app",  
    messagingSenderId: "108273928870",  
    appId: "1:108273928870:web:f6017fc10e49dc0fb9c267",  
    measurementId: "G-92QMTRWDEF"  
};  
  
// ============================================
// 🚀 INISIALISASI FIREBASE
// ============================================
try {  
    // Cek apakah Firebase sudah diinisialisasi  
    if (!firebase.apps.length) {  
        firebase.initializeApp(firebaseConfig);  
        console.log('✅ Firebase berhasil diinisialisasi');  
    } else {  
        firebase.app(); // Gunakan app yang sudah ada
        console.log('✅ Firebase sudah diinisialisasi sebelumnya');  
    }  
      
} catch (error) {  
    console.error('❌ Error inisialisasi Firebase:', error);  
    console.warn('⚠️ Aplikasi akan berjalan tanpa Firebase (mode offline)');  
}  

// ============================================
// 📦 CREATE FIREBASE INSTANCES (KOMPATIBEL)
// ============================================
try {
    // Buat instances - KOMPATIBEL dengan ByteWard
    const firebaseAuth = firebase.auth();
    const firebaseDb = firebase.firestore();
    
    // 🔥 ENABLE OFFLINE PERSISTENCE (Tambahan dari Anda)
    firebaseDb.enablePersistence()
        .then(() => {
            console.log('✅ Firestore offline persistence diaktifkan');
        })
        .catch((err) => {
            console.warn('⚠️ Firestore offline persistence gagal:', err.code);
        });
    
    // Export untuk ByteWard modules
    window.firebaseAuth = firebaseAuth;
    window.firebaseDb = firebaseDb;
    
    console.log('✅ Firebase Auth & Firestore siap digunakan');
    
} catch (error) {
    console.error('❌ Gagal membuat Firebase instances:', error);
    
    // 🔥 FALLBACK MODE untuk development
    window.firebaseAuth = {
        currentUser: null,
        signInWithPopup: function() { 
            console.log('⚠️ Firebase tidak tersedia, menggunakan mode fallback');
            return Promise.resolve({
                user: {
                    uid: 'fallback-user-' + Date.now(),
                    email: 'fallback@albedu.id',
                    displayName: 'Fallback User',
                    photoURL: null
                }
            });
        },
        signOut: function() { 
            console.log('⚠️ Firebase logout (fallback mode)');
            return Promise.resolve();
        },
        onAuthStateChanged: function(callback) {
            console.log('⚠️ Firebase Auth State (fallback mode)');
            // Simulasikan user tidak login
            callback(null);
            return function() {}; // Unsubscribe function
        }
    };
    
    window.firebaseDb = {
        collection: function(name) {
            console.log('⚠️ Firestore collection (fallback mode):', name);
            return {
                doc: function(id) {
                    return {
                        get: function() {
                            return Promise.resolve({
                                exists: false,
                                data: function() { return null; }
                            });
                        },
                        set: function(data) {
                            console.log('⚠️ Firestore set (fallback mode):', data);
                            return Promise.resolve();
                        },
                        update: function(data) {
                            console.log('⚠️ Firestore update (fallback mode):', data);
                            return Promise.resolve();
                        },
                        onSnapshot: function(callback, errorCallback) {
                            console.log('⚠️ Firestore snapshot (fallback mode)');
                            // Tidak ada data real-time
                            return function() {}; // Unsubscribe function
                        }
                    };
                }
            };
        },
        FieldValue: {
            serverTimestamp: function() {
                return new Date();
            }
        }
    };
}

// ============================================
// 🛡️ VALIDASI KONFIGURASI
// ============================================
window.checkFirebaseConfig = function() {
    console.log('=== FIREBASE CONFIG VALIDATION ===');
    console.log('Firebase loaded:', typeof firebase !== 'undefined');
    console.log('FirebaseAuth:', typeof firebaseAuth !== 'undefined');
    console.log('FirebaseDb:', typeof firebaseDb !== 'undefined');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('===============================');
    
    // Alert visual jika konfigurasi valid
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('AIzaSyDEFAULT')) {
        console.log('✅ Konfigurasi Firebase valid');
    } else {
        console.error('❌ Konfigurasi Firebase mungkin salah');
    }
};

// Auto-check setelah 2 detik
setTimeout(() => {
    if (typeof window.checkFirebaseConfig === 'function') {
        window.checkFirebaseConfig();
    }
}, 2000);

// ============================================
// 🔧 EXPORT GLOBAL (Backward Compatibility)
// ============================================
// Untuk kode lama yang masih menggunakan 'auth' dan 'db'
window.auth = window.firebaseAuth;
window.db = window.firebaseDb;

console.log('🔥 firebase.config.js siap digunakan dengan ByteWard');
