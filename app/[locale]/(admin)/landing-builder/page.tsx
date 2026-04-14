'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

type BlockType = 'hero'|'features'|'stats'|'cta'|'text'|'image'|'testimonials'|'pricing'|'faq'

const BLOCK_LABELS: Record<BlockType,string> = {
  hero:'🚀 Hero Section', features:'✨ Features Grid', stats:'📊 Stats Bar',
  cta:'📣 CTA Banner', text:'📝 Text Block', image:'🖼️ Image',
  testimonials:'💬 Testimonials', pricing:'💰 Pricing Table', faq:'❓ FAQ',
}

const DEFAULTS: Record<BlockType,any> = {
  hero: { title:'Automate Every Conversation', subtitle:'Your subtitle here', cta:'Get Started Free', cta2:'See how it works', bg:'#050508' },
  features: { title:'Everything you need', items:[{icon:'🤖',title:'AI Agent',desc:'24/7 automated responses'},{icon:'⚡',title:'Automations',desc:'Set triggers, fire flows'},{icon:'📊',title:'Analytics',desc:'Real-time insights'}]},
  stats: { title:'By the numbers', items:[{value:'<3s',label:'Response time'},{value:'24/7',label:'Always on'},{value:'2×',label:'Conversion uplift'}]},
  cta: { title:'Ready to automate?', subtitle:'Start free. Scale fast.', cta:'Get Started' },
  text: { title:'Section Title', body:'Write your content here...' },
  image: { url:'', caption:'', alt:'' },
  testimonials: { title:'What our customers say', items:[{name:'Maria R.',role:'E-commerce',text:'JUT doubled our conversions!',rating:5}]},
  pricing: { title:'Simple pricing', plans:[{name:'Free',price:'$0',cta:'Start Free'},{name:'Growth',price:'$79',cta:'Get Growth',highlight:true},{name:'Elite',price:'$199',cta:'Get Elite'}]},
  faq: { title:'FAQ', items:[{q:'How does JUT work?',a:'JUT connects to your social channels and automates conversations using AI.'}]},
}

export default function LandingBuilderPage() {
  const [blocks, setBlocks] = useState<any[]>([
    { id:'1', type:'hero', ...DEFAULTS.hero },
    { id:'2', type:'features', ...DEFAULTS.features },
    { id:'3', type:'stats', ...DEFAULTS.stats },
    { id:'4', type:'cta', ...DEFAULTS.cta },
  ])
  const [selected, setSelected] = useState<string|null>('1')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function addBlock(type: BlockType) {
    const b = { id: Date.now().toString(), type, ...DEFAULTS[type] }
    setBlocks(p => [...p, b]); setSelected(b.id)
  }
  function removeBlock(id: string) { setBlocks(p => p.filter(x => x.id !== id)); if (selected===id) setSelected(null) }
  function moveBlock(id: string, dir: 'up'|'down') {
    setBlocks(p => {
      const idx = p.findIndex(x => x.id === id)
      if (dir==='up' && idx===0) return p; if (dir==='down' && idx===p.length-1) return p
      const arr = [...p]; const sw = dir==='up'?idx-1:idx+1
      ;[arr[idx],arr[sw]] = [arr[sw],arr[idx]]; return arr
    })
  }
  function upd(id: string, u: any) { setBlocks(p => p.map(x => x.id===id ? {...x,...u} : x)) }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('landing_config').upsert({ user_id: user.id, blocks, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaving(false)
    error ? toast.error('Save failed') : toast.success('Landing saved!')
  }

  const sel = blocks.find(b => b.id === selected)
  const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:13, outline:'none', marginTop:5 }

  return (
    <div style={{display:'flex',height:'calc(100vh - 68px)',overflow:'hidden'}}>
      {/* Left: Add Blocks */}
      <div style={{width:220,flexShrink:0,borderRight:'1px solid var(--border-2)',overflowY:'auto',background:'var(--surface)',padding:16}}>
        <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10}}>Add Block</p>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map(type => (
            <button key={type} onClick={()=>addBlock(type)}
              style={{display:'flex',alignItems:'center',gap:7,padding:'8px 10px',borderRadius:9,background:'transparent',border:'1px solid var(--border-2)',color:'var(--text-2)',cursor:'pointer',fontSize:13,textAlign:'left'}}>
              <Plus size={12}/> {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
        <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,margin:'20px 0 10px'}}>Structure</p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {blocks.map((b) => (
            <div key={b.id} onClick={()=>setSelected(b.id)}
              style={{padding:'8px 10px',borderRadius:9,background:selected===b.id?'rgba(237,25,102,0.1)':'var(--surface-2)',border:'1px solid '+(selected===b.id?'rgba(237,25,102,0.3)':'var(--border-2)'),cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <GripVertical size={11} color='var(--text-3)'/>
              <span style={{flex:1,fontSize:12,color:'var(--text)',fontWeight:selected===b.id?700:400}}>{BLOCK_LABELS[b.type as BlockType]||b.type}</span>
              <button onClick={e=>{e.stopPropagation();moveBlock(b.id,'up')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',padding:1}}><ChevronUp size={11}/></button>
              <button onClick={e=>{e.stopPropagation();moveBlock(b.id,'down')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',padding:1}}><ChevronDown size={11}/></button>
              <button onClick={e=>{e.stopPropagation();removeBlock(b.id)}} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:1}}><Trash2 size={11}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Canvas */}
      <div style={{flex:1,overflowY:'auto',background:'#020207',padding:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.3)'}}>Landing Page Canvas</span>
          <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,background:'var(--pink)',border:'none',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:700}}>
            <Save size={13}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:820,margin:'0 auto'}}>
          {blocks.map(b => (
            <div key={b.id} onClick={()=>setSelected(b.id)}
              style={{padding:16,borderRadius:12,border:'2px solid '+(selected===b.id?'#ED1966':'rgba(255,255,255,0.05)'),cursor:'pointer',background:'rgba(255,255,255,0.02)'}}>
              <div style={{fontSize:10,fontWeight:700,color:selected===b.id?'#ED1966':'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{b.type}</div>
              {b.type==='hero' && <div style={{textAlign:'center',padding:'16px 0'}}><h2 style={{fontSize:24,fontWeight:900,color:'#fff',marginBottom:6}}>{b.title}</h2><p style={{color:'rgba(255,255,255,0.4)',fontSize:13}}>{b.subtitle}</p></div>}
              {b.type==='text' && <div><h3 style={{color:'#fff',marginBottom:4,fontSize:16}}>{b.title}</h3><p style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{b.body?.slice(0,100)}</p></div>}
              {b.type==='cta' && <div style={{textAlign:'center',padding:8}}><h3 style={{color:'#fff',marginBottom:6,fontSize:18}}>{b.title}</h3><button style={{padding:'7px 18px',borderRadius:8,background:'#ED1966',color:'#fff',border:'none',fontWeight:700,cursor:'pointer',fontSize:13}}>{b.cta}</button></div>}
              {b.type==='features' && <div style={{display:'flex',gap:10}}>{b.items?.slice(0,3).map((f:any,i:number)=><div key={i} style={{flex:1,padding:8,borderRadius:8,background:'rgba(255,255,255,0.03)',textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.5)'}}>{f.icon} {f.title}</div>)}</div>}
              {b.type==='stats' && <div style={{display:'flex',gap:16,justifyContent:'center'}}>{b.items?.map((s:any,i:number)=><div key={i} style={{textAlign:'center'}}><div style={{fontSize:20,fontWeight:900,color:'#fff'}}>{s.value}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{s.label}</div></div>)}</div>}
              {(b.type==='pricing'||b.type==='testimonials'||b.type==='faq'||b.type==='image') && <div style={{textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.3)',padding:8}}>{BLOCK_LABELS[b.type as BlockType]} — click to edit</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Properties */}
      {sel && (
        <div style={{width:260,flexShrink:0,borderLeft:'1px solid var(--border-2)',overflowY:'auto',background:'var(--surface)',padding:16}}>
          <p style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:16}}>{BLOCK_LABELS[sel.type as BlockType]} Settings</p>
          {(sel.type==='hero'||sel.type==='cta'||sel.type==='text') && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {['title','subtitle','cta','cta2','body'].filter(k=>sel[k]!==undefined).map(k=>(
                <div key={k}>
                  <label style={{fontSize:12,color:'var(--text-3)',textTransform:'capitalize'}}>{k}</label>
                  {k==='body'||k==='subtitle' ? <textarea value={sel[k]||''} onChange={e=>upd(sel.id,{[k]:e.target.value})} rows={3} style={{...inp,resize:'vertical'}}/> : <input value={sel[k]||''} onChange={e=>upd(sel.id,{[k]:e.target.value})} style={inp}/>}
                </div>
              ))}
              {sel.type==='hero' && <div><label style={{fontSize:12,color:'var(--text-3)'}}>Background</label><div style={{display:'flex',gap:6,marginTop:5}}><input type='color' value={sel.bg||'#050508'} onChange={e=>upd(sel.id,{bg:e.target.value})} style={{width:40,height:34,borderRadius:8,border:'none',cursor:'pointer'}}/><input value={sel.bg||''} onChange={e=>upd(sel.id,{bg:e.target.value})} style={{...inp,marginTop:0,flex:1,fontFamily:'monospace'}}/></div></div>}
            </div>
          )}
          {sel.type==='image' && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{fontSize:12,color:'var(--text-3)'}}>Image URL</label><input value={sel.url||''} onChange={e=>upd(sel.id,{url:e.target.value})} placeholder='https://...' style={inp}/></div>
              <div><label style={{fontSize:12,color:'var(--text-3)'}}>Alt text</label><input value={sel.alt||''} onChange={e=>upd(sel.id,{alt:e.target.value})} style={inp}/></div>
              {sel.url && <img src={sel.url} alt={sel.alt} style={{width:'100%',borderRadius:8}}/>}
            </div>
          )}
          {(sel.type==='features'||sel.type==='stats'||sel.type==='testimonials'||sel.type==='faq'||sel.type==='pricing') && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{fontSize:12,color:'var(--text-3)'}}>Section Title</label><input value={sel.title||''} onChange={e=>upd(sel.id,{title:e.target.value})} style={inp}/></div>
              <div><label style={{fontSize:12,color:'var(--text-3)'}}>Items (JSON)</label><textarea value={JSON.stringify(sel.items||sel.plans||[],null,2)} onChange={e=>{try{const v=JSON.parse(e.target.value);upd(sel.id,sel.plans?{plans:v}:{items:v})}catch{}}} rows={8} style={{...inp,resize:'vertical',fontFamily:'monospace',fontSize:11}}/></div>
            </div>
          )}
          <button onClick={()=>removeBlock(sel.id)} style={{width:'100%',marginTop:16,padding:'9px',borderRadius:9,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontWeight:600,cursor:'pointer',fontSize:13}}>
            Remove Block
          </button>
        </div>
      )}
    </div>
  )
}