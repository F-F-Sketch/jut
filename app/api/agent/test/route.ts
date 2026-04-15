import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, agent, history = [] } = await req.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    // Load all knowledge docs for this user
    const { data: docs } = await sb.from('knowledge_docs').select('name,type,content').eq('user_id', user.id).eq('status', 'active').limit(20)
    const knowledgeBase = (docs || []).map(d => '=== ' + d.name + ' (' + d.type + ') ===\n' + d.content).join('\n\n')

    const systemPrompt = [
      'You are ' + (agent.name || 'an AI assistant') + ', ' + (agent.role || 'a helpful sales and support agent') + '.',
      'You work for ' + (agent.business_name || 'this business') + (agent.business_type ? ' (' + agent.business_type + ')' : '') + '.',
      '',
      'PERSONALITY:',
      '- Tone: ' + (agent.tone || 'friendly'),
      '- Response length: ' + (agent.response_length || 'medium'),
      '- Traits: ' + (agent.personality_traits || []).join(', '),
      '- Primary language: ' + (agent.language || 'en'),
      '',
      agent.knowledge ? 'KNOWLEDGE BASE (text):\n' + agent.knowledge : '',
      knowledgeBase ? 'UPLOADED DOCUMENTS:\n' + knowledgeBase.slice(0, 8000) : '',
      agent.offers ? 'ACTIVE OFFERS:\n' + agent.offers : '',
      agent.rules ? 'RULES & BOUNDARIES:\n' + agent.rules : '',
      '',
      'Always respond in the language the user writes in.',
      'Be concise and helpful. Respond as a ' + (agent.tone || 'friendly') + ' agent.',
    ].filter(Boolean).join('\n')

    const messages = [
      ...history.slice(-6).map((m: any) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.msg })),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, system: systemPrompt, messages })
    })

    if (!res.ok) {
      const e = await res.text()
      return NextResponse.json({ error: 'AI failed: ' + e.slice(0, 200) }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json({ reply: data.content?.[0]?.text || 'No response generated.' })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}