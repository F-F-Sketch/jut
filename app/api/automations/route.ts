import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const AutomationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(['active','inactive','draft','paused']).default('draft'),
  trigger: z.object({ type: z.string(), platform: z.string().optional(), keywords: z.array(z.string()).optional(), content_type: z.string().optional(), post_id: z.string().optional() }),
  actions: z.array(z.object({ id: z.string(), type: z.string(), order: z.number(), config: z.record(z.unknown()), delay_seconds: z.number().optional() })).default([]),
  conditions: z.array(z.object({ id: z.string(), field: z.string(), operator: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) })).default([]),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('automations').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = AutomationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.from('automations').insert({ ...parsed.data, user_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
