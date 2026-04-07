import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) query = query.eq('read', false)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { ids, read = true } = body as { ids?: string[]; read?: boolean }

  // Mark specific or all notifications as read
  let query = supabase.from('notifications').update({ read }).eq('user_id', user.id)
  if (ids?.length) query = query.in('id', ids)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  // Internal: create a notification for a user
  // Used by automation executor and webhooks
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, title, body: msgBody, action_url, metadata } = body

  if (!type || !title) return NextResponse.json({ error: 'type and title required' }, { status: 400 })

  const { data, error } = await supabase.from('notifications').insert({
    user_id: user.id,
    type,
    title,
    body: msgBody,
    action_url,
    metadata: metadata ?? {},
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
