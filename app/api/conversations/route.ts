import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const channel = searchParams.get('channel')

  let query = supabase.from('conversations').select('*, messages(id, role, content, created_at)', { count: 'exact' }).eq('user_id', user.id).order('last_message_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (channel) query = query.eq('channel', channel)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { lead_id, channel = 'internal', participant_name, participant_handle } = body

  const { data, error } = await supabase.from('conversations').insert({
    user_id: user.id, lead_id, channel, participant_name, participant_handle,
    status: 'active', is_automated: false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
