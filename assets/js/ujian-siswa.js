// ujian-siswa.js - Page Specific JavaScript for Ujian Siswa Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Loading Ujian Siswa Page...');
    
    // Initialize Student Exams Manager
    function initializeStudentExams() {
        console.log('🔄 Menginisialisasi Pengelolaan Ujian Siswa...');
        
        // Setup tab switching
        setupTabSwitching();
        
        // Setup exam controls
        setupExamControls();
        
        // Setup monitoring panel
        setupMonitoringPanel();
        
        // Setup quick actions
        setupQuickActions();
        
        // Load initial exam data
        loadExamData();
    }
    
    // Setup Tab Switching
    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Animate tab transition
                animateTabTransition(tabId);
                
                // Load data for the selected tab
                loadTabData(tabId);
            });
        });
    }
    
    // Setup Exam Controls
    function setupExamControls() {
        const btnAddExam = document.getElementById('btn-add-exam');
        const btnRefresh = document.querySelector('.btn-refresh');
        const searchInput = document.getElementById('search-exam');
        
        // Add Exam button
        if (btnAddExam) {
            btnAddExam.addEventListener('click', function() {
                showAddExamModal();
                animateButton(this);
            });
        }
        
        // Refresh button
        if (btnRefresh) {
            btnRefresh.addEventListener('click', function() {
                refreshExamData();
                animateButton(this);
            });
        }
        
        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function() {
                searchExams(this.value);
            }, 300));
        }
        
        // Schedule Exam button (in empty state)
        const btnScheduleExam = document.getElementById('btn-schedule-exam');
        if (btnScheduleExam) {
            btnScheduleExam.addEventListener('click', function() {
                showAddExamModal();
                animateButton(this);
            });
        }
        
        // Create Draft button (in empty state)
        const btnCreateDraft = document.getElementById('btn-create-draft');
        if (btnCreateDraft) {
            btnCreateDraft.addEventListener('click', function() {
                showCreateDraftModal();
                animateButton(this);
            });
        }
        
        // Bulk action button
        const btnBulkAction = document.querySelector('.btn-bulk-action');
        if (btnBulkAction) {
            btnBulkAction.addEventListener('click', function() {
                showBulkActionModal();
                animateButton(this);
            });
        }
    }
    
    // Setup Monitoring Panel
    function setupMonitoringPanel() {
        const btnPause = document.querySelector('.btn-pause');
        const btnEnd = document.querySelector('.btn-end');
        
        // Pause button
        if (btnPause) {
            btnPause.addEventListener('click', function() {
                pauseExam();
                animateButton(this);
            });
        }
        
        // End button
        if (btnEnd) {
            btnEnd.addEventListener('click', function() {
                endExam();
                animateButton(this);
            });
        }
        
        // Setup exam card action buttons (delegated events)
        document.addEventListener('click', function(e) {
            // Monitor button
            if (e.target.closest('.btn-monitor')) {
                const btn = e.target.closest('.btn-monitor');
                const examCard = btn.closest('.exam-card');
                const examTitle = examCard.querySelector('.exam-title').textContent;
                monitorExam(examTitle);
                animateButton(btn);
            }
            
            // Edit button
            if (e.target.closest('.btn-action-small .fa-edit')) {
                const btn = e.target.closest('.btn-action-small');
                const examCard = btn.closest('.exam-card');
                const examTitle = examCard.querySelector('.exam-title').textContent;
                editExam(examTitle);
                animateButton(btn);
            }
            
            // Delete button
            if (e.target.closest('.btn-action-small .fa-trash')) {
                const btn = e.target.closest('.btn-action-small');
                const examCard = btn.closest('.exam-card');
                const examTitle = examCard.querySelector('.exam-title').textContent;
                deleteExam(examTitle, examCard);
                animateButton(btn);
            }
            
            // Monitor button in header
            if (e.target.closest('.btn-action-small .fa-tv')) {
                const btn = e.target.closest('.btn-action-small');
                const examCard = btn.closest('.exam-card');
                const examTitle = examCard.querySelector('.exam-title').textContent;
                monitorExam(examTitle);
                animateButton(btn);
            }
        });
    }
    
    // Setup Quick Actions
    function setupQuickActions() {
        const actionCards = document.querySelectorAll('.action-card');
        
        actionCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Only trigger if not clicking on the button itself
                if (!e.target.closest('.btn-action-small')) {
                    const actionTitle = this.querySelector('h4').textContent;
                    runQuickAction(actionTitle);
                }
            });
            
            // Setup button inside action card
            const actionBtn = card.querySelector('.btn-action-small');
            if (actionBtn) {
                actionBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent card click event
                    const actionTitle = card.querySelector('h4').textContent;
                    runQuickAction(actionTitle);
                    animateButton(this);
                });
            }
        });
    }
    
    // Load Exam Data
    function loadExamData() {
        console.log('Loading exam data...');
        
        // Show loading state
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            // In a real app, this would fetch data from server
            // For now, we'll just update the UI
            updateExamStats();
            updateActivityFeed();
            
            // Hide loading
            hideLoading();
            
            console.log('✅ Exam data loaded');
        }, 1000);
    }
    
    // Load Tab Data
    function loadTabData(tabId) {
        console.log('Loading data for tab:', tabId);
        
        const tabContents = {
            'berlangsung': 'Sedang Berlangsung',
            'akan-datang': 'Akan Datang',
            'selesai': 'Selesai',
            'draft': 'Draft'
        };
        
        showToast(`Memuat data: ${tabContents[tabId]}`, 'info');
    }
    
    // Update Exam Stats
    function updateExamStats() {
        console.log('Updating exam statistics...');
        
        // In a real app, this would update based on real data
        // For now, we'll just update with mock data
        const stats = {
            total: 45,
            active: 41,
            completed: 3,
            pending: 1
        };
        
        // Update monitoring stats
        document.querySelectorAll('.monitoring-stat .stat-value').forEach((stat, index) => {
            const values = Object.values(stats);
            if (values[index] !== undefined) {
                stat.textContent = values[index];
            }
        });
        
        // Update progress bars
        document.querySelectorAll('.exam-progress .progress-fill').forEach(progress => {
            const randomProgress = Math.floor(Math.random() * 50) + 50;
            progress.style.width = `${randomProgress}%`;
            progress.closest('.exam-progress').querySelector('.progress-text').textContent = `${randomProgress}% selesai`;
        });
    }
    
    // Update Activity Feed
    function updateActivityFeed() {
        console.log('Updating activity feed...');
        
        const activities = [
            {
                icon: 'fa-user-check',
                student: 'Dian Pratama',
                action: 'menyelesaikan ujian',
                time: 'baru saja'
            },
            {
                icon: 'fa-flag',
                student: 'Eka Wulandari',
                action: 'melaporkan soal',
                time: '5 menit lalu'
            },
            {
                icon: 'fa-question-circle',
                student: 'Fajar Setiawan',
                action: 'mengajukan pertanyaan',
                time: '12 menit lalu'
            },
            {
                icon: 'fa-clock',
                student: 'Gita Maharani',
                action: 'meminta waktu tambahan',
                time: '20 menit lalu'
            }
        ];
        
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            // Clear existing activities (keep first 3 for demo)
            const existingItems = activityList.querySelectorAll('.activity-item');
            for (let i = 3; i < existingItems.length; i++) {
                existingItems[i].remove();
            }
            
            // Add new activities
            activities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <strong>${activity.student}</strong> ${activity.action}
                        <span class="activity-time">${activity.time}</span>
                    </div>
                `;
                activityList.prepend(activityItem);
            });
        }
    }
    
    // Show Add Exam Modal
    function showAddExamModal() {
        const modal = document.createElement('div');
        modal.className = 'exam-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Jadwalkan Ujian Baru</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="modal-exam-title">Judul Ujian</label>
                        <input type="text" id="modal-exam-title" class="form-control" placeholder="Masukkan judul ujian">
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-exam-type">Jenis Ujian</label>
                        <select id="modal-exam-type" class="form-control">
                            <option value="regular">Reguler</option>
                            <option value="quiz">Quiz</option>
                            <option value="uts">UTS</option>
                            <option value="uas">UAS</option>
                        </select>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="modal-exam-date">Tanggal</label>
                            <input type="date" id="modal-exam-date" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="modal-exam-time">Waktu</label>
                            <input type="time" id="modal-exam-time" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-exam-duration">Durasi (menit)</label>
                        <input type="number" id="modal-exam-duration" class="form-control" value="90" min="15" max="180">
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel">Batal</button>
                    <button class="btn-modal btn-modal-save">Jadwalkan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set default date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        modal.querySelector('#modal-exam-date').value = tomorrow.toISOString().split('T')[0];
        modal.querySelector('#modal-exam-time').value = '08:00';
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('.btn-modal-save').addEventListener('click', () => {
            const title = modal.querySelector('#modal-exam-title').value;
            const type = modal.querySelector('#modal-exam-type').value;
            const date = modal.querySelector('#modal-exam-date').value;
            const time = modal.querySelector('#modal-exam-time').value;
            const duration = modal.querySelector('#modal-exam-duration').value;
            
            if (!title.trim()) {
                showToast('Judul ujian tidak boleh kosong', 'error');
                return;
            }
            
            console.log('Scheduling exam:', { title, type, date, time, duration });
            
            // In a real app, this would save to server
            showToast('Ujian berhasil dijadwalkan', 'success');
            closeModal(modal);
            
            // Refresh exam data
            setTimeout(refreshExamData, 500);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
        
        // Add modal styles if not already added
        addModalStyles();
    }
    
    // Show Create Draft Modal
    function showCreateDraftModal() {
        showToast('Fitur buat draft akan segera tersedia', 'info');
    }
    
    // Show Bulk Action Modal
    function showBulkActionModal() {
        showToast('Fitur aksi massal akan segera tersedia', 'info');
    }
    
    // Monitor Exam
    function monitorExam(examTitle) {
        console.log('Monitoring exam:', examTitle);
        
        // Update monitoring panel header
        const panelHeader = document.querySelector('.panel-header h3');
        if (panelHeader) {
            panelHeader.innerHTML = `<i class="fas fa-tv"></i> Monitoring: ${examTitle}`;
        }
        
        // Show monitoring panel if hidden
        const monitoringPanel = document.querySelector('.monitoring-panel');
        if (monitoringPanel) {
            monitoringPanel.style.display = 'block';
        }
        
        // Start simulated monitoring
        startSimulatedMonitoring();
        
        showToast(`Memulai monitoring: ${examTitle}`, 'success');
    }
    
    // Start Simulated Monitoring
    function startSimulatedMonitoring() {
        console.log('Starting simulated monitoring...');
        
        // Update stats every 10 seconds
        if (window.monitoringInterval) {
            clearInterval(window.monitoringInterval);
        }
        
        window.monitoringInterval = setInterval(() => {
            // Simulate activity updates
            updateActivityFeed();
            
            // Simulate stat changes
            const stats = document.querySelectorAll('.monitoring-stat .stat-value');
            if (stats.length >= 4) {
                // Random small changes to stats
                stats[1].textContent = Math.max(0, parseInt(stats[1].textContent) + Math.floor(Math.random() * 3) - 1);
                stats[2].textContent = Math.max(0, parseInt(stats[2].textContent) + Math.floor(Math.random() * 2));
                stats[3].textContent = Math.max(0, parseInt(stats[3].textContent) - Math.floor(Math.random() * 2));
            }
        }, 10000);
    }
    
    // Pause Exam
    function pauseExam() {
        const isPaused = document.querySelector('.btn-pause').classList.contains('paused');
        
        if (isPaused) {
            // Resume exam
            document.querySelector('.btn-pause').classList.remove('paused');
            document.querySelector('.btn-pause').innerHTML = '<i class="fas fa-pause"></i> Jeda';
            showToast('Ujian dilanjutkan', 'success');
            startSimulatedMonitoring();
        } else {
            // Pause exam
            document.querySelector('.btn-pause').classList.add('paused');
            document.querySelector('.btn-pause').innerHTML = '<i class="fas fa-play"></i> Lanjut';
            showToast('Ujian dijeda', 'warning');
            
            // Stop monitoring updates
            if (window.monitoringInterval) {
                clearInterval(window.monitoringInterval);
                window.monitoringInterval = null;
            }
        }
    }
    
    // End Exam
    function endExam() {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Konfirmasi Akhiri Ujian</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin mengakhiri ujian ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div class="warning-message">
                        <i class="fas fa-info-circle"></i>
                        <span>Siswa yang belum menyelesaikan akan otomatis mendapat nilai sesuai jawaban yang telah dikerjakan.</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel">Batal</button>
                    <button class="btn-modal btn-modal-confirm">Akhiri Ujian</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('.btn-modal-confirm').addEventListener('click', () => {
            console.log('Ending exam...');
            showToast('Ujian telah diakhiri', 'success');
            closeModal(modal);
            
            // Stop monitoring
            if (window.monitoringInterval) {
                clearInterval(window.monitoringInterval);
                window.monitoringInterval = null;
            }
            
            // Hide monitoring panel
            const monitoringPanel = document.querySelector('.monitoring-panel');
            if (monitoringPanel) {
                monitoringPanel.style.display = 'none';
            }
            
            // Refresh exam data
            setTimeout(refreshExamData, 1000);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }
    
    // Edit Exam
    function editExam(examTitle) {
        console.log('Editing exam:', examTitle);
        showToast(`Membuka editor untuk: ${examTitle}`, 'info');
        
        // In a real app, this would open an edit modal
        // For now, redirect to buat-ujian page
        setTimeout(() => {
            window.location.href = 'buat-ujian.html';
        }, 500);
    }
    
    // Delete Exam
    function deleteExam(examTitle, examCard) {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-trash-alt"></i> Konfirmasi Hapus Ujian</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin menghapus ujian "<strong>${examTitle}</strong>"?</p>
                    <div class="warning-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Tindakan ini akan menghapus semua data ujian termasuk hasil siswa. Tindakan ini tidak dapat dibatalkan.</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel">Batal</button>
                    <button class="btn-modal btn-modal-confirm">Hapus Ujian</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('.btn-modal-confirm').addEventListener('click', () => {
            console.log('Deleting exam:', examTitle);
            
            // Animate card removal
            examCard.style.transform = 'scale(0.9)';
            examCard.style.opacity = '0';
            
            setTimeout(() => {
                examCard.remove();
                showToast(`Ujian "${examTitle}" berhasil dihapus`, 'success');
                closeModal(modal);
                
                // Update exam count
                updateExamCount();
            }, 300);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }
    
    // Search Exams
    function searchExams(searchTerm) {
        console.log('Searching exams:', searchTerm);
        
        if (!searchTerm.trim()) {
            // Show all exams if search is empty
            document.querySelectorAll('.exam-card').forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        // Filter exams
        const searchLower = searchTerm.toLowerCase();
        document.querySelectorAll('.exam-card').forEach(card => {
            const title = card.querySelector('.exam-title').textContent.toLowerCase();
            const description = card.querySelector('.exam-description').textContent.toLowerCase();
            
            if (title.includes(searchLower) || description.includes(searchLower)) {
                card.style.display = 'block';
                card.style.animation = 'pulse 0.5s ease';
                setTimeout(() => card.style.animation = '', 500);
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Refresh Exam Data
    function refreshExamData() {
        console.log('Refreshing exam data...');
        
        // Show loading on refresh button
        const btnRefresh = document.querySelector('.btn-refresh');
        if (btnRefresh) {
            const originalHTML = btnRefresh.innerHTML;
            btnRefresh.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btnRefresh.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Update with new data
                updateExamStats();
                updateActivityFeed();
                
                // Restore button
                btnRefresh.innerHTML = originalHTML;
                btnRefresh.disabled = false;
                
                showToast('Data ujian diperbarui', 'success');
            }, 1500);
        }
    }
    
    // Run Quick Action
    function runQuickAction(actionTitle) {
        console.log('Running quick action:', actionTitle);
        
        const actions = {
            'Pengumuman': () => {
                showToast('Membuat pengumuman baru', 'info');
                // In a real app, this would open announcement modal
            },
            'Jadwal Ulang': () => {
                showToast('Membuka penjadwalan ulang', 'info');
                // In a real app, this would open reschedule modal
            },
            'Analisis Cepat': () => {
                showToast('Membuka analisis statistik', 'info');
                // In a real app, this would open analysis panel
            }
        };
        
        if (actions[actionTitle]) {
            actions[actionTitle]();
        }
    }
    
    // Update Exam Count
    function updateExamCount() {
        const examCounts = {
            'berlangsung': document.querySelectorAll('#berlangsung .exam-card').length,
            'akan-datang': 5, // Mock data
            'selesai': 12, // Mock data
            'draft': 2 // Mock data
        };
        
        // Update badge counts
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tabId = btn.dataset.tab;
            const badge = btn.querySelector('.tab-badge');
            if (badge && examCounts[tabId] !== undefined) {
                badge.textContent = examCounts[tabId];
            }
        });
    }
    
    // Animate Tab Transition
    function animateTabTransition(tabId) {
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.style.animation = 'none';
            setTimeout(() => {
                tabContent.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }
    
    // Animate Button
    function animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    // Show Loading
    function showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Memuat data ujian...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
    
    // Hide Loading
    function hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }
    
    // Close Modal
    function closeModal(modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        setTimeout(() => modal.remove(), 300);
    }
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Add Modal Styles
    function addModalStyles() {
        const styleId = 'exam-modal-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .exam-modal, .confirm-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s ease;
            }
            
            .exam-modal .modal-content,
            .confirm-modal .modal-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }
            
            .modal-header h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #0c4a6e;
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            
            .modal-header h3 i {
                color: #0ea5e9;
            }
            
            .modal-close {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: #f1f5f9;
                color: #64748b;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: #e2e8f0;
                color: #0c4a6e;
            }
            
            .modal-body {
                margin-bottom: 25px;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                color: #0c4a6e;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 14px;
            }
            
            .form-control {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 14px;
                color: #0c4a6e;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            }
            
            .form-control:focus {
                outline: none;
                border-color: #0ea5e9;
                box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
            }
            
            .warning-message {
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 10px;
                padding: 15px;
                margin-top: 20px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            
            .warning-message i {
                color: #f59e0b;
                font-size: 16px;
                margin-top: 2px;
            }
            
            .warning-message span {
                color: #92400e;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 25px;
            }
            
            .btn-modal {
                flex: 1;
                padding: 12px 20px;
                border-radius: 10px;
                border: none;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-modal-cancel {
                background: #f1f5f9;
                color: #64748b;
            }
            
            .btn-modal-cancel:hover {
                background: #e2e8f0;
            }
            
            .btn-modal-save, .btn-modal-confirm {
                background: linear-gradient(135deg, #0ea5e9, #38bdf8);
                color: white;
            }
            
            .btn-modal-save:hover, .btn-modal-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(14, 165, 233, 0.3);
            }
            
            .btn-modal-confirm {
                background: linear-gradient(135deg, #ef4444, #f87171);
            }
            
            .btn-modal-confirm:hover {
                box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .loading-spinner {
                text-align: center;
            }
            
            .loading-spinner i {
                font-size: 48px;
                color: #0ea5e9;
                margin-bottom: 15px;
            }
            
            .loading-spinner p {
                color: #0c4a6e;
                font-weight: 500;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Initialize page
    initializeStudentExams();
    
    // Update exam count on load
    setTimeout(updateExamCount, 500);
});