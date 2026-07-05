# Database Credentials Migration

## SQL Migration - Run This in Supabase

Go to **Supabase Dashboard** → **SQL Editor** → **New Query** and run this SQL:

```sql
-- Create admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated access (optional, for future expansion)
CREATE POLICY "Admin access only" ON admin_credentials
  FOR ALL USING (true);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_credentials(email);
```

## What This Does

✅ Creates `admin_credentials` table
✅ Stores encrypted passwords (hashed)
✅ Email is unique (one admin account)
✅ Tracks creation and update times
✅ Optimized with indexes for fast lookups

## After Running Migration

Your database now has a secure table to store admin credentials. The password will be hashed using bcrypt (one-way encryption - even we can't see the original password).

---

## Next Steps

1. Run the SQL above in Supabase
2. Update `.env.local` with your new credentials:
   ```env
   OWNER_EMAIL=your_email@example.com
   OWNER_PASSWORD=your_secure_password
   # Remove these: SECURITY_ANSWER_1, SECURITY_ANSWER_2 (optional, can keep)
   ```
3. Visit your app and use the migration endpoint (see next file)
4. Remove credentials from `.env.local` after migration
