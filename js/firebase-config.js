// AlbEdu - Konfigurasi Firebase  
// File ini berisi konfigurasi Firebase untuk seluruh aplikasi  
  
console.log('Memuat konfigurasi Firebase AlbEdu...');  
  
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
        console.log('Firebase berhasil diinisialisasi');  
    } else {  
        console.log('Firebase sudah diinisialisasi sebelumnya');  
    }  
      
    // Inisialisasi services  
    const auth = firebase.auth();  
    const db = firebase.firestore();  
      
    // Enable offline persistence  
    db.enablePersistence()  
        .then(() => {  
            console.log('Firestore offline persistence diaktifkan');  
        })  
        .catch((err) => {  
            console.warn('Firestore offline persistence gagal:', err.code);  
        });  
      
    // Export untuk digunakan di file lain  
    window.firebaseAuth = auth;  
    window.firebaseDb = db;  
      
} catch (error) {  
    console.error('Error inisialisasi Firebase:', error);  
    alert('Terjadi kesalahan dalam menginisialisasi sistem. Silakan refresh halaman.');  
}  

