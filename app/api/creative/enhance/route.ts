import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MODE_DESCRIPTIONS: Record<string, string> = {
  conversion: 'conversion-focused with stronger CTA, clear offer hierarchy, urgency signals, and direct response principles',
  luxury: 'luxury and premium feel with refined typography, elegant whitespace, premium color palette, and high-end visual language',
  minimal: 'clean and minimal with reduced visual noise, strong hierarchy, breathing room, and essential elements only',
  attention: 'maximum attention-grabbing with bold contrast, strong focal point, and immediate visual impact',
  emotional: 'emotionally resonant with human connection, aspirational imagery guidance, and feeling-first messaging',
  direct_response: 'aggressive direct response with headline-offer-CTA structure, benefit bullets, and clear value proposition',
  brand_stronger: 'stronger brand presence while maintaining conversion elements and clear offer',
  social_ad: 'optimized for social media ads with thumb-stopping first impression, mobile-first composition, and platform best practices',
  ecommerce: 'ecommerce-optimized with product prominence, social proof cues, price/offer clarity, and buy-signal hierarchy',
}

const INTENSITY_DESCRIPTIONS: Record<string, string> = {
  light: 'subtle improvements preserving 90% of original design',
  medium: 'meaningful improvements â fix all high and medium impact issues',
  aggressive: 'significant optimization â rebuild hierarchy to maximize performance',
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { analysisId, mode = 'conversion', intensity = 'medium' } = await req.json()
    if (!analysisId) return NextResponse.json({ error: 'analysisId required' }, { status: 400 })
    const { data: analysis } = await supabase.from('creative_analyses').select('*').eq('id', analysisId).eq('user_id', user.id).single()
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    const prompt = `BasKed: ${JSON.stringify(analysis)} MODE: ${mode} INTENSITY: ${intensity} Generate enhancement plan. Return only JSON: {"directives":[],"enhancement_prompt":"","improvement_summary":[],"score_delta":{},"key_changes":[],"conversion_impact":"","attention_impact":""}`
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, system: 'You are a CRO expert. Respond with JSON only.', messages: [{ role: 'user', content: prompt }] }) })
    if (!res.ok) throw new Error('API failed')
    const aiData = await res.json()
    const raw = aiData.content?.[0]?.text ?? '{}'
    let enhancement; try { enhancement = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim()) } catch { throw new Error('Parse failed') }
    const orig = analysis.scores as Record<string,number>; const delta = enhancement.score_delta as Record<string,number>
    const proj = Object.fromEntries(Object.keys(orig).map(k => [k, Math.min(100,Math.max(0,(orig[k]??50)+(delta[k]??0)))]))
    const { data: saved } = await supabase.from('creative_enhancements').insert({ user_id: user.id, analysis_id: analysisId, mode, intensity, directives: enhancement.directives??[], enhancement_prompt: enhancement.enhancement_prompt??'', improvement_summary: enhancement.improvement_summary??[], score_delta: delta, status: 'completed' }).select().single()
    return NextResponse.json({ ok: true, enhancement_id: saved?.id, directives: enhancement.directives, enhancement_prompt: enhancement.enhancement_prompt, improvement_summary: enhancement.improvement_summary, key_changes: enhancement.key_changes, score_delta: delta, projected_scores: proj, conversion_impact: enhancement.conversion_impact, attention_impact: enhancement.attention_impact })
  } catch (error) { return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 }) }
}
