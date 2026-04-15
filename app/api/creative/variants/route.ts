import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

// Image generation providers
async function generateWithDallE(prompt: string, apiKey: string): Promise<string|null> {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+apiKey },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      }),
    })
    const data = await res.json()
    if (data.error) { console.error('DALL-E error:', data.error.message); return null }
    return data.data?.[0]?.url || null
  } catch(e) { console.error('DALL-E exception:', e); return null }
}

async function generateWithStableDiffusion(prompt: string, apiKey: string): Promise<string|null> {
  try {
    // Using Stability AI API
    const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+apiKey, 'Accept':'application/json' },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }, { text: 'blurry, low quality, watermark, text overlay, ugly, distorted', weight: -1 }],
        cfg_scale: 7,
        height: 1024, width: 1024,
        steps: 30, samples: 1,
      }),
    })
    const data = await res.json()
    if (!res.ok) { console.error('SD error:', data); return null }
    const b64 = data.artifacts?.[0]?.base64
    return b64 ? 'data:image/png;base64,'+b64 : null
  } catch(e) { console.error('SD exception:', e); return null }
}

async function generateWithReplicate(prompt: string, apiKey: string): Promise<string|null> {
  try {
    // SDXL via Replicate
    const res = await fetch('https://api.replicate.com/v1/models/stability-ai/sdxl/predictions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+apiKey },
      body: JSON.stringify({
        input: { prompt, negative_prompt:'blurry, low quality, watermark, text overlay', width:1024, height:1024, num_inference_steps:30 }
      }),
    })
    const pred = await res.json()
    if (pred.error) { console.error('Replicate error:', pred.error); return null }
    // Poll for result
    let result = pred
    let attempts = 0
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000))
      const pollRes = await fetch('https://api.replicate.com/v1/predictions/'+result.id, {
        headers:{'Authorization':'Bearer '+apiKey}
      })
      result = await pollRes.json()
      attempts++
    }
    return result.output?.[0] || null
  } catch(e) { console.error('Replicate exception:', e); return null }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

    const { imageBase64, analysis, improvements, assetType='static_ad' } = await req.json()
    if (!imageBase64 || !analysis) return NextResponse.json({ error:'Missing data' }, { status:400 })

    const openaiKey = process.env.OPENAI_API_KEY
    const stabilityKey = process.env.STABILITY_API_KEY
    const replicateKey = process.env.REPLICATE_API_KEY

    const hasImageGen = openaiKey || stabilityKey || replicateKey
    if (!hasImageGen) {
      return NextResponse.json({ error:'No image generation API configured. Add OPENAI_API_KEY or STABILITY_API_KEY or REPLICATE_API_KEY to Vercel environment variables.' }, { status:500 })
    }

    const rawBase64 = imageBase64?.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const mimeMatch = imageBase64?.match(/data:(image\/[^;]+);base64/)
    const mediaType = (mimeMatch?.[1] || 'image/jpeg')

    // Step 1: Claude analyzes the original and generates detailed prompts for each variant
    const analysisPrompt = [
      'You are a creative director. Analyze this '+assetType+' marketing creative.',
      'Current scores: '+JSON.stringify(analysis.scores),
      'Weaknesses: '+(Object.entries(analysis.scores||{}).sort((a:any,b:any)=>a[1]-b[1]).slice(0,2).map((e:any)=>e[0]).join(', ')),
      'Key improvements needed: '+(improvements?.priority_fixes?.slice(0,2).map((f:any)=>f.description).join('. ')||analysis.improvements?.slice(0,2).join('. ')||'improve visual impact and clarity'),
      '',
      'Generate 4 complete image generation prompts for redesigned versions of this creative.',
      'Each variant must apply a DIFFERENT design strategy and look visually distinct.',
      '',
      'Return ONLY valid JSON:',
      '{',
      '  "original_description": "<describe what you see in 1 sentence>",',
      '  "variants": [',
      '    {',
      '      "name": "High Impact",',
      '      "strategy": "Bold",',
      '      "prompt": "<detailed DALL-E/SD prompt for this variant, 50-80 words, very specific about colors layout typography style>",',
      '      "description": "What changed and why",',
      '      "score": 85,',
      '      "changes": ["change1","change2","change3"]',
      '    }',
      '  ]',
      '}',
      '',
      'The 4 strategies MUST be:',
      '1. HIGH IMPACT — Bold colors, high contrast, attention-grabbing. Prompt should specify: vibrant brand colors, strong typography, clean layout, professional marketing photo style',
      '2. MINIMAL CLEAN — White space, monochrome palette, single focal point. Prompt: minimalist design, white background, clean typography, product-focused',
      '3. WARM EMOTIONAL — Human connection, warm tones, lifestyle feel. Prompt: warm golden tones, lifestyle photography style, emotional storytelling, approachable',
      '4. DIRECT RESPONSE — Urgency, action-focused, conversion-optimized. Prompt: clear value proposition, urgency elements, strong CTA visual, direct messaging',
      '',
      'For each prompt include: visual style, color palette, typography style, layout description, mood/atmosphere, and quality modifiers like "professional marketing creative, ultra-detailed, 8k, studio quality"',
      'The prompt should recreate the CONCEPT of the original creative but redesigned with the strategy.',
    ].join('\n')

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:2500,messages:[{role:'user',content:[
        {type:'image',source:{type:'base64',media_type:mediaType,data:rawBase64}},
        {type:'text',text:analysisPrompt}
      ]}]}),
    })

    if (!claudeRes.ok) {
      const e = await claudeRes.text()
      return NextResponse.json({error:'AI prompt generation failed: '+e.slice(0,200)},{status:500})
    }

    const claudeData = await claudeRes.json()
    const rawText = claudeData.content?.[0]?.text??''

    let variantData: any
    try {
      const cleaned = rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      variantData = JSON.parse(match?.[0]??cleaned)
    } catch(e) {
      return NextResponse.json({error:'Failed to parse variant prompts: '+rawText.slice(0,200)},{status:500})
    }

    const variants = variantData.variants || []
    if (!variants.length) return NextResponse.json({error:'No variants generated'},{status:500})

    // Step 2: Generate images for each variant
    const generatedVariants = await Promise.all(variants.map(async (v: any, i: number) => {
      let imageUrl: string|null = null
      const fullPrompt = v.prompt + ', professional marketing creative, ultra-detailed, commercial photography, high quality advertising'

      console.log('Generating variant '+i+': '+v.strategy+' — '+fullPrompt.slice(0,80))

      // Try DALL-E 3 first (best quality)
      if (openaiKey && !imageUrl) {
        imageUrl = await generateWithDallE(fullPrompt, openaiKey)
      }

      // Fallback to Stability AI
      if (stabilityKey && !imageUrl) {
        imageUrl = await generateWithStableDiffusion(fullPrompt, stabilityKey)
      }

      // Fallback to Replicate
      if (replicateKey && !imageUrl) {
        imageUrl = await generateWithReplicate(fullPrompt, replicateKey)
      }

      return {
        ...v,
        generatedImage: imageUrl,
        prompt: v.prompt,
        provider: imageUrl ? (openaiKey?'DALL-E 3':stabilityKey?'Stable Diffusion XL':'Replicate SDXL') : null,
        // Fallback design data for canvas if image generation fails
        bg1: ['#1a0a1a','#f0f0f0','#2a1a0a','#0a1a2a'][i]||'#1a1a2a',
        bg2: ['#3d1a2a','#e0e0e0','#3a2a0a','#1a2a3a'][i]||'#0a0a14',
        ctaColor: ['#ED1966','#1a1a1a','#C9A84C','#22c55e'][i]||'#ED1966',
      }
    }))

    return NextResponse.json({
      success:true,
      provider: openaiKey?'DALL-E 3':stabilityKey?'Stability AI':'Replicate',
      original_description: variantData.original_description,
      variants: generatedVariants,
    })

  } catch(e:any) {
    console.error('Variants error:', e)
    return NextResponse.json({error:e?.message||'Internal error'},{status:500})
  }
}
