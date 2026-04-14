-- Platform settings (brand, CSS, SEO)
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  brand JSONB DEFAULT '{}',
  custom_css TEXT DEFAULT '',
  seo JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON platform_settings FOR ALL USING (auth.uid() = user_id);

-- Landing page builder config
CREATE TABLE IF NOT EXISTS landing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  blocks JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own landing" ON landing_config FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand', 'brand', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone can view brand assets" ON storage.objects FOR SELECT USING (bucket_id = 'brand');
CREATE POLICY "Users can upload their brand assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand' AND auth.uid()::text = (storage.foldername(name))[1]);
