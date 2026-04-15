import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const { data } = await sb.from('landing_config').select('*').eq('id', '00000000-0000-0000-0000-000000000001').single()
  if (!data) {
    // Return default config
    return NextResponse.json({ config: getDefaultConfig() })
  }
  return NextResponse.json({ config: data.config || getDefaultConfig() })
}

export async function POST(req: NextRequest) {
  const { config } = await req.json()
  await sb.from('landing_config').upsert({ id: '00000000-0000-0000-0000-000000000001', config, updated_at: new Date().toISOString() })
  return NextResponse.json({ success: true })
}

function getDefaultConfig() {
  return {
    hero: {
      headline: 'Automate Every Conversation.',
      subheadline: 'JUT connects to Instagram, WhatsApp and more Ã¢ÂÂ capturing leads and closing deals while you sleep.',
      cta_primary: 'Get Started Free',
      cta_secondary: 'See how it works',
      bg_color: '#050508',
    },
    features: {
      title: 'Everything you need to automate',
      items: [
        { icon: 'Ã°ÂÂ¤Â', title: 'AI Agent', desc: '24/7 automated responses that sound 100% human' },
        { icon: 'Ã¢ÂÂ¡', title: 'Automations', desc: 'Set triggers, fire flows instantly' },
        { icon: 'Ã°ÂÂÂ', title: 'Analytics', desc: 'Real-time insights on every conversation' },
        { icon: 'Ã°ÂÂÂ¨', title: 'Creative AI', desc: 'Score and improve your marketing creatives' },
      ]
    },
    stats: {
      items: [
        { value: '<3s', label: 'Response time' },
        { value: '24/7', label: 'Always on' },
        { value: '2ÃÂ', label: 'Conversion uplift' },
        { value: 'Ã¢ÂÂ', label: 'Conversations' },
      ]
    },
    cta: {
      title: 'Ready to automate?',
      subtitle: 'Start free. Scale fast.',
      button: 'Get Started Free',
    },
    navbar: {
      logo: 'JUT',
      links: ['Features', 'Pricing', 'Blog'],
    },
    colors: {
      primary: '#ED1966',
      text: '#f0f0fc',
      bg: '#050508',
    },
    fonts: {
      headline: 'Syne',
      body: 'DM Sans',
    }
  }
}
