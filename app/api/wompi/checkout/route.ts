import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { WOMPI_PUBLIC_KEY, buildCheckoutUrl, generateReference } from '@/lib/wompi/client'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan, currency = 'COP', locale = 'es' } = await req.json()

    const supabase = await createClient()
    const { data: planConfig } = await supabase
      .from('plan_configs')
      .select('*')
      .eq('slug', plan)
      .single()

    if (!planConfig) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const amountInCents = currency === 'COP'
      ? Math.round(planConfig.price_cop * 100)
      : Math.round(planConfig.price_usd * 100)

    if (amountInCents === 0) {
      await supabase.from('subscriptions').upsert({
        user_id: user.id, plan: 'free', status: 'free',
        payment_provider: 'none', currency,
      }, { onConflict: 'user_id' })
      return NextResponse.json({ redirectUrl: `/${locale}/dashboard` })
    }

    const reference = generateReference(user.id, plan)
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/billing/confirm?reference=${reference}`

    await supabase.from('wompi_transactions').insert({
      user_id: user.id,
      reference,
      amount_in_cents: amountInCents,
      currency,
      status: 'PENDING',
      plan,
    })

    const checkoutUrl = buildCheckoutUrl({
      publicKey: WOMPI_PUBLIC_KEY,
      amountInCents,
      currency,
      reference,
      redirectUrl,
      customerEmail: user.email ?? '',
    })

    return NextResponse.json({ checkoutUrl, reference })
  } catch (error) {
    console.error('Wompi checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
