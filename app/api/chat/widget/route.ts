import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { message, widget_key, agent_id, history = [], visitor_id } = await req.json()
    if (!message || !widget_key) return NextResponse.json({ error:'Missing params' }, { status:400 })

    // Get widget config by key
    const { data: widget } = await sb.from('widget_configs').select('*').eq('widget_key', widget_key).eq('status','active').single()
    if (!widget) return NextResponse.json({ error:'Invalid widget key' }, { status:401 })

    // Get the specific agent (or default agent for this account)
    let agent: any = null
    if (agent_id) {
      const { data } = await sb.from('agents').select('*').eq('id', agent_id).eq('user_id', widget.user_id).single()
      agent = data
    }
    if (!agent) {
      // Use router to pick best agent, or fall back to default
      const { data: agents } = await sb.from('agents').select('*').eq('user_id', widget.user_id).eq('status','active')
      if (agents && agents.length > 0) {
        agent = await routeToAgent(message, agents)
      }
    }
    if (!agent) return NextResponse.json({ error:'No active agents configured' }, { status:404 })

    // Get knowledge docs for this agent
    const { data: docs } = await sb.from('knowledge_docs').select('name,type,content').eq('user_id', widget.user_id).in('id', agent.knowledge_doc_ids || []).limit(10)
    const knowledgeBase = (docs || []).map((d:any) => '=== ' + d.name + ' ===\n' + d.content).join('\n\n')

    const systemPrompt = buildSystemPrompt(agent, knowledgeBase, widget)

    const msgs = [
      ...history.slice(-8).map((m:any) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.msg })),
      { role:'user', content: message }
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:800, system:systemPrompt, messages:msgs })
    })
    const data = await res.json()
    const reply = data.content?.[0]?.text || 'Could not generate response.'

    // Save conversation
    await sb.from('chat_sessions').upsert({
      id: visitor_id || crypto.randomUUID(),
      user_id: widget.user_id,
      widget_key,
      agent_id: agent.id,
      last_message: message,
      last_reply: reply,
      message_count: (history.length + 2),
      updated_at: new Date().toISOString(),
    }, { onConflict:'id' })

    return NextResponse.json({ reply, agent_name: agent.name, agent_id: agent.id }, {
      headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' }
    })
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status:500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' } })
}

async function routeToAgent(message: string, agents: any[]): Promise<any> {
  if (agents.length === 1) return agents[0]
  // Simple keyword routing first (fast, no API call)
  const msg = message.toLowerCase()
  const salesKw = ['precio','price','buy','comprar','costo','cost','plan','oferta','descuento','discount','pagar','pay','quiero','want']
  const supportKw = ['problema','problem','error','no funciona','not working','ayuda','help','soporte','support','falla','bug','cancelar']
  const infoKw = ['como','how','que','what','cuando','when','donde','where','informacion','info']
  const salesAgent = agents.find(a => a.type === 'sales')
  const supportAgent = agents.find(a => a.type === 'support')
  const infoAgent = agents.find(a => a.type === 'info')
  if (salesKw.some(k => msg.includes(k)) && salesAgent) return salesAgent
  if (supportKw.some(k => msg.includes(k)) && supportAgent) return supportAgent
  if (infoKw.some(k => msg.includes(k)) && infoAgent) return infoAgent
  // Default to first agent or sales
  return salesAgent || agents[0]
}

function buildSystemPrompt(agent: any, knowledge: string, widget: any): string {
  return [
    'You are ' + agent.name + ', ' + (agent.role || 'a helpful assistant') + '.',
    agent.business_name ? 'You work for ' + agent.business_name + '.' : '',
    '',
    'AGENT TYPE: ' + (agent.type || 'general'),
    'TONE: ' + (agent.tone || 'friendly'),
    'RESPONSE LENGTH: ' + (agent.response_length || 'medium') + '. Keep responses concise for chat.',
    '',
    agent.knowledge ? 'KNOWLEDGE:\n' + agent.knowledge : '',
    knowledge ? 'DOCUMENTS:\n' + knowledge.slice(0, 6000) : '',
    agent.offers ? 'CURRENT OFFERS:\n' + agent.offers : '',
    agent.rules ? 'RULES:\n' + agent.rules : '',
    '',
    'WIDGET CONTEXT: You are embedded as a chat widget on a website.',
    'Be helpful, concise, and guide visitors toward conversion.',
    'If you cannot answer, politely say you will connect them with a human.',
    'Respond in the same language as the user.',
  ].filter(Boolean).join('\n')
}