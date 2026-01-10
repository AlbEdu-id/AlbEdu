// buat-ujian.js - Page Specific JavaScript for Buat Ujian Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Loading Buat Ujian Page...');
    
    // Initialize Exam Creator
    function initializeExamCreator() {
        console.log('🔄 Menginisialisasi Pembuat Ujian...');
        
        // Setup wizard navigation
        setupWizardNavigation();
        
        // Setup question type controls
        setupQuestionTypeControls();
        
        // Setup form validation
        setupFormValidation();
        
        // Initialize ExamCreator module
        if (window.ExamCreator) {
            window.ExamCreator.init().then(() => {
                console.log('✅ Exam Creator initialized successfully');
            }).catch(err => {
                console.error('❌ Failed to initialize Exam Creator:', err);
                showToast('Gagal menginisialisasi pembuat ujian', 'error');
            });
        } else {
            console.warn('⚠️ ExamCreator module not found, using mock functionality');
        }
    }
    
    // Setup Wizard Navigation
    function setupWizardNavigation() {
        const steps = document.querySelectorAll('.wizard-step');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnCreate = document.getElementById('btn-create-exam');
        const progressFill = document.getElementById('wizard-progress');
        const currentStepSpan = document.getElementById('current-step');
        
        let currentStep = 0;
        
        // Show step function
        function showStep(stepIndex) {
            // Hide all steps
            steps.forEach(step => step.classList.remove('active'));
            
            // Show current step
            steps[stepIndex].classList.add('active');
            
            // Update step number styling
            const stepNumbers = document.querySelectorAll('.step-number');
            stepNumbers.forEach((number, index) => {
                if (index === stepIndex) {
                    number.classList.add('active');
                } else if (index < stepIndex) {
                    number.classList.add('completed');
                    number.innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    number.classList.remove('active', 'completed');
                    number.textContent = index + 1;
                }
            });
            
            // Update progress bar
            const progress = ((stepIndex + 1) / steps.length) * 100;
            progressFill.style.width = `${progress}%`;
            currentStepSpan.textContent = stepIndex + 1;
            
            // Update button visibility
            btnPrev.style.display = stepIndex === 0 ? 'none' : 'flex';
            btnNext.style.display = stepIndex === steps.length - 1 ? 'none' : 'flex';
            btnCreate.style.display = stepIndex === steps.length - 1 ? 'flex' : 'none';
            
            currentStep = stepIndex;
        }
        
        // Next button click
        btnNext.addEventListener('click', function() {
            // Validate current step
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
                animateStepTransition();
            }
        });
        
        // Previous button click
        btnPrev.addEventListener('click', function() {
            showStep(currentStep - 1);
            animateStepTransition();
        });
        
        // Create exam button click
        btnCreate.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                createExam();
            }
        });
        
        // Initialize with first step
        showStep(0);
    }
    
    // Setup Question Type Controls
    function setupQuestionTypeControls() {
        const questionTypeCards = document.querySelectorAll('.question-type-card');
        
        questionTypeCards.forEach(card => {
            const btnDecrease = card.querySelector('.btn-decrease');
            const btnIncrease = card.querySelector('.btn-increase');
            const countInput = card.querySelector('.type-count');
            const weightInput = card.querySelector('.type-weight');
            
            // Select card on click
            card.addEventListener('click', function() {
                // Toggle selection
                card.classList.toggle('selected');
                
                // If unselected, reset to 0
                if (!card.classList.contains('selected')) {
                    countInput.value = 0;
                } else if (countInput.value === '0') {
                    // If selected and count is 0, set to minimum
                    const type = card.dataset.type;
                    const minValue = getDefaultCount(type);
                    countInput.value = minValue;
                }
                
                updateQuestionSummary();
            });
            
            // Decrease count
            btnDecrease.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card selection
                let value = parseInt(countInput.value);
                if (value > parseInt(countInput.min)) {
                    countInput.value = value - 1;
                    updateQuestionSummary();
                }
            });
            
            // Increase count
            btnIncrease.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card selection
                let value = parseInt(countInput.value);
                if (value < parseInt(countInput.max)) {
                    countInput.value = value + 1;
                    updateQuestionSummary();
                }
            });
            
            // Update on input change
            countInput.addEventListener('change', updateQuestionSummary);
            weightInput.addEventListener('change', updateQuestionSummary);
            
            // Allow only numbers
            countInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                if (this.value === '') this.value = '0';
                if (parseInt(this.value) > parseInt(this.max)) {
                    this.value = this.max;
                }
                if (parseInt(this.value) < parseInt(this.min)) {
                    this.value = this.min;
                }
            });
            
            // Set default values based on type
            const type = card.dataset.type;
            countInput.value = getDefaultCount(type);
            weightInput.value = getDefaultWeight(type);
            
            // Auto-select card if count > 0
            if (parseInt(countInput.value) > 0) {
                card.classList.add('selected');
            }
        });
        
        // Initial update
        updateQuestionSummary();
    }
    
    // Get default count for question type
    function getDefaultCount(type) {
        const defaults = {
            'pilihan-ganda': 20,
            'essay': 5,
            'true-false': 10,
            'matching': 0
        };
        return defaults[type] || 0;
    }
    
    // Get default weight for question type
    function getDefaultWeight(type) {
        const defaults = {
            'pilihan-ganda': 1,
            'essay': 5,
            'true-false': 0.5,
            'matching': 2
        };
        return defaults[type] || 1;
    }
    
    // Update question summary
    function updateQuestionSummary() {
        let totalQuestions = 0;
        let totalPoints = 0;
        
        const questionTypeCards = document.querySelectorAll('.question-type-card');
        
        questionTypeCards.forEach(card => {
            const countInput = card.querySelector('.type-count');
            const weightInput = card.querySelector('.type-weight');
            
            const count = parseInt(countInput.value) || 0;
            const weight = parseFloat(weightInput.value) || 0;
            
            totalQuestions += count;
            totalPoints += count * weight;
        });
        
        // Update summary display
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('total-points').textContent = totalPoints.toFixed(1);
        
        // Calculate estimated time (average 2 minutes per question)
        const estimatedTime = Math.ceil(totalQuestions * 2);
        document.getElementById('estimated-time').textContent = `~ ${estimatedTime} menit`;
        
        // Update exam duration input suggestion
        const durationInput = document.getElementById('exam-duration');
        if (durationInput && !durationInput.hasAttribute('data-user-changed')) {
            durationInput.value = Math.max(estimatedTime, 90);
        }
    }
    
    // Setup Form Validation
    function setupFormValidation() {
        const form = document.getElementById('exam-details-form');
        
        if (form) {
            // Set default dates
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const startDateInput = document.getElementById('exam-start-date');
            const endDateInput = document.getElementById('exam-end-date');
            const startTimeInput = document.getElementById('exam-start-time');
            const endTimeInput = document.getElementById('exam-end-time');
            
            // Format date to YYYY-MM-DD
            const formatDate = (date) => date.toISOString().split('T')[0];
            const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };
            
            // Set default values
            if (startDateInput) startDateInput.value = formatDate(today);
            if (endDateInput) endDateInput.value = formatDate(tomorrow);
            if (startTimeInput) startTimeInput.value = '08:00';
            if (endTimeInput) endTimeInput.value = '17:00';
            
            // Track user changes to duration
            const durationInput = document.getElementById('exam-duration');
            if (durationInput) {
                durationInput.addEventListener('input', function() {
                    this.setAttribute('data-user-changed', 'true');
                });
            }
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', validateField);
            });
        }
    }
    
    // Validate individual field
    function validateField(e) {
        const field = e.target;
        const formGroup = field.closest('.form-group');
        
        if (!formGroup) return;
        
        // Remove existing validation messages
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Validate based on field type
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Field ini wajib diisi';
        }
        
        if (field.type === 'number') {
            const min = field.hasAttribute('min') ? parseFloat(field.getAttribute('min')) : null;
            const max = field.hasAttribute('max') ? parseFloat(field.getAttribute('max')) : null;
            const value = parseFloat(field.value);
            
            if (min !== null && value < min) {
                isValid = false;
                errorMessage = `Nilai minimum adalah ${min}`;
            }
            
            if (max !== null && value > max) {
                isValid = false;
                errorMessage = `Nilai maksimum adalah ${max}`;
            }
        }
        
        if (field.id === 'exam-duration') {
            const value = parseInt(field.value);
            const totalQuestions = parseInt(document.getElementById('total-questions').textContent);
            
            // Check if duration is realistic
            if (value < totalQuestions * 1.5) {
                isValid = false;
                errorMessage = `Durasi terlalu singkat untuk ${totalQuestions} soal. Minimal ${Math.ceil(totalQuestions * 1.5)} menit`;
            }
        }
        
        // Date validation
        if (field.id === 'exam-end-date' || field.id === 'exam-start-date') {
            const startDate = new Date(document.getElementById('exam-start-date').value);
            const endDate = new Date(document.getElementById('exam-end-date').value);
            
            if (endDate < startDate) {
                isValid = false;
                errorMessage = 'Tanggal selesai harus setelah tanggal mulai';
            }
        }
        
        // Update field styling
        if (!isValid) {
            field.classList.add('error');
            formGroup.classList.add('has-error');
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            formGroup.appendChild(errorDiv);
        } else {
            field.classList.remove('error');
            formGroup.classList.remove('has-error');
        }
        
        return isValid;
    }
    
    // Validate wizard step
    function validateStep(stepIndex) {
        let isValid = true;
        const step = document.getElementById(`step${stepIndex + 1}`);
        
        if (!step) return false;
        
        // Step 1 validation
        if (stepIndex === 0) {
            const requiredFields = step.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    validateField({ target: field });
                    isValid = false;
                }
            });
            
            // Check total questions
            const totalQuestions = parseInt(document.getElementById('total-questions').textContent);
            if (totalQuestions === 0) {
                showToast('Tambahkan minimal 1 soal untuk ujian', 'error');
                isValid = false;
            }
        }
        
        // Step 2 validation
        if (stepIndex === 1) {
            const totalQuestions = parseInt(document.getElementById('total-questions').textContent);
            if (totalQuestions === 0) {
                showToast('Tambahkan minimal 1 soal untuk ujian', 'error');
                isValid = false;
            }
        }
        
        // Step 3 validation
        if (stepIndex === 2) {
            const startDate = new Date(document.getElementById('exam-start-date').value);
            const endDate = new Date(document.getElementById('exam-end-date').value);
            
            if (endDate < startDate) {
                showToast('Tanggal selesai harus setelah tanggal mulai', 'error');
                isValid = false;
            }
            
            const now = new Date();
            if (startDate < now) {
                showToast('Tanggal mulai harus di masa depan', 'error');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Create Exam Function
    function createExam() {
        // Collect all exam data
        const examData = {
            title: document.getElementById('exam-title').value,
            subject: document.getElementById('exam-subject').value,
            grade: document.getElementById('exam-grade').value,
            type: document.getElementById('exam-type').value,
            duration: parseInt(document.getElementById('exam-duration').value),
            passingGrade: parseInt(document.getElementById('exam-passing-grade').value),
            description: document.getElementById('exam-description').value,
            startDate: document.getElementById('exam-start-date').value,
            startTime: document.getElementById('exam-start-time').value,
            endDate: document.getElementById('exam-end-date').value,
            endTime: document.getElementById('exam-end-time').value,
            shuffleQuestions: document.getElementById('shuffle-questions').checked,
            showResults: document.getElementById('show-results').checked,
            allowRetake: document.getElementById('allow-retake').checked,
            timeLimit: document.getElementById('time-limit').checked,
            questions: [],
            created: new Date().toISOString()
        };
        
        // Collect question types
        const questionTypeCards = document.querySelectorAll('.question-type-card');
        questionTypeCards.forEach(card => {
            const type = card.dataset.type;
            const count = parseInt(card.querySelector('.type-count').value);
            const weight = parseFloat(card.querySelector('.type-weight').value);
            
            if (count > 0) {
                examData.questions.push({
                    type: type,
                    count: count,
                    weight: weight
                });
            }
        });
        
        // Show loading state
        const btnCreate = document.getElementById('btn-create-exam');
        const originalText = btnCreate.innerHTML;
        btnCreate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat Ujian...';
        btnCreate.disabled = true;
        
        // Create exam using ExamCreator module
        if (window.ExamCreator && window.ExamCreator.createExam) {
            window.ExamCreator.createExam(examData)
                .then(result => {
                    console.log('✅ Exam created:', result);
                    
                    // Show success message
                    showToast('Ujian berhasil dibuat!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        resetExamForm();
                        showStep(0); // Go back to first step
                        btnCreate.innerHTML = originalText;
                        btnCreate.disabled = false;
                    }, 1500);
                    
                    // Save to Firestore if authenticated
                    if (window.Auth && window.Auth.currentUser) {
                        saveExamToFirestore(result);
                    }
                })
                .catch(error => {
                    console.error('❌ Error creating exam:', error);
                    showToast('Gagal membuat ujian: ' + error.message, 'error');
                    btnCreate.innerHTML = originalText;
                    btnCreate.disabled = false;
                });
        } else {
            // Mock creation
            setTimeout(() => {
                console.log('📝 Mock exam created:', examData);
                showToast('Ujian berhasil dibuat! (Mock)', 'success');
                resetExamForm();
                showStep(0);
                btnCreate.innerHTML = originalText;
                btnCreate.disabled = false;
            }, 1500);
        }
    }
    
    // Save exam to Firestore
    function saveExamToFirestore(examData) {
        if (!window.Auth || !window.Auth.currentUser) {
            console.log('User not authenticated, skipping Firestore save');
            return;
        }
        
        firebase.firestore().collection('exams').add({
            ...examData,
            createdBy: window.Auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'draft',
            totalStudents: 0,
            averageScore: 0
        })
        .then(docRef => {
            console.log('✅ Exam saved to Firestore with ID:', docRef.id);
            showToast('Ujian disimpan ke database', 'success');
        })
        .catch(error => {
            console.error('❌ Error saving exam to Firestore:', error);
            showToast('Gagal menyimpan ujian ke database', 'error');
        });
    }
    
    // Reset exam form
    function resetExamForm() {
        const form = document.getElementById('exam-details-form');
        if (form) form.reset();
        
        // Reset question types to defaults
        const questionTypeCards = document.querySelectorAll('.question-type-card');
        questionTypeCards.forEach(card => {
            const type = card.dataset.type;
            card.classList.remove('selected');
            
            const countInput = card.querySelector('.type-count');
            const weightInput = card.querySelector('.type-weight');
            
            countInput.value = getDefaultCount(type);
            weightInput.value = getDefaultWeight(type);
        });
        
        // Reset wizard to first step
        setupFormValidation();
        updateQuestionSummary();
    }
    
    // Animate step transition
    function animateStepTransition() {
        const currentStep = document.querySelector('.wizard-step.active');
        if (currentStep) {
            currentStep.style.animation = 'none';
            setTimeout(() => {
                currentStep.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
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
    initializeExamCreator();
    
    // Add custom CSS for validation
    const style = document.createElement('style');
    style.textContent = `
        .form-group.has-error .form-control {
            border-color: #ef4444;
            background: #fef2f2;
        }
        
        .form-group.has-error .form-control:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .error-message {
            color: #ef4444;
            font-size: 12px;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .step-number.completed {
            background: linear-gradient(135deg, #10b981, #34d399);
            color: white;
        }
        
        .question-type-card.selected .type-icon {
            background: linear-gradient(135deg, #10b981, #34d399);
        }
    `;
    document.head.appendChild(style);
});