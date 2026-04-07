import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const pattern = `%${q}%`

  const [leadsRes, convosRes, autosRes, productsRes] = await Promise.all([
    supabase
      .from('leads')
      .select('id, full_name, email, instagram_handle, status, source')
      .eq('user_id', user.id)
      .or(`full_name.ilike.${pattern},email.ilike.${pattern},instagram_handle.ilike.${pattern}`)
      .limit(5),

    supabase
      .from('conversations')
      .select('id, participant_name, participant_handle, channel, last_message, status')
      .eq('user_id', user.id)
      .or(`participant_name.ilike.${pattern},participant_handle.ilike.${pattern},last_message.ilike.${pattern}`)
      .limit(5),

    supabase
      .from('automations')
      .select('id, name, description, status, trigger')
      .eq('user_id', user.id)
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(3),

    supabase
      .from('products')
      .select('id, name, description, price, currency, type, status')
      .eq('user_id', user.id)
      .or(`name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
      .limit(3),
  ])

  const results = [
    ...(leadsRes.data ?? []).map(item => ({
      type: 'lead' as const,
      id: item.id,
      title: item.full_name,
      subtitle: item.email ?? item.instagram_handle ?? item.source,
      meta: item.status,
      url: `/leads/${item.id}`,
    })),
    ...(convosRes.data ?? []).map(item => ({
      type: 'conversation' as const,
      id: item.id,
      title: item.participant_name ?? item.participant_handle ?? 'Unknown',
      subtitle: item.last_message ?? item.channel,
      meta: item.status,
      url: `/conversations/${item.id}`,
    })),
    ...(autosRes.data ?? []).map(item => ({
      type: 'automation' as const,
      id: item.id,
      title: item.name,
      subtitle: item.description ?? (item.trigger as { type: string })?.type,
      meta: item.status,
      url: `/automations/${item.id}`,
    })),
    ...(productsRes.data ?? []).map(item => ({
      type: 'product' as const,
      id: item.id,
      title: item.name,
      subtitle: item.description ?? item.type,
      meta: `${item.currency} ${item.price}`,
      url: `/sales`,
    })),
  ]

  return NextResponse.json({ results, query: q })
}
