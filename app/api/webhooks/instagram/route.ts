import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createInstagramCommentEvent } from '@/lib/automation/engine'

// Service-role Supabase for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET: Meta webhook verification ──────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('[Instagram Webhook] Verified')
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST: Receive Instagram events ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Instagram sends an array of entries
    const entries = body.entry ?? []

    for (const entry of entries) {
      // Comment events
      const commentChanges = (entry.changes ?? []).filter((c: { field: string }) => c.field === 'comments')
      for (const change of commentChanges) {
        await handleComment(change.value, entry.id)
      }

      // Message events (DMs)
      const messagingEvents = entry.messaging ?? []
      for (const event of messagingEvents) {
        if (event.message) await handleDirectMessage(event, entry.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Instagram Webhook]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function handleComment(value: Record<string, unknown>, pageId: string) {
  const commentText = (value.text as string) ?? ''
  const commenterId = (value.from as { id: string })?.id ?? ''
  const commenterName = (value.from as { name: string })?.name ?? commenterId
  const postId = (value.media as { id: string })?.id ?? ''
  const contentType = 'post' // default; reel detection handled by media type

  // Find all users with active social triggers for Instagram
  const { data: triggers } = await supabase
    .from('social_triggers')
    .select('*, automations(*)')
    .eq('platform', 'instagram')
    .eq('status', 'active')

  if (!triggers) return

  for (const trigger of triggers) {
    // Check if any keyword matches
    const matchedKeyword = trigger.keywords.some((kw: string) =>
      commentText.toLowerCase().includes(kw.toLowerCase())
    )

    if (!matchedKeyword && trigger.keywords.length > 0) continue

    const event = createInstagramCommentEvent(postId, commentText, commenterName, contentType as 'post' | 'reel' | 'carousel')

    // Log the event — automation runner would pick this up
    await supabase.from('automation_runs').insert({
      automation_id: trigger.automation_id,
      trigger_data: { event, trigger_id: trigger.id, commenter_id: commenterId, commenter_name: commenterName },
      status: 'running',
    })

    // Create/update lead
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('instagram_handle', commenterName)
      .eq('user_id', trigger.user_id)
      .single()

    if (!existingLead) {
      await supabase.from('leads').insert({
        user_id: trigger.user_id,
        full_name: commenterName,
        instagram_handle: commenterName,
        source: 'instagram_comment',
        status: 'new',
        stage: 'awareness',
        metadata: { trigger_id: trigger.id, post_id: postId, comment: commentText },
      })
    }

    console.log(`[Instagram Webhook] Comment trigger fired for user ${trigger.user_id}`)
  }
}

async function handleDirectMessage(event: Record<string, unknown>, pageId: string) {
  const senderId = (event.sender as { id: string })?.id
  const messageText = (event.message as { text: string })?.text ?? ''

  if (!senderId || !messageText) return

  // Find matching conversation or create new one
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('external_id', senderId)
    .eq('channel', 'instagram')
    .single()

  if (conversation) {
    // Append message to existing conversation
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: messageText,
      channel: 'instagram',
      external_id: senderId,
      status: 'delivered',
    })
    await supabase.from('conversations').update({
      last_message: messageText,
      last_message_at: new Date().toISOString(),
      unread_count: supabase.rpc('increment', { x: 1 }), // increment
    }).eq('id', conversation.id)
  }

  console.log(`[Instagram Webhook] DM received from ${senderId}`)
}
