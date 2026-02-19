-- Collaborative Whiteboard: Supabase Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Untitled Board',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Snapshots table (stores tldraw board state as JSON)
CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_room_id ON snapshots(room_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_room_created ON snapshots(room_id, created_at DESC);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth yet)
CREATE POLICY "Allow all on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on snapshots" ON snapshots FOR ALL USING (true) WITH CHECK (true);
