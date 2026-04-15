import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const docType = formData.get('type') as string || 'document'
    const docName = formData.get('name') as string || file?.name || 'Document'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Read file content
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let textContent = ''

    // Extract text based on file type
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      textContent = new TextDecoder().decode(bytes)
    } else if (fileName.endsWith('.json')) {
      const raw = new TextDecoder().decode(bytes)
      try { textContent = JSON.stringify(JSON.parse(raw), null, 2) } catch { textContent = raw }
    } else {
      // For other files, store the base64 and extract text via Claude
      const base64 = btoa(String.fromCharCode(...bytes))
      const mediaType = file.type || 'application/octet-stream'

      // Use Claude to extract text from the document
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: 'Extract ALL text content from this document. Return only the extracted text, preserve structure with newlines. No summaries, no explanations — just the complete text.' }
            ]
          }]
        })
      })
      if (claudeRes.ok) {
        const claudeData = await claudeRes.json()
        textContent = claudeData.content?.[0]?.text || ''
      } else {
        textContent = '[Document uploaded — text extraction failed. Add Anthropic API credits to enable extraction.]'
      }
    }

    // Save to knowledge_docs table
    const { data, error } = await sb.from('knowledge_docs').insert({
      user_id: user.id,
      name: docName,
      type: docType,
      content: textContent,
      file_name: file.name,
      file_size: file.size,
      word_count: textContent.split(' ').filter(Boolean).length,
      status: 'active',
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, doc: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}