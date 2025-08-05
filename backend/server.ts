import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';
import pkg from 'pg';
import { userSchema, createUserInputSchema, updateUserInputSchema, searchUserInputSchema, workspaceSchema, createWorkspaceInputSchema, updateWorkspaceInputSchema, searchWorkspaceInputSchema, workspaceMemberSchema, createWorkspaceMemberInputSchema, updateWorkspaceMemberInputSchema, searchWorkspaceMemberInputSchema, channelSchema, createChannelInputSchema, updateChannelInputSchema, searchChannelInputSchema, messageSchema, createMessageInputSchema, updateMessageInputSchema, searchMessageInputSchema, fileSchema, createFileInputSchema, updateFileInputSchema, searchFileInputSchema, kanbanBoardSchema, createKanbanBoardInputSchema, updateKanbanBoardInputSchema, searchKanbanBoardInputSchema, taskSchema, createTaskInputSchema, updateTaskInputSchema, searchTaskInputSchema, documentSchema, createDocumentInputSchema, updateDocumentInputSchema, searchDocumentInputSchema, calendarEventSchema, createCalendarEventInputSchema, updateCalendarEventInputSchema, searchCalendarEventInputSchema, notificationSchema, createNotificationInputSchema, updateNotificationInputSchema, searchNotificationInputSchema } from './schema.ts';

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware for protected routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [decoded.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Routes

// Register endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    const parsedInput = createUserInputSchema.parse(req.body);

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user_id = generateUniqueId();

    // Create user (NO HASHING - store password directly for development)
    const result = await pool.query(
      'INSERT INTO users (user_id, email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, name, created_at, role',
      [user_id, email.toLowerCase().trim(), password, name.trim(), role, new Date().toISOString()]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const is_valid_password = password === user.password_hash;
    if (!is_valid_password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search users endpoint
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 10, offset = 0, sort_by = 'created_at', sort_order = 'desc' } = req.query;

    const validatedInput = searchUserInputSchema.parse({ query, limit, offset, sort_by, sort_order });

    const usersResult = await pool.query(
      `SELECT * FROM users WHERE name ILIKE '%' || $1 || '%' ORDER BY ${validatedInput.sort_by} ${validatedInput.sort_order} LIMIT $2 OFFSET $3`,
      [validatedInput.query || '', validatedInput.limit, validatedInput.offset]
    );

    res.json(usersResult.rows);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// WebSocket connections and event handling

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User status updates handling
  socket.on('userStatusUpdate', (data) => {
    const { user_id, status } = data;
    io.emit(`user/${user_id}/status`, { user_id, status });
  });

  // Workspace activities updates handling
  socket.on('workspaceActivityUpdate', (data) => {
    const { workspace_id, activity_type, content } = data;
    io.emit(`workspace/${workspace_id}/activities`, { workspace_id, activity_type, content });
  });

  // Channel message creation handling
  socket.on('channelMessageCreated', (data) => {
    const { channel_id, user_id, content, sent_at, is_read } = data;

    // Insert new message into the database (mocking here)
    const newMessageId = generateUniqueId();
    const messageData = { message_id: newMessageId, channel_id, user_id, content, sent_at, is_read };
    
    // Broadcasting the new message to all connected clients
    io.emit(`channel/${channel_id}/messages`, messageData);
  });

  // Typing indicator handling
  socket.on('channelTypingIndicator', (data) => {
    const { channel_id, user_id, typing } = data;
    io.emit(`channel/${channel_id}/typing`, { channel_id, user_id, typing });
  });

  // Document edit updates handling
  socket.on('documentEditUpdate', (data) => {
    const { document_id, user_id, content, last_edited_at } = data;
    io.emit(`document/${document_id}/edit`, { document_id, user_id, content, last_edited_at });
  });

  // Task status updates handling
  socket.on('taskStatusUpdate', (data) => {
    const { task_id, status, priority, assigned_user_id, due_date } = data;
    io.emit(`task/${task_id}/status`, { task_id, status, priority, assigned_user_id, due_date });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Utility function for generating unique IDs
function generateUniqueId() {
  return 'xxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Server running with authentication and WebSockets" });
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});