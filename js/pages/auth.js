// Authentication System
const Auth = (function() {
    const API_BASE = ''; // For production, this would be your backend API
    const USERS_FILE = '/json/users.json';
    const SESSION_KEY = 'taskmate_session';
    
    // Initialize users file if it doesn't exist
    async function initializeUsersFile() {
        try {
            const response = await fetch(USERS_FILE);
            await response.json();
        } catch (error) {
            // File doesn't exist, create it
            const initialData = {
                users: [],
                sessions: []
            };
            await saveToFile(USERS_FILE, initialData);
        }
    }

    // File operations
    async function readFromFile(filePath) {
        try {
            const response = await fetch(filePath);
            return await response.json();
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    async function saveToFile(filePath, data) {
        // In a real application, this would be a server-side API call
        // For now, we'll simulate it by storing in localStorage
        localStorage.setItem(filePath, JSON.stringify(data));
        return { success: true };
    }

    // Utility functions
    function generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function isCodeExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    }

    // Password hashing (simplified - in production use proper bcrypt)
    async function hashPassword(password) {
        // Simplified hashing - in production, use proper bcrypt
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async function verifyPassword(password, hash) {
        const hashedPassword = await hashPassword(password);
        return hashedPassword === hash;
    }

    // Email simulation (in production, this would call your email service)
    async function sendEmail(to, subject, html) {
        // In a real application, you would integrate with an email service
        // like SendGrid, Mailgun, or AWS SES
        return { success: true };
    }

    // Authentication methods
    async function signup(userData) {
        await initializeUsersFile();
        const data = await readFromFile(USERS_FILE);
        
        // Check if user already exists
        const existingUser = data.users.find(user => user.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'User with this email already exists' };
        }

        // Validate password strength
        if (!validatePasswordStrength(userData.password)) {
            return { success: false, message: 'Password does not meet security requirements' };
        }

        // Create new user
        const userId = generateId();
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        const newUser = {
            id: userId,
            email: userData.email,
            password: await hashPassword(userData.password),
            isVerified: false,
            verificationCode: verificationCode,
            verificationCodeExpires: verificationCodeExpires.toISOString(),
            resetPasswordCode: null,
            resetPasswordExpires: null,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                firstName: userData.firstName,
                lastName: userData.lastName
            }
        };

        data.users.push(newUser);
        await saveToFile(USERS_FILE, data);

        // Send verification email
        await sendEmail(
            userData.email,
            'Verify Your TASKMATE Account',
            `
            <h2>Welcome to TASKMATE!</h2>
            <p>Please use the following code to verify your email address:</p>
            <h1 style="font-size: 2rem; text-align: center; color: #3498db;">${verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            `
        );

        return { success: true, message: 'Verification code sent to your email' };
    }

    async function verifyEmail(email, code) {
        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.email === email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.isVerified) {
            return { success: false, message: 'Email is already verified' };
        }

        if (user.verificationCode !== code) {
            return { success: false, message: 'Invalid verification code' };
        }

        if (isCodeExpired(user.verificationCodeExpires)) {
            return { success: false, message: 'Verification code has expired' };
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        
        await saveToFile(USERS_FILE, data);

        return { success: true, message: 'Email verified successfully' };
    }

    async function resendVerificationCode(email) {
        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.email === email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.isVerified) {
            return { success: false, message: 'Email is already verified' };
        }

        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires.toISOString();
        
        await saveToFile(USERS_FILE, data);

        // Send verification email
        await sendEmail(
            email,
            'Verify Your TASKMATE Account',
            `
            <h2>Your Verification Code</h2>
            <p>Please use the following code to verify your email address:</p>
            <h1 style="font-size: 2rem; text-align: center; color: #3498db;">${verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            `
        );

        return { success: true, message: 'Verification code sent' };
    }

    async function login(loginData) {
        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.email === loginData.email);
        
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        if (!user.isVerified) {
            return { success: false, message: 'Please verify your email before logging in' };
        }

        const isPasswordValid = await verifyPassword(loginData.password, user.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        await saveToFile(USERS_FILE, data);

        // Create session
        const sessionToken = generateId();
        const sessionExpires = new Date(Date.now() + (loginData.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000); // 7 or 30 days
        
        const session = {
            userId: user.id,
            token: sessionToken,
            expiresAt: sessionExpires.toISOString(),
            createdAt: new Date().toISOString()
        };

        data.sessions.push(session);
        await saveToFile(USERS_FILE, data);

        // Store session in localStorage
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            token: sessionToken,
            userId: user.id,
            expiresAt: sessionExpires.toISOString()
        }));

        return { success: true, user: user };
    }

    async function logout() {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
            const session = JSON.parse(sessionData);
            
            // Remove session from database
            const data = await readFromFile(USERS_FILE);
            data.sessions = data.sessions.filter(s => s.token !== session.token);
            await saveToFile(USERS_FILE, data);
        }
        
        localStorage.removeItem(SESSION_KEY);
        return { success: true };
    }

    async function forgotPassword(email) {
        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.email === email);
        
        if (!user) {
            // Don't reveal whether email exists
            return { success: true, message: 'If an account exists with this email, a reset code has been sent' };
        }

        const resetCode = generateVerificationCode();
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetExpires.toISOString();
        
        await saveToFile(USERS_FILE, data);

        // Send reset email
        await sendEmail(
            email,
            'Reset Your TASKMATE Password',
            `
            <h2>Password Reset Request</h2>
            <p>Use the following code to reset your password:</p>
            <h1 style="font-size: 2rem; text-align: center; color: #3498db;">${resetCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            `
        );

        return { success: true, message: 'Reset code sent to your email' };
    }

    async function resetPassword(email, code, newPassword) {
        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.email === email);
        
        if (!user) {
            return { success: false, message: 'Invalid reset request' };
        }

        if (user.resetPasswordCode !== code) {
            return { success: false, message: 'Invalid reset code' };
        }

        if (isCodeExpired(user.resetPasswordExpires)) {
            return { success: false, message: 'Reset code has expired' };
        }

        if (!validatePasswordStrength(newPassword)) {
            return { success: false, message: 'Password does not meet security requirements' };
        }

        // Update password
        user.password = await hashPassword(newPassword);
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        
        await saveToFile(USERS_FILE, data);

        return { success: true, message: 'Password reset successfully' };
    }

    async function resendResetCode(email) {
        return await forgotPassword(email);
    }

    async function getCurrentUser() {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (!sessionData) {
            return null;
        }

        const session = JSON.parse(sessionData);
        if (isCodeExpired(session.expiresAt)) {
            await logout();
            return null;
        }

        const data = await readFromFile(USERS_FILE);
        const user = data.users.find(user => user.id === session.userId);
        
        if (!user) {
            await logout();
            return null;
        }

        return user;
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

    // Initialize
    initializeUsersFile();

    // Public API
    return {
        signup,
        verifyEmail,
        resendVerificationCode,
        login,
        logout,
        forgotPassword,
        resetPassword,
        resendResetCode,
        getCurrentUser,
        validatePasswordStrength
    };
})();

// Session management and UI updates
document.addEventListener('DOMContentLoaded', async function() {
    await updateAuthUI();
});

async function updateAuthUI() {
    const user = await Auth.getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const mobileAuthButtons = document.getElementById('mobileAuthButtons');
    const mobileUserMenu = document.getElementById('mobileUserMenu');

    if (user) {
        // User is logged in
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userInitial').textContent = user.email.charAt(0).toUpperCase();
        }
        if (mobileAuthButtons) mobileAuthButtons.classList.add('hidden');
        if (mobileUserMenu) {
            mobileUserMenu.classList.remove('hidden');
            document.getElementById('mobileUserEmail').textContent = user.email;
        }

        // Add logout handlers
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
                await Auth.logout();
                window.location.reload();
            });
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', async function() {
                await Auth.logout();
                window.location.reload();
            });
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        if (mobileAuthButtons) mobileAuthButtons.classList.remove('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
    }
}