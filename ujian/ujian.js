document.addEventListener('DOMContentLoaded', function() {
  const tokenInputs = document.querySelectorAll('.token-input');
  const tokenForm = document.getElementById('tokenForm');
  
  // Handle input navigation
  tokenInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      // Auto-focus next input
      if (this.value.length === 1 && index < tokenInputs.length - 1) {
        tokenInputs[index + 1].focus();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      // Handle backspace
      if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
        tokenInputs[index - 1].focus();
      }
      
      // Handle arrow keys
      if (e.key === 'ArrowLeft' && index > 0) {
        tokenInputs[index - 1].focus();
      }
      
      if (e.key === 'ArrowRight' && index < tokenInputs.length - 1) {
        tokenInputs[index + 1].focus();
      }
    });
    
    // Restrict to alphanumeric characters
    input.addEventListener('keypress', function(e) {
      const char = String.fromCharCode(e.keyCode);
      if (!/[a-zA-Z0-9]/.test(char)) {
        e.preventDefault();
      }
    });
  });
  
  // Form submission
  tokenForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect token values
    const token = Array.from(tokenInputs)
      .map(input => input.value)
      .join('');
    
    if (token.length !== 5) {
      alert('Token harus terdiri dari 5 karakter');
      return;
    }
    
    // Validate token (implementation depends on your backend)
    validateToken(token);
  });
  
  function validateToken(token) {
    // Implement token validation logic here
    console.log('Validating token:', token);
    
    // Example validation (replace with actual Firebase/database check)
    if (token.length === 5) {
      // Show loading state
      const submitBtn = document.querySelector('.submit-button');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Memproses...';
      submitBtn.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // If valid, redirect to exam page
        // window.location.href = `exam.html?token=${token}`;
        
        // For now, just show alert
        alert(`Token ${token} telah diterima. Proses ujian akan dimulai.`);
        
        // Reset form
        tokenInputs.forEach(input => input.value = '');
        tokenInputs[0].focus();
      }, 1000);
    } else {
      alert('Token tidak valid');
    }
  }
  
  // Auto-focus first input on load
  if (tokenInputs.length > 0) {
    tokenInputs[0].focus();
  }
});
