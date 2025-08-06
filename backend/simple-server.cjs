require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    if (client) release();
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        message: 'Missing required fields: email and password are required' 
      });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    console.log('👤 User query result:', result.rows.length, 'users found');
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.email, 'stored password:', user.password_hash);

    // Check password
    const is_valid_password = password === user.password_hash;
    console.log('🔑 Password check:', is_valid_password);
    
    if (!is_valid_password) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', user.email);
    
    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        role: user.role
      },
      auth_token: token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Login failed. Please try again later.' 
    });
  }
});

// Registration endpoint
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Missing required fields: email, password, and name are required' 
      });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user_id = 'user_' + Date.now();

    // Create user
    const result = await pool.query(
      'INSERT INTO users (user_id, email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, name, created_at, role',
      [user_id, email.toLowerCase().trim(), password, name.trim(), role, new Date().toISOString()]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ Registration successful for:', user.email);

    res.status(201).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        role: user.role
      },
      auth_token: token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed. Please try again later.' 
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({ 
      status: "unhealthy", 
      timestamp: new Date().toISOString(),
      database: "disconnected"
    });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${port}`);
});