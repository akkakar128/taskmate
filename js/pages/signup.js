// Initialize users data if not exists
function initializeUsersData() {
    if (!localStorage.getItem('taskmate_users')) {
        localStorage.setItem('taskmate_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('taskmate_verification_codes')) {
        localStorage.setItem('taskmate_verification_codes', JSON.stringify({}));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeUsersData();

    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const signupBtn = document.getElementById('signup-btn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnLoading = signupBtn.querySelector('.btn-loading');

    // Password strength indicator
    passwordInput.addEventListener('input', function () {
        checkPasswordStrength(this.value);
    });

    // Toggle password visibility
    document.getElementById('toggle-password').addEventListener('click', function () {
        togglePasswordVisibility('password', this);
    });

    document.getElementById('toggle-confirm-password').addEventListener('click', function () {
        togglePasswordVisibility('confirm-password', this);
    });

    // Form submission
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            acceptTerms: document.getElementById('accept-terms').checked
        };

        if (!validateForm(formData)) {
            return;
        }

        setLoadingState(true);

        try {
            await createUserAccount(formData);
            showMessage('success', 'Account created successfully! Please check your email for verification.');

            // In a real app, you would redirect to verification page
            // For demo, we'll auto-verify and redirect
            setTimeout(() => {
                // Auto-verify for demo purposes
                verifyUserAccount(formData.email);
                window.location.href = '/auth/signin.html?message=account_created';
            }, 2000);

        } catch (error) {
            showMessage('error', error.message);
            setLoadingState(false);
        }
    });

    function checkPasswordStrength(password) {
        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        if (strength <= 2) {
            strengthBar.className = 'strength-bar weak';
            feedback = 'Weak password';
        } else if (strength <= 4) {
            strengthBar.className = 'strength-bar medium';
            feedback = 'Medium strength';
        } else {
            strengthBar.className = 'strength-bar strong';
            feedback = 'Strong password';
        }

        strengthText.textContent = feedback;
    }

    function togglePasswordVisibility(fieldId, button) {
        const input = document.getElementById(fieldId);
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.textContent = type === 'password' ? '👁️' : '🙈';
    }

    function validateForm(data) {
        let isValid = true;
        clearErrors();

        // Name validation
        if (!data.name) {
            showError('name-error', 'Full name is required');
            isValid = false;
        } else if (data.name.length < 2) {
            showError('name-error', 'Name must be at least 2 characters long');
            isValid = false;
        }

        // Email validation
        if (!data.email) {
            showError('email-error', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(data.email)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!data.password) {
            showError('password-error', 'Password is required');
            isValid = false;
        } else if (data.password.length < 8) {
            showError('password-error', 'Password must be at least 8 characters long');
            isValid = false;
        }

        // Confirm password validation
        if (!data.confirmPassword) {
            showError('confirm-password-error', 'Please confirm your password');
            isValid = false;
        } else if (data.password !== data.confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            isValid = false;
        }

        // Terms validation
        if (!data.acceptTerms) {
            showError('terms-error', 'You must accept the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    function setLoadingState(loading) {
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            signupBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            signupBtn.disabled = false;
        }
    }

    function showMessage(type, message) {
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;

        signupForm.parentNode.insertBefore(messageDiv, signupForm);
    }

    // Create user account
    async function createUserAccount(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('taskmate_users') || '[]');

                    // Check if user already exists
                    const existingUser = users.find(u => u.email === userData.email);
                    if (existingUser) {
                        reject(new Error('An account with this email already exists. Please sign in instead.'));
                        return;
                    }

                    // Create new user
                    const newUser = {
                        id: Date.now().toString(),
                        name: userData.name,
                        email: userData.email,
                        password: simpleHash(userData.password),
                        createdAt: new Date().toISOString(),
                        verified: false // Will be verified after email confirmation
                    };

                    // Save user
                    users.push(newUser);
                    localStorage.setItem('taskmate_users', JSON.stringify(users));

                    // Generate verification code (in real app, send email)
                    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const codes = JSON.parse(localStorage.getItem('taskmate_verification_codes') || '{}');
                    codes[userData.email] = {
                        code: verificationCode,
                        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
                    };
                    localStorage.setItem('taskmate_verification_codes', JSON.stringify(codes));

                    // Show verification code (in real app, this would be sent via email)
                    alert(`DEMO: Verification code for ${userData.email}: ${verificationCode}\n\nIn production, this would be sent via email.`);

                    resolve(newUser);
                } catch (error) {
                    reject(new Error('Failed to create account. Please try again.'));
                }
            }, 1500);
        });
    }

    // Verify user account (for demo purposes)
    function verifyUserAccount(email) {
        const users = JSON.parse(localStorage.getItem('taskmate_users') || '[]');
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('taskmate_users', JSON.stringify(users));

            // Clear verification code
            const codes = JSON.parse(localStorage.getItem('taskmate_verification_codes') || '{}');
            delete codes[email];
            localStorage.setItem('taskmate_verification_codes', JSON.stringify(codes));
        }
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // Check if user is already logged in
    function checkExistingSession() {
        const sessionUser = localStorage.getItem('taskmate_user_session') || sessionStorage.getItem('taskmate_user_session');
        if (sessionUser) {
            showMessage('info', 'You are already signed in. Redirecting...');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }
    }

    checkExistingSession();
});