/**
 * Theme Manager - Handles dark/light mode switching
 * Persists theme preference in localStorage
 * Respects system preference on first visit
 */

(function() {
    'use strict';

    const THEME_KEY = 'taskmate-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Get the user's preferred theme
     * Priority: localStorage > system preference > light
     */
    function getPreferredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) {
            return stored;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }
        
        return LIGHT_THEME;
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        if (theme === DARK_THEME) {
            document.documentElement.setAttribute('data-theme', DARK_THEME);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === DARK_THEME ? '#0f172a' : '#ffffff');
        }
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
        
        return newTheme;
    }

    /**
     * Initialize theme toggle buttons
     */
    function initThemeToggle() {
        // Desktop theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
                
                // Add animation class
                this.classList.add('theme-toggled');
                setTimeout(() => this.classList.remove('theme-toggled'), 300);
            });
        }

        // Mobile theme toggle
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });
        }
    }

    /**
     * Listen for system theme changes
     */
    function listenForSystemThemeChanges() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                // Only update if user hasn't set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
                }
            });
        }
    }

    // Apply theme immediately to prevent flash
    applyTheme(getPreferredTheme());

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initThemeToggle();
            listenForSystemThemeChanges();
        });
    } else {
        initThemeToggle();
        listenForSystemThemeChanges();
    }

    // Re-initialize after header is loaded (for dynamic header loading)
    document.addEventListener('headerLoaded', function() {
        initThemeToggle();
    });

    // Expose theme API globally
    window.ThemeManager = {
        toggle: toggleTheme,
        get: getPreferredTheme,
        set: function(theme) {
            applyTheme(theme);
            localStorage.setItem(THEME_KEY, theme);
        },
        isDark: function() {
            return document.documentElement.getAttribute('data-theme') === DARK_THEME;
        }
    };

})();
