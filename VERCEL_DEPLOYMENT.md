# Vercel Deployment Guide

## ✅ Setup Complete

The project has been configured for Vercel deployment. Here's what was done:

1. ✅ Created `vercel.json` configuration
2. ✅ Created `api/index.js` serverless function wrapper
3. ✅ Updated backend to work in serverless environment
4. ✅ Created API utility (`src/lib/api.ts`) for environment-aware URLs
5. ✅ Updated frontend files to use the new API utility

## 📋 Required Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Backend/API Variables:
```
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
DB_USER=postgres
DB_HOST=your_database_host
DB_NAME=onefame
DB_PASSWORD=your_database_password
DB_PORT=5432
```

### Firebase (if using service account):
```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_FILE=./firebase-service-account.json
```

### Frontend Firebase Config (if needed):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🚀 Deployment Steps

1. **Connect Repository to Vercel:**
   - Go to vercel.com
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

2. **Set Environment Variables:**
   - Add all the variables listed above in Vercel dashboard
   - Make sure to set them for Production, Preview, and Development

3. **Deploy:**
   - Vercel will automatically deploy on push to main
   - Or trigger a manual deployment

## ⚠️ Important Notes

1. **Database Connection:**
   - Your PostgreSQL database must be accessible from Vercel's servers
   - Consider using a cloud database (Supabase, Neon, Railway, etc.)
   - Update `DB_HOST` to your database's public URL

2. **API Routes:**
   - All `/api/*` routes will be handled by the serverless function
   - Frontend uses relative URLs in production (works automatically)

3. **File Uploads:**
   - Large file uploads (50MB limit) may need adjustment for serverless
   - Consider using a service like Cloudinary or S3 for file storage

4. **WebSocket/Real-time:**
   - Server-Sent Events endpoint (`/api/stream`) may need adjustment
   - Consider using a dedicated service for real-time features

## 🔧 Troubleshooting

- **API not working:** Check that all environment variables are set
- **Database connection fails:** Verify DB_HOST is accessible from internet
- **Build fails:** Check Vercel build logs for missing dependencies

