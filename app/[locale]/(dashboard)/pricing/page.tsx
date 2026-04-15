'use client'
import { useState } from 'react'
import { Check, Zap, Crown, Star, ArrowRight, X } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_cop: 0,
    price_usd: 0,
    color: '#6b7280',
    icon: Zap,
    desc: 'Perfect to get started and explore JUT',
    highlight: false,
    features: [
      { text: '1 active automation', included: true },
      { text: '100 conversations/month', included: true },
      { text: '1 social account', included: true },
      { text: 'Basic AI Agent', included: true },
      { text: 'Creative Analyzer (3/month)', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Heatmap & Focus Map', included: false },
      { text: 'Improvement Plan', included: false },
      { text: 'Creative Variants', included: false },
      { text: 'WhatsApp Business', included: false },
      { text: 'Priority support', included: false },
      { text: 'White-label', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'ghost',
  },
  {
    id: 'growth',
    name: 'Growth',
    price_cop: 320000,
    price_usd: 79,
    color: '#ED1966',
    icon: Star,
    desc: 'For businesses ready to automate and scale',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { text: '20 active automations', included: true },
      { text: '5,000 conversations/month', included: true },
      { text: '3 social accounts', included: true },
      { text: 'Advanced AI Agent', included: true },
      { text: 'Creative Analyzer (unlimited)', included: true },
      { text: 'Analytics + exports', included: true },
      { text: 'Heatmap & Focus Map', included: true },
      { text: 'Improvement Plan', included: true },
      { text: 'Creative Variants (10/month)', included: true },
      { text: 'WhatsApp Business', included: true },
      { text: 'Priority support', included: false },
      { text: 'White-label', included: false },
    ],
    cta: 'Get Growth',
    ctaStyle: 'primary',
  },
  {
    id: 'elite',
    name: 'Elite',
    price_cop: 800000,
    price_usd: 199,
    color: '#C9A84C',
    icon: Crown,
    desc: 'Unlimited power for agencies and serious businesses',
    highlight: false,
    features: [
      { text: 'Unlimited automations', included: true },
      { text: 'Unlimited conversations', included: true },
      { text: 'Unlimited social accounts', included: true },
      { text: 'Custom AI Agent persona', included: true },
      { text: 'Creative Analyzer (unlimited)', included: true },
      { text: 'Advanced analytics + API', included: true },
      { text: 'Heatmap & Focus Map', included: true },
      { text: 'Improvement Plan', included: true },
      { text: 'Creative Variants (unlimited)', included: true },
      { text: 'WhatsApp Business', included: true },
      { text: 'Priority support 24/7', included: true },
      { text: 'White-label platform', included: true },
    ],
    cta: 'Get Elite',
    ctaStyle: 'gold',
  },
]

export default function PricingPage() {
  const [currency, setCurrency] = useState<'cop'|'usd'>('cop')

  function formatPrice(plan: typeof PLANS[0]) {
    if (plan.price_cop === 0) return 'Free'
    if (currency === 'cop') return '$' + plan.price_cop.toLocaleString('es-CO') + ' COP'
    return '$' + plan.price_usd + ' USD'
  }

  return (
    <div style={{ padding: '32px 32px 60px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.2)', marginBottom: 16 }}>
          <Zap size={13} color="var(--pink)"/>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', letterSpacing: 0.5 }}>PRICING</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -1, marginBottom: 14, lineHeight: 1.1 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-3)', maxWidth: 500, margin: '0 auto 24px' }}>
          Start free. Upgrade when you are ready to scale your business with AI automation.
        </p>
        {/* Currency toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 12, padding: 4 }}>
          {(['cop', 'usd'] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding: '7px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: currency === c ? 'var(--pink)' : 'transparent', color: currency === c ? '#fff' : 'var(--text-3)', transition: 'all 0.15s' }}>
              {c === 'cop' ? '🇨🇴 COP' : '🌎 USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            padding: 28, borderRadius: 24,
            background: plan.highlight ? 'linear-gradient(135deg,rgba(237,25,102,0.08),rgba(33,82,164,0.06))' : 'var(--surface)',
            border: '2px solid ' + (plan.highlight ? 'rgba(237,25,102,0.35)' : 'var(--border-2)'),
            position: 'relative', overflow: 'hidden',
            transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
            boxShadow: plan.highlight ? '0 20px 60px rgba(237,25,102,0.15)' : 'none',
          }}>
            {plan.badge && (
              <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 999, background: 'var(--pink)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                {plan.badge}
              </div>
            )}
            {plan.highlight && <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(237,25,102,0.08)', filter: 'blur(24px)' }}/>}

            <div style={{ marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: plan.color + '18', border: '1px solid ' + plan.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <plan.icon size={20} color={plan.color}/>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{plan.desc}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: plan.price_cop === 0 ? 44 : 38, fontWeight: 900, color: plan.highlight ? 'var(--pink)' : 'var(--text)', letterSpacing: -1.5, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {formatPrice(plan)}
              </div>
              {plan.price_cop > 0 && <div style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>per month · cancel anytime</div>}
            </div>

            <button style={{
              width: '100%', padding: '13px', borderRadius: 13, border: 'none',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              marginBottom: 24, transition: 'all 0.2s',
              background: plan.ctaStyle === 'primary' ? 'var(--pink)'
                : plan.ctaStyle === 'gold' ? 'linear-gradient(135deg,var(--gold),var(--gold-light),var(--gold))'
                : 'var(--surface-2)',
              color: plan.ctaStyle === 'ghost' ? 'var(--text-2)' : plan.ctaStyle === 'gold' ? '#0a0a0a' : '#fff',
              boxShadow: plan.ctaStyle === 'primary' ? '0 6px 24px rgba(237,25,102,0.35)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              {plan.cta} {plan.ctaStyle !== 'ghost' && <ArrowRight size={15}/>}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.included ? (plan.highlight ? 'rgba(237,25,102,0.15)' : 'rgba(34,197,94,0.12)') : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {f.included
                      ? <Check size={11} color={plan.highlight ? 'var(--pink)' : '#22c55e'} strokeWidth={3}/>
                      : <X size={10} color="var(--text-4)" strokeWidth={2.5}/>
                    }
                  </div>
                  <span style={{ fontSize: 13, color: f.included ? 'var(--text-2)' : 'var(--text-4)', fontWeight: f.included ? 500 : 400 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ padding: 28, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>Frequently asked questions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { q: 'Can I change plans anytime?', a: 'Yes. Upgrade or downgrade at any time. Changes take effect immediately.' },
            { q: 'What payment methods are accepted?', a: 'In Colombia: PSE, Nequi, Bancolombia, credit/debit cards via Wompi. International: all major credit cards via Stripe.' },
            { q: 'Is there a free trial?', a: 'The Free plan has no time limit. You can use it as long as you want before upgrading.' },
            { q: 'What happens if I exceed my limits?', a: 'We will notify you before you hit limits. Automations will pause until the next billing cycle or you upgrade.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 18, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 7 }}>{item.q}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}