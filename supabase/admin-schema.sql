-- ============================================================
-- JUT â Admin, Plans, Wompi, Subscriptions Schema
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- ============================================================

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
  CHECK (role IN ('user', 'admin', 'owner'));

-- ââ Plan Configurations (owner-managed) ââââââââââââââââââââââ
CREATE TABLE IF NOT EXISTS plan_configs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT UNIQUE NOT NULL,
  name_en      TEXT NOT NULL, name_es TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0, price_cop NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_usd_yr NUMERIC(10,2) DEFAULT 0, price_cop_yr NUMERIC(10,2) DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]', limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE, is_featured BOOLEAN DEFAULT FALSE, sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPT@ DELAST NOW()
);
CREATE TABLE IF NOT EXISTS discounts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), code TEXT UNIQUE NOT NULL, description TEXT, type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage','fixed_usd','fixed_cop')), value NUMERIC(10,2) NOT NULL, applies_to TEXT[] DEFAULT '{}', max_uses INT, uses_count INT DEFAULT 0, expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT TRUE, created_by UUID REFERENCES auth.users(id), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS subscriptions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, plan TEXT NOT NULL DEFAULT 'free', status TEXT NOT NULL DEFAULT 'active', payment_provider TEXT DEFAULT 'wompi', provider_txn_id TEXT, current_period_start TIMESTAMPTZ, current_period_end TIMESTAMPTZ, discount_id UUID REFERENCES discounts(id), amount_paid NUMERIC(10,2), currency TEXT DEFAULT 'COP', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPT@ DELAST NOW());
CREATE TABLE IF NOT EXISTS wompi_transactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, wompi_id TEXT UNIQUE, user_refTEXT UNIQUE NOT NULL, amount_in_cents BIGINT NOT NULL, currency TEXT DEFAULT 'COP', status TEXT DEFAULT 'PENDING', plan TEXT, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPT@ DELAST NOW());
Insert into plan_configs (slug,name_en,name_es,price_usd,price_cop,price_usd_yr,price_cop_yr,features,limits,is_featured,sort_order)
Values('free','Free','Gratis',0,0,0,0,'["100 AI conversations"]'::jsonb,'{"conversations":100}'::jsonb,false,0),
('starter','Starter','Inicial',49,199000,470,1900000,'["1,000 conversations","10 automations"]'::jsonb,'{"conversations":1000,"automations":10}'::jsonb,false,1),
('growth','Growth','Crecimiento',97,399000,970,3900000,'["5,000 conversations","Unlimited automations"]'::jsonb,'{"conversations":5000,"automations":-1}'::jsonb,true,2),
('elite','Elite','Elite',297,1190000,2970,11900000,'["Unlimited everything"]'::jsonb,'{"conversations":-1,"automations":-1}'::jsonb,false,3)
ON CONFLICT (slug) DO NOTHING;
ALTER TABLE plan_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wompi_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_plans" ON plan_configs FOR SELECT USING (true);
CREATE POLICY "users_own_sub" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Set yourself as owner: UPDATE profiles SET role = 'owner' WHERE user_id = 'YOUR-UUID-HERE';
