import { z } from 'zod';

export const NoteSchema = z.object({
	id: z.string().min(1).max(100),
	user_id: z.string().min(1).max(100),
	title: z.string().max(255).optional(),
	content: z.string().max(100000).optional(), // 100k chars max
	color: z.string().max(50).optional(),
	updated_at: z.string().max(50).optional()
}).strict();

export const DeleteNoteSchema = z.object({
	id: z.string().min(1).max(100),
	user_id: z.string().min(1).max(100)
}).strict();

export const MessageSchema = z.object({
	senderId: z.string().min(1).max(100),
	receiverId: z.string().min(1).max(100),
	content: z.string().min(1).max(10000) // 10k chars max
}).strict();

export const RevokeDeviceSchema = z.object({
	userId: z.string().min(1).max(100),
	deviceId: z.string().min(1).max(100)
}).strict();

export const ChatMessageSchema = z.object({
	role: z.enum(['system', 'user', 'assistant']),
	content: z.string().min(1).max(50000)
}).strict();

export const ChatRequestSchema = z.object({
	messages: z.array(ChatMessageSchema).max(50)
}).strict();

export const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required').max(100),
	password: z.string().min(1, 'Password is required').max(100),
	deviceId: z.string().max(100).optional(),
	deviceName: z.string().max(255).optional()
}).strict();

export const SearchQuerySchema = z
	.string()
	.min(1, 'Search query cannot be empty')
	.max(200, 'Search query is too long');
