import { createClient } from '@/lib/supabase/server'
import type { TriggerEvent, ExecutionContext, ExecutionResult } from './types'

export type { ExecutionContext, ExecutionResult }

export interface AutomationRunResult {
  run_id: string
  steps_executed: number
  success: boolean
  error?: string
}

// Called as: executeAutomation(automation, event, userId)
export async function executeAutomation(
  automation: any,
  event: TriggerEvent,
  userId: string
): Promise<AutomationRunResult> {
  const supabase = await createClient()
  const runId = crypto.randomUUID()
  const actions = automation.actions ?? []
  let stepsExecuted = 0
  try {
    for (const action of actions) {
      await executeAction(action, { userId, automationId: automation.id, triggerData: event.payload }, supabase)
      stepsExecuted++
    }
    await supabase.from('automation_runs').insert({
      id: runId, automation_id: automation.id, trigger_data: event.payload,
      status: 'completed', started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(), error: null,
    })
    return { run_id: runId, steps_executed: stepsExecuted, success: true }
  } catch (err: any) {
    return { run_id: runId, steps_executed: stepsExecuted, success: false, error: err?.message }
  }
}

export async function matchAndRunAutomations(
  event: TriggerEvent,
  userId: string
): Promise<ExecutionResult[]> {
  const supabase = await createClient()
  const results: ExecutionResult[] = []
  try {
    const { data: automations } = await supabase
      .from('automations').select('*').eq('user_id', userId).eq('status', 'active')
    if (!automations?.length) return results
    for (const automation of automations) {
      const trigger = automation.trigger ?? {}
      if (trigger.type !== event.type) continue
      const r = await executeAutomation(automation, event, userId)
      results.push({ success: r.success, actionsRun: r.steps_executed, error: r.error })
    }
  } catch (err) { console.error('[executor]', err) }
  return results
}

async function executeAction(action: any, ctx: ExecutionContext, supabase: any): Promise<void> {
  switch (action.type) {
    case 'add_tag':
      await supabase.from('leads').update({ tags: action.config?.tags }).eq('user_id', ctx.userId)
      break
    case 'send_notification':
      await supabase.from('notifications').insert({
        user_id: ctx.userId, type: 'automation_fired',
        title: action.config?.title ?? 'Automation triggered',
        body: action.config?.body ?? null, read: false,
        created_at: new Date().toISOString(),
      })
      break
    case 'wait':
      if (action.delay_seconds) await new Promise(r => setTimeout(r, Math.min(action.delay_seconds * 1000, 5000)))
      break
    default:
      console.log('[executor] unhandled:', action.type)
  }
}
