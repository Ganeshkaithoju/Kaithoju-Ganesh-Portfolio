# Environment Setup Guide

This guide explains how to set up your `.env` file for local development.

## Required Environment Variables

### Supabase Configuration (REQUIRED)

Your Supabase credentials are needed for the project to run. Get them from your Supabase Dashboard:

1. Go to **Supabase Dashboard** → **Project Settings** → **API**

2. Copy these values and add them to your `.env` file:

```env
# Client-side keys (published, safe to share)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-key...

# Server-side keys (secret, NEVER share)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...your-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

**Where to find them:**
- **VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY**: Under "Project URL" and "Anon public key"
- **SUPABASE_URL**: Same as VITE_SUPABASE_URL
- **SUPABASE_PUBLISHABLE_KEY**: Same as VITE_SUPABASE_PUBLISHABLE_KEY
- **SUPABASE_SERVICE_ROLE_KEY**: Under "Service Role Key" (⚠️ keep this secret!)

### Owner Authentication (REQUIRED for Admin)

Your owner email is required for the forgot-password feature:

```env
OWNER_EMAIL=your_email@example.com
```

**Note:** Password is NOT stored in `.env` for security. It's encrypted in the database instead.

### Security Questions (REQUIRED for Password Reset)

These answers are used to recover your password:

```env
# Q1: What is your dream car?
SECURITY_ANSWER_1=BMW

# Q2: What is your first mobile name?
SECURITY_ANSWER_2=Samsung s3 neo
```

### Optional: Google Apps Script (for WhatsApp notifications)

```env
VITE_GOOGLE_APPS_SCRIPT_URL=your_gas_deployment_url
```

### Optional: Lovable API

```env
LOVABLE_API_KEY=your_lovable_api_key
```

## Example `.env` File

```env
# ===== SUPABASE (REQUIRED) =====
VITE_SUPABASE_URL=https://jcjctefyearpqkqzaxte.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://jcjctefyearpqkqzaxte.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== OWNER AUTH (REQUIRED) =====
OWNER_EMAIL=ganesh@example.com

# ===== SECURITY QUESTIONS (REQUIRED) =====
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo

# ===== OPTIONAL =====
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/...
LOVABLE_API_KEY=your-api-key
```

## Step-by-Step Setup

### 1. Get Your Supabase Keys

```
1. Open https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the values listed above
5. Add them to .env
```

### 2. Set Your Owner Email

```env
OWNER_EMAIL=your_actual_email@example.com
```

### 3. Set Security Questions

```env
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

### 4. Run the Project

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Verifying Your Setup

### Check if Supabase is Connected

1. Open browser console (F12)
2. Click on your name in the navbar → `/owner-login`
3. If you see the login page without errors, Supabase is connected ✓

### Test Owner Login

1. Go to `/owner-login`
2. Enter your email
3. Enter any password (dummy test)
4. You should see "Invalid credentials" error ✓ (means database is working)

### First-Time Password Setup

1. Go to `/owner-login`
2. Click "Forgot password?"
3. Answer your security questions
4. You'll be logged in
5. This verifies everything is working ✓

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Fix:** Add all 6 Supabase keys to `.env`:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Error: "Invalid credentials" after typing correct password

**Check:**
1. Email matches exactly (case-sensitive)
2. Password matches database (use forgot-password feature to set it)
3. Run: `npm run dev` to reload with new `.env` values

### Error: "SECURITY_ANSWER_1 not configured"

**Fix:** Add these to `.env`:
```env
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

### Port 5173 already in use

**Fix:**
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

## Security Notes

⚠️ **IMPORTANT:**

- **Never** commit `.env` to git
- **Never** share your `SUPABASE_SERVICE_ROLE_KEY`
- Use `OWNER_EMAIL` without password in `.env`
- Passwords are stored encrypted in database

## Files That Use Environment Variables

| File | Uses | Why |
|------|------|-----|
| `src/integrations/supabase/client.server.ts` | Supabase keys | Initialize database client |
| `src/lib/security-questions.server.ts` | SECURITY_ANSWER_1/2 | Verify password recovery answers |
| `src/routes/api/owner/reset-password.ts` | OWNER_EMAIL | Check if email exists |

## Next Steps

1. ✅ Copy Supabase keys to `.env`
2. ✅ Add OWNER_EMAIL and security questions
3. ✅ Run `npm run dev`
4. ✅ Test login on `/owner-login`

**All set!** 🚀
