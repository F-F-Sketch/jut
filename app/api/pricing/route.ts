import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const DEFAULT_PLANS = [
  { id:'free', name:'Free', price_cop:0, price_usd:0, color:'#6b7280', badge:null, highlight:false, desc:'Perfect to get started', cta:'Get Started Free',
    features:[{text:'1 active automation',included:true},{text:'100 conversations/month',included:true},{text:'1 social account',included:true},{text:'Basic AI Agent',included:true},{text:'Creative Analyzer (3/month)',included:true},{text:'Analytics dashboard',included:true},{text:'Heatmap & Focus Map',included:false},{text:'Improvement Plan',included:false},{text:'Creative Variants',included:false},{text:'WhatsApp Business',included:false},{text:'Priority support',included:false},{text:'White-label',included:false}]},
  { id:'growth', name:'Growth', price_cop:320000, price_usd:79, color:'#ED1966', badge:'Most Popular', highlight:true, desc:'For businesses ready to automate and scale', cta:'Get Growth',
    features:[{text:'20 active automations',included:true},{text:'5,000 conversations/month',included:true},{text:'3 social accounts',included:true},{text:'Advanced AI Agent',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Analytics + exports',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (10/month)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support',included:false},{text:'White-label',included:false}]},
  { id:'elite', name:'Elite', price_cop:800000, price_usd:199, color:'#C9A84C', badge:'Best Value', highlight:false, desc:'Unlimited power for agencies', cta:'Get Elite',
    features:[{text:'Unlimited automations',included:true},{text:'Unlimited conversations',included:true},{text:'Unlimited social accounts',included:true},{text:'Custom AI Agent persona',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Advanced analytics + API',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (unlimited)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support 24/7',included:true},{text:'White-label platform',included:true}]},
]

export async function GET() {
  try {
    const { data } = await sb.from('pricing_config').select('plans').eq('id', 1).single()
    if (data?.plans && Array.isArray(data.plans) && data.plans.length > 0) {
      return NextResponse.json({ plans: data.plans }, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch(e) {}
  return NextResponse.json({ plans: DEFAULT_PLANS }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const { plans } = await req.json()
  if (!plans || !Array.isArray(plans)) return NextResponse.json({ error: 'Invalid plans' }, { status: 400 })
  const { error } = await sb.from('pricing_config').upsert({ id: 1, plans, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
