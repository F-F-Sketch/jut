import { createClient } from '@supabase/supabase-js'
import LandingClient from './LandingClient'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getConfig() {
  try {
    const { data } = await sb.from('landing_config').select('config').eq('id', '00000000-0000-0000-0000-000000000001').single()
    if (data?.config) return data.config
  } catch(e) {}
  // Default config
  return {
    hero: {
      headline: 'Automate Every Conversation.',
      subheadline: 'JUT connects to Instagram, WhatsApp and more — capturing leads and closing deals while you sleep.',
      cta_primary: 'Get Started Free',
      cta_secondary: 'See how it works',
      bg_color: '#050508',
    },
    features: {
      title: 'Everything you need to automate',
      items: [
        { icon: '🤖', title: 'AI Agent', desc: '24/7 automated responses that sound 100% human' },
        { icon: '⚡', title: 'Automations', desc: 'Set triggers, fire flows instantly' },
        { icon: '📊', title: 'Analytics', desc: 'Real-time insights on every conversation' },
        { icon: '🎨', title: 'Creative AI', desc: 'Score and improve your marketing creatives' },
      ]
    },
    stats: { items: [{ value:'<3s', label:'Response time' },{ value:'24/7', label:'Always on' },{ value:'2×', label:'Conversion uplift' },{ value:'∞', label:'Conversations' }] },
    cta: { title:'Ready to automate?', subtitle:'Start free. Scale fast.', button:"Get Started — It's Free" },
    colors: { primary:'#ED1966', text:'#f0f0fc', bg:'#050508' },
    fonts: { headline:'Syne', body:'DM Sans' },
  }
}

export default async function Page({ params }: { params: { locale: string } }) {
  const config = await getConfig()
  return <LandingClient config={config} locale={params.locale} />
}
