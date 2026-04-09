// JUT AI Client â uses Anthropic Claude as primary model
// Falls back gracefully if API key is missing

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export const AI_MODEL = 'claude-sonnet-4-6'

export function buildSystemPrompt(config: any, locale: 'en' | 'es' = 'en'): string {
  const toneMap: Record<string, Record<string, string>> = {
    formal: { en: 'formal, professional, and precise', es: 'formal, profesional y preciso' },
    friendly: { en: 'warm, friendly, and approachable', es: 'cÃ¡lido, amigable y cercano' },
    casual: { en: 'casual, relaxed, and conversational', es: 'casual, relajado y conversacional' },
    sales: { en: 'confident, persuasive, and benefit-focused', es: 'seguro, persuasivo y enfocado en beneficios' },
    empathetic: { en: 'empathetic, patient, and understanding', es: 'empÃ¡tico, paciente y comprensivo' },
    expert: { en: 'expert, authoritative, and educational', es: 'experto, autoritativo y educativo' },
  }
  const lengthMap: Record<string, Record<string, string>> = {
    short: { en: '1-2 sentences maximum.', es: '1-2 oraciones mÃ¡ximo.' },
    medium: { en: '2-4 sentences.', es: '2-4 oraciones.' },
    long: { en: 'As detailed as needed.', es: 'Tan detallado como sea necesario.' },
  }
  const faqsText = config.faqs?.length
    ? config.faqs.map((f: any) => `Q8= ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No specific FAQs configured yet.'
  const offersText = config.offers?.length
    ? config.offers.map((o: any) => `- ${o.name}: ${o.description} - $${o.price}`).join('\n')
    : 'No specific offers listed yet.'
  const humanBehavior = config.human_behavior ?? {}
  return `You are ${config.agent_name ?? 'an AI assistant'} - a human-like sales and support agent for ${config.business_name ?? 'this business'}.\n\nROLE: ${config.agent_role ?? 'Sales & Support Agent'}\n\nTONE: ${(toneMap[config.ai_tone ?? 'friendly'] ?? toneMap.friendly)[locale]}\nRESPONSE LENGTH: ${(lengthMap[config.response_length ?? 'medium'] ?? lengthMap.medium)[locale]}\nLANGUAGE: ${locale === 'es' ? 'Colombian Spanish' : 'English'}\n${humanBehavior.use_emojis ? '- Use 1-2 emojis per message' : '- No emojis'}\n${humanBehavior.ask_questions ? '- Ask 1 follow-up question per message' : ''}\n\nBUSINESS: ${config.business_name} (${config.business_type})\n${config.instagram_handle ? `Instagram: @${config.instagram_handle}` : ''}\n${config.phone ? `WhatsApp: ${config.phone}` : ''}\n\nOFFERS:\n${offersText}\n\nFAQs:\n${faqsText}\n\n${config.custom_instructions ? `SPECIAL INSTRUCTIONS:\n${config.custom_instructions}` : ''}\n\nIMPORTANT: Be human. Vary your responses. Never reveal you are AI unless asked directly.`
}

export async function generateResponse(messages: ChatMessage[], config: any, locale: 'en' | 'es' = 'en'): Promise<{ response: string; tokens: number; latency: number }> {
  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { response: locale === 'es' ? 'Hola! Para continuar necesito configurar mi IA.' : 'Hi! AI responses are being configured.', tokens: 0, latency: Date.now() - startTime }
  }
  const systemPrompt = buildSystemPrompt(config, locale)
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
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

export async function generateCommentReply(comment: string, postContext: string, config: any, locale: 'en' | 'es' = 'en'): Promise<string> {
  const prompt = locale === 'es'
    ? `Alguien comentÃ³: "${comment}". Post: "${postContext}". Escribe una respuesta corta y natural que los invite a escribirte por DM.`
    : `Sentence commented: "${comment}". Post: "${postContext}". Write a short natural reply that invites them to DM you.`
  const { response } = await generateResponse([{ role: 'user', content: prompt }], config, locale)
  return response
}

export async function analyzeLeadQualification(conversationHistory: ChatMessage[], criteria: string, locale: 'en' | 'es' = 'en'): Promise<{ qualified: boolean; score: number; reason: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { qualified: false, score: 0, reason: 'API not configured' }
  const prompt = locale === 'es'
    ? `Analiza esta conversaciÃ³n y determina si el lead estÃ¡ calificado segÃºn: "${criteria}". Responde SOLO en JSON: {"qualified": true/false, "score": 0-100, "reason": "string"}`
    : `Analyze this conversation and determine if the lead is qualified based on: "${criteria}". Respond ONLY in JSON: {"qualified": true/false, "score": 0-100, "reason": "string"}`
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
