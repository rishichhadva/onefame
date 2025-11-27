# Environment Variables Guide

## Current Status

Your `backend/.env` file currently only has:
- ✅ RAZORPAY_KEY_ID
- ✅ RAZORPAY_KEY_SECRET

## Missing Variables

You need to add these to `backend/.env`:

### Required Variables:

```env
# JWT Secret (REQUIRED - used for authentication tokens)
JWT_SECRET=your_secure_random_string_here

# Database Configuration (REQUIRED)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=onefame
DB_PASSWORD=your_database_password_here
DB_PORT=5432
```

## Where These Are Used

### JWT_SECRET
- **File**: `backend/index.js` (line 21)
- **Used for**: Signing and verifying JWT authentication tokens
- **Generate**: Use a long random string (at least 32 characters)
  ```bash
  # Generate a secure random string:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Database Variables
- **File**: `backend/db.js` (lines 4-8)
- **Used for**: PostgreSQL database connection
- **Current defaults**: 
  - DB_USER: 'postgres'
  - DB_HOST: 'localhost'
  - DB_NAME: 'onefame'
  - DB_PASSWORD: '' (empty - you need to set this!)
  - DB_PORT: 5432

## Complete `backend/.env` File

Your `backend/.env` should look like this:

```env
# JWT Secret - Generate a secure random string
JWT_SECRET=your_generated_secret_here_min_32_chars

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=onefame
DB_PASSWORD=your_actual_database_password
DB_PORT=5432

# Razorpay (already have these)
RAZORPAY_KEY_ID=rzp_test_RkK2lNFjpnM0CY
RAZORPAY_KEY_SECRET=OVzSF4z2eVoJS34qdvnUjFNT
```

## Quick Setup

1. **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to backend/.env**:
   ```bash
   # Open backend/.env and add:
   JWT_SECRET=<paste_generated_secret>
   DB_PASSWORD=<your_postgres_password>
   ```

3. **Restart backend server**:
   ```bash
   cd backend
   npm start
   ```

## For Vercel Deployment

Add ALL these variables in Vercel Dashboard:
- Settings → Environment Variables
- Add each variable for Production, Preview, and Development

**Important for Vercel:**
- `DB_HOST` should be your cloud database URL (not `localhost`)
- Example: `DB_HOST=your-db.neon.tech` or `your-db.supabase.co`

