import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { customer_name, customer_email, customer_phone, items, currency = 'USD', lead_id, conversation_id, notes } = body

  if (!customer_name || !items?.length) return NextResponse.json({ error: 'customer_name and items required' }, { status: 400 })

  const subtotal = items.reduce((s: number, i: { total: number }) => s + i.total, 0)
  const total = subtotal // add tax logic here later

  const { data, error } = await supabase.from('orders').insert({
    user_id: user.id, lead_id, conversation_id, customer_name, customer_email, customer_phone,
    items, subtotal, total, currency, status: 'pending', payment_status: 'pending', notes,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
