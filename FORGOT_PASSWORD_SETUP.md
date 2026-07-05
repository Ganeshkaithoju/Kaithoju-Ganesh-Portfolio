# Forgot Password Feature - Setup Guide

## Overview

Your portfolio owner dashboard now includes a **Forgot Password** feature with security questions. If you forget your password, you can reset it by answering two security questions.

---

## Setup (3 Steps)

### Step 1: Update `.env.local`

Add these lines to your `.env.local` file:

```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_secure_password

# Security Questions Answers
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

**Example:**
```env
OWNER_EMAIL=ganesh@example.com
OWNER_PASSWORD=MyPassword123!
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

### Step 2: Customize Your Security Answers (Optional)

The questions are fixed, but you can customize the answers:

**Q1: What is your dream car?**
- Current answer: `BMW`
- Change to: Any answer you want (e.g., `Tesla`, `Ferrari`)

**Q2: What is your first mobile name?**
- Current answer: `Samsung s3 neo`
- Change to: Any answer you want (e.g., `iPhone 4`, `Nokia 3310`)

Just update the environment variables:
```env
SECURITY_ANSWER_1=Your dream car answer
SECURITY_ANSWER_2=Your first mobile answer
```

### Step 3: Test It

1. Run: `npm run dev`
2. Go to your portfolio
3. Click your name → Login page
4. Click **"Forgot password?"** link
5. Follow the flow:
   - Enter your email
   - Answer the security questions
   - You'll be logged in automatically

---

## How It Works

### User Flow

```
Visit /owner-login
    ↓
Click "Forgot password?" link
    ↓
Enter your email
    ↓
Click "Next"
    ↓
See security questions
    ↓
Answer both questions
    ↓
Click "Verify Answers"
    ↓
Answers verified ✓
    ↓
Automatically logged in
    ↓
Redirected to dashboard
```

### Security Features

✅ **Two-Factor Protection**
- Email confirmation (step 1)
- Security questions (step 2)
- Must answer both correctly

✅ **Case-Insensitive**
- "BMW" = "bmw" = "Bmw" ✓
- Answers are automatically normalized

✅ **Session Creation**
- After verification, a fresh 7-day session is created
- Same session as regular login

---

## Security Questions

### Q1: What is your dream car?
Answer you configured in `SECURITY_ANSWER_1`

**Examples:**
- BMW
- Tesla
- Ferrari
- Lamborghini
- Porsche

### Q2: What is your first mobile name?
Answer you configured in `SECURITY_ANSWER_2`

**Examples:**
- Samsung s3 neo
- iPhone 4
- Nokia 3310
- HTC Hero
- Sony Ericsson

---

## URL Reference

| URL | Purpose |
|-----|---------|
| `/owner-login` | Regular login page |
| `/owner-forgot-password` | Forgot password page |
| `/owner-dashboard` | Dashboard (after login) |

---

## Important Notes

### Answers Must Match EXACTLY
- Whitespace is trimmed: `"BMW"` = `" BMW "`
- Case is ignored: `"BMW"` = `"bmw"`
- Punctuation matters: `"S3 Neo"` ≠ `"S3Neo"`

### Recovery Process
If you forget your answers:
1. You'll need to update `.env.local` with new answers
2. Or update `OWNER_PASSWORD` and use regular login
3. There's no admin recovery option (by design for security)

### Change Answers Anytime
Just update environment variables and restart the server:
```bash
# Update .env.local
SECURITY_ANSWER_1=new_answer
SECURITY_ANSWER_2=new_answer

# Restart
npm run dev
```

---

## Customizing Questions (Advanced)

The questions are hardcoded to these two:
- "What is your dream car?"
- "What is your first mobile name?"

If you want to change the questions themselves (not just answers), you'd need to edit:
```
src/lib/security-questions.server.ts
```

But the answers are always configured via environment variables.

---

## Troubleshooting

### "Incorrect answers" error
- Check spelling exactly
- Verify capitalization (case doesn't matter, but spelling does)
- Make sure you're using the answers from `.env.local`
- Check for extra spaces

### "Invalid email" error
- Email must match `OWNER_EMAIL` in `.env.local`
- Exact match required

### "Answers not configured" error
- Environment variables not set
- Add `SECURITY_ANSWER_1` and `SECURITY_ANSWER_2` to `.env.local`
- Restart the dev server

### Can't remember the answers
- Check `.env.local` file
- Or update the answers and use the new ones

---

## Security Best Practices

✅ **Do:**
- Use memorable but not-too-obvious answers
- Store `.env.local` safely (don't share)
- Use strong password + security questions together
- Change answers periodically (optional)

❌ **Don't:**
- Use answers that are publicly findable (social media)
- Share your answers with anyone
- Commit `.env.local` to git (it's in `.gitignore`)
- Use the same answers for other services

---

## Example Setup

### Your Setup
```env
OWNER_EMAIL=ganesh@example.com
OWNER_PASSWORD=MySecurePassword123!
SECURITY_ANSWER_1=BMW
SECURITY_ANSWER_2=Samsung s3 neo
```

### Forgot Password Flow
```
Forgot Password Form
  ↓
Email: ganesh@example.com ✓
  ↓
Q1: What is your dream car?
Ans: BMW ✓
  ↓
Q2: What is your first mobile name?
Ans: Samsung s3 neo ✓
  ↓
✓ All verified!
↓
Login successful
↓
Redirected to dashboard
```

---

## Complete Setup Checklist

- [ ] Add `SECURITY_ANSWER_1=BMW` to `.env.local`
- [ ] Add `SECURITY_ANSWER_2=Samsung s3 neo` to `.env.local`
- [ ] (Optional) Customize the answers to your own
- [ ] Restart dev server: `npm run dev`
- [ ] Test the forgot password flow
- [ ] Verify you can login with security questions
- [ ] Bookmark `/owner-login` or click your name

---

## You're All Set!

Your forgot password feature is now active. If you ever forget your password:

1. Go to `/owner-login`
2. Click "Forgot password?"
3. Answer your security questions
4. You'll be logged in automatically

**Simple, secure, and ready to use!** 🚀
