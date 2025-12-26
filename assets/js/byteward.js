// ByteWard v0.1.5 - AlbEdu Security & Profile System    
// Advanced Security with Real-time Profile Management    
// FIXED: GitHub Pages base path handling with explicit configuration    
    
console.log('🚀 Memuat ByteWard v0.1.5 - Sistem Keamanan AlbEdu...');    
    
// =======================      
// Configuration & Constants      
// =======================      
// 🔧 CONFIGURATION: Explicit base path for GitHub Pages    
const APP_CONFIG = {    
    BASE_PATH: '/AlbEdu', // 🔥 Hard-coded explicit base path    
    APP_VERSION: '0.1.5',    
    IS_GITHUB_PAGES: true,    
        
    // Role-based redirects with base path included    
    REDIRECT_PATHS: {    
        admin: '/admin/index.html',    
        siswa: '/siswa/index.html',    
        login: '/login.html',    
        logout: '/login.html'    
    },    
        
    // Asset paths with base path    
    ASSETS: {    
        profileCSS: '/assets/css/profile.css'    
    }    
};    
    
// 🔧 FIXED: Role whitelist uses absolute paths WITH base path    
const ROLE_WHITELIST = {    
    admin: [    
        APP_CONFIG.BASE_PATH + '/admin/index.html',    
        APP_CONFIG.BASE_PATH + '/siswa/index.html',    
        APP_CONFIG.BASE_PATH + '/ujian/index.html',    
        APP_CONFIG.BASE_PATH + '/login.html'    
    ],    
    siswa: [    
        APP_CONFIG.BASE_PATH + '/siswa/index.html',    
        APP_CONFIG.BASE_PATH + '/ujian/index.html',    
        APP_CONFIG.BASE_PATH + '/login.html'    
    ]    
};    
    
// =======================      
// Enhanced Core Utilities      
// =======================      
/**    
 * 🔧 FIXED: Returns explicit base path WITHOUT guessing    
 * Always returns '/AlbEdu' for GitHub Pages    
 * @returns {string} Base path for the application    
 */    
function getBasePath() {      
    // ✅ Explicit base path - no guessing, no URL parsing    
    return APP_CONFIG.BASE_PATH;    
}      
    
/**    
 * 🔧 FIXED: Builds full URL with base path    
 * @param {string} path - Relative path (e.g., '/siswa/index.html')    
 * @returns {string} Full URL with base path    
 */    
function buildFullPath(path) {    
    // Ensure path starts with slash    
    const normalizedPath = path.startsWith('/') ? path : '/' + path;    
        
    // Handle cases where base path might be empty (local development)    
    if (!APP_CONFIG.BASE_PATH) {    
        return normalizedPath;    
    }    
        
    // Remove trailing slash from base path if present    
    const base = APP_CONFIG.BASE_PATH.endsWith('/')     
        ? APP_CONFIG.BASE_PATH.slice(0, -1)     
        : APP_CONFIG.BASE_PATH;    
        
    return base + normalizedPath;    
}    
    
/**    
 * 🔧 ENHANCED: Check if current page is login page with base path awareness    
 * @returns {boolean} True if current page is login page    
 */    
function isLoginPage() {      
    const currentPath = window.location.pathname;    
    const loginPath = buildFullPath(APP_CONFIG.REDIRECT_PATHS.login);    
        
    // Direct comparison with full login path    
    if (currentPath === loginPath) {    
        return true;    
    }    
        
    // Handle potential trailing slashes    
    if (currentPath === loginPath + '/') {    
        return true;    
    }    
        
    // Handle query parameters    
    const pathWithoutQuery = currentPath.split('?')[0];    
    if (pathWithoutQuery === loginPath || pathWithoutQuery === loginPath + '/') {    
        return true;    
    }    
        
    return false;    
}    
    
/**    
 * 🔧 ENHANCED: Check if current path is within app scope    
 * @returns {boolean} True if current path is within app base path    
 */    
function isWithinAppScope() {    
    const currentPath = window.location.pathname;    
        
    // If no base path, everything is within scope    
    if (!APP_CONFIG.BASE_PATH) {    
        return true;    
    }    
        
    // Check if current path starts with base path    
    return currentPath.startsWith(APP_CONFIG.BASE_PATH);    
}    
    
// =======================      
// Enhanced Redirect System      
// =======================      
/**    
 * 🔧 FIXED: Redirect based on role with proper base path    
 * Uses explicit paths from APP_CONFIG    
 */    
function redirectBasedOnRole() {    
    if (window.Auth && window.Auth.redirectInProgress) {    
        console.log('⚠️ Redirect sedang berlangsung, skip untuk hindari loop');    
        return;    
    }    
        
    if (!window.Auth || !window.Auth.currentUser || !window.Auth.userRole) {    
        console.log('⚠️ Menunggu data user...');    
        setTimeout(redirectBasedOnRole, 500);    
        return;    
    }    
        
    if (window.Auth) window.Auth.redirectInProgress = true;    
        
    // Get target path from config    
    const targetPath = APP_CONFIG.REDIRECT_PATHS[window.Auth.userRole] || APP_CONFIG.REDIRECT_PATHS.siswa;    
        
    // Build full URL with base path    
    const targetUrl = buildFullPath(targetPath);    
        
    // Anti-loop: Check if already on target page    
    const currentUrl = window.location.pathname + window.location.search;    
    if (currentUrl === targetUrl || currentUrl === targetUrl + '/') {    
        console.log('✅ Sudah berada di halaman target, skip redirect');    
        if (window.Auth) window.Auth.redirectInProgress = false;    
        return;    
    }    
        
    console.log(`🔄 Smart redirect ${window.Auth.userRole} ke: ${targetUrl}`);    
        
    // Add slight delay for better UX    
    setTimeout(() => {    
        window.location.replace(targetUrl);    
        if (window.Auth) window.Auth.redirectInProgress = false;    
    }, 800);    
}    
    
/**    
 * 🔧 FIXED: Redirect to login with proper base path    
 */    
function redirectToLogin() {      
    if (window.Auth && window.Auth.redirectInProgress) {    
        console.log('⚠️ Redirect sedang berlangsung, skip');    
        return;    
    }    
        
    // Build login URL with base path    
    const targetUrl = buildFullPath(APP_CONFIG.REDIRECT_PATHS.login);    
        
    // Anti-loop: Check if already on login page    
    const currentUrl = window.location.pathname;    
    if (currentUrl === targetUrl || currentUrl === targetUrl + '/') {    
        console.log('✅ Sudah di login page, skip redirect');    
        return;    
    }    
        
    if (window.Auth) window.Auth.redirectInProgress = true;    
    console.log('🔄 Redirect ke login:', targetUrl);    
        
    // Use replace to prevent back navigation    
    setTimeout(() => {    
        window.location.replace(targetUrl);    
        if (window.Auth) window.Auth.redirectInProgress = false;    
    }, 500);    
}    
    
/**    
 * 🔧 FIXED: Handle logout redirect with base path    
 */    
function redirectAfterLogout() {    
    const targetUrl = buildFullPath(APP_CONFIG.REDIRECT_PATHS.logout);    
    window.location.href = targetUrl;    
}    
    
// =======================      
// Enhanced Access Control      
// =======================      
/**    
 * 🔧 FIXED: Check page access with base path awareness    
 * @returns {Promise<boolean>} True if access granted    
 */    
async function checkPageAccess() {      
    const currentPath = window.location.pathname;    
        
    console.log(`🔒 Mengecek akses: ${currentPath} | Role: ${window.Auth ? window.Auth.userRole : 'none'} | Base: ${getBasePath()}`);    
        
    // Check if within app scope    
    if (APP_CONFIG.BASE_PATH && !isWithinAppScope()) {    
        console.log('⚠️ Di luar scope aplikasi, izinkan akses');    
        return true;    
    }    
        
    // Handle unauthenticated users    
    if (!window.Auth || !window.Auth.currentUser) {      
        if (!isLoginPage()) {    
            console.log('👤 User belum login, redirect ke login');    
            redirectToLogin();    
        }    
        return false;    
    }      
        
    // Redirect if on login page but already logged in    
    if (isLoginPage()) {      
        console.log('📍 Di halaman login, redirect berdasarkan role');    
        redirectBasedOnRole();      
        return true;    
    }      
        
    // Admin access: Allow all paths within app    
    if (window.Auth.userRole === 'admin') {    
        console.log('✅ Admin: Akses diizinkan untuk semua halaman');    
        return true;    
    }    
        
    // Student access: Check whitelist    
    const allowedPaths = ROLE_WHITELIST[window.Auth.userRole] || [];    
    const isAllowed = allowedPaths.some(allowedPath =>     
        currentPath === allowedPath ||     
        currentPath === allowedPath + '/' ||    
        currentPath.startsWith(allowedPath.replace('.html', ''))    
    );    
        
    if (!isAllowed) {      
        console.warn('⛔ Akses ditolak untuk path:', currentPath);      
        showAccessDenied();    
        return false;      
    }      
        
    console.log('✅ Akses diizinkan untuk', currentPath);      
    return true;    
}    
    
// =======================      
// 404 Page Enhancement    
// =======================      
/**    
 * 🔧 NEW: Enhanced 404 page handler for GitHub Pages    
 * This function should be called from 404.html    
 */    
function handle404Page() {    
    console.log('🔧 Memproses 404 page dengan base path:', getBasePath());    
        
    // Get current invalid path    
    const invalidPath = window.location.pathname;    
        
    // Check if this is actually our app's 404 page    
    if (invalidPath === buildFullPath('/404.html')) {    
        console.log('✅ Ini adalah halaman 404 yang valid');    
        return;    
    }    
        
    // Check if the path should be within our app scope    
    if (invalidPath.startsWith(getBasePath())) {    
        console.log(`⚠️ Path ${invalidPath} berada dalam scope aplikasi`);    
            
        // Try to redirect to login if not authenticated    
        if (!window.Auth || !window.Auth.currentUser) {    
            console.log('🔄 Redirect ke login dari 404');    
            redirectToLogin();    
        } else {    
            // If authenticated but path not found, redirect to dashboard    
            console.log('🔄 Redirect ke dashboard dari 404');    
            redirectBasedOnRole();    
        }    
    } else {    
        // Path outside our app scope - show helpful message    
        console.log('🌐 Path di luar scope aplikasi');    
        const base = getBasePath();    
        document.body.innerHTML += `    
            <div style="    
                position: fixed;    
                bottom: 20px;    
                right: 20px;    
                background: #fef3c7;    
                border: 2px solid #f59e0b;    
                border-radius: 8px;    
                padding: 15px;    
                max-width: 400px;    
                z-index: 10000;    
                font-family: system-ui, -apple-system, sans-serif;    
            ">    
                <h4 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Halaman Tidak Ditemukan</h4>    
                <p style="margin: 0 0 10px 0; color: #78350f;">    
                    Aplikasi AlbEdu berada di path: <strong>${base}</strong>    
                </p>    
                <a href="${base}/login.html"     
                   style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">    
                    Ke Halaman Login    
                </a>    
            </div>    
        `;    
    }    
}    
    
// =======================      
// Hard Block Access Denied (updated)    
// =======================      
function showAccessDenied() {      
    console.log('🛑 Hard block: Menampilkan Error 405');    
        
    const base = getBasePath();    
    const dashboardPath = buildFullPath('/siswa/index.html');    
        
    // Generate HTML error dinamis    
    document.body.innerHTML = `    
        <div style="    
            position: fixed;    
            top: 0;    
            left: 0;    
            width: 100%;    
            height: 100%;    
            background: #f8f9fa;    
            display: flex;    
            justify-content: center;    
            align-items: center;    
            flex-direction: column;    
            font-family: system-ui, -apple-system, sans-serif;    
            color: #dc2626;    
            text-align: center;    
            padding: 20px;    
            z-index: 99999;    
        ">    
            <h1 style="font-size: 48px; margin: 0;">405</h1>    
            <h2 style="font-size: 24px; margin: 10px 0;">Access Denied</h2>    
            <p style="font-size: 16px; max-width: 400px; color: #4b5563;">    
                Anda tidak memiliki izin untuk mengakses halaman ini.     
                Silakan kembali ke dashboard atau hubungi administrator.    
            </p>    
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">    
                Base Path: <code>${base}</code><br>    
                Current Path: <code>${window.location.pathname}</code>    
            </p>    
            <a href="${dashboardPath}" style="    
                margin-top: 20px;    
                padding: 10px 20px;    
                background: #2563eb;    
                color: white;    
                text-decoration: none;    
                border-radius: 5px;    
                font-weight: bold;    
            ">Kembali ke Dashboard</a>    
        </div>    
    `;    
        
    // Hentikan semua script lain    
    document.querySelectorAll('script').forEach(script => {    
        if (!script.src.includes('ByteWard')) {    
            script.remove();    
        }    
    });    
}    
    
// =======================      
// Global Exports      
// =======================      
window.ByteWard = {    
    APP_CONFIG,    
    ROLE_WHITELIST,    
    getBasePath,    
    buildFullPath,    
    isLoginPage,    
    isWithinAppScope,    
    redirectBasedOnRole,    
    redirectToLogin,    
    redirectAfterLogout,    
    checkPageAccess,    
    handle404Page,    
    showAccessDenied    
};    
    
console.log('🛡️ ByteWard v0.1.5 - Security & Routing siap.');
