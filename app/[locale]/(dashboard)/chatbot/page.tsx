'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Copy, RefreshCw, Save, Globe, Code, Smartphone, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const AGENT_TYPES = [
  { id:'general', label:'General', desc:'Handles all topics', color:'#6b7280' },
  { id:'sales', label:'Sales', desc:'Focus on conversions and deals', color:'#ED1966' },
  { id:'support', label:'Support', desc:'Resolves issues and tickets', color:'#2152A4' },
  { id:'info', label:'Info', desc:'Answers FAQs and general info', color:'#22c55e' },
]

const PLATFORMS = [
  { id:'web', label:'Website / Web App', icon:Globe, desc:'Any website or web app', snippet: (key:string, color:string, name:string) => `<!-- Add before </body> on your website -->
<script src="https://getjut.io/widget.js"
  data-key="${key}"
  data-color="${color}"
  data-agent="${name}"
  data-welcome="Hi! How can I help you today?">
</script>` },
  { id:'wordpress', label:'WordPress', icon:Globe, desc:'WordPress.com or self-hosted', snippet: (key:string, color:string, name:string) => `// Add to your WordPress theme's functions.php:
function jut_chatbot() { ?>
  <script src="https://getjut.io/widget.js"
    data-key="${key}"
    data-color="${color}"
    data-agent="${name}">
  </script>
<?php } add_action('wp_footer', 'jut_chatbot');` },
  { id:'shopify', label:'Shopify', icon:Globe, desc:'Any Shopify store', snippet: (key:string, color:string, name:string) => `<!-- Add to theme.liquid before </body> -->
<script src="https://getjut.io/widget.js"
  data-key="${key}"
  data-color="${color}"
  data-agent="${name}"
  data-welcome="Hi! Need help with your order?">
</script>` },
  { id:'react', label:'React / Next.js', icon:Code, desc:'React or Next.js apps', snippet: (key:string, color:string, name:string) => `// In your _app.tsx or layout.tsx:
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Script
        src="https://getjut.io/widget.js"
        data-key="${key}"
        data-color="${color}"
        data-agent="${name}"
        strategy="afterInteractive"
      />
    </>
  )
}` },
]

export default function ChatbotPage() {
  const [config, setConfig] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string|null>(null)
  const [platform, setPlatform] = useState('web')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [widgetColor, setWidgetColor] = useState('#ED1966')
  const [welcomeMsg, setWelcomeMsg] = useState('Hi! How can I help you today?')
  const [widgetPos, setWidgetPos] = useState('right')
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const [cfgRes, agentsRes] = await Promise.all([
      fetch('/api/chat/widget-config'),
      fetch('/api/agents'),
    ])
    const cfgData = await cfgRes.json()
    const agentsData = await agentsRes.json()
    if (cfgData.config) {
      setConfig(cfgData.config)
      setWidgetColor(cfgData.config.color || '#ED1966')
      setWelcomeMsg(cfgData.config.welcome_message || 'Hi! How can I help you today?')
      setWidgetPos(cfgData.config.position || 'right')
    }
    setAgents(agentsData.agents || [])
    setLoading(false)
  }

  async function generateKey() {
    setSaving(true)
    const res = await fetch('/api/chat/widget-config', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ color:widgetColor, position:widgetPos, welcome_message:welcomeMsg })
    })
    const data = await res.json()
    if (data.config) { setConfig(data.config); toast.success('Widget key generated!') }
    else toast.error(data.error || 'Failed')
    setSaving(false)
  }

  async function saveConfig() {
    if (!config) { await generateKey(); return }
    setSaving(true)
    const res = await fetch('/api/chat/widget-config', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ color:widgetColor, position:widgetPos, welcome_message:welcomeMsg })
    })
    const data = await res.json()
    if (data.config) { setConfig(data.config); toast.success('Saved!') }
    setSaving(false)
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id); toast.success('Copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  const activePlatform = PLATFORMS.find(p=>p.id===platform)
  const snippet = config?.widget_key && activePlatform ? activePlatform.snippet(config.widget_key, widgetColor, agents[0]?.name || 'Assistant') : ''

  if (loading) return <div style={{padding:32,color:'var(--text-3)'}}>Loading...</div>

  return (
    <div style={{padding:28,maxWidth:1100}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Chat Widget</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Embed your AI agent on any website with one line of code</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

        {/* LEFT — Config */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {/* Widget key */}
          <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:config?.widget_key?'#22c55e':'#6b7280'}}/>
              Widget Key
            </div>
            {config?.widget_key ? (
              <div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <code style={{flex:1,padding:'9px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',fontSize:12,fontFamily:'monospace',color:'var(--text-2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {config.widget_key}
                  </code>
                  <button onClick={()=>copy(config.widget_key,'key')} style={{padding:'9px 12px',borderRadius:9,background:'var(--pink)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontSize:12,fontWeight:600}}>
                    {copied==='key'?<><Check size={13}/> Copied</>:<><Copy size={13}/> Copy</>}
                  </button>
                </div>
                <p style={{fontSize:11,color:'var(--text-4)',marginTop:6}}>Active and receiving messages</p>
              </div>
            ) : (
              <div>
                <p style={{fontSize:13,color:'var(--text-3)',marginBottom:12}}>No widget key yet. Generate one to start embedding your agent.</p>
                <button onClick={generateKey} disabled={saving} style={{padding:'10px 20px',borderRadius:10,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}>
                  {saving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:null}
                  Generate Widget Key
                </button>
              </div>
            )}
          </div>

          {/* Customization */}
          <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Customization</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Widget Color</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="color" value={widgetColor} onChange={e=>setWidgetColor(e.target.value)} style={{width:44,height:38,borderRadius:9,border:'1px solid var(--border-2)',cursor:'pointer',padding:2}}/>
                  <input value={widgetColor} onChange={e=>setWidgetColor(e.target.value)} style={{flex:1,padding:'9px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:13,outline:'none',fontFamily:'monospace'}}/>
                  {['#ED1966','#2152A4','#22c55e','#C9A84C','#000000'].map(c=>(
                    <button key={c} onClick={()=>setWidgetColor(c)} style={{width:24,height:24,borderRadius:'50%',background:c,border:widgetColor===c?'2px solid #fff':'2px solid transparent',cursor:'pointer',flexShrink:0}}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Welcome Message</label>
                <input value={welcomeMsg} onChange={e=>setWelcomeMsg(e.target.value)} style={{width:'100%',padding:'9px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:13,outline:'none'}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:8}}>Position</label>
                <div style={{display:'flex',gap:8}}>
                  {['right','left'].map(pos=>(
                    <button key={pos} onClick={()=>setWidgetPos(pos)} style={{flex:1,padding:'8px',borderRadius:9,border:'2px solid '+(widgetPos===pos?'var(--pink)':'var(--border-2)'),background:widgetPos===pos?'rgba(237,25,102,0.07)':'var(--surface-2)',color:widgetPos===pos?'var(--text)':'var(--text-3)',cursor:'pointer',fontSize:13,fontWeight:widgetPos===pos?700:400,transition:'all 0.15s'}}>
                      {pos==='right'?'Bottom Right':'Bottom Left'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={saveConfig} disabled={saving} style={{marginTop:14,width:'100%',padding:'10px',borderRadius:10,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
              {saving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Save size={14}/>}
              {config?.widget_key ? 'Save Changes' : 'Generate Key & Save'}
            </button>
          </div>

          {/* Active agents */}
          {agents.length > 0 && (
            <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Agents on this widget</div>
              {agents.map(a => (
                <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',marginBottom:8}}>
                  <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,var(--pink),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0}}>{(a.name||'A').slice(0,1)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{a.name}</div>
                    <div style={{fontSize:11,color:'var(--text-4)'}}>{a.type||'general'} · {a.tone||'friendly'}</div>
                  </div>
                  <span style={{fontSize:11,padding:'2px 7px',borderRadius:999,background:AGENT_TYPES.find(t=>t.id===a.type)?.color+'20'||'rgba(34,197,94,0.1)',color:AGENT_TYPES.find(t=>t.id===a.type)?.color||'#22c55e',fontWeight:600}}>
                    {a.type||'general'}
                  </span>
                </div>
              ))}
              <p style={{fontSize:11,color:'var(--text-4)',marginTop:8}}>The router will automatically pick the best agent based on the visitor message.</p>
            </div>
          )}
        </div>

        {/* RIGHT — Integration code */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {/* Platform selector */}
          <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Platform</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {PLATFORMS.map(p=>(
                <button key={p.id} onClick={()=>setPlatform(p.id)} style={{padding:'10px 12px',borderRadius:11,border:'2px solid '+(platform===p.id?'var(--pink)':'var(--border-2)'),background:platform===p.id?'rgba(237,25,102,0.07)':'var(--surface-2)',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
                  <div style={{fontSize:13,fontWeight:platform===p.id?700:500,color:platform===p.id?'var(--text)':'var(--text-2)',marginBottom:2}}>{p.label}</div>
                  <div style={{fontSize:11,color:'var(--text-4)'}}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Code snippet */}
          <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)',flex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700}}>Installation Code</div>
              {snippet && (
                <button onClick={()=>copy(snippet,'snippet')} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,background:'rgba(237,25,102,0.08)',border:'1px solid rgba(237,25,102,0.2)',color:'var(--pink)',cursor:'pointer',fontSize:12,fontWeight:600}}>
                  {copied==='snippet'?<><Check size={12}/>Copied</>:<><Copy size={12}/>Copy</>}
                </button>
              )}
            </div>
            {config?.widget_key ? (
              <pre style={{padding:16,borderRadius:12,background:'#060610',border:'1px solid rgba(255,255,255,0.07)',fontSize:12,lineHeight:1.7,color:'#a0a0d0',fontFamily:'Monaco,Consolas,monospace',overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                {snippet}
              </pre>
            ) : (
              <div style={{padding:24,borderRadius:12,background:'var(--surface-2)',border:'1px dashed var(--border-2)',textAlign:'center'}}>
                <Code size={32} style={{opacity:0.15,display:'block',margin:'0 auto 10px',color:'var(--text-3)'}}/>
                <p style={{fontSize:13,color:'var(--text-4)'}}>Generate your widget key first to see the installation code</p>
              </div>
            )}
            {config?.widget_key && (
              <div style={{marginTop:12,padding:12,borderRadius:10,background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}>
                <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.6}}>
                  <strong>That is it.</strong> Just paste this snippet once and the chat widget appears automatically on every page of your website.
                </p>
              </div>
            )}
          </div>

          {/* Social connections */}
          <div style={{padding:22,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Social Media Connections</div>
            <p style={{fontSize:12,color:'var(--text-3)',marginBottom:14}}>Connect your agent to social platforms to automate DMs and comments.</p>
            {[
              {name:'Instagram',color:'#E1306C',status:'available',href:'/en/social'},
              {name:'WhatsApp Business',color:'#25D366',status:'coming_soon',href:'/en/social'},
              {name:'Facebook Messenger',color:'#1877F2',status:'coming_soon',href:'/en/social'},
              {name:'Telegram Bot',color:'#0088cc',status:'coming_soon',href:'/en/social'},
            ].map(s=>(
              <div key={s.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:28,height:28,borderRadius:8,background:s.color+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:s.color}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:500,color:'var(--text-2)'}}>{s.name}</span>
                </div>
                <a href={s.href} style={{fontSize:12,padding:'5px 10px',borderRadius:8,background:s.status==='available'?'var(--pink)':'var(--surface-2)',color:s.status==='available'?'#fff':'var(--text-3)',textDecoration:'none',fontWeight:600,border:s.status!=='available'?'1px solid var(--border-2)':'none'}}>
                  {s.status==='available'?'Connect':'Coming Soon'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}