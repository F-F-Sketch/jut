-- ============================================================
-- JUT — Admin, Plans, Wompi, Subscriptions Schema
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- ============================================================

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
  CHECK (role IN ('user', 'admin', 'owner'));

-- ── Plan Configurations (owner-managed) ──────────────────────
CREATE TABLE IF NOT EXISTS plan_configs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT UNIQUE NOT NULL, -- 'free', 'starter', 'growth', 'elite'
  name_en      TEXT NOT NULL,
  name_es      TEXT NOT NULL,
  price_usd    NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_cop    NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_usd_yr NUMERIC(10,2) DEFAULT 0,
  price_cop_yr NUMERIC(10,2) DEFAULT 0,
  features     JSONB NOT NULL DEFAULT '[]',
  limits       JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN DEFAULT TRUE,
  is_featured  BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Discount Codes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discounts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT UNIQUE NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'percentage'
               CHECK (type IN ('percentage','fixed_usd','fixed_cop')),
  value        NUMERIC(10,2) NOT NULL,
  applies_to   TEXT[] DEFAULT '{}',
  max_uses     INT,
  uses_count   INT DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL DEFAULT 'free',
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','cancelled','past_due','trialing','paused','free')),
  payment_provider        TEXT DEFAULT 'wompi'
                          CHECK (payment_provider IN ('wompi','stripe','manual','none')),
  provider_txn_id         TEXT,
  provider_customer_id    TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  discount_id             UUID REFERENCES discounts(id),
  amount_paid             NUMERIC(10,2),
  currency                TEXT DEFAULT 'COP',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── Admin Activity Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id       UUID NOT NULL REFERENCES auth.users(id),
  action         TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wompi Transactions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wompi_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wompi_id        TEXT UNIQUE,
  reference       TEXT UNIQUE NOT NULL,
  amount_in_cents BIGINT NOT NULL,
  currency        TEXT DEFAULT 'COP',
  status          TEXT DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','APPROVED','DECLINED','VOIDED','ERROR')),
  plan            TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Insert Default Plans ──────────────────────────────────────
INSERT INTO plan_configs (slug, name_en, name_es, price_usd, price_cop, price_usd_yr, price_cop_yr, features, limits, is_featured, sort_order)
VALUES
('free','Free','Gratis', 0, 0, 0, 0,
 '["1 cuenta de Instagram","100 conversaciones IA/mes","3 automatizaciones","Captura de leads básica"]'::jsonb,
 '{"conversations":100,"leads":500,"automations":3,"team_members":1}'::jsonb,
 false, 0),
('starter','Starter','Inicial', 49, 199000, 470, 1900000,
 '["1 cuenta de Instagram","1.000 conversaciones IA/mes","10 automatizaciones","CRM completo","Soporte por email"]'::jsonb,
 '{"conversations":1000,"leads":5000,"automations":10,"team_members":2}'::jsonb,
 false, 1),
('growth','Growth','Crecimiento', 97, 399000, 970, 3900000,
 '["3 cuentas de Instagram","5.000 conversaciones IA/mes","Automatizaciones ilimitadas","CRM + Analytics","Soporte prioritario"]'::jsonb,
 '{"conversations":5000,"leads":-1,"automations":-1,"team_members":5}'::jsonb,
 true, 2),
('elite','Elite','Élite', 297, 1190000, 2970, 11900000,
 '["Cuentas ilimitadas","Conversaciones ilimitadas","White-label","Soporte dedicado","Integraciones custom","Acceso API"]'::jsonb,
 '{"conversations":-1,"leads":-1,"automations":-1,"team_members":-1}'::jsonb,
 false, 3)
ON CONFLICT (slug) DO NOTHING;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE plan_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wompi_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_plans" ON plan_configs FOR SELECT USING (true);
CREATE POLICY "admin_all_plans" ON plan_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
);

CREATE POLICY "public_read_discounts" ON discounts FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_discounts" ON discounts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
);

CREATE POLICY "users_own_sub" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_all_subs" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
);

CREATE POLICY "admin_read_logs" ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
);
CREATE POLICY "admin_insert_logs" ON admin_logs FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "users_own_txns" ON wompi_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_all_txns" ON wompi_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
);

-- ── Set yourself as owner ─────────────────────────────────────
-- Run this separately after finding your UUID in Authentication > Users:
-- UPDATE profiles SET role = 'owner' WHERE user_id = 'YOUR-UUID-HERE';
