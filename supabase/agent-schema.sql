-- Run this in Supabase SQL Editor to add AI Agent config fields

ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS agent_name TEXT DEFAULT 'Sofia';
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS agent_role TEXT DEFAULT 'Sales & Support Agent';
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS agent_avatar TEXT DEFAULT '🤖';
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS response_length TEXT DEFAULT 'medium';
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS human_behavior JSONB DEFAULT '{"use_emojis":true,"use_informal":true,"ask_questions":true,"show_enthusiasm":true,"vary_greetings":true,"acknowledge_emotions":true}';
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
