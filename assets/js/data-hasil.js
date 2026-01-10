// data-hasil.js - Page Specific JavaScript for Data Hasil Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Loading Data Hasil Page...');
    
    // Chart instances
    let scoreDistributionChart = null;
    let passingStatusChart = null;
    
    // Initialize Data Results
    function initializeDataResults() {
        console.log('🔄 Menginisialisasi Data Hasil...');
        
        // Setup filters and controls
        setupFilters();
        
        // Initialize charts
        initializeCharts();
        
        // Load initial data
        loadResultsData();
        
        // Setup table interactions
        setupTableInteractions();
        
        // Initialize DataUjian module
        if (window.DataUjian) {
            window.DataUjian.init().then(() => {
                console.log('✅ Data Ujian module initialized successfully');
            }).catch(err => {
                console.error('❌ Failed to initialize Data Ujian:', err);
                showToast('Gagal menginisialisasi data ujian', 'error');
            });
        } else {
            console.warn('⚠️ DataUjian module not found, using mock functionality');
        }
    }
    
    // Setup Filters
    function setupFilters() {
        const btnApplyFilters = document.getElementById('btn-apply-filters');
        const btnExport = document.getElementById('btn-export-data');
        
        // Apply filters button
        btnApplyFilters.addEventListener('click', function() {
            applyFilters();
            animateButton(this);
        });
        
        // Export button
        btnExport.addEventListener('click', function() {
            exportData();
            animateButton(this);
        });
        
        // Custom date range selector
        const filterDate = document.getElementById('filter-date');
        filterDate.addEventListener('change', function() {
            if (this.value === 'custom') {
                showCustomDateRangePicker();
            }
        });
    }
    
    // Apply Filters
    function applyFilters() {
        const examFilter = document.getElementById('filter-exam').value;
        const classFilter = document.getElementById('filter-class').value;
        const dateFilter = document.getElementById('filter-date').value;
        
        console.log('Applying filters:', { examFilter, classFilter, dateFilter });
        
        // Show loading state
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            // Update data based on filters
            updateResultsData({
                exam: examFilter,
                class: classFilter,
                date: dateFilter
            });
            
            // Update charts
            updateCharts();
            
            // Hide loading
            hideLoading();
            
            showToast('Filter berhasil diterapkan', 'success');
        }, 1000);
    }
    
    // Export Data
    function exportData() {
        const examFilter = document.getElementById('filter-exam').value;
        const classFilter = document.getElementById('filter-class').value;
        const dateFilter = document.getElementById('filter-date').value;
        
        console.log('Exporting data with filters:', { examFilter, classFilter, dateFilter });
        
        // Use DataUjian module if available
        if (window.DataUjian && window.DataUjian.exportResults) {
            window.DataUjian.exportResults('csv')
                .then(filename => {
                    console.log('✅ Data exported successfully:', filename);
                    showToast(`Data berhasil diexport: ${filename}`, 'success');
                    
                    // Simulate download
                    simulateDownload(filename);
                })
                .catch(error => {
                    console.error('❌ Error exporting data:', error);
                    showToast('Gagal mengexport data', 'error');
                });
        } else {
            // Mock export
            const filename = `data_hasil_${new Date().getTime()}.csv`;
            console.log('📝 Mock export:', filename);
            showToast(`Data berhasil diexport: ${filename} (Mock)`, 'success');
            simulateDownload(filename);
        }
    }
    
    // Simulate file download
    function simulateDownload(filename) {
        const link = document.createElement('a');
        link.href = '#'; // In real app, this would be the actual file URL
        link.download = filename;
        link.click();
    }
    
    // Show custom date range picker
    function showCustomDateRangePicker() {
        const modal = document.createElement('div');
        modal.className = 'date-range-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-alt"></i> Pilih Rentang Tanggal</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="date-range-grid">
                        <div class="form-group">
                            <label for="start-date">Tanggal Mulai</label>
                            <input type="date" id="start-date" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="end-date">Tanggal Selesai</label>
                            <input type="date" id="end-date" class="form-control">
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel">Batal</button>
                    <button class="btn-modal btn-modal-save">Terapkan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set default dates (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        modal.querySelector('#start-date').value = startDate.toISOString().split('T')[0];
        modal.querySelector('#end-date').value = endDate.toISOString().split('T')[0];
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
        
        modal.querySelector('.btn-modal-save').addEventListener('click', () => {
            const startDate = modal.querySelector('#start-date').value;
            const endDate = modal.querySelector('#end-date').value;
            
            if (!startDate || !endDate) {
                showToast('Harap pilih kedua tanggal', 'error');
                return;
            }
            
            if (new Date(endDate) < new Date(startDate)) {
                showToast('Tanggal selesai harus setelah tanggal mulai', 'error');
                return;
            }
            
            console.log('Selected date range:', { startDate, endDate });
            closeModal(modal);
            
            // Update filter display
            const filterDate = document.getElementById('filter-date');
            filterDate.value = 'custom';
            
            showToast('Rentang tanggal berhasil diterapkan', 'success');
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
        
        // Add modal styles
        addModalStyles();
    }
    
    // Initialize Charts
    function initializeCharts() {
        // Score Distribution Chart
        const scoreCtx = document.getElementById('scoreDistributionChart').getContext('2d');
        
        const scoreData = {
            labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
            datasets: [{
                label: 'Jumlah Siswa',
                data: [5, 12, 28, 45, 32],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.2)',
                    'rgba(245, 158, 11, 0.2)',
                    'rgba(234, 179, 8, 0.2)',
                    'rgba(34, 197, 94, 0.2)',
                    'rgba(14, 165, 233, 0.2)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(234, 179, 8)',
                    'rgb(34, 197, 94)',
                    'rgb(14, 165, 233)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        };
        
        scoreDistributionChart = new Chart(scoreCtx, {
            type: 'bar',
            data: scoreData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} siswa`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: 'Poppins'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Jumlah Siswa',
                            color: '#475569',
                            font: {
                                family: 'Poppins',
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(226, 232, 240, 0.2)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: 'Poppins'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rentang Nilai',
                            color: '#475569',
                            font: {
                                family: 'Poppins',
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });
        
        // Passing Status Chart
        const passingCtx = document.getElementById('passingStatusChart').getContext('2d');
        
        const passingData = {
            labels: ['Lulus', 'Tidak Lulus', 'Belum Selesai'],
            datasets: [{
                data: [156, 24, 12],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)'
                ],
                borderWidth: 2,
                hoverOffset: 15
            }]
        };
        
        passingStatusChart = new Chart(passingCtx, {
            type: 'doughnut',
            data: passingData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#475569',
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} siswa (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Chart refresh buttons
        document.querySelectorAll('.btn-chart-action').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartType = this.dataset.chart;
                refreshChart(chartType);
                animateButton(this);
            });
        });
    }
    
    // Refresh Chart
    function refreshChart(chartType) {
        console.log('Refreshing chart:', chartType);
        
        // Show loading state
        const chartContainer = document.querySelector(`[data-chart="${chartType}"]`).closest('.chart-container');
        chartContainer.classList.add('loading');
        
        // Simulate data refresh
        setTimeout(() => {
            if (chartType === 'distribution' && scoreDistributionChart) {
                // Generate new random data
                const newData = Array.from({length: 5}, () => Math.floor(Math.random() * 50) + 10);
                scoreDistributionChart.data.datasets[0].data = newData;
                scoreDistributionChart.update();
            } else if (chartType === 'passing' && passingStatusChart) {
                // Generate new random data
                const passed = Math.floor(Math.random() * 100) + 100;
                const failed = Math.floor(Math.random() * 30) + 10;
                const pending = Math.floor(Math.random() * 20) + 5;
                
                passingStatusChart.data.datasets[0].data = [passed, failed, pending];
                passingStatusChart.update();
            }
            
            // Hide loading
            chartContainer.classList.remove('loading');
            showToast('Chart berhasil diperbarui', 'success');
        }, 800);
    }
    
    // Update Charts based on filters
    function updateCharts() {
        console.log('Updating charts with filtered data...');
        
        // In a real app, this would fetch new data based on filters
        // For now, we'll just simulate with random data
        
        if (scoreDistributionChart) {
            const newScoreData = Array.from({length: 5}, () => Math.floor(Math.random() * 40) + 10);
            scoreDistributionChart.data.datasets[0].data = newScoreData;
            scoreDistributionChart.update();
        }
        
        if (passingStatusChart) {
            const passed = Math.floor(Math.random() * 80) + 80;
            const failed = Math.floor(Math.random() * 20) + 5;
            const pending = Math.floor(Math.random() * 15) + 3;
            
            passingStatusChart.data.datasets[0].data = [passed, failed, pending];
            passingStatusChart.update();
        }
    }
    
    // Load Results Data
    function loadResultsData() {
        console.log('Loading results data...');
        
        // Use DataUjian module if available
        if (window.DataUjian && window.DataUjian.getExamResults) {
            window.DataUjian.getExamResults()
                .then(results => {
                    console.log('✅ Results data loaded:', results);
                    populateResultsTable(results);
                    updateStatistics(results);
                })
                .catch(error => {
                    console.error('❌ Error loading results:', error);
                    showToast('Gagal memuat data hasil', 'error');
                    // Fallback to mock data
                    loadMockResultsData();
                });
        } else {
            // Use mock data
            loadMockResultsData();
        }
    }
    
    // Load Mock Results Data
    function loadMockResultsData() {
        const mockData = generateMockResultsData(156);
        populateResultsTable(mockData);
        updateStatistics(mockData);
        console.log('📝 Using mock results data:', mockData.length, 'records');
    }
    
    // Generate Mock Results Data
    function generateMockResultsData(count) {
        const students = [
            'Ahmad Sanusi', 'Budi Santoso', 'Citra Dewi', 'Dian Pratama', 'Eka Wulandari',
            'Fajar Setiawan', 'Gita Maharani', 'Hendra Wijaya', 'Indah Permata', 'Joko Susilo',
            'Kartika Sari', 'Lukman Hakim', 'Maya Indah', 'Nova Pratama', 'Oki Setiawan',
            'Putri Anggraini', 'Rendi Saputra', 'Sari Dewi', 'Teguh Wijaya', 'Umi Kalsum'
        ];
        
        const exams = [
            { name: 'Matematika Kelas 10 - UTS', subject: 'matematika', grade: '10' },
            { name: 'Fisika Kelas 11 - UAS', subject: 'fisika', grade: '11' },
            { name: 'Kimia Kelas 12 - Try Out', subject: 'kimia', grade: '12' },
            { name: 'Bahasa Indonesia - Ulangan Harian', subject: 'bahasa-indonesia', grade: '10' },
            { name: 'Bahasa Inggris - Quiz', subject: 'bahasa-inggris', grade: '11' }
        ];
        
        const results = [];
        
        for (let i = 1; i <= count; i++) {
            const studentIndex = Math.floor(Math.random() * students.length);
            const examIndex = Math.floor(Math.random() * exams.length);
            const score = Math.floor(Math.random() * 40) + 60; // 60-100
            const status = score >= 65 ? 'lulus' : 'tidak-lulus';
            const time = Math.floor(Math.random() * 40) + 30; // 30-70 minutes
            
            // Random date within last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            results.push({
                id: i,
                student: students[studentIndex],
                class: exams[examIndex].grade,
                exam: exams[examIndex].name,
                score: score,
                status: status,
                time: time,
                date: date.toISOString().split('T')[0],
                subject: exams[examIndex].subject
            });
        }
        
        return results;
    }
    
    // Populate Results Table
    function populateResultsTable(results) {
        const tableBody = document.getElementById('results-table-body');
        const showingCount = document.getElementById('showing-count');
        const totalCount = document.getElementById('total-count');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Sort by date (newest first)
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display first 10 results
        const displayResults = results.slice(0, 10);
        
        displayResults.forEach((result, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(result.date);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Determine status badge
            let statusBadge = '';
            let statusText = '';
            if (result.status === 'lulus') {
                statusBadge = 'status-lulus';
                statusText = 'Lulus';
            } else if (result.status === 'tidak-lulus') {
                statusBadge = 'status-tidak-lulus';
                statusText = 'Tidak Lulus';
            } else {
                statusBadge = 'status-sedang';
                statusText = 'Sedang';
            }
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="select-student" data-id="${result.id}">
                </td>
                <td>${index + 1}</td>
                <td>
                    <div class="student-info">
                        <strong>${result.student}</strong>
                    </div>
                </td>
                <td>${result.class}</td>
                <td>${result.exam}</td>
                <td>
                    <div class="score-display">
                        <span class="score-value ${result.score >= 85 ? 'high-score' : result.score >= 65 ? 'medium-score' : 'low-score'}">
                            ${result.score}
                        </span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusBadge}">${statusText}</span>
                </td>
                <td>${result.time} menit</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn-action-small btn-view-details" data-id="${result.id}">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update counts
        showingCount.textContent = displayResults.length;
        totalCount.textContent = results.length;
        
        // Update pagination
        updatePagination(results.length, 10);
    }
    
    // Update Statistics
    function updateStatistics(results) {
        if (!results || results.length === 0) return;
        
        const totalStudents = results.length;
        const passedStudents = results.filter(r => r.status === 'lulus').length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalStudents;
        const averageTime = results.reduce((sum, r) => sum + r.time, 0) / totalStudents;
        const passingRate = (passedStudents / totalStudents) * 100;
        
        // Update stat cards (in a real app, these would be dynamic)
        // For now, we'll just update the displayed values
        
        console.log('Statistics updated:', {
            totalStudents,
            passingRate,
            averageScore,
            averageTime
        });
    }
    
    // Setup Table Interactions
    function setupTableInteractions() {
        // Select all checkbox
        const selectAll = document.getElementById('select-all');
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.select-student');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('search-students');
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // In a real app, this would filter the table
            showToast(`Mencari: ${searchTerm}`, 'info');
        }, 300));
        
        // Refresh table button
        const btnRefresh = document.getElementById('btn-refresh-table');
        btnRefresh.addEventListener('click', function() {
            loadResultsData();
            animateButton(this);
        });
        
        // Pagination buttons
        const btnPrevPage = document.getElementById('btn-prev-page');
        const btnNextPage = document.getElementById('btn-next-page');
        
        btnPrevPage.addEventListener('click', function() {
            const currentPage = parseInt(document.getElementById('current-page').textContent);
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
        
        btnNextPage.addEventListener('click', function() {
            const currentPage = parseInt(document.getElementById('current-page').textContent);
            const totalPages = parseInt(document.getElementById('total-pages').textContent);
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
        
        // View details buttons (delegated event)
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-view-details')) {
                const btn = e.target.closest('.btn-view-details');
                const resultId = btn.dataset.id;
                viewResultDetails(resultId);
            }
        });
        
        // Analysis tools
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', function() {
                const tool = this.dataset.tool;
                runAnalysisTool(tool);
                animateButton(this);
            });
        });
    }
    
    // Update Pagination
    function updatePagination(totalItems, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const currentPage = 1;
        
        document.getElementById('total-pages').textContent = totalPages;
        document.getElementById('current-page').textContent = currentPage;
        
        // Update button states
        document.getElementById('btn-prev-page').disabled = currentPage === 1;
        document.getElementById('btn-next-page').disabled = currentPage === totalPages;
    }
    
    // Go to Page
    function goToPage(pageNumber) {
        console.log('Going to page:', pageNumber);
        // In a real app, this would load the specific page of data
        // For now, we'll just update the display
        document.getElementById('current-page').textContent = pageNumber;
        
        // Update button states
        const totalPages = parseInt(document.getElementById('total-pages').textContent);
        document.getElementById('btn-prev-page').disabled = pageNumber === 1;
        document.getElementById('btn-next-page').disabled = pageNumber === totalPages;
        
        showToast(`Memuat halaman ${pageNumber}`, 'info');
    }
    
    // View Result Details
    function viewResultDetails(resultId) {
        console.log('Viewing details for result:', resultId);
        
        // In a real app, this would open a modal with detailed results
        // For now, we'll show a simple alert
        showToast(`Membuka detail untuk ID: ${resultId}`, 'info');
    }
    
    // Run Analysis Tool
    function runAnalysisTool(tool) {
        console.log('Running analysis tool:', tool);
        
        const toolNames = {
            'trend-analysis': 'Analisis Tren',
            'problem-detection': 'Deteksi Masalah',
            'recommendations': 'Rekomendasi'
        };
        
        // Show loading
        const toolCard = document.querySelector(`[data-tool="${tool}"]`).closest('.tool-card');
        toolCard.classList.add('running');
        
        // Simulate analysis
        setTimeout(() => {
            toolCard.classList.remove('running');
            
            // Show results
            const results = {
                'trend-analysis': 'Tren nilai menunjukkan peningkatan 5% dari bulan lalu',
                'problem-detection': 'Ditemukan 3 soal dengan tingkat kesalahan > 60%',
                'recommendations': '5 siswa memerlukan bimbingan tambahan'
            };
            
            showToast(`${toolNames[tool]}: ${results[tool]}`, 'success');
        }, 1500);
    }
    
    // Update Results Data (filtered)
    function updateResultsData(filters) {
        console.log('Updating results with filters:', filters);
        // In a real app, this would fetch filtered data from server
        // For now, we'll just reload with a message
        loadMockResultsData();
    }
    
    // Show Loading
    function showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Memuat data...</p>
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
    
    // Animate Button
    function animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
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
    
    // Close Modal
    function closeModal(modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        setTimeout(() => modal.remove(), 300);
    }
    
    // Add Modal Styles
    function addModalStyles() {
        const styleId = 'date-range-modal-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .date-range-modal {
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
            
            .date-range-modal .modal-content {
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
            
            .date-range-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 25px;
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
            
            .btn-modal-save {
                background: linear-gradient(135deg, #0ea5e9, #38bdf8);
                color: white;
            }
            
            .btn-modal-save:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(14, 165, 233, 0.3);
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
            
            .score-display .score-value {
                font-weight: 600;
                padding: 4px 12px;
                border-radius: 6px;
            }
            
            .high-score {
                background: #d1fae5;
                color: #065f46;
            }
            
            .medium-score {
                background: #fef3c7;
                color: #92400e;
            }
            
            .low-score {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .chart-container.loading .chart-wrapper {
                opacity: 0.5;
                pointer-events: none;
            }
            
            .tool-card.running {
                position: relative;
                pointer-events: none;
            }
            
            .tool-card.running::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 15px;
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
    initializeDataResults();
});