# Complete Login & Password Recovery Setup Guide

This guide will get your owner login and forgot password working in 5 minutes.

## What You Need

Before starting, gather:
- Your email address (e.g., `ganeshkaithoju4685@gmail.com`)
- A secure password (e.g., `MySecurePassword123!`)
- Access to your Supabase Dashboard

## Step 1: Create the Database Table (1 minute)

Your credentials will be stored in a secure encrypted table.

1. Go to **[Supabase Dashboard](https://app.supabase.com)**
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON admin_credentials
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_credentials(email);
```

5. Click the **RUN** button (blue play button)
6. You should see: ✓ Success

## Step 2: Update Your `.env` File (1 minute)

Make sure your `.env` file has:

```env
# Your email (required for password reset)
OWNER_EMAIL=ganeshkaithoju4685@gmail.com

# Security questions (required for password recovery)
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo

# Your Supabase URLs (should already be here)
SUPABASE_URL=https://...
VITE_SUPABASE_URL=https://...
```

**Important:** Do NOT add your password to `.env`. It will be stored encrypted in the database instead.

## Step 3: Migrate Your Credentials (2 minutes)

Now you'll encrypt your password and store it in the database.

**In your browser console (F12 → Console tab)**, run:

```javascript
fetch("/api/owner/migrate-credentials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "ganeshkaithoju4685@gmail.com",
    password: "MySecurePassword123!"
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

**Replace:**
- `ganeshkaithoju4685@gmail.com` → your actual email
- `MySecurePassword123!` → your actual password

**You should see:**
```json
{
  "success": true,
  "message": "Credentials migrated to database successfully",
  "email": "ganeshkaithoju4685@gmail.com"
}
```

If you get an error, scroll down to **Troubleshooting** section.

## Step 4: Test Your Login (1 minute)

1. Go to your portfolio: `http://localhost:5173`
2. Click your name **"Ganesh Kaithoju"** in the navbar
3. You should be redirected to `/owner-login`
4. Enter your email and password
5. Click **Sign In**
6. You should now see the **Owner Dashboard** ✓

## Step 5: Test Password Recovery (Optional)

1. Go back to `/owner-login`
2. Click **"Forgot password?"**
3. Enter your email
4. Answer the security questions:
   - Q1: `BMW` (or your actual answer if different)
   - Q2: `Samsung s3 neo` (or your actual answer if different)
5. Click **Verify**
6. You should be logged in ✓

---

## Troubleshooting

### Problem: Migration fails with "Missing Supabase"

**Cause:** Service role key not available in this context.

**Solution:** Try using the manual database insert method instead (see below).

### Problem: Migration succeeds but login still fails

**Cause:** Your email or password doesn't match exactly.

**Solution:**
1. Try the migration again with the exact email/password
2. Check for leading/trailing spaces in your email
3. Make sure caps lock isn't on for password

### Problem: Login button does nothing / page freezes

**Cause:** Database connection issue or table doesn't exist.

**Solution:**
1. Make sure you ran the SQL migration in Supabase (Step 1)
2. Check that the table was created:
   - Supabase → SQL Editor → Run:
   ```sql
   SELECT * FROM admin_credentials;
   ```
3. You should see your email in the results

### Problem: "Email not found" in password reset

**Cause:** Email not in database yet.

**Solution:** Run the migration again with your exact email.

### Problem: "Incorrect answers" in password reset

**Cause:** Security answers don't match what's in `.env`.

**Solution:**
1. Check your `.env` file for:
   ```
   SECURITY_ANSWER_1=BMW
   SECURITY_ANSWER_2=Samsung s3 neo
   ```
2. Make sure answers match EXACTLY (case-sensitive)
3. Restart the dev server after editing `.env`

### Problem: Can't find my Supabase project

**Solution:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Look for your project (ID: `jcjctefyearpqkqzaxte`)
3. Click it to open the dashboard

---

## Manual Database Insert (Alternative Method)

If the migration endpoint doesn't work, you can manually insert credentials:

### Step 1: Hash Your Password

Use Node.js to hash your password:

```bash
npx bcryptjs hash "MySecurePassword123!"
```

Copy the output (starts with `$2b$10`)

### Step 2: Insert into Database

In Supabase SQL Editor, run:

```sql
INSERT INTO admin_credentials (email, password_hash)
VALUES ('ganeshkaithoju4685@gmail.com', '$2b$10/YOUR_HASH_HERE')
ON CONFLICT (email) 
DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

Replace:
- `ganeshkaithoju4685@gmail.com` → your email
- `$2b$10/YOUR_HASH_HERE` → the hash you generated above

Click **RUN**.

### Step 3: Verify

Run this to check:

```sql
SELECT email, SUBSTRING(password_hash FROM 1 FOR 15) as hash_preview FROM admin_credentials;
```

You should see your email.

---

## How It Works

### Login Flow

```
You enter email + password
         ↓
POST /api/owner/login
         ↓
Query admin_credentials table
         ↓
Get stored encrypted password
         ↓
Compare with bcrypt.compare()
         ↓
✓ Match? → Create session → Dashboard
✗ No match? → Show error
```

### Password Reset Flow

```
You answer security questions
         ↓
POST /api/owner/reset-password
         ↓
Verify answers from .env
         ↓
✓ Correct? → Check if email exists in database
         ↓
✓ Found? → Create session → Dashboard
✗ Failed? → Show error
```

---

## What's Secure About This?

✅ **Password is encrypted** - Stored as hash, not plain text
✅ **Even you can't see it** - Hashing is one-way encryption  
✅ **Safe from hackers** - bcrypt is designed to resist attacks
✅ **No plain text in files** - Password not in `.env`
✅ **Only questions in .env** - Security questions are okay to store

---

## Checklist

Before you start:

- [ ] Have your email ready
- [ ] Have your password ready
- [ ] Can access Supabase Dashboard
- [ ] Dev server is running (`npm run dev`)

During setup:

- [ ] Created `admin_credentials` table in Supabase
- [ ] Updated `.env` with email and security answers
- [ ] Ran migration endpoint (saw success message)

After setup:

- [ ] Can login at `/owner-login` ✓
- [ ] Can access `/owner-dashboard` ✓
- [ ] Can use "Forgot password?" feature ✓

---

## Quick Reference

| What | Where | How |
|------|-------|-----|
| **Create table** | Supabase SQL Editor | Run SQL migration |
| **Store credentials** | Database | Run migration endpoint or manual insert |
| **Login** | `/owner-login` | Email + Password |
| **Reset password** | `/owner-forgot-password` | Email + Security answers |
| **Update password** | Migration endpoint | Send new credentials to `/api/owner/migrate-credentials` |

---

## Need More Help?

Check these files:
- `ENVIRONMENT_SETUP.md` - Environment variables
- `SECURE_CREDENTIALS_SETUP.md` - Database details
- `FORGOT_PASSWORD_SETUP.md` - Password reset details

Or review the login code:
- Frontend: `src/routes/owner-login.tsx`
- Backend: `src/routes/api/owner/login.ts`
- Auth lib: `src/lib/owner-auth.server.ts`

---

**You're all set!** 🚀

Once you complete these 5 steps, your admin login and password recovery will be fully functional.
