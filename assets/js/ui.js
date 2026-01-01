// ByteWard UI Module v2.0 - Production Ready with Full Auth Integration
console.log('🚀 Memuat UI Module v2.0 - Production Ready dengan Sistem Profil 3 Mode');

// =======================
// BACKWARD COMPATIBILITY LAYER - WAJIB ADA
// =======================
(function() {
    // Cegah overwrite total window.UI
    if (!window.UI) window.UI = {};
    
    // Simpan fungsi lama jika ada
    const oldUI = { ...window.UI };
    
    // API contract yang diharapkan oleh auth.js lama
    const compatibilityAPI = {
        showAuthLoading: function() {
            // Stub function - tidak error saat dipanggil auth lama
            console.log('[UI v2] showAuthLoading() - compatibility stub');
            return true;
        },
        
        hideAuthLoading: function() {
            // Stub function - tidak error saat dipanggil auth lama
            console.log('[UI v2] hideAuthLoading() - compatibility stub');
            return true;
        },
        
        showStatus: function(message, type = 'success') {
            // Implementasi real untuk showStatus
            if (window.ByteWardUI && window.ByteWardUI.showStatus) {
                return window.ByteWardUI.showStatus(message, type);
            }
            console.log(`[UI v2] Status: ${message} (${type})`);
            return true;
        },
        
        saveProfile: function() {
            // Implementasi real untuk saveProfile
            if (window.ByteWardUI && window.ByteWardUI.saveProfile) {
                return window.ByteWardUI.saveProfile();
            }
            console.log('[UI v2] saveProfile() called');
            return Promise.resolve();
        },
        
        confirmAndLogout: function() {
            // Tampilkan logout modal
            const modal = document.getElementById('logoutModal');
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modal.classList.add('active');
                }, 10);
                return true;
            }
            console.log('[UI v2] confirmAndLogout() - modal not found');
            return false;
        }
    };
    
    // Merge dengan fungsi lama (jika ada)
    Object.assign(window.UI, compatibilityAPI, oldUI);
})();

// =======================
// CONFIGURATION
// =======================
const UI_CONFIG = {
    version: '2.0.0',
    isProduction: true,
    authIntegration: true,
    features: {
        profileSystem: true,
        loadingSystem: true,
        authCompatible: true
    },
    defaults: {
        animationSpeed: 300,
        transitionDuration: 250,
        avatarCount: 20,
        maxFileSize: 5 * 1024 * 1024 // 5MB
    }
};

// =======================
// STATE MANAGEMENT (HANYA UNTUK UI STATE)
// =======================
const UIState = {
    mode: 'view',
    tempName: '',
    selectedAvatar: null,
    customAvatar: null,
    customAvatarPreview: null,
    hasChanges: false,
    isLoading: false,
    isTransitioning: false,
    autoCloseTriggered: false
};

// =======================
// AVATAR MANAGEMENT (PRODUCTION READY)
// =======================
const AvatarSystem = {
    generateAvatars(count = 20) {
        const avatars = [];
        const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles', 
                       'fun-emoji', 'icons', 'identicon', 'initials', 'micah', 'miniavs', 
                       'open-peeps', 'personas', 'pixel-art', 'shapes', 'thumbs'];
        
        for (let i = 1; i <= count; i++) {
            const style = styles[(i - 1) % styles.length];
            avatars.push({
                id: `avatar${i}`,
                name: `Avatar ${i}`,
                url: `https://api.dicebear.com/7.x/${style}/svg?seed=avatar${i}&backgroundColor=6366f1`,
                style: style
            });
        }
        return avatars;
    },

    getDefaultAvatar(seed = 'user') {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1`;
    },

    validateUpload(file) {
        if (!file.type.startsWith('image/')) {
            return { valid: false, error: 'Hanya file gambar yang diperbolehkan' };
        }
        
        if (file.size > UI_CONFIG.defaults.maxFileSize) {
            return { valid: false, error: `Ukuran gambar maksimal ${UI_CONFIG.defaults.maxFileSize / 1024 / 1024}MB` };
        }
        
        return { valid: true };
    }
};

// =======================
// TRANSITION SYSTEM
// =======================
const TransitionManager = {
    async transitionTo(newMode, callback) {
        if (UIState.isTransitioning) return;
        
        const panel = document.getElementById('profilePanel');
        const contentArea = panel?.querySelector('.view-mode, .edit-mode, .edit-avatar-mode');
        
        if (!contentArea) {
            callback();
            return;
        }
        
        UIState.isTransitioning = true;
        
        // Tambah class exit
        contentArea.classList.add('mode-transition-exit');
        
        // Tunggu animasi keluar
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Eksekusi callback (render mode baru)
        callback();
        
        // Tunggu DOM update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const newContent = panel?.querySelector('.view-mode, .edit-mode, .edit-avatar-mode');
        if (newContent) {
            // Tambah class enter (khusus untuk edit avatar mode)
            newContent.classList.add('mode-transition-enter');
            
            // Hapus class setelah animasi selesai
            setTimeout(() => {
                newContent.classList.remove('mode-transition-enter');
                contentArea.classList.remove('mode-transition-exit');
                UIState.isTransitioning = false;
            }, 250);
        } else {
            UIState.isTransitioning = false;
        }
    },

    animatePanelIn(panel) {
        panel.style.transform = 'translateY(0) scale(1)';
        panel.style.opacity = '1';
    },

    animatePanelOut(panel) {
        panel.style.transform = 'translateY(20px) scale(0.97)';
        panel.style.opacity = '0';
    }
};

// =======================
// AUTH INTEGRATION HELPER
// =======================
const AuthIntegration = {
    // Validasi auth system tersedia
    validateAuth() {
        if (!window.Auth) {
            console.error('Auth system not found');
            return false;
        }
        
        if (!window.Auth.currentUser) {
            console.warn('No user logged in');
            return false;
        }
        
        if (!window.Auth.userData) {
            console.warn('User data not loaded');
            return false;
        }
        
        return true;
    },
    
    // Get user data dengan fallback
    getUserData() {
        return window.Auth?.userData || {};
    },
    
    // Get current user dengan fallback
    getCurrentUser() {
        return window.Auth?.currentUser || null;
    },
    
    // Update user data di auth system
    async updateUserData(updates) {
        if (!window.Auth) return false;
        
        try {
            // Update Firestore
            const userId = window.Auth.currentUser?.uid;
            if (!userId) return false;
            
            await firebase.firestore().collection('users').doc(userId).update(updates);
            
            // Update local auth data
            window.Auth.userData = { ...window.Auth.userData, ...updates };
            
            // Trigger update event jika ada
            if (window.Auth.setUserData) {
                window.Auth.setUserData(window.Auth.userData);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to update user data:', error);
            return false;
        }
    }
};

// =======================
// PROFILE BUTTON SYSTEM (AUTH INTEGRATED)
// =======================
function createProfileButton() {
    // Hapus existing
    const existing = document.querySelector('.profile-button-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'profile-button-container';
    container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 10000;
    `;

    const button = document.createElement('button');
    button.className = 'profile-button';
    button.id = 'profileTrigger';
    button.setAttribute('aria-label', 'Buka panel profil');
    button.style.cssText = `
        width: 68px;
        height: 68px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        cursor: pointer;
        padding: 4px;
        position: relative;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: visible;
    `;

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
    });

    // Get avatar dari auth data
    const userData = AuthIntegration.getUserData();
    const avatarUrl = userData.foto_profil || AvatarSystem.getDefaultAvatar(userData.email || 'user');
    
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Profile';
    img.className = 'profile-image';
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid white;
        display: block;
    `;
    
    img.onerror = function() {
        this.src = AvatarSystem.getDefaultAvatar('user');
    };
    
    button.appendChild(img);

    // Profile indicator - berdasarkan profilLengkap dari auth
    if (userData && !userData.profilLengkap) {
        const indicator = document.createElement('div');
        indicator.className = 'profile-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        indicator.textContent = '!';
        indicator.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            width: 26px;
            height: 26px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 900;
            border: 2.5px solid white;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        `;
        button.appendChild(indicator);
    }

    button.addEventListener('click', showProfilePanel);
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateProfileButton() {
    const button = document.getElementById('profileTrigger');
    if (!button) return;

    const userData = AuthIntegration.getUserData();
    const img = button.querySelector('.profile-image');
    
    if (img && userData.foto_profil) {
        const oldSrc = img.src;
        img.src = userData.foto_profil;
        img.onerror = function() {
            if (this.src !== oldSrc) {
                this.src = AvatarSystem.getDefaultAvatar(userData.email || 'user');
            }
        };
    }

    const indicator = button.querySelector('.profile-indicator');
    if (userData.profilLengkap) {
        if (indicator) indicator.remove();
    } else if (!indicator && userData) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'profile-indicator';
        newIndicator.setAttribute('aria-hidden', 'true');
        newIndicator.textContent = '!';
        newIndicator.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            width: 26px;
            height: 26px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 900;
            border: 2.5px solid white;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        `;
        button.appendChild(newIndicator);
    }
}

// =======================
// PANEL CREATION & RENDERING
// =======================
function createProfilePanel() {
    // Remove existing
    const existingOverlay = document.getElementById('profileOverlay');
    if (existingOverlay) existingOverlay.remove();

    const existingModal = document.getElementById('logoutModal');
    if (existingModal) existingModal.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profileOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 20000;
        padding: 16px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create panel
    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'profileTitle');
    panel.style.cssText = `
        width: 100%;
        max-width: 500px;
        background: white;
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
        transform: translateY(40px) scale(0.95);
        opacity: 0;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Create logout modal
    createLogoutModal();
}

function createLogoutModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'logoutModal';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 30000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 16px;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: white;
        border-radius: 28px;
        padding: 32px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
        transform: translateY(40px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    modal.innerHTML = `
        <h3>Konfirmasi Logout</h3>
        <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" id="cancelLogout">
                Batal
            </button>
            <button class="modal-btn modal-btn-confirm" id="confirmLogout">
                Ya, Logout
            </button>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

// =======================
// RENDER FUNCTIONS
// =======================
function renderProfilePanel() {
    const panel = document.getElementById('profilePanel');
    if (!panel) return;

    let content = '';
    
    if (UIState.isLoading && UIState.mode === 'view') {
        content = renderSkeleton();
    } else {
        switch (UIState.mode) {
            case 'view':
                content = renderViewMode();
                break;
            case 'edit':
                content = renderEditMode();
                break;
            case 'editAvatar':
                content = renderEditAvatarMode();
                break;
        }
    }

    const title = getPanelTitle();
    panel.innerHTML = `
        <div class="profile-header">
            <h2 id="profileTitle">${title}</h2>
            <button class="close-profile" id="closeProfile" aria-label="Tutup panel">&times;</button>
        </div>
        ${content}
    `;

    bindPanelEvents();
}

function getPanelTitle() {
    const titles = {
        'view': 'Profil Saya',
        'edit': 'Edit Profil',
        'editAvatar': 'Pilih Avatar'
    };
    return titles[UIState.mode] || 'Profil';
}

function renderSkeleton() {
    return `
        <div class="view-mode" style="padding: 24px; opacity: 0.8;">
            <div class="avatar-section" style="text-align: center; margin-bottom: 28px;">
                <div class="skeleton skeleton-circle" style="width: 140px; height: 140px; margin: 0 auto 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 50%;"></div>
            </div>
            
            <div class="user-info" style="text-align: center; margin-bottom: 32px;">
                <div class="skeleton skeleton-text" style="width: 60%; height: 32px; margin: 0 auto 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px;"></div>
                <div class="skeleton skeleton-text short" style="width: 40%; height: 20px; margin: 0 auto 24px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px;"></div>
                
                <div style="background: #f8fafc; border-radius: 20px; padding: 20px; display: inline-block; min-width: 180px; border: 1px solid #e5e7eb;">
                    <div class="skeleton skeleton-text" style="height: 42px; margin-bottom: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px;"></div>
                    <div class="skeleton skeleton-text" style="width: 70%; height: 14px; margin: 0 auto; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 7px;"></div>
                </div>
            </div>
            
            <div class="view-actions" style="max-width: 320px; margin: 0 auto;">
                <div class="skeleton skeleton-text" style="height: 56px; margin-bottom: 16px; border-radius: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div class="skeleton skeleton-text" style="height: 56px; border-radius: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
            </div>
        </div>
    `;
}

function renderViewMode() {
    const user = AuthIntegration.getUserData();
    const avatarUrl = user.foto_profil || AvatarSystem.getDefaultAvatar(user.email || 'user');
    
    return `
        <div class="view-mode">
            <div class="avatar-section">
                <img src="${avatarUrl}" 
                     alt="Avatar ${user.nama}" 
                     class="view-avatar"
                     onerror="this.src='${AvatarSystem.getDefaultAvatar('user')}'">
                ${!user.profilLengkap ? '<div class="incomplete-badge" aria-label="Profil belum lengkap">!</div>' : ''}
            </div>
            
            <div class="user-info">
                <h3 class="user-name">${user.nama || 'Nama belum diisi'}</h3>
                <p class="user-email">${user.email || 'Email tidak tersedia'}</p>
                <div class="user-stats">
                    <div class="stat-item">
                        <span class="stat-value">${user.totalUjian || 0}</span>
                        <span class="stat-label">Ujian Diselesaikan</span>
                    </div>
                </div>
            </div>
            
            <div class="view-actions">
                <button class="btn btn-edit" id="editProfileBtn">
                    <span>Edit Profil</span>
                </button>
                <button class="btn btn-logout" id="logoutBtn">
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    `;
}

function renderEditMode() {
    const user = AuthIntegration.getUserData();
    const avatarUrl = user.foto_profil || AvatarSystem.getDefaultAvatar(user.email || 'user');
    const hasChanges = UIState.hasChanges;
    
    return `
        <div class="edit-mode">
            <div class="edit-avatar-section">
                <img src="${avatarUrl}" 
                     alt="Avatar ${user.nama}" 
                     class="edit-avatar"
                     id="editAvatarImage"
                     onerror="this.src='${AvatarSystem.getDefaultAvatar('user')}'">
                <button class="avatar-edit-btn" id="editAvatarBtn">
                    <span>Ubah Avatar</span>
                </button>
            </div>
            
            <div class="edit-form">
                <div class="form-group">
                    <label for="editName">Nama Lengkap</label>
                    <input type="text" 
                           id="editName" 
                           value="${user.nama || ''}" 
                           placeholder="Masukkan nama lengkap"
                           aria-label="Nama lengkap">
                </div>
            </div>
            
            <div class="status-message" id="statusMessage" role="alert"></div>
            
            <div class="edit-actions">
                <button class="btn btn-primary" id="saveProfileBtn" ${hasChanges ? '' : 'disabled'} aria-label="Simpan perubahan">
                    ${UIState.isLoading ? 
                        '<div class="loading-container"><span class="loading-spinner"></span><span>Menyimpan...</span></div>' : 
                        '<span>Simpan</span>'}
                </button>
                <button class="btn btn-secondary" id="cancelEditBtn">
                    <span>Batal</span>
                </button>
            </div>
        </div>
    `;
}

function renderEditAvatarMode() {
    const avatars = AvatarSystem.generateAvatars(20);
    
    return `
        <div class="edit-avatar-mode">
            <h3>Pilih Avatar</h3>
            
            ${UIState.customAvatarPreview ? `
            <div class="custom-avatar-preview active" id="customAvatarPreviewContainer">
                <div class="preview-container">
                    <div class="preview-title">Preview Avatar Custom</div>
                    <img src="${UIState.customAvatarPreview}" 
                         alt="Preview avatar custom" 
                         class="preview-image">
                </div>
            </div>
            ` : ''}
            
            <div class="avatar-grid" id="avatarGrid" role="listbox" aria-label="Pilihan avatar">
                ${avatars.map(avatar => `
                    <div class="avatar-item ${UIState.selectedAvatar === avatar.id ? 'selected' : ''}" 
                         data-id="${avatar.id}"
                         role="option"
                         aria-label="${avatar.name}"
                         aria-selected="${UIState.selectedAvatar === avatar.id}">
                        <img src="${avatar.url}" 
                             alt="${avatar.name}"
                             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.id}&backgroundColor=6366f1'">
                    </div>
                `).join('')}
            </div>
            
            <div class="upload-avatar">
                <label for="avatarUpload" class="btn-upload">
                    <span>Unggah Avatar Custom</span>
                </label>
                <input type="file" 
                       id="avatarUpload" 
                       accept="image/*" 
                       style="display: none;"
                       aria-label="Unggah gambar avatar">
            </div>
            
            <div class="edit-avatar-actions">
                <button class="btn-back" id="backToEditBtn">
                    <span>Kembali ke Edit Mode</span>
                </button>
            </div>
        </div>
    `;
}

// =======================
// EVENT BINDING
// =======================
function bindPanelEvents() {
    // Close button
    const closeBtn = document.getElementById('closeProfile');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => hideProfilePanel());
    }

    // Overlay click
    const overlay = document.getElementById('profileOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideProfilePanel();
            }
        });
    }

    // Mode-specific events
    switch (UIState.mode) {
        case 'view':
            bindViewModeEvents();
            break;
        case 'edit':
            bindEditModeEvents();
            break;
        case 'editAvatar':
            bindEditAvatarModeEvents();
            break;
    }
}

function bindViewModeEvents() {
    // Edit Profile button
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', async () => {
            await TransitionManager.transitionTo('edit', () => {
                UIState.mode = 'edit';
                UIState.tempName = AuthIntegration.getUserData().nama || '';
                renderProfilePanel();
            });
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => showLogoutModal());
    }
}

function bindEditModeEvents() {
    // Name input
    const nameInput = document.getElementById('editName');
    if (nameInput) {
        const userData = AuthIntegration.getUserData();
        nameInput.value = userData.nama || '';
        
        nameInput.addEventListener('input', (e) => {
            UIState.tempName = e.target.value;
            UIState.hasChanges = 
                UIState.tempName !== (userData.nama || '') ||
                UIState.selectedAvatar !== null ||
                UIState.customAvatar !== null;
            updateSaveButton();
        });
        
        // Auto-focus input nama
        setTimeout(() => nameInput.focus(), 50);
    }

    // Edit Avatar button
    const editAvatarBtn = document.getElementById('editAvatarBtn');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', async () => {
            await TransitionManager.transitionTo('editAvatar', () => {
                UIState.mode = 'editAvatar';
                renderProfilePanel();
            });
        });
    }

    // Save button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveProfile());
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
            await TransitionManager.transitionTo('view', () => {
                UIState.mode = 'view';
                UIState.hasChanges = false;
                UIState.selectedAvatar = null;
                UIState.customAvatar = null;
                UIState.customAvatarPreview = null;
                renderProfilePanel();
            });
        });
    }
}

function bindEditAvatarModeEvents() {
    // Avatar selection dengan micro-interaction
    const avatarItems = document.querySelectorAll('.avatar-item');
    avatarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove selected class from all
            avatarItems.forEach(i => {
                i.classList.remove('selected');
                i.setAttribute('aria-selected', 'false');
            });
            
            // Add to clicked dengan feedback visual
            item.classList.add('selected');
            item.setAttribute('aria-selected', 'true');
            
            // Store selection
            const avatarId = item.dataset.id;
            UIState.selectedAvatar = avatarId;
            UIState.customAvatar = null;
            UIState.customAvatarPreview = null;
            UIState.hasChanges = true;
            
            // Hide custom preview
            const previewContainer = document.getElementById('customAvatarPreviewContainer');
            if (previewContainer) {
                previewContainer.classList.remove('active');
                setTimeout(() => {
                    previewContainer.style.display = 'none';
                }, 300);
            }
        });
    });

    // Custom upload
    const uploadInput = document.getElementById('avatarUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => handleAvatarUpload(e));
        
        // Link button ke input file
        const uploadBtn = document.querySelector('.btn-upload');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                uploadInput.click();
            });
        }
    }

    // Back button dengan transisi
    const backBtn = document.getElementById('backToEditBtn');
    if (backBtn) {
        backBtn.addEventListener('click', async () => {
            await TransitionManager.transitionTo('edit', () => {
                UIState.mode = 'edit';
                renderProfilePanel();
                updateAvatarPreview();
            });
        });
    }
}

// =======================
// AVATAR HANDLING
// =======================
function updateAvatarPreview() {
    const avatarImg = document.getElementById('editAvatarImage');
    if (!avatarImg) return;

    if (UIState.customAvatar) {
        avatarImg.src = UIState.customAvatar;
    } else if (UIState.selectedAvatar) {
        const avatars = AvatarSystem.generateAvatars();
        const selected = avatars.find(a => a.id === UIState.selectedAvatar);
        if (selected) {
            avatarImg.src = selected.url;
        }
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = AvatarSystem.validateUpload(file);
    if (!validation.valid) {
        showStatus(validation.error, 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        UIState.customAvatar = e.target.result;
        UIState.customAvatarPreview = e.target.result;
        UIState.selectedAvatar = null;
        UIState.hasChanges = true;
        
        // Update selected visual
        const avatarItems = document.querySelectorAll('.avatar-item');
        avatarItems.forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('aria-selected', 'false');
        });
        
        // Show preview
        showStatus('Avatar custom berhasil diunggah!', 'success');
        
        // Render preview immediately
        const previewContainer = document.createElement('div');
        previewContainer.id = 'customAvatarPreviewContainer';
        previewContainer.className = 'custom-avatar-preview active';
        previewContainer.innerHTML = `
            <div class="preview-container">
                <div class="preview-title">Preview Avatar Custom</div>
                <img src="${e.target.result}" 
                     alt="Preview avatar custom" 
                     class="preview-image">
            </div>
        `;
        
        const existingPreview = document.getElementById('customAvatarPreviewContainer');
        const avatarGrid = document.getElementById('avatarGrid');
        if (existingPreview && avatarGrid && avatarGrid.parentNode) {
            existingPreview.replaceWith(previewContainer);
        } else if (avatarGrid && avatarGrid.parentNode) {
            avatarGrid.parentNode.insertBefore(previewContainer, avatarGrid);
        }
        
        // Reset file input
        event.target.value = '';
    };
    reader.readAsDataURL(file);
}

// =======================
// SAVE PROFILE (PRODUCTION READY)
// =======================
function updateSaveButton() {
    const saveBtn = document.getElementById('saveProfileBtn');
    if (!saveBtn) return;

    saveBtn.disabled = !UIState.hasChanges || UIState.isLoading;
    
    if (UIState.hasChanges && !UIState.isLoading) {
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';
    } else {
        saveBtn.style.opacity = '0.6';
        saveBtn.style.cursor = 'not-allowed';
    }
}

async function saveProfile() {
    // Validasi auth system
    if (!AuthIntegration.validateAuth()) {
        showStatus('Sistem auth tidak siap. Silakan login ulang.', 'error');
        return;
    }

    if (!UIState.hasChanges || UIState.isLoading) return;

    // Check online status
    if (!navigator.onLine) {
        showStatus('Anda sedang offline. Periksa koneksi internet.', 'error');
        return;
    }

    try {
        // Start loading
        UIState.isLoading = true;
        updateSaveButton();

        const userData = AuthIntegration.getUserData();
        const updates = {};
        
        // Update name if changed
        if (UIState.tempName !== undefined && UIState.tempName !== userData.nama) {
            const cleanName = UIState.tempName.trim();
            if (cleanName.length > 0) {
                updates.nama = cleanName;
            } else {
                throw new Error('Nama tidak boleh kosong');
            }
        }

        // Update avatar
        let newAvatarUrl = userData.foto_profil;
        if (UIState.customAvatar) {
            newAvatarUrl = UIState.customAvatar;
        } else if (UIState.selectedAvatar) {
            const selected = AvatarSystem.generateAvatars().find(a => a.id === UIState.selectedAvatar);
            newAvatarUrl = selected?.url || '';
        }

        if (newAvatarUrl && newAvatarUrl !== userData.foto_profil) {
            updates.foto_profil = newAvatarUrl;
        }

        // Determine if profile is complete
        const finalName = updates.nama || userData.nama || '';
        const finalAvatar = updates.foto_profil || userData.foto_profil || '';
        
        const isNameValid = typeof finalName === 'string' && finalName.trim().length > 0;
        const isAvatarValid = typeof finalAvatar === 'string' && finalAvatar.trim().length > 0;
        
        updates.profilLengkap = isNameValid && isAvatarValid;
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        // Remove fields that shouldn't be updated
        delete updates.email;
        delete updates.peran;
        delete updates.id;
        delete updates.createdAt;

        // Update Firestore dan Auth
        const success = await AuthIntegration.updateUserData(updates);
        
        if (!success) {
            throw new Error('Gagal menyimpan ke database');
        }

        // Reset UI state
        UIState.hasChanges = false;
        UIState.selectedAvatar = null;
        UIState.customAvatar = null;
        UIState.customAvatarPreview = null;
        UIState.isLoading = false;

        // Update UI
        updateProfileButton();
        UIState.mode = 'view';
        renderProfilePanel();

        // Tampilkan success message
        showStatus('Profil berhasil disimpan!', 'success');
        
        // Auto close jika profil lengkap
        if (updates.profilLengkap && !UIState.autoCloseTriggered) {
            UIState.autoCloseTriggered = true;
            setTimeout(() => {
                hideProfilePanel();
                UIState.autoCloseTriggered = false;
            }, 1500);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        
        UIState.isLoading = false;
        updateSaveButton();
        
        let userMessage = 'Gagal menyimpan profil.';
        if (error.code === 'permission-denied') {
            userMessage = 'Anda tidak memiliki izin untuk mengubah data ini.';
        } else if (error.message) {
            userMessage += ' ' + error.message;
        }
        
        showStatus(userMessage, 'error');
    }
}

// =======================
// STATUS MESSAGES
// =======================
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;

    const icon = type === 'success' ? '✓' : '✗';
    statusEl.innerHTML = `
        <span class="status-icon">${icon}</span>
        <span>${message}</span>
    `;
    statusEl.className = `status-message status-${type}`;
    statusEl.style.cssText = `
        padding: 16px 20px;
        border-radius: 16px;
        margin-bottom: 24px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        line-height: 1.5;
        ${type === 'success' ? 
            'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' : 
            'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;'}
    `;

    if (type === 'success') {
        setTimeout(() => {
            statusEl.className = 'status-message';
            statusEl.innerHTML = '';
            statusEl.style.cssText = 'display: none;';
        }, 3000);
    }
}

// =======================
// LOGOUT SYSTEM
// =======================
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (!modal) return;

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.classList.add('active');
    }, 10);

    // Bind modal events
    const cancelBtn = document.getElementById('cancelLogout');
    const confirmBtn = document.getElementById('confirmLogout');
    
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        };
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                performLogout();
            }, 300);
        };
    }

    // Escape key untuk close modal
    const handleEscKey = (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            document.removeEventListener('keydown', handleEscKey);
        }
    };
    document.addEventListener('keydown', handleEscKey);
}

async function performLogout() {
    try {
        // Tutup panel profil
        hideProfilePanel();
        
        // Panggil fungsi logout dari Auth system
        if (window.Auth && window.Auth.signOut) {
            await window.Auth.signOut();
            
            // Tampilkan toast sukses
            if (window.UI && window.UI.Toast) {
                window.UI.Toast.success('Berhasil logout!');
            }
            
            // Redirect ke halaman login
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
            
        } else if (window.firebaseAuth) {
            // Fallback ke Firebase auth langsung
            await window.firebaseAuth.signOut();
            
            if (window.UI && window.UI.Toast) {
                window.UI.Toast.success('Berhasil logout!');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error('Auth system tidak ditemukan');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showStatus('Gagal logout: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
}

// =======================
// PANEL CONTROLS
// =======================
function showProfilePanel() {
    // Reset state setiap kali membuka panel
    UIState.mode = 'view';
    UIState.hasChanges = false;
    UIState.selectedAvatar = null;
    UIState.customAvatar = null;
    UIState.customAvatarPreview = null;
    
    createProfilePanel();
    renderProfilePanel();
    
    const overlay = document.getElementById('profileOverlay');
    if (!overlay) return;
    
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
        
        const panel = document.getElementById('profilePanel');
        if (panel) {
            panel.style.transform = 'translateY(0) scale(1)';
            panel.style.opacity = '1';
        }
    }, 10);
    
    // Focus trap untuk aksesibilitas
    setTimeout(() => {
        const closeBtn = document.getElementById('closeProfile');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

function hideProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');
    
    if (panel) {
        panel.style.transform = 'translateY(40px) scale(0.95)';
        panel.style.opacity = '0';
    }
    
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
            
            // Reset file inputs
            const uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) uploadInput.value = '';
        }, 300);
    }
    
    // Reset state
    UIState.mode = 'view';
    UIState.hasChanges = false;
    UIState.selectedAvatar = null;
    UIState.customAvatar = null;
    UIState.customAvatarPreview = null;
    
    // Kembalikan fokus ke tombol profil
    const profileBtn = document.getElementById('profileTrigger');
    if (profileBtn) profileBtn.focus();
}

// =======================
// KEYBOARD NAVIGATION
// =======================
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC key untuk menutup panel
        if (e.key === 'Escape') {
            const overlay = document.getElementById('profileOverlay');
            const modal = document.getElementById('logoutModal');
            
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
                e.preventDefault();
            } else if (overlay && overlay.classList.contains('active')) {
                hideProfilePanel();
                e.preventDefault();
            }
        }
        
        // Tab key untuk focus trap
        if (e.key === 'Tab' && document.getElementById('profileOverlay')?.classList.contains('active')) {
            const focusableElements = document.querySelectorAll('#profilePanel button, #profilePanel input, #profilePanel [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// =======================
// CSS INJECTION
// =======================
function injectProfileCSS() {
    if (document.querySelector('#profile-css')) return;
    
    const style = document.createElement('style');
    style.id = 'profile-css';
    style.textContent = `
        /* ==================== ANIMASI HALUS ==================== */
        .profile-overlay.active .profile-panel {
            animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes panelIn {
            0% {
                transform: translateY(20px) scale(0.97);
                opacity: 0;
            }
            100% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }

        .mode-transition-enter {
            animation: modeFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .mode-transition-exit {
            animation: modeFadeOut 0.2s ease forwards;
        }

        @keyframes modeFadeIn {
            0% {
                opacity: 0;
                transform: translateY(12px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes modeFadeOut {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-8px);
            }
        }

        /* Micro-interaction avatar selection */
        .avatar-item {
            transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .avatar-item.selected {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 
                        0 6px 20px rgba(99, 102, 241, 0.15);
            transform: scale(1.05);
        }

        /* Ripple feedback untuk tombol */
        .btn {
            transition: transform 0.12s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .btn:active {
            transform: scale(0.98);
        }

        .btn-primary:active:not(:disabled) {
            transform: translateY(-1px) scale(0.98);
        }

        /* Skeleton loading */
        .skeleton {
            background: linear-gradient(
                90deg,
                #f0f0f0 25%,
                #e0e0e0 50%,
                #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 16px;
        }

        .skeleton-circle {
            border-radius: 50%;
        }

        .skeleton-text {
            height: 16px;
            margin-bottom: 12px;
        }

        .skeleton-text:last-child {
            margin-bottom: 0;
        }

        .skeleton-text.short {
            width: 60%;
        }

        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .profile-panel,
            .mode-transition-enter,
            .mode-transition-exit,
            .edit-avatar-mode.mode-transition-enter,
            .avatar-item,
            .btn,
            .profile-indicator,
            .skeleton {
                animation: none !important;
                transition: none !important;
            }
            
            .profile-overlay.active .profile-panel {
                transform: none;
                opacity: 1;
            }
            
            .avatar-item.selected {
                transform: none;
            }
        }

        /* ==================== PROFILE HEADER ==================== */
        .profile-header {
            padding: 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .profile-header h2 {
            font-size: clamp(20px, 2vw, 28px);
            font-weight: 700;
            margin: 0;
            line-height: 1.2;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .close-profile {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            font-family: inherit;
        }

        .close-profile:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        /* ==================== VIEW MODE ==================== */
        .view-mode {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .avatar-section {
            text-align: center;
            margin-bottom: 28px;
            position: relative;
        }

        .view-avatar {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            border: 6px solid white;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .incomplete-badge {
            position: absolute;
            top: 10px;
            right: calc(50% - 70px);
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 900;
            border: 3px solid white;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .user-info {
            text-align: center;
            margin-bottom: 32px;
        }

        .user-name {
            font-size: clamp(24px, 3vw, 32px);
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
            line-height: 1.2;
            word-break: break-word;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .user-email {
            font-size: clamp(14px, 1.5vw, 16px);
            color: #6b7280;
            margin-bottom: 24px;
            word-break: break-all;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .user-stats {
            background: #f8fafc;
            border-radius: 20px;
            padding: 20px;
            display: inline-block;
            border: 1px solid #e5e7eb;
            min-width: 180px;
        }

        .stat-item {
            text-align: center;
        }

        .stat-value {
            display: block;
            font-size: clamp(32px, 4vw, 42px);
            font-weight: 800;
            color: #6366f1;
            line-height: 1;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .stat-label {
            font-size: clamp(13px, 1.5vw, 14px);
            color: #6b7280;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .view-actions {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 320px;
            margin: 0 auto;
        }

        /* ==================== EDIT MODE ==================== */
        .edit-mode {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .edit-avatar-section {
            text-align: center;
            margin-bottom: 28px;
        }

        .edit-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .edit-avatar:hover {
            transform: scale(1.05);
            box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2);
            border-color: #6366f1;
        }

        .avatar-edit-btn {
            background: none;
            border: none;
            color: #6366f1;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            padding: 8px 16px;
            border-radius: 10px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 auto;
            font-family: inherit;
        }

        .avatar-edit-btn:hover {
            background: rgba(99, 102, 241, 0.1);
        }

        .edit-form {
            margin-bottom: 32px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .form-group input {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            font-family: inherit;
        }

        .form-group input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .edit-actions {
            display: flex;
            gap: 16px;
            max-width: 400px;
            margin: 0 auto;
        }

        @media (max-width: 768px) {
            .edit-actions {
                flex-direction: column;
                gap: 12px;
                max-width: 100%;
            }
        }

        /* ==================== EDIT AVATAR MODE ==================== */
        .edit-avatar-mode {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .edit-avatar-mode h3 {
            font-size: clamp(18px, 2vw, 22px);
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
            line-height: 1.3;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .avatar-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
            padding: 8px;
        }

        @media (max-width: 768px) {
            .avatar-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                padding: 4px;
            }
        }

        @media (max-width: 480px) {
            .avatar-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
        }

        .avatar-item {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            border: 3px solid transparent;
            background: #f8fafc;
            position: relative;
        }

        .avatar-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        /* ==================== CUSTOM AVATAR PREVIEW ==================== */
        .custom-avatar-preview {
            width: 100%;
            display: none;
            margin: 0 auto 28px;
        }

        .custom-avatar-preview.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .preview-container {
            position: relative;
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            background: #f8fafc;
        }

        .preview-title {
            position: absolute;
            top: 12px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
            z-index: 2;
            opacity: 0.8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .preview-image {
            width: 100%;
            height: 280px;
            object-fit: cover;
            display: block;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .upload-avatar {
            text-align: center;
            margin-bottom: 28px;
            padding: 0 16px;
        }

        .edit-avatar-actions {
            display: flex;
            justify-content: center;
            padding: 0 16px;
        }

        /* ==================== BUTTON STYLES ==================== */
        .btn {
            padding: 18px 32px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            font-family: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 56px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            flex: 1;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            flex: 1;
        }

        .btn-danger:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);
        }

        .btn-edit {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
        }

        .btn-edit:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
        }

        .btn-logout {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }

        .btn-logout:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);
        }

        .btn-back {
            padding: 14px 28px;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 16px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            max-width: 280px;
            font-family: inherit;
        }

        .btn-back:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }

        .btn-upload {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px 32px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 16px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            font-family: inherit;
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
        }

        .btn-upload:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
        }

        /* ==================== LOADING STATES ==================== */
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            flex-shrink: 0;
            margin: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        /* ==================== SCROLLBAR STYLING ==================== */
        .profile-panel::-webkit-scrollbar {
            width: 6px;
        }

        .profile-panel::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        .profile-panel::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        .profile-panel::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* ==================== MODAL STYLES ==================== */
        .modal h3 {
            font-size: clamp(18px, 2vw, 22px);
            font-weight: 700;
            margin-bottom: 16px;
            color: #1f2937;
            line-height: 1.3;
        }
        
        .modal p {
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.6;
            font-size: 15px;
        }
        
        .modal-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
        }
        
        .modal-btn {
            padding: 14px 24px;
            border-radius: 16px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
        }
        
        .modal-btn-cancel {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }
        
        .modal-btn-cancel:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }
        
        .modal-btn-confirm {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        
        .modal-btn-confirm:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
        }
        
        @media (max-width: 480px) {
            .modal-actions {
                flex-direction: column;
                gap: 12px;
            }
        }

        /* ==================== Hover state untuk desktop avatar grid ==================== */
        @media (hover: hover) and (min-width: 769px) {
            .avatar-item:hover:not(.selected) {
                transform: scale(1.03);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            }
        }
    `;
    document.head.appendChild(style);
}

// =======================
// INITIALIZATION
// =======================
function initializeUISystem() {
    console.log(`🚀 Initializing ByteWard UI v${UI_CONFIG.version} (Production Ready)...`);
    
    try {
        // Inject CSS
        injectProfileCSS();
        
        // Initialize keyboard navigation
        initKeyboardNavigation();
        
        // Setup auth monitoring
        let authCheckInterval = setInterval(() => {
            if (window.Auth) {
                clearInterval(authCheckInterval);
                
                // Jika user login, buat profile button
                if (window.Auth.currentUser) {
                    setTimeout(() => {
                        if (!document.getElementById('profileTrigger')) {
                            createProfileButton();
                        }
                    }, 500);
                }
                
                // Setup user data update listener
                if (typeof window.Auth.setUserData === 'function') {
                    const originalSetUserData = window.Auth.setUserData;
                    window.Auth.setUserData = function(data) {
                        const result = originalSetUserData.call(this, data);
                        updateProfileButton();
                        return result;
                    };
                }
            }
        }, 100);
        
        console.log('✅ ByteWard UI v2.0 Production Ready initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize UI System:', error);
    }
}

// =======================
// PUBLIC API
// =======================
window.ByteWardUI = window.ByteWardUI || {};
Object.assign(window.ByteWardUI, {
    config: UI_CONFIG,
    state: UIState,
    showProfilePanel,
    hideProfilePanel,
    updateProfileButton,
    saveProfile,
    showStatus,
    initialize: initializeUISystem
});

// =======================
// AUTH STATE CHANGE HANDLER
// =======================
function setupAuthListeners() {
    // Monitor perubahan window.Auth.currentUser
    let lastAuthState = null;
    
    const checkAuthState = setInterval(() => {
        if (window.Auth && window.Auth.currentUser !== lastAuthState) {
            lastAuthState = window.Auth.currentUser;
            
            if (window.Auth.currentUser) {
                // User logged in - create profile button
                setTimeout(() => {
                    if (!document.getElementById('profileTrigger')) {
                        createProfileButton();
                    }
                }, 500);
            } else {
                // User logged out - remove profile button
                const profileBtn = document.querySelector('.profile-button-container');
                if (profileBtn) {
                    profileBtn.remove();
                }
            }
        }
    }, 1000);
}

// =======================
// STARTUP
// =======================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeUISystem();
        setupAuthListeners();
    });
} else {
    setTimeout(() => {
        initializeUISystem();
        setupAuthListeners();
    }, 100);
}

console.log(`🎨 ByteWard UI Module v${UI_CONFIG.version} - Production Ready dengan Auth Integration`);
