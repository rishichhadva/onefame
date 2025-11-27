# Firebase Setup Guide

## Quick Fix for "invalid-api-key" Error

The Firebase error occurs because environment variables are missing. Follow these steps:

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click the **Web** icon `</>` to add a web app (if not already added)
6. Copy the **config object** values

### Step 2: Create/Update `.env` File

Create a `.env` file in the **root directory** (same level as `package.json`) with:

```env
# Firebase Configuration (REQUIRED - all must start with VITE_)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:**
- Replace the values with your actual Firebase config values
- All variables **MUST** start with `VITE_` (this is required by Vite)
- No quotes needed around values
- No spaces around the `=` sign

### Step 3: Restart Dev Server

After adding the variables:
1. **Stop** your dev server (Ctrl+C or Cmd+C)
2. **Start** it again: `npm run dev`

The error should be resolved!

## About the "otp-credentials" Warning

The `Unrecognized feature: 'otp-credentials'` warning is **harmless**. It's just the browser checking if the WebOTP API is available. It won't break your app - you can safely ignore it.

## Troubleshooting

### Still seeing the error?

1. **Check file location**: `.env` must be in the root directory (not in `src/` or `backend/`)
2. **Check variable names**: They must start with `VITE_`
3. **Check for typos**: Variable names are case-sensitive
4. **Restart server**: Vite only loads env vars on startup
5. **Clear browser cache**: Sometimes old cached code causes issues

### Verify your .env file

Run this to check if variables are loaded:
```bash
# In your terminal, after starting dev server, check console
# You should see: "✅ Firebase initialized successfully"
```

If you see "❌ Missing Firebase environment variables", double-check your `.env` file.

