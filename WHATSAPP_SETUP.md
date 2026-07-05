# WhatsApp Cloud API Integration Guide

This document explains how to set up the WhatsApp Cloud API integration for your portfolio contact form.

## Architecture Overview

```
Contact Form → Vite (Frontend)
    ↓
Supabase (Store message)
    ↓
Google Apps Script (Backend)
    ↓
Facebook WhatsApp Cloud API → Your WhatsApp Number
```

## Setup Steps

### Step 1: Set Up Facebook Business Account & WhatsApp Cloud API

1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Create a new app (or use existing) and select "Business" type
3. Add "WhatsApp" product to your app
4. Go to **Settings > Basic** and note your **App ID** and **App Secret**
5. Create a WhatsApp Business Account (if not already created)
6. Get your **Phone Number ID** from WhatsApp settings
7. Generate an **Access Token** from Settings > Tokens

### Step 2: Deploy Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy the entire code from `GOOGLE_APPS_SCRIPT_TEMPLATE.js` into the editor
4. Click **Run** to test (it will ask for permissions - click through)
5. Click **Deploy** → **New Deployment**
   - Type: Select "Web app"
   - Execute as: Your email
   - Who has access: "Anyone"
6. Click **Deploy** and copy the generated URL (looks like: `https://script.google.com/macros/s/...../useweb`)

### Step 3: Configure Google Apps Script Properties

1. In Google Apps Script editor, go to **Project Settings** (left sidebar)
2. Scroll to **Script properties**
3. Click **Edit script properties**
4. Add these properties:
   - **Key**: `WHATSAPP_PHONE_NUMBER_ID` | **Value**: Your phone number ID from Step 1
   - **Key**: `WHATSAPP_ACCESS_TOKEN` | **Value**: Your access token from Step 1

### Step 4: Update Portfolio Environment Variables

1. Create or edit `.env.local` in your project root
2. Add this line:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/useweb
   ```
   Replace `YOUR_SCRIPT_ID` with the ID from the deployment URL

3. (Optional) Add your phone number for reference:
   ```
   VITE_WHATSAPP_OWNER_PHONE=7075409339
   ```

### Step 5: Verify the Integration

1. Start your development server: `npm run dev`
2. Fill out the contact form with test data
3. Submit the form
4. Check:
   - Supabase database for the stored message
   - Your WhatsApp number for the incoming message
5. If no message arrives, check:
   - Google Apps Script execution log (click **Execution** in Apps Script editor)
   - Browser console for errors
   - Supabase database to confirm message storage

## File Changes Made

### New Files Created:
- `src/lib/whatsapp-integration.server.ts` - WhatsApp integration logic
- `GOOGLE_APPS_SCRIPT_TEMPLATE.js` - Google Apps Script backend template
- `.env.example-whatsapp` - Environment variables reference
- `WHATSAPP_SETUP.md` - This setup guide

### Modified Files:
- `src/routes/index.tsx` - Added WhatsApp integration to Contact form

### Form Design:
✅ **No changes** - Contact form UI remains identical

## What Happens When a User Submits

1. Form validates input client-side (Zod schema)
2. Message is stored in Supabase `contact_messages` table
3. A POST request is sent to your Google Apps Script with the message data
4. Google Apps Script forwards the message to Facebook's WhatsApp Cloud API
5. Your WhatsApp number receives the formatted message
6. User sees success toast notification

## Message Format Sent via WhatsApp

```
📧 New Contact Form Submission

👤 Name: John Doe
📧 Email: john@example.com
📝 Subject: Project Inquiry
💬 Message:
Hi Ganesh, I'm interested in discussing a potential project...
```

## Troubleshooting

### WhatsApp Message Not Arriving

**Check 1:** Verify Google Apps Script properties
- Go back to [Google Apps Script](https://script.google.com)
- Open your project
- Check **Project Settings** → **Script properties**
- Confirm `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` are set correctly

**Check 2:** Review Google Apps Script Execution Log
- In Google Apps Script editor, click **Execution** (left sidebar)
- Look for recent executions and check for errors
- Click any error to see detailed logs

**Check 3:** Validate Facebook API Credentials
- Go to [Facebook Developer Console](https://developers.facebook.com/)
- Verify your access token is valid (hasn't expired)
- Verify the phone number ID is correct
- Test the API directly with a curl command:
  ```bash
  curl -X POST "https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages" \
    -H "Authorization: Bearer {ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"messaging_product":"whatsapp","to":"7075409339","type":"text","text":{"body":"Test"}}'
  ```

**Check 4:** Verify WhatsApp Number Verification
- Ensure your WhatsApp number is verified in your Business Account
- The number must be in "approved" status

### Environment Variable Not Loading

- Ensure `.env.local` is in the project root directory
- Verify the variable name starts with `VITE_` (required for Vite)
- Restart the dev server after adding `.env.local`
- Check browser console: `console.log(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL)`

### CORS Issues

- Google Apps Script deployments allow cross-origin requests
- If you see CORS errors in browser console, check:
  1. The deployment is set to "Web app" (not "library")
  2. Access is set to "Anyone"
  3. Re-deploy if you haven't already

## Security Considerations

1. **Access Token**: Store in Google Apps Script, not frontend
2. **Phone Number ID**: Can be in Google Apps Script properties
3. **Contact Data**: Stored in Supabase with your security policies
4. **Google Apps Script**: Set up proper authentication if concerned about abuse

## Advanced: Direct API Integration (No Google Apps Script)

If you prefer not to use Google Apps Script, you can:
1. Create a backend endpoint in your project
2. Call WhatsApp API directly from your backend
3. Store the access token on your backend securely

However, the current Google Apps Script approach is simpler for getting started.

## Support & Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/overview)
- [Google Apps Script Documentation](https://developers.google.com/apps-script/guides)
- [Facebook Developer Console](https://developers.facebook.com/)

## Next Steps

1. Complete all setup steps above
2. Test with a sample message
3. Monitor WhatsApp messages and Supabase database
4. Adjust the message format in `whatsapp-integration.server.ts` if needed
5. Consider adding error tracking (e.g., Sentry) for production use
