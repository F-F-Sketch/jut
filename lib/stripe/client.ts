import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function createPaymentIntent(
  amount: number,
  currency: 'usd' | 'cop',
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * (currency === 'cop' ? 1 : 100)), // COP has no decimals
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}

export async function createCheckoutSession(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
