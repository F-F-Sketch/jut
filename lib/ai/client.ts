import OpenAI from 'openai'
import type { BusinessConfig } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const AI_MODEL = 'gpt-4o-mini'

// ── System Prompt Builder ─────────────────────────────────────

export function buildSystemPrompt(config: BusinessConfig, locale: 'en' | 'es' = 'en'): string {
  const toneMap = {
    formal: locale === 'es' ? 'formal y profesional' : 'formal and professional',
    friendly: locale === 'es' ? 'amigable y cálido' : 'friendly and warm',
    casual: locale === 'es' ? 'casual y relajado' : 'casual and relaxed',
    sales: locale === 'es' ? 'orientado a ventas y persuasivo' : 'sales-focused and persuasive',
  }

  const faqsText = config.faqs?.length
    ? config.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No FAQs configured yet.'

  const offersText = config.offers?.length
    ? config.offers
        .map((o) => `- ${o.name}: ${o.description} — $${o.price} ${o.currency}`)
        .join('\n')
    : 'No offers configured yet.'

  return `You are a sales and support AI agent for ${config.business_name}, a ${config.business_type} business.

IMPORTANT RULES:
- Respond ONLY in ${locale === 'es' ? 'Spanish (Colombian, natural and friendly)' : 'English'}.
- Your tone is ${toneMap[config.ai_tone]}.
- Keep responses concise — 1-3 sentences max unless more is needed.
- Never mention you are an AI unless directly and explicitly asked.
- Always guide the conversation toward the business goals.
- If someone asks something you don't know, say you'll check and get back to them.
- Never make up prices or offers not listed below.

BUSINESS INFORMATION:
Name: ${config.business_name}
Type: ${config.business_type}
${config.website ? `Website: ${config.website}` : ''}
${config.phone ? `Phone: ${config.phone}` : ''}
${config.whatsapp_number ? `WhatsApp: ${config.whatsapp_number}` : ''}

OFFERS & SERVICES:
${offersText}

FREQUENTLY ASKED QUESTIONS:
${faqsText}

${config.qualification_criteria ? `LEAD QUALIFICATION CRITERIA:\n${config.qualification_criteria}` : ''}

${config.escalation_rules ? `ESCALATION RULES:\n${config.escalation_rules}` : ''}

${config.automation_goals ? `YOUR GOALS:\n${config.automation_goals}` : ''}`
}

// ── Chat Completion ───────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateResponse(
  messages: ChatMessage[],
  businessConfig: BusinessConfig,
  locale: 'en' | 'es' = 'en'
): Promise<{ response: string; tokens: number; latency: number }> {
  const startTime = Date.now()

  const systemPrompt = buildSystemPrompt(businessConfig, locale)
  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: fullMessages,
    max_tokens: 500,
    temperature: 0.75,
  })

  const latency = Date.now() - startTime
  const response = completion.choices[0]?.message?.content ?? ''
  const tokens = completion.usage?.total_tokens ?? 0

  return { response, tokens, latency }
}

// ── Comment Reply Generator ───────────────────────────────────

export async function generateCommentReply(
  comment: string,
  postContext: string,
  businessConfig: BusinessConfig,
  locale: 'en' | 'es' = 'en'
): Promise<string> {
  const prompt =
    locale === 'es'
      ? `Alguien comentó en tu publicación de Instagram: "${comment}". El contexto del post es: "${postContext}". Escribe una respuesta de comentario pública, corta (máximo 1 oración), amigable y que invite a que te escriban por DM para más información. No menciones precios.`
      : `Someone commented on your Instagram post: "${comment}". Post context: "${postContext}". Write a short (1 sentence max) public comment reply that's friendly and invites them to DM you for more info. Don't mention prices.`

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(businessConfig, locale) },
      { role: 'user', content: prompt },
    ],
    max_tokens: 100,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content ?? ''
}

// ── Lead Qualification Analyzer ───────────────────────────────

export async function analyzeLeadQualification(
  conversationHistory: ChatMessage[],
  criteria: string,
  locale: 'en' | 'es' = 'en'
): Promise<{ qualified: boolean; score: number; reason: string }> {
  const prompt =
    locale === 'es'
      ? `Analiza esta conversación y determina si el lead está calificado según estos criterios: "${criteria}". Responde SOLO en JSON: {"qualified": true/false, "score": 0-100, "reason": "breve explicación"}`
      : `Analyze this conversation and determine if the lead is qualified based on these criteria: "${criteria}". Respond ONLY in JSON: {"qualified": true/false, "score": 0-100, "reason": "brief explanation"}`

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [...conversationHistory, { role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  try {
    return JSON.parse(raw)
  } catch {
    return { qualified: false, score: 0, reason: 'Analysis failed' }
  }
}
