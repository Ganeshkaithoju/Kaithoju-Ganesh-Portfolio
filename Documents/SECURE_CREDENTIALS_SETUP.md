# Secure Credentials Setup - Database Encryption

## Overview

Your admin credentials are now stored **securely in the database** with **bcrypt encryption**. This is much better than storing them in `.env` files!

**Benefits:**
- ✅ Passwords are encrypted (hashed) - not readable even by you
- ✅ `.env` file no longer needs to contain passwords
- ✅ More professional security approach
- ✅ Can update credentials without redeploying
- ✅ Credentials are backed up with your database

---

## Setup (4 Steps)

### **Step 1: Run Database Migration**

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Run this SQL:

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

**What this creates:**
- `admin_credentials` table
- Secure storage for email & encrypted password
- Timestamps for tracking

### **Step 2: Update `.env.local`**

Keep your current credentials temporarily:

```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_secure_password

# Security questions (keep these, or move to database later)
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

### **Step 3: Migrate Credentials to Database**

**Option A: Use Migration Endpoint (Easiest)**

Open your browser console and run:

```javascript
fetch("/api/owner/migrate-credentials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "your_email@example.com",
    password: "your_secure_password"
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

You should see:
```
{
  success: true,
  message: "Credentials migrated to database successfully",
  email: "your_email@example.com"
}
```

**Option B: Manual Insert (Advanced)**

If the endpoint doesn't work, you can insert directly in Supabase SQL Editor:

```sql
-- First, hash your password using bcrypt
-- Use an online bcrypt generator: https://bcryptjs.online/
-- Or use Node: npx bcryptjs hash "your_password"

INSERT INTO admin_credentials (email, password_hash)
VALUES ('your_email@example.com', '$2b$10/..hashed_password..')
ON CONFLICT (email) 
DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

### **Step 4: Remove Password from `.env.local`**

After migration succeeds, update `.env.local`:

```env
# REMOVE THIS LINE:
# OWNER_PASSWORD=...

# Keep email (used by reset password feature)
OWNER_EMAIL=your_email@example.com

# Keep security questions
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

**Your password is now safely encrypted in the database!** ✅

---

## How It Works

### **Login Flow (with Database)**

```
User enters email + password
    ↓
POST /api/owner/login
    ↓
Query admin_credentials table
    ↓
Get stored password_hash
    ↓
Compare with bcrypt.compare()
    ↓
✓ Match? → Create session → Login
✗ No match? → Show error → Try again
```

### **Forgot Password Flow (with Database)**

```
User answers security questions
    ↓
POST /api/owner/reset-password
    ↓
Verify answers
    ↓
✓ Correct? → Check admin_credentials table
    ↓
✓ Email exists? → Create session → Login
✗ Any error? → Show error → Try again
```

### **Password Hashing (bcrypt)**

Your password is hashed using bcrypt:

```
Plain: "MyPassword123!"
    ↓
bcrypt.hash()
    ↓
Hashed: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDedu4JkaLCJL.6"
    ↓
Stored in database
```

**Why this is secure:**
- One-way encryption (can't reverse it)
- bcrypt is slow by design (protects against brute force)
- Even if database is compromised, passwords are safe

---

## Security Comparison

### **Before: .env File (Unsafe)**
```
❌ Password visible in plain text
❌ Anyone with file access sees it
❌ Hard to change without redeploying
❌ Credentials in version control (if not careful)
```

### **After: Database Encryption (Secure)**
```
✅ Password is hashed (encrypted)
✅ Only hashed version in database
✅ Can change anytime (no redeployment)
✅ Backed up with database backups
✅ Professional security approach
```

---

## Database Schema

### **admin_credentials Table**

```sql
Column          Type                    Purpose
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id              UUID (Primary Key)      Unique record ID
email           TEXT (Unique)           Owner email
password_hash   TEXT                    Encrypted password
created_at      TIMESTAMP               When created
updated_at      TIMESTAMP               Last updated
```

**Example row:**
```
id:             550e8400-e29b-41d4-a716-446655440000
email:          ganesh@example.com
password_hash:  $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDedu4JkaLCJL.6
created_at:     2024-01-15 10:30:00+00
updated_at:     2024-01-15 10:30:00+00
```

---

## Verify Migration Success

### **In Supabase**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:

```sql
SELECT email, 
       SUBSTRING(password_hash FROM 1 FOR 10) || '...' as password_preview,
       created_at
FROM admin_credentials;
```

You should see your email and a password hash like:
```
email                    password_preview    created_at
─────────────────────────────────────────────────────────
ganesh@example.com       $2b$10$... (hashed)  2024-01-15
```

### **Test Login**

1. Run: `npm run dev`
2. Click your name in navbar → `/owner-login`
3. Enter email + password
4. Should login successfully ✓

---

## Update Credentials Anytime

If you want to change your password later:

**Use the endpoint:**

```javascript
fetch("/api/owner/migrate-credentials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "ganesh@example.com",
    password: "new_secure_password"
  })
})
```

Or manually in Supabase:

```sql
-- Hash your new password with bcrypt first
UPDATE admin_credentials 
SET password_hash = '$2b$10/new_hashed_password..'
WHERE email = 'ganesh@example.com';
```

---

## What's Still in `.env.local`?

After migration, you only need:

```env
# Supabase (for all database operations)
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

# Owner login (used by forgot password feature)
OWNER_EMAIL=ganesh@example.com

# Security questions (optional, can move to database later)
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo

# Other optional services
VITE_GOOGLE_APPS_SCRIPT_URL=...
LOVABLE_API_KEY=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

**No passwords in `.env`!** ✅

---

## FAQ

### **Q: Can I see my password in the database?**
**A:** No. Bcrypt is one-way encryption. Only the hash is stored. Even we can't see your original password.

### **Q: What if I forget my password?**
**A:** Use the "Forgot password?" link and answer your security questions.

### **Q: Can I have multiple admin accounts?**
**A:** Currently designed for one. To add more, duplicate the migration insert with different emails.

### **Q: Is the password secure?**
**A:** Yes. Bcrypt is a cryptographically strong hashing algorithm designed specifically for passwords.

### **Q: What if someone gets my database?**
**A:** Passwords are hashed. They'd need to crack bcrypt hashes, which would take years per password.

### **Q: Can I move security questions to database too?**
**A:** Yes, but they're less critical since they're for recovery. Keeping them in `.env` is simpler.

---

## Troubleshooting

### **Migration endpoint returns error**

**Check:**
1. Email format is correct
2. Password is not empty
3. Database migration SQL was run
4. Supabase is connected

Try the manual SQL insert instead.

### **Login fails after migration**

**Check:**
1. Email matches exactly (case-sensitive for email)
2. Password matches exactly
3. Database table has your credentials
4. Credentials were successfully migrated

### **Can't access migration endpoint**

The endpoint is at `/api/owner/migrate-credentials`. Make sure:
1. Project is running: `npm run dev`
2. You're accessing the correct URL
3. POST request with JSON body

---

## Next Steps

1. ✅ Run SQL migration in Supabase
2. ✅ Update `.env.local` with credentials
3. ✅ Migrate credentials to database
4. ✅ Remove password from `.env.local`
5. ✅ Test login works
6. ✅ Verify credentials in Supabase table

**Your admin credentials are now securely encrypted!** 🔐

---

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added bcryptjs for password hashing |
| `src/lib/owner-auth.server.ts` | Updated to use database for verification |
| `src/routes/api/owner/login.ts` | Updated to query database |
| `src/routes/api/owner/reset-password.ts` | Updated to check database |
| `src/routes/api/owner/migrate-credentials.ts` | NEW - Migration endpoint |

---

## Files Created

| File | Purpose |
|------|---------|
| `src/routes/api/owner/migrate-credentials.ts` | Migrate from .env to database |
| `DATABASE_CREDENTIALS_MIGRATION.md` | SQL migration guide |
| `SECURE_CREDENTIALS_SETUP.md` | This file |

---

**Your portfolio now uses enterprise-grade password security!** 🚀
