// profile.js - Page Specific JavaScript for Profile Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Loading Profile Page...');
    
    // Initialize Admin Profile
    function initializeAdminProfile() {
        console.log('🔄 Menginisialisasi Profil Admin');
        
        // Load data from Auth if available
        if (window.Auth && window.Auth.userData) {
            updateAdminProfile(window.Auth.userData);
        } else {
            // Use default admin data
            updateAdminProfile({
                nama: 'Admin AlbEdu',
                email: 'admin@alb.edu',
                foto_profil: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=0ea5e9',
                id: 'ADM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                peran: 'Administrator'
            });
        }
        
        // Setup event listeners
        setupProfileEventListeners();
    }
    
    // Update admin profile display
    function updateAdminProfile(userData) {
        const avatarElement = document.getElementById('admin-avatar');
        
        // Clear previous content
        avatarElement.innerHTML = '';
        
        // Try to load image, fallback to icon if fails
        const img = new Image();
        img.onload = function() {
            avatarElement.innerHTML = '';
            avatarElement.appendChild(img);
        };
        
        img.onerror = function() {
            avatarElement.innerHTML = '<i class="fas fa-user-circle"></i>';
            console.log('Avatar gagal dimuat, menggunakan fallback');
        };
        
        img.src = userData.foto_profil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.nama || 'Admin')}&backgroundColor=0ea5e9&radius=50`;
        img.alt = userData.nama || 'Admin AlbEdu';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        
        // Update name and email
        document.getElementById('admin-name').textContent = userData.nama || 'Admin AlbEdu';
        document.getElementById('admin-email').textContent = userData.email || 'admin@alb.edu';
        document.getElementById('admin-id').textContent = userData.id || 'ADM-001';
        
        // Set last login
        const lastLogin = new Date();
        document.getElementById('admin-last-login').textContent = lastLogin.toLocaleString('id-ID', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Setup event listeners for profile actions
    function setupProfileEventListeners() {
        // Avatar Edit Button
        const avatarEditBtn = document.getElementById('btn-avatar-edit');
        if (avatarEditBtn) {
            avatarEditBtn.addEventListener('click', showAvatarPicker);
        }
        
        // Edit Profile Button
        const editProfileBtn = document.getElementById('btn-edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', showEditProfileModal);
        }
    }
    
    // Show Edit Profile Modal
    function showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.id = 'editProfileModal';
        
        const currentName = document.getElementById('admin-name').textContent;
        const currentEmail = document.getElementById('admin-email').textContent;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-edit"></i> Edit Profil Admin</h3>
                    <button class="modal-close" id="closeEditModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editFullName">Nama Lengkap</label>
                        <input type="text" id="editFullName" class="form-control" 
                               value="${currentName}" placeholder="Masukkan nama lengkap">
                    </div>
                    <div class="form-group">
                        <label for="editAdminEmail">Email</label>
                        <div class="email-display">
                            <input type="email" id="editAdminEmail" class="form-control" 
                                   value="${currentEmail}" readonly disabled>
                            <div class="email-info">
                                <i class="fas fa-info-circle"></i>
                                <small>Email tidak dapat diubah karena digunakan untuk login sistem</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel" id="cancelEdit">Batal</button>
                    <button class="btn-modal btn-modal-save" id="saveEdit">Simpan Perubahan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('active');
            document.getElementById('editFullName').focus();
        }, 10);
        
        // Event listeners
        modal.querySelector('#closeEditModal').addEventListener('click', () => closeModal(modal));
        modal.querySelector('#cancelEdit').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('#saveEdit').addEventListener('click', () => {
            const newName = document.getElementById('editFullName').value.trim();
            
            if (!newName) {
                showToast('Nama tidak boleh kosong', 'error');
                document.getElementById('editFullName').focus();
                return;
            }
            
            if (newName.length < 3) {
                showToast('Nama minimal 3 karakter', 'error');
                document.getElementById('editFullName').focus();
                return;
            }
            
            // Update display
            document.getElementById('admin-name').textContent = newName;
            
            // Update in Auth system if available
            if (window.Auth && window.Auth.userData) {
                window.Auth.userData.nama = newName;
                
                // Update in Firestore if user is logged in
                if (window.Auth.currentUser) {
                    firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                        nama: newName,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        showToast('Profil berhasil diperbarui di database', 'success');
                    }).catch(err => {
                        console.error('Error updating profile:', err);
                        showToast('Gagal menyimpan ke database', 'error');
                    });
                }
            }
            
            showToast('Profil berhasil diperbarui', 'success');
            closeModal(modal);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }
    
    // Show Avatar Picker
    function showAvatarPicker() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.id = 'avatarPickerModal';
        
        // Generate avatars
        const avatars = [];
        const colors = ['0ea5e9', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
        
        for (let i = 1; i <= 15; i++) {
            const color = colors[(i - 1) % colors.length];
            avatars.push({
                id: `admin-avatar${i}`,
                url: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${i}&backgroundColor=${color}`,
                color: color
            });
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-circle"></i> Pilih Avatar Baru</h3>
                    <button class="modal-close" id="closeAvatarModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div id="avatarPreview" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 15px; overflow: hidden; border: 3px solid #0ea5e9; background: #f0f9ff;">
                            <i class="fas fa-user-circle" style="font-size: 80px; color: #0ea5e9; line-height: 100px;"></i>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">Preview Avatar</p>
                    </div>
                    <p style="color: #64748b; margin-bottom: 20px;">Pilih avatar untuk profil Anda:</p>
                    <div class="avatar-picker" id="avatarPicker">
                        ${avatars.map((avatar, index) => `
                            <div class="avatar-option ${index === 0 ? 'selected' : ''}" 
                                 data-avatar="${avatar.url}"
                                 data-color="${avatar.color}">
                                <img src="${avatar.url}" alt="Avatar ${index + 1}" 
                                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${index}&backgroundColor=${avatar.color}'">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel" id="cancelAvatar">Batal</button>
                    <button class="btn-modal btn-modal-save" id="saveAvatar">Simpan Avatar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Event listeners
        let selectedAvatar = avatars[0].url;
        const previewContainer = modal.querySelector('#avatarPreview');
        
        // Update preview when avatar is selected
        function updatePreview(avatarUrl) {
            previewContainer.innerHTML = '';
            const img = new Image();
            img.onload = function() {
                previewContainer.appendChild(img);
            };
            img.onerror = function() {
                previewContainer.innerHTML = '<i class="fas fa-user-circle" style="font-size: 80px; color: #0ea5e9; line-height: 100px;"></i>';
            };
            img.src = avatarUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
        }
        
        modal.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
                updatePreview(selectedAvatar);
            });
        });
        
        // Initialize preview with first avatar
        updatePreview(selectedAvatar);
        
        modal.querySelector('#closeAvatarModal').addEventListener('click', () => closeModal(modal));
        modal.querySelector('#cancelAvatar').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('#saveAvatar').addEventListener('click', () => {
            // Update avatar display
            updateAdminProfile({
                ...window.Auth?.userData || {},
                foto_profil: selectedAvatar
            });
            
            // Update in Auth system if available
            if (window.Auth && window.Auth.userData) {
                window.Auth.userData.foto_profil = selectedAvatar;
                
                // Update in Firestore if user is logged in
                if (window.Auth.currentUser) {
                    firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                        foto_profil: selectedAvatar,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        showToast('Avatar berhasil disimpan ke database', 'success');
                    }).catch(err => {
                        console.error('Error updating avatar:', err);
                        showToast('Gagal menyimpan avatar ke database', 'error');
                    });
                }
            }
            
            showToast('Avatar berhasil diubah', 'success');
            closeModal(modal);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }
    
    // Close Modal Helper
    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Initialize profile page
    initializeAdminProfile();
    
    // Ensure avatar consistency
    function ensureAvatarConsistency() {
        const avatarElement = document.getElementById('admin-avatar');
        if (avatarElement) {
            const img = avatarElement.querySelector('img');
            if (img && img.src) {
                img.onerror = function() {
                    const adminName = document.getElementById('admin-name').textContent;
                    this.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}&backgroundColor=0ea5e9`;
                };
            }
        }
    }
    
    // Refresh avatar every 5 minutes to ensure consistency
    setInterval(ensureAvatarConsistency, 300000);
});