// ByteWard v0.1.4 - AlbEdu Security & Profile System
// Advanced Security with Real-time Profile Management

console.log('🚀 Memuat ByteWard v0.1.4 - Sistem Keamanan AlbEdu...');

// =======================  
// Global State  
// =======================  
let currentUser = null;  
let userRole = null;  
let userData = null;  
let authReady = false;  
let profileListener = null;  
let redirectInProgress = false; // FIX: Prevent redirect loops

// =======================  
// Constants  
// =======================  
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
// Profile State  
// =======================  
let profileState = {  
    isProfileComplete: false,  
    selectedAvatar: null,  
    customAvatar: null,  
    tempName: '',  
    isLoading: false,  
    hasChanges: false,
    autoCloseTriggered: false // FIX: Track auto-close state
};  

// =======================  
// Core Utilities  
// =======================  
function getBasePath() {  
    // FIX: Safer base path detection for root and subfolders
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    
    // Jika ada base path (misal: /subfolder), return dengan leading slash
    if (parts.length > 0 && !path.includes('/login')) {
        // Ambil base folder pertama sebagai base path
        return `/${parts[0]}`;
    }
    
    // Untuk root atau halaman login langsung di root
    if (path === '/' || path.startsWith('/login')) {
        return '';
    }
    
    // Default ke root
    return '';  
}  

function isLoginPage() {  
    // FIX: Avoid false positive on root path
    const path = window.location.pathname;
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    // Check for exact login paths
    if (normalizedPath === '' || normalizedPath === '/') return false; // Root bukan login page
    
    return normalizedPath.includes('/login') || 
           normalizedPath.endsWith('login.html') ||
           normalizedPath === '/login' ||
           normalizedPath === getBasePath() + '/login';
}  

function generateGitHubAvatar(email) {  
    const hash = email.split('').reduce((acc, char) => {  
        return char.charCodeAt(0) + ((acc << 5) - acc);  
    }, 0);  
    return `https://github.com/identicons/${Math.abs(hash)}.png`;  
}  

// =======================  
// Loading System  
// =======================  
function showAuthLoading(text = 'Memverifikasi sesi login…') {  
    let el = document.getElementById('loadingIndicator');  
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 18px;
            flex-direction: column;
        `;
        el.innerHTML = `
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 20px;
            "></div>
            <p>${text}</p>
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
      
    el.style.display = 'flex';  
    const p = el.querySelector('p');  
    if (p) p.textContent = text;  
      
    console.log('[BYTEWARD]', text);  
}  

function hideAuthLoading() {  
    const el = document.getElementById('loadingIndicator');  
    if (!el) return;  
    el.style.display = 'none';  
}  

// =======================  
// Profile Completeness Check  
// =======================  
function checkProfileCompleteness(data) {  
    if (!data) return false;  
      
    const hasName = data.nama && data.nama.trim().length > 0;  
    const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;  
      
    return hasName && hasAvatar;  
}  

// =======================  
// Profile Button System  
// =======================  
function createProfileButton() {  
    // Remove existing button if any  
    const existing = document.querySelector('.profile-button-container');  
    if (existing) existing.remove();  
      
    // Create container  
    const container = document.createElement('div');  
    container.className = 'profile-button-container';  
      
    // Create button  
    const button = document.createElement('button');  
    button.className = 'profile-button';  
    button.id = 'profileTrigger';  
    button.innerHTML = `  
        <img src="${userData?.foto_profil || generateGitHubAvatar(currentUser.email)}"   
             alt="Profile"   
             class="profile-image"  
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280'">  
    `;  
      
    // Add indicator if profile incomplete  
    if (!profileState.isProfileComplete) {  
        const indicator = document.createElement('div');  
        indicator.className = 'profile-indicator';  
        indicator.textContent = '!';  
        indicator.title = 'Profil belum lengkap';  
        button.appendChild(indicator);  
    }  
      
    // Add click event  
    button.addEventListener('click', showProfilePanel);  
      
    container.appendChild(button);  
    document.body.appendChild(container);  
}  

function updateProfileButton() {  
    const button = document.getElementById('profileTrigger');  
    if (!button) return;  
      
    const img = button.querySelector('.profile-image');  
    if (img && userData?.foto_profil) {  
        img.src = userData.foto_profil;  
    }  
      
    // Update indicator  
    const indicator = button.querySelector('.profile-indicator');  
    if (profileState.isProfileComplete) {  
        if (indicator) indicator.remove();  
    } else {  
        if (!indicator) {  
            const newIndicator = document.createElement('div');  
            newIndicator.className = 'profile-indicator';  
            newIndicator.textContent = '!';  
            newIndicator.title = 'Profil belum lengkap';  
            button.appendChild(newIndicator);  
        }  
    }  
}  

// =======================  
// Profile Panel System  
// =======================  
function createProfilePanel() {  
    // Remove existing panel if any  
    const existing = document.getElementById('profilePanel');  
    if (existing) existing.remove();  
      
    // Create overlay  
    const overlay = document.createElement('div');  
    overlay.className = 'profile-overlay';  
    overlay.id = 'profileOverlay';  
      
    // Create panel  
    const panel = document.createElement('div');  
    panel.className = 'profile-panel';  
    panel.id = 'profilePanel';  
      
    panel.innerHTML = `  
        <div class="profile-header">  
            <h2>${profileState.isProfileComplete ? 'Profil Saya' : 'Lengkapi Profil'}</h2>  
            <button class="close-profile" id="closeProfile">  
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">  
                    <path d="M18 6L6 18M6 6l12 12"/>  
                </svg>  
            </button>  
        </div>  
          
        <div class="profile-content">  
            <div class="current-profile">  
                <img src="${userData?.foto_profil || generateGitHubAvatar(currentUser.email)}"   
                     alt="Current Avatar"   
                     class="current-avatar"  
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280'">  
                <div class="current-name">${userData?.nama || currentUser.displayName || 'Nama belum diisi'}</div>  
            </div>  
              
            <div class="edit-section">  
                <div class="name-input-group">  
                    <label for="profileName">Nama Lengkap</label>  
                    <input type="text"   
                           id="profileName"   
                           class="name-input"   
                           placeholder="Masukkan nama lengkap"  
                           value="${userData?.nama || ''}">  
                </div>  
                  
                <div class="avatar-options">  
                    <div class="option-title">Pilih Avatar</div>  
                    <div class="option-grid" id="avatarOptions"></div>  
                      
                    <div class="custom-upload">  
                        <label class="upload-label">  
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">  
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>  
                                <polyline points="17 8 12 3 7 8"/>  
                                <line x1="12" y1="3" x2="12" y2="15"/>  
                            </svg>  
                            Unggah Foto Sendiri  
                            <input type="file"   
                                   id="avatarUpload"   
                                   class="upload-input"   
                                   accept="image/*">  
                        </label>  
                          
                        <div class="preview-container" id="previewContainer">  
                            <div class="preview-title">Pratinjau:</div>  
                            <img class="preview-image" id="previewImage">  
                        </div>  
                    </div>  
                </div>  
                  
                <div class="status-message" id="statusMessage"></div>  
                  
                <div class="profile-actions">  
                    <button class="save-btn" id="saveProfile" disabled>  
                        <span id="saveText">Simpan Perubahan</span>  
                        <span class="save-loading" id="saveLoading">  
                            <span class="spinner"></span>  
                            Menyimpan...  
                        </span>  
                    </button>  
                    <button class="cancel-btn" id="cancelEdit">Batal</button>  
                </div>  
            </div>  
        </div>  
    `;  
      
    overlay.appendChild(panel);  
    document.body.appendChild(overlay);  
      
    // Initialize panel components  
    initializeProfilePanel();  
}  

function initializeProfilePanel() {  
    // Populate avatar options  
    populateAvatarOptions();  
      
    // Setup event listeners  
    document.getElementById('closeProfile').addEventListener('click', hideProfilePanel);  
    document.getElementById('cancelEdit').addEventListener('click', hideProfilePanel);  
    document.getElementById('profileOverlay').addEventListener('click', (e) => {  
        if (e.target.id === 'profileOverlay') hideProfilePanel();  
    });  
      
    // Name input listener  
    const nameInput = document.getElementById('profileName');  
    nameInput.addEventListener('input', () => {  
        profileState.tempName = nameInput.value.trim();  
        checkForChanges();  
    });  
      
    // Avatar upload listener  
    const uploadInput = document.getElementById('avatarUpload');  
    uploadInput.addEventListener('change', handleAvatarUpload);  
      
    // Save button listener  
    document.getElementById('saveProfile').addEventListener('click', saveProfile);  
      
    // Initialize state  
    profileState.tempName = userData?.nama || '';  
    checkForChanges();  
}  

function populateAvatarOptions() {  
    const container = document.getElementById('avatarOptions');  
    if (!container) return;  
      
    container.innerHTML = '';  
      
    DEFAULT_AVATARS.forEach(avatar => {  
        const option = document.createElement('div');  
        option.className = 'avatar-option';  
        option.dataset.id = avatar.id;  
          
        if (avatar.id === 'github') {  
            const githubUrl = generateGitHubAvatar(currentUser.email);  
            option.innerHTML = `  
                <img src="${githubUrl}"   
                     alt="${avatar.name}"  
                     onerror="this.parentElement.innerHTML='<div class=\\'option-label\\'>${avatar.name}</div>'">  
            `;  
        } else {  
            option.innerHTML = `<img src="${avatar.url}" alt="${avatar.name}">`;  
        }  
          
        // Check if this is current avatar  
        if (userData?.foto_profil) {  
            const currentUrl = userData.foto_profil;  
            if (avatar.id === 'github' && currentUrl.includes('github.com/identicons/')) {  
                option.classList.add('selected');  
                profileState.selectedAvatar = 'github';  
            } else if (currentUrl === avatar.url) {  
                option.classList.add('selected');  
                profileState.selectedAvatar = avatar.id;  
            }  
        }  
          
        option.addEventListener('click', () => selectAvatar(avatar.id));  
        container.appendChild(option);  
    });  
}  

function selectAvatar(avatarId) {  
    profileState.selectedAvatar = avatarId;  
    profileState.customAvatar = null;  
      
    // Update UI  
    document.querySelectorAll('.avatar-option').forEach(opt => {  
        opt.classList.remove('selected');  
        if (opt.dataset.id === avatarId) {  
            opt.classList.add('selected');  
        }  
    });  
      
    // Clear preview  
    const previewContainer = document.getElementById('previewContainer');  
    const previewImage = document.getElementById('previewImage');  
    previewContainer.classList.remove('active');  
    previewImage.src = '';  
      
    checkForChanges();  
}  

async function handleAvatarUpload(event) {  
    const file = event.target.files[0];  
    if (!file) return;  
      
    // Validate file  
    if (!file.type.startsWith('image/')) {  
        showStatus('Hanya file gambar yang diperbolehkan', 'error');  
        return;  
    }  
      
    if (file.size > 2 * 1024 * 1024) { // 2MB  
        showStatus('Ukuran gambar maksimal 2MB', 'error');  
        return;  
    }  
      
    try {  
        const reader = new FileReader();  
        reader.onload = (e) => {  
            profileState.customAvatar = e.target.result;  
            profileState.selectedAvatar = 'custom';  
              
            // Update UI  
            document.querySelectorAll('.avatar-option').forEach(opt => {  
                opt.classList.remove('selected');  
            });  
              
            const previewContainer = document.getElementById('previewContainer');  
            const previewImage = document.getElementById('previewImage');  
            previewImage.src = e.target.result;  
            previewContainer.classList.add('active');  
              
            checkForChanges();  
        };  
        reader.readAsDataURL(file);  
    } catch (error) {  
        showStatus('Gagal membaca file', 'error');  
        console.error('Upload error:', error);  
    }  
}  

function checkForChanges() {  
    const nameChanged = profileState.tempName !== (userData?.nama || '');  
      
    let avatarChanged = false;  
    if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {  
        avatarChanged = profileState.customAvatar !== userData?.foto_profil;  
    } else if (profileState.selectedAvatar === 'github') {  
        const githubUrl = generateGitHubAvatar(currentUser.email);  
        avatarChanged = githubUrl !== userData?.foto_profil;  
    } else if (profileState.selectedAvatar) {  
        const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);  
        avatarChanged = selected?.url !== userData?.foto_profil;  
    }  
      
    profileState.hasChanges = nameChanged || avatarChanged;  
      
    const saveBtn = document.getElementById('saveProfile');  
    if (saveBtn) {  
        saveBtn.disabled = !profileState.hasChanges || profileState.isLoading;  
    }  
}  

function showProfilePanel() {  
    const overlay = document.getElementById('profileOverlay');  
    const panel = document.getElementById('profilePanel');  
      
    if (!overlay || !panel) {  
        createProfilePanel();  
        setTimeout(() => {  
            document.getElementById('profileOverlay').classList.add('active');  
            document.getElementById('profilePanel').classList.add('active');  
        }, 10);  
    } else {  
        overlay.classList.add('active');  
        setTimeout(() => panel.classList.add('active'), 10);  
    }  
      
    // Reset form  
    const nameInput = document.getElementById('profileName');  
    if (nameInput) {  
        nameInput.value = userData?.nama || '';  
        profileState.tempName = userData?.nama || '';  
    }  
      
    // Clear status  
    showStatus('', '');  
    checkForChanges();  
}  

function hideProfilePanel() {  
    const overlay = document.getElementById('profileOverlay');  
    const panel = document.getElementById('profilePanel');  
      
    if (panel) panel.classList.remove('active');  
    if (overlay) {  
        setTimeout(() => {  
            overlay.classList.remove('active');  
            // Reset upload  
            const uploadInput = document.getElementById('avatarUpload');  
            if (uploadInput) uploadInput.value = '';  
        }, 300);  
    }  
}  

function showStatus(message, type) {  
    const statusEl = document.getElementById('statusMessage');  
    if (!statusEl) return;  
      
    statusEl.textContent = message;  
    statusEl.className = 'status-message';  
      
    if (type === 'success') {  
        statusEl.classList.add('status-success');  
        statusEl.style.display = 'block';  
        setTimeout(() => {  
            statusEl.style.display = 'none';  
        }, 3000);  
    } else if (type === 'error') {  
        statusEl.classList.add('status-error');  
        statusEl.style.display = 'block';  
    } else {  
        statusEl.style.display = 'none';  
    }  
}  

async function saveProfile() {  
    if (profileState.isLoading || !profileState.hasChanges) return;  
      
    try {  
        profileState.isLoading = true;  
        updateSaveButtonState();  
          
        // Prepare update data  
        const updates = {};  
          
        // Update name if changed  
        if (profileState.tempName && profileState.tempName !== userData?.nama) {  
            updates.nama = profileState.tempName.trim();  
        }  
          
        // Update avatar if changed  
        let newAvatarUrl = userData?.foto_profil;  
          
        if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {  
            newAvatarUrl = profileState.customAvatar;  
        } else if (profileState.selectedAvatar === 'github') {  
            newAvatarUrl = generateGitHubAvatar(currentUser.email);  
        } else if (profileState.selectedAvatar) {  
            const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);  
            newAvatarUrl = selected?.url;  
        }  
          
        if (newAvatarUrl && newAvatarUrl !== userData?.foto_profil) {  
            updates.foto_profil = newAvatarUrl;  
        }  
          
        // Check if profile is now complete  
        const willBeComplete = checkProfileCompleteness({  
            ...userData,  
            ...updates  
        });  
          
        updates.profilLengkap = willBeComplete;  
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();  
          
        // Save to Firestore  
        await firebaseDb.collection('users').doc(currentUser.uid).update(updates);  
          
        // Update local state  
        userData = { ...userData, ...updates };  
        profileState.isProfileComplete = willBeComplete;  
        profileState.hasChanges = false;  
          
        // Update UI  
        updateProfileButton();  
        showStatus('Profil berhasil diperbarui!', 'success');  
          
        // Update panel display  
        const currentAvatar = document.querySelector('.current-avatar');  
        const currentName = document.querySelector('.current-name');  
          
        if (currentAvatar && updates.foto_profil) {  
            currentAvatar.src = updates.foto_profil;  
        }  
        if (currentName && updates.nama) {  
            currentName.textContent = updates.nama;  
        }  
          
        // FIX: Auto close only if profile was incomplete and now complete
        if (willBeComplete && !profileState.autoCloseTriggered) {  
            profileState.autoCloseTriggered = true;
            setTimeout(() => {  
                hideProfilePanel();  
            }, 1500);  
        }  
          
    } catch (error) {  
        console.error('Save profile error:', error);  
        showStatus('Gagal menyimpan perubahan: ' + error.message, 'error');  
    } finally {  
        profileState.isLoading = false;  
        updateSaveButtonState();  
    }  
}  

function updateSaveButtonState() {  
    const saveBtn = document.getElementById('saveProfile');  
    const saveText = document.getElementById('saveText');  
    const saveLoading = document.getElementById('saveLoading');  
      
    if (!saveBtn) return;  
      
    saveBtn.disabled = !profileState.hasChanges || profileState.isLoading;  
      
    if (profileState.isLoading) {  
        saveText.style.display = 'none';  
        saveLoading.classList.add('active');  
    } else {  
        saveText.style.display = 'inline';  
        saveLoading.classList.remove('active');  
    }  
}  

// =======================  
// CSS Injection  
// =======================  
function injectProfileCSS() {  
    if (document.querySelector('link[href*="profile.css"]')) return;  
      
    const link = document.createElement('link');  
    link.rel = 'stylesheet';  
    link.href = `${getBasePath()}/assets/css/profile.css`;  
    link.id = 'profile-css';  
      
    // Fallback if CSS fails to load  
    link.onerror = () => {  
        console.warn('Profile CSS failed to load, using inline styles');  
        const style = document.createElement('style');  
        style.textContent = `  
            .profile-button-container { 
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 9999; 
            }  
            .profile-button { 
                width: 56px; 
                height: 56px; 
                border-radius: 50%; 
                background: #333; 
                border: none; 
                cursor: pointer;
                position: relative;
                overflow: hidden;
                padding: 0;
            }  
            .profile-button img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .profile-indicator { 
                position: absolute; 
                top: -5px; 
                right: -5px; 
                width: 20px; 
                height: 20px; 
                background: #ef4444; 
                border-radius: 50%; 
                color: white;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
        `;  
        document.head.appendChild(style);  
    };  
      
    document.head.appendChild(link);  
}  

// =======================  
// User Data Management  
// =======================  
async function fetchUserData(userId) {  
    console.log('📡 Mengambil data user dari Firestore...');  
      
    // FIX: Return promise that resolves once with initial data
    return new Promise((resolve, reject) => {
        // Clean up previous listener
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
                      
                    // Check profile completeness  
                    profileState.isProfileComplete = checkProfileCompleteness(userData);  
                      
                    console.log('✅ Data user diperbarui:', {   
                        role: userRole,   
                        name: userData.nama,  
                        profileComplete: profileState.isProfileComplete   
                    });  
                      
                    // Resolve promise only on first load
                    if (!resolved) {
                        resolved = true;
                        resolve(userData);
                    }
                      
                    // Update UI if user is logged in  
                    if (currentUser) {  
                        updateProfileButton();  
                          
                        // Update panel if it's open  
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
// Authentication  
// =======================  
async function authLogin() {  
    try {  
        console.log('🔐 Memulai login Google...');  
        showAuthLoading('Membuka Google Login…');  
          
        const provider = new firebase.auth.GoogleAuthProvider();  
        provider.addScope('profile');  
        provider.addScope('email');  
          
        const result = await firebaseAuth.signInWithPopup(provider);  
          
        console.log('✅ Login sukses:', result.user.email);  
        showAuthLoading('Login berhasil, menyiapkan sistem…');  
          
        return result.user;
    } catch (error) {  
        console.error('❌ Error login:', error);  
        hideAuthLoading();  
        throw new Error(error.message || 'Login Google gagal');  
    }  
}  

async function authLogout() {  
    try {  
        showAuthLoading('Logout…');  
          
        // Cleanup  
        if (profileListener) {  
            profileListener();  
            profileListener = null;  
        }  
          
        await firebaseAuth.signOut();  
        console.log('✅ Logout berhasil');  
          
        // Remove profile UI  
        const profileContainer = document.querySelector('.profile-button-container');  
        if (profileContainer) profileContainer.remove();  
          
        const profilePanel = document.getElementById('profileOverlay');  
        if (profilePanel) profilePanel.remove();  
          
        window.location.href = `${getBasePath()}/login.html`;  
    } catch (error) {  
        console.error('❌ Error logout:', error);  
        showError('Gagal logout.');  
    }  
}  

// =======================  
// Access Control & Redirect  
// =======================  
async function checkPageAccess() {  
    const currentPath = window.location.pathname;
    console.log(`🔒 Mengecek akses: ${currentPath} | Role: ${userRole}`);  
      
    if (!currentUser) {  
        if (!isLoginPage()) {
            console.log('👤 User belum login, redirect ke login');
            redirectToLogin();  
        }
        return false;
    }  
      
    if (isLoginPage()) {  
        console.log('📍 Di halaman login, redirect berdasarkan role');
        redirectBasedOnRole();  
        return true;
    }  
      
    const rolePermissions = {  
        admin: [
            '/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian',
            '/admin/dashboard', '/admin/manage', '/admin/settings'
        ],  
        siswa: [
            '/', '/login', '/siswa', '/ujian', '/siswa/dashboard', 
            '/siswa/ujian', '/siswa/profile', '/siswa/quiz'
        ]  
    };  
      
    const allowed = rolePermissions[userRole] || [];
    
    // Normalize path for comparison
    let normalizedPath = currentPath;
    const base = getBasePath();
    
    if (base && normalizedPath.startsWith(base)) {
        normalizedPath = normalizedPath.substring(base.length);
    }
    
    if (normalizedPath === '') normalizedPath = '/';
    
    // Check if current path is allowed
    let isAllowed = false;
    for (const allowedPath of allowed) {
        if (normalizedPath === allowedPath || 
            normalizedPath.startsWith(allowedPath + '/') ||
            (allowedPath === '/' && normalizedPath === '/')) {
            isAllowed = true;
            break;
        }
    }
    
    if (!isAllowed) {  
        console.warn('⛔ Akses ditolak untuk path:', normalizedPath);  
        showAccessDenied();  
        return false;  
    }  
      
    console.log('✅ Akses diizinkan untuk', normalizedPath);  
    return true;
}  

// =======================  
// Redirect System  
// =======================  
function redirectBasedOnRole() {
    // FIX: Prevent redirect loops
    if (redirectInProgress) return;
    
    if (!currentUser || !userRole) {
        console.log('⚠️ Menunggu data user...');
        setTimeout(redirectBasedOnRole, 500);
        return;
    }
    
    redirectInProgress = true;
    
    const base = getBasePath();
    let target = '';
    
    if (userRole === 'admin') {
        target = `${base}/admin/dashboard.html`;
    } else if (userRole === 'siswa') {
        target = `${base}/siswa/dashboard.html`;
    } else {
        target = `${base}/login.html`;
    }
    
    // Check if we're already on the target page
    const currentPath = window.location.pathname;
    if (currentPath === target || currentPath.includes(target.replace(base, ''))) {
        console.log('✅ Sudah berada di halaman yang benar');
        redirectInProgress = false;
        return;
    }
    
    console.log(`🔄 Redirect ${userRole} ke: ${target}`);
    
    // Use replace instead of href to avoid adding to history
    setTimeout(() => {
        window.location.replace(target);
    }, 800);
}  

function redirectToLogin() {  
    // FIX: Prevent redirect loops
    if (redirectInProgress) return;
    
    const base = getBasePath();
    const target = `${base}/login.html`;
    
    // Check if already on login page
    if (window.location.pathname.includes('login.html') || isLoginPage()) {
        return;
    }
    
    redirectInProgress = true;
    console.log('🔄 Redirect ke login:', target);
    
    setTimeout(() => {
        window.location.replace(target);
    }, 500);
}  

function showAccessDenied() {  
    // FIX: Prevent redirect loops
    if (redirectInProgress) return;
    
    redirectInProgress = true;
    const base = getBasePath();  
    
    setTimeout(() => {
        if (userRole === 'admin') {
            window.location.href = `${base}/admin/dashboard.html`;
        } else if (userRole === 'siswa') {
            window.location.href = `${base}/siswa/dashboard.html`;
        } else {
            window.location.href = `${base}/login.html`;  
        }
    }, 1000);
}  

// =======================  
// System Initialization  
// =======================  
async function initializeSystem() {  
    console.log('⚙️ Menginisialisasi ByteWard v0.1.4...');  
    console.log('📍 Base Path:', getBasePath());
    console.log('📍 Current Path:', window.location.pathname);
    console.log('📍 Is Login Page:', isLoginPage());
    
    // FIX: Check Firebase availability
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        showError('Firebase belum dimuat. Silakan refresh halaman.');
        hideAuthLoading();
        return;
    }
    
    showAuthLoading('Mengecek status autentikasi…');  
      
    // Inject profile CSS  
    injectProfileCSS();  
      
    firebaseAuth.onAuthStateChanged(async (user) => {  
        try {  
            if (user) {  
                console.log('👤 User terautentikasi:', user.email);  
                currentUser = user;  
                  
                showAuthLoading('Mengambil data pengguna…');  
                await fetchUserData(user.uid);  
                  
                showAuthLoading('Memverifikasi akses halaman…');  
                const accessGranted = await checkPageAccess();  
                  
                // Create profile button jika bukan halaman login dan akses granted  
                if (!isLoginPage() && accessGranted) {  
                    createProfileButton();  
                }  
                  
                authReady = true;  
                hideAuthLoading();  
                  
            } else {  
                console.log('👤 User belum login');  
                currentUser = null;  
                userRole = null;  
                userData = null;  
                authReady = true;  
                hideAuthLoading();  
                  
                if (!isLoginPage()) {
                    redirectToLogin();  
                }
            }  
        } catch (err) {  
            console.error('❌ Auth flow error:', err);  
            hideAuthLoading();  
            showError('Terjadi kesalahan sistem autentikasi');  
        } finally {
            redirectInProgress = false; // Reset redirect lock
        }
    });  
}  

// =======================  
// Error Handling  
// =======================  
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
            z-index: 10000;  
            max-width: 420px;  
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);  
            font-family: system-ui, -apple-system, sans-serif;  
        `;  
        document.body.appendChild(el);  
    }  
      
    el.textContent = `ByteWard Error: ${message}`;  
    el.style.display = 'block';  
      
    setTimeout(() => (el.style.display = 'none'), 5000);  
}  

// =======================  
// Debug & Testing  
// =======================  
window.debugByteWard = function() {
    console.log('=== ByteWard Debug Info ===');
    console.log('Version: 0.1.4');
    console.log('Current User:', currentUser);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', profileState.isProfileComplete);
    console.log('Base Path:', getBasePath());
    console.log('Is Login Page:', isLoginPage());
    console.log('Current Path:', window.location.pathname);
    console.log('Auth Ready:', authReady);
    console.log('Redirect in Progress:', redirectInProgress);
    console.log('==========================');
};

// =======================  
// Bootstrap System  
// =======================  
document.addEventListener('DOMContentLoaded', () => {  
    setTimeout(() => {  
        if (typeof firebaseAuth === 'undefined') {  
            console.error('❌ Firebase belum siap');  
            showError('Firebase tidak tersedia');  
            return;  
        }  
          
        initializeSystem();  
    }, 300);  
});  

// =======================  
// Global Exports  
// =======================  
window.authLogin = authLogin;  
window.authLogout = authLogout;  
window.checkPageAccess = checkPageAccess;  
window.showProfilePanel = showProfilePanel;  
window.debugByteWard = debugByteWard;

console.log('🛡️ ByteWard v0.1.4 AKTIF. Sistem keamanan dengan profil real-time telah diaktifkan.');  
