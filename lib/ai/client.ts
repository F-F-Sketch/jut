// JUT AI Client â uses Anthropic Claude as primary model
// Falls back gracefully if API key is missing

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export const AI_MODEL = 'claude-sonnet-4-6'

// ââ System Prompt Builder ââââââââââââââââââââââââââââââââââââââ
export function buildSystemPrompt(config: BusinessConfig, locale: 'en' | 'es' = 'en'): string {
  const toneMap: Record<string, Record<string, string>> = {
    formal:   { en: 'formal, professional, and precise', es: 'formal, profesional y preciso' },
    friendly: { en: 'warm, friendly, and approachable â like talking to a helpful friend', es: 'cÃ¡lido, amigable y cercano â como hablar con un amigo que te ayuda' },
    casual:   { en: 'casual, relaxed, and conversational', es: 'casual, relajado y conversacional' },
    sales:    { en: 'confident, persuasive, and benefit-focused â a natural closer', es: 'seguro, persuasivo y enfocado en beneficios â un cerrador natural' },
    empathetic: { en: 'empathetic, patient, and understanding â focus on feelings first', es: 'empÃ¡tico, paciente y comprensivo â primero entiende los sentimientos' },
    expert:   { en: 'expert, authoritative, and educational â you are the specialist', es: 'experto, autoritativo y educativo â eres el especialista' },
  }

  const lengthMap: Record<string, Record<string, string>> = {
    short:  { en: '1-2 sentences maximum. Be extremely concise.', es: '1-2 oraciones mÃ¡ximo. SÃ© extremadamente conciso.' },
    medium: { en: '2-4 sentences. Enough to be helpful but not overwhelming.', es: '2-4 oraciones. Suficiente para ser Ãºtil sin agobiar.' },
    long:   { en: 'As detailed as needed. Full explanations are welcome.', es: 'Tan detallado como sea necesario. Las explicaciones completas son bienvenidas.' },
  }

  const faqsText = config.faqs?.length
    ? config.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No specific FAQs configured yet â use your best judgment.'

  const offersText = config.offers?.length
    ? config.offers.map((o: any) => `- ${o.name}: ${o.description} â $${o.price} ${o.currency ?? 'COP'}`).join('\n')
    : 'No specific offers listed yet.'

  const humanBehavior = config.human_behavior ?? {}

  return `You are ${config.agent_name ?? 'an AI assistant'} â a human-like sales and support agent for ${config.business_name ?? 'this business'}, a ${config.business_type ?? 'business'}.

YOUR IDENTITY:
- Name: ${config.agent_name ?? 'Sofia'}
- Role: ${config.agent_role ?? 'Sales & Support Agent'}
- You ARE a person, not a bot. Never reveal you are AI unless the user asks directly and explicitly.

LANGUAGE & COMMUNICATION:
- Always respond in: ${locale === 'es' ? 'Colombian Spanish â natural, warm, local expressions when appropriate' : 'English â natural and conversational'}
- Tone: ${(toneMap[config.ai_tone ?? 'friendly'] ?? toneMap.friendly)[locale]}
- Response length: ${(lengthMap[config.response_length ?? 'medium'] ?? lengthMap.medium)[locale]}
${humanBehavior.use_emojis ? `- Use emojis naturally â 1-2 per message max, only when they add warmth ð` : '- Do NOT use emojis'}
${humanBehavior.use_informal ? `- Use informal contractions and natural speech patterns` : ''}
${humanBehavior.ask_questions ? `- Ask 1 follow-up question per message to understand needs better` : ''}
${humanBehavior.show_enthusiasm ? `- Show genuine enthusiasm for helping â be upbeat and positive` : ''}

BEHAVIOR RULES:
- Never make up prices, dates, or information not listed below
- If you don't know something, say "let me check on that and get back to you"
- Always guide the conversation toward understanding the client's needs
- After 2-3 messages, try to qualify the lead and understand their intent
- If the conversation seems ready, invite them to take action naturally
${config.qualification_criteria ? `- Qualify leads by checking: ${config.qualification_criteria}` : ''}
${config.escalation_rules ? `- Escalate to human when: ${config.escalation_rules}` : ''}
${config.custom_instructions ? `\nSPECIAL INSTRUCTIONS:\n${config.custom_instructions}` : ''}

BUSINESS INFORMATION:
Name: ${config.business_name}
Type: ${config.business_type}
${config.website ? `Website: ${config.website}` : ''}
${config.phone ? `Phone/WhatsApp: ${config.phone}` : ''}
${config.instagram_handle ? `Instagram: @${config.instagram_handle}` : ''}

OUR OFFERS & SERVICES:
${offersText}

KNOWLEDGE BASE (FAQs):
${faqsText}

IMPORTANT: Be human. Vary your responses. Don't repeat the same phrases. Sound natural.`
}

// ââ Main Response Generator ââââââââââââââââââââââââââââââââââââ
export async function generateResponse(
  messages: ChatMessage[],
  config: any,
  locale: 'en' | 'es' = 'en'
): Promise<{ response: string; tokens: number; latency: number }> {
  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { response: locale === 'es' ? 'Hola! ð Gracias por escribir. Para continuar necesito configurar mi IA.' : 'Hi! Thanks for reaching out. AI responses are being configured.', tokens: 0, latency: Date.now() - startTime }
  }
  const systemPrompt = buildSystemPrompt(config, locale)
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: AI_MODEL, max_tokens: 500, system: systemPrompt, messages: anthropicMessages }) })
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)
  const data = await response.json()
  return { response: data.content?.[0]?.text ?? '', tokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0), latency: Date.now() - startTime }
}

export async function generateCommentReply(comment: string, postContext: string, config: any, locale: 'en' | 'es' = 'en'): Promise<string> {
  const prompt = locale === 'es' ? `Alguien comentÃ³ en tu publicaciÃ³n: "${comment}". Contexto del post: "${postContext}". Escribe una respuesta pÃºblica corta (1 oraciÃ³n) que sea natural y los invite a escribirte por DM. Suena humano.` : `Someone commented on your post: "${comment}". Post context: "${postContext}". Write a short (1 sentence) public reply that feels natural.`
  const { response } = await generateResponse([{ role: 'user', content: prompt }], config, locale)
  return response
}

export async function analyzeLeadQualification(conversationHistory: ChatMessage[], criteria: string, locale: 'en' | 'es' = 'en'): Promise<{ qualified: boolean; score: number; reason: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { qualified: false, score: 0, reason: 'API not configured' }
  const prompt = locale === 'es' ? `Analiza esta conversaciÃ³n y determina si el lead estÃ¡ calificado segÃºn: "${criteria}". Responde SOLO en JSON: {"qualified": true/false, "score": 0-100, "reason": "breve explicaciÃ³n"}` : `Analyze this conversation and determine if the lead is qualified based on: "${criteria}". Respond ONLY in JSON: {"qualified": true/false, "score": 0-100, "reason": "brief explanation"}`
  const msgs = [...conversationHistory.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })), { role: 'user', content: prompt }]
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: AI_MODEL, max_tokens: 200, messages: msgs }) })
  if (!res.ok) return { qualified: false, score: 0, reason: 'Analysis failed' }
  const data = await res.json()
  try { return JSON.parse(data.content?.[0]?.text ?? '{}') } catch { return { qualified: false, score: 0, reason: 'Parse failed' } }
}

interface BusinessConfig {
  agent_name?: string; agent_role?: string; business_name: string; business_type: string; website?: string; phone?: string; whatsapp_number?: string; instagram_handle?: string; ai_tone: string; response_length?: string; human_behavior?: Record<string, boolean>; qualification_criteria?: string; escalation_rules?: string; custom_instructions?: string; faqs: any[]; offers: any[]; primary_language?: string
}
