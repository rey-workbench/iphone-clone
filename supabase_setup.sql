-- Enable UUID extension just in case
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_status BOOLEAN NOT NULL DEFAULT false
);

-- 2. Create temp table for keep-alive
CREATE TABLE IF NOT EXISTS temp (
    id SERIAL PRIMARY KEY,
    note TEXT NOT NULL,
    pinged_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Optional) If you have Row Level Security (RLS) enabled on your Supabase project,
-- you will need to allow anonymous (public) access so our client can read/write.
-- Or simply turn off RLS for these two tables.
-- The commands below will allow anyone to read and insert data into these tables:

-- Disable RLS for messages
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- Disable RLS for temp
ALTER TABLE temp DISABLE ROW LEVEL SECURITY;
