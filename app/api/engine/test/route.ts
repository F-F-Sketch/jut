import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
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
        text: payload?.text ?? 'Hola! me interesa el producto ð',
        commenter_handle: payload?.handle ?? 'test_user_123',
        commenter_name: payload?.name ?? 'Test User',
        post_id: payload?.post_id ?? 'TEST_POST_001',
        content_type: payload?.content_type ?? 'reel',
        ...(payload ?? {}),
      },
      timestamp: new Date().toISOString(),
    }

    const results = await matchAndRunAutomations(event, user.id)

    return NextResponse.json({
      ok: true, event,
      automations_matched: results.length,
      results,
      message: results.length === 0 ? 'No active automations matched.' : `${results.length} automation(s) ran successfully.`,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
