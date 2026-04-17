'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DEFAULT_PLANS = [
  { id:'free', name:'Free', price_cop:0, price_usd:0, color:'#6b7280', badge:null, highlight:false, desc:'Perfect to get started', cta:'Get Started Free',
    features:[{text:'1 active automation',included:true},{text:'100 conversations/month',included:true},{text:'1 social account',included:true},{text:'Basic AI Agent',included:true},{text:'Creative Analyzer (3/month)',included:true},{text:'Heatmap & Focus Map',included:false},{text:'Improvement Plan',included:false},{text:'Creative Variants',included:false},{text:'WhatsApp Business',included:false},{text:'Priority support',included:false}]},
  { id:'growth', name:'Growth', price_cop:320000, price_usd:79, color:'#ED1966', badge:'Popular', highlight:true, desc:'For businesses ready to scale', cta:'Get Growth',
    features:[{text:'20 active automations',included:true},{text:'5,000 conversations/month',included:true},{text:'3 social accounts',included:true},{text:'Advanced AI Agent',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (10/month)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support',included:false}]},
  { id:'elite', name:'Elite', price_cop:800000, price_usd:199, color:'#C9A84C', badge:'Best Value', highlight:false, desc:'Unlimited for agencies', cta:'Get Elite',
    features:[{text:'Unlimited automations',included:true},{text:'Unlimited conversations',included:true},{text:'Unlimited social accounts',included:true},{text:'Custom AI Agent persona',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (unlimited)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support 24/7',included:true}]},
]

export default function PricingPage({ params }:{ params:{ locale:string } }) {
  const [plans, setPlans] = useState(DEFAULT_PLANS)
  const [currency, setCurrency] = useState<'cop'|'usd'>('cop')
  const [loading, setLoading] = useState<string|null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(()=>{
    fetch('/api/pricing').then(r=>r.json()).then(d=>{ if(d.plans?.length) setPlans(d.plans) }).catch(()=>{})
  },[])

  async function checkout(planId:string, method:'wompi'|'stripe') {
    if (planId==='free') { toast.success('You are on the Free plan!'); return }
    setLoading(planId+method)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'+params.locale+'/login'); return }
      const res = await fetch('/api/checkout/create',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:planId,method,currency}) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error||'Failed'); return }
      if (data.url) window.location.href = data.url
    } catch(e:any) { toast.error(e.message) } finally { setLoading(null) }
  }

  function price(p:typeof plans[0]) {
    if(p.price_cop===0) return 'Free'
    if(currency==='cop') return '$'+p.price_cop.toLocaleString('es-CO')+' COP'
    return '$'+p.price_usd+' USD'
  }

  return (
    <div className="page" style={{paddingBottom:40}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:clamp(24,32)}}>
        <h1 className="section-title" style={{fontSize:'clamp(22px,4vw,40px)',marginBottom:10}}>Simple, transparent pricing</h1>
        <p className="section-sub" style={{maxWidth:420,margin:'0 auto 20px'}}>Start free. Scale when ready.</p>
        <div style={{display:'inline-flex',background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:12,padding:4}}>
          {(['cop','usd'] as const).map(c=>(
            <button key={c} onClick={()=>setCurrency(c)} style={{padding:'7px 16px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:currency===c?'var(--pink)':'transparent',color:currency===c?'#fff':'var(--text-3)',transition:'all 0.15s'}}>
              {c==='cop'?'COP':'USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:28}}>
        {plans.map((plan,i)=>(
          <div key={plan.id||i} style={{padding:'clamp(16px,3vw,24px)',borderRadius:20,position:'relative',overflow:'hidden',background:plan.highlight?'linear-gradient(135deg,rgba(237,25,102,0.07),rgba(33,82,164,0.04))':'var(--surface)',border:'2px solid '+(plan.highlight?'rgba(237,25,102,0.35)':'var(--border-2)'),boxShadow:plan.highlight?'0 16px 50px rgba(237,25,102,0.1)':'none'}}>
            {plan.badge&&<div style={{position:'absolute',top:14,right:14,padding:'3px 9px',borderRadius:999,background:plan.highlight?'var(--pink)':'linear-gradient(135deg,#C9A84C,#E8C97A)',color:plan.highlight?'#fff':'#0a0a0a',fontSize:10,fontWeight:700}}>{plan.badge}</div>}
            <div style={{fontSize:11,fontWeight:700,color:plan.color,textTransform:'uppercase',letterSpacing:0.7,marginBottom:5,paddingRight:plan.badge?60:0}}>{plan.name}</div>
            <div style={{fontSize:12,color:'var(--text-3)',marginBottom:16,paddingRight:plan.badge?40:0}}>{plan.desc}</div>
            <div style={{marginBottom:18}}>
              <span style={{fontSize:'clamp(28px,6vw,38px)',fontWeight:900,color:plan.highlight?'var(--pink)':'var(--text)',letterSpacing:-1.5,lineHeight:1}}>{price(plan)}</span>
              {plan.price_cop>0&&<div style={{fontSize:11,color:'var(--text-4)',marginTop:3}}>per month</div>}
            </div>
            {plan.id==='free'||plan.price_cop===0?(
              <button style={{width:'100%',padding:'11px',borderRadius:11,border:'1px solid var(--border-2)',background:'var(--surface-2)',color:'var(--text-2)',fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:16}}>{plan.cta}</button>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
                <button onClick={()=>checkout(plan.id,'wompi')} disabled={loading===plan.id+'wompi'} style={{width:'100%',padding:'11px',borderRadius:11,border:'none',background:plan.highlight?'var(--pink)':'var(--surface-2)',color:plan.highlight?'#fff':'var(--text)',fontSize:13,fontWeight:700,cursor:'pointer',border:plan.highlight?'none':'1px solid var(--border-2)',opacity:loading===plan.id+'wompi'?0.7:1,transition:'all 0.2s'}}>
                  {loading===plan.id+'wompi'?'..':'Pagar con Wompi (COP)'}
                </button>
                <button onClick={()=>checkout(plan.id,'stripe')} disabled={loading===plan.id+'stripe'} style={{width:'100%',padding:'11px',borderRadius:11,border:'1px solid var(--border-2)',background:'var(--surface-2)',color:'var(--text-2)',fontSize:13,fontWeight:600,cursor:'pointer',opacity:loading===plan.id+'stripe'?0.7:1}}>
                  {loading===plan.id+'stripe'?'..':'Pay with Stripe (USD)'}
                </button>
              </div>
            )}
            <div style={{height:1,background:'var(--border)',marginBottom:14}}/>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {plan.features.map((f,fi)=>(
                <div key={fi} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:f.included?(plan.highlight?'rgba(237,25,102,0.15)':'rgba(34,197,94,0.12)'):'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{color:f.included?(plan.highlight?'var(--pink)':'#22c55e'):'var(--text-4)',fontSize:9,fontWeight:900,lineHeight:1}}>{f.included?'v':'x'}</span>
                  </div>
                  <span style={{fontSize:12,color:f.included?'var(--text-2)':'var(--text-4)'}}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{padding:'14px 18px',borderRadius:13,background:'rgba(237,25,102,0.04)',border:'1px solid rgba(237,25,102,0.12)',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontSize:13,color:'var(--text-2)'}}>Pagos en Colombia: PSE, Nequi, Bancolombia, tarjetas via Wompi</span>
      </div>
    </div>
  )
}

function clamp(min:number, max:number) { return min }