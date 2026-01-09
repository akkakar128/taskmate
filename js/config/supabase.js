/**
 * Supabase Configuration
 * 
 * IMPORTANT: Replace these values with your actual Supabase project credentials
 * Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
 */

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://xyzcompany.supabase.co'
    
    // Your Supabase anon (public) key - safe to expose in client-side code
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Optional: Custom options
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};

// Validate configuration
function validateConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase not configured. Please update js/config/supabase.js with your credentials.');
        return false;
    }
    return true;
}

// Export for use in other modules
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.isSupabaseConfigured = validateConfig;
