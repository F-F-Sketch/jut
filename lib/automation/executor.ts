import { createClient } from '@/lib/supabase/server'
import type { TriggerEvent, ExecutionContext, ExecutionResult } from './types'

export type { ExecutionContext, ExecutionResult }

export async function executeAutomation(ctx: ExecutionContext): Promise<ExecutionResult> {
  const supabase = await createClient()
  try {
    const { data: automation } = await supabase
      .from('automations').select('*').eq('id', ctx.automationId).single()
    if (!automation) return { success: false, actionsRun: 0, error: 'Automation not found' }
    const actions = automation.actions ?? []
    for (const action of actions) { await executeAction(action, ctx, supabase) }
    return { success: true, actionsRun: actions.length }
  } catch (err: any) {
    return { success: false, actionsRun: 0, error: err?.message ?? 'Unknown error' }
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
      const ctx: ExecutionContext = { userId, automationId: automation.id, triggerData: event.payload }
      const result = await executeAutomation(ctx)
      results.push(result)
      await supabase.from('automation_runs').insert({
        automation_id: automation.id, trigger_data: event.payload,
        status: result.success ? 'completed' : 'failed',
        started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
        error: result.error ?? null,
      })
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
