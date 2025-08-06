import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false }
      }
);

async function checkUsers() {
  try {
    const result = await pool.query('SELECT email, password_hash FROM users WHERE email = $1', ['versacecodes@gmail.com']);
    console.log('User found:', result.rows);
    
    const allUsers = await pool.query('SELECT email, password_hash FROM users');
    console.log('All users:', allUsers.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkUsers();