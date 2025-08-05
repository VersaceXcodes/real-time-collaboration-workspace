import { z } from 'zod';

// Users
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.coerce.date(),
  password_hash: z.string(),
  role: z.string()
});

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password_hash: z.string(),
  role: z.string().min(1)
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  password_hash: z.string().optional(),
  role: z.string().min(1).optional()
});

export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Workspaces
export const workspaceSchema = z.object({
  workspace_id: z.string(),
  owner_user_id: z.string(),
  name: z.string(),
  settings: z.object({}).passthrough().nullable()
});

export const createWorkspaceInputSchema = z.object({
  owner_user_id: z.string(),
  name: z.string().min(1).max(255),
  settings: z.object({}).passthrough().nullable()
});

export const updateWorkspaceInputSchema = z.object({
  workspace_id: z.string(),
  owner_user_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  settings: z.object({}).passthrough().nullable().optional()
});

export const searchWorkspaceInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Workspace Members
export const workspaceMemberSchema = z.object({
  workspace_id: z.string(),
  user_id: z.string(),
  role: z.string()
});

export const createWorkspaceMemberInputSchema = z.object({
  workspace_id: z.string(),
  user_id: z.string(),
  role: z.string().min(1)
});

export const updateWorkspaceMemberInputSchema = z.object({
  workspace_id: z.string(),
  user_id: z.string(),
  role: z.string().min(1).optional()
});

export const searchWorkspaceMemberInputSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0)
});

// Channels
export const channelSchema = z.object({
  channel_id: z.string(),
  workspace_id: z.string(),
  name: z.string(),
  is_private: z.boolean()
});

export const createChannelInputSchema = z.object({
  workspace_id: z.string(),
  name: z.string().min(1).max(255),
  is_private: z.boolean()
});

export const updateChannelInputSchema = z.object({
  channel_id: z.string(),
  workspace_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  is_private: z.boolean().optional()
});

export const searchChannelInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Messages
export const messageSchema = z.object({
  message_id: z.string(),
  channel_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  sent_at: z.coerce.date(),
  is_read: z.boolean()
});

export const createMessageInputSchema = z.object({
  channel_id: z.string(),
  user_id: z.string(),
  content: z.string().min(1).max(1000),
  sent_at: z.coerce.date(),
  is_read: z.boolean()
});

export const updateMessageInputSchema = z.object({
  message_id: z.string(),
  channel_id: z.string().optional(),
  user_id: z.string().optional(),
  content: z.string().min(1).max(1000).optional(),
  sent_at: z.coerce.date().optional(),
  is_read: z.boolean().optional()
});

export const searchMessageInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['sent_at']).default('sent_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Files
export const fileSchema = z.object({
  file_id: z.string(),
  channel_id: z.string().nullable(),
  uploader_user_id: z.string(),
  file_url: z.string().url(),
  uploaded_at: z.coerce.date()
});

export const createFileInputSchema = z.object({
  channel_id: z.string().nullable(),
  uploader_user_id: z.string(),
  file_url: z.string().url(),
  uploaded_at: z.coerce.date()
});

export const updateFileInputSchema = z.object({
  file_id: z.string(),
  channel_id: z.string().nullable().optional(),
  uploader_user_id: z.string().optional(),
  file_url: z.string().url().optional(),
  uploaded_at: z.coerce.date().optional()
});

export const searchFileInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['uploaded_at']).default('uploaded_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Kanban Boards
export const kanbanBoardSchema = z.object({
  board_id: z.string(),
  workspace_id: z.string(),
  name: z.string()
});

export const createKanbanBoardInputSchema = z.object({
  workspace_id: z.string(),
  name: z.string().min(1).max(255)
});

export const updateKanbanBoardInputSchema = z.object({
  board_id: z.string(),
  workspace_id: z.string().optional(),
  name: z.string().min(1).max(255).optional()
});

export const searchKanbanBoardInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Tasks
export const taskSchema = z.object({
  task_id: z.string(),
  board_id: z.string(),
  assigned_user_id: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  due_date: z.coerce.date().nullable()
});

export const createTaskInputSchema = z.object({
  board_id: z.string(),
  assigned_user_id: z.string().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  status: z.string().min(1),
  priority: z.string().min(1),
  due_date: z.coerce.date().nullable()
});

export const updateTaskInputSchema = z.object({
  task_id: z.string(),
  board_id: z.string().optional(),
  assigned_user_id: z.string().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.string().min(1).optional(),
  priority: z.string().min(1).optional(),
  due_date: z.coerce.date().nullable().optional()
});

export const searchTaskInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'due_date']).default('due_date'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Documents
export const documentSchema = z.object({
  document_id: z.string(),
  workspace_id: z.string(),
  title: z.string(),
  content: z.string(),
  last_edited_at: z.coerce.date(),
  version: z.string()
});

export const createDocumentInputSchema = z.object({
  workspace_id: z.string(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  last_edited_at: z.coerce.date(),
  version: z.string().min(1)
});

export const updateDocumentInputSchema = z.object({
  document_id: z.string(),
  workspace_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  last_edited_at: z.coerce.date().optional(),
  version: z.string().min(1).optional()
});

export const searchDocumentInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'last_edited_at']).default('last_edited_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Calendar Events
export const calendarEventSchema = z.object({
  event_id: z.string(),
  workspace_id: z.string(),
  title: z.string(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  description: z.string().nullable()
});

export const createCalendarEventInputSchema = z.object({
  workspace_id: z.string(),
  title: z.string().min(1).max(255),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  description: z.string().nullable()
});

export const updateCalendarEventInputSchema = z.object({
  event_id: z.string(),
  workspace_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  start_time: z.coerce.date().optional(),
  end_time: z.coerce.date().optional(),
  description: z.string().nullable().optional()
});

export const searchCalendarEventInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['start_time', 'end_time']).default('start_time'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Notifications
export const notificationSchema = z.object({
  notification_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  is_read: z.boolean()
});

export const createNotificationInputSchema = z.object({
  user_id: z.string(),
  content: z.string().min(1).max(1000),
  created_at: z.coerce.date(),
  is_read: z.boolean()
});

export const updateNotificationInputSchema = z.object({
  notification_id: z.string(),
  user_id: z.string().optional(),
  content: z.string().min(1).max(1000).optional(),
  created_at: z.coerce.date().optional(),
  is_read: z.boolean().optional()
});

export const searchNotificationInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Inferred types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

export type Workspace = z.infer<typeof workspaceSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceInputSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceInputSchema>;
export type SearchWorkspaceInput = z.infer<typeof searchWorkspaceInputSchema>;

export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export type CreateWorkspaceMemberInput = z.infer<typeof createWorkspaceMemberInputSchema>;
export type UpdateWorkspaceMemberInput = z.infer<typeof updateWorkspaceMemberInputSchema>;
export type SearchWorkspaceMemberInput = z.infer<typeof searchWorkspaceMemberInputSchema>;

export type Channel = z.infer<typeof channelSchema>;
export type CreateChannelInput = z.infer<typeof createChannelInputSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelInputSchema>;
export type SearchChannelInput = z.infer<typeof searchChannelInputSchema>;

export type Message = z.infer<typeof messageSchema>;
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
export type SearchMessageInput = z.infer<typeof searchMessageInputSchema>;

export type File = z.infer<typeof fileSchema>;
export type CreateFileInput = z.infer<typeof createFileInputSchema>;
export type UpdateFileInput = z.infer<typeof updateFileInputSchema>;
export type SearchFileInput = z.infer<typeof searchFileInputSchema>;

export type KanbanBoard = z.infer<typeof kanbanBoardSchema>;
export type CreateKanbanBoardInput = z.infer<typeof createKanbanBoardInputSchema>;
export type UpdateKanbanBoardInput = z.infer<typeof updateKanbanBoardInputSchema>;
export type SearchKanbanBoardInput = z.infer<typeof searchKanbanBoardInputSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type SearchTaskInput = z.infer<typeof searchTaskInputSchema>;

export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type SearchDocumentInput = z.infer<typeof searchDocumentInputSchema>;

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventInputSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventInputSchema>;
export type SearchCalendarEventInput = z.infer<typeof searchCalendarEventInputSchema>;

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationInputSchema>;
export type SearchNotificationInput = z.infer<typeof searchNotificationInputSchema>;