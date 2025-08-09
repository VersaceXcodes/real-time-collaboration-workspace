// Shared types for the frontend application

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Workspace {
  workspace_id: string;
  name: string;
  owner_user_id: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface Channel {
  channel_id: string;
  workspace_id: string;
  name: string;
  is_private: boolean;
  created_at: string;
}

export interface Message {
  message_id: string;
  channel_id: string;
  user_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
}

export interface Task {
  task_id: string;
  board_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_user_id: string;
  due_date: string;
  created_at: string;
}

export interface Document {
  document_id: string;
  workspace_id: string;
  title: string;
  content: string;
  last_edited_at: string;
  created_by: string;
  version: string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Input types for API calls
export interface CreateWorkspaceInput {
  owner_user_id: string;
  name: string;
  settings?: Record<string, any>;
}

export interface CreateTaskInput {
  board_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_user_id?: string;
  due_date?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}

// Schema validation (simplified for frontend)
export const taskSchema = {
  parse: (data: any) => data as Task,
};

export const notificationSchema = {
  parse: (data: any) => data as Notification,
};

export const updateUserInputSchema = {
  parse: (data: any) => data as UpdateUserInput,
};