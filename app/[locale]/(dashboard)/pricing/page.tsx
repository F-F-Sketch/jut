'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DEFAULT_PLANS = [
  { id:'free', name:'Free', price_cop:0, price_usd:0, color:'#6b7280', badge:null, highlight:false, desc:'Perfect to get started', cta:'Get Started Free',
    features:[{text:'1 active automation',included:true},{text:'100 conversations/month',included:true},{text:'Creative Analyzer (3/month)',included:true},{text:'Heatmap & Focus Map',included:false},{text:'Improvement Plan',included:false}]},
  { id:'growth', name:'Growth', price_cop:320000, price_usd:79, color:'#ED1966', badge:'Most Popular', highlight:true, desc:'For businesses ready to automate', cta:'Get Growth',
    features:[{text:'20 active automations',included:true},{text:'5,000 conversations/month',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true}]},
  { id:'elite', name:'Elite', price_cop:800000, price_usd:199, color:'#C9A84C', badge:'Best Value', highlight:false, desc:'Unlimited power for agencies', cta:'Get Elite',
    features:[{text:'Unlimited automations',included:true},{text:'Unlimited conversations',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Heatmap & Focus Map',included:true},{text:'White-label platform',included:true}]},
]

export default function PricingPage({ params }:{ params:{ locale:string } }) {
  const [plans, setPlans] = useState(DEFAULT_PLANS)
  const [currency, setCurrency] = useState<'cop'|'usd'>('cop')
  const [loading, setLoading] = useState<string|null>(null)
  const [fetching, setFetching] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { if (d.plans?.length) setPlans(d.plans) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  async function checkout(planId:string, method:'wompi'|'stripe') {
    if (planId === 'free') { toast.success("You are already on the Free plan!"); return }
    setLoading(planId + method)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/' + params.locale + '/login'); return }
      const res = await fetch('/api/checkout/create', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ plan:planId, method, currency }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Checkout failed'); return }
      if (data.url) window.location.href = data.url
    } catch(e:any) { toast.error(e.message) } finally { setLoading(null) }
  }

  function price(p: typeof plans[0]) {
    if (p.price_cop === 0) return 'Free'
    if (currency === 'cop') return '$' + p.price_cop.toLocaleString('es-CO') + ' COP'
    return '$' + p.price_usd + ' USD'
  }

  return (
    <div style={{ padding:'clamp(16px,3vw,40px)', maxWidth:1100 }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:999, background:'rgba(237,25,102,0.08)', border:'1px solid rgba(237,25,102,0.2)', marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--pink)', letterSpacing:0.5 }}>PRICING</span>
        </div>
        <h1 style={{ fontSize:'clamp(24px,4vw,44px)', fontWeight:900, letterSpacing:-1.5, marginBottom:12, lineHeight:1.05 }}>Simple, transparent pricing</h1>
        <p style={{ fontSize:'clamp(14px,1.5vw,16px)', color:'var(--text-3)', maxWidth:460, margin:'0 auto 20px', lineHeight:1.6 }}>Start free. Scale when ready. No hidden fees.</p>
        <div style={{ display:'inline-flex', background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:12, padding:4 }}>
          {(['cop','usd'] as const).map(c=>(
            <button key={c} onClick={()=>setCurrency(c)} style={{ padding:'7px 18px', borderRadius:9, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:currency===c?'var(--pink)':'transparent', color:currency===c?'#fff':'var(--text-3)', transition:'all 0.15s' }}>
              {c==='cop'?'🇨🇴 COP':'🌎 USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      {fetching ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-3)' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid var(--border-2)', borderTopColor:'var(--pink)', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
          Loading plans...
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18, marginBottom:40 }}>
          {plans.map((plan, i) => (
            <div key={plan.id || i} style={{
              padding:'clamp(18px,2vw,28px)', borderRadius:24, position:'relative', overflow:'hidden',
              background:plan.highlight?'linear-gradient(135deg,rgba(237,25,102,0.07),rgba(33,82,164,0.05))':'var(--surface)',
              border:'2px solid '+(plan.highlight?'rgba(237,25,102,0.4)':'var(--border-2)'),
              boxShadow:plan.highlight?'0 20px 60px rgba(237,25,102,0.12)':'none',
              transition:'transform 0.2s, box-shadow 0.2s',
            }}>
              {plan.highlight && <div style={{ position:'absolute', top:-40, right:-40, width:130, height:130, borderRadius:'50%', background:'rgba(237,25,102,0.06)', filter:'blur(24px)', pointerEvents:'none' }}/>}
              {plan.badge && (
                <div style={{ position:'absolute', top:16, right:16, padding:'3px 10px', borderRadius:999, background:plan.id==='elite'?'linear-gradient(135deg,#C9A84C,#E8C97A)':plan.color, color:plan.id==='elite'?'#0a0a0a':'#fff', fontSize:10, fontWeight:700 }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom:16, paddingRight:plan.badge?70:0 }}>
                <div style={{ fontSize:10, fontWeight:700, color:plan.color, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>{plan.name}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.5 }}>{plan.desc}</div>
              </div>
              <div style={{ marginBottom:20 }}>
                <span style={{ fontSize:plan.price_cop===0?40:34, fontWeight:900, color:plan.highlight?'var(--pink)':'var(--text)', letterSpacing:-1.5, lineHeight:1, fontFamily:'var(--font-display)' }}>{price(plan)}</span>
                {plan.price_cop>0&&<div style={{ fontSize:12, color:'var(--text-4)', marginTop:3 }}>per month</div>}
              </div>

              {plan.id==='free'||plan.price_cop===0 ? (
                <button style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px solid var(--border-2)', background:'var(--surface-2)', color:'var(--text-2)', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:20 }}>
                  {plan.cta}
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  <button onClick={()=>checkout(plan.id,'wompi')} disabled={loading===plan.id+'wompi'} style={{ width:'100%', padding:'11px', borderRadius:11, border:'none', background:plan.highlight?'var(--pink)':'var(--surface-2)', color:plan.highlight?'#fff':'var(--text)', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, borderTop:plan.highlight?'none':'1px solid var(--border-2)', transition:'all 0.2s', opacity:loading===plan.id+'wompi'?0.7:1 }}>
                    {loading===plan.id+'wompi'?'Redirecting...':'🇨🇴 Pay with Wompi (COP)'}
                  </button>
                  <button onClick={()=>checkout(plan.id,'stripe')} disabled={loading===plan.id+'stripe'} style={{ width:'100%', padding:'11px', borderRadius:11, border:'1px solid var(--border-2)', background:'var(--surface-2)', color:'var(--text-2)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.2s', opacity:loading===plan.id+'stripe'?0.7:1 }}>
                    {loading===plan.id+'stripe'?'Redirecting...':'🌎 Pay with Stripe (USD)'}
                  </button>
                </div>
              )}

              <div style={{ height:1, background:'var(--border)', marginBottom:16 }}/>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:17, height:17, borderRadius:'50%', background:f.included?(plan.highlight?'rgba(237,25,102,0.15)':'rgba(34,197,94,0.12)'):'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ color:f.included?(plan.highlight?'var(--pink)':'#22c55e'):'var(--text-4)', fontSize:10, fontWeight:900, lineHeight:1 }}>{f.included?'✓':'✕'}</span>
                    </div>
                    <span style={{ fontSize:12, color:f.included?'var(--text-2)':'var(--text-4)' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding:18, borderRadius:14, background:'rgba(237,25,102,0.04)', border:'1px solid rgba(237,25,102,0.12)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontSize:22 }}>🇨🇴</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:2 }}>Colombian payment methods available</div>
          <div style={{ fontSize:12, color:'var(--text-3)' }}>PSE, Nequi, Bancolombia QR, credit/debit cards via Wompi</div>
        </div>
      </div>
    </div>
  )
}