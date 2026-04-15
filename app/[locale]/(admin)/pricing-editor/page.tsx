'use client'
import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Check, X, RefreshCw, Star, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_PLANS = [
  { id:'free', name:'Free', price_cop:0, price_usd:0, color:'#6b7280', badge:null, highlight:false, desc:'Perfect to get started and explore JUT', cta:'Get Started Free',
    features:[{text:'1 active automation',included:true},{text:'100 conversations/month',included:true},{text:'1 social account',included:true},{text:'Basic AI Agent',included:true},{text:'Creative Analyzer (3/month)',included:true},{text:'Analytics dashboard',included:true},{text:'Heatmap & Focus Map',included:false},{text:'Improvement Plan',included:false},{text:'Creative Variants',included:false},{text:'WhatsApp Business',included:false},{text:'Priority support',included:false},{text:'White-label',included:false}]},
  { id:'growth', name:'Growth', price_cop:320000, price_usd:79, color:'#ED1966', badge:'Most Popular', highlight:true, desc:'For businesses ready to automate and scale', cta:'Get Growth',
    features:[{text:'20 active automations',included:true},{text:'5,000 conversations/month',included:true},{text:'3 social accounts',included:true},{text:'Advanced AI Agent',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Analytics + exports',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (10/month)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support',included:false},{text:'White-label',included:false}]},
  { id:'elite', name:'Elite', price_cop:800000, price_usd:199, color:'#C9A84C', badge:'Best Value', highlight:false, desc:'Unlimited power for agencies and serious businesses', cta:'Get Elite',
    features:[{text:'Unlimited automations',included:true},{text:'Unlimited conversations',included:true},{text:'Unlimited social accounts',included:true},{text:'Custom AI Agent persona',included:true},{text:'Creative Analyzer (unlimited)',included:true},{text:'Advanced analytics + API',included:true},{text:'Heatmap & Focus Map',included:true},{text:'Improvement Plan',included:true},{text:'Creative Variants (unlimited)',included:true},{text:'WhatsApp Business',included:true},{text:'Priority support 24/7',included:true},{text:'White-label platform',included:true}]},
]

export default function PricingEditorPage() {
  const [plans, setPlans] = useState(DEFAULT_PLANS)
  const [selected, setSelected] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { if (d.plans?.length) setPlans(d.plans) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to save'); return }
      setSaved(true)
      toast.success('Pricing saved! /pricing page is now updated live.')
      setTimeout(() => setSaved(false), 2500)
    } catch(e:any) { toast.error(e.message) } finally { setSaving(false) }
  }

  function updatePlan(idx:number, key:string, val:any) { setPlans(p=>p.map((plan,i)=>i===idx?{...plan,[key]:val}:plan)) }
  function addFeature(pi:number) { updatePlan(pi,'features',[...plans[pi].features,{text:'New feature',included:true}]) }
  function updateFeature(pi:number,fi:number,key:string,val:any) { const f=plans[pi].features.map((x,i)=>i===fi?{...x,[key]:val}:x); updatePlan(pi,'features',f) }
  function removeFeature(pi:number,fi:number) { updatePlan(pi,'features',plans[pi].features.filter((_,i)=>i!==fi)) }
  function moveFeature(pi:number,fi:number,dir:'up'|'down') {
    const f=[...plans[pi].features]; const sw=dir==='up'?fi-1:fi+1
    if(sw<0||sw>=f.length)return;[f[fi],f[sw]]=[f[sw],f[fi]];updatePlan(pi,'features',f)
  }
  function addPlan() { setPlans(p=>[...p,{id:'plan_'+Date.now(),name:'New Plan',price_cop:0,price_usd:0,color:'#6b7280',badge:null,highlight:false,desc:'Plan description',cta:'Get Started',features:[{text:'Feature 1',included:true}]}]);setSelected(plans.length) }
  function removePlan(idx:number) { if(plans.length<=1){toast.error('Need at least 1 plan');return};if(!confirm('Remove this plan?'))return;setPlans(p=>p.filter((_,i)=>i!==idx));setSelected(Math.max(0,idx-1)) }

  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:13,outline:'none',marginTop:5}
  if(loading)return<div style={{padding:32,color:'var(--text-3)',display:'flex',alignItems:'center',gap:10}}><div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--border-2)',borderTopColor:'var(--pink)',animation:'spin 0.8s linear infinite'}}/>Loading current plans...</div>
  const plan=plans[selected]

  return(
    <div style={{padding:28,maxWidth:1200}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Pricing Editor</h1>
          <p style={{fontSize:14,color:'var(--text-3)'}}>Changes go live on /pricing immediately after saving.</p>
        </div>
        <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 22px',borderRadius:12,background:saved?'#22c55e':'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',transition:'background 0.2s'}}>
          {saved?<><Check size={15}/>Saved & Live!</>:saving?<><RefreshCw size={15} style={{animation:'spin 0.8s linear infinite'}}/>Saving...</>:<><Save size={15}/>Save & Publish</>}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20,alignItems:'start'}}>
        {/* Plan list */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.7,marginBottom:4}}>Plans ({plans.length})</div>
          {plans.map((p,i)=>(
            <div key={p.id||i} onClick={()=>setSelected(i)} style={{padding:'12px 14px',borderRadius:12,cursor:'pointer',background:selected===i?'rgba(237,25,102,0.08)':'var(--surface)',border:'1px solid '+(selected===i?'rgba(237,25,102,0.25)':'var(--border-2)'),display:'flex',alignItems:'center',gap:10,transition:'all 0.15s',borderLeft:selected===i?'3px solid var(--pink)':'3px solid transparent'}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:p.color,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{p.name}</div>
                <div style={{fontSize:11,color:'var(--text-4)'}}>{p.price_cop===0?'Free':'$'+p.price_usd+' USD'} · {p.features.length} features</div>
              </div>
              {p.highlight&&<Star size={11} color="var(--pink)" fill="var(--pink)"/>}
            </div>
          ))}
          <button onClick={addPlan} style={{padding:'9px',borderRadius:11,background:'var(--surface)',border:'1px dashed var(--border-2)',color:'var(--text-3)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:4}}>
            <Plus size={13}/>Add Plan
          </button>
          {/* Mini preview */}
          <div style={{marginTop:8,padding:14,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.7,marginBottom:10}}>Card Preview</div>
            <div style={{padding:'14px 12px',borderRadius:14,background:plan.highlight?'linear-gradient(135deg,rgba(237,25,102,0.08),rgba(33,82,164,0.05))':'var(--surface-2)',border:'2px solid '+(plan.highlight?plan.color+'40':'var(--border-2)'),position:'relative'}}>
              {plan.badge&&<div style={{position:'absolute',top:8,right:8,padding:'2px 7px',borderRadius:999,background:plan.color,color:'#fff',fontSize:9,fontWeight:700}}>{plan.badge}</div>}
              <div style={{fontSize:9,fontWeight:700,color:plan.color,textTransform:'uppercase',letterSpacing:0.6,marginBottom:3}}>{plan.name}</div>
              <div style={{fontSize:24,fontWeight:900,color:plan.highlight?'var(--pink)':'var(--text)',letterSpacing:-1,marginBottom:4,fontFamily:'var(--font-display)'}}>{plan.price_cop===0?'Free':'$'+plan.price_usd}</div>
              <div style={{fontSize:10,color:'var(--text-4)',marginBottom:10,lineHeight:1.4}}>{plan.desc.slice(0,50)}</div>
              <button style={{width:'100%',padding:'7px',borderRadius:8,background:plan.highlight?plan.color:'var(--surface-3)',border:'none',color:plan.highlight?'#fff':'var(--text-2)',fontSize:11,fontWeight:700,cursor:'pointer'}}>{plan.cta}</button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div style={{background:'var(--surface)',borderRadius:20,border:'1px solid var(--border-2)',overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:11,height:11,borderRadius:'50%',background:plan.color}}/>
              <span style={{fontSize:15,fontWeight:700}}>Editing: {plan.name}</span>
            </div>
            <button onClick={()=>removePlan(selected)} style={{padding:'5px 11px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
              <Trash2 size={11}/>Remove
            </button>
          </div>

          <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
            {/* Basic info */}
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.6}}>Basic Info</div>
              <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Plan Name</label><input value={plan.name} onChange={e=>updatePlan(selected,'name',e.target.value)} style={inp}/></div>
              <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Description</label><textarea value={plan.desc} onChange={e=>updatePlan(selected,'desc',e.target.value)} rows={2} style={{...inp,resize:'vertical'}}/></div>
              <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>CTA Button Text</label><input value={plan.cta} onChange={e=>updatePlan(selected,'cta',e.target.value)} style={inp}/></div>
              <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Badge (optional)</label><input value={plan.badge||''} onChange={e=>updatePlan(selected,'badge',e.target.value||null)} placeholder="Most Popular, Best Value..." style={inp}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Price COP</label><input type="number" value={plan.price_cop} onChange={e=>updatePlan(selected,'price_cop',Number(e.target.value))} style={inp}/></div>
                <div><label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Price USD</label><input type="number" value={plan.price_usd} onChange={e=>updatePlan(selected,'price_usd',Number(e.target.value))} style={inp}/></div>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>Accent Color</label>
                <div style={{display:'flex',gap:7,marginTop:5}}>
                  <input type="color" value={plan.color} onChange={e=>updatePlan(selected,'color',e.target.value)} style={{width:40,height:34,borderRadius:8,border:'1px solid var(--border-2)',cursor:'pointer',padding:2}}/>
                  <input value={plan.color} onChange={e=>updatePlan(selected,'color',e.target.value)} style={{...inp,marginTop:0,flex:1,fontFamily:'monospace',fontSize:12}}/>
                </div>
                <div style={{marginTop:6,height:18,borderRadius:5,background:plan.color}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 13px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>Featured / Highlighted</div>
                  <div style={{fontSize:11,color:'var(--text-4)',marginTop:1}}>Adds glow border, larger card</div>
                </div>
                <div onClick={()=>updatePlan(selected,'highlight',!plan.highlight)} style={{width:40,height:22,borderRadius:999,background:plan.highlight?'var(--pink)':'var(--surface-3)',position:'relative',cursor:'pointer',flexShrink:0,transition:'background 0.2s'}}>
                  <div style={{position:'absolute',top:2,left:plan.highlight?19:2,width:17,height:17,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}/>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.6}}>Features ({plan.features.length})</div>
                <button onClick={()=>addFeature(selected)} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 9px',borderRadius:8,background:'rgba(237,25,102,0.08)',border:'1px solid rgba(237,25,102,0.2)',color:'var(--pink)',cursor:'pointer',fontSize:11,fontWeight:600}}>
                  <Plus size={11}/>Add
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:440,overflowY:'auto',paddingRight:2}}>
                {plan.features.map((f,fi)=>(
                  <div key={fi} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 9px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                    <div onClick={()=>updateFeature(selected,fi,'included',!f.included)} style={{width:19,height:19,borderRadius:'50%',background:f.included?(plan.highlight?'rgba(237,25,102,0.2)':'rgba(34,197,94,0.15)'):'var(--surface-3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,border:'1px solid '+(f.included?(plan.highlight?'rgba(237,25,102,0.3)':'rgba(34,197,94,0.25)'):'var(--border-2)'),transition:'all 0.15s'}}>
                      {f.included?<Check size={10} color={plan.highlight?'var(--pink)':'#22c55e'} strokeWidth={3}/>:<X size={9} color="var(--text-4)" strokeWidth={2.5}/>}
                    </div>
                    <input value={f.text} onChange={e=>updateFeature(selected,fi,'text',e.target.value)} style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:12,color:'var(--text-2)',padding:'2px 0'}}/>
                    <div style={{display:'flex',flexDirection:'column',gap:1,flexShrink:0}}>
                      <button onClick={()=>moveFeature(selected,fi,'up')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-4)',padding:1,lineHeight:1}}><ArrowUp size={9}/></button>
                      <button onClick={()=>moveFeature(selected,fi,'down')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-4)',padding:1,lineHeight:1}}><ArrowDown size={9}/></button>
                    </div>
                    <button onClick={()=>removeFeature(selected,fi)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:2,flexShrink:0,opacity:0.6}}><X size={11}/></button>
                  </div>
                ))}
              </div>
              <p style={{fontSize:10,color:'var(--text-4)',marginTop:8,lineHeight:1.5}}>Click circle = toggle included. Click text = edit. Arrows = reorder.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}