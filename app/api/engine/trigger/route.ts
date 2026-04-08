import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { matchAndRunAutomations, type TriggerEvent } from '@/lib/automation/executor'
import { fireUserWebhooks } from '@/lib/webhooks/dispatcher'

// Service-role client — bypasses RLS for engine operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint is called by:
// 1. Instagram webhook (when a comment/DM arrives)
// 2. Internal test runs
// 3. Scheduled cron jobs
// 4. Any external source

export async function POST(req: NextRequest) {
  try {
    // Verify engine secret for production security
    const secret = req.headers.get('x-engine-secret')
    if (process.env.ENGINE_SECRET && secret !== process.env.ENGINE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { event, user_id } = body as { event: TriggerEvent; user_id: string }

    if (!event || !user_id) {
      return NextResponse.json({ error: 'event and user_id required' }, { status: 400 })
    }

    // Validate event structure
    if (!event.type || !event.payload) {
      return NextResponse.json({ error: 'Invalid event structure' }, { status: 400 })
    }

    console.log(`[Engine] Trigger received: ${event.type} for user ${user_id}`)

    // Run all matching automations
    const results = await matchAndRunAutomations(event, user_id)

    // Fire user-defined webhooks (n8n etc)
    try {
      await fireUserWebhooks(event, user_id, results)
    } catch (err) {
      console.error('[Engine] Webhook dispatch failed:', err)
    }

    // Create notification for user
    if (results.length > 0) {
      const fired = results.filter(r => r.steps_executed > 0).length
      if (fired > 0) {
        await supabase.from('notifications').insert({
          user_id,
          type: 'automation_fired',
          title: `${fired} automation${fired > 1 ? 's' : ''} fired`,
          body: `Triggered by: ${event.type.replace(/_/g, ' ')}`,
          data: { event_type: event.type, results },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      automations_matched: results.length,
      results,
    })
  } catch (error) {
    console.error('[Engine Trigger]', error)
    return NextResponse.json({ error: 'Engine error' }, { status: 500 })
  }
}
