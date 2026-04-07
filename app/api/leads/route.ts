import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LeadSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  instagram_handle: z.string().optional().nullable(),
  source: z.enum(['instagram_comment','instagram_dm','facebook','whatsapp','manual','form','other']).default('manual'),
  status: z.enum(['new','contacted','qualified','unqualified','converted','lost']).default('new'),
  stage: z.enum(['awareness','interest','consideration','intent','purchase','retention']).default('awareness'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  let query = supabase.from('leads').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,instagram_handle.ilike.%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, limit, total_pages: Math.ceil((count ?? 0) / limit) })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.from('leads').insert({ ...parsed.data, user_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
