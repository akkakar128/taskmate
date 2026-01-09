-- ============================================
-- TASKMATE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- Extended user information (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profiles (optional - for showing user names on public content)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- ============================================
-- 2. FEEDBACK TABLE
-- User feedback and bug reports
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'general', 'other')),
    tool TEXT,
    message TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies for feedback
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (auth.uid() = user_id OR email IS NOT NULL);

-- ============================================
-- 3. NEWSLETTER SUBSCRIBERS TABLE
-- Email newsletter subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    source TEXT DEFAULT 'website'
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can update their subscription" ON newsletter_subscribers
    FOR UPDATE USING (true);

-- ============================================
-- 4. CONTACT SUBMISSIONS TABLE
-- Contact form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for contact submissions
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. USER PREFERENCES TABLE
-- User settings and preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. USER CVS TABLE
-- Saved CV/Resume data
-- ============================================
CREATE TABLE IF NOT EXISTS user_cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled CV',
    template TEXT DEFAULT 'modern',
    data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_cvs ENABLE ROW LEVEL SECURITY;

-- Policies for user CVs
CREATE POLICY "Users can view their own CVs" ON user_cvs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs" ON user_cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs" ON user_cvs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs" ON user_cvs
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. ANALYTICS EVENTS TABLE (Optional)
-- Track user interactions for analytics
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies for analytics (write-only for users)
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- Contact
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions(created_at DESC);

-- User CVs
CREATE INDEX IF NOT EXISTS idx_user_cvs_user_id ON user_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cvs_updated_at ON user_cvs(updated_at DESC);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cvs_updated_at
    BEFORE UPDATE ON user_cvs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- You can uncomment these to add test data:

-- INSERT INTO newsletter_subscribers (email, source) VALUES
--     ('test1@example.com', 'website'),
--     ('test2@example.com', 'footer');

-- ============================================
-- STORAGE BUCKETS (Run in Dashboard)
-- ============================================
-- 
-- Create these buckets in Supabase Dashboard > Storage:
-- 
-- 1. avatars - For user profile pictures
--    - Public: Yes
--    - File size limit: 2MB
--    - Allowed types: image/png, image/jpeg, image/gif, image/webp
--
-- 2. cv-exports - For exported CV PDFs
--    - Public: No (require auth)
--    - File size limit: 10MB
--    - Allowed types: application/pdf
--
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
