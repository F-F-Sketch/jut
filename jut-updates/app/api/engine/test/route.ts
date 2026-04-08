import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { matchAndRunAutomations } from '@/lib/automation/executor'
import type { TriggerEvent } from '@/lib/automation/engine'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { trigger_type, payload } = await req.json()

    const event: TriggerEvent = {
      type: trigger_type ?? 'manual',
      platform: payload?.platform ?? 'instagram',
      payload: {
        text: payload?.text ?? 'Hola! me interesa el producto 🙌',
        commenter_handle: payload?.handle ?? 'test_user_123',
        commenter_name: payload?.name ?? 'Test User',
        post_id: payload?.post_id ?? 'TEST_POST_001',
        content_type: payload?.content_type ?? 'reel',
        ...payload,
      },
      timestamp: new Date().toISOString(),
    }

    console.log(`[Engine Test] Running ${event.type} for user ${user.id}`)

    const results = await matchAndRunAutomations(event, user.id)

    return NextResponse.json({
      ok: true,
      event,
      automations_matched: results.length,
      results,
      message: results.length === 0
        ? 'No active automations matched this trigger. Create an automation with a matching trigger type.'
        : `${results.length} automation(s) ran successfully.`,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Engine Test]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
