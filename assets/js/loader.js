// loader.js
// ByteWard Loader v0.2.1
// Loader murni: tugasnya MELoad file JS lain

console.log('⏳ Loader ByteWard dijalankan...');

(function () {

    // ⚠️ HARUS SAMA dengan ByteWard.APP_CONFIG.BASE_PATH
    const BASE_PATH = '/AlbEdu';

    // Urutan WAJIB (dependency chain)
    const SCRIPTS = [
        '/firebase.config.js',
        '/notification.js',
        '/ui.js',
        '/auth.js',
        '/byteward.js'
    ];

    function log(pesan) {
        console.log('[LOADER]', pesan);
    }

    function error(pesan) {
        console.error('[LOADER ❌]', pesan);
        if (window.notify?.error) {
            window.notify.error('Loader Error', pesan, 5000);
        }
    }

    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = BASE_PATH + path;
            script.async = false; // 🔥 PENTING: jaga urutan
            script.defer = true;

            script.onload = () => {
                log(`Berhasil memuat: ${path}`);
                resolve();
            };

            script.onerror = () => {
                reject(`Gagal memuat: ${path}`);
            };

            document.head.appendChild(script);
        });
    }

    async function mulai() {
        log('Mulai memuat semua modul...');

        try {
            for (const file of SCRIPTS) {
                await loadScript(file);
            }

            log('✅ Semua file berhasil dimuat');

            // Trigger akses halaman setelah semua siap
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

            log('🚀 Loader selesai bekerja');

        } catch (err) {
            error(err);
        }
    }

    mulai();

})();
