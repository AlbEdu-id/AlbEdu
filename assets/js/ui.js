// ByteWard UI Module v0.2.0 - Enhanced UI & Notification System dengan DiceBear
console.log('🎨 Memuat UI Module v0.2.0...');

// =======================
// Configuration
// =======================
const UI_CONFIG = {
    version: '0.2.0',
    features: {
        profileSystem: true,
        notificationSystem: true,
        loadingSystem: true,
        errorSystem: true
    },
    defaults: {
        maxNotifications: 5,
        autoCloseDuration: 5000
    }
};

// =======================
// Notification System
// =======================
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.counter = 0;
        this.maxStack = UI_CONFIG.defaults.maxNotifications;
        this.init();
    }

    init() {
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        this.injectNotificationCSS();
        this.setupEventListeners();
        console.log('🔔 Notification System Initialized');
    }

    injectNotificationCSS() {
        if (document.querySelector('#notification-css')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/css/notification.css';
        link.id = 'notification-css';

        link.onerror = function() {
            console.warn('Notification CSS failed to load, injecting fallback');
            this.injectNotificationFallbackCSS();
        }.bind(this);

        link.onload = function() { 
            console.log('✅ Notification CSS loaded'); 
        };
        document.head.appendChild(link);
    }

    injectNotificationFallbackCSS() {
        const style = document.createElement('style');
        style.id = 'notification-fallback-css';
        style.textContent = '.notification-container{position:fixed;top:20px;right:20px;z-index:100000;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;width:380px;}.notification{background:white;border-radius:12px;padding:16px;margin:8px 0;box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;max-width:380px;animation:slideIn 0.3s ease;}@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}';
        document.head.appendChild(style);
    }

    setupEventListeners() {
        window.addEventListener('resize', function() { this.updatePosition(); }.bind(this));
        window.addEventListener('orientationchange', function() {
            setTimeout(function() { this.updatePosition(); }.bind(this), 100);
        }.bind(this));
        setTimeout(function() { this.updatePosition(); }.bind(this), 100);
    }

    updatePosition() {
        if (!this.container) return;
          
        var isMobile = window.innerWidth <= 767;
        if (isMobile) {
            this.container.style.cssText = 'position: fixed; bottom: 80px; left: 0; width: 100%; display: flex; flex-direction: column; align-items: center; z-index: 100000; pointer-events: none;';
        } else {
            this.container.style.cssText = 'position: fixed; top: 20px; right: 20px; width: 380px; display: flex; flex-direction: column; align-items: flex-end; z-index: 100000; pointer-events: none;';
        }
    }

    show(options) {
        var title = options.title || 'Notification';
        var message = options.message || '';
        var type = options.type || 'info';
        var duration = options.duration || UI_CONFIG.defaults.autoCloseDuration;
        var icon = options.icon || null;
        var closeable = options.closeable !== false;

        var id = 'notification-' + Date.now() + '-' + this.counter++;
        var notification = document.createElement('div');
        notification.id = id;
        notification.className = 'notification notification-' + type + ' notification-enter';
          
        var iconContent = icon || this.getIconByType(type);
        var typeTitle = this.getTypeTitle(type);
          
        notification.innerHTML = '<div class="notification-content">' +
            '<div class="notification-icon">' + iconContent + '</div>' +
            '<div class="notification-text">' +
                '<div class="notification-title">' + typeTitle + ': ' + title + '</div>' +
                (message ? '<div class="notification-message">' + message + '</div>' : '') +
            '</div>' +
            '</div>' +
            (closeable ? '<button class="notification-close">&times;</button>' : '') +
            '<div class="notification-progress">' +
                '<div class="notification-progress-bar" style="animation: progressShrink ' + duration + 'ms linear forwards;"></div>' +
            '</div>';

        if (closeable) {
            notification.querySelector('.notification-close').addEventListener('click', function() {
                this.remove(id);
            }.bind(this));
        }

        notification.addEventListener('click', function(e) {
            if (!e.target.closest('.notification-close')) {
                this.remove(id);
            }
        }.bind(this));

        this.notifications.set(id, {
            element: notification,
            timeout: setTimeout(function() {
                this.remove(id);
            }.bind(this), duration)
        });

        this.container.appendChild(notification);
        this.updateStack();

        requestAnimationFrame(function() {
            notification.classList.remove('notification-enter');
        });

        return id;
    }

    getIconByType(type) {
        var icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
        return icons[type] || '🔔';
    }

    getTypeTitle(type) {
        var titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
        return titles[type] || 'Notification';
    }

    updateStack() {
        var notifications = Array.from(this.container.children);
          
        if (notifications.length > this.maxStack) {
            var toRemove = notifications.slice(this.maxStack);
            toRemove.forEach(function(notification) {
                this.remove(notification.id);
            }.bind(this));
        }

        notifications.forEach(function(notification, index) {
            if (index > 0) {
                notification.classList.add('stacked');
                if (index >= 3) notification.style.zIndex = 100000 - index;
            } else {
                notification.classList.remove('stacked');
                notification.style.zIndex = 100000;
            }
        });
    }

    remove(id) {
        var data = this.notifications.get(id);
        if (!data) return;

        var element = data.element;
        var timeout = data.timeout;
        if (timeout) clearTimeout(timeout);

        element.classList.add('notification-exit');
        setTimeout(function() {
            if (element.parentNode) element.parentNode.removeChild(element);
            this.notifications.delete(id);
            this.updateStack();
        }.bind(this), 400);
    }

    clearAll() {
        Array.from(this.notifications.keys()).forEach(function(id) {
            this.remove(id);
        }.bind(this));
    }

    success(title, message, duration) {
        return this.show({ 
            title: title, 
            message: message, 
            type: 'success', 
            duration: duration || 4000, 
            icon: '✓' 
        });
    }

    error(title, message, duration) {
        return this.show({ 
            title: title, 
            message: message, 
            type: 'error', 
            duration: duration || 5000, 
            icon: '✗' 
        });
    }

    warning(title, message, duration) {
        return this.show({ 
            title: title, 
            message: message, 
            type: 'warning', 
            duration: duration || 4000, 
            icon: '⚠' 
        });
    }

    info(title, message, duration) {
        return this.show({ 
            title: title, 
            message: message, 
            type: 'info', 
            duration: duration || 3000, 
            icon: 'ℹ' 
        });
    }
}

// =======================
// Profile Button System
// =======================
function createProfileButton() {
    var existing = document.querySelector('.profile-button-container');
    if (existing) existing.remove();

    var container = document.createElement('div');
    container.className = 'profile-button-container';

    var button = document.createElement('button');
    button.className = 'profile-button';
    button.id = 'profileTrigger';
      
    // Gunakan avatar user atau default dengan DiceBear
    var avatarUrl = (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || 
                   ((window.Auth && window.Auth.currentUser) ? 
                    generateDefaultAvatar(window.Auth.currentUser.email) : 
                    generateDefaultAvatar('user'));
    
    // Buat img element dengan event handler untuk error
    var img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Profile';
    img.className = 'profile-image';
    img.onerror = function() {
        this.src = generateDefaultAvatar('user');
    };
    
    button.appendChild(img);

    if (window.Auth && window.Auth.profileState && !window.Auth.profileState.isProfileComplete) {
        var indicator = document.createElement('div');
        indicator.className = 'profile-indicator';
        indicator.textContent = '!';
        indicator.title = 'Profil belum lengkap';
        button.appendChild(indicator);
    }

    button.addEventListener('click', showProfilePanel);
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateProfileButton() {
    var button = document.getElementById('profileTrigger');
    if (!button) return;

    var img = button.querySelector('.profile-image');
    if (img && window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) {
        img.src = window.Auth.userData.foto_profil;
        // Tambahkan handler error untuk fallback
        img.onerror = function() {
            this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
        };
    }

    var indicator = button.querySelector('.profile-indicator');
    if (window.Auth && window.Auth.profileState && window.Auth.profileState.isProfileComplete) {
        if (indicator) indicator.remove();
    } else if (!indicator) {
        var newIndicator = document.createElement('div');
        newIndicator.className = 'profile-indicator';
        newIndicator.textContent = '!';
        newIndicator.title = 'Profil belum lengkap';
        button.appendChild(newIndicator);
    }
}

// =======================
// Profile Panel System (Tanpa innerHTML panjang)
// =======================
function createProfilePanel() {
    var existing = document.getElementById('profilePanel');
    if (existing) existing.remove();

    // Buat overlay
    var overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profileOverlay';

    // Buat panel
    var panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';

    // Header
    var header = document.createElement('div');
    header.className = 'profile-header';
    
    var headerTitle = document.createElement('h2');
    headerTitle.textContent = (window.Auth && window.Auth.profileState && window.Auth.profileState.isProfileComplete) ? 
                             'Profil Saya' : 'Lengkapi Profil';
    
    var closeButton = document.createElement('button');
    closeButton.className = 'close-profile';
    closeButton.id = 'closeProfile';
    
    var closeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeSVG.setAttribute('width', '20');
    closeSVG.setAttribute('height', '20');
    closeSVG.setAttribute('viewBox', '0 0 24 24');
    closeSVG.setAttribute('fill', 'none');
    closeSVG.setAttribute('stroke', 'currentColor');
    closeSVG.setAttribute('stroke-width', '2');
    
    var closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    closePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
    closeSVG.appendChild(closePath);
    closeButton.appendChild(closeSVG);
    
    header.appendChild(headerTitle);
    header.appendChild(closeButton);

    // Content
    var content = document.createElement('div');
    content.className = 'profile-content';

    // Current Profile Section
    var currentProfile = document.createElement('div');
    currentProfile.className = 'current-profile';
    
    var currentAvatar = document.createElement('img');
    currentAvatar.className = 'current-avatar';
    currentAvatar.alt = 'Current Avatar';
    currentAvatar.src = (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || 
                       generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
    currentAvatar.onerror = function() {
        this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
    };
    
    var currentName = document.createElement('div');
    currentName.className = 'current-name';
    currentName.textContent = (window.Auth && window.Auth.userData && window.Auth.userData.nama) || 
                             (window.Auth && window.Auth.currentUser && window.Auth.currentUser.displayName) || 
                             'Nama belum diisi';
    
    currentProfile.appendChild(currentAvatar);
    currentProfile.appendChild(currentName);

    // Edit Section
    var editSection = document.createElement('div');
    editSection.className = 'edit-section';

    // Name Input Group
    var nameInputGroup = document.createElement('div');
    nameInputGroup.className = 'name-input-group';
    
    var nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'profileName';
    nameLabel.textContent = 'Nama Lengkap';
    
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'profileName';
    nameInput.className = 'name-input';
    nameInput.placeholder = 'Masukkan nama lengkap';
    nameInput.value = (window.Auth && window.Auth.userData && window.Auth.userData.nama) || '';
    
    nameInputGroup.appendChild(nameLabel);
    nameInputGroup.appendChild(nameInput);

    // Avatar Options
    var avatarOptionsContainer = document.createElement('div');
    avatarOptionsContainer.className = 'avatar-options';
    
    var optionTitle = document.createElement('div');
    optionTitle.className = 'option-title';
    optionTitle.textContent = 'Pilih Avatar';
    
    var optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid';
    optionGrid.id = 'avatarOptions';
    
    avatarOptionsContainer.appendChild(optionTitle);
    avatarOptionsContainer.appendChild(optionGrid);

    // Custom Upload
    var customUpload = document.createElement('div');
    customUpload.className = 'custom-upload';
    
    var uploadLabel = document.createElement('label');
    uploadLabel.className = 'upload-label';
    
    var uploadSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    uploadSVG.setAttribute('width', '20');
    uploadSVG.setAttribute('height', '20');
    uploadSVG.setAttribute('viewBox', '0 0 24 24');
    uploadSVG.setAttribute('fill', 'none');
    uploadSVG.setAttribute('stroke', 'currentColor');
    uploadSVG.setAttribute('stroke-width', '2');
    uploadSVG.style.marginRight = '8px';
    
    var uploadPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    uploadPath1.setAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    var uploadPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    uploadPolyline.setAttribute('points', '17 8 12 3 7 8');
    var uploadLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    uploadLine.setAttribute('x1', '12');
    uploadLine.setAttribute('y1', '3');
    uploadLine.setAttribute('x2', '12');
    uploadLine.setAttribute('y2', '15');
    
    uploadSVG.appendChild(uploadPath1);
    uploadSVG.appendChild(uploadPolyline);
    uploadSVG.appendChild(uploadLine);
    
    uploadLabel.appendChild(uploadSVG);
    uploadLabel.appendChild(document.createTextNode('Unggah Foto Sendiri'));
    
    var uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.id = 'avatarUpload';
    uploadInput.className = 'upload-input';
    uploadInput.accept = 'image/*';
    uploadLabel.appendChild(uploadInput);
    
    var previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.id = 'previewContainer';
    
    var previewTitle = document.createElement('div');
    previewTitle.className = 'preview-title';
    previewTitle.textContent = 'Pratinjau:';
    
    var previewImage = document.createElement('img');
    previewImage.className = 'preview-image';
    previewImage.id = 'previewImage';
    
    previewContainer.appendChild(previewTitle);
    previewContainer.appendChild(previewImage);
    
    customUpload.appendChild(uploadLabel);
    customUpload.appendChild(previewContainer);

    // Status Message
    var statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    statusMessage.id = 'statusMessage';
    statusMessage.style.display = 'none';

    // Profile Actions
    var profileActions = document.createElement('div');
    profileActions.className = 'profile-actions';
    
    var saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.id = 'saveProfile';
    saveBtn.disabled = true;
    
    var saveText = document.createElement('span');
    saveText.id = 'saveText';
    saveText.textContent = 'Simpan Perubahan';
    
    var saveLoading = document.createElement('span');
    saveLoading.className = 'save-loading';
    saveLoading.id = 'saveLoading';
    
    var spinner = document.createElement('span');
    spinner.className = 'spinner';
    
    saveLoading.appendChild(spinner);
    saveLoading.appendChild(document.createTextNode('Menyimpan...'));
    
    saveBtn.appendChild(saveText);
    saveBtn.appendChild(saveLoading);
    
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.id = 'cancelEdit';
    cancelBtn.textContent = 'Batal';
    
    profileActions.appendChild(saveBtn);
    profileActions.appendChild(cancelBtn);

    // Assemble Edit Section
    editSection.appendChild(nameInputGroup);
    editSection.appendChild(avatarOptionsContainer);
    editSection.appendChild(customUpload);
    editSection.appendChild(statusMessage);
    editSection.appendChild(profileActions);

    // Assemble Content
    content.appendChild(currentProfile);
    content.appendChild(editSection);

    // Assemble Panel
    panel.appendChild(header);
    panel.appendChild(content);

    // Assemble Overlay
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Initialize panel functionality
    initializeProfilePanel();
}

function initializeProfilePanel() {
    populateAvatarOptions();

    document.getElementById('closeProfile').addEventListener('click', hideProfilePanel);
    document.getElementById('cancelEdit').addEventListener('click', hideProfilePanel);
    document.getElementById('profileOverlay').addEventListener('click', function(e) {
        if (e.target.id === 'profileOverlay') hideProfilePanel();
    });

    var nameInput = document.getElementById('profileName');
    nameInput.addEventListener('input', function() {
        if (window.Auth && window.Auth.profileState) {
            var state = Object.assign({}, window.Auth.profileState);
            state.tempName = nameInput.value.trim();
            window.Auth.profileState = state;
        }
        checkForChanges();
    });

    var uploadInput = document.getElementById('avatarUpload');
    uploadInput.addEventListener('change', handleAvatarUpload);

    document.getElementById('saveProfile').addEventListener('click', saveProfile);

    if (window.Auth && window.Auth.profileState) {
        var state = Object.assign({}, window.Auth.profileState);
        state.tempName = (window.Auth && window.Auth.userData && window.Auth.userData.nama) || '';
        window.Auth.profileState = state;
    }
    checkForChanges();
}

function populateAvatarOptions() {
    var container = document.getElementById('avatarOptions');
    if (!container) return;

    container.innerHTML = '';
    var avatars = (window.Auth && window.Auth.PROFILE_AVATARS) || [];

    avatars.forEach(function(avatar) {
        var option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.id = avatar.id;

        var img = document.createElement('img');
        img.src = avatar.url;
        img.alt = avatar.name;
        img.onerror = function() {
            var label = document.createElement('div');
            label.className = 'option-label';
            label.textContent = avatar.name;
            option.innerHTML = '';
            option.appendChild(label);
        };

        option.appendChild(img);

        // Cek apakah avatar ini yang sedang dipilih
        if (window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) {
            var currentUrl = window.Auth.userData.foto_profil;
            if (currentUrl === avatar.url) {
                option.classList.add('selected');
                if (window.Auth && window.Auth.profileState) {
                    window.Auth.profileState = Object.assign({}, window.Auth.profileState, { selectedAvatar: avatar.id });
                }
            }
        }

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

    document.querySelectorAll('.avatar-option').forEach(function(opt) {
        opt.classList.remove('selected');
        if (opt.dataset.id === avatarId) opt.classList.add('selected');
    });

    var previewContainer = document.getElementById('previewContainer');
    var previewImage = document.getElementById('previewImage');
    previewContainer.classList.remove('active');
    previewImage.src = '';

    checkForChanges();
}

function handleAvatarUpload(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        if (window.UI && window.UI.Notification && window.UI.Notification.error) {
            window.UI.Notification.error('Error', 'Hanya file gambar yang diperbolehkan');
        }
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        if (window.UI && window.UI.Notification && window.UI.Notification.error) {
            window.UI.Notification.error('Error', 'Ukuran gambar maksimal 2MB');
        }
        return;
    }

    try {
        var reader = new FileReader();
        reader.onload = function(e) {
            if (window.Auth && window.Auth.profileState) {
                window.Auth.profileState = Object.assign({}, window.Auth.profileState, {
                    customAvatar: e.target.result,
                    selectedAvatar: 'custom'
                });
            }

            document.querySelectorAll('.avatar-option').forEach(function(opt) {
                opt.classList.remove('selected');
            });
            var previewImage = document.getElementById('previewImage');
            var previewContainer = document.getElementById('previewContainer');
            previewImage.src = e.target.result;
            previewContainer.classList.add('active');
            checkForChanges();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        if (window.UI && window.UI.Notification && window.UI.Notification.error) {
            window.UI.Notification.error('Error', 'Gagal membaca file');
        }
        console.error('Upload error:', error);
    }
}

function checkForChanges() {
    var nameChanged = (window.Auth && window.Auth.profileState && window.Auth.profileState.tempName) !== 
                     ((window.Auth && window.Auth.userData && window.Auth.userData.nama) || '');
    var avatarChanged = false;

    if (window.Auth && window.Auth.profileState) {
        var state = window.Auth.profileState;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            avatarChanged = state.customAvatar !== ((window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || '');
        } else if (state.selectedAvatar) {
            var avatars = (window.Auth && window.Auth.PROFILE_AVATARS) || [];
            var selected = avatars.find(function(a) { return a.id === state.selectedAvatar; });
            avatarChanged = (selected && selected.url) !== ((window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) || '');
        }

        window.Auth.profileState = Object.assign({}, state, { hasChanges: nameChanged || avatarChanged });
    }

    var saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
        var isLoading = (window.Auth && window.Auth.profileState && window.Auth.profileState.isLoading) || false;
        var hasChanges = (window.Auth && window.Auth.profileState && window.Auth.profileState.hasChanges) || false;
        saveBtn.disabled = !hasChanges || isLoading;
    }
}

function showProfilePanel() {
    var overlay = document.getElementById('profileOverlay');
    var panel = document.getElementById('profilePanel');

    if (!overlay || !panel) {
        createProfilePanel();
        setTimeout(function() {
            document.getElementById('profileOverlay').classList.add('active');
            document.getElementById('profilePanel').classList.add('active');
        }, 10);
    } else {
        overlay.classList.add('active');
        setTimeout(function() { panel.classList.add('active'); }, 10);
    }

    var nameInput = document.getElementById('profileName');
    if (nameInput && window.Auth && window.Auth.userData) {
        nameInput.value = window.Auth.userData.nama || '';
        if (window.Auth && window.Auth.profileState) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, { tempName: window.Auth.userData.nama || '' });
        }
    }

    showStatus('', '');
    checkForChanges();
}

function hideProfilePanel() {
    var overlay = document.getElementById('profileOverlay');
    var panel = document.getElementById('profilePanel');

    if (panel) panel.classList.remove('active');
    if (overlay) {
        setTimeout(function() {
            overlay.classList.remove('active');
            var uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) uploadInput.value = '';
        }, 300);
    }
}

function showStatus(message, type) {
    var statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'status-message';
    statusEl.style.display = message ? 'block' : 'none';

    if (type === 'success') {
        statusEl.classList.add('status-success');
        setTimeout(function() { statusEl.style.display = 'none'; }, 3000);
    } else if (type === 'error') {
        statusEl.classList.add('status-error');
    }

    // Also show notification for important messages
    if (message && (type === 'success' || type === 'error')) {
        var notificationType = type === 'success' ? 'success' : 'error';
        var title = type === 'success' ? 'Success' : 'Error';
        if (window.UI && window.UI.Notification && window.UI.Notification[notificationType]) {
            window.UI.Notification[notificationType](title, message);
        }
    }
}

async function saveProfile() {
    if (!window.Auth || !window.Auth.profileState || !window.Auth.userData || !window.Auth.currentUser) return;

    var state = window.Auth.profileState;
    if (state.isLoading || !state.hasChanges) return;

    try {
        window.Auth.profileState = Object.assign({}, state, { isLoading: true });
        updateSaveButtonState();

        var updates = {};
        if (state.tempName && state.tempName !== window.Auth.userData.nama) {
            updates.nama = state.tempName.trim();
        }

        var newAvatarUrl = window.Auth.userData.foto_profil;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            newAvatarUrl = state.customAvatar;
        } else if (state.selectedAvatar) {
            var selected = (window.Auth.PROFILE_AVATARS || []).find(function(a) { return a.id === state.selectedAvatar; });
            newAvatarUrl = (selected && selected.url) || '';
        }

        if (newAvatarUrl && newAvatarUrl !== window.Auth.userData.foto_profil) {
            updates.foto_profil = newAvatarUrl;
        }

        var willBeComplete = window.Auth.checkProfileCompleteness(Object.assign({}, window.Auth.userData, updates));

        updates.profilLengkap = willBeComplete;
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        await firebaseDb.collection('users').doc(window.Auth.currentUser.uid).update(updates);

        window.Auth.userData = Object.assign({}, window.Auth.userData, updates);
        window.Auth.profileState = Object.assign({}, state, {
            isProfileComplete: willBeComplete,
            hasChanges: false,
            isLoading: false
        });

        updateProfileButton();
        
        // NOTIFIKASI SUKSES - Sistem Feedback
        if (window.UI && window.UI.Notification && window.UI.Notification.success) {
            window.UI.Notification.success('Sukses', 'Profil berhasil disimpan!');
        }

        var currentAvatar = document.querySelector('.current-avatar');
        var currentName = document.querySelector('.current-name');
        if (currentAvatar && updates.foto_profil) {
            currentAvatar.src = updates.foto_profil;
            currentAvatar.onerror = function() {
                this.src = generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
            };
        }
        if (currentName && updates.nama) currentName.textContent = updates.nama;

        if (willBeComplete && !state.autoCloseTriggered) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, { autoCloseTriggered: true });
            setTimeout(hideProfilePanel, 1500);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        
        // NOTIFIKASI ERROR - Sistem Feedback
        if (window.UI && window.UI.Notification && window.UI.Notification.error) {
            window.UI.Notification.error('Gagal', 'Profil gagal disimpan: ' + error.message);
        }
        
        if (window.Auth && window.Auth.profileState) {
            window.Auth.profileState = Object.assign({}, window.Auth.profileState, { isLoading: false });
        }
    } finally {
        updateSaveButtonState();
    }
}

function updateSaveButtonState() {
    var saveBtn = document.getElementById('saveProfile');
    var saveText = document.getElementById('saveText');
    var saveLoading = document.getElementById('saveLoading');

    if (!saveBtn) return;

    var isLoading = (window.Auth && window.Auth.profileState && window.Auth.profileState.isLoading) || false;
    var hasChanges = (window.Auth && window.Auth.profileState && window.Auth.profileState.hasChanges) || false;
    saveBtn.disabled = !hasChanges || isLoading;

    if (isLoading) {
        saveText.style.display = 'none';
        saveLoading.classList.add('active');
    } else {
        saveText.style.display = 'inline';
        saveLoading.classList.remove('active');
    }
}

// =======================
// CSS Injection System
// =======================
function injectProfileCSS() {
    if (document.querySelector('link[href*="profile.css"]')) return;

    var cssPath = window.ByteWard ? 
        window.ByteWard.buildFullPath(window.ByteWard.APP_CONFIG.ASSETS.profileCSS) : 
        '/assets/css/profile.css';
      
    console.log('🎨 Memuat profile CSS dari:', cssPath);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.id = 'profile-css';

    link.onerror = function() {
        console.warn('Profile CSS gagal dimuat');
        injectFallbackCSS();
    };

    link.onload = function() { console.log('✅ Profile CSS berhasil dimuat'); };
    document.head.appendChild(link);
}

function injectFallbackCSS() {
    if (document.querySelector('#profile-fallback-css')) return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/profile-fallback.css';
    link.id = 'profile-fallback-css';
      
    link.onerror = function() { console.warn('Fallback CSS juga gagal dimuat'); };
    document.head.appendChild(link);
}

// =======================
// Loading System
// =======================
function showAuthLoading(text) {
    text = text || 'Memverifikasi sesi login…';
      
    var el = document.getElementById('loadingIndicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.className = 'loading-indicator';
          
        el.innerHTML = '' +
            '<div class="block-loader">' +
                '<div class="block-block" style="--i:0"></div>' +
                '<div class="block-block" style="--i:1"></div>' +
                '<div class="block-block" style="--i:2"></div>' +
                '<div class="block-block" style="--i:3"></div>' +
                '<div class="block-block" style="--i:4"></div>' +
            '</div>' +
            '<div class="loading-text">' + text + '</div>' +
            '<div class="progress-bar">' +
                '<div class="progress-fill"></div>' +
            '</div>';
          
        document.body.appendChild(el);
        injectLoadingCSS();
    }

    el.style.display = 'flex';
    var textEl = el.querySelector('.loading-text');
    if (textEl) textEl.textContent = text;
    console.log('[BYTEWARD]', text);
}

function hideAuthLoading() {
    var el = document.getElementById('loadingIndicator');
    if (!el) return;
      
    el.style.opacity = '0';
    setTimeout(function() { el.style.display = 'none'; }, 300);
}

function injectLoadingCSS() {
    if (document.querySelector('#loading-css')) return;
      
    var style = document.createElement('style');
    style.id = 'loading-css';
    style.textContent = '' +
        '.loading-indicator {' +
            'position: fixed;' +
            'top: 0; left: 0;' +
            'width: 100%; height: 100%;' +
            'background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);' +
            'display: none;' +
            'justify-content: center;' +
            'align-items: center;' +
            'z-index: 10000;' +
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;' +
            'flex-direction: column;' +
            'backdrop-filter: blur(4px);' +
        '}' +
        '.block-loader {' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'gap: 8px;' +
            'height: 60px;' +
        '}' +
        '.block-block {' +
            'width: 12px;' +
            'height: 40px;' +
            'background: linear-gradient(to bottom, #3b82f6, #2563eb);' +
            'border-radius: 4px;' +
            'animation: block-bounce 1.8s ease-in-out infinite;' +
            'animation-delay: calc(var(--i) * 0.15s);' +
            'box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);' +
        '}' +
        '.block-block:nth-child(odd) {' +
            'background: linear-gradient(to bottom, #1d4ed8, #3b82f6);' +
        '}' +
        '.block-block:nth-child(3) {' +
            'width: 14px; height: 45px;' +
        '}' +
        '@keyframes block-bounce {' +
            '0%, 60%, 100% { transform: translateY(0); }' +
            '30% { transform: translateY(-15px); }' +
        '}' +
        '.loading-text {' +
            'margin-top: 30px;' +
            'color: #1e293b;' +
            'font-size: 16px;' +
            'font-weight: 500;' +
            'text-align: center;' +
            'max-width: 300px;' +
            'line-height: 1.5;' +
        '}' +
        '.progress-bar {' +
            'width: 200px;' +
            'height: 4px;' +
            'background: #e2e8f0;' +
            'border-radius: 2px;' +
            'margin-top: 20px;' +
            'overflow: hidden;' +
        '}' +
        '.progress-fill {' +
            'width: 40%;' +
            'height: 100%;' +
            'background: linear-gradient(90deg, #3b82f6, #2563eb);' +
            'border-radius: 2px;' +
            'animation: progress-shift 2s ease-in-out infinite;' +
        '}' +
        '@keyframes progress-shift {' +
            '0%, 100% { transform: translateX(-100%); }' +
            '50% { transform: translateX(200%); }' +
        '}';
    document.head.appendChild(style);
}

// =======================
// Error Handling
// =======================
function showError(message) {
    if (window.UI && window.UI.Notification && window.UI.Notification.error) {
        window.UI.Notification.error('System Error', message);
    }
      
    // Legacy fallback
    var el = document.getElementById('systemError') || (function() {
        var div = document.createElement('div');
        div.id = 'systemError';
        div.className = 'system-error';
        document.body.appendChild(div);
        injectErrorCSS();
        return div;
    })();
      
    el.textContent = 'ByteWard Error: ' + message;
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 5000);
}

function injectErrorCSS() {
    if (document.querySelector('#error-css')) return;
      
    var style = document.createElement('style');
    style.id = 'error-css';
    style.textContent = '' +
        '.system-error {' +
            'position: fixed;' +
            'top: 20px; right: 20px;' +
            'background: #fee2e2;' +
            'color: #dc2626;' +
            'padding: 15px 20px;' +
            'border-radius: 8px;' +
            'border-left: 4px solid #dc2626;' +
            'z-index: 10000;' +
            'max-width: 420px;' +
            'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);' +
            'font-family: system-ui, -apple-system, sans-serif;' +
            'display: none;' +
        '}';
    document.head.appendChild(style);
}

// =======================
// Utility Functions
// =======================
// Fungsi global untuk generate avatar default (DiceBear)
function generateDefaultAvatar(seed) {
    const defaultSeed = seed || 'user' + Date.now();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
}

function initializeUISystem() {
    console.log('🚀 Initializing UI System v' + UI_CONFIG.version);
      
    // Inject required CSS
    injectProfileCSS();
      
    // Initialize notification system
    var notificationManager = new NotificationManager();
    window.UI.Notification = notificationManager;
      
    // Create profile button if user is logged in
    if (window.Auth && window.Auth.currentUser) {
        setTimeout(function() { createProfileButton(); }, 1000);
    }
      
    console.log('✅ UI System initialized successfully');
}

// =======================
// Global Exports
// =======================
window.UI = window.UI || {};
Object.assign(window.UI, {
    // Configuration
    config: UI_CONFIG,
      
    // Profile System
    createProfileButton: createProfileButton,
    updateProfileButton: updateProfileButton,
    createProfilePanel: createProfilePanel,
    initializeProfilePanel: initializeProfilePanel,
    populateAvatarOptions: populateAvatarOptions,
    selectAvatar: selectAvatar,
    handleAvatarUpload: handleAvatarUpload,
    checkForChanges: checkForChanges,
    showProfilePanel: showProfilePanel,
    hideProfilePanel: hideProfilePanel,
    showStatus: showStatus,
    saveProfile: saveProfile,
    updateSaveButtonState: updateSaveButtonState,
      
    // CSS Management
    injectProfileCSS: injectProfileCSS,
    injectFallbackCSS: injectFallbackCSS,
      
    // Loading System
    showAuthLoading: showAuthLoading,
    hideAuthLoading: hideAuthLoading,
      
    // Error Handling
    showError: showError,
      
    // Utility
    generateDefaultAvatar: generateDefaultAvatar,
      
    // Initialization
    initialize: initializeUISystem
});

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUISystem);
} else {
    setTimeout(initializeUISystem, 100);
}

console.log('🎨 UI Module v0.2.0 - Advanced UI System Ready');
