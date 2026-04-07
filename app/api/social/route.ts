import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SocialTriggerSchema = z.object({
  platform: z.enum(['instagram', 'facebook']),
  content_type: z.enum(['reel', 'post', 'carousel', 'story', 'any']).default('any'),
  content_id: z.string().optional().nullable(),
  keywords: z.array(z.string()).default([]),
  reply_comment: z.boolean().default(true),
  reply_dm: z.boolean().default(true),
  comment_reply_text: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  automation_id: z.string().uuid().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('social_triggers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SocialTriggerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('social_triggers')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
