import { executeAutomation, ExecutionContext, ExecutionResult } from './executor'
import { createClient } from '@/lib/supabase/server'

export interface TriggerPayload {
  type: string
  userId: string
  data: Record<string, unknown>
}

export function createInstagramCommentEvent(postId: string, text: string, handle: string) {
  return {
    type: 'instagram_comment',
    platform: 'instagram',
    payload: { post_id: postId, text, commenter_handle: handle, commenter_name: handle },
    timestamp: new Date().toISOString(),
  }
}

export function createInstagramDMEvent(userId: string, handle: string, text: string) {
  return {
    type: 'instagram_dm',
    platform: 'instagram',
    payload: { sender_id: userId, sender_handle: handle, text },
    timestamp: new Date().toISOString(),
  }
}

export async function processTrigger(payload: TriggerPayload): Promise<ExecutionResult[]> {
  const supabase = await createClient()
  const results: ExecutionResult[] = []
  try {
    const { data: automations } = await supabase
      .from('automations').select('*')
      .eq('user_id', payload.userId).eq('status', 'active')
    if (!automations?.length) return results
    for (const automation of automations) {
      const trigger = automation.trigger ?? {}
      if (trigger.type !== payload.type) continue
      const ctx: ExecutionContext = { userId: payload.userId, automationId: automation.id, triggerData: payload.data }
      const result = await executeAutomation(ctx)
      results.push(result)
      await supabase.from('automation_runs').insert({
        automation_id: automation.id, trigger_data: payload.data,
        status: result.success ? 'completed' : 'failed',
        started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
        error: result.error ?? null,
      })
    }
  } catch (err) { console.error('[engine] processTrigger error:', err) }
  return results
}

export async function runPendingAutomations(): Promise<void> {
  const supabase = await createClient()
  const { data: scheduled } = await supabase.from('automations').select('*').eq('status', 'active')
  if (!scheduled?.length) return
  for (const auto of scheduled) {
    if ((auto.trigger ?? {}).type !== 'schedule') continue
    await processTrigger({ type: 'schedule', userId: auto.user_id, data: { automation_id: auto.id, scheduled_at: new Date().toISOString() } })
  }
}
