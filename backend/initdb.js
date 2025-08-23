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
    
    // Execute SQL commands directly
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id VARCHAR PRIMARY KEY,
          email VARCHAR UNIQUE NOT NULL,
          name VARCHAR NOT NULL,
          created_at VARCHAR NOT NULL,
          password_hash VARCHAR NOT NULL,
          role VARCHAR NOT NULL
      )
    `);
    
    // Insert users with hashed passwords
    const hashedCmd = await hashPasswordsInUserInsert('');
    await client.query(hashedCmd);
    
    // Create workspaces table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
          workspace_id VARCHAR PRIMARY KEY,
          owner_user_id VARCHAR NOT NULL REFERENCES users(user_id),
          name VARCHAR NOT NULL,
          settings JSON
      )
    `);
    
    // Insert workspaces
    await client.query(`
      INSERT INTO workspaces (workspace_id, owner_user_id, name, settings) VALUES
      ('workspace1', 'user1', 'Acme Workspace', '{"theme": "dark"}')
      ON CONFLICT (workspace_id) DO NOTHING
    `);
    
    // Create workspace_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspace_members (
          workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
          user_id VARCHAR NOT NULL REFERENCES users(user_id),
          role VARCHAR NOT NULL,
          PRIMARY KEY (workspace_id, user_id)
      )
    `);
    
    // Insert workspace members
    await client.query(`
      INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
      ('workspace1', 'user1', 'owner'),
      ('workspace1', 'user2', 'member')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `);
    
    // Create channels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS channels (
          channel_id VARCHAR PRIMARY KEY,
          workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
          name VARCHAR NOT NULL,
          is_private BOOLEAN NOT NULL
      )
    `);
    
    // Insert channels
    await client.query(`
      INSERT INTO channels (channel_id, workspace_id, name, is_private) VALUES
      ('channel1', 'workspace1', 'General', false),
      ('channel2', 'workspace1', 'Private Chat', true)
      ON CONFLICT (channel_id) DO NOTHING
    `);
    
    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
          message_id VARCHAR PRIMARY KEY,
          channel_id VARCHAR NOT NULL REFERENCES channels(channel_id),
          user_id VARCHAR NOT NULL REFERENCES users(user_id),
          content VARCHAR NOT NULL,
          sent_at VARCHAR NOT NULL,
          is_read BOOLEAN NOT NULL
      )
    `);
    
    // Insert messages
    await client.query(`
      INSERT INTO messages (message_id, channel_id, user_id, content, sent_at, is_read) VALUES
      ('message1', 'channel1', 'user1', 'Hello everyone!', '2023-10-03T12:00:00Z', true),
      ('message2', 'channel1', 'user2', 'Hi John!', '2023-10-03T12:01:00Z', false)
      ON CONFLICT (message_id) DO NOTHING
    `);
    
    // Create files table
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
          file_id VARCHAR PRIMARY KEY,
          channel_id VARCHAR REFERENCES channels(channel_id),
          uploader_user_id VARCHAR NOT NULL REFERENCES users(user_id),
          file_url VARCHAR NOT NULL,
          uploaded_at VARCHAR NOT NULL
      )
    `);
    
    // Insert files
    await client.query(`
      INSERT INTO files (file_id, channel_id, uploader_user_id, file_url, uploaded_at) VALUES
      ('file1', 'channel1', 'user1', 'https://picsum.photos/200/300?random=1', '2023-10-04T14:00:00Z')
      ON CONFLICT (file_id) DO NOTHING
    `);
    
    // Create kanban_boards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kanban_boards (
          board_id VARCHAR PRIMARY KEY,
          workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
          name VARCHAR NOT NULL
      )
    `);
    
    // Insert kanban boards
    await client.query(`
      INSERT INTO kanban_boards (board_id, workspace_id, name) VALUES
      ('board1', 'workspace1', 'Development Board')
      ON CONFLICT (board_id) DO NOTHING
    `);
    
    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
          task_id VARCHAR PRIMARY KEY,
          board_id VARCHAR NOT NULL REFERENCES kanban_boards(board_id),
          assigned_user_id VARCHAR REFERENCES users(user_id),
          title VARCHAR NOT NULL,
          description VARCHAR,
          status VARCHAR NOT NULL,
          priority VARCHAR NOT NULL,
          due_date VARCHAR
      )
    `);
    
    // Insert tasks
    await client.query(`
      INSERT INTO tasks (task_id, board_id, assigned_user_id, title, description, status, priority, due_date) VALUES
      ('task1', 'board1', 'user2', 'Design Homepage', 'Create a responsive homepage', 'To Do', 'High', '2023-11-01')
      ON CONFLICT (task_id) DO NOTHING
    `);
    
    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
          document_id VARCHAR PRIMARY KEY,
          workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
          title VARCHAR NOT NULL,
          content VARCHAR NOT NULL,
          last_edited_at VARCHAR NOT NULL,
          version VARCHAR NOT NULL
      )
    `);
    
    // Insert documents
    await client.query(`
      INSERT INTO documents (document_id, workspace_id, title, content, last_edited_at, version) VALUES
      ('doc1', 'workspace1', 'Q3 Report', 'This is the Q3 financial report...', '2023-10-03T12:00:00Z', '1.0')
      ON CONFLICT (document_id) DO NOTHING
    `);
    
    // Create calendar_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
          event_id VARCHAR PRIMARY KEY,
          workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
          title VARCHAR NOT NULL,
          start_time VARCHAR NOT NULL,
          end_time VARCHAR NOT NULL,
          description VARCHAR
      )
    `);
    
    // Insert calendar events
    await client.query(`
      INSERT INTO calendar_events (event_id, workspace_id, title, start_time, end_time, description) VALUES
      ('event1', 'workspace1', 'Sprint Planning', '2023-10-08T09:00:00Z', '2023-10-08T11:00:00Z', 'Sprint Planning meeting')
      ON CONFLICT (event_id) DO NOTHING
    `);
    
    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          notification_id VARCHAR PRIMARY KEY,
          user_id VARCHAR NOT NULL REFERENCES users(user_id),
          content VARCHAR NOT NULL,
          created_at VARCHAR NOT NULL,
          is_read BOOLEAN NOT NULL
      )
    `);
    
    // Insert notifications
    await client.query(`
      INSERT INTO notifications (notification_id, user_id, content, created_at, is_read) VALUES
      ('notif1', 'user1', 'You have a new message in General', '2023-10-04T12:00:00Z', false)
      ON CONFLICT (notification_id) DO NOTHING
    `);

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
