-- ============================================================
-- JUT — Complete Supabase Schema v1.0
-- Run this entire file in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  business_name TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','growth','elite')),
  locale        TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en','es')),
  currency      TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','COP')),
  onboarded     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Business Configurations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS business_configs (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name          TEXT,
  business_type          TEXT,
  website                TEXT,
  phone                  TEXT,
  email                  TEXT,
  country                TEXT DEFAULT 'US',
  timezone               TEXT DEFAULT 'America/New_York',
  instagram_handle       TEXT,
  facebook_url           TEXT,
  whatsapp_number        TEXT,
  ai_tone                TEXT DEFAULT 'friendly' CHECK (ai_tone IN ('formal','friendly','casual','sales')),
  primary_language       TEXT DEFAULT 'en' CHECK (primary_language IN ('en','es')),
  qualification_criteria TEXT,
  escalation_rules       TEXT,
  automation_goals       TEXT,
  faqs                   JSONB NOT NULL DEFAULT '[]',
  offers                 JSONB NOT NULL DEFAULT '[]',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leads ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  instagram_handle  TEXT,
  source            TEXT NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('instagram_comment','instagram_dm','facebook','whatsapp','manual','form','other')),
  status            TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','unqualified','converted','lost')),
  stage             TEXT NOT NULL DEFAULT 'awareness'
                    CHECK (stage IN ('awareness','interest','consideration','intent','purchase','retention')),
  tags              TEXT[] NOT NULL DEFAULT '{}',
  notes             TEXT,
  qualified         BOOLEAN DEFAULT FALSE,
  assigned_to       UUID REFERENCES auth.users(id),
  conversation_id   UUID,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lead Activities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_activities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       TEXT NOT NULL
             CHECK (type IN ('note','status_change','stage_change','message_sent','message_received','call','automation')),
  content    TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ── Conversations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id            UUID REFERENCES leads(id) ON DELETE SET NULL,
  channel            TEXT NOT NULL
                     CHECK (channel IN ('instagram','facebook','whatsapp','sms','email','internal')),
  status             TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','resolved','archived','pending')),
  external_id        TEXT,
  participant_name   TEXT,
  participant_handle TEXT,
  last_message       TEXT,
  last_message_at    TIMESTAMPTZ,
  unread_count       INT NOT NULL DEFAULT 0,
  is_automated       BOOLEAN NOT NULL DEFAULT TRUE,
  automation_id      UUID,
  metadata           JSONB NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('ai','user','human_agent')),
  content         TEXT NOT NULL,
  channel         TEXT NOT NULL,
  external_id     TEXT,
  status          TEXT NOT NULL DEFAULT 'sent'
                  CHECK (status IN ('sent','delivered','read','failed')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Automations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('active','inactive','draft','paused')),
  trigger     JSONB NOT NULL DEFAULT '{}',
  actions     JSONB NOT NULL DEFAULT '[]',
  conditions  JSONB NOT NULL DEFAULT '[]',
  run_count   INT NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Automation Runs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  trigger_data  JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'running'
                CHECK (status IN ('running','completed','failed','cancelled')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  error         TEXT
);

-- ── Social Triggers ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_triggers (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_id      UUID REFERENCES automations(id) ON DELETE SET NULL,
  platform           TEXT NOT NULL CHECK (platform IN ('instagram','facebook')),
  content_type       TEXT NOT NULL DEFAULT 'any'
                     CHECK (content_type IN ('reel','post','carousel','story','any')),
  content_id         TEXT,
  keywords           TEXT[] NOT NULL DEFAULT '{}',
  response_flow_id   UUID,
  reply_comment      BOOLEAN NOT NULL DEFAULT TRUE,
  reply_dm           BOOLEAN NOT NULL DEFAULT TRUE,
  comment_reply_text TEXT,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','COP')),
  category    TEXT,
  type        TEXT NOT NULL DEFAULT 'service'
              CHECK (type IN ('product','service','package','subscription')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','draft')),
  images      TEXT[] NOT NULL DEFAULT '{}',
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id               UUID REFERENCES leads(id) ON DELETE SET NULL,
  conversation_id       UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_name         TEXT NOT NULL,
  customer_email        TEXT,
  customer_phone        TEXT,
  items                 JSONB NOT NULL DEFAULT '[]',
  subtotal              DECIMAL(12,2) NOT NULL DEFAULT 0,
  total                 DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','COP')),
  status                TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','pending','confirmed','processing','completed','cancelled')),
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method        TEXT,
  stripe_payment_intent TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Runs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  automation_id   UUID REFERENCES automations(id) ON DELETE SET NULL,
  prompt          TEXT NOT NULL,
  response        TEXT,
  model           TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used     INT NOT NULL DEFAULT 0,
  latency_ms      INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error')),
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Integrations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL
                CHECK (provider IN ('instagram','facebook','whatsapp','stripe','openai')),
  status        TEXT NOT NULL DEFAULT 'disconnected'
                CHECK (status IN ('connected','disconnected','error','pending')),
  access_token  TEXT,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('automation','lead','sale','system','error')),
  title      TEXT NOT NULL,
  body       TEXT,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_configs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_triggers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts on re-run
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- All tables: owner-only access
CREATE POLICY "profiles_own"          ON profiles          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "biz_own"               ON business_configs  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "leads_own"             ON leads             FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "convos_own"            ON conversations     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "autos_own"             ON automations       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "social_own"            ON social_triggers   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "products_own"          ON products          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "orders_own"            ON orders            FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_runs_own"           ON ai_runs           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "integrations_own"      ON integrations      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own"     ON notifications     FOR ALL USING (auth.uid() = user_id);

-- Join-based policies
CREATE POLICY "lead_activities_own" ON lead_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_activities.lead_id AND leads.user_id = auth.uid()));

CREATE POLICY "messages_own" ON messages FOR ALL
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

CREATE POLICY "auto_runs_own" ON automation_runs FOR ALL
  USING (EXISTS (SELECT 1 FROM automations WHERE automations.id = automation_runs.automation_id AND automations.user_id = auth.uid()));

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, business_name, plan, locale, currency, onboarded)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name',
    'free',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- HELPER: increment integer column safely
-- ============================================================
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER LANGUAGE sql AS $$ SELECT x + 1 $$;

-- ============================================================
-- REALTIME: enable for relevant tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE automation_runs;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_user_id       ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status        ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage         ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at    ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email         ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_instagram     ON leads(instagram_handle) WHERE instagram_handle IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_convos_user_id      ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_convos_lead_id      ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_convos_last_msg     ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_convos_external_id  ON conversations(external_id) WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_convo_id   ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created    ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_autos_user_id       ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_autos_status        ON automations(status);

CREATE INDEX IF NOT EXISTS idx_auto_runs_auto_id   ON automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS idx_auto_runs_status    ON automation_runs(status);

CREATE INDEX IF NOT EXISTS idx_social_user_id      ON social_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_social_platform     ON social_triggers(platform);

CREATE INDEX IF NOT EXISTS idx_products_user_id    ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_lead_id      ON orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment      ON orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_ai_runs_user_id     ON ai_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created     ON ai_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifs_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_read         ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================================
-- UPDATED_AT trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','business_configs','leads','conversations',
    'automations','social_triggers','products','orders','integrations'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
