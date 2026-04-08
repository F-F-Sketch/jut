import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { matchAndRunAutomations } from '@/lib/automation/executor'
import { fireUserWebhooks } from '@/lib/webhooks/dispatcher'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-engine-secret')
    if (process.env.ENGINE_SECRET && secret !== process.env.ENGINE_SECRET)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { event, user_id } = await req.json()
    if (!event || !user_id) return NextResponse.json({ error: 'event and user_id required' }, { status: 400 })
    const results = await matchAndRunAutomations(event, user_id)
    try { await fireUserWebhooks(event, user_id, results) } catch (err) { console.error(err) }
    if (results.length > 0) {
      const fired = results.filter(r => r.steps_executed > 0).length
      if (fired > 0) await supabase.from('notifications').insert({ user_id, type: 'automation_fired', title: `${fired} automation(s) fired`, body: `Triggered by: ${event.type}`, data: { event_type: event.type } })
    }
    return NextResponse.json({ ok: true, automations_matched: results.length, results })
  } catch (error) {
    return NextResponse.json({ error: 'Engine error' }, { status: 500 })
  }
}
