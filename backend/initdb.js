import dotenv from "dotenv";
import fs from "fs";
import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: PGHOST || "ep-ancient-dream-abbsot9k-pooler.eu-west-2.aws.neon.tech",
        database: PGDATABASE || "neondb",
        user: PGUSER || "neondb_owner",
        password: PGPASSWORD || "npg_jAS3aITLC5DX",
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function initDb() {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Read and split SQL commands
    const sqlContent = fs.readFileSync(`./db.sql`, "utf-8").toString();
    const dbInitCommands = sqlContent.split(/(?=CREATE TABLE |INSERT INTO)/).filter(cmd => cmd.trim());

    // Execute each command
    for (let cmd of dbInitCommands) {
      if (cmd.trim() && !cmd.trim().startsWith('--')) {
        console.log(`Executing SQL command: ${cmd.trim().substring(0, 50)}...`);
        
        // Special handling for user inserts to hash passwords
        if (cmd.includes('INSERT INTO users') && cmd.includes('password_hash')) {
          // Hash the passwords before inserting
          const hashedCmd = await hashPasswordsInUserInsert(cmd);
          await client.query(hashedCmd);
        } else {
          await client.query(cmd);
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database initialization completed successfully');
  } catch (e) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', e);
    throw e;
  } finally {
    // Release client back to pool
    client.release();
  }
}

async function hashPasswordsInUserInsert(cmd) {
  // Extract the VALUES part and hash the passwords
  const users = [
    { id: 'user1', email: 'john.doe@example.com', name: 'John Doe', created_at: '2023-10-01T10:00:00Z', password: 'password123', role: 'admin' },
    { id: 'user2', email: 'jane.smith@example.com', name: 'Jane Smith', created_at: '2023-10-02T11:00:00Z', password: 'admin123', role: 'editor' },
    { id: 'user3', email: 'versacecodes@gmail.com', name: 'Guest User', created_at: '2023-10-03T10:00:00Z', password: 'Airplanes@99', role: 'guest' },
    { id: 'user4', email: 'sarah.thompson@email.com', name: 'Sarah Thompson', created_at: '2023-10-04T10:00:00Z', password: 'guestpass123', role: 'host' },
    { id: 'user5', email: 'mike.rodriguez@beachhost.com', name: 'Mike Rodriguez', created_at: '2023-10-05T10:00:00Z', password: 'hostpass456', role: 'superhost' }
  ];

  const hashedUsers = await Promise.all(users.map(async (user) => {
    const hashedPassword = await hashPassword(user.password);
    return `('${user.id}', '${user.email}', '${user.name}', '${user.created_at}', '${hashedPassword}', '${user.role}')`;
  }));

  return `INSERT INTO users (user_id, email, name, created_at, password_hash, role) VALUES
${hashedUsers.join(',\n')}
ON CONFLICT (user_id) DO NOTHING;`;
}

// Execute initialization
initDb().catch(console.error);
