import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWompiSignature, WOMPI_EVENTS_SECRET } from '@/lib/wompi/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, data, sent_at, signature } = body
    if (WOMPI_EVENTS_SECRET) {
      const isValid = await verifyWompiSignature([data?.transaction?.id, sent_at, event], signature?.checksum, WOMPI_EVENTS_SECRET)
      if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    if (event === 'transaction.updated') {
      const txn = data?.transaction
      if (!txn) return NextResponse.json({ ok: true })
      const supabase = await createClient()
      await supabase.from('wompi_transactions').update({ wompi_id: txn.id, status: txn.status, updated_at: new Date().toISOString() }).eq('reference', txn.reference)
      if (txn.status === 'APPROVED') {
        const { data: localTxn } = await supabase.from('wompi_transactions').select('user_id, plan, amount_in_cents, currency').eq('reference', txn.reference).single()
        if (localTxn) {
          const now = new Date(); const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + 1)
          await supabase.from('subscriptions').upsert({ user_id: localTxn.user_id, plan: localTxn.plan, status: 'active', payment_provider: 'wompi', provider_txn_id: txn.id, current_period_start: now.toISOString(), current_period_end: periodEnd.toISOString(), amount_paid: localTxn.amount_in_cents / 100, currency: localTxn.currency, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          await supabase.from('profiles').update({ plan: localTxn.plan }).eq('user_id', localTxn.user_id)
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
