'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IcoBox, IcoHelpCircle, IcoMessageSquare, IcoFileText, IcoShield, IcoGraduationCap } from '@/components/ui/Icons'
import { Bot, Save, RefreshCw, Check, MessageSquare, Target, BookOpen, Tag, Play, ChevronRight, Sparkles, Building2, User, Upload, Trash2, FileType, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'identity', label:'Identity', icon:User },
  { id:'personality', label:'Personality', icon:Sparkles },
  { id:'knowledge', label:'Knowledge', icon:BookOpen },
  { id:'offers', label:'Offers', icon:Tag },
  { id:'rules', label:'Rules', icon:Target },
  { id:'test', label:'Test Bot', icon:Play },
]

const TONES = [
  { id:'friendly', label:'Friendly', desc:'Warm and approachable' },
  { id:'professional', label:'Professional', desc:'Formal and polished' },
  { id:'casual', label:'Casual', desc:'Relaxed and conversational' },
  { id:'enthusiastic', label:'Enthusiastic', desc:'Energetic and exciting' },
  { id:'empathetic', label:'Empathetic', desc:'Understanding and caring' },
]

const RESPONSE_LENGTHS = [
  { id:'short', label:'Short', desc:'1-2 sentences, quick answers' },
  { id:'medium', label:'Medium', desc:'2-4 sentences, balanced' },
  { id:'detailed', label:'Detailed', desc:'4+ sentences, thorough' },
]

const BUSINESS_TYPES = [
  'E-commerce','Services','Coaching','Restaurant','Fashion / Beauty',
  'Real Estate','Education','Fitness','Technology','Healthcare','Other'
]

const LANGUAGES = [
  { code:'es', label:'Espanol', region:'Colombia' },
  { code:'en', label:'English', region:'USA' },
  { code:'pt', label:'Portugues', region:'Brasil' },
  { code:'fr', label:'Francais', region:'France' },
]

// Avatar options as colored initials â no emojis
const AVATARS = [
  { id:'S', bg:'linear-gradient(135deg,#ED1966,#b0124e)' },
  { id:'A', bg:'linear-gradient(135deg,#2152A4,#1a3d7a)' },
  { id:'M', bg:'linear-gradient(135deg,#C9A84C,#8B6914)' },
  { id:'J', bg:'linear-gradient(135deg,#22c55e,#15803d)' },
  { id:'R', bg:'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { id:'K', bg:'linear-gradient(135deg,#f59e0b,#b45309)' },
  { id:'L', bg:'linear-gradient(135deg,#06b6d4,#0e7490)' },
  { id:'N', bg:'linear-gradient(135deg,#ef4444,#b91c1c)' },
]

const DEFAULT_AGENT = {
  name: 'Sofia',
  role: 'Sales & Support Agent',
  avatar: 'S',
  avatarBg: 'linear-gradient(135deg,#ED1966,#b0124e)',
  language: 'en',
  business_name: '',
  business_type: '',
  instagram: '',
  whatsapp: '',
  tone: 'friendly',
  response_length: 'medium',
  personality_traits: ['helpful','professional'],
  knowledge: '',
  offers: '',
  rules: '',
}

export default function AgentPage() {
  const [tab, setTab] = useState('identity')
  const [agent, setAgent] = useState(DEFAULT_AGENT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testing, setTesting] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role:string;msg:string}[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { load(); loadDocs() }, [])

  async function load() {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('agent_configs').select('*').eq('user_id', user.id).single()
    if (data?.config) setAgent({ ...DEFAULT_AGENT, ...data.config })
  }

  async function loadDocs() {
    setDocsLoading(true)
    try {
      const res = await fetch('/api/agent/knowledge')
      const data = await res.json()
      setDocs(data.docs || [])
    } catch(e) {} finally { setDocsLoading(false) }
  }

  async function uploadDoc(file: File, docType: string) {
    setUploading(true)
    setUploadProgress('Uploading ' + file.name + '...')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', docType)
      form.append('name', file.name.replace(/\.[^.]+$/, ''))
      const res = await fetch('/api/agent/knowledge/upload', { method:'POST', body:form })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Upload failed'); return }
      toast.success(file.name + ' uploaded!')
      loadDocs()
    } catch(e:any) { toast.error(e.message) } finally { setUploading(false); setUploadProgress('') }
  }

  async function deleteDoc(id: string, name: string) {
    if (!confirm('Delete "' + name + '"?')) return
    const res = await fetch('/api/agent/knowledge', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    if (res.ok) { toast.success('Deleted'); loadDocs() } else toast.error('Failed')
  }

  async function save() {
    setSaving(true)
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('agent_configs').upsert({ user_id:user.id, config:agent, updated_at:new Date().toISOString() }, { onConflict:'user_id' })
    setSaving(false)
    if (error) { toast.error('Failed: ' + error.message); return }
    setSaved(true); toast.success('Agent saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  async function testBot() {
    if (!testMsg.trim()) return
    setTesting(true)
    const userMsg = testMsg
    setTestMsg('')
    setChatHistory(h => [...h, { role:'user', msg:userMsg }])
    try {
      const res = await fetch('/api/agent/test', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:userMsg, agent, history:chatHistory }),
      })
      const data = await res.json()
      setChatHistory(h => [...h, { role:'agent', msg:data.reply || 'No response.' }])
    } catch(e) {
      setChatHistory(h => [...h, { role:'agent', msg:'Error connecting to AI.' }])
    }
    setTesting(false)
  }

  function upd(key: string, val: any) { setAgent(a => ({ ...a, [key]:val })) }

  const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px', borderRadius:11,
    background:'var(--surface-2)', border:'1px solid var(--border-2)',
    color:'var(--text)', fontSize:14, outline:'none', marginTop:6,
  }

  const currentLang = LANGUAGES.find(l => l.code === agent.language) || LANGUAGES[0]
  const currentTone = TONES.find(t => t.id === agent.tone) || TONES[0]
  const currentAvatar = AVATARS.find(a => a.id === agent.avatar) || AVATARS[0]

  const DOC_TYPES = [
    { type:'product_catalog', label:'Products', Icon:IcoBox },
    { type:'faq', label:'FAQ', Icon:IcoHelpCircle },
    { type:'chat_history', label:'Chats', Icon:IcoMessageSquare },
    { type:'policy', label:'Policy', Icon:IcoShield },
    { type:'training', label:'Training', Icon:IcoGraduationCap },
    { type:'document', label:'Other', Icon:IcoFileText },
  ]

  return (
    <div style={{ padding:'var(--page-pad)', maxWidth:1100 }}>
      <style>{`
        @media(max-width:768px){
          .agent-grid{grid-template-columns:1fr!important}
          .agent-identity-grid{grid-template-columns:1fr!important}
          .lang-grid{grid-template-columns:1fr 1fr!important}
          .personality-grid{grid-template-columns:1fr 1fr!important}
          .test-area{min-height:200px!important;max-height:280px!important}
        }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:currentAvatar.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px rgba(237,25,102,0.3)' }}>
            <span style={{ fontSize:26, fontWeight:900, color:'#fff', fontFamily:'var(--font-display)' }}>{agent.avatar || 'S'}</span>
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:4 }}>{agent.name || 'Your Agent'}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'var(--text-3)' }}>{agent.role || 'AI Agent'}</span>
              <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)', fontWeight:600 }}>
                Active
              </span>
              <span style={{ fontSize:12, color:'var(--text-4)' }}>{currentTone.label} Â· {currentLang.label}</span>
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:12, background:saved?'#22c55e':'var(--pink)', color:'#fff', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', transition:'background 0.2s' }}>
          {saved ? <><Check size={16}/>Saved!</> : saving ? <><RefreshCw size={16} style={{ animation:'spin 0.8s linear infinite' }}/>Saving...</> : <><Save size={16}/>Save Agent</>}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'min(220px,100%) 1fr', gap:16 }}>

        {/* LEFT NAV */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer', textAlign:'left', background:tab===t.id?'rgba(237,25,102,0.08)':'transparent', color:tab===t.id?'var(--text)':'var(--text-3)', fontWeight:tab===t.id?600:400, fontSize:14, borderLeft:'2px solid '+(tab===t.id?'var(--pink)':'transparent'), transition:'all 0.15s' }}>
              <t.icon size={16} color={tab===t.id?'var(--pink)':'var(--text-4)'}/>
              {t.label}
              {tab===t.id && <ChevronRight size={13} style={{ marginLeft:'auto' }} color="var(--pink)"/>}
            </button>
          ))}

          {/* Summary card */}
          <div style={{ marginTop:12, padding:16, borderRadius:14, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:12 }}>Agent Summary</div>
            {[
              { label:'Name', val:agent.name || '-' },
              { label:'Language', val:currentLang.label },
              { label:'Tone', val:currentTone.label },
              { label:'Response', val:agent.response_length || 'medium' },
              { label:'Docs', val:docs.length + ' uploaded' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:12 }}>
                <span style={{ color:'var(--text-4)' }}>{item.label}</span>
                <span style={{ color:'var(--text-2)', fontWeight:500 }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div style={{ background:'var(--surface)', borderRadius:20, border:'1px solid var(--border-2)', overflow:'hidden' }}>
          <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:10 }}>
            {(() => { const t=TABS.find(x=>x.id===tab)!; return <><t.icon size={18} color="var(--pink)"/><span style={{ fontSize:16, fontWeight:700 }}>{t.label}</span></> })()}
          </div>

          <div style={{ padding:24 }}>

            {/* IDENTITY */}
            {tab==='identity' && (
              <div style={{ display:'grid', gap:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:6 }}>Agent Name</label>
                    <input value={agent.name} onChange={e=>upd('name',e.target.value)} placeholder="Sofia, Alex, Max..." style={inp}/>
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:6 }}>Role / Title</label>
                    <input value={agent.role} onChange={e=>upd('role',e.target.value)} placeholder="Sales Agent, Support..." style={inp}/>
                  </div>
                </div>

                {/* Avatar â letter + color, no emojis */}
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:10 }}>Avatar Color</label>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {AVATARS.map(av => (
                      <button key={av.id} onClick={() => { upd('avatar', av.id); upd('avatarBg', av.bg) }} style={{ width:48, height:48, borderRadius:13, background:av.bg, border:'3px solid '+(agent.avatar===av.id?'#fff':'transparent'), cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'#fff', fontFamily:'var(--font-display)', boxShadow:agent.avatar===av.id?'0 0 0 2px var(--pink)':'none', transition:'all 0.15s' }}>
                        {av.id}
                      </button>
                    ))}
                    <div>
                      <label style={{ fontSize:11, color:'var(--text-4)', display:'block', marginBottom:4 }}>Custom initial</label>
                      <input value={agent.avatar} onChange={e=>upd('avatar',e.target.value.slice(0,2).toUpperCase())} maxLength={2} style={{ ...inp, marginTop:0, width:60, textAlign:'center', fontSize:18, fontWeight:900 }}/>
                    </div>
                  </div>
                </div>

                {/* Language â no flag emojis */}
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:10 }}>Primary Language</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={()=>upd('language',lang.code)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, border:'2px solid '+(agent.language===lang.code?'var(--pink)':'var(--border-2)'), background:agent.language===lang.code?'rgba(237,25,102,0.07)':'var(--surface-2)', cursor:'pointer', transition:'all 0.15s' }}>
                        <Globe size={16} color={agent.language===lang.code?'var(--pink)':'var(--text-4)'}/>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:14, fontWeight:agent.language===lang.code?700:500, color:agent.language===lang.code?'var(--text)':'var(--text-3)' }}>{lang.label}</div>
                          <div style={{ fontSize:11, color:'var(--text-4)' }}>{lang.region}</div>
                        </div>
                        {agent.language===lang.code && <Check size={14} color="var(--pink)" strokeWidth={3} style={{ marginLeft:'auto' }}/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business info */}
                <div style={{ padding:20, borderRadius:16, background:'var(--surface-2)', border:'1px solid var(--border-2)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
                    <Building2 size={15} color="var(--pink)"/> Business Info
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:4 }}>Business Name</label>
                      <input value={agent.business_name} onChange={e=>upd('business_name',e.target.value)} placeholder="Your company" style={inp}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:4 }}>Business Type</label>
                      <select value={agent.business_type} onChange={e=>upd('business_type',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                        <option value="">Select type...</option>
                        {BUSINESS_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:4 }}>Instagram</label>
                      <input value={agent.instagram} onChange={e=>upd('instagram',e.target.value)} placeholder="@yourbusiness" style={inp}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:4 }}>WhatsApp</label>
                      <input value={agent.whatsapp} onChange={e=>upd('whatsapp',e.target.value)} placeholder="+57 300 000 0000" style={inp}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PERSONALITY */}
            {tab==='personality' && (
              <div style={{ display:'grid', gap:24 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:12 }}>Conversation Tone</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
                    {TONES.map(t => (
                      <button key={t.id} onClick={()=>upd('tone',t.id)} style={{ padding:'14px 16px', borderRadius:14, border:'2px solid '+(agent.tone===t.id?'var(--pink)':'var(--border-2)'), background:agent.tone===t.id?'rgba(237,25,102,0.07)':'var(--surface-2)', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                        <div style={{ width:32, height:32, borderRadius:9, background:agent.tone===t.id?'var(--pink)':'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                          <MessageSquare size={16} color={agent.tone===t.id?'#fff':'var(--text-4)'}/>
                        </div>
                        <div style={{ fontSize:14, fontWeight:agent.tone===t.id?700:500, color:agent.tone===t.id?'var(--text)':'var(--text-2)', marginBottom:3 }}>{t.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-4)' }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:12 }}>Response Length</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {RESPONSE_LENGTHS.map(r => (
                      <button key={r.id} onClick={()=>upd('response_length',r.id)} style={{ padding:'14px', borderRadius:13, border:'2px solid '+(agent.response_length===r.id?'var(--pink)':'var(--border-2)'), background:agent.response_length===r.id?'rgba(237,25,102,0.07)':'var(--surface-2)', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                        <div style={{ fontSize:14, fontWeight:agent.response_length===r.id?700:500, color:agent.response_length===r.id?'var(--text)':'var(--text-2)', marginBottom:4 }}>{r.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-4)', lineHeight:1.4 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:10 }}>Personality Traits</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['helpful','professional','empathetic','direct','creative','patient','proactive','concise','detailed','witty'].map(trait => {
                      const sel = (agent.personality_traits||[]).includes(trait)
                      return (
                        <button key={trait} onClick={()=>{ const t=agent.personality_traits||[]; upd('personality_traits',sel?t.filter((x:string)=>x!==trait):[...t,trait]) }} style={{ padding:'7px 14px', borderRadius:999, fontSize:13, fontWeight:sel?600:400, border:'1px solid '+(sel?'var(--pink)':'var(--border-2)'), background:sel?'rgba(237,25,102,0.1)':'var(--surface-2)', color:sel?'var(--pink)':'var(--text-3)', cursor:'pointer', transition:'all 0.15s' }}>
                          {sel && <Check size={10} style={{ marginRight:4 }}/>}{trait}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* KNOWLEDGE */}
            {tab==='knowledge' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div style={{ padding:14, borderRadius:13, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', display:'flex', gap:10 }}>
                  <BookOpen size={16} color="#60a5fa" style={{ flexShrink:0, marginTop:1 }}/>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
                    Upload any document and your agent will use it to answer questions. Supports PDF, TXT, MD, CSV, JSON. You can also type notes below.
                  </p>
                </div>

                {/* Upload categories */}
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:12, display:'flex', alignItems:'center', gap:7 }}>
                    <Upload size={15} color="var(--pink)"/> Upload Documents
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10, marginBottom:14 }}>
                    {DOC_TYPES.map(dt => (
                      <button key={dt.type} onClick={()=>{ if(fileUploadRef.current){ fileUploadRef.current.dataset.type=dt.type; fileUploadRef.current.click() } }} style={{ padding:'14px 10px', borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border-2)', cursor:'pointer', textAlign:'center', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(237,25,102,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <dt.Icon size={18} color="var(--pink)"/>
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{dt.label}</span>
                      </button>
                    ))}
                  </div>
                  <input ref={fileUploadRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.doc,.docx" style={{ display:'none' }} onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadDoc(f,fileUploadRef.current?.dataset.type||'document'); e.target.value='' }}/>
                  {uploading && (
                    <div style={{ padding:12, borderRadius:10, background:'rgba(237,25,102,0.06)', border:'1px solid rgba(237,25,102,0.2)', display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(237,25,102,0.2)', borderTopColor:'var(--pink)', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
                      <span style={{ fontSize:13, color:'var(--text-2)' }}>{uploadProgress}</span>
                    </div>
                  )}
                </div>

                {/* Doc list */}
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span>Uploaded Documents {docs.length>0&&<span style={{ fontSize:11, padding:'2px 7px', borderRadius:999, background:'rgba(237,25,102,0.1)', color:'var(--pink)', marginLeft:6 }}>{docs.length}</span>}</span>
                    <button onClick={loadDocs} style={{ background:'none', border:'none', color:'var(--text-4)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                      <RefreshCw size={11}/> Refresh
                    </button>
                  </div>
                  {docsLoading ? (
                    <div style={{ textAlign:'center', padding:20, color:'var(--text-4)', fontSize:13 }}>Loading...</div>
                  ) : docs.length===0 ? (
                    <div style={{ textAlign:'center', padding:'24px 16px', borderRadius:12, background:'var(--surface-2)', border:'1px dashed var(--border-2)' }}>
                      <FileType size={28} style={{ opacity:0.2, display:'block', margin:'0 auto 8px', color:'var(--text-3)' }}/>
                      <p style={{ fontSize:13, color:'var(--text-4)' }}>No documents yet â upload one above</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {docs.map(doc => {
                        const dt = DOC_TYPES.find(d=>d.type===doc.type)||DOC_TYPES[5]
                        return (
                          <div key={doc.id} style={{ padding:'11px 14px', borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:34, height:34, borderRadius:9, background:'rgba(237,25,102,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <dt.Icon size={16} color="var(--pink)"/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</div>
                              <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>{doc.file_name} {doc.word_count>0&&'Â· '+doc.word_count.toLocaleString()+' words'}</div>
                            </div>
                            <span style={{ padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:600, background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)' }}>Active</span>
                            <button onClick={()=>deleteDoc(doc.id,doc.name)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', opacity:0.6, padding:4 }}>
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Text knowledge */}
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:6 }}>Quick Text Notes</label>
                  <p style={{ fontSize:12, color:'var(--text-4)', marginBottom:8 }}>Type prices, hours, FAQs or any quick info directly here</p>
                  <textarea value={agent.knowledge} onChange={e=>upd('knowledge',e.target.value)} placeholder={'Products:\n- Plan Growth: $79/month\n- Plan Elite: $199/month\n\nBusiness hours: Mon-Fri 9am-6pm\n\nFAQ:\nQ: How to cancel?\nA: Email support@getjut.io'} rows={8} style={{ ...inp, resize:'vertical', lineHeight:1.7, fontFamily:'monospace', fontSize:13 }}/>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
                    <span style={{ fontSize:11, color:'var(--text-4)' }}>{agent.knowledge?.length||0} chars</span>
                  </div>
                </div>
              </div>
            )}

            {/* OFFERS */}
            {tab==='offers' && (
              <div style={{ display:'grid', gap:16 }}>
                <div style={{ padding:14, borderRadius:12, background:'rgba(237,25,102,0.06)', border:'1px solid rgba(237,25,102,0.12)' }}>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>Add current promotions, discount codes, and offers the agent should mention to increase conversions.</p>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:6 }}>Active Offers and Promotions</label>
                  <textarea value={agent.offers} onChange={e=>upd('offers',e.target.value)} placeholder={'- 20% off first purchase with code WELCOME20\n- Free shipping on orders over $50\n- Referral program: give $10, get $10'} rows={10} style={{ ...inp, resize:'vertical', lineHeight:1.7 }}/>
                </div>
              </div>
            )}

            {/* RULES */}
            {tab==='rules' && (
              <div style={{ display:'grid', gap:16 }}>
                <div style={{ padding:14, borderRadius:12, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)' }}>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>Define topics to avoid, when to escalate to a human, and anything the agent should never say.</p>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text)', display:'block', marginBottom:6 }}>Rules and Boundaries</label>
                  <textarea value={agent.rules} onChange={e=>upd('rules',e.target.value)} placeholder={'- Never discuss competitor products\n- Escalate refunds over $100 to human agent\n- Always end asking if there is anything else\n- Never make promises about delivery times'} rows={12} style={{ ...inp, resize:'vertical', lineHeight:1.7 }}/>
                </div>
              </div>
            )}

            {/* TEST BOT */}
            {tab==='test' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ padding:14, borderRadius:12, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', display:'flex', alignItems:'center', gap:10 }}>
                  <Bot size={16} color="#22c55e"/>
                  <p style={{ fontSize:13, color:'var(--text-2)' }}>Test how <strong>{agent.name}</strong> responds. Not sent to real users.</p>
                </div>
                <div style={{ minHeight:320, maxHeight:420, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
                  {chatHistory.length===0 && (
                    <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-4)' }}>
                      <Bot size={40} style={{ opacity:0.1, display:'block', margin:'0 auto 12px', color:'var(--text-3)' }}/>
                      <p style={{ fontSize:14, color:'var(--text-3)', fontWeight:500 }}>Send a message to test your agent</p>
                      <p style={{ fontSize:12, marginTop:6 }}>Try: "What are your prices?" or "How does this work?"</p>
                    </div>
                  )}
                  {chatHistory.map((m,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8 }}>
                      {m.role==='agent' && (
                        <div style={{ width:32, height:32, borderRadius:10, background:currentAvatar.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fff', flexShrink:0 }}>{agent.avatar||'S'}</div>
                      )}
                      <div style={{ maxWidth:'72%', padding:'11px 14px', borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px', background:m.role==='user'?'var(--pink)':'var(--surface-2)', color:m.role==='user'?'#fff':'var(--text)', fontSize:14, lineHeight:1.6, border:m.role==='agent'?'1px solid var(--border-2)':'none' }}>
                        {m.msg}
                      </div>
                    </div>
                  ))}
                  {testing && (
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:currentAvatar.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fff' }}>{agent.avatar||'S'}</div>
                      <div style={{ padding:'12px 16px', borderRadius:'14px 14px 14px 4px', background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', gap:5 }}>
                        {[0,1,2].map(i=><span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text-3)', display:'inline-block', animation:'bounce 1.4s ease infinite', animationDelay:(i*0.2)+'s' }}/>)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <input value={testMsg} onChange={e=>setTestMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&testBot()} placeholder={'Message ' + (agent.name||'your agent') + '...'} style={{ ...inp, marginTop:0, flex:1 }}/>
                  <button onClick={testBot} disabled={testing||!testMsg.trim()} style={{ padding:'11px 20px', borderRadius:11, background:'var(--pink)', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:7, opacity:(testing||!testMsg.trim())?0.6:1 }}>
                    <MessageSquare size={15}/> Send
                  </button>
                </div>
                <button onClick={()=>setChatHistory([])} style={{ background:'none', border:'none', color:'var(--text-4)', cursor:'pointer', fontSize:12, alignSelf:'center' }}>Clear chat</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}