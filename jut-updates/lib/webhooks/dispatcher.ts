import { createClient } from '@supabase/supabase-js'
import type { TriggerEvent } from '@/lib/automation/engine'
import type { ExecutionResult } from '@/lib/automation/executor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function fireUserWebhooks(
  event: TriggerEvent,
  userId: string,
  results: ExecutionResult[]
): Promise<void> {
  const { data: webhooks } = await supabase
    .from('user_webhooks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [event.type])

  if (!webhooks?.length) return

  const payload = {
    event_type: event.type,
    platform: event.platform,
    timestamp: event.timestamp,
    trigger_data: event.payload,
    automations_fired: results.filter(r => r.steps_executed > 0).length,
    results: results.map(r => ({
      automation_id: r.automation_id,
      steps_executed: r.steps_executed,
      lead_id: r.lead_id,
      conversation_id: r.conversation_id,
    })),
  }

  await Promise.allSettled(
    webhooks.map(async (wh: any) => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-JUT-Event': event.type,
          'X-JUT-Timestamp': event.timestamp,
        }
        if (wh.secret) headers['X-JUT-Secret'] = wh.secret

        const res = await fetch(wh.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        })

        await supabase.from('user_webhooks').update({
          last_fired: new Date().toISOString(),
          fire_count: (wh.fire_count ?? 0) + 1,
        }).eq('id', wh.id)

        console.log(`[Webhooks] ${wh.name} → ${res.status}`)
      } catch (err) {
        console.error(`[Webhooks] ${wh.name} failed:`, err)
      }
    })
  )
}
