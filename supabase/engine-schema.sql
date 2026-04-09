-- JUT Engine Schema -- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS automation_runs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE, trigger_data JSONB NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'running', steps_executed INT DEFAULT 0, steps_failed INT DEFAULT 0, lead_id UUID REFERENCES leads(id), error TEXT, started_at TIMESTAMPT@ DELAST NOW(), completed_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'ai' CHECK (role IN ('user','ai','system')), content TEXT NOT NULL, channel TEXT DEFAULT 'instagram_dm', status TEXT DEFAULT 'sent', metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS business_configs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, business_name TEXT, business_type TEXT, website TEXT, phone TEXT, email TEXT, country TEXT DEFAULT 'CO', timezone TEXT DEFAULT 'America/Bogota', instagram_handle TEXT, whatsapp_number TEXT, ai_tone TEXT DEFAULT 'friendly', primary_language TEXT DEFAULT 'es', qualification_criteria TEXT, escalation_rules TEXT, automation_goals TEXT, faqs JSONB NOT NULL DEFAULT '[]', offers JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPT@ DELAST NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS user_webhooks (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, name TEXT NOT NULL, url TEXT NOT NULL, events TEXT[] NOT NULL DEFAULT '{}', secret TEXT, is_active BOOLEAN DEFAULT TRUE, last_fired TIMESTAMPTZ, fire_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE automations ADD COLUMN IF NOT EXISTS trigger JSONB NOT NULL DEFAULT '{}';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS actions JSONB NOT NULL DEFAULT '[]';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS run_count INT DEFAULT 0;
ALTER TABLE business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_config" ON business_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_runs" ON automation_runs FOR ALL USING (EXISTS (SELECT 1 FROM automations WHERE id = automation_id AND user_id = auth.uid()));
CREATE POLICY "users_own_messages" ON messages FOR ALL USING (EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "users_own_webhooks" ON user_webhooks FOR ALL USING (auth.uid() = user_id);
