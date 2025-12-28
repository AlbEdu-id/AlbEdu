// ByteWard UI Module v1.1.0 - UI System Compatible with notification.js
console.log('🎨 Memuat UI Module v1.1.0 (Notification Integrated)...');

// =======================
// Configuration
// =======================
const UI_CONFIG = {
    version: '1.1.0',
    features: { 
        profileSystem: true,
        notificationSystem: true, // External dependency
        loadingSystem: true,
        errorSystem: true, 
        modalSystem: true,
        toastSystem: true
    },
    defaults: {
        animationSpeed: 300,
        theme: 'light'
    }
};

// =======================
// Profile Button System
// =======================
function createProfileButton() {
    const existing = document.querySelector('.profile-button-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'profile-button-container';

    const button = document.createElement('button');
    button.className = 'profile-button';
    button.id = 'profileTrigger';
    button.setAttribute('aria-label', 'Open profile panel');
    
    // Avatar image
    const avatarUrl = (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || 
                     ((window.Auth && window.Auth.currentUser) ? 
                      generateDefaultAvatar(window.Auth.currentUser.email) : 
                      generateDefaultAvatar('user'));
    
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Profile';
    img.className = 'profile-image';
    img.onerror = function() {
        this.src = generateDefaultAvatar('user');
    };
    
    button.appendChild(img);

    // Profile completion indicator
    if (window.Auth && window.Auth.profileState && !window.Auth.profileState.isProfileComplete) {
        const indicator = document.createElement('div');
        indicator.className = 'profile-indicator';
        indicator.textContent = '!';
        indicator.title = 'Profil belum lengkap';
        button.appendChild(indicator);
    }

    // Add user info tooltip on hover
    const tooltip = document.createElement('div');
    tooltip.className = 'profile-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        bottom: -45px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s;
        pointer-events: none;
        z-index: 1000;
    `;
    
    button.appendChild(tooltip);
    
    // Update tooltip content
    function updateTooltip() {
        if (window.Auth && window.Auth.userData) {
            const name = window.Auth.userData.nama || 'User';
            const email = window.Auth.currentUser?.email || '';
            tooltip.textContent = `${name} • ${email}`;
        } else {
            tooltip.textContent = 'Guest User';
        }
    }
    
    // Hover events for tooltip
    button.addEventListener('mouseenter', () => {
        updateTooltip();
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.bottom = '-40px';
    });
    
    button.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.bottom = '-45px';
    });

    button.addEventListener('click', showProfilePanel);
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateProfileButton() {
    const button = document.getElementById('profileTrigger');
    if (!button) return;

    // Update avatar
    const img = button.querySelector('.profile-image');
    if (img && window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) {
        const oldSrc = img.src;
        img.src = window.Auth.userData.foto_profil;
        img.onerror = function() {
            if (this.src !== oldSrc) {
                this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
            }
        };
    }

    // Update indicator
    const indicator = button.querySelector('.profile-indicator');
    if (window.Auth && window.Auth.profileState && window.Auth.profileState.isProfileComplete) {
        if (indicator) indicator.remove();
    } else if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'profile-indicator';
        newIndicator.textContent = '!';
        newIndicator.title = 'Profil belum lengkap';
        button.appendChild(newIndicator);
    }
}

// =======================
// Profile Panel System (Lengkap)
// =======================
function createProfilePanel() {
    // Remove existing panel
    const existing = document.getElementById('profilePanel');
    if (existing) existing.remove();

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
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create panel
    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';
    panel.style.cssText = `
        background: white;
        border-radius: 20px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: translateY(-20px) scale(0.95);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'profile-header';
    header.style.cssText = `
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    `;
    
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = (window.Auth && window.Auth.profileState && window.Auth.profileState.isProfileComplete) ? 
                             'Profil Saya' : 'Lengkapi Profil';
    headerTitle.style.cssText = `
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-profile';
    closeButton.id = 'closeProfile';
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
        closeButton.style.transform = 'rotate(90deg)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        closeButton.style.transform = 'rotate(0deg)';
    });

    header.appendChild(headerTitle);
    header.appendChild(closeButton);

    // Content container
    const content = document.createElement('div');
    content.className = 'profile-content';
    content.style.cssText = `
        padding: 24px;
        overflow-y: auto;
        flex: 1;
    `;

    // Current Profile Section
    const currentProfile = document.createElement('div');
    currentProfile.className = 'current-profile';
    currentProfile.style.cssText = `
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
    `;
    
    const currentAvatar = document.createElement('img');
    currentAvatar.className = 'current-avatar';
    currentAvatar.alt = 'Current Avatar';
    currentAvatar.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    currentAvatar.src = (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || 
                       generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
    currentAvatar.onerror = function() {
        this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
    };
    
    const profileInfo = document.createElement('div');
    profileInfo.style.cssText = `
        flex: 1;
    `;
    
    const currentName = document.createElement('div');
    currentName.className = 'current-name';
    currentName.textContent = (window.Auth && window.Auth.userData && window.Auth.userData.nama) || 
                             (window.Auth && window.Auth.currentUser && window.Auth.currentUser.displayName) || 
                             'Nama belum diisi';
    currentName.style.cssText = `
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const currentEmail = document.createElement('div');
    currentEmail.className = 'current-email';
    currentEmail.textContent = (window.Auth && window.Auth.currentUser && window.Auth.currentUser.email) || 'Email tidak tersedia';
    currentEmail.style.cssText = `
        font-size: 14px;
        color: #6b7280;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const currentRole = document.createElement('div');
    currentRole.className = 'current-role';
    currentRole.textContent = `Role: ${(window.Auth && window.Auth.userData && window.Auth.userData.peran) || 'siswa'}`;
    currentRole.style.cssText = `
        font-size: 12px;
        color: #9ca3af;
        background: #e5e7eb;
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
        margin-top: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    profileInfo.appendChild(currentName);
    profileInfo.appendChild(currentEmail);
    profileInfo.appendChild(currentRole);
    
    currentProfile.appendChild(currentAvatar);
    currentProfile.appendChild(profileInfo);

    // Edit Section
    const editSection = document.createElement('div');
    editSection.className = 'edit-section';
    editSection.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
    `;

    // Name Input
    const nameInputGroup = document.createElement('div');
    nameInputGroup.className = 'name-input-group';
    nameInputGroup.style.cssText = `
        margin-bottom: 24px;
    `;
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'profileName';
    nameLabel.textContent = 'Nama Lengkap';
    nameLabel.style.cssText = `
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'profileName';
    nameInput.className = 'name-input';
    nameInput.placeholder = 'Masukkan nama lengkap';
    nameInput.value = (window.Auth && window.Auth.userData && window.Auth.userData.nama) || '';
    nameInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: all 0.2s;
        box-sizing: border-box;
    `;
    
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#3b82f6';
        nameInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = '#e5e7eb';
        nameInput.style.boxShadow = 'none';
    });

    nameInputGroup.appendChild(nameLabel);
    nameInputGroup.appendChild(nameInput);

    // Avatar Options
    const avatarOptionsContainer = document.createElement('div');
    avatarOptionsContainer.className = 'avatar-options';
    avatarOptionsContainer.style.cssText = `
        margin-bottom: 24px;
    `;
    
    const optionTitle = document.createElement('div');
    optionTitle.className = 'option-title';
    optionTitle.textContent = 'Pilih Avatar';
    optionTitle.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid';
    optionGrid.id = 'avatarOptions';
    optionGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 16px;
    `;
    
    avatarOptionsContainer.appendChild(optionTitle);
    avatarOptionsContainer.appendChild(optionGrid);

    // Custom Upload
    const customUpload = document.createElement('div');
    customUpload.className = 'custom-upload';
    customUpload.style.cssText = `
        margin-bottom: 24px;
    `;
    
    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'upload-label';
    uploadLabel.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    uploadLabel.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Unggah Foto Sendiri
    `;
    
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.id = 'avatarUpload';
    uploadInput.className = 'upload-input';
    uploadInput.accept = 'image/*';
    uploadInput.style.cssText = `
        display: none;
    `;
    
    uploadLabel.appendChild(uploadInput);
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.id = 'previewContainer';
    previewContainer.style.cssText = `
        display: none;
        margin-top: 16px;
        text-align: center;
    `;
    
    const previewTitle = document.createElement('div');
    previewTitle.className = 'preview-title';
    previewTitle.textContent = 'Pratinjau:';
    previewTitle.style.cssText = `
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const previewImage = document.createElement('img');
    previewImage.className = 'preview-image';
    previewImage.id = 'previewImage';
    previewImage.style.cssText = `
        max-width: 100px;
        max-height: 100px;
        border-radius: 50%;
        border: 3px solid #3b82f6;
        object-fit: cover;
    `;
    
    previewContainer.appendChild(previewTitle);
    previewContainer.appendChild(previewImage);
    
    customUpload.appendChild(uploadLabel);
    customUpload.appendChild(previewContainer);

    // Status Message
    const statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    statusMessage.id = 'statusMessage';
    statusMessage.style.cssText = `
        display: none;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Actions
    const profileActions = document.createElement('div');
    profileActions.className = 'profile-actions';
    profileActions.style.cssText = `
        display: flex;
        gap: 12px;
        margin-top: 24px;
    `;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.id = 'saveProfile';
    saveBtn.disabled = true;
    saveBtn.style.cssText = `
        flex: 1;
        padding: 14px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        overflow: hidden;
    `;
    
    const saveText = document.createElement('span');
    saveText.id = 'saveText';
    saveText.textContent = 'Simpan Perubahan';
    saveText.style.cssText = `
        position: relative;
        z-index: 1;
    `;
    
    const saveLoading = document.createElement('span');
    saveLoading.className = 'save-loading';
    saveLoading.id = 'saveLoading';
    saveLoading.style.cssText = `
        display: none;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        z-index: 2;
    `;
    
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    `;
    
    saveLoading.appendChild(spinner);
    saveLoading.appendChild(document.createTextNode('Menyimpan...'));
    
    saveBtn.appendChild(saveText);
    saveBtn.appendChild(saveLoading);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.id = 'cancelEdit';
    cancelBtn.textContent = 'Batal';
    cancelBtn.style.cssText = `
        padding: 14px 24px;
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Hover effects
    saveBtn.addEventListener('mouseenter', () => {
        if (!saveBtn.disabled) {
            saveBtn.style.transform = 'translateY(-2px)';
            saveBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }
    });
    
    saveBtn.addEventListener('mouseleave', () => {
        saveBtn.style.transform = 'translateY(0)';
        saveBtn.style.boxShadow = 'none';
    });
    
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = '#e5e7eb';
        cancelBtn.style.transform = 'translateY(-2px)';
    });
    
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = '#f3f4f6';
        cancelBtn.style.transform = 'translateY(0)';
    });

    profileActions.appendChild(saveBtn);
    profileActions.appendChild(cancelBtn);

    // Assemble edit section
    editSection.appendChild(nameInputGroup);
    editSection.appendChild(avatarOptionsContainer);
    editSection.appendChild(customUpload);
    editSection.appendChild(statusMessage);
    editSection.appendChild(profileActions);

    // Assemble content
    content.appendChild(currentProfile);
    content.appendChild(editSection);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(content);

    // Assemble overlay
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Initialize
    initializeProfilePanel();
}

function initializeProfilePanel() {
    populateAvatarOptions();

    // Event listeners
    document.getElementById('closeProfile').addEventListener('click', hideProfilePanel);
    document.getElementById('cancelEdit').addEventListener('click', hideProfilePanel);
    
    document.getElementById('profileOverlay').addEventListener('click', function(e) {
        if (e.target.id === 'profileOverlay') hideProfilePanel();
    });

    const nameInput = document.getElementById('profileName');
    nameInput.addEventListener('input', function() {
        if (window.Auth && window.Auth.profileState) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, {
                tempName: nameInput.value.trim()
            });
        }
        checkForChanges();
    });

    const uploadInput = document.getElementById('avatarUpload');
    uploadInput.addEventListener('change', handleAvatarUpload);

    document.getElementById('saveProfile').addEventListener('click', saveProfile);

    if (window.Auth && window.Auth.profileState) {
        window.Auth.profileState = Object.assign({}, window.Auth.profileState, {
            tempName: (window.Auth && window.Auth.userData && window.Auth.userData.nama) || ''
        });
    }
    checkForChanges();
}

function populateAvatarOptions() {
    const container = document.getElementById('avatarOptions');
    if (!container) return;

    container.innerHTML = '';
    const avatars = (window.Auth && window.Auth.PROFILE_AVATARS) || [];

    avatars.forEach(function(avatar) {
        const option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.id = avatar.id;
        option.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.2s;
            position: relative;
        `;

        const img = document.createElement('img');
        img.src = avatar.url;
        img.alt = avatar.name;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        
        img.onerror = function() {
            // Create fallback with initial
            const label = document.createElement('div');
            label.className = 'option-label';
            label.textContent = avatar.name.charAt(0).toUpperCase();
            label.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${avatar.color || '#3b82f6'};
                color: white;
                font-weight: bold;
                font-size: 18px;
            `;
            option.innerHTML = '';
            option.appendChild(label);
        };

        option.appendChild(img);

        // Check if this is the current avatar
        if (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) {
            const currentUrl = window.Auth.userData.foto_profil;
            if (currentUrl === avatar.url) {
                option.style.borderColor = avatar.color || '#3b82f6';
                option.style.boxShadow = `0 0 0 3px ${avatar.color || '#3b82f6'}40`;
                if (window.Auth && window.Auth.profileState) {
                    window.Auth.profileState.selectedAvatar = avatar.id;
                }
            }
        }

        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1.1)';
                this.style.borderColor = avatar.color || '#3b82f6';
            }
        });

        option.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1)';
                this.style.borderColor = 'transparent';
            }
        });

        option.addEventListener('click', function() {
            selectAvatar(avatar.id);
        });
        
        container.appendChild(option);
    });
}

function selectAvatar(avatarId) {
    if (window.Auth && window.Auth.profileState) {
        window.Auth.profileState = Object.assign({}, window.Auth.profileState, {
            selectedAvatar: avatarId,
            customAvatar: null
        });
    }

    // Update UI
    document.querySelectorAll('.avatar-option').forEach(function(opt) {
        opt.classList.remove('selected');
        opt.style.borderColor = 'transparent';
        opt.style.boxShadow = 'none';
        opt.style.transform = 'scale(1)';
        
        if (opt.dataset.id === avatarId) {
            opt.classList.add('selected');
            const avatar = (window.Auth.PROFILE_AVATARS || []).find(a => a.id === avatarId);
            opt.style.borderColor = avatar?.color || '#3b82f6';
            opt.style.boxShadow = `0 0 0 3px ${avatar?.color || '#3b82f6'}40`;
        }
    });

    // Hide custom upload preview
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    previewContainer.style.display = 'none';
    previewImage.src = '';

    checkForChanges();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        if (window.notify) {
            window.notify.error('Error', 'Hanya file gambar yang diperbolehkan');
        }
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        if (window.notify) {
            window.notify.error('Error', 'Ukuran gambar maksimal 2MB');
        }
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (window.Auth && window.Auth.profileState) {
                window.Auth.profileState = Object.assign({}, window.Auth.profileState, {
                    customAvatar: e.target.result,
                    selectedAvatar: 'custom'
                });
            }

            // Deselect all avatar options
            document.querySelectorAll('.avatar-option').forEach(function(opt) {
                opt.classList.remove('selected');
                opt.style.borderColor = 'transparent';
                opt.style.boxShadow = 'none';
            });

            // Show preview
            const previewImage = document.getElementById('previewImage');
            const previewContainer = document.getElementById('previewContainer');
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            
            checkForChanges();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        if (window.notify) {
            window.notify.error('Error', 'Gagal membaca file');
        }
        console.error('Upload error:', error);
    }
}

function checkForChanges() {
    const nameChanged = (window.Auth && window.Auth.profileState && window.Auth.profileState.tempName) !== 
                     ((window.Auth && window.Auth.userData && window.Auth.userData.nama) || '');
    let avatarChanged = false;

    if (window.Auth && window.Auth.profileState) {
        const state = window.Auth.profileState;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            avatarChanged = state.customAvatar !== ((window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || '');
        } else if (state.selectedAvatar) {
            const avatars = (window.Auth && window.Auth.PROFILE_AVATARS) || [];
            const selected = avatars.find(function(a) { return a.id === state.selectedAvatar; });
            avatarChanged = (selected && selected.url) !== ((window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || '');
        }

        window.Auth.profileState = Object.assign({}, state, { hasChanges: nameChanged || avatarChanged });
    }

    const saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
        const isLoading = (window.Auth && window.Auth.profileState && window.Auth.profileState.isLoading) || false;
        const hasChanges = (window.Auth && window.Auth.profileState && window.Auth.profileState.hasChanges) || false;
        
        saveBtn.disabled = !hasChanges || isLoading;
        
        if (hasChanges && !isLoading) {
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        } else {
            saveBtn.style.opacity = '0.6';
            saveBtn.style.cursor = 'not-allowed';
        }
    }
}

function showProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');

    if (!overlay || !panel) {
        createProfilePanel();
        setTimeout(function() {
            document.getElementById('profileOverlay').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('profileOverlay').style.opacity = '1';
                document.getElementById('profilePanel').style.opacity = '1';
                document.getElementById('profilePanel').style.transform = 'translateY(0) scale(1)';
            }, 10);
        }, 10);
    } else {
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.style.opacity = '1';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0) scale(1)';
        }, 10);
    }

    // Update form values
    const nameInput = document.getElementById('profileName');
    if (nameInput && window.Auth && window.Auth.userData) {
        nameInput.value = window.Auth.userData.nama || '';
        if (window.Auth && window.Auth.profileState) {
            window.Auth.profileState.tempName = window.Auth.userData.nama || '';
        }
    }

    // Reset status
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    }

    checkForChanges();
}

function hideProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');

    if (panel) {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-20px) scale(0.95)';
    }
    
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
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
    statusEl.style.display = 'block';

    if (type === 'success') {
        statusEl.style.cssText += `
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        `;
    } else if (type === 'error') {
        statusEl.style.cssText += `
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        `;
    } else if (type === 'info') {
        statusEl.style.cssText += `
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        `;
    }

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }

    // Also show notification
    if (message && (type === 'success' || type === 'error')) {
        if (window.notify) {
            window.notify[type === 'success' ? 'success' : 'error'](
                type === 'success' ? 'Success' : 'Error',
                message
            );
        }
    }
}

async function saveProfile() {
    if (!window.Auth || !window.Auth.profileState || !window.Auth.userData || !window.Auth.currentUser) {
        showStatus('Sistem auth tidak tersedia', 'error');
        return;
    }

    const state = window.Auth.profileState;
    if (state.isLoading || !state.hasChanges) return;

    try {
        // Show loading state
        window.Auth.profileState = Object.assign({}, state, { isLoading: true });
        updateSaveButtonState();

        // Prepare updates
        const updates = {};
        
        // Name update
        if (state.tempName && state.tempName !== window.Auth.userData.nama) {
            updates.nama = state.tempName.trim();
        }

        // Avatar update
        let newAvatarUrl = window.Auth.userData.foto_profil;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            newAvatarUrl = state.customAvatar;
        } else if (state.selectedAvatar) {
            const selected = (window.Auth.PROFILE_AVATARS || []).find(a => a.id === state.selectedAvatar);
            newAvatarUrl = (selected && selected.url) || '';
        }

        if (newAvatarUrl && newAvatarUrl !== window.Auth.userData.foto_profil) {
            updates.foto_profil = newAvatarUrl;
        }

        // Check if profile will be complete
        const willBeComplete = window.Auth.checkProfileCompleteness(
            Object.assign({}, window.Auth.userData, updates)
        );

        updates.profilLengkap = willBeComplete;
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        // Save to Firestore
        await firebaseDb.collection('users').doc(window.Auth.currentUser.uid).update(updates);

        // Update local state
        window.Auth.userData = Object.assign({}, window.Auth.userData, updates);
        window.Auth.profileState = Object.assign({}, state, {
            isProfileComplete: willBeComplete,
            hasChanges: false,
            isLoading: false
        });

        // Update UI
        updateProfileButton();
        
        // Update profile panel
        const currentAvatar = document.querySelector('.current-avatar');
        const currentName = document.querySelector('.current-name');
        if (currentAvatar && updates.foto_profil) {
            currentAvatar.src = updates.foto_profil;
            currentAvatar.onerror = function() {
                this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
            };
        }
        if (currentName && updates.nama) {
            currentName.textContent = updates.nama;
        }

        // Show success message
        showStatus('Profil berhasil disimpan!', 'success');
        
        if (window.notify) {
            window.notify.success('Sukses', 'Profil berhasil disimpan!');
        }

        // Auto-close if profile is now complete
        if (willBeComplete && !state.autoCloseTriggered) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, { autoCloseTriggered: true });
            setTimeout(() => {
                hideProfilePanel();
                // Reset autoCloseTriggered
                window.Auth.profileState = Object.assign({}, window.Auth.profileState, { autoCloseTriggered: false });
            }, 1500);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        
        // Show error message
        showStatus('Gagal menyimpan profil: ' + error.message, 'error');
        
        if (window.notify) {
            window.notify.error('Gagal', 'Profil gagal disimpan: ' + error.message);
        }
        
        // Reset loading state
        if (window.Auth && window.Auth.profileState) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, { isLoading: false });
        }
    } finally {
        updateSaveButtonState();
    }
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveProfile');
    const saveText = document.getElementById('saveText');
    const saveLoading = document.getElementById('saveLoading');

    if (!saveBtn || !saveText || !saveLoading) return;

    const isLoading = (window.Auth && window.Auth.profileState && window.Auth.profileState.isLoading) || false;
    const hasChanges = (window.Auth && window.Auth.profileState && window.Auth.profileState.hasChanges) || false;
    
    saveBtn.disabled = !hasChanges || isLoading;

    if (isLoading) {
        saveText.style.display = 'none';
        saveLoading.style.display = 'flex';
        saveBtn.style.cursor = 'wait';
    } else {
        saveText.style.display = 'inline';
        saveLoading.style.display = 'none';
        saveBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
    }
}

// =======================
// Modal System
// =======================
class ModalSystem {
    constructor() {
        this.modals = new Map();
        this.init();
    }

    init() {
        this.injectModalCSS();
        console.log('📦 Modal System Initialized');
    }

    injectModalCSS() {
        if (document.querySelector('#modal-css')) return;

        const style = document.createElement('style');
        style.id = 'modal-css';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 100000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: translateY(-20px) scale(0.95);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .modal.active {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f9fafb;
            }
            
            .modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #6b7280;
                cursor: pointer;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-content {
                padding: 24px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: 20px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #f9fafb;
            }
            
            .modal-btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }
            
            .modal-btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .modal-btn-primary:hover {
                background: #2563eb;
                transform: translateY(-2px);
            }
            
            .modal-btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .modal-btn-secondary:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(style);
    }

    show(options) {
        const {
            title = 'Modal',
            content = '',
            buttons = [],
            onClose = null,
            closeOnOverlayClick = true
        } = options;

        const id = `modal-${Date.now()}`;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = `${id}-overlay`;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleEl = document.createElement('h2');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.hide(id));
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Content
        const contentEl = document.createElement('div');
        contentEl.className = 'modal-content';
        
        if (typeof content === 'string') {
            contentEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentEl.appendChild(content);
        } else {
            contentEl.textContent = content;
        }

        // Footer with buttons
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `modal-btn modal-btn-${btn.type || 'secondary'}`;
            button.textContent = btn.text;
            
            if (btn.onClick) {
                button.addEventListener('click', () => {
                    btn.onClick();
                    if (btn.closeOnClick !== false) {
                        this.hide(id);
                    }
                });
            } else {
                button.addEventListener('click', () => this.hide(id));
            }
            
            footer.appendChild(button);
        });

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(contentEl);
        if (buttons.length > 0) {
            modal.appendChild(footer);
        }

        // Assemble overlay
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Store reference
        this.modals.set(id, { overlay, modal, onClose });

        // Show with animation
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.classList.add('active');
        }, 10);

        // Overlay click handler
        if (closeOnOverlayClick) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide(id);
                }
            });
        }

        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide(id);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        this.modals.get(id).escapeHandler = escapeHandler;

        return id;
    }

    hide(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        const { overlay, modal, onClose, escapeHandler } = modalData;

        // Remove escape handler
        if (escapeHandler) {
            document.removeEventListener('keydown', escapeHandler);
        }

        // Animate out
        modal.classList.remove('active');
        overlay.style.opacity = '0';

        // Remove from DOM
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.modals.delete(id);
            
            // Call onClose callback
            if (onClose) {
                onClose();
            }
        }, 300);
    }

    confirm(options) {
        return new Promise((resolve) => {
            const modalId = this.show({
                title: options.title || 'Konfirmasi',
                content: options.message || 'Apakah anda yakin?',
                buttons: [
                    {
                        text: options.cancelText || 'Batal',
                        type: 'secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        text: options.confirmText || 'Ya',
                        type: 'primary',
                        onClick: () => resolve(true)
                    }
                ]
            });
            
            // Store modal ID for potential programmatic closing
            this.modals.get(modalId).promiseResolve = resolve;
        });
    }

    alert(options) {
        return new Promise((resolve) => {
            this.show({
                title: options.title || 'Informasi',
                content: options.message || '',
                buttons: [
                    {
                        text: options.okText || 'OK',
                        type: 'primary',
                        onClick: () => resolve()
                    }
                ]
            });
        });
    }

    prompt(options) {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${Date.now()}`;
            const content = document.createElement('div');
            content.innerHTML = `
                <p style="margin-bottom: 12px; color: #374151;">${options.message || 'Masukkan nilai:'}</p>
                <input type="${options.type || 'text'}" 
                       id="${inputId}" 
                       class="prompt-input"
                       style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                       placeholder="${options.placeholder || ''}"
                       value="${options.defaultValue || ''}">
            `;
            
            const modalId = this.show({
                title: options.title || 'Input',
                content: content,
                buttons: [
                    {
                        text: options.cancelText || 'Batal',
                        type: 'secondary',
                        onClick: () => resolve(null)
                    },
                    {
                        text: options.confirmText || 'OK',
                        type: 'primary',
                        onClick: () => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : '');
                        }
                    }
                ]
            });
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) input.focus();
            }, 100);
        });
    }
}

// =======================
// Toast System
// =======================
class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        this.createContainer();
        this.injectToastCSS();
        console.log('🍞 Toast System Initialized');
    }

    createContainer() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    injectToastCSS() {
        if (document.querySelector('#toast-css')) return;

        const style = document.createElement('style');
        style.id = 'toast-css';
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                pointer-events: none;
                width: 100%;
                max-width: 400px;
            }
            
            .toast {
                background: #1f2937;
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                width: 100%;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                pointer-events: auto;
                backdrop-filter: blur(10px);
                background: rgba(31, 41, 55, 0.95);
            }
            
            .toast.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .toast.hide {
                transform: translateY(-100px);
                opacity: 0;
            }
            
            .toast-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.5;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .toast-close {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 20px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                flex-shrink: 0;
                padding: 0;
                line-height: 1;
            }
            
            .toast-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .toast.success {
                background: rgba(16, 185, 129, 0.95);
            }
            
            .toast.error {
                background: rgba(239, 68, 68, 0.95);
            }
            
            .toast.warning {
                background: rgba(245, 158, 11, 0.95);
            }
            
            .toast.info {
                background: rgba(59, 130, 246, 0.95);
            }
        `;
        document.head.appendChild(style);
    }

    show(message, options = {}) {
        const {
            type = 'info',
            duration = 3000,
            closeable = true,
            icon = null
        } = options;

        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast ${type}`;
        
        const iconContent = icon || this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${iconContent}</div>
            <div class="toast-message">${message}</div>
            ${closeable ? '<button class="toast-close">&times;</button>' : ''}
        `;

        // Event listeners
        if (closeable) {
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.hide(id);
            });
        }

        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                this.hide(id);
            }
        });

        // Add to container
        this.container.appendChild(toast);
        
        // Store reference
        this.toasts.set(id, { element: toast, timeout: null });

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-hide
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.hide(id);
            }, duration);
            this.toasts.get(id).timeout = timeout;
        }

        return id;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || '🔔';
    }

    hide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timeout } = toastData;
        
        if (timeout) clearTimeout(timeout);
        
        element.classList.remove('show');
        element.classList.add('hide');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
        }, 300);
    }

    clearAll() {
        this.toasts.forEach((toastData, id) => {
            this.hide(id);
        });
    }

    // Convenience methods
    success(message, duration = 3000) {
        return this.show(message, { type: 'success', duration });
    }

    error(message, duration = 4000) {
        return this.show(message, { type: 'error', duration });
    }

    warning(message, duration = 3500) {
        return this.show(message, { type: 'warning', duration });
    }

    info(message, duration = 2500) {
        return this.show(message, { type: 'info', duration });
    }
}

// =======================
// Loading System
// =======================
function showAuthLoading(text) {
    text = text || 'Memverifikasi sesi login…';
    
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
        injectLoadingCSS();
    }

    el.style.display = 'flex';
    const textEl = el.querySelector('.loading-text');
    if (textEl) textEl.textContent = text;
    
    // Force reflow for animation
    el.offsetHeight;
    
    console.log('[BYTEWARD]', text);
}

function hideAuthLoading() {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;
    
    el.style.opacity = '0';
    setTimeout(() => { 
        el.style.display = 'none';
        el.style.opacity = '1';
    }, 300);
}

function injectLoadingCSS() {
    if (document.querySelector('#loading-css')) return;
    
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
        
        .block-block:nth-child(3) {
            width: 14px;
            height: 45px;
        }
        
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
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// =======================
// Error Handling System
// =======================
function showError(message, options = {}) {
    const {
        title = 'System Error',
        duration = 5000,
        showNotification = true,
        showToast = false
    } = options;

    console.error('ByteWard Error:', message);
    
    // Show notification via notification.js (window.notify)
    if (showNotification && window.notify) {
        window.notify.error(title, message, duration);
    }
    
    // Show toast via internal toast system
    if (showToast && window.UI && window.UI.Toast) {
        window.UI.Toast.error(message, { duration });
    }
    
    // Legacy fallback (only if no other system works)
    if (!showNotification && !showToast) {
        let el = document.getElementById('systemError');
        if (!el) {
            el = document.createElement('div');
            el.id = 'systemError';
            el.className = 'system-error';
            document.body.appendChild(el);
            injectErrorCSS();
        }
        
        el.textContent = `ByteWard Error: ${message}`;
        el.style.display = 'block';
        
        setTimeout(() => {
            el.style.display = 'none';
        }, duration);
    }
}

function injectErrorCSS() {
    if (document.querySelector('#error-css')) return;
    
    const style = document.createElement('style');
    style.id = 'error-css';
    style.textContent = `
        .system-error {
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
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: system-ui, -apple-system, sans-serif;
            display: none;
            backdrop-filter: blur(10px);
            background: rgba(254, 226, 226, 0.95);
        }
    `;
    document.head.appendChild(style);
}

// =======================
// Utility Functions
// =======================
function generateDefaultAvatar(seed) {
    const defaultSeed = seed || 'user' + Date.now();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
}

// =======================
// CSS Injection System
// =======================
function injectProfileCSS() {
    if (document.querySelector('link[href*="profile.css"]')) return;

    const cssPath = window.ByteWard ? 
        window.ByteWard.buildFullPath(window.ByteWard.APP_CONFIG.ASSETS.profileCSS) : 
        '/assets/css/profile.css';
    
    console.log('🎨 Memuat profile CSS dari:', cssPath);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.id = 'profile-css';

    link.onerror = function() {
        console.warn('Profile CSS gagal dimuat');
        injectFallbackCSS();
    };

    link.onload = function() { 
        console.log('✅ Profile CSS berhasil dimuat'); 
        
        // Add additional profile-specific styles
        const additionalStyles = document.createElement('style');
        additionalStyles.textContent = `
            .profile-button-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .profile-button {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: white;
                cursor: pointer;
                padding: 0;
                position: relative;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .profile-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .profile-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .profile-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .profile-button-container {
                    top: 10px;
                    right: 10px;
                }
                
                .profile-button {
                    width: 40px;
                    height: 40px;
                }
            }
        `;
        document.head.appendChild(additionalStyles);
    };
    document.head.appendChild(link);
}

function injectFallbackCSS() {
    if (document.querySelector('#profile-fallback-css')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/profile-fallback.css';
    link.id = 'profile-fallback-css';
    
    link.onerror = function() { 
        console.warn('Fallback CSS juga gagal dimuat');
        
        // Ultimate fallback
        const style = document.createElement('style');
        style.textContent = `
            .profile-button-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .profile-button {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid #3b82f6;
                background: white;
                cursor: pointer;
                padding: 0;
                position: relative;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .profile-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    };
    
    document.head.appendChild(link);
}

// =======================
// Initialization System
// =======================
function initializeUISystem() {
    console.log(`🚀 Initializing UI System v${UI_CONFIG.version}...`);
    
    try {
        // Inject required CSS
        injectProfileCSS();
        
        // --- INTEGRATION POINT ---
        // Link UI Notification to the external NotificationSystem from notification.js
        // This ensures Auth and UI components use the same visual notification engine.
        const notificationManager = window.Notifications || window.notify;
        
        if (notificationManager) {
            console.log('🔗 UI System linked to notification.js');
            window.UI.Notification = notificationManager;
        } else {
            console.warn('⚠️ notification.js not found. Notifications may not work until loaded.');
            // Create a dummy placeholder to prevent crashes
            window.UI.Notification = {
                success: (t,m,d) => console.log(`[Mock Notif] Success: ${t} - ${m}`),
                error: (t,m,d) => console.error(`[Mock Notif] Error: ${t} - ${m}`),
                warning: (t,m,d) => console.warn(`[Mock Notif] Warning: ${t} - ${m}`),
                info: (t,m,d) => console.log(`[Mock Notif] Info: ${t} - ${m}`)
            };
        }
        // ------------------------

        // Initialize other internal systems
        const modalSystem = new ModalSystem();
        const toastSystem = new ToastSystem();
        
        window.UI.Modal = modalSystem;
        window.UI.Toast = toastSystem;
        
        // Create profile button if user is logged in
        if (window.Auth && window.Auth.currentUser) {
            setTimeout(() => { 
                createProfileButton(); 
                console.log('✅ Profile button created');
            }, 1000);
        }
        
        // Setup global error handler
        window.addEventListener('error', (event) => {
            showError(event.message, { showNotification: true });
        });
        
        // Setup unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            showError(event.reason?.message || 'Unhandled Promise Rejection', { showNotification: true });
        });
        
        console.log('✅ UI System successfully initialized with:');
        console.log('   - Notification System (External) ✓');
        console.log('   - Modal System ✓');
        console.log('   - Toast System ✓');
        console.log('   - Profile System ✓');
        console.log('   - Loading System ✓');
        console.log('   - Error System ✓');
        
    } catch (error) {
        console.error('❌ Failed to initialize UI System:', error);
        showError(`UI System initialization failed: ${error.message}`, { showNotification: false });
    }
}

// =======================
// Global Exports
// =======================
window.UI = window.UI || {};
Object.assign(window.UI, {
    // Configuration
    config: UI_CONFIG,
    
    // Profile System
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
    
    // CSS Management
    injectProfileCSS,
    injectFallbackCSS,
    
    // Loading System
    showAuthLoading,
    hideAuthLoading,
    injectLoadingCSS,
    
    // Error Handling
    showError,
    injectErrorCSS,
    
    // Utility
    generateDefaultAvatar,
    
    // Initialization
    initialize: initializeUISystem
});

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUISystem);
} else {
    setTimeout(initializeUISystem, 100);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UI: window.UI,
        Modal: window.UI.Modal,
        Toast: window.UI.Toast
    };
}

console.log(`🎨 UI Module v${UI_CONFIG.version} - Compatible with notification.js`);
