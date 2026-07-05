# Comments Moderation System - Setup Guide

## Overview

This guide walks you through setting up the moderation system for your portfolio comments.

## 1. Database Setup

### Step 1: Run the SQL Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy the SQL from `DATABASE_MIGRATION.md`
6. Click **Run**

This adds moderation columns to the `contact_messages` table.

## 2. Admin Configuration

### Step 1: Generate a bcrypt Password Hash

You need to generate a bcrypt hash for your admin password.

**Option A: Using Node.js (Local)**
```bash
npx bcryptjs "your_password_here"
```

This will output something like:
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDedu4JkaLCJL.6
```

**Option B: Using Online Generator** (for testing only)
- [bcryptjs online](https://bcryptjs-online.com/)
- [bcrypt-generator](https://bcrypt-generator.com/)

### Step 2: Update Admin Users Config

Edit `/config/adminUsers.js`:

```javascript
export default [
  {
    email: "ganeshkaithoju4685@gmail.com",
    passwordHash: "$2b$10/YOUR_HASHED_PASSWORD_HERE", // Replace with your bcrypt hash
    name: "Ganesh Kaithoju"
  },
  // Add more admins if needed:
  // {
  //   email: "another@example.com",
  //   passwordHash: "$2b$10/ANOTHER_HASHED_PASSWORD",
  //   name: "Another Admin"
  // }
];
```

## 3. Environment Variables

### Add to your `.env.local` file:

```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
```

**Security Note**: 
- Change this to a strong random string in production
- Never commit real secrets to git
- Use at least 32 characters

## 4. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken
```

## 5. Verify Setup

### Access Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/admin/login`

3. Enter credentials:
   - **Email**: ganeshkaithoju4685@gmail.com
   - **Password**: The password you hashed earlier

4. You should see the moderation dashboard

### Test Message Moderation

1. Go back to your portfolio homepage
2. Scroll to the **Contact** section
3. Submit a test message
4. Go to **Admin Dashboard**
5. You should see your message in the **Pending** filter
6. Click **Approve** to make it visible publicly
7. Go back to homepage and scroll to **Community** section
8. Your comment should appear

## 6. Feature Reference

### Public Comments Section

Displays only **approved** messages on the portfolio:
- Shows pinned comments first
- Then featured comments
- Then newest comments
- Displays: Name, Comment, Date
- Hides: Email, Subject, Status

### Admin Dashboard (`/admin/dashboard`)

Full moderation panel with:
- **Statistics**: Total, Pending, Approved, Hidden, Featured, Pinned
- **Search**: By name, email, subject, message
- **Filters**: Pending, Approved, Hidden, All Messages
- **Pagination**: 10 messages per page
- **Actions**: Approve, Hide, Delete, Pin, Feature

### Message Status Values

| Status | Visible | Meaning |
|--------|---------|---------|
| `pending` | ❌ No | New message, awaiting review |
| `approved` | ✅ Yes | Approved and visible publicly |
| `hidden` | ❌ No | Manually hidden by owner |
| `deleted` | ❌ No | Permanently deleted |

### Message Attributes

| Field | Type | Description |
|-------|------|-------------|
| `is_pinned` | BOOLEAN | Message stays at top of comments |
| `is_featured` | BOOLEAN | Message gets premium visual style |
| `status` | TEXT | pending, approved, hidden, deleted |
| `moderated_at` | TIMESTAMP | When the message was moderated |

## 7. Adding More Admin Accounts

To add another admin account:

1. Generate a bcrypt hash for the new password
2. Edit `/config/adminUsers.js`
3. Add a new entry:
   ```javascript
   {
     email: "newadmin@example.com",
     passwordHash: "$2b$10/THE_NEW_HASH",
     name: "New Admin Name"
   }
   ```
4. That's it! No database changes needed.

## 8. Troubleshooting

### "Invalid credentials" on login

- Verify email matches exactly (case-sensitive)
- Verify bcrypt hash is correctly pasted
- Check that `/config/adminUsers.js` has no syntax errors
- Test your password hash: `npx bcryptjs verify "your_password" "$2b$10/hash"`

### Comments not showing on portfolio

1. Check message status is `approved` in dashboard
2. Verify database migration was run successfully
3. Clear browser cache and reload
4. Check browser console for errors

### Admin dashboard shows 401 Unauthorized

- You're logged out or token expired
- Log back in at `/admin/login`
- Tokens expire after 7 days

### Password reset

Unfortunately, the system doesn't have built-in password reset. To reset:

1. Update the bcrypt hash in `/config/adminUsers.js`
2. Redeploy your site
3. Log in with new password

## 9. Production Deployment

### Before deploying:

1. ✅ Change `JWT_SECRET` in `.env` to a strong random value
2. ✅ Test admin login
3. ✅ Test message moderation
4. ✅ Verify migration is running in production database
5. ✅ Don't commit `/config/adminUsers.js` with real credentials to public repo

### Secure practices:

- Use `.env.production` for production secrets
- Use secrets management (Vercel, Netlify, etc.) for deployed sites
- Rotate `JWT_SECRET` periodically
- Monitor admin access logs (optional future feature)
- Use strong passwords and bcrypt hashing

## 10. API Endpoints Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/admin/login` | ❌ No | Admin login |
| GET | `/api/comments/approved` | ❌ No | Get public comments |
| GET | `/api/admin/pending` | ✅ JWT | Get pending messages |
| GET | `/api/admin/messages` | ✅ JWT | Get all messages (with search/filter) |
| GET | `/api/admin/stats` | ✅ JWT | Get dashboard statistics |
| POST | `/api/admin/messages/:id/approve` | ✅ JWT | Approve a message |
| POST | `/api/admin/messages/:id/hide` | ✅ JWT | Hide a message |
| POST | `/api/admin/messages/:id/delete` | ✅ JWT | Delete a message |
| POST | `/api/admin/messages/:id/pin` | ✅ JWT | Toggle pin status |
| POST | `/api/admin/messages/:id/feature` | ✅ JWT | Toggle feature status |

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify database migration completed successfully
3. Check browser console for error messages
4. Review environment variables are set correctly
5. Ensure all new files are in correct directories

## Next Steps

- Customize the admin dashboard UI if desired
- Add email notifications when messages are received
- Add rate limiting to prevent spam
- Set up automated message digest emails
- Add message flagging/reporting system
