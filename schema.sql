-- =============================================
-- Messenger AI – Database Schema
-- Run this in Neon SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  company     TEXT,
  api_key     TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Agents
CREATE TABLE IF NOT EXISTS agents (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  system_prompt   TEXT NOT NULL,
  website_url     TEXT,
  tone            TEXT NOT NULL DEFAULT 'friendly',
  model           TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  webhook_url     TEXT,
  collect_leads   BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_domains TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#6C5CE7',
  welcome_message TEXT NOT NULL DEFAULT 'Hi there! 👋 How can I help you today?',
  bot_avatar      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  user_info   JSONB,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, session_id)
);

-- 4. Messages
CREATE TABLE IF NOT EXISTS messages (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Leads
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id  TEXT,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id  TEXT,
  payload     JSONB NOT NULL,
  status_code INTEGER,
  response    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_agent_id ON webhook_logs(agent_id);
