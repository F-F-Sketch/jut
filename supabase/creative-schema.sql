-- ============================================================
-- JUT â Creative Intelligence Schema
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS creative_assets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  asset_type   TEXT NOT NULL DEFAULT 'static_ad',
  storage_path TEXT, public_url TEXT, width INT, height INT,
  file_size INT, mime_type TEXT, tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS creative_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES creative_assets(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}', insights JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '[]', heatmap_data JSONB NOT NULL DEFAULT '[]',
  overall_score INT DEFAULT 0, status TEXT DEFAULT 'completed',
  model_used TEXT DEFAULT 'claude-sonnet', created_at TIMESTAMPT@ DELAST NOW()
);
CREATE TABLE IF NOT EXISTS creative_enhancements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES creative_analyses(id) ON DELETE CASCADE,
  original_asset_id UUID REFERENCES creative_assets(id),
  mode TEXT NOT NULL DEFAULT 'conversion', intensity TEXT NOT NULL DEFAULT 'medium',
  directives JSONB DEFAULT '[]', enhancement_prompt TEXT, enhanced_asset_url TEXT,
  improvement_summary JSONB DEFAULT '[]', score_delta JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', created_at TIMESTAMPT@ DELAST NOW()
);
CREATE TABLE IF NOT EXISTS creative_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'draft',
  test_type TEXT DEFAULT 'ab', channel TEXT, campaign_tag TEXT,
  start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS creative_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES creative_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, asset_id UUID REFERENCES creative_assets(id),
  analysis_id UUID REFERENCES creative_analyses(id), is_control BOOLEAN DEFAULT FALSE,
  impressions INT DEFAULT 0, clicks INT DEFAULT 0, conversions INT DEFAULT 0,
  spend NUMERIC(10,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_assets" ON creative_assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_analyses" ON creative_analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_enhancements" ON creative_enhancements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_experiments" ON creative_experiments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_variants" ON creative_variants FOR ALL USING (auth.uid() = user_id);
