import { z } from 'zod';

export const NoteSchema = z.object({
    id: z.string().min(1).max(100),
    user_id: z.string().min(1).max(100),
    title: z.string().max(255).optional(),
    content: z.string().max(100000).optional(), // 100k chars max
    color: z.string().max(50).optional(),
    updated_at: z.string().max(50).optional()
});

export const DeleteNoteSchema = z.object({
    id: z.string().min(1).max(100),
    user_id: z.string().min(1).max(100)
});

export const MessageSchema = z.object({
    senderId: z.string().min(1).max(100),
    receiverId: z.string().min(1).max(100),
    content: z.string().min(1).max(10000) // 10k chars max
});

export const RevokeDeviceSchema = z.object({
    userId: z.string().min(1).max(100),
    deviceId: z.string().min(1).max(100)
});

export const ChatMessageSchema = z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1).max(50000)
});

export const ChatRequestSchema = z.object({
    messages: z.array(ChatMessageSchema).max(50)
});

export const LoginSchema = z.object({
    username: z.string().min(1, 'Username is required').max(100),
    password: z.string().min(1, 'Password is required').max(100),
    deviceId: z.string().max(100).optional(),
    deviceName: z.string().max(255).optional()
});
