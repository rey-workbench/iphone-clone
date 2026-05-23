-- Drop the old is_user column as it's no longer used
ALTER TABLE messages DROP COLUMN IF EXISTS is_user;

-- Add sender_id, receiver_id
ALTER TABLE messages ADD COLUMN sender_id UUID NOT NULL DEFAULT 'f2a5b1c3-2d5f-4a8b-9e4c-34f781d9d1bc';
ALTER TABLE messages ADD COLUMN receiver_id UUID NOT NULL DEFAULT 'e1b74c2e-4b6c-48c9-8d76-15b561c8f1ea';
