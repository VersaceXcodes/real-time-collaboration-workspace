import express from 'express';
import cors from "cors";
import * as dotenv from "dotenv";
import * as path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Server as WebSocketServer } from 'socket.io';
import * as http from 'http';
import { Pool } from 'pg';
import { createUserInputSchema, searchUserInputSchema, createTaskInputSchema } from './schema.js';
dotenv.config();
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;
const pool = new Pool(DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});
// Test database connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    }
    else {
        console.log('Database connected successfully');
        if (client)
            release();
    }
});
// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return callback(null, true);
            const allowedOrigins = [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'https://123real-time-collaboration-workspace.launchpulse.ai',
                'http://localhost:5173',
                'http://localhost:3000'
            ];
            // Check if origin matches allowed patterns
            if (allowedOrigins.includes(origin) || /\.launchpulse\.ai$/.test(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST']
    }
});
// Middlewares
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'https://123real-time-collaboration-workspace.launchpulse.ai',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        // Check if origin matches allowed patterns
        if (allowedOrigins.includes(origin) || /\.launchpulse\.ai$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// JSON parsing with error handling
app.use(express.json({
    limit: "5mb"
}));
// Handle JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON format' });
    }
    next(err);
});
// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
// Add request timeout middleware
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        if (!res.headersSent) {
            res.status(408).json({ message: 'Request timeout' });
        }
    });
    next();
});
// Middleware to ensure all responses are JSON
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        // Ensure Content-Type is set to application/json for API responses
        if (!res.get('Content-Type') && req.path.startsWith('/') && req.path !== '/') {
            res.set('Content-Type', 'application/json');
        }
        return originalSend.call(this, data);
    };
    next();
});
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
        const result = await pool.query('SELECT user_id as id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = result.rows[0];
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
// Routes
// Register endpoint
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name, role = 'user' } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Missing required fields: email, password, and name are required'
            });
        }
        // Validate input with the corrected schema
        const parsedInput = createUserInputSchema.parse({ email, password, name, role });
        // Check if user exists
        const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const user_id = generateUniqueId();
        // Create user (NO HASHING - store password directly for development)
        const result = await pool.query('INSERT INTO users (user_id, email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, name, created_at, role', [user_id, email.toLowerCase().trim(), password, name.trim(), role, new Date().toISOString()]);
        const user = result.rows[0];
        // Generate JWT
        const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Invalid input data',
                details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
            });
        }
        if (error.code === '23505') {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'Database service temporarily unavailable'
            });
        }
        res.status(500).json({
            message: 'Registration failed. Please try again later.'
        });
    }
});
// Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'Missing required fields: email and password are required'
            });
        }
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
        const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'Database service temporarily unavailable'
            });
        }
        res.status(500).json({
            message: 'Login failed. Please try again later.'
        });
    }
});
// Auth verification endpoint
app.get('/auth/verify', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: {
                user_id: req.user?.user_id || req.user?.id,
                email: req.user?.email,
                name: req.user?.name,
                created_at: req.user?.created_at
            }
        });
    }
    catch (error) {
        console.error('Auth verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Search users endpoint
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const { query, limit = 10, offset = 0, sort_by = 'created_at', sort_order = 'desc' } = req.query;
        const validatedInput = searchUserInputSchema.parse({ query, limit, offset, sort_by, sort_order });
        const usersResult = await pool.query(`SELECT * FROM users WHERE name ILIKE '%' || $1 || '%' ORDER BY ${validatedInput.sort_by} ${validatedInput.sort_order} LIMIT $2 OFFSET $3`, [validatedInput.query || '', validatedInput.limit, validatedInput.offset]);
        res.json(usersResult.rows);
    }
    catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Workspace activities endpoint
app.get('/workspaces/:workspace_id/activities', authenticateToken, async (req, res) => {
    try {
        const { workspace_id } = req.params;
        // Mock data for now since we don't have activities table
        const mockActivities = [
            { activity_type: 'Message', content: 'New message in #general channel' },
            { activity_type: 'Task', content: 'Task "Setup project" was completed' },
            { activity_type: 'Document', content: 'Document "Project Plan" was updated' }
        ];
        res.json(mockActivities);
    }
    catch (error) {
        console.error('Activities fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Workspace statistics endpoint
app.get('/workspaces/:workspace_id/statistics', authenticateToken, async (req, res) => {
    try {
        const { workspace_id } = req.params;
        // Get actual counts from database
        const channelsResult = await pool.query('SELECT COUNT(*) FROM channels WHERE workspace_id = $1', [workspace_id]);
        const membersResult = await pool.query('SELECT COUNT(*) FROM workspace_members WHERE workspace_id = $1', [workspace_id]);
        res.json({
            total_channels: parseInt(channelsResult.rows[0].count),
            total_members: parseInt(membersResult.rows[0].count)
        });
    }
    catch (error) {
        console.error('Statistics fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Workspaces endpoint
app.post('/workspaces', authenticateToken, async (req, res) => {
    try {
        const { name, settings } = req.body;
        const workspace_id = generateUniqueId();
        const owner_user_id = req.user?.id;
        if (!owner_user_id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const result = await pool.query('INSERT INTO workspaces (workspace_id, name, owner_user_id, settings, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [workspace_id, name, owner_user_id, JSON.stringify(settings || {}), new Date().toISOString()]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Workspace creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Channels endpoint
app.get('/channels/:channel_id/messages', authenticateToken, async (req, res) => {
    try {
        const { channel_id } = req.params;
        // Mock messages for now
        const mockMessages = [
            {
                message_id: generateUniqueId(),
                channel_id,
                user_id: req.user?.id,
                content: 'Welcome to the channel!',
                sent_at: new Date().toISOString(),
                is_read: true
            }
        ];
        res.json(mockMessages);
    }
    catch (error) {
        console.error('Messages fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.post('/channels/:channel_id/messages', authenticateToken, async (req, res) => {
    try {
        const { channel_id } = req.params;
        const { content } = req.body;
        const message = {
            message_id: generateUniqueId(),
            channel_id,
            user_id: req.user?.id,
            content,
            sent_at: new Date().toISOString(),
            is_read: false
        };
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Message creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Tasks endpoints
app.get('/tasks/:task_id', authenticateToken, async (req, res) => {
    try {
        const { task_id } = req.params;
        const mockTask = {
            task_id,
            title: 'Sample Task',
            description: 'This is a sample task',
            status: 'in_progress',
            priority: 'medium',
            assigned_user_id: req.user?.id,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        };
        res.json(mockTask);
    }
    catch (error) {
        console.error('Task fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/tasks/:task_id', authenticateToken, async (req, res) => {
    try {
        const { task_id } = req.params;
        const updates = req.body;
        const updatedTask = {
            task_id,
            ...updates,
            updated_at: new Date().toISOString()
        };
        res.json(updatedTask);
    }
    catch (error) {
        console.error('Task update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/kanban_boards/:board_id/tasks', authenticateToken, async (req, res) => {
    try {
        const { board_id } = req.params;
        // For demo purposes, return sample tasks with proper structure
        const mockTasks = [
            {
                task_id: generateUniqueId(),
                board_id: board_id,
                title: 'Setup Project Structure',
                description: 'Initialize the project with proper folder structure and dependencies',
                status: 'To Do',
                priority: 'High',
                assigned_user_id: req.user?.id,
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                task_id: generateUniqueId(),
                board_id: board_id,
                title: 'Design Database Schema',
                description: 'Create comprehensive database schema for the application',
                status: 'In Progress',
                priority: 'High',
                assigned_user_id: req.user?.id,
                due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                task_id: generateUniqueId(),
                board_id: board_id,
                title: 'Implement Authentication',
                description: 'Add user authentication and authorization system',
                status: 'Review',
                priority: 'Medium',
                assigned_user_id: req.user?.id,
                due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                task_id: generateUniqueId(),
                board_id: board_id,
                title: 'Write Documentation',
                description: 'Create comprehensive documentation for the API',
                status: 'Done',
                priority: 'Low',
                assigned_user_id: req.user?.id,
                due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        res.json(mockTasks);
    }
    catch (error) {
        console.error('Kanban tasks fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Create task endpoint
app.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const taskData = req.body;
        // Validate input
        const validatedTask = createTaskInputSchema.parse(taskData);
        const newTask = {
            task_id: generateUniqueId(),
            ...validatedTask,
            created_at: new Date().toISOString()
        };
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error('Task creation error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Invalid task data',
                details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get kanban boards endpoint
app.get('/kanban_boards', authenticateToken, async (req, res) => {
    try {
        const mockBoards = [
            {
                board_id: 'default',
                workspace_id: 'default-workspace',
                name: 'Main Project Board'
            }
        ];
        res.json(mockBoards);
    }
    catch (error) {
        console.error('Kanban boards fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// User settings endpoints
app.get('/users/:user_id/settings', authenticateToken, async (req, res) => {
    try {
        const mockSettings = {
            theme: 'light',
            notifications: true,
            language: 'en',
            timezone: 'UTC'
        };
        res.json(mockSettings);
    }
    catch (error) {
        console.error('User settings fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/users/:user_id/settings', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        const updatedSettings = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        res.json(updatedSettings);
    }
    catch (error) {
        console.error('User settings update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Documents endpoints
app.get('/documents/:document_id', authenticateToken, async (req, res) => {
    try {
        const { document_id } = req.params;
        const mockDocument = {
            document_id,
            title: 'Sample Document',
            content: 'This is sample document content',
            last_edited_at: new Date().toISOString(),
            created_by: req.user?.id
        };
        res.json(mockDocument);
    }
    catch (error) {
        console.error('Document fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/documents/:document_id', authenticateToken, async (req, res) => {
    try {
        const { document_id } = req.params;
        const { content } = req.body;
        const updatedDocument = {
            document_id,
            content,
            last_edited_at: new Date().toISOString()
        };
        res.json(updatedDocument);
    }
    catch (error) {
        console.error('Document update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Calendar events endpoints
app.get('/calendar-events', authenticateToken, async (req, res) => {
    try {
        const mockEvents = [
            {
                event_id: generateUniqueId(),
                title: 'Team Meeting',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                created_by: req.user?.id
            }
        ];
        res.json(mockEvents);
    }
    catch (error) {
        console.error('Calendar events fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.post('/calendar-events', authenticateToken, async (req, res) => {
    try {
        const { title, start_time, end_time } = req.body;
        const newEvent = {
            event_id: generateUniqueId(),
            title,
            start_time,
            end_time,
            created_by: req.user?.id,
            created_at: new Date().toISOString()
        };
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error('Calendar event creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Direct messages endpoints
app.get('/direct-messages/:conversation_id/messages', authenticateToken, async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const mockMessages = [
            {
                message_id: generateUniqueId(),
                conversation_id,
                sender_id: req.user?.id,
                content: 'Hello!',
                sent_at: new Date().toISOString()
            }
        ];
        res.json(mockMessages);
    }
    catch (error) {
        console.error('Direct messages fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.post('/direct-messages/:conversation_id/messages', authenticateToken, async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const { content } = req.body;
        const newMessage = {
            message_id: generateUniqueId(),
            conversation_id,
            sender_id: req.user?.id,
            content,
            sent_at: new Date().toISOString()
        };
        res.status(201).json(newMessage);
    }
    catch (error) {
        console.error('Direct message creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Notifications endpoints
app.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user?.id || req.user?.user_id;
        // Get notifications from database
        const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        // If no notifications in DB, return mock data
        if (result.rows.length === 0) {
            const mockNotifications = [
                {
                    notification_id: generateUniqueId(),
                    user_id: user_id,
                    content: 'Welcome to CollabSync! You have successfully logged in.',
                    is_read: false,
                    created_at: new Date().toISOString()
                }
            ];
            res.json(mockNotifications);
        }
        else {
            res.json(result.rows);
        }
    }
    catch (error) {
        console.error('Notifications fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/notifications/count', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user?.id || req.user?.user_id;
        // Get unread notification count from database
        const result = await pool.query('SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false', [user_id]);
        const unread_count = parseInt(result.rows[0].unread_count) || 1; // Default to 1 for demo
        res.json({ unread_count });
    }
    catch (error) {
        console.error('Notification count fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/notifications/:notification_id', authenticateToken, async (req, res) => {
    try {
        const { notification_id } = req.params;
        const updates = req.body;
        const updatedNotification = {
            notification_id,
            ...updates,
            updated_at: new Date().toISOString()
        };
        res.json(updatedNotification);
    }
    catch (error) {
        console.error('Notification update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/notifications/:notification_id/read', authenticateToken, async (req, res) => {
    try {
        const { notification_id } = req.params;
        const user_id = req.user?.id || req.user?.user_id;
        // Update notification as read in database
        const result = await pool.query('UPDATE notifications SET is_read = true WHERE notification_id = $1 AND user_id = $2 RETURNING *', [notification_id, user_id]);
        if (result.rows.length === 0) {
            // If notification doesn't exist in DB, return success anyway for demo
            res.json({
                notification_id,
                is_read: true,
                updated_at: new Date().toISOString()
            });
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (error) {
        console.error('Notification mark as read error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Channels list endpoint
app.get('/workspaces/:workspace_id/channels', authenticateToken, async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const mockChannels = [
            {
                channel_id: generateUniqueId(),
                name: 'general',
                workspace_id,
                is_private: false
            },
            {
                channel_id: generateUniqueId(),
                name: 'random',
                workspace_id,
                is_private: false
            }
        ];
        res.json(mockChannels);
    }
    catch (error) {
        console.error('Channels fetch error:', error);
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
// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            database: "connected"
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            database: "disconnected",
            error: "Database connection failed"
        });
    }
});
app.get("/", (req, res) => {
    res.json({
        message: "Server running with authentication and WebSockets",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Simple ping endpoint for connectivity testing
app.get("/ping", (req, res) => {
    res.json({
        message: "pong",
        timestamp: new Date().toISOString()
    });
});
// Add global error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            details: err.message
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            message: 'Database connection failed'
        });
    }
    res.status(500).json({
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});
// Catch-all route for SPA routing (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
export { app, pool, server };
// Start the server only if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
    const port = Number(process.env.PORT) || 3000;
    // Handle server startup errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use`);
            process.exit(1);
        }
        else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
    server.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${port} and listening on 0.0.0.0`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log(`🔗 API Base URL: http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Server closed');
            pool.end(() => {
                console.log('Database pool closed');
                process.exit(0);
            });
        });
    });
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('Server closed');
            pool.end(() => {
                console.log('Database pool closed');
                process.exit(0);
            });
        });
    });
}
//# sourceMappingURL=server.js.map