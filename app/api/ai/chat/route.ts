import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResponse, type ChatMessage } from '@/lib/ai/client'
import type { BusinessConfig } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { messages, conversation_id, locale = 'en' } = body as { messages: ChatMessage[]; conversation_id?: string; locale?: 'en' | 'es' }

    if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: 'messages array required' }, { status: 400 })

    const { data: configData } = await supabase.from('business_configs').select('*').eq('user_id', user.id).single()
    const config = configData as BusinessConfig | null
    if (!config) return NextResponse.json({ error: 'Business config not found. Complete your Business Configuration first.' }, { status: 422 })

    const { response, tokens, latency } = await generateResponse(messages, config, locale)

    await supabase.from('ai_runs').insert({ user_id: user.id, conversation_id: conversation_id ?? null, prompt: messages[messages.length - 1]?.content ?? '', response, model: 'gpt-4o-mini', tokens_used: tokens, latency_ms: latency, status: 'success' })

    if (conversation_id) {
      await supabase.from('conversations').update({ last_message: response, last_message_at: new Date().toISOString() }).eq('id', conversation_id)
      await supabase.from('messages').insert({ conversation_id, role: 'ai', content: response, channel: 'internal', status: 'sent' })
    }

    return NextResponse.json({ response, tokens, latency })
  } catch (error) {
    console.error('[AI Chat]', error)
    return NextResponse.json({ error: 'AI response failed' }, { status: 500 })
  }
}
