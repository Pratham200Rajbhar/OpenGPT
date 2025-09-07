-- Create the chats table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

-- Enable Row Level Security (optional, for future user authentication)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON chats
  FOR ALL USING (true) WITH CHECK (true);
