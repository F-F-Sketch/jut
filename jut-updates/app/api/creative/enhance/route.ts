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
  light: 'subtle improvements preserving 90% of original design — only fix the critical weaknesses',
  medium: 'meaningful improvements — fix all high and medium impact issues while maintaining the creative direction',
  aggressive: 'significant optimization — rebuild the hierarchy and composition to maximize performance while preserving the core concept',
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { analysisId, imageBase64, mode = 'conversion', intensity = 'medium' } = await req.json()

    if (!analysisId) return NextResponse.json({ error: 'analysisId required' }, { status: 400 })

    // Get the original analysis
    const { data: analysis } = await supabase
      .from('creative_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })

    const systemPrompt = `You are a world-class creative optimization engine for JUT. You generate precise, commercially-driven enhancement plans for marketing creatives. You think like a conversion rate optimization expert + senior art director combined. Always respond with valid JSON only.`

    const enhancePrompt = `Based on this creative analysis, generate a detailed enhancement plan.

ORIGINAL SCORES: ${JSON.stringify(analysis.scores)}
ORIGINAL INSIGHTS: ${JSON.stringify(analysis.insights)}
ORIGINAL WEAKNESSES: ${JSON.stringify((analysis.recommendations as any[]).filter((r: any) => r.impact === 'high').slice(0, 5))}

ENHANCEMENT MODE: ${mode} — ${MODE_DESCRIPTIONS[mode]}
INTENSITY: ${intensity} — ${INTENSITY_DESCRIPTIONS[intensity]}

Generate an enhancement plan that would produce an optimized version of this creative.

Return ONLY valid JSON:
{
  "directives": [
    "<specific instruction 1 for the designer/AI>",
    "<specific instruction 2>",
    "<specific instruction 3>",
    ...
  ],
  "enhancement_prompt": "<detailed image generation prompt that would create the enhanced version — describe exactly what the improved creative should look like, every element, composition, hierarchy, colors, typography, CTA treatment>",
  "improvement_summary": [
    "<what specifically changed and why — user-friendly explanation 1>",
    "<what specifically changed and why — user-friendly explanation 2>",
    ...
  ],
  "score_delta": {
    "attention": <expected point improvement, can be negative>,
    "clarity": <expected point improvement>,
    "focus": <expected point improvement>,
    "visual_hierarchy": <expected point improvement>,
    "cta_visibility": <expected point improvement>,
    "brand_presence": <expected point improvement>,
    "readability": <expected point improvement>,
    "engagement_likelihood": <expected point improvement>,
    "conversion_likelihood": <expected point improvement>,
    "memory_recall": <expected point improvement>,
    "emotional_impact": <expected point improvement>,
    "overall": <expected overall improvement>
  },
  "key_changes": [
    {
      "element": "<element name>",
      "before": "<what it was>",
      "after": "<what it becomes>",
      "reason": "<why this improves performance>"
    }
  ],
  "conversion_impact": "<predicted % improvement in conversion likelihood>",
  "attention_impact": "<predicted % improvement in attention capture>"
}

Generate 8-15 specific directives. Be precise, not generic. Think like the world's best CRO expert.`

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

    // Calculate projected scores
    const projectedScores: Record<string, number> = {}
    const originalScores = analysis.scores as Record<string, number>
    const delta = enhancement.score_delta as Record<string, number>

    for (const key of Object.keys(originalScores)) {
      projectedScores[key] = Math.min(100, Math.max(0, (originalScores[key] ?? 50) + (delta[key] ?? 0)))
    }

    // Save enhancement
    const { data: saved } = await supabase
      .from('creative_enhancements')
      .insert({
        user_id: user.id,
        analysis_id: analysisId,
        mode,
        intensity,
        directives: enhancement.directives ?? [],
        enhancement_prompt: enhancement.enhancement_prompt ?? '',
        improvement_summary: enhancement.improvement_summary ?? [],
        score_delta: delta,
        status: 'completed',
      })
      .select()
      .single()

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
