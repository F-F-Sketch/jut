import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { imageBase64, imageUrl, assetType = 'static_ad', assetName = 'Creative', assetId } = body

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'imageBase64 or imageUrl required' }, { status: 400 })
    }

    const imageContent = imageBase64
      ? { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } }
      : { type: 'image', source: { type: 'url', url: imageUrl } }

    const systemPrompt = `You are a world-class creative strategist, conversion optimization expert, and AI design analyst for JUT — an AI-powered commercial operations platform. 

You analyze marketing creatives with extreme depth and precision. You think like a senior direct-response copywriter, a conversion rate optimization specialist, and a visual design expert combined.

Always respond with valid JSON only. No markdown, no prose outside the JSON.`

    const analysisPrompt = `Analyze this ${assetType.replace('_', ' ')} creative in extreme detail. Be specific, insightful, and commercially useful.

Return ONLY valid JSON with this exact structure:
{
  "scores": {
    "attention": <0-100>,
    "clarity": <0-100>,
    "focus": <0-100>,
    "visual_hierarchy": <0-100>,
    "cta_visibility": <0-100>,
    "brand_presence": <0-100>,
    "readability": <0-100>,
    "engagement_likelihood": <0-100>,
    "conversion_likelihood": <0-100>,
    "memory_recall": <0-100>,
    "emotional_impact": <0-100>
  },
  "overall_score": <0-100 weighted composite>,
  "insights": {
    "focal_point": "<what draws the eye first and whether it is correct>",
    "cta_assessment": "<is the CTA visible, strong, placed correctly>",
    "visual_noise": "<is there too much clutter or competing elements>",
    "typography": "<readability, font choices, hierarchy of text>",
    "composition": "<overall layout balance and visual flow>",
    "offer_clarity": "<how quickly and clearly the offer is understood>",
    "brand_assessment": "<brand presence: too weak, balanced, or too dominant>",
    "overall_feel": "<premium, cluttered, generic, high-converting, confusing — be specific>"
  },
  "summary": "<2-3 sentence expert summary of this creative's strengths and biggest opportunity>",
  "top_strength": "<single biggest strength>",
  "top_weakness": "<single biggest weakness>",
  "recommendations": [
    {
      "id": "r1",
      "category": "<visual_hierarchy|conversion|messaging|cta|layout|typography|color|branding|emotional|ad_performance>",
      "impact": "<high|medium|low>",
      "what_is_wrong": "<specific problem>",
      "why_it_matters": "<commercial reason>",
      "what_to_change": "<specific actionable change>",
      "expected_effect": "<measurable expected improvement>"
    }
  ],
  "heatmap_zones": [
    {
      "x": <0-100 percent from left>,
      "y": <0-100 percent from top>,
      "width": <0-50 percent width>,
      "height": <0-50 percent height>,
      "intensity": <0-1>,
      "label": "<what this element is>",
      "priority": <1-5 where 1 is highest attention>
    }
  ]
}

Generate 6-10 specific recommendations ordered by impact (high first).
Generate 5-8 heatmap zones representing where attention actually goes.
Be commercially brutal and specific. Not generic. Real insights only.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              imageContent,
              { type: 'text', text: analysisPrompt },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Creative Analyze] Claude API error:', err)
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? '{}'

    let analysis
    try {
      analysis = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim())
    } catch {
      console.error('[Creative Analyze] JSON parse failed:', rawText.slice(0, 200))
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Save to DB
    const { data: saved, error: dbError } = await supabase
      .from('creative_analyses')
      .insert({
        user_id: user.id,
        asset_id: assetId ?? null,
        scores: analysis.scores,
        insights: { ...analysis.insights, summary: analysis.summary, top_strength: analysis.top_strength, top_weakness: analysis.top_weakness },
        recommendations: analysis.recommendations ?? [],
        heatmap_data: analysis.heatmap_zones ?? [],
        overall_score: analysis.overall_score ?? 0,
        status: 'completed',
        model_used: 'claude-opus-4-6',
      })
      .select()
      .single()

    if (dbError) console.error('[Creative Analyze] DB error:', dbError)

    return NextResponse.json({
      ok: true,
      analysis_id: saved?.id,
      ...analysis,
    })
  } catch (error) {
    console.error('[Creative Analyze]', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
