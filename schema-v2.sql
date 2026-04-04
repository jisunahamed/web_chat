-- =============================================
-- Messenger AI – Schema Update v2
-- Run this in Neon SQL Editor
-- =============================================

-- Add role column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Global Settings table
CREATE TABLE IF NOT EXISTS settings (
  id          TEXT PRIMARY KEY DEFAULT 'global',
  ai_model    TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  ai_base_url TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id, ai_model) VALUES ('global', 'gpt-4o-mini') ON CONFLICT (id) DO NOTHING;

-- Make your account admin (change email if needed)
UPDATE users SET role = 'admin' WHERE email = 'jisunahamed525@gmail.com';
