import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('[Stripe Webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.order_id

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              stripe_payment_intent: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          console.log(`[Stripe] Order ${orderId} marked as paid`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.order_id

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              stripe_payment_intent: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
        }
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
