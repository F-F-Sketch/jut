CREATE TABLE IF NOT EXISTS pricing_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  plans JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only" ON pricing_config FOR ALL USING (true);
INSERT INTO pricing_config (id, plans) VALUES (1, '[]') ON CONFLICT (id) DO NOTHING;
