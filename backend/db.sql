-- Create users table
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL
);

-- Create example users
INSERT INTO users (user_id, email, name, created_at, password_hash, role) VALUES
('user1', 'john.doe@example.com', 'John Doe', '2023-10-01T10:00:00Z', 'password123', 'admin'),
('user2', 'jane.smith@example.com', 'Jane Smith', '2023-10-02T11:00:00Z', 'admin123', 'editor');

-- Create workspaces table
CREATE TABLE workspaces (
    workspace_id VARCHAR PRIMARY KEY,
    owner_user_id VARCHAR NOT NULL REFERENCES users(user_id),
    name VARCHAR NOT NULL,
    settings JSON
);

-- Create example workspaces
INSERT INTO workspaces (workspace_id, owner_user_id, name, settings) VALUES
('workspace1', 'user1', 'Acme Workspace', '{"theme": "dark"}');

-- Create workspace_members table
CREATE TABLE workspace_members (
    workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    role VARCHAR NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- Create example workspace_members
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
('workspace1', 'user1', 'owner'),
('workspace1', 'user2', 'member');

-- Create channels table
CREATE TABLE channels (
    channel_id VARCHAR PRIMARY KEY,
    workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
    name VARCHAR NOT NULL,
    is_private BOOLEAN NOT NULL
);

-- Create example channels
INSERT INTO channels (channel_id, workspace_id, name, is_private) VALUES
('channel1', 'workspace1', 'General', false),
('channel2', 'workspace1', 'Private Chat', true);

-- Create messages table
CREATE TABLE messages (
    message_id VARCHAR PRIMARY KEY,
    channel_id VARCHAR NOT NULL REFERENCES channels(channel_id),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    content VARCHAR NOT NULL,
    sent_at VARCHAR NOT NULL,
    is_read BOOLEAN NOT NULL
);

-- Create example messages
INSERT INTO messages (message_id, channel_id, user_id, content, sent_at, is_read) VALUES
('message1', 'channel1', 'user1', 'Hello everyone!', '2023-10-03T12:00:00Z', true),
('message2', 'channel1', 'user2', 'Hi John!', '2023-10-03T12:01:00Z', false);

-- Create files table
CREATE TABLE files (
    file_id VARCHAR PRIMARY KEY,
    channel_id VARCHAR REFERENCES channels(channel_id),
    uploader_user_id VARCHAR NOT NULL REFERENCES users(user_id),
    file_url VARCHAR NOT NULL,
    uploaded_at VARCHAR NOT NULL
);

-- Create example files
INSERT INTO files (file_id, channel_id, uploader_user_id, file_url, uploaded_at) VALUES
('file1', 'channel1', 'user1', 'https://picsum.photos/200/300?random=1', '2023-10-04T14:00:00Z');

-- Create kanban_boards table
CREATE TABLE kanban_boards (
    board_id VARCHAR PRIMARY KEY,
    workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
    name VARCHAR NOT NULL
);

-- Create example kanban_boards
INSERT INTO kanban_boards (board_id, workspace_id, name) VALUES
('board1', 'workspace1', 'Development Board');

-- Create tasks table
CREATE TABLE tasks (
    task_id VARCHAR PRIMARY KEY,
    board_id VARCHAR NOT NULL REFERENCES kanban_boards(board_id),
    assigned_user_id VARCHAR REFERENCES users(user_id),
    title VARCHAR NOT NULL,
    description VARCHAR,
    status VARCHAR NOT NULL,
    priority VARCHAR NOT NULL,
    due_date VARCHAR
);

-- Create example tasks
INSERT INTO tasks (task_id, board_id, assigned_user_id, title, description, status, priority, due_date) VALUES
('task1', 'board1', 'user2', 'Design Homepage', 'Create a responsive homepage', 'To Do', 'High', '2023-11-01');

-- Create documents table
CREATE TABLE documents (
    document_id VARCHAR PRIMARY KEY,
    workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
    title VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    last_edited_at VARCHAR NOT NULL,
    version VARCHAR NOT NULL
);

-- Create example documents
INSERT INTO documents (document_id, workspace_id, title, content, last_edited_at, version) VALUES
('doc1', 'workspace1', 'Q3 Report', 'This is the Q3 financial report...', '2023-10-03T12:00:00Z', '1.0');

-- Create calendar_events table
CREATE TABLE calendar_events (
    event_id VARCHAR PRIMARY KEY,
    workspace_id VARCHAR NOT NULL REFERENCES workspaces(workspace_id),
    title VARCHAR NOT NULL,
    start_time VARCHAR NOT NULL,
    end_time VARCHAR NOT NULL,
    description VARCHAR
);

-- Create example calendar_events
INSERT INTO calendar_events (event_id, workspace_id, title, start_time, end_time, description) VALUES
('event1', 'workspace1', 'Sprint Planning', '2023-10-08T09:00:00Z', '2023-10-08T11:00:00Z', 'Sprint Planning meeting');

-- Create notifications table
CREATE TABLE notifications (
    notification_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    content VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL,
    is_read BOOLEAN NOT NULL
);

-- Create example notifications
INSERT INTO notifications (notification_id, user_id, content, created_at, is_read) VALUES
('notif1', 'user1', 'You have a new message in General', '2023-10-04T12:00:00Z', false);