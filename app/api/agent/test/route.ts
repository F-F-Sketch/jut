import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
    const { message, agent, history = [], agent_id } = await req.json()
    if (!message) return NextResponse.json({ error:'No message' }, { status:400 })

    // If agent_id provided, load from DB, else use passed agent config
    let agentConfig = agent
    if (agent_id) {
      const { data } = await sb.from('agents').select('*').eq('id', agent_id).eq('user_id', user.id).single()
      if (data) agentConfig = data
    }

    // Load knowledge docs
    const docIds = agentConfig?.knowledge_doc_ids || []
    let knowledgeBase = ''
    if (docIds.length > 0) {
      const { data: docs } = await sb.from('knowledge_docs').select('name,type,content').in('id', docIds).limit(10)
      knowledgeBase = (docs||[]).map((d:any) => '=== ' + d.name + ' ===\n' + d.content).join('\n\n')
    } else {
      const { data: docs } = await sb.from('knowledge_docs').select('name,type,content').eq('user_id', user.id).eq('status','active').limit(10)
      knowledgeBase = (docs||[]).map((d:any) => '=== ' + d.name + ' ===\n' + d.content).join('\n\n')
    }

    const systemPrompt = [
      'You are ' + (agentConfig?.name||'an AI assistant') + ', ' + (agentConfig?.role||'a helpful agent') + '.',
      agentConfig?.business_name ? 'You work for ' + agentConfig.business_name + '.' : '',
      'AGENT TYPE: ' + (agentConfig?.type || 'general'),
      'TONE: ' + (agentConfig?.tone || 'friendly'),
      'RESPONSE LENGTH: ' + (agentConfig?.response_length || 'medium'),
      agentConfig?.knowledge ? 'KNOWLEDGE:\n' + agentConfig.knowledge : '',
      knowledgeBase ? 'DOCUMENTS:\n' + knowledgeBase.slice(0,8000) : '',
      agentConfig?.offers ? 'OFFERS:\n' + agentConfig.offers : '',
      agentConfig?.rules ? 'RULES:\n' + agentConfig.rules : '',
      'Respond in the same language as the user.',
    ].filter(Boolean).join('\n')

    const messages = [
      ...history.slice(-6).map((m:any) => ({ role: m.role==='agent'?'assistant':'user', content: m.msg })),
      { role:'user', content: message }
    ]
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:1000, system:systemPrompt, messages })
    })
    if (!res.ok) { const e=await res.text(); return NextResponse.json({error:'AI failed: '+e.slice(0,200)},{status:500}) }
    const data = await res.json()
    return NextResponse.json({ reply: data.content?.[0]?.text || 'No response.' })
  } catch(e:any) { return NextResponse.json({ error: e.message }, { status:500 }) }
}