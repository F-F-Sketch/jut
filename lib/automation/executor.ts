import { createClient } from '@/lib/supabase/server'

export interface ExecutionContext {
  userId: string
  automationId: string
  triggerData: Record<string, unknown>
}

export interface ExecutionResult {
  success: boolean
  actionsRun: number
  error?: string
}

export async function executeAutomation(ctx: ExecutionContext): Promise<ExecutionResult> {
  const supabase = await createClient()
  try {
    const { data: automation } = await supabase
      .from('automations')
      .select('*')
      .eq('id', ctx.automationId)
      .single()
    if (!automation) return { success: false, actionsRun: 0, error: 'Automation not found' }
    const actions = automation.actions ?? []
    for (const action of actions) {
      await executeAction(action, ctx, supabase)
    }
    return { success: true, actionsRun: actions.length }
  } catch (err: any) {
    return { success: false, actionsRun: 0, error: err?.message ?? 'Unknown error' }
  }
}

async function executeAction(action: any, ctx: ExecutionContext, supabase: any): Promise<void> {
  switch (action.type) {
    case 'add_tag':
      await supabase.from('leads').update({ tags: action.config.tags }).eq('user_id', ctx.userId)
      break
    case 'send_notification':
      await supabase.from('notifications').insert({
        user_id: ctx.userId,
        type: 'automation_fired',
        title: action.config.title ?? 'Automation triggered',
        body: action.config.body ?? null,
        read: false,
        created_at: new Date().toISOString(),
      })
      break
    case 'wait':
      if (action.delay_seconds) await new Promise(r => setTimeout(r, Math.min(action.delay_seconds * 1000, 5000)))
      break
    default:
      console.log('[executor] Unhandled action type:', action.type)
  }
}
