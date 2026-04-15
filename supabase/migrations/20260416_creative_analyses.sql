-- Creative analyses table with full schema
CREATE TABLE IF NOT EXISTS creative_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NULL,
  asset_name TEXT DEFAULT 'Creative',
  asset_type TEXT DEFAULT 'static_ad',
  overall_score INTEGER DEFAULT 0,
  scores JSONB DEFAULT '{}',
  insights JSONB DEFAULT '{}',
  raw_response JSONB DEFAULT '{}',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_analyses" ON creative_analyses;
CREATE POLICY "own_analyses" ON creative_analyses FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_creative_analyses_user ON creative_analyses(user_id, created_at DESC);
