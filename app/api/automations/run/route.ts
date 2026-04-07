import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Automation } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { automation_id, test_payload } = body as {
      automation_id: string
      test_payload?: Record<string, unknown>
    }

    if (!automation_id) {
      return NextResponse.json({ error: 'automation_id required' }, { status: 400 })
    }

    // Fetch automation
    const { data: autoData } = await supabase
      .from('automations')
      .select('*')
      .eq('id', automation_id)
      .eq('user_id', user.id)
      .single()

    if (!autoData) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    const automation = autoData as Automation

    // Build a manual trigger event
    const event = {
      type: 'manual',
      platform: automation.trigger.platform ?? 'internal',
      payload: {
        text: test_payload?.text ?? 'Test run from dashboard',
        commenter_handle: test_payload?.handle ?? 'test_user',
        commenter_name: test_payload?.name ?? 'Test User',
        post_id: test_payload?.post_id ?? 'test_post',
        ...(test_payload ?? {}),
      },
      timestamp: new Date().toISOString(),
    }

    // Create a run record
    const { data: runData } = await supabase
      .from('automation_runs')
      .insert({
        automation_id,
        trigger_data: { event, manual: true, triggered_by: user.id },
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Update run count
    await supabase
      .from('automations')
      .update({
        run_count: (automation.run_count ?? 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', automation_id)

    // Mark complete (full async execution handled by executor in production)
    await supabase
      .from('automation_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runData?.id)

    return NextResponse.json({
      success: true,
      run_id: runData?.id,
      automation_id,
      message: 'Automation triggered successfully',
    })
  } catch (error) {
    console.error('[Automation Run]', error)
    return NextResponse.json({ error: 'Failed to run automation' }, { status: 500 })
  }
}
