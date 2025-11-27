


import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './db.js';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Initialize Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are required in environment variables');
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(cors());
// Increase body size limit to 50MB to handle large base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Try to initialize Firebase Admin SDK if service account provided.
// Use dynamic import so the server can run without the package installed.
const loadServiceAccountJson = () => {
  // Check if environment variable is set
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('📝 Found FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
    return process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
    // Debug: log all env vars that start with FIREBASE
    const firebaseVars = Object.keys(process.env).filter(k => k.startsWith('FIREBASE'));
    if (firebaseVars.length > 0) {
      console.log('Found Firebase-related env vars:', firebaseVars);
    }
  }
  try {
    const saPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_FILE ||
      path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(saPath)) {
      console.log('📝 Found Firebase service account file:', saPath);
      return fs.readFileSync(saPath, 'utf8');
    }
  } catch (err) {
    console.warn('Failed reading Firebase service account file', err);
  }
  return null;
};

let admin;
(async () => {
  try {
    const saJson = loadServiceAccountJson();
    if (!saJson) {
      console.warn('⚠️ Firebase Admin: FIREBASE_SERVICE_ACCOUNT_JSON not set or file not found');
      return;
    }
    
    let sa;
    try {
      sa = JSON.parse(saJson);
    } catch (parseErr) {
      console.error('❌ Firebase Admin: Failed to parse JSON:', parseErr.message);
      console.error('JSON length:', saJson.length);
      console.error('First 200 chars:', saJson.substring(0, 200));
      console.error('Last 200 chars:', saJson.substring(Math.max(0, saJson.length - 200)));
      console.error('⚠️ The JSON appears to be truncated. Make sure the entire JSON is pasted as a single line in Vercel.');
      return;
    }
    
    try {
      const mod = await import('firebase-admin');
      admin = mod.default || mod;
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (importErr) {
      console.error('❌ Firebase Admin: Import/init error:', importErr.message);
      console.error('Full error:', importErr);
    }
  } catch (err) {
    console.error('❌ Firebase Admin init failed:', err.message);
    console.error('Full error:', err);
  }
})();

// Simple Server-Sent Events endpoint for live notifications (non-blocking, optional client usage)
app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();

  let counter = 0;
  const send = () => {
    counter += 1;
    const payload = JSON.stringify({ id: counter, time: Date.now(), message: 'ping' });
    res.write(`data: ${payload}\n\n`);
  };

  // Send an initial event
  send();
  const iv = setInterval(send, 15000); // every 15s

  req.on('close', () => {
    clearInterval(iv);
    res.end();
  });
});

// Update user profile endpoint (now correctly placed)
app.put('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', expired: true });
      } else if (jwtErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', invalid: true });
      }
      return res.status(401).json({ error: 'Token verification failed' });
    }
    const { name, username, email, role, bio, interests, skills, location, experience, services, socials, portfolio_description, instagram_handle, profile_photo } = req.body;
    
    // Check if username is already taken by another user (case-insensitive)
    if (username) {
      const usernameLower = username.trim().toLowerCase();
      const usernameCheck = await pool.query('SELECT email FROM users WHERE LOWER(username) = $1 AND email != $2', [usernameLower, decoded.email]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    // Update role if provided
    if (role && (role === 'influencer' || role === 'provider')) {
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, decoded.email]);
      // If provider, add default service for search
      if (role === 'provider') {
        const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [decoded.email]);
        const userName = userResult.rows[0]?.name || name;
        // Check if service already exists
        const serviceCheck = await pool.query('SELECT id FROM services WHERE provider = $1', [userName]);
        if (serviceCheck.rows.length === 0) {
          await pool.query(
            'INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [`${userName}'s Service`, userName, '1000', 'Active', 'General', 'Remote', '5.0', '/placeholder.svg']
          );
        }
      }
    }
    
    // Try to update with username, fallback if column doesn't exist
    try {
      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
      if (username !== undefined) { updates.push(`username = $${paramCount++}`); values.push(username); }
      if (email !== undefined) { updates.push(`email = $${paramCount++}`); values.push(email); }
      if (bio !== undefined) { updates.push(`bio = $${paramCount++}`); values.push(bio); }
      if (interests !== undefined) { updates.push(`interests = $${paramCount++}`); values.push(interests); }
      if (skills !== undefined) { updates.push(`skills = $${paramCount++}`); values.push(skills); }
      if (location !== undefined) { updates.push(`location = $${paramCount++}`); values.push(location); }
      if (experience !== undefined) { updates.push(`experience = $${paramCount++}`); values.push(experience); }
      if (services !== undefined) { updates.push(`services = $${paramCount++}`); values.push(services); }
      if (socials !== undefined) { updates.push(`socials = $${paramCount++}`); values.push(socials); }
      if (portfolio_description !== undefined) { 
        // Ensure column exists
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_description TEXT');
        } catch (e) {
          // Column might already exist, ignore
        }
        updates.push(`portfolio_description = $${paramCount++}`); 
        values.push(portfolio_description);
      }
      if (instagram_handle !== undefined) { 
        // Ensure column exists
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100)');
        } catch (e) {
          // Column might already exist, ignore
        }
        updates.push(`instagram_handle = $${paramCount++}`); 
        values.push(instagram_handle);
      }
      if (profile_photo !== undefined) { 
        // Ensure column exists
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT');
        } catch (e) {
          // Column might already exist, ignore
        }
        updates.push(`profile_photo = $${paramCount++}`); 
        values.push(profile_photo);
      }
      
      if (updates.length > 0) {
        values.push(decoded.email);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramCount}`;
        console.log('Updating profile with', updates.length, 'fields');
        await pool.query(query, values);
        console.log('Profile updated successfully');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      console.error('Error stack:', err.stack);
      
      // If username column doesn't exist, add it and retry
      if (err.message && err.message.includes('column "username" does not exist')) {
        try {
          // First add the column without UNIQUE constraint
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)');
          // Then add unique constraint if it doesn't exist
          try {
            await pool.query('ALTER TABLE users ADD CONSTRAINT username_unique UNIQUE (username)');
          } catch (constraintErr) {
            // Constraint might already exist, ignore
            if (!constraintErr.message.includes('already exists')) {
              console.error('Constraint creation error:', constraintErr);
            }
          }
          // Retry with basic fields
          try {
            await pool.query(
              'UPDATE users SET name = $1, username = $2, email = $3, bio = $4, interests = $5, skills = $6, location = $7, experience = $8, services = $9, socials = $10 WHERE email = $11',
              [name, username, email, bio, interests, skills, location, experience, services, socials, decoded.email]
            );
            // Success after retry - continue to handle portfolio_images below
          } catch (retryErr) {
            console.error('Retry update error:', retryErr);
            return res.status(500).json({ error: 'Database error', details: retryErr.message });
          }
        } catch (alterErr) {
          console.error('Column creation error:', alterErr);
          return res.status(500).json({ error: 'Database error', details: alterErr.message });
        }
      } else {
        return res.status(500).json({ error: 'Server error', details: err.message });
      }
    }
    
    // Handle portfolio_images if provided
    const { portfolio_images } = req.body;
    if (portfolio_images !== undefined) {
      try {
        await pool.query('UPDATE users SET portfolio_images = $1 WHERE email = $2', [JSON.stringify(portfolio_images), decoded.email]);
      } catch (err) {
        // If portfolio_images column doesn't exist, add it
        if (err.message.includes('column "portfolio_images" does not exist')) {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_images TEXT');
          await pool.query('UPDATE users SET portfolio_images = $1 WHERE email = $2', [JSON.stringify(portfolio_images), decoded.email]);
        } else {
          throw err;
        }
      }
    }
    // Return updated user data
    const updatedUser = await pool.query('SELECT name, username, email, role, bio, interests, skills, location, experience, services, socials, portfolio_images, portfolio_description, instagram_handle, profile_photo, createdat FROM users WHERE email = $1', [decoded.email]);
    if (updatedUser.rows.length > 0) {
      const user = updatedUser.rows[0];
      user.createdAt = user.createdat;
      delete user.createdat;
      // Parse portfolio_images
      if (user.portfolio_images) {
        try {
          user.portfolio_images = JSON.parse(user.portfolio_images);
        } catch {
          user.portfolio_images = [];
        }
      } else {
        user.portfolio_images = [];
      }
      res.json({ success: true, message: 'Profile updated.', user });
    } else {
      res.json({ success: true, message: 'Profile updated.' });
    }
  } catch (err) {
    console.error('Profile update outer error:', err);
    console.error('Error stack:', err.stack);
    
    // Check if it's a JWT error
    if (err.message && (err.message.includes('jwt') || err.message.includes('token'))) {
      return res.status(401).json({ error: 'Invalid or expired token', expired: true });
    }
    
    // Generic server error
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Welcome route for root URL
app.get('/', (req, res) => {
  res.send('OneFame backend is running!');
});

// Sample data endpoint for testing
// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );
    // If provider, add default service for search
    if (role === 'provider') {
      await pool.query(
        'INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          `${name}'s Service`,
          name,
          '1000',
          'Active',
          'General',
          'Remote',
          '5.0',
          '/placeholder.svg'
        ]
      );
    }
    res.json({ success: true, message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Firebase ID token and create/return local JWT
app.post('/api/auth/firebase', async (req, res) => {
  const { idToken, role } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
  try {
    if (!admin?.apps?.length) {
      console.warn('Firebase Admin not configured. Phone/Google auth will not work. Set FIREBASE_SERVICE_ACCOUNT_JSON in environment variables.');
      return res.status(503).json({ 
        error: 'Firebase Admin not configured',
        message: 'Please set FIREBASE_SERVICE_ACCOUNT_JSON environment variable'
      });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number || null;
    const email =
      decoded.email ||
      phone ||
      (decoded.uid ? `${decoded.uid}@firebase.local` : null);
    if (!email) {
      console.error('Firebase token missing identifiable user fields');
      return res.status(400).json({ error: 'Incomplete Firebase profile' });
    }
    const name =
      decoded.name ||
      (decoded.email ? decoded.email.split('@')[0] : null) ||
      (phone ? `User ${phone.slice(-4)}` : null) ||
      'User';

    // Upsert user in database by email
    let existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const isNewUser = existing.rows.length === 0;
    
    if (isNewUser) {
      // If role is provided (from signup), use it; otherwise set to null
      const initialRole = (role && (role === 'influencer' || role === 'provider')) ? role : null;
      await pool.query(
        'INSERT INTO users (name, email, role, createdat) VALUES ($1, $2, $3, NOW())',
        [name, email, initialRole]
      );
      existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      // If provider role was set, create default service
      if (initialRole === 'provider') {
        const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [email]);
        const userName = userResult.rows[0]?.name || name;
        await pool.query(
          'INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [`${userName}'s Service`, userName, '1000', 'Active', 'General', 'Remote', '5.0', '/placeholder.svg']
        );
      }
    } else if (role && (role === 'influencer' || role === 'provider')) {
      // Update existing user's role if provided and they don't have one
      const currentUser = existing.rows[0];
      if (!currentUser.role || currentUser.role === 'user') {
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);
        existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // If provider role was set, create default service if it doesn't exist
        if (role === 'provider') {
          const serviceCheck = await pool.query('SELECT id FROM services WHERE provider = $1', [existing.rows[0].name]);
          if (serviceCheck.rows.length === 0) {
            await pool.query(
              'INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
              [`${existing.rows[0].name}'s Service`, existing.rows[0].name, '1000', 'Active', 'General', 'Remote', '5.0', '/placeholder.svg']
            );
          }
        }
      }
    }

    const user = existing.rows[0];
    const token = jwt.sign({ email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '2h' });
    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role, phone: user.phone || phone },
      needsRoleSelection: !user.role || user.role === 'user',
    });
  } catch (err) {
    console.error('Firebase auth error', err);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (result.rows.length === 0) {
      console.log(`⚠️  Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    
    // Check if user has a password (Firebase users might not have passwords)
    if (!user.password) {
      console.log(`⚠️  Login attempt for user without password: ${email}`);
      return res.status(401).json({ 
        error: 'This account was created with Google/Phone login. Please use that method to sign in.',
        useFirebase: true
      });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`⚠️  Invalid password attempt for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Issue JWT with current role from database
    const token = jwt.sign({ email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '2h' });
    console.log(`✓ Login successful: ${email} (role: ${user.role || 'user'})`);
    res.json({ 
      success: true, 
      token, 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role || 'user' 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Helper endpoint to create an admin user (for development - should be protected in production)
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, password' });
    }
    
    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name = $1, password = $2, role = $3 WHERE email = $4', 
        [name, hashedPassword, 'admin', email]);
      const updated = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.json({ 
        success: true, 
        message: `User ${email} updated to admin`,
        user: updated.rows[0]
      });
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role, createdat) VALUES ($1, $2, $3, $4, NOW())',
      [name, email, hashedPassword, 'admin']
    );
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    res.json({ 
      success: true, 
      message: `Admin user ${email} created successfully`,
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Helper endpoint to set a user as admin (for development - should be protected in production)
app.post('/api/admin/set-admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Use /api/admin/create-admin to create a new admin user.' });
    }
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
    const updated = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    res.json({ 
      success: true, 
      message: `User ${email} is now an admin`,
      user: updated.rows[0]
    });
  } catch (err) {
    console.error('Set admin error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});
app.post('/api/sample-data', async (req, res) => {
  const samples = [
    {
      name: 'Sample Photographer', provider: 'Jane Doe', price: '1000', status: 'Active', category: 'Photography', location: 'Mumbai', rating: '4.8', image: '/placeholder.svg'
    },
    {
      name: 'Sample Influencer', provider: 'John Smith', price: '2000', status: 'Active', category: 'Influencer', location: 'Delhi', rating: '4.9', image: '/placeholder.svg'
    },
    {
      name: 'Sample Fitness Coach', provider: 'Priya Singh', price: '1500', status: 'Active', category: 'Fitness', location: 'Remote', rating: '4.7', image: '/placeholder.svg'
    },
    {
      name: 'Sample Musician', provider: 'Arjun Mehra', price: '1200', status: 'Active', category: 'Music', location: 'Bangalore', rating: '4.6', image: '/placeholder.svg'
    }
  ];
  try {
    for (const s of samples) {
      await pool.query(
        'INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [s.name, s.provider, s.price, s.status, s.category, s.location, s.rating, s.image]
      );
    }
    res.json({ success: true, message: 'Sample data inserted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert sample data.' });
  }
});


// Portfolio image upload endpoint
app.post('/api/profile/portfolio', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  
  let decoded;
  try {
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', expired: true });
      } else if (jwtErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', invalid: true });
      }
      return res.status(401).json({ error: 'Token verification failed' });
    }
    
    // Now we have a valid decoded token, proceed with upload
    try {
    const { image } = req.body; // Base64 encoded image
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }
    
    // Get current portfolio images
    let result;
    try {
      result = await pool.query('SELECT portfolio_images FROM users WHERE email = $1', [decoded.email]);
    } catch (err) {
      if (err.message.includes('column "portfolio_images" does not exist')) {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_images TEXT');
        result = await pool.query('SELECT portfolio_images FROM users WHERE email = $1', [decoded.email]);
      } else {
        throw err;
      }
    }
    
    let portfolioImages = [];
    if (result.rows[0]?.portfolio_images) {
      try {
        portfolioImages = JSON.parse(result.rows[0].portfolio_images);
        // Ensure it's an array
        if (!Array.isArray(portfolioImages)) {
          portfolioImages = [];
        }
        // Filter out any invalid images (only keep valid base64 image strings)
        portfolioImages = portfolioImages.filter((img) => 
          img && 
          typeof img === 'string' && 
          img.startsWith('data:image/') &&
          img.length > 100 // Minimum reasonable size for a base64 image
        );
      } catch (e) {
        portfolioImages = [];
      }
    }
    
    // Add new image (limit to 20 images)
    if (portfolioImages.length >= 20) {
      return res.status(400).json({ error: 'Maximum 20 portfolio images allowed' });
    }
    
    portfolioImages.push(image);
    
    // Update portfolio images
    await pool.query('UPDATE users SET portfolio_images = $1 WHERE email = $2', [JSON.stringify(portfolioImages), decoded.email]);
    
      res.json({ success: true, portfolio_images: portfolioImages });
    } catch (err) {
      console.error('Portfolio upload error:', err);
      console.error('Error stack:', err.stack);
      
      // Handle database column errors
      if (err.message && err.message.includes('column')) {
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_images TEXT');
          // Retry the upload logic with decoded email (we know it's valid here)
          const retryResult = await pool.query('SELECT portfolio_images FROM users WHERE email = $1', [decoded.email]);
          let retryImages = [];
          if (retryResult.rows[0]?.portfolio_images) {
            try {
              retryImages = JSON.parse(retryResult.rows[0].portfolio_images);
              // Ensure it's an array
              if (!Array.isArray(retryImages)) {
                retryImages = [];
              }
              // Filter out any invalid images
              retryImages = retryImages.filter((img) => 
                img && 
                typeof img === 'string' && 
                img.startsWith('data:image/') &&
                img.length > 100
              );
            } catch (e) {
              retryImages = [];
            }
          }
          if (retryImages.length >= 20) {
            return res.status(400).json({ error: 'Maximum 20 portfolio images allowed' });
          }
          retryImages.push(req.body.image);
          await pool.query('UPDATE users SET portfolio_images = $1 WHERE email = $2', [JSON.stringify(retryImages), decoded.email]);
          return res.json({ success: true, portfolio_images: retryImages });
        } catch (retryErr) {
          console.error('Retry error:', retryErr);
          return res.status(500).json({ error: 'Database error', details: retryErr.message });
        }
      }
      
      // Generic server error
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  } catch (outerErr) {
    // This catch handles token verification errors that happen before the inner try
    console.error('Portfolio upload outer error:', outerErr);
    return res.status(401).json({ error: 'Authentication error', expired: true });
  }
});

// Delete portfolio image endpoint
app.delete('/api/profile/portfolio/:index', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const index = parseInt(req.params.index);
    
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid index' });
    }
    
    // Get current portfolio images
    let result;
    try {
      result = await pool.query('SELECT portfolio_images FROM users WHERE email = $1', [decoded.email]);
    } catch (err) {
      if (err.message.includes('column "portfolio_images" does not exist')) {
        return res.status(404).json({ error: 'No portfolio images found' });
      }
      throw err;
    }
    
    let portfolioImages = [];
    if (result.rows[0]?.portfolio_images) {
      try {
        portfolioImages = JSON.parse(result.rows[0].portfolio_images);
      } catch (e) {
        portfolioImages = [];
      }
    }
    
    if (index < 0 || index >= portfolioImages.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }
    
    // Remove image at index
    portfolioImages.splice(index, 1);
    
    // Update portfolio images
    await pool.query('UPDATE users SET portfolio_images = $1 WHERE email = $2', [JSON.stringify(portfolioImages), decoded.email]);
    
    res.json({ success: true, portfolio_images: portfolioImages });
  } catch (err) {
    console.error('Portfolio delete error:', err);
    res.status(401).json({ error: 'Invalid token or server error' });
  }
});

// Get all influencers (public endpoint for providers to find influencers)
app.get('/api/users/influencers', async (req, res) => {
  try {
    let result;
    try {
      result = await pool.query(`
        SELECT name, username, email, role, bio, interests, skills, location, experience, profile_photo, instagram_handle
        FROM users 
        WHERE role = 'influencer'
        ORDER BY createdat DESC
      `);
    } catch (err) {
      if (err.message.includes('column "username" does not exist') || err.message.includes('column "profile_photo" does not exist')) {
        result = await pool.query(`
          SELECT name, email, role, bio, interests, skills, location, experience
          FROM users 
          WHERE role = 'influencer'
          ORDER BY createdat DESC
        `);
      } else {
        throw err;
      }
    }
    
    const influencers = result.rows.map(row => {
      // Don't expose email for privacy
      delete row.email;
      return row;
    });
    
    res.json(influencers);
  } catch (err) {
    console.error('Error fetching influencers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile by name (for public viewing)
app.get('/api/user/:name', async (req, res) => {
  try {
    const name = req.params.name;
    let result;
    try {
      result = await pool.query('SELECT name, username, email, role, bio, interests, skills, location, experience, services, portfolio_images FROM users WHERE name = $1 OR username = $1', [name]);
    } catch (err) {
      if (err.message.includes('column "username" does not exist') || err.message.includes('column "portfolio_images" does not exist')) {
        try {
          result = await pool.query('SELECT name, email, role, bio, interests, skills, location, experience, services FROM users WHERE name = $1', [name]);
        } catch (err2) {
          result = await pool.query('SELECT name, username, email, role, bio, interests, skills, location, experience, services FROM users WHERE name = $1 OR username = $1', [name]);
        }
      } else {
        throw err;
      }
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    // Parse portfolio_images if it exists
    if (user.portfolio_images) {
      try {
        user.portfolio_images = JSON.parse(user.portfolio_images);
      } catch (e) {
        user.portfolio_images = [];
      }
    } else {
      user.portfolio_images = [];
    }
    // Don't return email for public profiles
    delete user.email;
    res.json(user);
  } catch (err) {
    console.error('User profile get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User profile endpoint (JWT auth)
app.get('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', expired: true });
      } else if (jwtErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', invalid: true });
      }
      return res.status(401).json({ error: 'Token verification failed' });
    }
    // Try to select with username, fallback if column doesn't exist
    let result;
    try {
      result = await pool.query('SELECT name, username, email, role, bio, interests, skills, location, experience, services, socials, portfolio_images, portfolio_description, instagram_handle, profile_photo, createdat FROM users WHERE email = $1', [decoded.email]);
    } catch (err) {
      if (err.message.includes('column "username" does not exist') || err.message.includes('column "portfolio_images" does not exist') || err.message.includes('column "profile_photo" does not exist')) {
        try {
          result = await pool.query('SELECT name, email, role, bio, interests, skills, location, experience, services, socials, createdat FROM users WHERE email = $1', [decoded.email]);
        } catch (err2) {
          // Try without new columns
          try {
            result = await pool.query('SELECT name, username, email, role, bio, interests, skills, location, experience, services, socials, portfolio_images, createdat FROM users WHERE email = $1', [decoded.email]);
          } catch (err3) {
            result = await pool.query('SELECT name, email, role, bio, interests, skills, location, experience, services, socials, createdat FROM users WHERE email = $1', [decoded.email]);
          }
        }
      } else {
        throw err;
      }
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    // Normalize createdAt field for frontend
    user.createdAt = user.createdat;
    delete user.createdat;
    // Parse portfolio_images if it exists
    if (user.portfolio_images) {
      try {
        user.portfolio_images = JSON.parse(user.portfolio_images);
      } catch (e) {
        user.portfolio_images = [];
      }
    } else {
      user.portfolio_images = [];
    }
    res.json(user);
  } catch (err) {
    console.error('Profile get error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});


// --- Dashboard Data Endpoints ---
// Admin middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  console.log(`🔐 Admin middleware check: ${req.method} ${req.path}`);
  const auth = req.headers.authorization;
  if (!auth) {
    console.log('⚠️  No authorization header');
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const token = auth.split(' ')[1];
    if (!token) {
      console.log('⚠️  No token in authorization header');
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Validate JWT format (should have 3 parts)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('✗ Invalid JWT format - token does not have 3 parts');
      console.error('Token preview:', token.substring(0, 50));
      return res.status(401).json({ error: 'Invalid token format - not a valid JWT' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✓ Token verified for: ${decoded.email}, role: ${decoded.role}`);
    
    const result = await pool.query('SELECT role FROM users WHERE email = $1', [decoded.email]);
    if (result.rows.length === 0) {
      console.log('⚠️  User not found:', decoded.email);
      return res.status(403).json({ error: 'User not found' });
    }
    
    const userRole = result.rows[0].role;
    if (userRole !== 'admin') {
      console.log(`⚠️  Non-admin access attempt: ${decoded.email} (role: ${userRole || 'null'})`);
      return res.status(403).json({ error: 'Admin access required', currentRole: userRole });
    }
    
    req.adminEmail = decoded.email;
    console.log(`✓ Admin access granted: ${decoded.email}`);
    next();
  } catch (err) {
    console.error('✗ Admin auth error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token', details: 'Token signature verification failed' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', details: 'Please log in again' });
    }
    res.status(401).json({ error: 'Invalid token', details: err.message });
  }
};

// Admin: Get new users (limited)
app.get('/api/admin/new-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, email, role, createdat FROM users ORDER BY createdat DESC LIMIT 10');
    res.json({ users: result.rows });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all users (requires admin auth)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    console.log('✓ Admin users endpoint hit');
    const result = await pool.query(`
      SELECT id, name, username, email, role, bio, interests, skills, location, experience, services, socials, createdat 
      FROM users 
      ORDER BY createdat DESC
    `);
    console.log(`✓ Returning ${result.rows.length} users`);
    res.json({ users: result.rows });
  } catch (err) {
    console.error('✗ Admin users fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin: Get user by email
app.get('/api/admin/users/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(`
      SELECT id, name, username, email, role, bio, interests, skills, location, experience, services, socials, createdat 
      FROM users 
      WHERE email = $1
    `, [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Admin user fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update user
app.put('/api/admin/users/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const { name, username, role, bio, interests, skills, location, experience, services, socials } = req.body;
    
    // Check if username is already taken by another user
    if (username) {
      const usernameCheck = await pool.query('SELECT email FROM users WHERE username = $1 AND email != $2', [username, email]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (username !== undefined) { updates.push(`username = $${paramCount++}`); values.push(username); }
    if (role !== undefined) { updates.push(`role = $${paramCount++}`); values.push(role); }
    if (bio !== undefined) { updates.push(`bio = $${paramCount++}`); values.push(bio); }
    if (interests !== undefined) { updates.push(`interests = $${paramCount++}`); values.push(Array.isArray(interests) ? JSON.stringify(interests) : interests); }
    if (skills !== undefined) { updates.push(`skills = $${paramCount++}`); values.push(Array.isArray(skills) ? JSON.stringify(skills) : skills); }
    if (location !== undefined) { updates.push(`location = $${paramCount++}`); values.push(location); }
    if (experience !== undefined) { updates.push(`experience = $${paramCount++}`); values.push(experience); }
    if (services !== undefined) { updates.push(`services = $${paramCount++}`); values.push(services); }
    if (socials !== undefined) { updates.push(`socials = $${paramCount++}`); values.push(JSON.stringify(socials)); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(email);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramCount}`;
    await pool.query(query, values);
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Admin user update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    // Prevent admin from deleting themselves
    if (email === req.adminEmail) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin user delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all services (requires admin auth)
app.get('/api/admin/services', requireAdmin, async (req, res) => {
  try {
    console.log('✓ Admin services endpoint hit');
    const result = await pool.query(`
      SELECT s.*, u.username, u.email as provider_email
      FROM services s 
      LEFT JOIN users u ON LOWER(TRIM(s.provider)) = LOWER(TRIM(u.name)) OR s.provider = u.email
      ORDER BY s.id DESC
    `);
    console.log(`✓ Returning ${result.rows.length} services`);
    res.json({ services: result.rows });
  } catch (err) {
    console.error('✗ Admin services fetch error:', err);
    // Fallback to simple query
    try {
      const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
      console.log(`✓ Fallback: Returning ${result.rows.length} services`);
      res.json({ services: result.rows });
    } catch (fallbackErr) {
      console.error('✗ Fallback query also failed:', fallbackErr);
      res.status(500).json({ error: 'Server error', details: fallbackErr.message });
    }
  }
});

// Admin: Update service
app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, price, status, category, location, rating, image } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (provider !== undefined) { updates.push(`provider = $${paramCount++}`); values.push(provider); }
    if (price !== undefined) { updates.push(`price = $${paramCount++}`); values.push(price); }
    if (status !== undefined) { updates.push(`status = $${paramCount++}`); values.push(status); }
    if (category !== undefined) { updates.push(`category = $${paramCount++}`); values.push(category); }
    if (location !== undefined) { updates.push(`location = $${paramCount++}`); values.push(location); }
    if (rating !== undefined) { updates.push(`rating = $${paramCount++}`); values.push(rating); }
    if (image !== undefined) { updates.push(`image = $${paramCount++}`); values.push(image); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramCount}`;
    await pool.query(query, values);
    
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    res.json({ success: true, service: result.rows[0] });
  } catch (err) {
    console.error('Admin service update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete service
app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin service delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Provider: Update own service
app.put('/api/services/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const { id } = req.params;
    const { name, provider, price, status, category, location, rating, image } = req.body;
    
    // Get service to verify ownership
    const serviceResult = await pool.query('SELECT provider FROM services WHERE id = $1', [id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Check if user owns this service
    const service = serviceResult.rows[0];
    const userResult = await pool.query('SELECT name, email FROM users WHERE email = $1', [decoded.email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    // Verify ownership
    if (service.provider !== user.name && service.provider !== user.email) {
      return res.status(403).json({ error: 'You can only update your own services' });
    }
    
    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (provider !== undefined) { updates.push(`provider = $${paramCount++}`); values.push(provider); }
    if (price !== undefined) { updates.push(`price = $${paramCount++}`); values.push(price); }
    if (status !== undefined) { updates.push(`status = $${paramCount++}`); values.push(status); }
    if (category !== undefined) { updates.push(`category = $${paramCount++}`); values.push(category); }
    if (location !== undefined) { updates.push(`location = $${paramCount++}`); values.push(location); }
    if (rating !== undefined) { updates.push(`rating = $${paramCount++}`); values.push(rating); }
    if (image !== undefined) { updates.push(`image = $${paramCount++}`); values.push(image); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramCount}`;
    await pool.query(query, values);
    
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    res.json({ success: true, service: result.rows[0] });
  } catch (err) {
    console.error('Service update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Provider: Delete own service
app.delete('/api/services/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const { id } = req.params;
    
    // Get service to verify ownership
    const serviceResult = await pool.query('SELECT provider FROM services WHERE id = $1', [id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Check if user owns this service (match by name or email)
    const service = serviceResult.rows[0];
    const userResult = await pool.query('SELECT name, email FROM users WHERE email = $1', [decoded.email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    // Verify ownership
    if (service.provider !== user.name && service.provider !== user.email) {
      return res.status(403).json({ error: 'You can only delete your own services' });
    }
    
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Service delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all bookings (requires admin auth)
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    console.log('✓ Admin bookings endpoint hit');
    const result = await pool.query('SELECT * FROM bookings ORDER BY date DESC, createdat DESC');
    console.log(`✓ Returning ${result.rows.length} bookings`);
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('✗ Admin bookings fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Initialize page_views table if it doesn't exist
const initPageViewsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        page_path VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        createdat TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Page views table initialized');
  } catch (err) {
    console.error('✗ Error initializing page_views table:', err);
  }
};

// Initialize on server start
initPageViewsTable();

// Track page view (public endpoint)
app.post('/api/track-view', async (req, res) => {
  try {
    const { pagePath, userEmail } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    
    // Ensure table exists before inserting
    await initPageViewsTable();
    
    const result = await pool.query(
      'INSERT INTO page_views (page_path, user_email, ip_address, user_agent) VALUES ($1, $2, $3, $4) RETURNING id',
      [pagePath || '/', userEmail || null, ipAddress, userAgent]
    );
    
    console.log(`📊 Page view tracked: ${pagePath} (ID: ${result.rows[0].id})`);
    res.json({ success: true, viewId: result.rows[0].id });
  } catch (err) {
    console.error('✗ Error tracking view:', err);
    // Don't fail the request if tracking fails
    res.json({ success: false, error: err.message });
  }
});

// Get total view count (public endpoint for homepage)
app.get('/api/views', async (req, res) => {
  try {
    // Ensure table exists
    await initPageViewsTable();
    
    const result = await pool.query('SELECT COUNT(*) FROM page_views');
    const viewCount = parseInt(result.rows[0].count, 10) || 0;
    res.json({ viewCount });
  } catch (err) {
    console.error('Error fetching views:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint to verify tracking works (admin only)
app.get('/api/admin/test-tracking', requireAdmin, async (req, res) => {
  try {
    await initPageViewsTable();
    
    // Insert a test view
    const testResult = await pool.query(
      'INSERT INTO page_views (page_path, user_email, ip_address, user_agent) VALUES ($1, $2, $3, $4) RETURNING id',
      ['/test', 'admin@test.com', '127.0.0.1', 'Test Agent']
    );
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM page_views');
    const totalViews = parseInt(countResult.rows[0].count, 10);
    
    res.json({ 
      success: true, 
      testViewId: testResult.rows[0].id,
      totalViews,
      message: 'Tracking test successful'
    });
  } catch (err) {
    console.error('Test tracking error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin: Get analytics
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  try {
    // Ensure table exists
    await initPageViewsTable();
    
    // Get real view count from database
    const viewsRes = await pool.query('SELECT COUNT(*) FROM page_views');
    const views = parseInt(viewsRes.rows[0].count, 10) || 0;
    
    // Get views in last 24 hours
    const views24hRes = await pool.query(
      "SELECT COUNT(*) FROM page_views WHERE createdat > NOW() - INTERVAL '24 hours'"
    );
    const views24h = parseInt(views24hRes.rows[0].count, 10) || 0;
    
    // Get views in last 7 days
    const views7dRes = await pool.query(
      "SELECT COUNT(*) FROM page_views WHERE createdat > NOW() - INTERVAL '7 days'"
    );
    const views7d = parseInt(views7dRes.rows[0].count, 10) || 0;
    
    const providersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'provider'");
    const influencersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'influencer'");
    const totalUsersRes = await pool.query("SELECT COUNT(*) FROM users");
    const totalServicesRes = await pool.query("SELECT COUNT(*) FROM services");
    const totalBookingsRes = await pool.query("SELECT COUNT(*) FROM bookings");
    const activeServicesRes = await pool.query("SELECT COUNT(*) FROM services WHERE status = 'Active'");
    
    res.json({
      viewCount: views,
      views24h: views24h,
      views7d: views7d,
      activeProviders: parseInt(providersRes.rows[0].count, 10),
      activeInfluencers: parseInt(influencersRes.rows[0].count, 10),
      totalUsers: parseInt(totalUsersRes.rows[0].count, 10),
      totalServices: parseInt(totalServicesRes.rows[0].count, 10),
      totalBookings: parseInt(totalBookingsRes.rows[0].count, 10),
      activeServices: parseInt(activeServicesRes.rows[0].count, 10),
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/campaigns', async (req, res) => {
  const { name, influencer, budget, status } = req.body;
  try {
    await pool.query('INSERT INTO campaigns (name, influencer, budget, status) VALUES ($1, $2, $3, $4)', [name, influencer, budget, status]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
        if (!token) {
          return res.json([]);
        }
        
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
          if (jwtErr.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', expired: true });
          } else if (jwtErr.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token', invalid: true });
          }
          return res.json([]);
        }
        
        // Get bookings for the authenticated user (as client or provider)
        // Handle case where bookings table might not exist or have different column names
        try {
          const result = await pool.query(
            'SELECT * FROM bookings WHERE client = $1 OR provider = $1 ORDER BY date DESC, createdat DESC',
            [decoded.email]
          );
          return res.json(result.rows || []);
        } catch (queryErr) {
          // If bookings table doesn't exist, return empty array
          if (queryErr.message && queryErr.message.includes('does not exist')) {
            console.log('Bookings table does not exist yet');
            return res.json([]);
          }
          console.error('Bookings query error:', queryErr);
          return res.status(500).json({ error: 'Database error', details: queryErr.message });
        }
      } catch (err) {
        console.error('Bookings auth error:', err);
        return res.json([]);
      }
    }
    // Fallback: return empty array if no auth
    return res.json([]);
  } catch (err) {
    console.error('Bookings fetch error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});
app.post('/api/bookings', async (req, res) => {
  const { client, provider, service, date, status, payment_id, order_id, amount } = req.body;
  try {
    // Check if bookings table has payment columns, if not, add them
    let result;
    try {
      result = await pool.query(
        'INSERT INTO bookings (client, provider, service, date, status, payment_id, order_id, amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [client, provider, service, date, status, payment_id || null, order_id || null, amount || null]
      );
    } catch (err) {
      // If payment columns don't exist, try without them
      if (err.message && err.message.includes('column') && (err.message.includes('payment_id') || err.message.includes('order_id') || err.message.includes('amount'))) {
        try {
          // Try to add the columns
          await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT');
          await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_id TEXT');
          await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount DECIMAL');
          // Retry insert
          result = await pool.query(
            'INSERT INTO bookings (client, provider, service, date, status, payment_id, order_id, amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [client, provider, service, date, status, payment_id || null, order_id || null, amount || null]
          );
        } catch (retryErr) {
          // If still fails, insert without payment fields
          result = await pool.query('INSERT INTO bookings (client, provider, service, date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [client, provider, service, date, status]);
        }
      } else {
        throw err;
      }
    }
    const booking = result.rows[0];

    // Send confirmation email (uses Ethereal test account if SMTP not configured)
    try {
      let transporter;
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Create Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const clientEmail = client && client.includes('@') ? client : process.env.DEFAULT_ADMIN_EMAIL || null;
      if (clientEmail) {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'OneFame <no-reply@onefame.local>',
          to: clientEmail,
          subject: `Booking Confirmation — ${service}`,
          text: `Hi ${clientEmail},\n\nYour booking for ${service} with ${provider} on ${date} is confirmed (status: ${status}).\n\nBooking ID: ${booking.id}\n\nThanks,\nOneFame team`,
          html: `<p>Hi ${clientEmail},</p><p>Your booking for <strong>${service}</strong> with <strong>${provider}</strong> on <strong>${date}</strong> is confirmed (status: ${status}).</p><p><strong>Booking ID:</strong> ${booking.id}</p><p>Thanks,<br/>OneFame team</p>`,
        });

        // If using Ethereal, include preview URL in response for dev
        const preview = nodemailer.getTestMessageUrl(info) || null;
        return res.json({ success: true, booking, emailPreview: preview });
      }

    } catch (err) {
      console.error('Email send error:', err);
      // continue without failing booking
    }

    res.json({ success: true, booking });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    // Join with users table to get username
    const result = await pool.query(`
      SELECT s.*, u.username 
      FROM services s 
      LEFT JOIN users u ON LOWER(TRIM(s.provider)) = LOWER(TRIM(u.name)) OR s.provider = u.email
      ORDER BY s.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Services fetch error:', err);
    // Fallback to simple query if join fails
    try {
      const result = await pool.query('SELECT * FROM services');
      res.json(result.rows);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
});
app.post('/api/services', async (req, res) => {
  const { name, provider, price, status, category, location, rating, image } = req.body;
  try {
    await pool.query('INSERT INTO services (name, provider, price, status, category, location, rating, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [name, provider, price, status, category, location, rating, image]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single service by id
app.get('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Chat endpoints - using database
// Initialize chat tables if they don't exist
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user1_email VARCHAR(255) NOT NULL,
        user1_name VARCHAR(255),
        user2_email VARCHAR(255) NOT NULL,
        user2_name VARCHAR(255),
        createdat TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        sender_email VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255),
        content TEXT NOT NULL,
        createdat TIMESTAMP DEFAULT NOW(),
        read BOOLEAN DEFAULT false
      )
    `);
    console.log('Chat tables initialized');
  } catch (err) {
    console.error('Error initializing chat tables:', err);
  }
})();

app.get('/api/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Get all chats where user is participant
    const result = await pool.query(`
      SELECT DISTINCT 
        c.id,
        c.createdat,
        CASE 
          WHEN c.user1_email = $1 THEN c.user2_name
          ELSE c.user1_name
        END as name,
        CASE 
          WHEN c.user1_email = $1 THEN c.user2_email
          ELSE c.user1_email
        END as other_email,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY createdat DESC LIMIT 1) as last_message,
        (SELECT createdat FROM messages WHERE chat_id = c.id ORDER BY createdat DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND read = false AND sender_email != $1) as unread
      FROM chats c
      WHERE c.user1_email = $1 OR c.user2_email = $1
      ORDER BY last_message_time DESC NULLS LAST, c.createdat DESC
    `, [userEmail]);

    const chats = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name || 'Unknown',
      lastMessage: row.last_message || 'No messages yet',
      time: row.last_message_time ? getTimeAgo(row.last_message_time) : 'Just now',
      unread: parseInt(row.unread) || 0,
      otherEmail: row.other_email
    }));

    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.get('/api/chats/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Verify user is part of this chat
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_email = $2 OR user2_email = $2)', [id, userEmail]);
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, sender_email, sender_name, content, createdat FROM messages WHERE chat_id = $1 ORDER BY createdat ASC',
      [id]
    );

    const messages = result.rows.map(row => ({
      id: row.id.toString(),
      sender: row.sender_name || row.sender_email,
      content: row.content,
      timestamp: row.createdat,
      isMe: row.sender_email === userEmail
    }));

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;
    const { providerEmail, providerName } = req.body;

    if (!providerEmail) return res.status(400).json({ error: 'Provider email required' });

    // Try to find provider in users table by email or name
    let actualProviderEmail = providerEmail;
    let actualProviderName = providerName;
    
    // If email looks like a generated one, try to find by name
    if (providerEmail.includes('@onefame.local')) {
      const providerNameSearch = providerName || providerEmail.split('@')[0].replace(/\./g, ' ');
      const userResult = await pool.query(
        'SELECT email, name FROM users WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $2',
        [`%${providerNameSearch.toLowerCase()}%`, `%${providerNameSearch.toLowerCase()}%`]
      );
      if (userResult.rows.length > 0) {
        actualProviderEmail = userResult.rows[0].email;
        actualProviderName = userResult.rows[0].name || providerName;
      }
    } else {
      // Try to get name from users table
      const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [providerEmail]);
      if (userResult.rows.length > 0) {
        actualProviderName = userResult.rows[0].name || providerName;
      }
    }

    // Check if chat already exists
    const existing = await pool.query(
      'SELECT * FROM chats WHERE (user1_email = $1 AND user2_email = $2) OR (user1_email = $2 AND user2_email = $1)',
      [userEmail, actualProviderEmail]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, chatId: existing.rows[0].id.toString() });
    }

    // Get current user name
    const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [userEmail]);
    const userName = userResult.rows[0]?.name || userEmail;

    // Create new chat
    const result = await pool.query(
      'INSERT INTO chats (user1_email, user1_name, user2_email, user2_name, createdat) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [userEmail, userName, actualProviderEmail, actualProviderName || actualProviderEmail]
    );

    res.json({ success: true, chatId: result.rows[0].id.toString() });
  } catch (err) {
    console.error('Error creating chat:', err);
    // Ensure we always return JSON, not HTML
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: err.message || 'Failed to create chat' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { chatId, content } = req.body;
    if (!chatId || !content) return res.status(400).json({ error: 'Missing chatId or content' });
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Verify user is part of this chat
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_email = $2 OR user2_email = $2)', [chatId, userEmail]);
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user name
    const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [userEmail]);
    const userName = userResult.rows[0]?.name || userEmail;

    // Insert message
    const result = await pool.query(
      'INSERT INTO messages (chat_id, sender_email, sender_name, content, createdat, read) VALUES ($1, $2, $3, $4, NOW(), false) RETURNING id, createdat',
      [chatId, userEmail, userName, content]
    );

    const msg = {
      id: result.rows[0].id.toString(),
      sender: userName,
      content,
      timestamp: result.rows[0].createdat,
      isMe: true
    };

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Verify user is part of this chat
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_email = $2 OR user2_email = $2)', [id, userEmail]);
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete all messages first (cascade should handle this, but being explicit)
    await pool.query('DELETE FROM messages WHERE chat_id = $1', [id]);
    
    // Delete the chat
    await pool.query('DELETE FROM chats WHERE id = $1', [id]);

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Cleanup endpoint to remove sample/test chats
app.delete('/api/chats/cleanup/sample', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const testNames = [
      'Jane Doe', 'John Smith', 'John Doe', 'Jane Smith',
      'Test User', 'Sample User', 'Demo User',
      'Sample Photographer', 'Sample Influencer', 'Sample Fitness Coach', 'Sample Musician'
    ];
    
    let totalDeleted = 0;
    
    // Delete chats with no messages
    const emptyResult = await pool.query(`
      DELETE FROM chats 
      WHERE id IN (
        SELECT c.id 
        FROM chats c
        LEFT JOIN messages m ON m.chat_id = c.id
        WHERE m.id IS NULL
      )
      RETURNING id
    `);
    totalDeleted += emptyResult.rows.length;
    
    // Delete chats with test/sample names
    const testNamesCondition = testNames.map(name => `'${name.replace(/'/g, "''")}'`).join(', ');
    const namesResult = await pool.query(`
      DELETE FROM chats 
      WHERE user1_name IN (${testNamesCondition})
         OR user2_name IN (${testNamesCondition})
      RETURNING id
    `);
    totalDeleted += namesResult.rows.length;
    
    // Delete chats with test/sample email patterns
    const emailsResult = await pool.query(`
      DELETE FROM chats 
      WHERE user1_email LIKE '%test%' 
         OR user1_email LIKE '%sample%'
         OR user2_email LIKE '%test%'
         OR user2_email LIKE '%sample%'
         OR user1_email LIKE '%example%'
         OR user2_email LIKE '%example%'
      RETURNING id
    `);
    totalDeleted += emailsResult.rows.length;
    
    res.json({ 
      success: true, 
      message: `Deleted ${totalDeleted} sample chats`,
      deletedCount: totalDeleted 
    });
  } catch (err) {
    console.error('Error cleaning up sample chats:', err);
    res.status(500).json({ error: 'Failed to cleanup sample chats' });
  }
});

function getTimeAgo(date) {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return msgDate.toLocaleDateString();
}

// Reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/reviews', async (req, res) => {
  const { reviewer, reviewee, rating, comment } = req.body;
  try {
    await pool.query('INSERT INTO reviews (reviewer, reviewee, rating, comment) VALUES ($1, $2, $3, $4)', [reviewer, reviewee, rating, comment]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Get notifications for the authenticated user
        const result = await pool.query(
          'SELECT * FROM notifications WHERE user_email = $1 OR user_email IS NULL ORDER BY createdat DESC LIMIT 50',
          [decoded.email]
        );
        return res.json(result.rows);
      } catch (err) {
        // If token is invalid, continue to return all notifications (for backward compatibility)
      }
    }
    // Fallback: return all notifications if no auth or invalid token
    const result = await pool.query('SELECT * FROM notifications ORDER BY createdat DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/notifications', async (req, res) => {
  const { user, message, read } = req.body;
  try {
    await pool.query('INSERT INTO notifications (user, message, read) VALUES ($1, $2, $3)', [user, message, read]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Razorpay Payment Endpoints
// Create Razorpay order
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    
    console.log('Payment order request:', { amount, currency, receipt });
    
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount received:', amount);
      return res.status(400).json({ error: 'Invalid amount. Amount must be a positive number.' });
    }

    // Ensure minimum amount (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    if (amountInPaise < 100) {
      console.error('Amount too small:', amountInPaise);
      return res.status(400).json({ error: 'Minimum amount is ₹1.00' });
    }

    // Clean and validate receipt (max 40 characters, alphanumeric and hyphens only)
    let cleanReceipt = receipt || `receipt_${Date.now()}`;
    // Remove special characters and limit length
    cleanReceipt = cleanReceipt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    if (!cleanReceipt) {
      cleanReceipt = `receipt_${Date.now()}`;
    }

    // Clean notes - ensure they're serializable and not too large
    let cleanNotes = {};
    if (notes && typeof notes === 'object') {
      // Convert to plain object and limit size
      cleanNotes = Object.fromEntries(
        Object.entries(notes)
          .slice(0, 10) // Max 10 note fields
          .map(([key, value]) => [key, String(value).substring(0, 100)]) // Max 100 chars per value
      );
    }

    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: cleanReceipt,
      notes: cleanNotes,
    };

    console.log('Creating Razorpay order with options:', { 
      amount: options.amount, 
      currency: options.currency, 
      receipt: options.receipt 
    });

    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created successfully:', order.id);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    
    // Extract detailed error information
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error.error) {
      // Razorpay SDK error structure
      errorMessage = error.error.description || error.error.reason || error.message || errorMessage;
      statusCode = error.statusCode || error.error.statusCode || 500;
    } else if (error.message) {
      errorMessage = error.message;
      statusCode = error.statusCode || 500;
    }
    
    console.error('Error details:', {
      message: errorMessage,
      statusCode: statusCode,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    
    res.status(statusCode >= 400 && statusCode < 500 ? statusCode : 500).json({ 
      error: 'Failed to create order', 
      details: errorMessage,
      statusCode: statusCode
    });
  }
});

// Verify Razorpay payment
app.post('/api/payments/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Create signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Payment verified successfully
    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

// 404 handler for undefined routes (MUST be last)
app.use((req, res) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// Only start server if not in Vercel/serverless environment
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✓ Backend running on http://localhost:${PORT}`);
    console.log('✓ Available endpoints:');
    console.log('  - GET  /api/admin/users (requires admin)');
    console.log('  - GET  /api/admin/services (requires admin)');
    console.log('  - GET  /api/admin/bookings (requires admin)');
    console.log('  - GET  /api/admin/analytics (requires admin)');
    console.log('  - POST /api/track-view');
    console.log('  - GET  /api/views');
    console.log('  - POST /api/payments/create-order');
    console.log('  - POST /api/payments/verify-payment');
  });
}

// Export app for Vercel serverless functions
export default app;
