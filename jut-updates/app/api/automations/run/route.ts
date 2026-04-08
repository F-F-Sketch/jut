import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { executeAutomation } from '@/lib/automation/executor'
import { createInstagramCommentEvent, createInstagramDMEvent } from '@/lib/automation/engine'
import type { Automation } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await req.json()
    const { automation_id, test_payload } = body as { automation_id: string; test_payload?: Record<string, unknown> }
    if (!automation_id) return NextResponse.json({ error: 'automation_id required' }, { status: 400 })

    const { data: autoData } = await supabase.from('automations').select('*').eq('id', automation_id).eq('user_id', user.id).single()
    if (!autoData) return NextResponse.json({ error: 'Automation not found' }, { status: 404 })

    const automation = autoData as Automation
    const triggerType = automation.trigger?.type ?? 'manual'

    let event
    switch (triggerType) {
      case 'instagram_comment':
        event = createInstagramCommentEvent(
          String(test_payload?.post_id ?? 'TEST_POST_001'),
          String(test_payload?.text ?? 'Hola! me interesa 🙌'),
          String(test_payload?.handle ?? 'test_user_123')
        )
        break
      case 'instagram_dm':
        event = createInstagramDMEvent('USER_123', String(test_payload?.handle ?? 'test_user_123'), String(test_payload?.text ?? 'Quiero info'))
        break
      default:
        event = { type: triggerType, platform: 'internal', payload: { text: 'Manual test', commenter_handle: 'test_user', commenter_name: 'Test User', ...(test_payload ?? {}) }, timestamp: new Date().toISOString() }
    }

    const result = await executeAutomation(automation, event, user.id)

    return NextResponse.json({
      success: true,
      run_id: result.run_id,
      steps_executed: result.steps_executed,
      steps_failed: result.steps_failed,
      lead_id: result.lead_id,
      conversation_id: result.conversation_id,
      message: result.error ? `Completed with error: ${result.error}` : `Executed ${result.steps_executed} step(s)`,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to run automation'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
