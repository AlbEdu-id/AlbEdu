// loader.js
// ByteWard Loader v0.3.1
// FIXED: mobile-safe base path detection

console.log('⏳ Loader ByteWard dijalankan...');

(function () {

    function getBasePath() {
        const scripts = document.getElementsByTagName('script');
        const loaderScript = scripts[scripts.length - 1];

        if (!loaderScript || !loaderScript.src) {
            console.error('[LOADER ❌] Tidak bisa mendeteksi lokasi loader.js');
            return '';
        }

        return loaderScript.src
            .split('/')
            .slice(0, -1)
            .join('/');
    }

    const BASE_PATH = getBasePath();

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
            script.async = false;

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
        log('Mulai memuat semua modul...');
        log('Base path terdeteksi:', BASE_PATH);

        try {
            for (const file of SCRIPTS) {
                await loadScript(file);
            }

            log('✅ Semua modul berhasil dimuat');

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
