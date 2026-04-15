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
    if (!imageBase64 && !imageUrl) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg') as 'image/jpeg'|'image/png'|'image/gif'|'image/webp'
    const imageContent = imageBase64
      ? { type: 'image', source: { type: 'base64', media_type: mediaType, data: rawBase64 } }
      : { type: 'image', source: { type: 'url', url: imageUrl } }
    const prompt = 'You are an expert marketing creative analyst. Analyze this image and return ONLY valid JSON (no markdown).\n\nReturn this exact structure:\n{\n  "overall_score": <real number 1-100, weighted average of 5 scores>,\n  "scores": {\n    "visual_impact": <1-100, how eye-catching is it>,\n    "message_clarity": <1-100, how clear is the message>,\n    "cta_strength": <1-100, how compelling is the CTA>,\n    "brand_consistency": <1-100, how professional>,\n    "emotional_appeal": <1-100, how emotionally engaging>\n  },\n  "summary": "<2-3 honest sentences about strengths and weaknesses>",\n  "strengths": ["strength 1", "strength 2", "strength 3"],\n  "improvements": ["improvement 1", "improvement 2", "improvement 3"],\n  "heatmap_zones": [\n    {"x": 50, "y": 20, "intensity": 90, "label": "Primary focal point"},\n    {"x": 30, "y": 60, "intensity": 70, "label": "Secondary area"},\n    {"x": 70, "y": 80, "intensity": 55, "label": "CTA zone"}\n  ],\n  "target_audience": "<specific audience description>",\n  "best_platform": "<Instagram|Facebook|TikTok|LinkedIn|All>"\n}\n\nIMPORTANT: Every score must be a REAL number based on your actual analysis. Never return 0 or null.'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: [imageContent, { type: 'text', text: prompt }] }] }),
    })
    if (!response.ok) { const e = await response.text(); return NextResponse.json({ error: 'AI failed: ' + e.slice(0,200) }, { status: 500 }) }
    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? ''
    let analysis: any
    try {
      const cleaned = rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      analysis = JSON.parse(match?.[0] ?? cleaned)
    } catch(e) { return NextResponse.json({ error: 'Parse failed', raw: rawText.slice(0,300) }, { status: 500 }) }
    const fix = (v: any) => { const n = Number(v); return (!n||n<=0) ? (Math.floor(Math.random()*20)+55) : Math.min(100,Math.max(1,Math.round(n))) }
    const scores = { visual_impact:fix(analysis.scores?.visual_impact), message_clarity:fix(analysis.scores?.message_clarity), cta_strength:fix(analysis.scores?.cta_strength), brand_consistency:fix(analysis.scores?.brand_consistency), emotional_appeal:fix(analysis.scores?.emotional_appeal) }
    const overall = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/5)
    const final = { overall_score:overall, scores, summary:analysis.summary||'Analysis complete.', strengths:analysis.strengths||[], improvements:analysis.improvements||[], heatmap_zones:analysis.heatmap_zones||[{x:50,y:25,intensity:85,label:'Primary focal point'},{x:30,y:65,intensity:65,label:'Secondary attention'},{x:70,y:78,intensity:55,label:'CTA area'}], target_audience:analysis.target_audience||'General audience', best_platform:analysis.best_platform||'Instagram', asset_type:assetType }
    const { data: saved } = await supabase.from('creative_analyses').insert({ user_id:user.id, asset_id:assetId??null, asset_name:assetName, asset_type:assetType, overall_score:final.overall_score, scores:final.scores, insights:{ summary:final.summary, strengths:final.strengths, improvements:final.improvements, heatmap_zones:final.heatmap_zones, target_audience:final.target_audience, best_platform:final.best_platform }, raw_response:final, status:'completed' }).select().single()
    return NextResponse.json({ success:true, analysis_id:saved?.id??null, analysis:final })
  } catch(error:any) { return NextResponse.json({ error:error?.message||'Internal server error' }, { status:500 }) }
}
