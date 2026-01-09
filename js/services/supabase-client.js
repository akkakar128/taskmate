/**
 * Supabase Client Service
 * Handles all database operations for Taskmate
 */

(function() {
    'use strict';

    // Check if Supabase JS library is loaded
    let supabaseClient = null;

    /**
     * Initialize Supabase client
     */
    function initSupabase() {
        if (!window.SUPABASE_CONFIG || !window.isSupabaseConfigured()) {
            console.warn('Supabase not configured. Using fallback local storage.');
            return null;
        }

        if (typeof window.supabase === 'undefined') {
            console.error('Supabase JS library not loaded. Add the CDN script to your HTML.');
            return null;
        }

        try {
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                SUPABASE_CONFIG.options
            );
            console.log('✅ Supabase client initialized');
            return supabaseClient;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return null;
        }
    }

    /**
     * Get the Supabase client instance
     */
    function getClient() {
        if (!supabaseClient) {
            supabaseClient = initSupabase();
        }
        return supabaseClient;
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    const Auth = {
        /**
         * Sign up a new user
         */
        async signUp(email, password, metadata = {}) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (!error && data.user) {
                // Create user profile in profiles table
                await Database.profiles.create({
                    id: data.user.id,
                    email: email,
                    first_name: metadata.firstName || '',
                    last_name: metadata.lastName || '',
                    created_at: new Date().toISOString()
                });
            }

            return { data, error };
        },

        /**
         * Sign in with email and password
         */
        async signIn(email, password) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            return { data, error };
        },

        /**
         * Sign out the current user
         */
        async signOut() {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { error } = await client.auth.signOut();
            return { error };
        },

        /**
         * Get the current user
         */
        async getUser() {
            const client = getClient();
            if (!client) return { data: { user: null } };

            const { data: { user }, error } = await client.auth.getUser();
            return { user, error };
        },

        /**
         * Get the current session
         */
        async getSession() {
            const client = getClient();
            if (!client) return { data: { session: null } };

            const { data: { session }, error } = await client.auth.getSession();
            return { session, error };
        },

        /**
         * Send password reset email
         */
        async resetPassword(email) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { data, error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/pages/auth/reset-password.html`
            });

            return { data, error };
        },

        /**
         * Update user password
         */
        async updatePassword(newPassword) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { data, error } = await client.auth.updateUser({
                password: newPassword
            });

            return { data, error };
        },

        /**
         * Listen to auth state changes
         */
        onAuthStateChange(callback) {
            const client = getClient();
            if (!client) return { data: { subscription: null } };

            return client.auth.onAuthStateChange((event, session) => {
                callback(event, session);
            });
        }
    };

    // ============================================
    // DATABASE OPERATIONS
    // ============================================

    const Database = {
        // User Profiles
        profiles: {
            async create(profile) {
                const client = getClient();
                if (!client) return { error: { message: 'Supabase not configured' } };

                const { data, error } = await client
                    .from('profiles')
                    .insert([profile])
                    .select();

                return { data, error };
            },

            async get(userId) {
                const client = getClient();
                if (!client) return { data: null, error: { message: 'Supabase not configured' } };

                const { data, error } = await client
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                return { data, error };
            },

            async update(userId, updates) {
                const client = getClient();
                if (!client) return { error: { message: 'Supabase not configured' } };

                const { data, error } = await client
                    .from('profiles')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', userId)
                    .select();

                return { data, error };
            }
        },

        // Feedback
        feedback: {
            async create(feedback) {
                const client = getClient();
                if (!client) {
                    // Fallback: store in localStorage
                    return this.createLocal(feedback);
                }

                const { data, error } = await client
                    .from('feedback')
                    .insert([{
                        ...feedback,
                        created_at: new Date().toISOString(),
                        status: 'new'
                    }])
                    .select();

                return { data, error };
            },

            createLocal(feedback) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_feedback') || '[]');
                    const newFeedback = {
                        id: `local_${Date.now()}`,
                        ...feedback,
                        created_at: new Date().toISOString(),
                        status: 'pending_sync'
                    };
                    stored.push(newFeedback);
                    localStorage.setItem('taskmate_feedback', JSON.stringify(stored));
                    return { data: [newFeedback], error: null };
                } catch (error) {
                    return { data: null, error };
                }
            },

            async getAll() {
                const client = getClient();
                if (!client) return { data: [], error: { message: 'Supabase not configured' } };

                const { data, error } = await client
                    .from('feedback')
                    .select('*')
                    .order('created_at', { ascending: false });

                return { data, error };
            },

            async getByUser(userId) {
                const client = getClient();
                if (!client) return { data: [], error: { message: 'Supabase not configured' } };

                const { data, error } = await client
                    .from('feedback')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                return { data, error };
            }
        },

        // Newsletter Subscriptions
        newsletter: {
            async subscribe(email) {
                const client = getClient();
                if (!client) {
                    return this.subscribeLocal(email);
                }

                // Check if already subscribed
                const { data: existing } = await client
                    .from('newsletter_subscribers')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (existing) {
                    return { data: existing, error: null, alreadySubscribed: true };
                }

                const { data, error } = await client
                    .from('newsletter_subscribers')
                    .insert([{
                        email,
                        subscribed_at: new Date().toISOString(),
                        is_active: true
                    }])
                    .select();

                return { data, error, alreadySubscribed: false };
            },

            subscribeLocal(email) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_newsletter') || '[]');
                    if (stored.includes(email)) {
                        return { data: null, error: null, alreadySubscribed: true };
                    }
                    stored.push(email);
                    localStorage.setItem('taskmate_newsletter', JSON.stringify(stored));
                    return { data: { email }, error: null, alreadySubscribed: false };
                } catch (error) {
                    return { data: null, error };
                }
            },

            async unsubscribe(email) {
                const client = getClient();
                if (!client) return { error: { message: 'Supabase not configured' } };

                const { error } = await client
                    .from('newsletter_subscribers')
                    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
                    .eq('email', email);

                return { error };
            }
        },

        // Contact Form Submissions
        contacts: {
            async create(contact) {
                const client = getClient();
                if (!client) {
                    return this.createLocal(contact);
                }

                const { data, error } = await client
                    .from('contact_submissions')
                    .insert([{
                        ...contact,
                        created_at: new Date().toISOString(),
                        status: 'new'
                    }])
                    .select();

                return { data, error };
            },

            createLocal(contact) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_contacts') || '[]');
                    const newContact = {
                        id: `local_${Date.now()}`,
                        ...contact,
                        created_at: new Date().toISOString(),
                        status: 'pending_sync'
                    };
                    stored.push(newContact);
                    localStorage.setItem('taskmate_contacts', JSON.stringify(stored));
                    return { data: [newContact], error: null };
                } catch (error) {
                    return { data: null, error };
                }
            }
        },

        // User Preferences (theme, settings, etc.)
        preferences: {
            async get(userId) {
                const client = getClient();
                if (!client) {
                    return this.getLocal();
                }

                const { data, error } = await client
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                return { data, error };
            },

            getLocal() {
                try {
                    const prefs = JSON.parse(localStorage.getItem('taskmate_preferences') || '{}');
                    return { data: prefs, error: null };
                } catch (error) {
                    return { data: {}, error };
                }
            },

            async save(userId, preferences) {
                const client = getClient();
                if (!client) {
                    return this.saveLocal(preferences);
                }

                const { data, error } = await client
                    .from('user_preferences')
                    .upsert({
                        user_id: userId,
                        ...preferences,
                        updated_at: new Date().toISOString()
                    })
                    .select();

                return { data, error };
            },

            saveLocal(preferences) {
                try {
                    const existing = JSON.parse(localStorage.getItem('taskmate_preferences') || '{}');
                    const updated = { ...existing, ...preferences };
                    localStorage.setItem('taskmate_preferences', JSON.stringify(updated));
                    return { data: updated, error: null };
                } catch (error) {
                    return { data: null, error };
                }
            }
        },

        // CV/Resume Data Storage
        cvData: {
            async save(userId, cvId, data) {
                const client = getClient();
                if (!client) {
                    return this.saveLocal(cvId, data);
                }

                const { data: result, error } = await client
                    .from('user_cvs')
                    .upsert({
                        id: cvId,
                        user_id: userId,
                        data: data,
                        updated_at: new Date().toISOString()
                    })
                    .select();

                return { data: result, error };
            },

            saveLocal(cvId, data) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_cvs') || '{}');
                    stored[cvId] = {
                        data,
                        updated_at: new Date().toISOString()
                    };
                    localStorage.setItem('taskmate_cvs', JSON.stringify(stored));
                    return { data: stored[cvId], error: null };
                } catch (error) {
                    return { data: null, error };
                }
            },

            async get(userId, cvId) {
                const client = getClient();
                if (!client) {
                    return this.getLocal(cvId);
                }

                const { data, error } = await client
                    .from('user_cvs')
                    .select('*')
                    .eq('id', cvId)
                    .eq('user_id', userId)
                    .single();

                return { data, error };
            },

            getLocal(cvId) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_cvs') || '{}');
                    return { data: stored[cvId] || null, error: null };
                } catch (error) {
                    return { data: null, error };
                }
            },

            async getAllByUser(userId) {
                const client = getClient();
                if (!client) {
                    return this.getAllLocal();
                }

                const { data, error } = await client
                    .from('user_cvs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('updated_at', { ascending: false });

                return { data, error };
            },

            getAllLocal() {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_cvs') || '{}');
                    const cvList = Object.entries(stored).map(([id, cv]) => ({
                        id,
                        ...cv
                    }));
                    return { data: cvList, error: null };
                } catch (error) {
                    return { data: [], error };
                }
            },

            async delete(userId, cvId) {
                const client = getClient();
                if (!client) {
                    return this.deleteLocal(cvId);
                }

                const { error } = await client
                    .from('user_cvs')
                    .delete()
                    .eq('id', cvId)
                    .eq('user_id', userId);

                return { error };
            },

            deleteLocal(cvId) {
                try {
                    const stored = JSON.parse(localStorage.getItem('taskmate_cvs') || '{}');
                    delete stored[cvId];
                    localStorage.setItem('taskmate_cvs', JSON.stringify(stored));
                    return { error: null };
                } catch (error) {
                    return { error };
                }
            }
        }
    };

    // ============================================
    // REALTIME SUBSCRIPTIONS
    // ============================================

    const Realtime = {
        /**
         * Subscribe to table changes
         */
        subscribe(table, callback, filter = null) {
            const client = getClient();
            if (!client) return null;

            let channel = client.channel(`${table}_changes`);
            
            const subscription = {
                event: '*',
                schema: 'public',
                table: table
            };

            if (filter) {
                subscription.filter = filter;
            }

            channel = channel.on('postgres_changes', subscription, callback);
            channel.subscribe();

            return channel;
        },

        /**
         * Unsubscribe from channel
         */
        unsubscribe(channel) {
            const client = getClient();
            if (!client || !channel) return;

            client.removeChannel(channel);
        }
    };

    // ============================================
    // STORAGE (File Uploads)
    // ============================================

    const Storage = {
        /**
         * Upload a file
         */
        async upload(bucket, path, file) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { data, error } = await client.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            return { data, error };
        },

        /**
         * Get public URL for a file
         */
        getPublicUrl(bucket, path) {
            const client = getClient();
            if (!client) return null;

            const { data } = client.storage
                .from(bucket)
                .getPublicUrl(path);

            return data.publicUrl;
        },

        /**
         * Delete a file
         */
        async delete(bucket, paths) {
            const client = getClient();
            if (!client) return { error: { message: 'Supabase not configured' } };

            const { error } = await client.storage
                .from(bucket)
                .remove(paths);

            return { error };
        }
    };

    // ============================================
    // EXPORT API
    // ============================================

    window.SupabaseService = {
        init: initSupabase,
        getClient,
        Auth,
        Database,
        Realtime,
        Storage,
        
        // Utility method to check if connected
        isConnected() {
            return supabaseClient !== null && window.isSupabaseConfigured();
        }
    };

    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        initSupabase();
    }

})();
