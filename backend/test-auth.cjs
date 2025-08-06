require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test database connection
    const dbTest = await pool.query('SELECT 1');
    console.log('✅ Database connected');
    
    // Test user lookup
    const email = 'versacecodes@gmail.com';
    const password = 'guestpass123';
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    console.log('✅ User query executed, found:', result.rows.length, 'users');
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    console.log('✅ Stored password:', user.password_hash);
    console.log('✅ Provided password:', password);
    console.log('✅ Password match:', password === user.password_hash);

    if (password === user.password_hash) {
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '7d' }
      );
      console.log('✅ JWT token generated:', token.substring(0, 20) + '...');
      
      console.log('✅ Authentication successful!');
      console.log('User data:', {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } else {
      console.log('❌ Password mismatch');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAuth();