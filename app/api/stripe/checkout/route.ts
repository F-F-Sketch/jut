import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import type { Product, Order } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      product_ids,
      customer_name,
      customer_email,
      lead_id,
      conversation_id,
      currency = 'usd',
      locale = 'en',
    } = body as {
      product_ids: string[]
      customer_name: string
      customer_email?: string
      lead_id?: string
      conversation_id?: string
      currency?: 'usd' | 'cop'
      locale?: string
    }

    if (!product_ids?.length) {
      return NextResponse.json({ error: 'product_ids required' }, { status: 400 })
    }

    // Fetch products
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', product_ids)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (!products?.length) {
      return NextResponse.json({ error: 'No valid products found' }, { status: 404 })
    }

    const prods = products as Product[]
    const items = prods.map(p => ({
      product_id: p.id,
      product_name: p.name,
      quantity: 1,
      unit_price: p.price,
      total: p.price,
    }))

    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const total = subtotal

    // Create order in DB
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        lead_id: lead_id ?? null,
        conversation_id: conversation_id ?? null,
        customer_name,
        customer_email: customer_email ?? null,
        items,
        subtotal,
        total,
        currency: currency.toUpperCase() as 'USD' | 'COP',
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderData = order as Order
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Build Stripe line items
    const lineItems = prods.map(p => ({
      price_data: {
        currency: currency,
        product_data: {
          name: p.name,
          description: p.description ?? undefined,
        },
        unit_amount: Math.round(p.price * (currency === 'cop' ? 1 : 100)),
      },
      quantity: 1,
    }))

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/${locale}/sales?order_success=${orderData.id}`,
      cancel_url: `${appUrl}/${locale}/sales?order_cancelled=${orderData.id}`,
      customer_email: customer_email,
      metadata: {
        order_id: orderData.id,
        user_id: user.id,
        lead_id: lead_id ?? '',
      },
    })

    // Update order with Stripe session info
    await supabase
      .from('orders')
      .update({ stripe_payment_intent: session.id })
      .eq('id', orderData.id)

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
      order_id: orderData.id,
    })
  } catch (error) {
    console.error('[Stripe Checkout]', error)
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }
}
