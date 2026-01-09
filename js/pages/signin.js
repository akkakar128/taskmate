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

    const signinForm = document.getElementById('signin-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const signinBtn = document.getElementById('signin-btn');
    const btnText = signinBtn.querySelector('.btn-text');
    const btnLoading = signinBtn.querySelector('.btn-loading');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Form submission
    signinForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Validate inputs
        if (!validateForm(email, password)) {
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            // Authenticate user
            const user = await authenticateUser(email, password);

            if (user) {
                // Store session
                if (rememberMe) {
                    localStorage.setItem('taskmate_user_session', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('taskmate_user_session', JSON.stringify(user));
                }

                showMessage('success', 'Signed in successfully! Redirecting...');

                setTimeout(() => {
                    // Redirect to dashboard or previous page
                    const returnUrl = new URLSearchParams(window.location.search).get('return') || '/index.html';
                    window.location.href = returnUrl;
                }, 1500);
            } else {
                throw new Error('Invalid email or password');
            }

        } catch (error) {
            showMessage('error', error.message);
            setLoadingState(false);
        }
    });

    function validateForm(email, password) {
        let isValid = true;
        clearErrors();

        // Email validation
        if (!email) {
            showError('email-error', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!password) {
            showError('password-error', 'Password is required');
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
            signinBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            signinBtn.disabled = false;
        }
    }

    function showMessage(type, message) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;

        signinForm.parentNode.insertBefore(messageDiv, signinForm);
    }

    // Authentication function - Uses Supabase if configured, falls back to localStorage
    async function authenticateUser(email, password) {
        // Try Supabase authentication first
        if (window.SupabaseService && window.SupabaseService.isConnected()) {
            const { data, error } = await SupabaseService.Auth.signIn(email, password);
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Invalid email or password. Please try again.');
                }
                throw new Error(error.message);
            }
            
            if (data && data.user) {
                return {
                    id: data.user.id,
                    email: data.user.email,
                    firstName: data.user.user_metadata?.firstName || '',
                    lastName: data.user.user_metadata?.lastName || '',
                    verified: data.user.email_confirmed_at !== null
                };
            }
            
            throw new Error('Authentication failed. Please try again.');
        }
        
        // Fallback to localStorage authentication
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('taskmate_users') || '[]');
                    const user = users.find(u => u.email === email && u.verified === true);

                    if (!user) {
                        reject(new Error('No account found with this email. Please sign up first.'));
                        return;
                    }

                    // Simple password check (in real app, use proper hashing)
                    if (user.password !== simpleHash(password)) {
                        reject(new Error('Invalid password. Please try again.'));
                        return;
                    }

                    resolve(user);
                } catch (error) {
                    reject(new Error('Authentication failed. Please try again.'));
                }
            }, 500);
        });
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