import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
    const { imageBase64, analysis, improvements, assetType='static_ad' } = await req.json()
    if (!imageBase64 || !analysis) return NextResponse.json({ error:'Missing data' }, { status:400 })
    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg')
    const scores = analysis.scores || {}
    const weakest = Object.entries(scores).sort((a:any,b:any)=>a[1]-b[1]).slice(0,2).map((e:any)=>e[0]).join(', ')
    const improvList = (improvements?.priority_fixes||[]).slice(0,3).map((f:any)=>f.title).join('; ')

    const prompt = [
      'You are a world-class creative director. Analyze this '+assetType+' and generate 4 COMPLETELY DIFFERENT redesign concepts.',
      'Current weaknesses: '+weakest,
      'Key changes needed: '+(improvList||analysis.improvements?.slice(0,3).join('; ')||'improve visual impact and clarity'),
      '',
      'Return ONLY valid JSON (no markdown):',
      '{"variants":[',
      '  {',
      '    "name":"Variant name",',
      '    "strategy":"One-word strategy tag",',
      '    "headline":"New powerful headline max 7 words",',
      '    "subtext":"Supporting copy max 10 words",',
      '    "cta":"Strong action CTA max 3 words",',
      '    "description":"What was redesigned and why this works better",',
      '    "changes":["change1","change2","change3"],',
      '    "score":85,',
      '    "bg1":"#hexcolor",',
      '    "bg2":"#hexcolor",',
      '    "ctaColor":"#hexcolor",',
      '    "cssFilter":"contrast(1.3) saturate(1.4) brightness(1.1)",',
      '    "overlayColor":"rgba(R,G,B,0.25)",',
      '    "overlayBlend":"multiply",',
      '    "cropZoom":1.1,',
      '    "cropX":0,',
      '    "cropY":-0.05',
      '  }',
      ']}',
      '',
      'Variants must use these 4 different design strategies:',
      '1. HIGH CONTRAST: Boost contrast dramatically, saturate colors, zoom in on hero element. Use bold warm overlay.',
      '2. CLEAN MINIMAL: Desaturate to near-monochrome, strong vignette, crop tight on main subject. Minimalist copy.',
      '3. WARM EMOTIONAL: Warm golden tones, soft blur on edges, emotional benefit-driven copy. Human connection.',
      '4. URGENCY: Cool dark tones, high contrast, sharp crop. Urgency-focused copy with strong CTA.',
      '',
      'For cssFilter: use valid CSS filter values like contrast(), saturate(), brightness(), hue-rotate(), blur()',
      'For overlayBlend: use multiply, screen, overlay, soft-light, or hard-light',
      'For cropZoom: 1.0=no zoom, 1.2=20% zoom in, etc.',
      'For cropX/cropY: -0.1 to 0.1 offset from center',
      'Make each variant VISUALLY DISTINCT. The image should look different, not just have text changed.',
    ].join('\n')

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:2500,messages:[{role:'user',content:[
        {type:'image',source:{type:'base64',media_type:mediaType,data:rawBase64}},
        {type:'text',text:prompt}
      ]}]}),
    })
    if (!resp.ok) { const e=await resp.text(); return NextResponse.json({error:'AI failed: '+e.slice(0,200)},{status:500}) }
    const aiData = await resp.json()
    const raw = aiData.content?.[0]?.text??''
    let result: any
    try {
      const cleaned=raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const match=cleaned.match(/\{[\s\S]*\}/)
      result=JSON.parse(match?.[0]??cleaned)
    } catch(e) {
      result={variants:[
        {name:'High Contrast',strategy:'Bold',headline:'Stop Scrolling. Buy Now.',subtext:'Limited offer ends today',cta:'Shop Now',description:'Maximum contrast and saturation to grab attention',changes:['Boost contrast 1.4x','Saturate colors','Bold CTA'],score:80,bg1:'#ED1966',bg2:'#b0124e',ctaColor:'#ffffff',cssFilter:'contrast(1.4) saturate(1.5) brightness(1.05)',overlayColor:'rgba(237,25,102,0.2)',overlayBlend:'multiply',cropZoom:1.1,cropX:0,cropY:-0.05},
        {name:'Clean Minimal',strategy:'Minimal',headline:'Less noise. More results.',subtext:'Simple powerful effective',cta:'Learn More',description:'Stripped-back monochrome treatment focuses on product',changes:['Desaturate','Strong vignette','Minimal copy'],score:76,bg1:'#1a1a2a',bg2:'#0a0a14',ctaColor:'#ED1966',cssFilter:'saturate(0.3) contrast(1.2) brightness(0.95)',overlayColor:'rgba(0,0,0,0.35)',overlayBlend:'overlay',cropZoom:1.05,cropX:0.02,cropY:0},
        {name:'Warm Emotional',strategy:'Emotional',headline:'Made for people like you.',subtext:'Join thousands who chose better',cta:'Join Now',description:'Warm golden tones create emotional connection',changes:['Warm tones','Soft vignette','Benefit copy'],score:78,bg1:'#C9A84C',bg2:'#8B6914',ctaColor:'#ffffff',cssFilter:'sepia(0.4) saturate(1.3) brightness(1.08) hue-rotate(-10deg)',overlayColor:'rgba(201,168,76,0.25)',overlayBlend:'soft-light',cropZoom:1.08,cropX:-0.03,cropY:0.02},
        {name:'Direct Urgency',strategy:'Urgency',headline:'Only 3 spots left.',subtext:'Offer expires at midnight',cta:'Claim Yours',description:'Cool urgent treatment drives immediate action',changes:['Dark cool tones','Sharp crop','Urgency CTA'],score:82,bg1:'#1a2a3a',bg2:'#0a1a2a',ctaColor:'#f59e0b',cssFilter:'contrast(1.3) saturate(0.8) brightness(0.9) hue-rotate(180deg)',overlayColor:'rgba(33,82,164,0.3)',overlayBlend:'multiply',cropZoom:1.15,cropX:0.05,cropY:-0.08},
      ]}
    }
    return NextResponse.json({success:true, variants:result.variants||result})
  } catch(e:any) { return NextResponse.json({error:e?.message||'Internal error'},{status:500}) }
}