document.addEventListener('DOMContentLoaded', function () {
    let currentEmail = '';
    let resetStep = 1;

    const emailForm = document.getElementById('email-form');
    const codeForm = document.getElementById('code-form');
    const passwordForm = document.getElementById('password-form');
    const newPasswordInput = document.getElementById('new-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    // Password strength indicator
    newPasswordInput.addEventListener('input', function () {
        checkPasswordStrength(this.value);
    });

    // Toggle password visibility
    document.getElementById('toggle-new-password').addEventListener('click', function () {
        togglePasswordVisibility('new-password', this);
    });

    document.getElementById('toggle-confirm-new-password').addEventListener('click', function () {
        togglePasswordVisibility('confirm-new-password', this);
    });

    // Step 1: Email submission
    emailForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        if (!validateEmail(email)) {
            return;
        }

        setLoadingState('send-code-btn', true);

        try {
            await sendResetCode(email);
            currentEmail = email;
            showStep(2);
            startResendCountdown();
            showMessage('success', 'Reset code sent to your email!');
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoadingState('send-code-btn', false);
        }
    });

    // Step 2: Code verification
    codeForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const code = document.getElementById('reset-code').value.trim();

        if (!validateCode(code)) {
            return;
        }

        setLoadingState('verify-code-btn', true);

        try {
            await verifyResetCode(currentEmail, code);
            showStep(3);
            showMessage('success', 'Code verified! Now set your new password.');
        } catch (error) {
            showMessage('error', error.message);
            setLoadingState('verify-code-btn', false);
        }
    });

    // Step 3: Password reset
    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (!validatePasswords(newPassword, confirmPassword)) {
            return;
        }

        setLoadingState('reset-password-btn', true);

        try {
            await resetPassword(currentEmail, newPassword);
            showMessage('success', 'Password reset successfully! Redirecting to sign in...');

            setTimeout(() => {
                window.location.href = '/auth/signin.html';
            }, 2000);

        } catch (error) {
            showMessage('error', error.message);
            setLoadingState('reset-password-btn', false);
        }
    });

    // Resend code
    document.getElementById('resend-code').addEventListener('click', async function (e) {
        e.preventDefault();

        try {
            await sendResetCode(currentEmail);
            startResendCountdown();
            showMessage('success', 'Reset code resent!');
        } catch (error) {
            showMessage('error', error.message);
        }
    });

    function showStep(step) {
        emailForm.style.display = step === 1 ? 'block' : 'none';
        codeForm.style.display = step === 2 ? 'block' : 'none';
        passwordForm.style.display = step === 3 ? 'block' : 'none';
        resetStep = step;
    }

    function validateEmail(email) {
        clearErrors();

        if (!email) {
            showError('email-error', 'Email is required');
            return false;
        }

        if (!isValidEmail(email)) {
            showError('email-error', 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    function validateCode(code) {
        clearErrors();

        if (!code || code.length !== 6) {
            showError('code-error', 'Please enter a valid 6-digit code');
            return false;
        }

        return true;
    }

    function validatePasswords(password, confirmPassword) {
        clearErrors();
        let isValid = true;

        if (!password) {
            showError('new-password-error', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError('new-password-error', 'Password must be at least 8 characters long');
            isValid = false;
        }

        if (!confirmPassword) {
            showError('confirm-password-error', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

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

    function setLoadingState(buttonId, loading) {
        const button = document.getElementById(buttonId);
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            button.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            button.disabled = false;
        }
    }

    function showMessage(type, message) {
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
                    padding: 1rem;
                    margin: 1rem 0;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: 500;
                    ${type === 'success' ?
                'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
                'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
                `;

        const currentForm = document.querySelector('.auth-form[style*="display: block"]');
        currentForm.parentNode.insertBefore(messageDiv, currentForm);
    }

    function startResendCountdown() {
        const countdownElement = document.getElementById('resend-countdown');
        const resendLink = document.getElementById('resend-code');

        let timeLeft = 60;
        resendLink.style.pointerEvents = 'none';
        resendLink.style.opacity = '0.5';

        const countdown = setInterval(() => {
            countdownElement.textContent = `Resend available in ${timeLeft}s`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(countdown);
                countdownElement.textContent = '';
                resendLink.style.pointerEvents = 'auto';
                resendLink.style.opacity = '1';
            }
        }, 1000);
    }

    // Simulation functions - Uses Supabase if configured
    async function sendResetCode(email) {
        // Try Supabase first
        if (window.SupabaseService && window.SupabaseService.isConnected()) {
            const { error } = await SupabaseService.Auth.resetPassword(email);
            
            if (error) {
                throw new Error(error.message);
            }
            
            // With Supabase, the email is sent automatically
            // Skip step 2 (code verification) and go to reset-password page
            alert('Password reset email sent! Please check your inbox and click the reset link.');
            return { skipCodeStep: true };
        }
        
        // Fallback to localStorage
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if user exists
                const users = JSON.parse(localStorage.getItem('taskmate_users') || '[]');
                const user = users.find(u => u.email === email);

                if (!user) {
                    reject(new Error('No account found with this email.'));
                    return;
                }

                // Generate reset code
                const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
                const codes = JSON.parse(localStorage.getItem('taskmate_verification_codes') || '{}');
                codes[email] = {
                    code: resetCode,
                    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
                };
                localStorage.setItem('taskmate_verification_codes', JSON.stringify(codes));

                // Show code (in real app, send email)
                alert(`DEMO: Password reset code for ${email}: ${resetCode}\n\nIn production, this would be sent via email.`);

                resolve({ skipCodeStep: false });
            }, 1000);
        });
    }

    async function verifyResetCode(email, code) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const codes = JSON.parse(localStorage.getItem('taskmate_verification_codes') || '{}');
                const storedCode = codes[email];

                if (!storedCode || storedCode.code !== code) {
                    reject(new Error('Invalid reset code.'));
                    return;
                }

                if (Date.now() > storedCode.expires) {
                    reject(new Error('Reset code has expired.'));
                    return;
                }

                resolve();
            }, 1000);
        });
    }

    async function resetPassword(email, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('taskmate_users') || '[]');
                const userIndex = users.findIndex(u => u.email === email);

                if (userIndex === -1) {
                    reject(new Error('User not found.'));
                    return;
                }

                // Update password
                users[userIndex].password = hashPassword(newPassword);
                users[userIndex].updatedAt = new Date().toISOString();

                localStorage.setItem('taskmate_users', JSON.stringify(users));

                // Clear reset code
                const codes = JSON.parse(localStorage.getItem('taskmate_verification_codes') || '{}');
                delete codes[email];
                localStorage.setItem('taskmate_verification_codes', JSON.stringify(codes));

                resolve();
            }, 1500);
        });
    }

    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
}); 