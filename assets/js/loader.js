// loader.js
// ByteWard Loader v0.3.0
// Loader murni - load semua JS dari assets/js

console.log('⏳ Loader ByteWard dijalankan...');

(function () {

    // 🔥 Auto-detect folder tempat loader.js berada
    const currentScript = document.currentScript;
    const BASE_PATH = currentScript.src
        .split('/')
        .slice(0, -1)
        .join('/');

    const SCRIPTS = [
        'firebase.config.js',
        'notification.js',
        'ui.js',
        'auth.js',
        'byteward.js'
    ];

    function log(msg) {
        console.log('[LOADER]', msg);
    }

    function error(msg) {
        console.error('[LOADER ❌]', msg);
        if (window.notify?.error) {
            window.notify.error('Loader Error', msg, 5000);
        }
    }

    function loadScript(file) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${BASE_PATH}/${file}`;
            script.async = false; // jaga urutan

            script.onload = () => {
                log(`Berhasil memuat: ${file}`);
                resolve();
            };

            script.onerror = () => {
                reject(`Gagal memuat: ${file}`);
            };

            document.head.appendChild(script);
        });
    }

    (async () => {
        log('Mulai memuat modul dari assets/js');

        try {
            for (const file of SCRIPTS) {
                await loadScript(file);
            }

            log('✅ Semua modul berhasil dimuat');

            // Jalankan pengecekan akses terakhir
            if (window.ByteWard?.checkPageAccess) {
                window.ByteWard.checkPageAccess();
            }

            if (window.notify?.success) {
                window.notify.success(
                    'Sistem Siap',
                    'ByteWard berhasil dimuat',
                    2500
                );
            }

            log('🚀 Loader selesai');

        } catch (e) {
            error(e);
        }
    })();

})();
