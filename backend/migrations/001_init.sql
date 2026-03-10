-- Sungku Super App — Supabase Schema Migration
-- Run once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uybhscmvncjxsokzgyuu/sql/new

-- USERS
CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  email         TEXT DEFAULT '',
  password      TEXT NOT NULL,
  verified      BOOLEAN DEFAULT FALSE,
  language      TEXT DEFAULT 'fr',
  otp           TEXT,
  avatar        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'system',
  read       BOOLEAN DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  name         TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  avatar       TEXT,
  email        TEXT,
  added_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);

-- USER MINIAPPS (installed)
CREATE TABLE IF NOT EXISTS user_miniapps (
  id           TEXT PRIMARY KEY,
  app_id       TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  name         TEXT,
  icon         TEXT,
  category     TEXT,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);
ALTER TABLE user_miniapps DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_miniapps_user ON user_miniapps(user_id);

-- MINIAPPS CATALOG
CREATE TABLE IF NOT EXISTS miniapps_catalog (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  icon          TEXT,
  category      TEXT,
  published     BOOLEAN DEFAULT FALSE,
  featured      BOOLEAN DEFAULT FALSE,
  installations INTEGER DEFAULT 0,
  rating        NUMERIC(3,1) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);
ALTER TABLE miniapps_catalog DISABLE ROW LEVEL SECURITY;

-- PROFILE STATS
CREATE TABLE IF NOT EXISTS profile_stats (
  user_id    TEXT PRIMARY KEY,
  transfers  INTEGER DEFAULT 0,
  contacts   INTEGER DEFAULT 0,
  mini_apps  INTEGER DEFAULT 0,
  balance    NUMERIC(15,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile_stats DISABLE ROW LEVEL SECURITY;

-- USSD TRANSACTIONS
CREATE TABLE IF NOT EXISTS ussd_transactions (
  transaction_id TEXT PRIMARY KEY,
  phone_number   TEXT NOT NULL,
  operator       TEXT NOT NULL,
  amount         NUMERIC(15,2) NOT NULL,
  description    TEXT DEFAULT 'payment',
  user_id        TEXT,
  code           TEXT,
  status         TEXT DEFAULT 'pending',
  failure_reason TEXT,
  initiated_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);
ALTER TABLE ussd_transactions DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ussd_user ON ussd_transactions(user_id);

-- SMS LOGS
CREATE TABLE IF NOT EXISTS sms_logs (
  id         TEXT PRIMARY KEY,
  phone      TEXT NOT NULL,
  code       TEXT,
  message    TEXT,
  provider   TEXT DEFAULT 'afrimotech',
  type       TEXT DEFAULT 'otp',
  status     TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sms_logs DISABLE ROW LEVEL SECURITY;

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id           INTEGER PRIMARY KEY,
  user_id      TEXT NOT NULL,
  name         TEXT NOT NULL,
  avatar       TEXT,
  last_message TEXT,
  last_time    TEXT,
  unread       INTEGER DEFAULT 0,
  online       BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ
);
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender          TEXT NOT NULL DEFAULT 'me',
  text            TEXT NOT NULL,
  time            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);

-- ADMIN SESSIONS
CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  login_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- FAQ
CREATE TABLE IF NOT EXISTS faq (
  id         TEXT PRIMARY KEY,
  language   TEXT NOT NULL DEFAULT 'fr',
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE faq DISABLE ROW LEVEL SECURITY;
