'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, EyeOff, RefreshCw, Check, Monitor, Smartphone, Tablet, Undo, Redo, Settings2, Type, Palette, Layout } from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_CONFIG = {
  hero: { headline:'Automate Every Conversation.', subheadline:'JUT connects to Instagram, WhatsApp and more — capturing leads and closing deals while you sleep.', cta_primary:'Get Started Free', cta_secondary:'See how it works', bg_color:'#050508' },
  features: { title:'Everything you need to automate', items:[{icon:'🤖',title:'AI Agent',desc:'24/7 automated responses'},{icon:'⚡',title:'Automations',desc:'Set triggers, fire flows instantly'},{icon:'📊',title:'Analytics',desc:'Real-time insights'},{icon:'🎨',title:'Creative AI',desc:'Score and improve creatives'}] },
  stats: { items:[{value:'<3s',label:'Response time'},{value:'24/7',label:'Always on'},{value:'2×',label:'Conversion uplift'},{value:'∞',label:'Conversations'}] },
  cta: { title:'Ready to automate?', subtitle:'Start free. Scale fast.', button:"Get Started — It's Free" },
  colors: { primary:'#ED1966', text:'#f0f0fc', bg:'#050508' },
  fonts: { headline:'Syne', body:'DM Sans' },
  navbar: { logo:'JUT', links:['Features','Pricing'] },
}

type DeviceMode = 'desktop'|'tablet'|'mobile'

export default function LandingBuilderPage() {
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [activeSection, setActiveSection] = useState<string|null>('hero')
  const [history, setHistory] = useState<any[]>([DEFAULT_CONFIG])
  const [historyIdx, setHistoryIdx] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const supabase = createClient()

  useEffect(() => { loadConfig() }, [])

  // Send config to iframe whenever it changes
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    const send = () => iframe.contentWindow?.postMessage({ type:'JUT_CONFIG_UPDATE', config }, '*')
    // Small delay to ensure iframe is ready
    const t = setTimeout(send, 100)
    return () => clearTimeout(t)
  }, [config])

  async function loadConfig() {
    try {
      const res = await fetch('/api/landing')
      const data = await res.json()
      if (data.config) {
        setConfig(data.config)
        setHistory([data.config])
      }
    } catch(e) { console.error('Failed to load config:', e) }
  }

  function updateConfig(path: string[], value: any) {
    const next = JSON.parse(JSON.stringify(config))
    let obj = next
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]]
    obj[path[path.length - 1]] = value
    setConfig(next)
    // Add to history
    const newHistory = history.slice(0, historyIdx + 1)
    newHistory.push(next)
    setHistory(newHistory)
    setHistoryIdx(newHistory.length - 1)
  }

  function undo() {
    if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setConfig(history[historyIdx - 1]) }
  }
  function redo() {
    if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setConfig(history[historyIdx + 1]) }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/landing', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ config }) })
      if (!res.ok) { toast.error('Failed to save'); return }
      setSaved(true); toast.success('Landing page saved and published!')
      setTimeout(() => setSaved(false), 2500)
    } catch(e:any) { toast.error(e.message) } finally { setSaving(false) }
  }

  const deviceWidth = { desktop:'100%', tablet:'768px', mobile:'390px' }[device]

  const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:13, outline:'none', marginTop:5, transition:'border-color 0.2s' }

  const SECTIONS = [
    { id:'hero', label:'Hero Section', icon:'🚀' },
    { id:'stats', label:'Stats Bar', icon:'📊' },
    { id:'features', label:'Features', icon:'✨' },
    { id:'cta', label:'CTA Section', icon:'📣' },
    { id:'colors', label:'Colors & Fonts', icon:'🎨' },
    { id:'navbar', label:'Navigation', icon:'🔗' },
  ]

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)', overflow:'hidden', fontFamily:'var(--font-body)' }}>

      {/* LEFT PANEL — Section picker + properties */}
      <div style={{ width:280, flexShrink:0, background:'var(--bg-2)', borderRight:'1px solid var(--border-2)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:8 }}>
          <Layout size={16} color="var(--pink)"/>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>Page Editor</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            <button onClick={undo} disabled={historyIdx===0} title="Undo" style={{ padding:5, borderRadius:7, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:historyIdx===0?'var(--text-4)':'var(--text-2)', cursor:historyIdx===0?'not-allowed':'pointer' }}>
              <Undo size={13}/>
            </button>
            <button onClick={redo} disabled={historyIdx===history.length-1} title="Redo" style={{ padding:5, borderRadius:7, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:historyIdx===history.length-1?'var(--text-4)':'var(--text-2)', cursor:historyIdx===history.length-1?'not-allowed':'pointer' }}>
              <Redo size={13}/>
            </button>
          </div>
        </div>

        {/* Section list */}
        <div style={{ padding:10, borderBottom:'1px solid var(--border-2)' }}>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:7, paddingLeft:4 }}>Sections</p>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:10, border:'none', cursor:'pointer', background:activeSection===s.id?'rgba(237,25,102,0.1)':'transparent', color:activeSection===s.id?'var(--text)':'var(--text-3)', fontSize:13, fontWeight:activeSection===s.id?600:400, textAlign:'left', marginBottom:2, borderLeft:activeSection===s.id?'2px solid var(--pink)':'2px solid transparent' }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* Section properties */}
        <div style={{ flex:1, overflowY:'auto', padding:14 }}>

          {activeSection === 'hero' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>Hero Section</p>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Headline</label>
                <textarea value={config.hero?.headline||''} onChange={e=>updateConfig(['hero','headline'],e.target.value)} rows={2} style={{ ...inp, resize:'vertical', lineHeight:1.5 }}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Subheadline</label>
                <textarea value={config.hero?.subheadline||''} onChange={e=>updateConfig(['hero','subheadline'],e.target.value)} rows={3} style={{ ...inp, resize:'vertical', lineHeight:1.5 }}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Primary CTA Button</label>
                <input value={config.hero?.cta_primary||''} onChange={e=>updateConfig(['hero','cta_primary'],e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Secondary CTA</label>
                <input value={config.hero?.cta_secondary||''} onChange={e=>updateConfig(['hero','cta_secondary'],e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Background Color</label>
                <div style={{ display:'flex', gap:7, marginTop:5 }}>
                  <input type="color" value={config.hero?.bg_color||'#050508'} onChange={e=>updateConfig(['hero','bg_color'],e.target.value)} style={{ width:40, height:34, borderRadius:8, border:'1px solid var(--border-2)', cursor:'pointer', padding:2 }}/>
                  <input value={config.hero?.bg_color||''} onChange={e=>updateConfig(['hero','bg_color'],e.target.value)} style={{ ...inp, marginTop:0, flex:1, fontFamily:'monospace', fontSize:12 }}/>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>Stats Bar</p>
              {(config.stats?.items||[]).map((item:any, i:number) => (
                <div key={i} style={{ padding:12, borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)' }}>
                  <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:7 }}>Stat {i+1}</div>
                  <input value={item.value||''} onChange={e=>{ const items=[...config.stats.items]; items[i]={...items[i],value:e.target.value}; updateConfig(['stats','items'],items) }} placeholder="Value (e.g. <3s)" style={{ ...inp, marginBottom:7 }}/>
                  <input value={item.label||''} onChange={e=>{ const items=[...config.stats.items]; items[i]={...items[i],label:e.target.value}; updateConfig(['stats','items'],items) }} placeholder="Label (e.g. Response time)" style={{ ...inp, marginTop:0 }}/>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'features' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>Features Grid</p>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Section Title</label>
                <input value={config.features?.title||''} onChange={e=>updateConfig(['features','title'],e.target.value)} style={inp}/>
              </div>
              {(config.features?.items||[]).map((item:any, i:number) => (
                <div key={i} style={{ padding:12, borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)' }}>
                  <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:7, display:'flex', justifyContent:'space-between' }}>
                    Feature {i+1}
                    <button onClick={()=>{ const items=config.features.items.filter((_:any,j:number)=>j!==i); updateConfig(['features','items'],items) }} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:11 }}>Remove</button>
                  </div>
                  <input value={item.icon||''} onChange={e=>{ const items=[...config.features.items]; items[i]={...items[i],icon:e.target.value}; updateConfig(['features','items'],items) }} placeholder="Icon emoji" style={{ ...inp, marginBottom:6 }}/>
                  <input value={item.title||''} onChange={e=>{ const items=[...config.features.items]; items[i]={...items[i],title:e.target.value}; updateConfig(['features','items'],items) }} placeholder="Title" style={{ ...inp, marginBottom:6, marginTop:0 }}/>
                  <input value={item.desc||''} onChange={e=>{ const items=[...config.features.items]; items[i]={...items[i],desc:e.target.value}; updateConfig(['features','items'],items) }} placeholder="Description" style={{ ...inp, marginTop:0 }}/>
                </div>
              ))}
              <button onClick={()=>updateConfig(['features','items'],[...(config.features?.items||[]),{icon:'⭐',title:'New Feature',desc:'Description here'}])} style={{ padding:'8px 14px', borderRadius:9, background:'rgba(237,25,102,0.08)', border:'1px solid rgba(237,25,102,0.2)', color:'var(--pink)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                + Add Feature
              </button>
            </div>
          )}

          {activeSection === 'cta' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>CTA Section</p>
              <div><label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Title</label><input value={config.cta?.title||''} onChange={e=>updateConfig(['cta','title'],e.target.value)} style={inp}/></div>
              <div><label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Subtitle</label><input value={config.cta?.subtitle||''} onChange={e=>updateConfig(['cta','subtitle'],e.target.value)} style={inp}/></div>
              <div><label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Button Text</label><input value={config.cta?.button||''} onChange={e=>updateConfig(['cta','button'],e.target.value)} style={inp}/></div>
            </div>
          )}

          {activeSection === 'colors' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>Colors & Typography</p>
              {[['Primary Color','colors','primary'],['Background','colors','bg'],['Text Color','colors','text']].map(([name,group,key]) => (
                <div key={key}>
                  <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>{name}</label>
                  <div style={{ display:'flex', gap:7, marginTop:5 }}>
                    <input type="color" value={(config as any)[group]?.[key]||'#ffffff'} onChange={e=>updateConfig([group,key],e.target.value)} style={{ width:40, height:34, borderRadius:8, border:'1px solid var(--border-2)', cursor:'pointer', padding:2 }}/>
                    <input value={(config as any)[group]?.[key]||''} onChange={e=>updateConfig([group,key],e.target.value)} style={{ ...inp, marginTop:0, flex:1, fontFamily:'monospace', fontSize:12 }}/>
                  </div>
                  <div style={{ marginTop:6, height:20, borderRadius:6, background:(config as any)[group]?.[key]||'transparent', border:'1px solid var(--border-2)' }}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Headline Font</label>
                <select value={config.fonts?.headline||'Syne'} onChange={e=>updateConfig(['fonts','headline'],e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['Syne','Inter','DM Sans','Poppins','Roboto','Montserrat','Playfair Display','Space Grotesk'].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Body Font</label>
                <select value={config.fonts?.body||'DM Sans'} onChange={e=>updateConfig(['fonts','body'],e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['DM Sans','Inter','Roboto','Open Sans','Lato','Source Sans Pro','Nunito'].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}

          {activeSection === 'navbar' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7 }}>Navigation</p>
              <div><label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Logo Text</label><input value={config.navbar?.logo||''} onChange={e=>updateConfig(['navbar','logo'],e.target.value)} style={inp}/></div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>Nav Links (comma separated)</label>
                <input value={(config.navbar?.links||[]).join(', ')} onChange={e=>updateConfig(['navbar','links'],e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean))} placeholder="Features, Pricing, Blog" style={inp}/>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding:12, borderTop:'1px solid var(--border-2)' }}>
          <button onClick={save} disabled={saving} style={{ width:'100%', padding:'11px', borderRadius:11, background:saved?'#22c55e':'var(--pink)', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'background 0.2s' }}>
            {saved?<><Check size={15}/> Published!</>:saving?<><RefreshCw size={15} style={{ animation:'spin 0.8s linear infinite' }}/> Saving...</>:<><Save size={15}/> Save & Publish</>}
          </button>
        </div>
      </div>

      {/* CENTER — Live preview iframe */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#111118', overflow:'hidden' }}>

        {/* Preview toolbar */}
        <div style={{ padding:'10px 16px', background:'var(--surface)', borderBottom:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444' }}/>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b' }}/>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e' }}/>
            <div style={{ flex:1, marginLeft:8, padding:'4px 12px', borderRadius:7, background:'var(--surface-2)', border:'1px solid var(--border-2)', fontSize:12, color:'var(--text-4)' }}>
              getjut.io
            </div>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {([['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]] as const).map(([d,Icon])=>(
              <button key={d} onClick={()=>setDevice(d)} title={d} style={{ padding:'5px 8px', borderRadius:8, border:'none', cursor:'pointer', background:device===d?'rgba(237,25,102,0.1)':'transparent', color:device===d?'var(--pink)':'var(--text-4)' }}>
                <Icon size={16}/>
              </button>
            ))}
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text-3)', fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
            <Eye size={12}/> Open live
          </a>
        </div>

        {/* iframe wrapper */}
        <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center', alignItems:'flex-start', padding:'20px', background:'#0a0a12' }}>
          <div style={{ width:deviceWidth, minHeight:'100%', background:'#050508', borderRadius:device==='desktop'?0:16, overflow:'hidden', boxShadow:device==='desktop'?'none':'0 20px 60px rgba(0,0,0,0.8)', transition:'width 0.3s ease' }}>
            <iframe
              ref={iframeRef}
              src="/en?preview=1"
              style={{ width:'100%', height:'calc(100vh - 140px)', border:'none', display:'block' }}
              title="Landing page preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}