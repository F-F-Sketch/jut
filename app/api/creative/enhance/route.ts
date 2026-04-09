import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MODE_DESCRIPTIONS: Record<string, string> = {
  conversion: 'conversion-focused with stronger CTA, clear offer hierarchy, urgency signals',
  luxury: 'luxury and premium feel with refined typography and elegant whitespace',
  minimal: 'clean and minimal with reduced visual noise and strong hierarchies',
  attention: 'maximum attention-grabbing with bold contrast and strong focal point',
  emotional: 'emotionally resonant with human connection and aspirational imagery',
  direct_response: 'aggressive direct response with headline-offer-CTA structure',
  brand_stronger: 'stronger brand presence while maintaining conversion elements',
  social_ad: 'optimized for social media ads with thumb-stopping first impression',
  ecommerce: 'ecommerce-optimized with product prominence and social proof cues',
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

    const { data: analysis } = await supabase
      .from('creative_analyses')
      .select('*').eq('id', analysisId).eq('user_id', user.id).single()
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })

    const systemPrompt = `You are a world-class creative optimization engine. Always respond with valid JSON only.`

    const enhancePrompt = `Based on this analysis, generate an enhancement plan.

ORIGINAL SCORES: ${JSON.stringify(analysis.scores)}
ORIGINAL INSIGHTS: ${JSON.stringify(analysis.insights)}

MODE: ${mode} â ${MODE_DESCRIPTIONS[mode]}
INTENSITY: ${intensity} â ${INTENSITY_DESCRIPTIONS[intensity]}

Return ONLY valid JSON:
{
  "directives": ["<specific instruction>"],
  "enhancement_prompt": "<detailed image prompt>",
  "improvement_summary": ["<what changed and why>"],
  "score_delta": { "attention": 0, "clarity": 0, "focus": 0, "visual_hierarchy": 0, "cta_visibility": 0, "brand_presence": 0, "readability": 0, "engagement_likelihood": 0, "conversion_likelihood": 0, "memory_recall": 0, "emotional_impact": 0, "overall": 0 },
  "key_changes": [{ "element": "", "before": "", "after": "", "reason": "" }],
  "conversion_impact": "<%>",
  "attention_impact": "<%>"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: enhancePrompt }],
      }),
    })

    if (!response.ok) throw new Error('Claude API failed')

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? '{}'
    let enhancement
    try {
      enhancement = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim())
    } catch {
      throw new Error('Failed to parse enhancement response')
    }

    const projectedScores: Record<string, number> = {}
    const originalScores = analysis.scores as Record<string, number>
    const delta = enhancement.score_delta as Record<string, number>
    for (const key of Object.keys(originalScores)) {
      projectedScores[key] = Math.min(100, Math.max(0, (originalScores[key] ?? 50) + (delta[key] ?? 0)))
    }

    const { data: saved } = await supabase
      .from('creative_enhancements')
      .insert({
        user_id: user.id, analysis_id: analysisId, mode, intensity,
        directives: enhancement.directives ?? [],
        enhancement_prompt: enhancement.enhancement_prompt ?? '',
        improvement_summary: enhancement.improvement_summary ?? [],
        score_delta: delta, status: 'completed',
      }).select().single()

    return NextResponse.json({
      ok: true,
      enhancement_id: saved?.id,
      directives: enhancement.directives,
      enhancement_prompt: enhancement.enhancement_prompt,
      improvement_summary: enhancement.improvement_summary,
      key_changes: enhancement.key_changes,
      score_delta: delta,
      projected_scores: projectedScores,
      conversion_impact: enhancement.conversion_impact,
      attention_impact: enhancement.attention_impact,
    })
  } catch (error) {
    console.error('[Creative Enhance]', error)
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 })
  }
}
