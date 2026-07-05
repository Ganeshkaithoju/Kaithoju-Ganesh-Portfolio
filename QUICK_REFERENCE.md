# Quick Reference - Owner Login System

## Setup (Copy-Paste)

### 1. Create `.env.local`
```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_secure_password
```

### 2. Run SQL Migration
```sql
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
```

### 3. Start
```bash
npm run dev
# Visit http://localhost:5173/owner-login
```

---

## URLs

| URL | Purpose |
|-----|---------|
| `/owner-login` | Login page |
| `/owner-dashboard` | Dashboard |
| `/#comments` | Public comments |

---

## What You Can Do

### In Dashboard
- ✅ View all messages
- ✅ Search messages
- ✅ Filter by status
- ✅ Approve messages (make public)
- ✅ Hide messages (remove from public)
- ✅ Delete messages (permanent)
- ✅ Pin messages (sticky top)
- ✅ Feature messages (star badge)
- ✅ See statistics

### On Portfolio
- ✅ Submit contact form (messages are private until approved)
- ✅ See approved comments (in new "Community" section below Contact)

---

## Environment Variables

**Required:**
```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_secure_password
```

**Optional (existing):**
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
LOVABLE_API_KEY=...
VITE_GOOGLE_APPS_SCRIPT_URL=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

---

## Files Changed

### New
- `src/lib/owner-auth.server.ts`
- `src/routes/owner-login.tsx`
- `src/routes/owner-dashboard.tsx`
- `src/routes/api/owner/login.ts`
- `src/routes/api/owner/logout.ts`
- `src/routes/api/owner/messages.ts`
- `src/routes/api/owner/stats.ts`
- `src/routes/api/owner/messages/[id]/approve.ts`
- `src/routes/api/owner/messages/[id]/hide.ts`
- `src/routes/api/owner/messages/[id]/delete.ts`
- `src/routes/api/owner/messages/[id]/pin.ts`
- `src/routes/api/owner/messages/[id]/feature.ts`

### Modified
- `package.json` (removed jsonwebtoken, bcryptjs)
- `.env.example` (updated for owner login)

### Removed (Conceptually)
- `config/adminUsers.js` (no longer needed)
- `src/lib/auth.server.ts` (replaced)
- `src/routes/admin/*` (replaced)
- `src/routes/api/admin/*` (replaced)

---

## API Endpoints

```
POST /api/owner/login           ← Login
POST /api/owner/logout          ← Logout
GET  /api/owner/messages        ← Get messages
GET  /api/owner/stats           ← Statistics
POST /api/owner/messages/:id/approve
POST /api/owner/messages/:id/hide
POST /api/owner/messages/:id/delete
POST /api/owner/messages/:id/pin
POST /api/owner/messages/:id/feature
```

---

## Dependencies Removed

- ✂️ `jsonwebtoken`
- ✂️ `bcryptjs`

No new dependencies needed!

---

## Troubleshooting

### Login fails
- Check email matches exactly
- Check password matches exactly
- Restart dev server after changing `.env.local`

### Dashboard shows "Unauthorized"
- Session expired? Log in again
- Cookies disabled? Enable them
- Try different browser

### Comments not showing
- Check message status is `approved` (not `pending`)
- Refresh browser cache (Ctrl+Shift+R)

---

## Features

| Feature | Status |
|---------|--------|
| Public comments | ✅ Works |
| Contact form | ✅ Works |
| Owner login | ✅ Works |
| Message approval | ✅ Works |
| Pin/Feature | ✅ Works |
| Search/Filter | ✅ Works |
| Statistics | ✅ Works |
| Sessions (7 days) | ✅ Works |
| Portfolio UI | ✅ 100% Same |

---

## For Production

1. Set `OWNER_EMAIL` and `OWNER_PASSWORD` in your deployment environment
2. Run database migration in production Supabase
3. Deploy as usual
4. Test login works

---

## More Information

- Full setup: `OWNER_LOGIN_SETUP.md`
- Complete system: `SIMPLIFIED_SYSTEM.md`
- Technical details: `IMPLEMENTATION_COMPLETE.md`
- Database: `DATABASE_MIGRATION.md`

---

**That's it! Enjoy your simple, secure owner login system!**
