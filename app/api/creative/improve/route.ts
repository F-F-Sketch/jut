import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { imageBase64, analysis, assetName = 'Creative' } = body

    if (!imageBase64 || !analysis) {
      return NextResponse.json({ error: 'Missing image or analysis data' }, { status: 400 })
    }

    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg')
    const scores = analysis.scores || {}
    const weakest = Object.entries(scores)
      .sort((a, b) => (a[1] as number) - (b[1] as number))
      .slice(0, 2)
      .map((e) => e[0])
      .join(', ')

    const prompt = [
      'You are a marketing creative director. Analyze this image and generate a detailed improvement plan.',
      '',
      'Current performance scores: ' + JSON.stringify(scores),
      'Weakest areas needing improvement: ' + weakest,
      'Overall score: ' + analysis.overall_score + '/100',
      '',
      'Return ONLY this JSON structure (no markdown, no backticks, no explanation):',
      '{',
      '  "priority_fixes": [',
      '    { "title": "Most important fix", "description": "Very specific actionable instruction based on what you see", "impact": 15 },',
      '    { "title": "Second fix", "description": "Specific instruction", "impact": 10 },',
      '    { "title": "Third fix", "description": "Specific instruction", "impact": 8 }',
      '  ],',
      '  "copy_suggestions": [',
      '    { "current": "Text visible in image or none detected", "suggested": "Better version of the text", "reason": "Why this converts better" },',
      '    { "current": "CTA text", "suggested": "Stronger CTA", "reason": "Creates urgency" }',
      '  ],',
      '  "design_tweaks": [',
      '    { "title": "Contrast improvement", "description": "Specific design change to make" },',
      '    { "title": "Layout adjustment", "description": "Specific layout change" },',
      '    { "title": "Color suggestion", "description": "Specific color change" }',
      '  ],',
      '  "ab_test_ideas": [',
      '    { "variant": "Test idea 1", "hypothesis": "Expected improvement" },',
      '    { "variant": "Test idea 2", "hypothesis": "Expected improvement" }',
      '  ]',
      '}',
      '',
      'IMPORTANT: Be very specific. Reference what you actually see in the image. Never be generic.',
    ].join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: rawBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic error:', errText)
      return NextResponse.json({ error: 'AI request failed: ' + response.status }, { status: 500 })
    }

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? ''

    let improvements: any
    try {
      // Strip any markdown fences
      const cleaned = rawText
        .replace(/^```json\s*/m, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON found in response')
      improvements = JSON.parse(match[0])
    } catch (e) {
      console.error('Parse error. Raw text:', rawText.slice(0, 400))
      // Return a fallback structure instead of failing
      improvements = {
        priority_fixes: [
          { title: 'Analysis complete', description: analysis.summary || 'See insights tab for detailed feedback', impact: 10 },
        ],
        copy_suggestions: [],
        design_tweaks: (analysis.improvements || []).map((imp: string) => ({ title: 'Improvement', description: imp })),
        ab_test_ideas: [],
      }
    }

    return NextResponse.json({ success: true, improvements })

  } catch (error: any) {
    console.error('Improve route error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}