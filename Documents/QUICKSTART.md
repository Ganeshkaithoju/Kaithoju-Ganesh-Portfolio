# Quick Start - Comments Moderation System

Get up and running in 5 minutes.

## Step 1: Run Database Migration (2 min)

1. Open Supabase Dashboard
2. Go to **SQL Editor** → **New Query**
3. Paste this SQL:

```sql
BEGIN;
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted')),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON contact_messages(is_approved);
CREATE INDEX IF NOT EXISTS idx_messages_is_featured ON contact_messages(is_featured);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON contact_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);

UPDATE contact_messages SET status = 'approved' WHERE status IS NULL;
COMMIT;
```

4. Click **Run**

## Step 2: Generate Password Hash (1 min)

```bash
npx bcryptjs "your_secure_password"
```

Copy the output (starts with `$2b$10`)

## Step 3: Update Admin Config (1 min)

Edit `/config/adminUsers.js`:

```javascript
passwordHash: "$2b$10/YOUR_HASH_HERE" // ← Replace with your hash
```

## Step 4: Set Environment Variable (30 sec)

Create `.env.local`:

```env
JWT_SECRET=your_super_secret_key_min_32_chars
```

## Step 5: Install & Test (1 min)

```bash
npm install bcryptjs jsonwebtoken
npm run dev
```

Visit: `http://localhost:5173/admin/login`

**Login with:**
- Email: `ganeshkaithoju4685@gmail.com`
- Password: The password you used in Step 2

## Done! 🎉

- **Admin Dashboard**: `/admin/login` → `/admin/dashboard`
- **Public Comments**: Bottom of homepage
- **Contact Form**: Works as before (auto-saves to moderation queue)

## Next Steps

Read `COMMENTS_SETUP.md` for:
- Adding more admin accounts
- Production deployment
- Troubleshooting
- Advanced configuration

## Cheat Sheet

| Action | Command |
|--------|---------|
| Generate password hash | `npx bcryptjs "password"` |
| Test password hash | `npx bcryptjs verify "password" "$hash"` |
| View database migration | `DATABASE_MIGRATION.md` |
| Full setup guide | `COMMENTS_SETUP.md` |
| API documentation | `IMPLEMENTATION_COMPLETE.md` |

---

**That's it!** Your portfolio now has a full moderation system.
