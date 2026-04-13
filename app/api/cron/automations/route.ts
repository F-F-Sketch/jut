import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executeAutomation } from '@/lib/automation/executor'
import type { Automation } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called by Vercel Cron every minute
// vercel.json: { "crons": [{ "path": "/api/cron/automations", "schedule": "* * * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  let processed = 0
  let failed = 0

  // ââ 1. Process queued actions (delayed steps) ââââââââââââââ
  const { data: queuedItems } = await supabase
    .from('action_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('execute_at', now)
    .lt('attempts', 3)
    .order('execute_at')
    .limit(50)

  if (queuedItems?.length) {
    console.log(`[Cron] Processing ${queuedItems.length} queued actions`)

    for (const item of queuedItems) {
      await supabase.from('action_queue').update({
        status: 'processing',
        attempts: item.attempts + 1,
      }).eq('id', item.id)

      try {
        await supabase.from('action_queue').update({
          status: 'completed',
        }).eq('id', item.id)
        processed++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown'
        await supabase.from('action_queue').update({
          status: item.attempts >= 2 ? 'failed' : 'pending',
          error: errMsg,
        }).eq('id', item.id)
        failed++
      }
    }
  }

  // ââ 2. Run scheduled automations ââââââââââââââââââââââââââ
  const { data: scheduledAutos } = await supabase
    .from('automations')
    .select('*')
    .eq('status', 'active')
    .eq('trigger->type', 'schedule')

  if (scheduledAutos?.length) {
    for (const auto of scheduledAutos as Automation[]) {
      const schedule = auto.trigger?.schedule
      if (!shouldRunNow(schedule)) continue

      const event = {
        type: 'schedule',
        platform: 'internal',
        payload: { schedule, triggered_at: now },
        timestamp: now,
      }

      try {
        await executeAutomation(auto, event, auto.user_id)
        processed++
      } catch (err) {
        console.error(`[Cron] Scheduled auto ${auto.id} failed:`, err)
        failed++
      }
    }
  }

  // ââ 3. Clean up old completed runs (older than 30 days) âââ
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  await supabase
    .from('automation_runs')
    .delete()
    .eq('status', 'completed')
    .lt('completed_at', thirtyDaysAgo.toISOString())

  console.log(`[Cron] Done â processed: ${processed}, failed: ${failed}`)
  return NextResponse.json({ ok: true, processed, failed, timestamp: now })
}

function shouldRunNow(schedule: string | undefined): boolean {
  if (!schedule) return false
  // Simple check: 'hourly' runs every hour at :00, 'daily' at 00:00, etc.
  const now = new Date()
  const minutes = now.getMinutes()
  const hours = now.getHours()

  switch (schedule) {
    case 'every_minute': return true
    case 'hourly': return minutes === 0
    case 'daily': return hours === 8 && minutes === 0
    case 'weekly': return now.getDay() === 1 && hours === 8 && minutes === 0
    default: return false
  }
}
