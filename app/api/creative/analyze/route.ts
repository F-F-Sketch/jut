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
    if (!imageBase64 && !imageUrl) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    const imageContent = imageBase64
      ? { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } }
      : { type: 'image', source: { type: 'url', url: imageUrl } }
    const analysisPrompt = `Analyze this marketing creative and return ONLY a JSON object with this structure:
    {"overall_score":<0-100>,"scores":{"visual_impact":<0-100>,"message_clarity":<0-100>,"cta_strength":<0-100>,"brand_consistency":<0-100>,"emotional_appeal":<0-100>},"summary":"<assessment>","strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"heatmap_zones":[{"x":<0-100>,"y":<0-100>,"intensity":<0-100>,"label":"<zone>"}],"target_audience":"<desc>","best_platform":"<platform>"}
    Return ONLY valid JSON, no markdown.`
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: [imageContent, { type: 'text', text: analysisPrompt }] }] }),
    })
    if (!response.ok) { const err = await response.text(); return NextResponse.json({ error: 'AI analysis failed: ' + response.status + ' ' + err.slice(0,200) }, { status: 500 }) }
    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? ''
    let analysis
    try { const m = rawText.match(/\{[\s\S]*\}/); analysis = JSON.parse(m?.[0] ?? rawText) }
    catch { return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText.slice(0,200) }, { status: 500 }) }
    const { data: saved } = await supabase.from('creative_analyses').insert({
      user_id: user.id, asset_id: assetId ?? null, asset_name: assetName, asset_type: assetType,
      overall_score: analysis.overall_score ?? 0, scores: analysis.scores ?? {},
      insights: { summary: analysis.summary, strengths: analysis.strengths, improvements: analysis.improvements, heatmap_zones: analysis.heatmap_zones, target_audience: analysis.target_audience, best_platform: analysis.best_platform },
      raw_response: analysis, status: 'completed',
    }).select().single()
    return NextResponse.json({ success: true, analysis_id: saved?.id, analysis })
  } catch (error) {
    console.error('Creative analyze error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}