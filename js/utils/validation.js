// Form Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

function validateSignupForm() {
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Validate first name
    const firstName = document.getElementById('firstName').value;
    if (!firstName.trim()) {
        showError('firstNameError', 'First name is required');
        isValid = false;
    }

    // Validate last name
    const lastName = document.getElementById('lastName').value;
    if (!lastName.trim()) {
        showError('lastNameError', 'Last name is required');
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email').value;
    if (!email.trim()) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    const password = document.getElementById('password').value;
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (!validatePasswordStrength(password)) {
        showError('passwordError', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        isValid = false;
    }

    // Validate confirm password
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    // Validate terms
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        showError('termsError', 'You must agree to the terms and conditions');
        isValid = false;
    }

    return isValid;
}

function validateLoginForm() {
    let isValid = true;
    clearErrors();

    const email = document.getElementById('loginEmail').value;
    if (!email.trim()) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    const password = document.getElementById('loginPassword').value;
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    }

    return isValid;
}

function validatePasswordReset(code, newPassword, confirmPassword) {
    let isValid = true;
    clearErrors();

    if (!code || code.length !== 6) {
        showError('resetVerificationCodeError', 'Please enter a valid 6-digit code');
        isValid = false;
    }

    if (!newPassword) {
        showError('newPasswordError', 'New password is required');
        isValid = false;
    } else if (!validatePasswordStrength(newPassword)) {
        showError('newPasswordError', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        isValid = false;
    }

    if (!confirmPassword) {
        showError('confirmNewPasswordError', 'Please confirm your new password');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showError('confirmNewPasswordError', 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });

    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Find the corresponding input and mark it as error
        const inputId = fieldId.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
}

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const requirements = document.querySelector('.password-requirements');
            
            if (password.length > 0) {
                const isStrong = validatePasswordStrength(password);
                if (isStrong) {
                    this.classList.remove('error');
                    this.classList.add('success');
                } else {
                    this.classList.add('error');
                    this.classList.remove('success');
                }
            } else {
                this.classList.remove('error', 'success');
            }
        });
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword.length > 0 && password !== confirmPassword) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    }
});