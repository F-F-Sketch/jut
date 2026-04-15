import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const PLANS: Record<string, { name:string; cop:number; usd:number; stripe_price_id:string }> = {
  growth: { name:'JUT Growth', cop:320000, usd:79, stripe_price_id: process.env.STRIPE_PRICE_GROWTH||'' },
  elite:  { name:'JUT Elite',  cop:800000, usd:199, stripe_price_id: process.env.STRIPE_PRICE_ELITE||'' },
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
    const { plan, method, currency='cop' } = await req.json()
    if (!PLANS[plan]) return NextResponse.json({ error:'Invalid plan' }, { status:400 })
    const planInfo = PLANS[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getjut.io'

    // WOMPI (Colombia - COP)
    if (method === 'wompi' || currency === 'cop') {
      const wompiKey = process.env.WOMPI_PUBLIC_KEY
      if (!wompiKey) return NextResponse.json({ error:'Wompi not configured. Add WOMPI_PUBLIC_KEY to Vercel env vars.' }, { status:500 })

      const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || ''
      const reference = 'jut_'+plan+'_'+user.id.slice(0,8)+'_'+Date.now()
      const amountInCents = planInfo.cop * 100
      const currency_code = 'COP'

      // Generate integrity signature
      const signatureStr = reference + amountInCents + currency_code + integritySecret
      const encoder = new TextEncoder()
      const data = encoder.encode(signatureStr)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const signature = hashArray.map(b => b.toString(16).padStart(2,'0')).join('')

      // Save pending order
      await sb.from('orders').insert({
        user_id: user.id,
        plan,
        amount: planInfo.cop,
        currency: 'COP',
        reference,
        status: 'pending',
        processor: 'wompi',
      })

      const wompiUrl = new URL('https://checkout.wompi.co/p/')
      wompiUrl.searchParams.set('public-key', wompiKey)
      wompiUrl.searchParams.set('currency', currency_code)
      wompiUrl.searchParams.set('amount-in-cents', String(amountInCents))
      wompiUrl.searchParams.set('reference', reference)
      wompiUrl.searchParams.set('signature:integrity', signature)
      wompiUrl.searchParams.set('redirect-url', appUrl+'/en/pricing?success=wompi&plan='+plan)
      wompiUrl.searchParams.set('customer-data:email', user.email||'')

      return NextResponse.json({ url: wompiUrl.toString(), processor:'wompi' })
    }

    // STRIPE (International - USD)
    if (method === 'stripe' || currency === 'usd') {
      const stripeKey = process.env.STRIPE_SECRET_KEY
      if (!stripeKey) return NextResponse.json({ error:'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel env vars.' }, { status:500 })

      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(stripeKey, { apiVersion:'2024-06-20' })

      const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:'subscription',
        line_items:[{ price: planInfo.stripe_price_id, quantity:1 }],
        customer_email: user.email,
        success_url: appUrl+'/en/pricing?success=stripe&plan='+plan+'&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: appUrl+'/en/pricing?cancelled=true',
        metadata:{ user_id:user.id, plan },
      })

      return NextResponse.json({ url: session.url, processor:'stripe' })
    }

    return NextResponse.json({ error:'Invalid method' }, { status:400 })
  } catch(e:any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error:e.message||'Internal error' }, { status:500 })
  }
}
