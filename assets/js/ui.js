// ByteWard UI Module v0.5.4 - Production Ready with Auth System Integration
console.log('🎨 Memuat UI Module v0.5.4 - Sistem berbasis Auth dengan 3 Mode Profil');

// =======================
// MODULE STRUCTURE (FIXED)
// =======================
window.UI = window.UI || {};

// =======================
// AUTH UI (BACKWARD COMPATIBLE)
// =======================
UI.showAuthLoading = function(text) {
    text = text || 'Memverifikasi sesi login...';
    
    let el = document.getElementById('loadingIndicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.className = 'loading-indicator';
        el.innerHTML = `
            <div class="block-loader">
                <div class="block-block" style="--i:0"></div>
                <div class="block-block" style="--i:1"></div>
                <div class="block-block" style="--i:2"></div>
                <div class="block-block" style="--i:3"></div>
                <div class="block-block" style="--i:4"></div>
            </div>
            <div class="loading-text">${text}</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        document.body.appendChild(el);
        
        // Inject loading CSS
        if (!document.querySelector('#loading-css')) {
            const style = document.createElement('style');
            style.id = 'loading-css';
            style.textContent = `
                .loading-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
                    flex-direction: column;
                    backdrop-filter: blur(4px);
                    transition: opacity 0.3s ease;
                }
                .block-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 60px;
                }
                .block-block {
                    width: 12px;
                    height: 40px;
                    background: linear-gradient(to bottom, #3b82f6, #2563eb);
                    border-radius: 4px;
                    animation: block-bounce 1.8s ease-in-out infinite;
                    animation-delay: calc(var(--i) * 0.15s);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }
                .block-block:nth-child(odd) {
                    background: linear-gradient(to bottom, #1d4ed8, #3b82f6);
                }
                .block-block:nth-child(3) { width: 14px; height: 45px; }
                @keyframes block-bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-15px); }
                }
                .loading-text {
                    margin-top: 30px;
                    color: #1e293b;
                    font-size: 16px;
                    font-weight: 500;
                    text-align: center;
                    max-width: 300px;
                    line-height: 1.5;
                }
                .progress-bar {
                    width: 200px;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 2px;
                    margin-top: 20px;
                    overflow: hidden;
                }
                .progress-fill {
                    width: 40%;
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #2563eb);
                    border-radius: 2px;
                    animation: progress-shift 2s ease-in-out infinite;
                }
                @keyframes progress-shift {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(200%); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    el.style.display = 'flex';
    const textEl = el.querySelector('.loading-text');
    if (textEl) textEl.textContent = text;
};

UI.hideAuthLoading = function() {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
        el.style.display = 'none';
        el.style.opacity = '1';
    }, 300);
};

UI.showLoginError = function(message) {
    console.error('Login error:', message);
    
    // Use existing toast system if available
    if (window.UI.Toast) {
        window.UI.Toast.error(message, 4000);
    } else {
        // Fallback alert
        alert('Login Error: ' + message);
    }
    
    // Ensure loading is hidden
    this.hideAuthLoading();
};

UI.afterLogin = function() {
    console.log('✅ Login berhasil, mempersiapkan UI...');
    
    // Create profile button
    setTimeout(() => {
        UI.Profile.init();
        
        // Update any existing UI
        if (window.Auth?.currentUser) {
            console.log('🔄 Memperbarui UI setelah login');
        }
    }, 500);
};

UI.afterLogout = function() {
    console.log('✅ Logout berhasil, membersihkan UI...');
    
    // Remove profile button
    const profileButton = document.querySelector('.profile-button-container');
    if (profileButton) profileButton.remove();
    
    // Close profile panel if open
    UI.Profile.close();
    
    // Clean up any UI elements
    const overlay = document.getElementById('profileOverlay');
    if (overlay) overlay.remove();
    
    const logoutModal = document.getElementById('logoutModal');
    if (logoutModal) logoutModal.remove();
};

// =======================
// ANIMATION SYSTEM (From PrototypeV2)
// =======================
UI.Animate = {
    panelIn: function(panel) {
        if (!panel) return;
        
        // Reset untuk animasi masuk
        panel.style.transform = 'translateY(20px) scale(0.97)';
        panel.style.opacity = '0';
        
        requestAnimationFrame(() => {
            panel.style.transition = 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
            panel.style.transform = 'translateY(0) scale(1)';
            panel.style.opacity = '1';
        });
    },
    
    panelOut: function(panel, callback) {
        if (!panel) {
            if (callback) callback();
            return;
        }
        
        panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        panel.style.transform = 'translateY(20px) scale(0.97)';
        panel.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    },
    
    modeTransition: function(oldElement, newElement, direction = 'next', callback) {
        if (!oldElement || !newElement) {
            if (callback) callback();
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            // Set initial states
            oldElement.style.position = 'absolute';
            oldElement.style.width = '100%';
            newElement.style.position = 'relative';
            newElement.style.opacity = '0';
            newElement.style.transform = direction === 'next' ? 'translateX(20px)' : 'translateX(-20px)';
            
            // Animate old element out
            oldElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            oldElement.style.opacity = '0';
            oldElement.style.transform = direction === 'next' ? 'translateX(-20px)' : 'translateX(20px)';
            
            setTimeout(() => {
                // Animate new element in
                newElement.style.transition = 'opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
                newElement.style.opacity = '1';
                newElement.style.transform = 'translateX(0)';
                
                setTimeout(() => {
                    // Cleanup
                    oldElement.style.position = '';
                    oldElement.style.width = '';
                    oldElement.style.opacity = '';
                    oldElement.style.transform = '';
                    oldElement.style.transition = '';
                    
                    newElement.style.position = '';
                    newElement.style.opacity = '';
                    newElement.style.transform = '';
                    newElement.style.transition = '';
                    
                    if (callback) callback();
                    resolve();
                }, 250);
            }, 200);
        });
    }
};

// =======================
// AVATAR SYSTEM (From PrototypeV2 - UI only)
// =======================
const AvatarSystem = {
    generateAvatars: function(count = 20) {
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
    
    getDefaultAvatar: function(seed = 'user') {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1`;
    },
    
    validateUpload: function(file) {
        if (!file.type.startsWith('image/')) {
            return { valid: false, error: 'Hanya file gambar yang diperbolehkan' };
        }
            
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { valid: false, error: `Ukuran gambar maksimal ${maxSize / 1024 / 1024}MB` };
        }
            
        return { valid: true };
    }
};

// =======================
// PROFILE SYSTEM (CORE v0.5.4)
// =======================
UI.Profile = {
    init: function() {
        console.log('🔄 Menginisialisasi Profile System v0.5.4');
        
        // Inject CSS jika belum ada
        this.injectProfileCSS();
        
        // Create profile button
        this.createProfileButton();
        
        // Initialize keyboard navigation
        this.initKeyboardNavigation();
        
        // Listen for auth state changes
        if (window.Auth?.setUserData) {
            const originalSetUserData = window.Auth.setUserData;
            window.Auth.setUserData = function(data) {
                originalSetUserData.call(this, data);
                UI.Profile.updateProfileButton();
            };
        }
        
        console.log('✅ Profile System siap');
    },
    
    open: function(mode = 'view') {
        // Set initial state
        if (window.Auth) {
            window.Auth.profileState = {
                mode: mode,
                isLoading: false,
                hasChanges: false,
                tempName: window.Auth.userData?.nama || '',
                tempAvatar: null
            };
        }
        
        // Create panel
        this.createProfilePanel();
        
        // Render based on mode
        this.render();
        
        // Show with animation
        const overlay = document.getElementById('profileOverlay');
        const panel = document.getElementById('profilePanel');
        
        if (overlay && panel) {
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.style.opacity = '1';
                UI.Animate.panelIn(panel);
                
                // Focus trap
                const closeBtn = document.getElementById('closeProfile');
                if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
            }, 10);
        }
    },
    
    close: function() {
        const overlay = document.getElementById('profileOverlay');
        const panel = document.getElementById('profilePanel');
        
        if (panel) {
            UI.Animate.panelOut(panel, () => {
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        
                        // Reset file inputs
                        const uploadInput = document.getElementById('avatarUpload');
                        if (uploadInput) uploadInput.value = '';
                        
                        // Return focus to profile button
                        const profileBtn = document.getElementById('profileTrigger');
                        if (profileBtn) profileBtn.focus();
                    }, 300);
                }
            });
        } else if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Reset state
        if (window.Auth?.profileState) {
            window.Auth.profileState.mode = 'view';
            window.Auth.profileState.hasChanges = false;
            window.Auth.profileState.tempAvatar = null;
        }
    },
    
    render: function() {
        const panel = document.getElementById('profilePanel');
        if (!panel) return;
        
        // Get current state from Auth
        const state = window.Auth?.profileState || { mode: 'view' };
        const user = window.Auth?.userData || {};
        
        let content = '';
        
        // Show skeleton if loading
        if (state.isLoading && state.mode === 'view') {
            content = this.renderSkeleton();
        } else {
            switch (state.mode) {
                case 'view':
                    content = this.renderViewMode();
                    break;
                case 'edit':
                    content = this.renderEditMode();
                    break;
                case 'avatar':
                    content = this.renderAvatarMode();
                    break;
                default:
                    content = this.renderViewMode();
            }
        }
        
        const title = this.getPanelTitle(state.mode);
        panel.innerHTML = `
            <div class="profile-header">
                <h2 id="profileTitle">${title}</h2>
                <button class="close-profile" id="closeProfile" aria-label="Tutup panel">&times;</button>
            </div>
            ${content}
        `;
        
        // Bind events
        this.bindPanelEvents();
    },
    
    save: async function() {
        // Validate Auth system
        if (!window.Auth || !window.Auth.currentUser || !window.Auth.userData) {
            this.showStatus('Sistem auth tidak tersedia', 'error');
            return;
        }
        
        const state = window.Auth.profileState;
        if (!state.hasChanges || state.isLoading) return;
        
        // Check online status
        if (!navigator.onLine) {
            this.showStatus('Anda sedang offline. Periksa koneksi internet.', 'error');
            return;
        }
        
        try {
            // Start loading
            if (window.Auth.profileState) {
                window.Auth.profileState.isLoading = true;
                window.Auth.profileState.mode = 'view';
            }
            this.render();
            UI.showAuthLoading('Menyimpan profil...');
            
            const updates = {};
            
            // Update name if changed
            if (state.tempName !== undefined && state.tempName !== window.Auth.userData.nama) {
                const cleanName = state.tempName.trim();
                if (cleanName.length > 0) {
                    updates.nama = cleanName;
                } else {
                    throw new Error('Nama tidak boleh kosong');
                }
            }
            
            // Update avatar if changed
            if (state.tempAvatar && state.tempAvatar !== window.Auth.userData.foto_profil) {
                updates.foto_profil = state.tempAvatar;
            }
            
            // Determine if profile is complete
            const finalName = updates.nama || window.Auth.userData.nama || '';
            const finalAvatar = updates.foto_profil || window.Auth.userData.foto_profil || '';
            updates.profilLengkap = finalName.trim().length > 0 && finalAvatar.trim().length > 0;
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            // Remove protected fields
            delete updates.email;
            delete updates.peran;
            delete updates.id;
            delete updates.createdAt;
            
            // Update Firestore
            await firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update(updates);
            
            // Update Auth state
            window.Auth.userData = { ...window.Auth.userData, ...updates };
            
            // Update profile state
            if (window.Auth.profileState) {
                window.Auth.profileState.hasChanges = false;
                window.Auth.profileState.tempAvatar = null;
                window.Auth.profileState.isLoading = false;
            }
            
            // Update UI
            this.updateProfileButton();
            this.render();
            UI.hideAuthLoading();
            
            // Show success message
            this.showStatus('Profil berhasil disimpan!', 'success');
            
            // Auto close if profile is now complete
            if (updates.profilLengkap) {
                setTimeout(() => {
                    this.close();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Save profile error:', error);
            
            let userMessage = 'Gagal menyimpan profil.';
            if (error.code === 'permission-denied') {
                userMessage = 'Anda tidak memiliki izin untuk mengubah data ini.';
            } else if (error.message) {
                userMessage += ' ' + error.message;
            }
            
            this.showStatus(userMessage, 'error');
            
            // Reset loading state
            if (window.Auth.profileState) {
                window.Auth.profileState.isLoading = false;
            }
            this.render();
            UI.hideAuthLoading();
        }
    },
    
    // ==================== RENDER FUNCTIONS ====================
    renderSkeleton: function() {
        return `
            <div class="view-mode" style="padding: 24px; opacity: 0.8;">
                <div class="avatar-section" style="text-align: center; margin-bottom: 28px;">
                    <div class="skeleton skeleton-circle" style="width: 140px; height: 140px; margin: 0 auto 20px;"></div>
                </div>
                    
                <div class="user-info" style="text-align: center; margin-bottom: 32px;">
                    <div class="skeleton skeleton-text" style="width: 60%; height: 32px; margin: 0 auto 16px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 40%; height: 20px; margin: 0 auto 24px;"></div>
                        
                    <div style="background: #f8fafc; border-radius: 20px; padding: 20px; display: inline-block; min-width: 180px;">
                        <div class="skeleton skeleton-text" style="height: 42px; margin-bottom: 8px;"></div>
                        <div class="skeleton skeleton-text" style="width: 70%; height: 14px; margin: 0 auto;"></div>
                    </div>
                </div>
                    
                <div class="view-actions" style="max-width: 320px; margin: 0 auto;">
                    <div class="skeleton skeleton-text" style="height: 56px; margin-bottom: 16px; border-radius: 20px;"></div>
                    <div class="skeleton skeleton-text" style="height: 56px; border-radius: 20px;"></div>
                </div>
            </div>
        `;
    },
    
    renderViewMode: function() {
        const user = window.Auth?.userData || {};
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
    },
    
    renderEditMode: function() {
        const user = window.Auth?.userData || {};
        const state = window.Auth?.profileState || {};
        const avatarUrl = user.foto_profil || AvatarSystem.getDefaultAvatar(user.email || 'user');
        
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
                    <button class="btn btn-primary" id="saveProfileBtn" ${state.hasChanges ? '' : 'disabled'} aria-label="Simpan perubahan">
                        ${state.isLoading ? 
                            '<div class="loading-container"><span class="loading-spinner"></span><span>Menyimpan...</span></div>' : 
                            '<span>Simpan</span>'}
                    </button>
                    <button class="btn btn-secondary" id="cancelEditBtn">
                        <span>Batal</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderAvatarMode: function() {
        const avatars = AvatarSystem.generateAvatars(20);
        const state = window.Auth?.profileState || {};
        
        return `
            <div class="edit-avatar-mode">
                <h3>Pilih Avatar</h3>
                    
                ${state.tempAvatar && state.tempAvatar.startsWith('data:image') ? `
                <div class="custom-avatar-preview active" id="customAvatarPreviewContainer">
                    <div class="preview-container">
                        <div class="preview-title">Preview Avatar Custom</div>
                        <img src="${state.tempAvatar}" 
                             alt="Preview avatar custom" 
                             class="preview-image">
                    </div>
                </div>
                ` : ''}
                    
                <div class="avatar-grid" id="avatarGrid" role="listbox" aria-label="Pilihan avatar">
                    ${avatars.map(avatar => `
                        <div class="avatar-item ${state.tempAvatar === avatar.url ? 'selected' : ''}" 
                             data-url="${avatar.url}"
                             role="option"
                             aria-label="${avatar.name}"
                             aria-selected="${state.tempAvatar === avatar.url}">
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
    },
    
    getPanelTitle: function(mode) {
        const titles = {
            'view': 'Profil Saya',
            'edit': 'Edit Profil',
            'avatar': 'Pilih Avatar'
        };
        return titles[mode] || 'Profil';
    },
    
    // ==================== EVENT BINDING ====================
    bindPanelEvents: function() {
        // Close button
        const closeBtn = document.getElementById('closeProfile');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Overlay click
        const overlay = document.getElementById('profileOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        // Mode-specific events
        const state = window.Auth?.profileState || { mode: 'view' };
        switch (state.mode) {
            case 'view':
                this.bindViewModeEvents();
                break;
            case 'edit':
                this.bindEditModeEvents();
                break;
            case 'avatar':
                this.bindAvatarModeEvents();
                break;
        }
    },
    
    bindViewModeEvents: function() {
        // Edit Profile button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // Update state
                if (window.Auth.profileState) {
                    window.Auth.profileState.mode = 'edit';
                    window.Auth.profileState.tempName = window.Auth.userData?.nama || '';
                }
                this.render();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.showLogoutModal());
        }
    },
    
    bindEditModeEvents: function() {
        // Name input
        const nameInput = document.getElementById('editName');
        if (nameInput) {
            nameInput.value = window.Auth?.userData?.nama || '';
            
            nameInput.addEventListener('input', (e) => {
                if (window.Auth.profileState) {
                    window.Auth.profileState.tempName = e.target.value;
                    window.Auth.profileState.hasChanges = 
                        window.Auth.profileState.tempName !== (window.Auth.userData?.nama || '') ||
                        window.Auth.profileState.tempAvatar !== null;
                    this.updateSaveButton();
                }
            });
            
            // Auto-focus
            setTimeout(() => nameInput.focus(), 50);
        }
        
        // Edit Avatar button
        const editAvatarBtn = document.getElementById('editAvatarBtn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                if (window.Auth.profileState) {
                    window.Auth.profileState.mode = 'avatar';
                }
                this.render();
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (window.Auth.profileState) {
                    window.Auth.profileState.mode = 'view';
                    window.Auth.profileState.hasChanges = false;
                    window.Auth.profileState.tempAvatar = null;
                }
                this.render();
            });
        }
    },
    
    bindAvatarModeEvents: function() {
        // Avatar selection
        const avatarItems = document.querySelectorAll('.avatar-item');
        avatarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove selected class from all
                avatarItems.forEach(i => {
                    i.classList.remove('selected');
                    i.setAttribute('aria-selected', 'false');
                });
                
                // Add to clicked
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                
                // Update state
                const avatarUrl = item.dataset.url;
                if (window.Auth.profileState) {
                    window.Auth.profileState.tempAvatar = avatarUrl;
                    window.Auth.profileState.hasChanges = true;
                }
                
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
            uploadInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
            
            const uploadBtn = document.querySelector('.btn-upload');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    uploadInput.click();
                });
            }
        }
        
        // Back button
        const backBtn = document.getElementById('backToEditBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.Auth.profileState) {
                    window.Auth.profileState.mode = 'edit';
                }
                this.render();
                this.updateAvatarPreview();
            });
        }
    },
    
    // ==================== AVATAR HANDLING ====================
    updateAvatarPreview: function() {
        const avatarImg = document.getElementById('editAvatarImage');
        if (!avatarImg || !window.Auth?.profileState?.tempAvatar) return;
        
        avatarImg.src = window.Auth.profileState.tempAvatar;
    },
    
    handleAvatarUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const validation = AvatarSystem.validateUpload(file);
        if (!validation.valid) {
            this.showStatus(validation.error, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update state
            if (window.Auth.profileState) {
                window.Auth.profileState.tempAvatar = e.target.result;
                window.Auth.profileState.hasChanges = true;
            }
            
            // Update selected visual
            const avatarItems = document.querySelectorAll('.avatar-item');
            avatarItems.forEach(item => {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            });
            
            // Show preview
            this.showStatus('Avatar custom berhasil diunggah!', 'success');
            
            // Render preview
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
    },
    
    // ==================== UI HELPERS ====================
    updateSaveButton: function() {
        const saveBtn = document.getElementById('saveProfileBtn');
        if (!saveBtn || !window.Auth?.profileState) return;
        
        const state = window.Auth.profileState;
        saveBtn.disabled = !state.hasChanges || state.isLoading;
        
        if (state.hasChanges && !state.isLoading) {
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        } else {
            saveBtn.style.opacity = '0.6';
            saveBtn.style.cursor = 'not-allowed';
        }
    },
    
    showStatus: function(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;
        
        const icon = type === 'success' ? '✓' : '✗';
        statusEl.innerHTML = `
            <span class="status-icon">${icon}</span>
            <span>${message}</span>
        `;
        statusEl.className = `status-message status-${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusEl.className = 'status-message';
                statusEl.innerHTML = '';
            }, 3000);
        }
    },
    
    // ==================== PROFILE BUTTON ====================
    createProfileButton: function() {
        // Remove existing
        const existing = document.querySelector('.profile-button-container');
        if (existing) existing.remove();
        
        // Create container
        const container = document.createElement('div');
        container.className = 'profile-button-container';
        container.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 10000;
        `;
        
        // Create button
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
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
        });
        
        // Add avatar image
        const user = window.Auth?.userData || {};
        const avatarUrl = user.foto_profil || AvatarSystem.getDefaultAvatar(window.Auth?.currentUser?.email || 'user');
        
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
        
        // Add indicator if profile incomplete
        if (window.Auth?.userData && !window.Auth.userData.profilLengkap) {
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
        
        // Add click event
        button.addEventListener('click', () => this.open('view'));
        container.appendChild(button);
        document.body.appendChild(container);
    },
    
    updateProfileButton: function() {
        const button = document.getElementById('profileTrigger');
        if (!button) return;
        
        // Update image
        const img = button.querySelector('.profile-image');
        if (img && window.Auth?.userData?.foto_profil) {
            const oldSrc = img.src;
            img.src = window.Auth.userData.foto_profil;
            img.onerror = function() {
                if (this.src !== oldSrc) {
                    this.src = AvatarSystem.getDefaultAvatar(window.Auth?.currentUser?.email || 'user');
                }
            };
        }
        
        // Update indicator
        const indicator = button.querySelector('.profile-indicator');
        if (window.Auth?.userData?.profilLengkap) {
            if (indicator) indicator.remove();
        } else if (!indicator && button.querySelector('.profile-image')) {
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
    },
    
    // ==================== PANEL CREATION ====================
    createProfilePanel: function() {
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
        this.createLogoutModal();
    },
    
    createLogoutModal: function() {
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
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
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
        `;
        document.head.appendChild(style);
    },
    
    showLogoutModal: function() {
        const modal = document.getElementById('logoutModal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            const innerModal = modal.querySelector('.modal');
            if (innerModal) {
                innerModal.style.transform = 'translateY(0)';
                innerModal.style.opacity = '1';
            }
            
            // Focus on cancel button
            const cancelBtn = document.getElementById('cancelLogout');
            if (cancelBtn) setTimeout(() => cancelBtn.focus(), 100);
        }, 10);
        
        // Bind events
        document.getElementById('cancelLogout').addEventListener('click', () => this.hideLogoutModal());
        document.getElementById('confirmLogout').addEventListener('click', () => this.performLogout());
        
        // Escape key handler
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.hideLogoutModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
    },
    
    hideLogoutModal: function() {
        const modal = document.getElementById('logoutModal');
        if (!modal) return;
        
        const innerModal = modal.querySelector('.modal');
        if (innerModal) {
            innerModal.style.transform = 'translateY(40px)';
            innerModal.style.opacity = '0';
        }
        
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },
    
    performLogout: async function() {
        this.hideLogoutModal();
        this.close();
        
        try {
            UI.showAuthLoading('Sedang logout...');
            
            if (window.Auth && window.Auth.authLogout) {
                await window.Auth.authLogout();
                
                // Call UI.afterLogout
                UI.afterLogout();
                
                // Show success message
                if (window.UI.Toast) {
                    window.UI.Toast.success('Berhasil logout!');
                }
                
                 // ✅ FIX DISINI:
            if (window.Auth.redirectToLogin) {
                window.Auth.redirectToLogin(); // Smart redirect
            } else {
                window.location.href = '/AlbEdu/login.html'; // Fallback
            }
            
        } else {
            throw new Error('Auth system tidak ditemukan');
        }
    } catch (error) {
        console.error('Logout error:', error);
        UI.hideAuthLoading();
            
            if (window.UI.Toast) {
                window.UI.Toast.error('Gagal logout: ' + (error.message || 'Terjadi kesalahan'));
            }
        }
    },
    
    // ==================== KEYBOARD NAVIGATION ====================
    initKeyboardNavigation: function() {
        document.addEventListener('keydown', (e) => {
            // ESC key untuk menutup panel atau modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('logoutModal');
                const overlay = document.getElementById('profileOverlay');
                
                if (modal && modal.style.display === 'flex') {
                    this.hideLogoutModal();
                    e.preventDefault();
                } else if (overlay && overlay.style.display === 'flex') {
                    this.close();
                    e.preventDefault();
                }
            }
            
            // Tab key untuk focus trap di panel
            if (e.key === 'Tab' && document.getElementById('profileOverlay')?.style.display === 'flex') {
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
    },
    
    // ==================== CSS INJECTION ====================
    injectProfileCSS: function() {
        if (document.querySelector('#profile-css')) return;
        
        const style = document.createElement('style');
        style.id = 'profile-css';
        
        // CSS dari PrototypeV2 dengan modifikasi minimal
        style.textContent = `
            /* ==================== ANIMASI HALUS ==================== */
            @keyframes panelIn {
                0% { transform: translateY(20px) scale(0.97); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            @keyframes modeFadeIn {
                0% { opacity: 0; transform: translateY(12px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes modeFadeOut {
                0% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-8px); }
            }
            
            .mode-transition-enter {
                animation: modeFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            
            .mode-transition-exit {
                animation: modeFadeOut 0.2s ease forwards;
            }
            
            /* Micro-interaction avatar selection */
            .avatar-item {
                transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
            }
            
            .avatar-item.selected {
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 0 6px 20px rgba(99, 102, 241, 0.15);
                transform: scale(1.05);
            }
            
            /* Ripple feedback untuk tombol */
            .btn {
                transition: transform 0.12s ease, background-color 0.2s ease, box-shadow 0.2s ease;
            }
            
            .btn:active { transform: scale(0.98); }
            .btn-primary:active:not(:disabled) { transform: translateY(-1px) scale(0.98); }
            
            /* Skeleton loading */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 16px;
            }
            
            .skeleton-circle { border-radius: 50%; }
            .skeleton-text { height: 16px; margin-bottom: 12px; }
            .skeleton-text:last-child { margin-bottom: 0; }
            .skeleton-text.short { width: 60%; }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .profile-panel,
                .mode-transition-enter,
                .mode-transition-exit,
                .avatar-item,
                .btn,
                .profile-indicator,
                .skeleton {
                    animation: none !important;
                    transition: none !important;
                }
                    
                .avatar-item.selected { transform: none; }
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
            }
            
            .close-profile:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            /* ==================== VIEW MODE ==================== */
            .view-mode { padding: 24px; overflow-y: auto; flex: 1; }
            
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
            }
            
            .user-info { text-align: center; margin-bottom: 32px; }
            
            .user-name {
                font-size: clamp(24px, 3vw, 32px);
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
                line-height: 1.2;
                word-break: break-word;
            }
            
            .user-email {
                font-size: clamp(14px, 1.5vw, 16px);
                color: #6b7280;
                margin-bottom: 24px;
                word-break: break-all;
            }
            
            .user-stats {
                background: #f8fafc;
                border-radius: 20px;
                padding: 20px;
                display: inline-block;
                border: 1px solid #e5e7eb;
                min-width: 180px;
            }
            
            .stat-item { text-align: center; }
            
            .stat-value {
                display: block;
                font-size: clamp(32px, 4vw, 42px);
                font-weight: 800;
                color: #6366f1;
                line-height: 1;
                margin-bottom: 8px;
            }
            
            .stat-label {
                font-size: clamp(13px, 1.5vw, 14px);
                color: #6b7280;
                font-weight: 500;
            }
            
            .view-actions {
                display: flex;
                flex-direction: column;
                gap: 16px;
                max-width: 320px;
                margin: 0 auto;
            }
            
            /* ==================== EDIT MODE ==================== */
            .edit-mode { padding: 24px; overflow-y: auto; flex: 1; }
            
            .edit-avatar-section { text-align: center; margin-bottom: 28px; }
            
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
            }
            
            .avatar-edit-btn:hover { background: rgba(99, 102, 241, 0.1); }
            
            .edit-form { margin-bottom: 32px; }
            .form-group { margin-bottom: 20px; }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
            }
            
            .form-group input {
                width: 100%;
                padding: 16px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                font-size: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                outline: none;
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
                .edit-actions { flex-direction: column; gap: 12px; max-width: 100%; }
            }
            
            /* ==================== EDIT AVATAR MODE ==================== */
            .edit-avatar-mode { padding: 24px; overflow-y: auto; flex: 1; }
            
            .edit-avatar-mode h3 {
                font-size: clamp(18px, 2vw, 22px);
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 20px;
                text-align: center;
                line-height: 1.3;
            }
            
            .avatar-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 28px;
                padding: 8px;
            }
            
            @media (max-width: 768px) {
                .avatar-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 4px; }
            }
            
            @media (max-width: 480px) {
                .avatar-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
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
            
            /* CUSTOM AVATAR PREVIEW */
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
            
            @keyframes spin { to { transform: rotate(360deg); } }
            
            .loading-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            
            /* ==================== STATUS MESSAGES ==================== */
            .status-message {
                padding: 16px 20px;
                border-radius: 16px;
                margin-bottom: 24px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                line-height: 1.5;
            }
            
            .status-success {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #a7f3d0;
            }
            
            .status-error {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            
            /* ==================== SCROLLBAR STYLING ==================== */
            .profile-panel::-webkit-scrollbar { width: 6px; }
            .profile-panel::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
            .profile-panel::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
            .profile-panel::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
            
            /* Hover state untuk desktop avatar grid */
            @media (hover: hover) and (min-width: 769px) {
                .avatar-item:hover:not(.selected) {
                    transform: scale(1.03);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
};

// =======================
// INITIALIZATION
// =======================
(function init() {
    console.log('🚀 Initializing ByteWard UI v0.5.4...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.Auth?.currentUser) {
                    UI.Profile.init();
                }
                console.log('✅ ByteWard UI v0.5.4 siap');
            }, 1000);
        });
    } else {
        setTimeout(() => {
            if (window.Auth?.currentUser) {
                UI.Profile.init();
            }
            console.log('✅ ByteWard UI v0.5.4 siap');
        }, 1000);
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI: window.UI };
}

// =======================
// LOGIN FLOW SUPPORT
// =======================
UI.handleLogin = async function() {
    console.log('🔐 Memulai proses login...');
    
    // 1. SHOW LOADING
    this.showAuthLoading('Membuka Google Login...');
    
    try {
        // 2. CALL AUTH LOGIN
        if (!window.Auth || !window.Auth.authLogin) {
            throw new Error('Auth system tidak tersedia');
        }
        
        await window.Auth.authLogin();
        
        // 3. Auth akan otomatis panggil UI.afterLogin()
        // 4. Auth akan otomatis panggil UI.hideAuthLoading() di finally
        
        console.log('✅ Login flow selesai');
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // Ensure loading hidden
        this.hideAuthLoading();
        
        // Show error
        this.showLoginError(error.message);
        
        throw error; // Re-throw untuk handling di caller
    }
};

// Initialize UI system untuk login page juga
UI.initializeForLogin = function() {
    console.log('🔄 Menginisialisasi UI untuk login page');
    
    // Inject loading CSS jika belum
    if (!document.querySelector('#loading-css')) {
        const style = document.createElement('style');
        style.id = 'loading-css';
        style.textContent = `
            .loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
                flex-direction: column;
                backdrop-filter: blur(4px);
                transition: opacity 0.3s ease;
            }
            .block-loader {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 60px;
            }
            .block-block {
                width: 12px;
                height: 40px;
                background: linear-gradient(to bottom, #3b82f6, #2563eb);
                border-radius: 4px;
                animation: block-bounce 1.8s ease-in-out infinite;
                animation-delay: calc(var(--i) * 0.15s);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            .block-block:nth-child(odd) {
                background: linear-gradient(to bottom, #1d4ed8, #3b82f6);
            }
            .block-block:nth-child(3) { width: 14px; height: 45px; }
            @keyframes block-bounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-15px); }
            }
            .loading-text {
                margin-top: 30px;
                color: #1e293b;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
                max-width: 300px;
                line-height: 1.5;
            }
            .progress-bar {
                width: 200px;
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                margin-top: 20px;
                overflow: hidden;
            }
            .progress-fill {
                width: 40%;
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #2563eb);
                border-radius: 2px;
                animation: progress-shift 2s ease-in-out infinite;
            }
            @keyframes progress-shift {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(200%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ UI siap untuk login page');
};

console.log('🎨 UI Module v0.5.4 - Production Ready with Auth System');
