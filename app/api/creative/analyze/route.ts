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

    const { imageBase64, imageUrl, assetType = 'static_ad', assetName = 'Creative', assetId } = await req.json()

    if (!imageBase64 && !imageUrl) return NextResponse.json({ error: 'imageBase64 or imageUrl required' }, { status: 400 })

    const imageContent = imageBase64
      ? { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } }
      : { type: 'image', source: { type: 'url', url: imageUrl } }

    const analysisPrompt = `Analyze this ${assetType.replace('_', ' ')} creative in extreme detail. Be specific, insightful, and commercially useful.

Return ONLY valid JSON:
{"scores":{"attention":<0>,"clarity":<0>,"focus":<0>,"visual_hierarchy":<0>,"cta_visibility":<0>,"brand_presence":<0>,"readability":<0>,"engagement_likelihood":<0>,"conversion_likelihood":<0>,"memory_recall":<0>,"emotional_impact":<0>},"overall_score":<0>,"insights":{"focal_point":"","cta_assessment":"","visual_noise":"","typography":"","composition":"","offer_clarity":"","brand_assessment":"","overall_feel":""},"summary":"","top_strength":"","top_weakness":"","recommendations":[],"heatmap_zones":[]}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-6', max_tokens: 4000,
        system: 'You are a world-class creative strategist and AI design analyst. Always respond with valid JSON only.',
        messages: [{ role: 'user', content: [imageContent, { type: 'text', text: analysisPrompt }] }],
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? '{}'

    let analysis
    try { analysis = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim()) }
    catch { return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 }) }

    const { data: saved } = await supabase.from('creative_analyses').insert({
      user_id: user.id, asset_id: assetId ?? null,
      scores: analysis.scores,
      insights: { ...analysis.insights, summary: analysis.summary, top_strength: analysis.top_strength, top_weakness: analysis.top_weakness },
      recommendations: analysis.recommendations ?? [],
      heatmap_data: analysis.heatmap_zones ?? [],
      overall_score: analysis.overall_score ?? 0, status: 'completed', model_used: 'claude-opus-4-6',
    }).select().single()

    return NextResponse.json({ ok: true, analysis_id: saved?.id, ...analysis })
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
