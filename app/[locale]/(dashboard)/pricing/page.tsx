'use client'
import { useState } from 'react'

const PLANS = [
  {
    id:'free', name:'Free', cop:0, usd:0,
    color:'#6b7280', badge:null, highlight:false,
    desc:'Perfect to get started and explore JUT',
    cta:'Get Started Free', ctaColor:'var(--surface-2)', ctaTextColor:'var(--text-2)',
    features:[
      {t:'1 active automation',ok:true},
      {t:'100 conversations/month',ok:true},
      {t:'1 social account',ok:true},
      {t:'Basic AI Agent',ok:true},
      {t:'Creative Analyzer (3/month)',ok:true},
      {t:'Analytics dashboard',ok:true},
      {t:'Heatmap & Focus Map',ok:false},
      {t:'Improvement Plan',ok:false},
      {t:'Creative Variants',ok:false},
      {t:'WhatsApp Business',ok:false},
      {t:'Priority support',ok:false},
      {t:'White-label',ok:false},
    ],
  },
  {
    id:'growth', name:'Growth', cop:320000, usd:79,
    color:'#ED1966', badge:'Most Popular', highlight:true,
    desc:'For businesses ready to automate and scale',
    cta:'Get Growth', ctaColor:'var(--pink)', ctaTextColor:'#fff',
    features:[
      {t:'20 active automations',ok:true},
      {t:'5,000 conversations/month',ok:true},
      {t:'3 social accounts',ok:true},
      {t:'Advanced AI Agent',ok:true},
      {t:'Creative Analyzer (unlimited)',ok:true},
      {t:'Analytics + exports',ok:true},
      {t:'Heatmap & Focus Map',ok:true},
      {t:'Improvement Plan',ok:true},
      {t:'Creative Variants (10/month)',ok:true},
      {t:'WhatsApp Business',ok:true},
      {t:'Priority support',ok:false},
      {t:'White-label',ok:false},
    ],
  },
  {
    id:'elite', name:'Elite', cop:800000, usd:199,
    color:'#C9A84C', badge:'Best Value', highlight:false,
    desc:'Unlimited power for agencies and serious businesses',
    cta:'Get Elite', ctaColor:'linear-gradient(135deg,#C9A84C,#E8C97A)', ctaTextColor:'#0a0a0a',
    features:[
      {t:'Unlimited automations',ok:true},
      {t:'Unlimited conversations',ok:true},
      {t:'Unlimited social accounts',ok:true},
      {t:'Custom AI Agent persona',ok:true},
      {t:'Creative Analyzer (unlimited)',ok:true},
      {t:'Advanced analytics + API',ok:true},
      {t:'Heatmap & Focus Map',ok:true},
      {t:'Improvement Plan',ok:true},
      {t:'Creative Variants (unlimited)',ok:true},
      {t:'WhatsApp Business',ok:true},
      {t:'Priority support 24/7',ok:true},
      {t:'White-label platform',ok:true},
    ],
  },
]

const FAQS = [
  {q:'Can I change plans anytime?', a:'Yes. Upgrade or downgrade at any time. Changes take effect immediately with prorated billing.'},
  {q:'What payment methods work in Colombia?', a:'PSE, Nequi, Bancolombia QR, and all credit/debit cards via Wompi. Internationally via Stripe.'},
  {q:'Is there a free trial?', a:'The Free plan has no time limit. Use it as long as you want before upgrading.'},
  {q:'What happens if I exceed my limits?', a:'We notify you before hitting limits. Automations pause until next cycle or you upgrade.'},
  {q:'Do you offer discounts?', a:'Annual plans get 20% off. Contact us for agency and volume pricing.'},
  {q:'Is my data secure?', a:'Yes. All data is encrypted, stored in Supabase with row-level security, and never shared.'},
]

export default function PricingPage() {
  const [currency, setCurrency] = useState<'cop'|'usd'>('cop')

  function price(p: typeof PLANS[0]) {
    if (p.cop === 0) return { main:'Free', sub:'' }
    if (currency === 'cop') return { main:'$' + p.cop.toLocaleString('es-CO'), sub:'COP / mes' }
    return { main:'$' + p.usd, sub:'USD / month' }
  }

  return (
    <div style={{padding:'32px 32px 60px',maxWidth:1100}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:44}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:999,background:'rgba(237,25,102,0.08)',border:'1px solid rgba(237,25,102,0.2)',marginBottom:16}}>
          <span style={{fontSize:12,fontWeight:700,color:'var(--pink)',letterSpacing:0.5}}>⚡ PRICING</span>
        </div>
        <h1 style={{fontSize:'clamp(28px,4vw,46px)',fontWeight:900,letterSpacing:-1.5,marginBottom:14,lineHeight:1.05}}>
          Simple, transparent pricing
        </h1>
        <p style={{fontSize:16,color:'var(--text-3)',maxWidth:480,margin:'0 auto 24px',lineHeight:1.6}}>
          Start free. Scale when ready. No hidden fees.
        </p>
        {/* Currency toggle */}
        <div style={{display:'inline-flex',background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:12,padding:4}}>
          {(['cop','usd'] as const).map(c=>(
            <button key={c} onClick={()=>setCurrency(c)} style={{padding:'8px 22px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:currency===c?'var(--pink)':'transparent',color:currency===c?'#fff':'var(--text-3)',transition:'all 0.15s'}}>
              {c==='cop'?'🇨🇴 COP':'🌎 USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:48,alignItems:'start'}}>
        {PLANS.map(plan => {
          const pr = price(plan)
          return (
            <div key={plan.id} style={{
              padding:28, borderRadius:24, position:'relative', overflow:'hidden',
              background:plan.highlight?'linear-gradient(135deg,rgba(237,25,102,0.07),rgba(33,82,164,0.05))':'var(--surface)',
              border:'2px solid '+(plan.highlight?'rgba(237,25,102,0.4)':'var(--border-2)'),
              transform:plan.highlight?'scale(1.03)':'scale(1)',
              boxShadow:plan.highlight?'0 24px 60px rgba(237,25,102,0.12), 0 0 0 1px rgba(237,25,102,0.1)':'none',
              transition:'all 0.2s',
            }}>
              {/* Glow */}
              {plan.highlight&&<div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:'rgba(237,25,102,0.07)',filter:'blur(28px)',pointerEvents:'none'}}/>}

              {/* Badge */}
              {plan.badge&&(
                <div style={{position:'absolute',top:18,right:18,padding:'4px 12px',borderRadius:999,background:plan.id==='elite'?'linear-gradient(135deg,#C9A84C,#E8C97A)':'var(--pink)',color:plan.id==='elite'?'#0a0a0a':'#fff',fontSize:11,fontWeight:700,letterSpacing:0.3}}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <div style={{marginBottom:18,paddingRight:plan.badge?80:0}}>
                <div style={{fontSize:11,fontWeight:700,color:plan.color,textTransform:'uppercase',letterSpacing:0.8,marginBottom:6}}>{plan.name}</div>
                <div style={{fontSize:13,color:'var(--text-3)',lineHeight:1.5}}>{plan.desc}</div>
              </div>

              {/* Price */}
              <div style={{marginBottom:22}}>
                <div style={{display:'flex',alignItems:'baseline',gap:6}}>
                  <span style={{fontSize:plan.cop===0?44:38,fontWeight:900,color:plan.highlight?'var(--pink)':'var(--text)',letterSpacing:-1.5,lineHeight:1,fontFamily:'var(--font-display)'}}>{pr.main}</span>
                </div>
                {pr.sub&&<div style={{fontSize:13,color:'var(--text-4)',marginTop:4}}>{pr.sub} · cancel anytime</div>}
              </div>

              {/* CTA */}
              <button style={{
                width:'100%',padding:'13px',borderRadius:13,border:'none',
                fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:24,
                background:plan.ctaColor,color:plan.ctaTextColor,
                boxShadow:plan.highlight?'0 6px 24px rgba(237,25,102,0.35)':plan.id==='elite'?'0 4px 20px rgba(201,168,76,0.3)':'none',
                transition:'all 0.2s',
              }}>
                {plan.cta}
              </button>

              {/* Divider */}
              <div style={{height:1,background:'var(--border)',marginBottom:18}}/>

              {/* Features */}
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:f.ok?(plan.highlight?'rgba(237,25,102,0.15)':'rgba(34,197,94,0.12)'):'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {f.ok
                        ?<span style={{color:plan.highlight?'var(--pink)':'#22c55e',fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>
                        :<span style={{color:'var(--text-4)',fontSize:11,fontWeight:900,lineHeight:1}}>✕</span>
                      }
                    </div>
                    <span style={{fontSize:13,color:f.ok?'var(--text-2)':'var(--text-4)',fontWeight:f.ok?500:400}}>{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison note */}
      <div style={{padding:20,borderRadius:16,background:'rgba(237,25,102,0.04)',border:'1px solid rgba(237,25,102,0.12)',marginBottom:40,display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:40,height:40,borderRadius:11,background:'rgba(237,25,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20}}>🇨🇴</div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:3}}>Payments in Colombia</div>
          <div style={{fontSize:13,color:'var(--text-3)'}}>We accept PSE, Nequi, Bancolombia, and all credit/debit cards via Wompi. International payments via Stripe.</div>
        </div>
      </div>

      {/* FAQ */}
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:20,letterSpacing:-0.5}}>Frequently asked questions</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {FAQS.map((item,i)=>(
          <div key={i} style={{padding:18,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:7}}>{item.q}</div>
            <div style={{fontSize:13,color:'var(--text-3)',lineHeight:1.6}}>{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}