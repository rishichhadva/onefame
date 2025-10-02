


import pool from './db.js';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'onefame_secret_key';

const app = express();
app.use(cors());
app.use(express.json());

// Update user profile endpoint (now correctly placed)
app.put('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const { name, email, bio, interests, skills, location, experience, services, socials } = req.body;
    await pool.query(
      'UPDATE users SET name = $1, email = $2, bio = $3, interests = $4, skills = $5, location = $6, experience = $7, services = $8, socials = $9 WHERE email = $10',
      [name, email, bio, interests, skills, location, experience, services, socials, decoded.email]
    );
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(401).json({ error: 'Invalid token or server error' });
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

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Issue JWT
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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


// User profile endpoint (JWT auth)
app.get('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
  const result = await pool.query('SELECT name, email, role, bio, interests, skills, location, experience, services, socials, createdat FROM users WHERE email = $1', [decoded.email]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
  const user = result.rows[0];
  // Normalize createdAt field for frontend
  user.createdAt = user.createdat;
  delete user.createdat;
  res.json(user);
  } catch (err) {
    console.error('Profile get error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});


// --- Dashboard Data Endpoints ---
// Admin: Get new users
app.get('/api/admin/new-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, email, role, createdat FROM users ORDER BY createdat DESC LIMIT 10');
    res.json({ users: result.rows });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // Example analytics: website views, active providers/influencers
    // Replace with real analytics logic as needed
    const views = Math.floor(Math.random() * 10000) + 1000;
    const providersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'provider'");
    const influencersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'influencer'");
    res.json({
      viewCount: views,
      activeProviders: parseInt(providersRes.rows[0].count, 10),
      activeInfluencers: parseInt(influencersRes.rows[0].count, 10)
    });
  } catch {
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
    const result = await pool.query('SELECT * FROM bookings');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/bookings', async (req, res) => {
  const { client, provider, service, date, status } = req.body;
  try {
    await pool.query('INSERT INTO bookings (client, provider, service, date, status) VALUES ($1, $2, $3, $4, $5)', [client, provider, service, date, status]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
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
    const result = await pool.query('SELECT * FROM notifications');
    res.json(result.rows);
  } catch {
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

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
