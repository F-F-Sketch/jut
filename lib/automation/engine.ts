import { createClient } from '@/lib/supabase/server'
import type { TriggerEvent, ExecutionResult } from './types'

export type { TriggerEvent }

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
      .from('automations').select('*').eq('user_id', userId).eq('status', 'active')
    if (!automations?.length) return results
    const { matchAndRunAutomations } = await import('./executor')
    return await matchAndRunAutomations(event, userId)
  } catch (err) { console.error('[engine]', err) }
  return results
}

export async function runPendingAutomations(): Promise<void> {
  const supabase = await createClient()
  const { data: scheduled } = await supabase.from('automations').select('*').eq('status', 'active')
  if (!scheduled?.length) return
  const { matchAndRunAutomations } = await import('./executor')
  for (const auto of scheduled) {
    if ((auto.trigger ?? {}).type !== 'schedule') continue
    await matchAndRunAutomations({
      type: 'schedule', platform: 'internal',
      payload: { automation_id: auto.id },
      timestamp: new Date().toISOString(),
    }, auto.user_id)
  }
}
