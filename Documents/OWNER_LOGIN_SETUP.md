# Owner Login System - Setup Guide

## Overview

The authentication system has been simplified to a **single owner login** using environment variables. No JSON Web Tokens, no complex admin management, no bcrypt hashing.

**Key Benefits:**
- ✅ Simple and secure
- ✅ No dependencies to install
- ✅ Environment variable based
- ✅ Session-based authentication
- ✅ Works everywhere

---

## Setup (3 Steps)

### Step 1: Create Environment Variables

Create or edit `.env.local`:

```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_secure_password
```

**Example:**
```env
OWNER_EMAIL=ganesh@example.com
OWNER_PASSWORD=MySecurePassword123!
```

### Step 2: Run Database Migration

If you haven't already, run the SQL migration in Supabase:

```sql
BEGIN;
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON contact_messages(is_approved);
CREATE INDEX IF NOT EXISTS idx_messages_is_featured ON contact_messages(is_featured);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON contact_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);

UPDATE contact_messages SET status = 'approved' WHERE status IS NULL;
COMMIT;
```

### Step 3: Test

```bash
npm run dev
```

Visit: `http://localhost:5173/owner-login`

**Login with:**
- Email: your_email@example.com
- Password: your_secure_password

---

## How It Works

### Public Flow
1. Visitor submits contact form
2. Message stored in database with `status = 'pending'`
3. Message hidden from public (not visible on portfolio)

### Owner Flow
1. Owner visits `/owner-login`
2. Enters email and password (from environment variables)
3. Server validates credentials
4. Session cookie created (7-day expiry)
5. Owner redirected to `/owner-dashboard`

### Message Approval
1. Owner views pending messages in dashboard
2. Owner clicks "Approve"
3. Message `status` changes to `approved`
4. Message immediately visible on public portfolio

---

## Accessing the Dashboard

### Public Portfolio
→ `http://localhost:5173/`

### Owner Dashboard
→ `http://localhost:5173/owner-login` (then dashboard)

⚠️ **Note:** Dashboard URL is hidden from navigation. Only accessible if you know the `/owner-login` path.

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `OWNER_EMAIL` | Owner email for login | `ganesh@example.com` |
| `OWNER_PASSWORD` | Owner password for login | `MyPassword123!` |

**Security Note:**
- Use strong passwords (min 12 characters)
- Different characters: uppercase, lowercase, numbers, symbols
- Never commit to git
- Use `.env.local` for local development

---

## Production Deployment

### Environment Variables

Set these in your deployment platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `OWNER_EMAIL` and `OWNER_PASSWORD`
3. Deploy

**Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add `OWNER_EMAIL` and `OWNER_PASSWORD`
3. Redeploy

**Other Platforms:**
- Check their documentation for environment variables
- Both variables must be set before deployment

---

## Message Status Reference

| Status | Visible | Description |
|--------|---------|-------------|
| `pending` | ❌ No | New message, waiting for approval |
| `approved` | ✅ Yes | Approved and visible on portfolio |
| `hidden` | ❌ No | In database but hidden from public |
| `deleted` | ❌ No | Permanently removed |

---

## Dashboard Features

### View All Messages
- Filter by status (Pending, Approved, Hidden, All)
- Search by name, email, subject, message
- Pagination (10 per page)
- Real-time statistics

### Manage Messages
- **Approve** - Publish to public comments
- **Hide** - Remove from public (keep in database)
- **Delete** - Permanently remove message
- **Pin** - Sticky at top of comments
- **Feature** - Special styling/star badge

### Statistics
- Total messages
- Pending count
- Approved count
- Hidden count
- Featured count
- Pinned count

---

## Session Management

### Session Duration
- **Expiry:** 7 days
- **Storage:** HTTP-only cookie (secure)
- **Auto-logout:** After 7 days of inactivity

### Logout
Click "Logout" button in dashboard to end session immediately.

---

## Troubleshooting

### "Invalid credentials" error

**Check:**
1. Email matches exactly (case-sensitive)
2. Password matches exactly
3. Environment variables are set correctly
4. `.env.local` file is in project root

**Fix:**
```bash
# Verify env variables are loaded
echo $OWNER_EMAIL
echo $OWNER_PASSWORD

# Restart dev server
npm run dev
```

### "Dashboard shows 401 Unauthorized"

**Causes:**
- Session expired (after 7 days)
- Cookies disabled in browser
- Environment variables not configured

**Fix:**
1. Log in again at `/owner-login`
2. Enable cookies in browser
3. Check `.env.local` file exists

### Messages not showing on portfolio

**Check:**
1. Message `status` is `approved` (not `pending`)
2. Database migration was run
3. Refresh browser cache (Ctrl+Shift+R)

### "Environment variables not found" error

**Verify:**
1. `.env.local` file exists in project root
2. Variables are set correctly: `OWNER_EMAIL=...`
3. Dev server was restarted after adding variables

---

## File Structure

```
src/routes/
├── owner-login.tsx          ← Owner login page
└── owner-dashboard.tsx      ← Owner dashboard

src/routes/api/owner/
├── login.ts                 ← Login endpoint
├── logout.ts                ← Logout endpoint
├── messages.ts              ← Get all messages
├── stats.ts                 ← Dashboard statistics
└── messages/[id]/
    ├── approve.ts
    ├── hide.ts
    ├── delete.ts
    ├── pin.ts
    └── feature.ts

src/lib/
└── owner-auth.server.ts     ← Authentication utilities
```

---

## API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/owner/login` | ❌ No | Owner login |
| POST | `/api/owner/logout` | ✅ Session | Owner logout |
| GET | `/api/owner/messages` | ✅ Session | Get all messages |
| GET | `/api/owner/stats` | ✅ Session | Dashboard stats |
| POST | `/api/owner/messages/:id/approve` | ✅ Session | Approve message |
| POST | `/api/owner/messages/:id/hide` | ✅ Session | Hide message |
| POST | `/api/owner/messages/:id/delete` | ✅ Session | Delete message |
| POST | `/api/owner/messages/:id/pin` | ✅ Session | Toggle pin |
| POST | `/api/owner/messages/:id/feature` | ✅ Session | Toggle feature |

---

## Security Notes

✅ **Secure Practices:**
- Passwords stored in environment variables (not code)
- HTTP-only cookies (can't be accessed by JavaScript)
- Session validation on every API call
- No sensitive data in logs
- Credentials not visible in browser

❌ **What NOT to do:**
- Don't commit environment variables to git
- Don't share passwords in messages/emails
- Don't use weak passwords
- Don't expose `/owner-login` URL publicly

---

## Deployment Checklist

- [ ] Environment variables set in deployment platform
- [ ] Database migration completed
- [ ] Test owner login works
- [ ] Test message approval
- [ ] Test public comments display
- [ ] Verify no console errors
- [ ] Test logout and re-login

---

## FAQ

**Q: Can I have multiple owner accounts?**
A: No, this system supports one owner account only. If you need multiple, modify the code to check against an array of emails/passwords.

**Q: What if I forget the password?**
A: Update the `OWNER_PASSWORD` environment variable and redeploy.

**Q: How secure is this?**
A: Very secure for a single-owner system. Credentials are in environment variables, not in code. Sessions use HTTP-only cookies.

**Q: Can visitors see the `/owner-login` URL?**
A: It's hidden from navigation, but anyone who knows the URL can visit. The login form requires correct credentials to access the dashboard.

**Q: How long does the session last?**
A: 7 days. After that, you'll need to log in again.

---

## Next Steps

1. Set environment variables in `.env.local`
2. Run database migration
3. Test owner login: `/owner-login`
4. Submit a test message via contact form
5. Approve it in dashboard
6. Verify it appears on portfolio

---

**Ready to go!** Your portfolio now has a simple, secure owner login system.
