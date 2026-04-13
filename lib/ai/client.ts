// JUT AI Client Ã¢ÂÂ uses Anthropic Claude as primary model
// Falls back gracefully if API key is missing

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export const AI_MODEL = 'claude-haiku-4-5-20251001'

// Ã¢ÂÂÃ¢ÂÂ System Prompt Builder Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function buildSystemPrompt(config: BusinessConfig, locale: 'en' | 'es' = 'en'): string {
  const toneMap: Record<string, Record<string, string>> = {
    formal:   { en: 'formal, professional, and precise', es: 'formal, profesional y preciso' },
    friendly: { en: 'warm, friendly, and approachable Ã¢ÂÂ like talking to a helpful friend', es: 'cÃÂ¡lido, amigable y cercano Ã¢ÂÂ como hablar con un amigo que te ayuda' },
    casual:   { en: 'casual, relaxed, and conversational', es: 'casual, relajado y conversacional' },
    sales:    { en: 'confident, persuasive, and benefit-focused Ã¢ÂÂ a natural closer', es: 'seguro, persuasivo y enfocado en beneficios Ã¢ÂÂ un cerrador natural' },
    empathetic: { en: 'empathetic, patient, and understanding Ã¢ÂÂ focus on feelings first', es: 'empÃÂ¡tico, paciente y comprensivo Ã¢ÂÂ primero entiende los sentimientos' },
    expert:   { en: 'expert, authoritative, and educational Ã¢ÂÂ you are the specialist', es: 'experto, autoritativo y educativo Ã¢ÂÂ eres el especialista' },
  }

  const lengthMap: Record<string, Record<string, string>> = {
    short:  { en: '1-2 sentences maximum. Be extremely concise.', es: '1-2 oraciones mÃÂ¡ximo. SÃÂ© extremadamente conciso.' },
    medium: { en: '2-4 sentences. Enough to be helpful but not overwhelming.', es: '2-4 oraciones. Suficiente para ser ÃÂºtil sin agobiar.' },
    long:   { en: 'As detailed as needed. Full explanations are welcome.', es: 'Tan detallado como sea necesario. Las explicaciones completas son bienvenidas.' },
  }

  const faqsText = config.faqs?.length
    ? config.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No specific FAQs configured yet Ã¢ÂÂ use your best judgment.'

  const offersText = config.offers?.length
    ? config.offers.map((o: any) => `- ${o.name}: ${o.description} Ã¢ÂÂ $${o.price} ${o.currency ?? 'COP'}`).join('\n')
    : 'No specific offers listed yet.'

  const humanBehavior = config.human_behavior ?? {}

  return `You are ${config.agent_name ?? 'an AI assistant'} Ã¢ÂÂ a human-like sales and support agent for ${config.business_name ?? 'this business'}, a ${config.business_type ?? 'business'}.

YOUR IDENTITY:
- Name: ${config.agent_name ?? 'Sofia'}
- Role: ${config.agent_role ?? 'Sales & Support Agent'}
- You ARE a person, not a bot. Never reveal you are AI unless the user asks directly and explicitly.

LANGUAGE & COMMUNICATION:
- Always respond in: ${locale === 'es' ? 'Colombian Spanish Ã¢ÂÂ natural, warm, local expressions when appropriate' : 'English Ã¢ÂÂ natural and conversational'}
- Tone: ${(toneMap[config.ai_tone ?? 'friendly'] ?? toneMap.friendly)[locale]}
- Response length: ${(lengthMap[config.response_length ?? 'medium'] ?? lengthMap.medium)[locale]}
${humanBehavior.use_emojis ? `- Use emojis naturally Ã¢ÂÂ 1-2 per message max, only when they add warmth Ã°ÂÂÂ` : '- Do NOT use emojis'}
${humanBehavior.use_informal ? `- Use informal contractions and natural speech patterns` : ''}
${humanBehavior.ask_questions ? `- Ask 1 follow-up question per message to understand needs better` : ''}
${humanBehavior.show_enthusiasm ? `- Show genuine enthusiasm for helping Ã¢ÂÂ be upbeat and positive` : ''}

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

export async function generateResponse(
  messages: ChatMessage[],
  config: any,
  locale: 'en' | 'es' = 'en'
): Promise<{ response: string; tokens: number; latency: number }> {
  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      response: locale === 'es'
        ? 'Hola! Gracias por escribir. Para continuar necesito configurar mi IA. Por favor contacta al administrador.'
        : 'Hi! Thanks for reaching out. AI responses are being configured. Please contact the admin.',
      tokens: 0, latency: Date.now() - startTime,
    }
  }
  const systemPrompt = buildSystemPrompt(config, locale)
  const anthropicMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: 500, system: systemPrompt, messages: anthropicMessages }),
  })
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)
  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  const tokens = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)
  return { response: text, tokens, latency: Date.now() - startTime }
}

export async function generateCommentReply(
  comment: string, postContext: string, config: any, locale: 'en' | 'es' = 'en'
): Promise<string> {
  const prompt = locale === 'es'
    ? `Alguien comentÃÂ³: "${comment}". Contexto: "${postContext}". Escribe una respuesta corta (1 oraciÃÂ³n) que invite a DM por DM. Suena humano.`
    : `Someone commented: "${comment}". Post: "${postContext}". Write a short (1 sentence) reply inviting them to DM. Sound human.`
  const { response } = await generateResponse([{ role: 'user', content: prompt }], config, locale)
  return response
}

export async function analyzeLeadQualification(
  conversationHistory: ChatMessage[], criteria: string, locale: 'en' | 'es' = 'en'
): Promise<{ qualified: boolean; score: number; reason: string }> {
  const prompt = locale === 'es'
    ? `Analiza esta conversaciÃÂ³n. SegÃÂºn: "${criteria}". Responde SOLO en JSON: {"qualified":true/false,"score":0-100,"reason":""}`
    : `Analyze this conversation based on: "${criteria}". Respond ONLY in JSON: {"qualified":true/false,"score":0-100,"reason":""}`
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { qualified: false, score: 0, reason: 'API not configured' }
  const msgs = [...conversationHistory.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })), { role: 'user', content: prompt }]
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: 200, messages: msgs }),
  })
  if (!res.ok) return { qualified: false, score: 0, reason: 'Analysis failed' }
  const data = await res.json()
  const text = data.content?.[0]?.text ?? '{}'
  try { return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim()) }
  catch { return { qualified: false, score: 0, reason: 'Parse failed' } }
}

interface BusinessConfig {
  agent_name?: string; agent_role?: string; business_name: string; business_type: string
  website?: string; phone?: string; whatsapp_number?: string; instagram_handle?: string
  ai_tone: string; response_length?: string; human_behavior?: Record<string, boolean>
  qualification_criteria?: string; escalation_rules?: string; custom_instructions?: string
  faqs: any[]; offers: any[]; primary_language?: string
}
