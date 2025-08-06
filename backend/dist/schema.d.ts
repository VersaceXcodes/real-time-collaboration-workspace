import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    user_id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    created_at: z.ZodDate;
    password_hash: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    email?: string;
    name?: string;
    created_at?: Date;
    password_hash?: string;
    role?: string;
}, {
    user_id?: string;
    email?: string;
    name?: string;
    created_at?: Date;
    password_hash?: string;
    role?: string;
}>;
export declare const createUserInputSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    name?: string;
    role?: string;
    password?: string;
}, {
    email?: string;
    name?: string;
    role?: string;
    password?: string;
}>;
export declare const updateUserInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    password_hash: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    email?: string;
    name?: string;
    password_hash?: string;
    role?: string;
}, {
    user_id?: string;
    email?: string;
    name?: string;
    password_hash?: string;
    role?: string;
}>;
export declare const searchUserInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["name", "created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name" | "created_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name" | "created_at";
    sort_order?: "asc" | "desc";
}>;
export declare const workspaceSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    owner_user_id: z.ZodString;
    name: z.ZodString;
    settings: z.ZodNullable<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}, {
    name?: string;
    workspace_id?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}>;
export declare const createWorkspaceInputSchema: z.ZodObject<{
    owner_user_id: z.ZodString;
    name: z.ZodString;
    settings: z.ZodNullable<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}, {
    name?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}>;
export declare const updateWorkspaceInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    owner_user_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}, {
    name?: string;
    workspace_id?: string;
    owner_user_id?: string;
    settings?: {} & {
        [k: string]: unknown;
    };
}>;
export declare const searchWorkspaceInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["name"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}>;
export declare const workspaceMemberSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}>;
export declare const createWorkspaceMemberInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}>;
export declare const updateWorkspaceMemberInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}, {
    user_id?: string;
    role?: string;
    workspace_id?: string;
}>;
export declare const searchWorkspaceMemberInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    offset?: number;
}, {
    limit?: number;
    offset?: number;
}>;
export declare const channelSchema: z.ZodObject<{
    channel_id: z.ZodString;
    workspace_id: z.ZodString;
    name: z.ZodString;
    is_private: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    channel_id?: string;
    is_private?: boolean;
}, {
    name?: string;
    workspace_id?: string;
    channel_id?: string;
    is_private?: boolean;
}>;
export declare const createChannelInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    name: z.ZodString;
    is_private: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    is_private?: boolean;
}, {
    name?: string;
    workspace_id?: string;
    is_private?: boolean;
}>;
export declare const updateChannelInputSchema: z.ZodObject<{
    channel_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    is_private: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    channel_id?: string;
    is_private?: boolean;
}, {
    name?: string;
    workspace_id?: string;
    channel_id?: string;
    is_private?: boolean;
}>;
export declare const searchChannelInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["name"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}>;
export declare const messageSchema: z.ZodObject<{
    message_id: z.ZodString;
    channel_id: z.ZodString;
    user_id: z.ZodString;
    content: z.ZodString;
    sent_at: z.ZodDate;
    is_read: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    channel_id?: string;
    message_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}, {
    user_id?: string;
    channel_id?: string;
    message_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}>;
export declare const createMessageInputSchema: z.ZodObject<{
    channel_id: z.ZodString;
    user_id: z.ZodString;
    content: z.ZodString;
    sent_at: z.ZodDate;
    is_read: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    channel_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}, {
    user_id?: string;
    channel_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}>;
export declare const updateMessageInputSchema: z.ZodObject<{
    message_id: z.ZodString;
    channel_id: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    sent_at: z.ZodOptional<z.ZodDate>;
    is_read: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    channel_id?: string;
    message_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}, {
    user_id?: string;
    channel_id?: string;
    message_id?: string;
    content?: string;
    sent_at?: Date;
    is_read?: boolean;
}>;
export declare const searchMessageInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["sent_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "sent_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "sent_at";
    sort_order?: "asc" | "desc";
}>;
export declare const fileSchema: z.ZodObject<{
    file_id: z.ZodString;
    channel_id: z.ZodNullable<z.ZodString>;
    uploader_user_id: z.ZodString;
    file_url: z.ZodString;
    uploaded_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    channel_id?: string;
    file_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}, {
    channel_id?: string;
    file_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}>;
export declare const createFileInputSchema: z.ZodObject<{
    channel_id: z.ZodNullable<z.ZodString>;
    uploader_user_id: z.ZodString;
    file_url: z.ZodString;
    uploaded_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    channel_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}, {
    channel_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}>;
export declare const updateFileInputSchema: z.ZodObject<{
    file_id: z.ZodString;
    channel_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uploader_user_id: z.ZodOptional<z.ZodString>;
    file_url: z.ZodOptional<z.ZodString>;
    uploaded_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    channel_id?: string;
    file_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}, {
    channel_id?: string;
    file_id?: string;
    uploader_user_id?: string;
    file_url?: string;
    uploaded_at?: Date;
}>;
export declare const searchFileInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["uploaded_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "uploaded_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "uploaded_at";
    sort_order?: "asc" | "desc";
}>;
export declare const kanbanBoardSchema: z.ZodObject<{
    board_id: z.ZodString;
    workspace_id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    board_id?: string;
}, {
    name?: string;
    workspace_id?: string;
    board_id?: string;
}>;
export declare const createKanbanBoardInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
}, {
    name?: string;
    workspace_id?: string;
}>;
export declare const updateKanbanBoardInputSchema: z.ZodObject<{
    board_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    workspace_id?: string;
    board_id?: string;
}, {
    name?: string;
    workspace_id?: string;
    board_id?: string;
}>;
export declare const searchKanbanBoardInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["name"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name";
    sort_order?: "asc" | "desc";
}>;
export declare const taskSchema: z.ZodObject<{
    task_id: z.ZodString;
    board_id: z.ZodString;
    assigned_user_id: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    priority: z.ZodString;
    due_date: z.ZodNullable<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status?: string;
    board_id?: string;
    task_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}, {
    status?: string;
    board_id?: string;
    task_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}>;
export declare const createTaskInputSchema: z.ZodObject<{
    board_id: z.ZodString;
    assigned_user_id: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    priority: z.ZodString;
    due_date: z.ZodNullable<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status?: string;
    board_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}, {
    status?: string;
    board_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}>;
export declare const updateTaskInputSchema: z.ZodObject<{
    task_id: z.ZodString;
    board_id: z.ZodOptional<z.ZodString>;
    assigned_user_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    status?: string;
    board_id?: string;
    task_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}, {
    status?: string;
    board_id?: string;
    task_id?: string;
    assigned_user_id?: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: Date;
}>;
export declare const searchTaskInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["title", "due_date"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "title" | "due_date";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "title" | "due_date";
    sort_order?: "asc" | "desc";
}>;
export declare const documentSchema: z.ZodObject<{
    document_id: z.ZodString;
    workspace_id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    last_edited_at: z.ZodDate;
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    content?: string;
    title?: string;
    document_id?: string;
    last_edited_at?: Date;
    version?: string;
}, {
    workspace_id?: string;
    content?: string;
    title?: string;
    document_id?: string;
    last_edited_at?: Date;
    version?: string;
}>;
export declare const createDocumentInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    last_edited_at: z.ZodDate;
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    content?: string;
    title?: string;
    last_edited_at?: Date;
    version?: string;
}, {
    workspace_id?: string;
    content?: string;
    title?: string;
    last_edited_at?: Date;
    version?: string;
}>;
export declare const updateDocumentInputSchema: z.ZodObject<{
    document_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    last_edited_at: z.ZodOptional<z.ZodDate>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    content?: string;
    title?: string;
    document_id?: string;
    last_edited_at?: Date;
    version?: string;
}, {
    workspace_id?: string;
    content?: string;
    title?: string;
    document_id?: string;
    last_edited_at?: Date;
    version?: string;
}>;
export declare const searchDocumentInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["title", "last_edited_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "title" | "last_edited_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "title" | "last_edited_at";
    sort_order?: "asc" | "desc";
}>;
export declare const calendarEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    workspace_id: z.ZodString;
    title: z.ZodString;
    start_time: z.ZodDate;
    end_time: z.ZodDate;
    description: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    title?: string;
    description?: string;
    event_id?: string;
    start_time?: Date;
    end_time?: Date;
}, {
    workspace_id?: string;
    title?: string;
    description?: string;
    event_id?: string;
    start_time?: Date;
    end_time?: Date;
}>;
export declare const createCalendarEventInputSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    title: z.ZodString;
    start_time: z.ZodDate;
    end_time: z.ZodDate;
    description: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    title?: string;
    description?: string;
    start_time?: Date;
    end_time?: Date;
}, {
    workspace_id?: string;
    title?: string;
    description?: string;
    start_time?: Date;
    end_time?: Date;
}>;
export declare const updateCalendarEventInputSchema: z.ZodObject<{
    event_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    start_time: z.ZodOptional<z.ZodDate>;
    end_time: z.ZodOptional<z.ZodDate>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    workspace_id?: string;
    title?: string;
    description?: string;
    event_id?: string;
    start_time?: Date;
    end_time?: Date;
}, {
    workspace_id?: string;
    title?: string;
    description?: string;
    event_id?: string;
    start_time?: Date;
    end_time?: Date;
}>;
export declare const searchCalendarEventInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["start_time", "end_time"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "start_time" | "end_time";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "start_time" | "end_time";
    sort_order?: "asc" | "desc";
}>;
export declare const notificationSchema: z.ZodObject<{
    notification_id: z.ZodString;
    user_id: z.ZodString;
    content: z.ZodString;
    created_at: z.ZodDate;
    is_read: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
    notification_id?: string;
}, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
    notification_id?: string;
}>;
export declare const createNotificationInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    content: z.ZodString;
    created_at: z.ZodDate;
    is_read: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
}, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
}>;
export declare const updateNotificationInputSchema: z.ZodObject<{
    notification_id: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodDate>;
    is_read: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
    notification_id?: string;
}, {
    user_id?: string;
    created_at?: Date;
    content?: string;
    is_read?: boolean;
    notification_id?: string;
}>;
export declare const searchNotificationInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
}>;
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
//# sourceMappingURL=schema.d.ts.map