import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { data } = await sb.from('agents').select('*').eq('user_id', user.id).order('created_at')
  return NextResponse.json({ agents: data || [] })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await req.json()
  const { data, error } = await sb.from('agents').insert({
    user_id: user.id, ...body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status:500 })
  return NextResponse.json({ agent: data })
}

export async function PUT(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id, ...body } = await req.json()
  const { data, error } = await sb.from('agents').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status:500 })
  return NextResponse.json({ agent: data })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id } = await req.json()
  await sb.from('agents').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}