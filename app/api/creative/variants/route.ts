import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { imageBase64, analysis, improvements } = body
    if (!imageBase64 || !analysis) return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg')
    const weakest = Object.entries(analysis.scores||{}).sort((a:any,b:any)=>a[1]-b[1]).slice(0,2).map((e:any)=>e[0]).join(', ')
    const improvList = (improvements?.priority_fixes||[]).slice(0,3).map((f:any)=>f.title).join('; ')
    const prompt = [
      'You are a world-class marketing creative director. Analyze this creative and generate 4 distinct redesign variants that each apply different improvement strategies.',
      '',
      'Current scores: ' + JSON.stringify(analysis.scores),
      'Weakest areas: ' + weakest,
      'Key improvements needed: ' + (improvList||analysis.improvements?.slice(0,3).join('; ')||'visual impact, clarity'),
      '',
      'Return ONLY valid JSON (no markdown):',
      '{',
      '  "variants": [',
      '    {',
      '      "name": "Variant name (e.g. Bold & Direct)",',
      '      "strategy": "Strategy tag (e.g. High Contrast)",',
      '      "description": "What was changed and why",',
      '      "headline": "New compelling headline text (max 8 words)",',
      '      "subtext": "Supporting text (max 12 words)",',
      '      "cta": "Strong CTA text (max 4 words)",',
      '      "bg1": "#hexcolor1 (for gradient start)",',
      '      "bg2": "#hexcolor2 (for gradient end)",',
      '      "ctaColor": "#hexcolor for CTA button",',
      '      "score": estimated_score_1_to_100,',
      '      "changes": ["change 1", "change 2", "change 3"]',
      '    }',
      '  ]',
      '}',
      '',
      'Generate exactly 4 variants with these strategies:',
      '1. High Contrast — maximize visual impact with bold colors',
      '2. Clean & Minimal — strip clutter, focus on single message',
      '3. Emotional — lead with emotion and benefit',
      '4. Direct Response — optimize for conversion with urgency',
      '',
      'Make each variant genuinely different. Use colors that complement the original branding.',
    ].join('\n')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: rawBase64 } }, { type: 'text', text: prompt }] }] }),
    })
    if (!response.ok) { const e = await response.text(); return NextResponse.json({ error: 'AI failed: ' + e.slice(0,200) }, { status: 500 }) }
    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text ?? ''
    let result: any
    try {
      const cleaned = rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      result = JSON.parse(match?.[0] ?? cleaned)
    } catch(e) {
      result = { variants: [
        { name:'High Contrast', strategy:'Bold Colors', description:'Maximized visual contrast for impact', headline:'Transform Your Results', subtext:'Start automating today', cta:'Get Started', bg1:'#ED1966', bg2:'#b0124e', ctaColor:'#ffffff', score:78, changes:['Bold colors','Stronger CTA','Cleaner layout'] },
        { name:'Clean Minimal', strategy:'Minimalist', description:'Removed clutter, focused message', headline:'Automate Everything', subtext:'Simple powerful effective', cta:'Try Free', bg1:'#0e0e16', bg2:'#1a1a2a', ctaColor:'#ED1966', score:75, changes:['Removed noise','Single focus','White space'] },
        { name:'Emotional', strategy:'Benefit-Led', description:'Led with emotional benefit', headline:'Never Miss a Lead', subtext:'Your business on autopilot', cta:'Start Now', bg1:'#2152A4', bg2:'#0e2a5c', ctaColor:'#22c55e', score:72, changes:['Emotional hook','Benefit focused','Trust signal'] },
        { name:'Direct Response', strategy:'Urgency', description:'Optimized for immediate action', headline:'Limited: Free Month', subtext:'Offer ends soon — act now', cta:'Claim Offer', bg1:'#1a1a2a', bg2:'#2a1a1a', ctaColor:'#f59e0b', score:80, changes:['Urgency added','Social proof','Risk reversal'] },
      ]}
    }
    return NextResponse.json({ success: true, variants: result.variants || result })
  } catch(error: any) { return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 }) }
}