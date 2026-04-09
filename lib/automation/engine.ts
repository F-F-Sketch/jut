import { createClient } from '@/lib/supabase/server'
import type { ExecutionResult } from './executor'

export interface TriggerEvent {
  type: string
  platform: string
  payload: Record<string, unknown>
  timestamp: string
}

export function createInstagramCommentEvent(postId: string, text: string, handle: string): TriggerEvent {
  return {
    type: 'instagram_comment',
    platform: 'instagram',
    payload: { post_id: postId, text, commenter_handle: handle, commenter_name: handle },
    timestamp: new Date().toISOString(),
  }
}

export function createInstagramDMEvent(userId: string, handle: string, text: string): TriggerEvent {
  return {
    type: 'instagram_dm',
    platform: 'instagram',
    payload: { sender_id: userId, sender_handle: handle, text },
    timestamp: new Date().toISOString(),
  }
}

export async function processTrigger(event: TriggerEvent, userId: string): Promise<ExecutionResult[]> {
  const supabase = await createClient()
  const results: ExecutionResult[] = []
  try {
    const { data: automations } = await supabase
      .from('automations').select('*')
      .eq('user_id', userId).eq('status', 'active')
    if (!automations?.length) return results
    for (const automation of automations) {
      const trigger = automation.trigger ?? {}
      if (trigger.type !== event.type) continue
      const { executeAutomation } = await import('./executor')
      const result = await executeAutomation({ userId, automationId: automation.id, triggerData: event.payload })
      results.push(result)
      await supabase.from('automation_runs').insert({
        automation_id: automation.id, trigger_data: event.payload,
        status: result.success ? 'completed' : 'failed',
        started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
        error: result.error ?? null,
      })
    }
  } catch (err) { console.error('[engine]', err) }
  return results
}

export async function runPendingAutomations(): Promise<void> {
  const supabase = await createClient()
  const { data: scheduled } = await supabase.from('automations').select('*').eq('status', 'active')
  if (!scheduled?.length) return
  for (const auto of scheduled) {
    if ((auto.trigger ?? {}).type !== 'schedule') continue
    await processTrigger({
      type: 'schedule', platform: 'internal',
      payload: { automation_id: auto.id },
      timestamp: new Date().toISOString(),
    }, auto.user_id)
  }
}
