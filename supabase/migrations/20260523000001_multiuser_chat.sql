-- Drop the old is_user column as it's no longer used
ALTER TABLE messages DROP COLUMN IF EXISTS is_user;

-- Add sender_id and receiver_id
ALTER TABLE messages ADD COLUMN sender_id TEXT NOT NULL DEFAULT 'user1';
ALTER TABLE messages ADD COLUMN receiver_id TEXT NOT NULL DEFAULT 'ai-bot';
