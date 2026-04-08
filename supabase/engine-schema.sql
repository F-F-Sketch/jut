-- ============================================================
-- JUT — Automation Engine Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Automation Runs Log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_runs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id  UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  trigger_data   JSONB NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'running'
                 CHECK (status IN ('running','completed','failed','cancelled')),
  steps_executed INT DEFAULT 0,
  steps_failed   INT DEFAULT 0,
  lead_id        UUID REFERENCES leads(id),
  conversation_id UUID,
  error          TEXT,
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  completed_at   TIMESTAMPTZ
);

-- ── Messages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'ai'
                  CHECK (role IN ('user','ai','system')),
  content         TEXT NOT NULL,
  channel         TEXT DEFAULT 'instagram_dm',
  status          TEXT DEFAULT 'sent'
                  CHECK (status IN ('sent','delivered','read','failed')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Business Configs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_configs (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name          TEXT,
  business_type          TEXT,
  website                TEXT,
  phone                  TEXT,
  email                  TEXT,
  country                TEXT DEFAULT 'CO',
  timezone               TEXT DEFAULT 'America/Bogota',
  instagram_handle       TEXT,
  facebook_url           TEXT,
  whatsapp_number        TEXT,
  ai_tone                TEXT DEFAULT 'friendly',
  primary_language       TEXT DEFAULT 'es',
  qualification_criteria TEXT,
  escalation_rules       TEXT,
  automation_goals       TEXT,
  faqs                   JSONB NOT NULL DEFAULT '[]',
  offers                 JSONB NOT NULL DEFAULT '[]',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ── Social Triggers ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_triggers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL DEFAULT 'instagram',
  trigger_type TEXT NOT NULL DEFAULT 'comment_keyword',
  keywords     TEXT[] DEFAULT '{}',
  post_id      TEXT,
  content_type TEXT DEFAULT 'any',
  automation_id UUID REFERENCES automations(id),
  is_active    BOOLEAN DEFAULT TRUE,
  fire_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Runs Log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID,
  automation_id   UUID REFERENCES automations(id),
  prompt          TEXT,
  response        TEXT,
  model           TEXT DEFAULT 'gpt-4o-mini',
  tokens_used     INT DEFAULT 0,
  latency_ms      INT DEFAULT 0,
  status          TEXT DEFAULT 'success',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Integrations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_id   TEXT,
  account_name TEXT,
  metadata     JSONB DEFAULT '{}',
  is_active    BOOLEAN DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency    TEXT DEFAULT 'COP',
  sku         TEXT,
  stock       INT DEFAULT -1,
  is_active   BOOLEAN DEFAULT TRUE,
  images      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Webhooks (for n8n etc) ───────────────────────────────
CREATE TABLE IF NOT EXISTS user_webhooks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  events     TEXT[] NOT NULL DEFAULT '{}',
  secret     TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  last_fired TIMESTAMPTZ,
  fire_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Queue for delayed actions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS action_queue (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  run_id        UUID,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL,
  payload       JSONB NOT NULL DEFAULT '{}',
  context       JSONB DEFAULT '{}',
  execute_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','processing','completed','failed')),
  attempts      INT DEFAULT 0,
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add missing columns to existing tables ────────────────────
ALTER TABLE automations ADD COLUMN IF NOT EXISTS trigger    JSONB NOT NULL DEFAULT '{}';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS actions    JSONB NOT NULL DEFAULT '[]';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS conditions JSONB NOT NULL DEFAULT '[]';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'active';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS run_count  INT DEFAULT 0;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ;

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_automated  BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS automation_id UUID REFERENCES automations(id);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_runs" ON automation_runs FOR ALL USING (
  EXISTS (SELECT 1 FROM automations WHERE id = automation_id AND user_id = auth.uid())
);
CREATE POLICY "users_own_messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "users_own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_config" ON business_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_triggers" ON social_triggers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_ai_runs" ON ai_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_integrations" ON integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_webhooks" ON user_webhooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_queue" ON action_queue FOR ALL USING (auth.uid() = user_id);

-- ── Enable Realtime ───────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
