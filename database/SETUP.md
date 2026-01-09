# Supabase Setup Guide for Taskmate

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `taskmate` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for the project to be provisioned (1-2 minutes)

### 2. Get Your API Credentials

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public** key (safe for client-side)

### 3. Configure Taskmate

Open `js/config/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://YOUR-PROJECT-ID.supabase.co',  // Your Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // Your anon key
};
```

### 4. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**

This creates all necessary tables:
- `profiles` - User profiles
- `feedback` - User feedback
- `newsletter_subscribers` - Newsletter emails
- `contact_submissions` - Contact form data
- `user_preferences` - User settings
- `user_cvs` - Saved CV data
- `analytics_events` - Usage analytics

### 5. Configure Authentication

#### Email Authentication (Required)
1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates at **Authentication** → **Email Templates**

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret
7. In Supabase: **Authentication** → **Providers** → **Google**
8. Enable and paste credentials

#### GitHub OAuth (Optional)
1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret
5. In Supabase: **Authentication** → **Providers** → **GitHub**
6. Enable and paste credentials

### 6. Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create buckets:

**avatars** (for profile pictures):
- Click "New Bucket"
- Name: `avatars`
- Public: ✅ Yes
- Click "Create bucket"

**cv-exports** (for PDF exports):
- Click "New Bucket"  
- Name: `cv-exports`
- Public: ❌ No
- Click "Create bucket"

### 7. Configure Security Policies

The SQL schema includes Row Level Security (RLS) policies. Verify they're active:

1. Go to **Table Editor**
2. Select each table
3. Click **Policies** tab
4. Ensure "Enable RLS" is on

---

## Environment Variables (for production)

For production deployment, use environment variables instead of hardcoding:

### Netlify
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Vercel
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

### GitHub Pages
Since GitHub Pages is static, you'll need to:
1. Use a build step to inject environment variables
2. Or use the config file approach (less secure but works)

---

## Database Schema Overview

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | Extended user info | ✅ User-owned |
| `feedback` | Bug reports & suggestions | ✅ Public write, user read |
| `newsletter_subscribers` | Email subscriptions | ✅ Public write |
| `contact_submissions` | Contact form | ✅ Public write |
| `user_preferences` | User settings | ✅ User-owned |
| `user_cvs` | Saved CV data | ✅ User-owned |
| `analytics_events` | Usage tracking | ✅ Public write |

### Automatic Features

- **Auto-profile creation**: When a user signs up, a profile is automatically created
- **Updated timestamps**: `updated_at` columns auto-update on changes
- **UUID primary keys**: All tables use UUIDs for security

---

## API Usage Examples

### Authentication

```javascript
// Sign up
const { data, error } = await SupabaseService.Auth.signUp(
    'user@example.com',
    'password123',
    { firstName: 'John', lastName: 'Doe' }
);

// Sign in
const { data, error } = await SupabaseService.Auth.signIn(
    'user@example.com',
    'password123'
);

// Sign out
await SupabaseService.Auth.signOut();

// Get current user
const { user } = await SupabaseService.Auth.getUser();
```

### Database Operations

```javascript
// Submit feedback
await SupabaseService.Database.feedback.create({
    type: 'feature',
    message: 'Would love dark mode!',
    email: 'user@example.com'
});

// Subscribe to newsletter
await SupabaseService.Database.newsletter.subscribe('user@example.com');

// Save CV data
await SupabaseService.Database.cvData.save(userId, cvId, {
    name: 'John Doe',
    email: 'john@example.com',
    experience: [...]
});
```

---

## Troubleshooting

### "Supabase not configured" warning
- Check that `js/config/supabase.js` has correct credentials
- Ensure the Supabase CDN script is loaded before your scripts

### RLS policy errors
- Verify RLS is enabled on all tables
- Check that policies exist for your operation (SELECT, INSERT, etc.)
- Ensure user is authenticated for protected operations

### CORS errors
- Add your domain to allowed origins in Supabase Dashboard
- **Settings** → **API** → **Additional allowed origins**

### Auth not working
- Check email confirmation is disabled for testing (Authentication → Settings)
- Verify redirect URLs are correct

---

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://supabase.com/dashboard)
