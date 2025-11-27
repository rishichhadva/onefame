# Vercel Deployment Fix Guide

## Issues Fixed

1. ✅ Updated `vercel.json` with proper build configuration
2. ✅ Added backend dependencies to root `package.json` (required for serverless functions)
3. ✅ Fixed `api/index.js` to properly handle Vercel serverless function format

## What You Need to Do

### 1. Install Dependencies

Run this in your terminal to install the new backend dependencies:

```bash
npm install
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

#### Backend Variables:
```
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
DB_USER=postgres
DB_HOST=your_database_host (e.g., your-db.neon.tech)
DB_NAME=onefame
DB_PASSWORD=your_database_password
DB_PORT=5432
```

#### Frontend Variables:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Firebase Admin (if using):
```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

**Important:**
- Set these for **Production**, **Preview**, and **Development** environments
- Make sure your database is accessible from the internet (use a cloud database like Neon, Supabase, or Railway)

### 3. Deploy to Vercel

After setting environment variables:

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

2. Vercel will automatically deploy, or you can trigger a manual deployment

### 4. Check Deployment Logs

If deployment fails:
1. Go to Vercel dashboard → Your project → Deployments
2. Click on the failed deployment
3. Check the build logs for errors
4. Common issues:
   - Missing environment variables
   - Database connection issues
   - Build errors

## Troubleshooting

### API Routes Not Working

If `/api/*` routes return 404:
- Check that `api/index.js` exists
- Verify `vercel.json` has correct routing configuration
- Check deployment logs for import errors

### Database Connection Issues

- Make sure `DB_HOST` is a public URL (not `localhost`)
- Verify database allows connections from Vercel's IPs
- Check database credentials are correct

### Build Fails

- Check that all dependencies are in root `package.json`
- Verify Node.js version in Vercel settings (should be 18+)
- Check build logs for specific error messages

## Testing Locally

To test the Vercel setup locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server
vercel dev
```

This will simulate the Vercel environment locally.

