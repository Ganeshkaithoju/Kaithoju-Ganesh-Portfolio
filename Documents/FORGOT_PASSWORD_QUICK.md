# Forgot Password - Quick Reference

## Setup (Copy-Paste)

Add to `.env.local`:

```env
OWNER_EMAIL=your_email@example.com
OWNER_PASSWORD=your_password

```

## How to Use

1. Go to `/owner-login`
2. Click **"Forgot password?"**
3. Enter your email
4. Answer the security questions:
   - Q1: What is your dream car?
   - Q2: What is your first mobile name?
5. Click "Verify Answers"
6. You're logged in! ✓

## The Questions

**Q1: What is your dream car?**
- Default: answer1
- Change in `.env.local`: `SECURITY_ANSWER_1=Your answer`

**Q2: What is your first mobile name?**
- Default: answer2
- Change in `.env.local`: `SECURITY_ANSWER_2=Your answer`

## Important

- Answers are **case-insensitive** 
- Whitespace is trimmed 
- Spelling must match exactly
- Both questions must be answered correctly

## URLs

- Login: `/owner-login`
- Forgot Password: `/owner-forgot-password`
- Dashboard: `/owner-dashboard` (after login)

## Full Setup Guide

See `FORGOT_PASSWORD_SETUP.md` for complete details.
