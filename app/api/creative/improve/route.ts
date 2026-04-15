import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { imageBase64, analysis, assetName = 'Creative' } = body
    if (!imageBase64 || !analysis) return NextResponse.json({ error: 'Missing image or analysis' }, { status: 400 })
    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg') as 'image/jpeg'|'image/png'|'image/gif'|'image/webp'
    const scores = analysis.scores || {}
    const weakest = Object.entries(scores).sort((a:any,b:any) => a[1]-b[1]).slice(0,2).map((e:any)=>e[0]).join(', ')
    const prompt = 'You are an expert marketing creative director. Look at this creative and the analysis scores, then generate a detailed improvement plan.\n\nCurrent scores: ' + JSON.stringify(scores) + '\nWeakest areas: ' + weakest + '\nOverall score: ' + analysis.overall_score + '\n\nReturn ONLY valid JSON (no markdown):\n{\n  "priority_fixes": [\n    { "title": "Fix title", "description": "Specific actionable fix", "impact": 12 },\n    { "title": "Fix title 2", "description": "Specific actionable fix", "impact": 8 }\n  ],\n  "copy_suggestions": [\n    { "current": "Current text if visible", "suggested": "Better version", "reason": "Why this works better" }\n  ],\n  "design_tweaks": [\n    { "title": "Tweak name", "description": "Specific design improvement" },\n    { "title": "Tweak name 2", "description": "Another specific improvement" }\n  ],\n  "ab_test_ideas": [\n    { "variant": "Variant A idea", "hypothesis": "Why it might perform better" }\n  ]\n}\n\nBe very specific and actionable. Base everything on what you actually see in the image.'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2500, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: rawBase64 } }, { type: 'text', text: prompt }] }] }),
    })
    if (!response.ok) { const e = await response.text(); return NextResponse.json({ error: 'AI failed: ' + e.slice(0,200) }, { status: 500 }) }
    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? ''
    let improvements: any
    try {
      const cleaned = rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      improvements = JSON.parse(match?.[0] ?? cleaned)
    } catch(e) { return NextResponse.json({ error: 'Parse failed', raw: rawText.slice(0,300) }, { status: 500 }) }
    return NextResponse.json({ success: true, improvements })
  } catch(error: any) { return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 }) }
}