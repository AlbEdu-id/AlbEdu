// ByteWard UI Module v0.1.5
    
console.log('🎨 Memuat UI Module...');    
    
// Avatar constants (unchanged)    
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
    
// Profile State (unchanged)    
let profileState = {      
    isProfileComplete: false,      
    selectedAvatar: null,      
    customAvatar: null,      
    tempName: '',      
    isLoading: false,      
    hasChanges: false,    
    autoCloseTriggered: false    
};      
    
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
        <img src="${window.Auth?.userData?.foto_profil || generateGitHubAvatar(window.Auth?.currentUser.email)}"       
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
    if (img && window.Auth?.userData?.foto_profil) {      
        img.src = window.Auth.userData.foto_profil;      
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
                <img src="${window.Auth?.userData?.foto_profil || generateGitHubAvatar(window.Auth?.currentUser.email)}"       
                     alt="Current Avatar"       
                     class="current-avatar"      
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280'">      
                <div class="current-name">${window.Auth?.userData?.nama || window.Auth?.currentUser.displayName || 'Nama belum diisi'}</div>      
            </div>      
                  
            <div class="edit-section">      
                <div class="name-input-group">      
                    <label for="profileName">Nama Lengkap</label>      
                    <input type="text"       
                           id="profileName"       
                           class="name-input"       
                           placeholder="Masukkan nama lengkap"      
                           value="${window.Auth?.userData?.nama || ''}">      
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
    profileState.tempName = window.Auth?.userData?.nama || '';      
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
            const githubUrl = generateGitHubAvatar(window.Auth?.currentUser.email);      
            option.innerHTML = `      
                <img src="${githubUrl}"       
                     alt="${avatar.name}"      
                     onerror="this.parentElement.innerHTML='<div class=\\'option-label\\'>${avatar.name}</div>'">      
            `;      
        } else {      
            option.innerHTML = `<img src="${avatar.url}" alt="${avatar.name}">`;      
        }      
              
        // Check if this is current avatar      
        if (window.Auth?.userData?.foto_profil) {      
            const currentUrl = window.Auth.userData.foto_profil;      
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
    const nameChanged = profileState.tempName !== (window.Auth?.userData?.nama || '');      
          
    let avatarChanged = false;      
    if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {      
        avatarChanged = profileState.customAvatar !== window.Auth?.userData?.foto_profil;      
    } else if (profileState.selectedAvatar === 'github') {      
        const githubUrl = generateGitHubAvatar(window.Auth?.currentUser.email);      
        avatarChanged = githubUrl !== window.Auth?.userData?.foto_profil;      
    } else if (profileState.selectedAvatar) {      
        const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);      
        avatarChanged = selected?.url !== window.Auth?.userData?.foto_profil;      
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
        nameInput.value = window.Auth?.userData?.nama || '';      
        profileState.tempName = window.Auth?.userData?.nama || '';      
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
        if (profileState.tempName && profileState.tempName !== window.Auth?.userData?.nama) {      
            updates.nama = profileState.tempName.trim();      
        }      
              
        // Update avatar if changed      
        let newAvatarUrl = window.Auth?.userData?.foto_profil;      
              
        if (profileState.selectedAvatar === 'custom' && profileState.customAvatar) {      
            newAvatarUrl = profileState.customAvatar;      
        } else if (profileState.selectedAvatar === 'github') {      
            newAvatarUrl = generateGitHubAvatar(window.Auth?.currentUser.email);      
        } else if (profileState.selectedAvatar) {      
            const selected = DEFAULT_AVATARS.find(a => a.id === profileState.selectedAvatar);      
            newAvatarUrl = selected?.url;      
        }      
              
        if (newAvatarUrl && newAvatarUrl !== window.Auth?.userData?.foto_profil) {      
            updates.foto_profil = newAvatarUrl;      
        }      
              
        // Check if profile is now complete      
        const willBeComplete = window.Auth?.checkProfileCompleteness({      
            ...window.Auth.userData,      
            ...updates      
        });      
              
        updates.profilLengkap = willBeComplete;      
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();      
              
        // Save to Firestore      
        await firebaseDb.collection('users').doc(window.Auth?.currentUser.uid).update(updates);      
              
        // Update local state      
        window.Auth.userData = { ...window.Auth.userData, ...updates };      
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
// Enhanced CSS Injection with Base Path    
// =======================      
function injectProfileCSS() {      
    if (document.querySelector('link[href*="profile.css"]')) return;      
          
    const cssPath = window.ByteWard?.buildFullPath(window.ByteWard?.APP_CONFIG.ASSETS.profileCSS);    
    console.log('🎨 Memuat profile CSS dari:', cssPath);    
        
    const link = document.createElement('link');      
    link.rel = 'stylesheet';      
    link.href = cssPath;      
    link.id = 'profile-css';      
          
    // Fallback jika CSS gagal dimuat      
    link.onerror = () => {      
        console.warn('Profile CSS gagal dimuat dari:', cssPath);      
        console.warn('Menggunakan inline styles sebagai fallback');      
        injectFallbackCSS();      
    };      
          
    // Success handler    
    link.onload = () => {    
        console.log('✅ Profile CSS berhasil dimuat');    
    };    
          
    document.head.appendChild(link);      
}      
    
function injectFallbackCSS() {      
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
        .profile-overlay {    
            position: fixed;    
            top: 0;    
            left: 0;    
            width: 100%;    
            height: 100%;    
            background: rgba(0,0,0,0.5);    
            display: none;    
            justify-content: center;    
            align-items: center;    
            z-index: 10000;    
        }    
        .profile-overlay.active {    
            display: flex;    
        }    
        .profile-panel {    
            background: white;    
            border-radius: 12px;    
            width: 90%;    
            max-width: 500px;    
            max-height: 90vh;    
            overflow-y: auto;    
            transform: translateY(20px);    
            opacity: 0;    
            transition: all 0.3s ease;    
        }    
        .profile-panel.active {    
            transform: translateY(0);    
            opacity: 1;    
        }    
    `;      
    document.head.appendChild(style);      
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
// Global Exports      
// =======================      
window.UI = {    
    DEFAULT_AVATARS,    
    profileState,    
    createProfileButton,    
    updateProfileButton,    
    createProfilePanel,    
    initializeProfilePanel,    
    populateAvatarOptions,    
    selectAvatar,    
    handleAvatarUpload,    
    checkForChanges,    
    showProfilePanel,    
    hideProfilePanel,    
    showStatus,    
    saveProfile,    
    updateSaveButtonState,    
    injectProfileCSS,    
    injectFallbackCSS,    
    showAuthLoading,    
    hideAuthLoading,    
    showError,    
    generateGitHubAvatar: function(email) {    
        const hash = email.split('').reduce((acc, char) => {    
            return char.charCodeAt(0) + ((acc << 5) - acc);    
        }, 0);    
        return `https://github.com/identicons/${Math.abs(hash)}.png`;    
    }    
};    
