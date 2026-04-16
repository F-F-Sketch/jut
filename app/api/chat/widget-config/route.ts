import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { data } = await sb.from('widget_configs').select('*').eq('user_id', user.id).single()
  return NextResponse.json({ config: data })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await req.json()
  const widget_key = 'jut_wk_' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b=>b.toString(16).padStart(2,'0')).join('')
  const { data, error } = await sb.from('widget_configs').upsert({
    user_id: user.id, widget_key, ...body, status:'active',
    updated_at: new Date().toISOString(),
  }, { onConflict:'user_id' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status:500 })
  return NextResponse.json({ config: data })
}