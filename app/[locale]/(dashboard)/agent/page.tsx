'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IcoBox, IcoHelpCircle, IcoMessageSquare, IcoFileText, IcoShield, IcoGraduationCap } from '@/components/ui/Icons'
import { Bot, Save, RefreshCw, Check, MessageSquare, Target, BookOpen, Tag, Play, Sparkles, Building2, User, Upload, Trash2, FileType, Globe, ChevronDown } from 'lucide-react'
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
  { id:'short', label:'Short', desc:'1-2 sentences' },
  { id:'medium', label:'Medium', desc:'2-4 sentences' },
  { id:'detailed', label:'Detailed', desc:'4+ sentences' },
]
const BUSINESS_TYPES = ['E-commerce','Services','Coaching','Restaurant','Fashion / Beauty','Real Estate','Education','Fitness','Technology','Healthcare','Other']
const LANGUAGES = [
  { code:'es', label:'Espanol', region:'Colombia' },
  { code:'en', label:'English', region:'USA' },
  { code:'pt', label:'Portugues', region:'Brasil' },
  { code:'fr', label:'Francais', region:'France' },
]
const AVATARS = [
  { id:'S', bg:'linear-gradient(135deg,#ED1966,#b0124e)' },
  { id:'A', bg:'linear-gradient(135deg,#2152A4,#1a3d7a)' },
  { id:'M', bg:'linear-gradient(135deg,#C9A84C,#8B6914)' },
  { id:'J', bg:'linear-gradient(135deg,#22c55e,#15803d)' },
  { id:'R', bg:'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { id:'K', bg:'linear-gradient(135deg,#f59e0b,#b45309)' },
]
const DEFAULT_AGENT = {
  name:'Sofia', role:'Sales & Support Agent', avatar:'S',
  avatarBg:'linear-gradient(135deg,#ED1966,#b0124e)',
  language:'en', business_name:'', business_type:'',
  instagram:'', whatsapp:'', tone:'friendly', response_length:'medium',
  personality_traits:['helpful','professional'], knowledge:'', offers:'', rules:'',
}
const DOC_TYPES = [
  { type:'product_catalog', label:'Products', Icon:IcoBox },
  { type:'faq', label:'FAQ', Icon:IcoHelpCircle },
  { type:'chat_history', label:'Chats', Icon:IcoMessageSquare },
  { type:'policy', label:'Policy', Icon:IcoShield },
  { type:'training', label:'Training', Icon:IcoGraduationCap },
  { type:'document', label:'Other', Icon:IcoFileText },
]

export default function AgentPage() {
  const [tab, setTab] = useState('identity')
  const [agent, setAgent] = useState(DEFAULT_AGENT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testing, setTesting] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role:string;msg:string}[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [tabOpen, setTabOpen] = useState(false)
  const fileUploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = 'jut-agent-styles'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = '.agent-layout{display:grid;grid-template-columns:200px 1fr;gap:16px}.agent-sidenav{display:flex;flex-direction:column;gap:3px}.tab-dropdown{display:none}@media(max-width:768px){.agent-layout{grid-template-columns:1fr!important}.agent-sidenav{display:none!important}.tab-dropdown{display:block!important}.lang-grid{grid-template-columns:1fr 1fr!important}.identity-grid{grid-template-columns:1fr!important}.biz-grid{grid-template-columns:1fr!important}.tone-grid{grid-template-columns:1fr 1fr!important}.rl-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:480px){.lang-grid{grid-template-columns:1fr!important}.tone-grid{grid-template-columns:1fr!important}.rl-grid{grid-template-columns:1fr!important}}'
    document.head.appendChild(s)
    return () => { const el=document.getElementById(id); if(el) el.remove() }
  }, [])
  const supabase = createClient()

  useEffect(()=>{ load(); loadDocs() },[])

  async function load() {
    const{data:{user}}=await supabase.auth.getUser(); if(!user)return
    const{data}=await supabase.from('agent_configs').select('*').eq('user_id',user.id).single()
    if(data?.config) setAgent({...DEFAULT_AGENT,...data.config})
  }
  async function loadDocs() {
    try{const r=await fetch('/api/agent/knowledge');const d=await r.json();setDocs(d.docs||[])}catch{}
  }
  async function uploadDoc(file:File,docType:string){
    setUploading(true)
    try{
      const form=new FormData();form.append('file',file);form.append('type',docType);form.append('name',file.name.replace(/\.[^.]+$/,''))
      const r=await fetch('/api/agent/knowledge/upload',{method:'POST',body:form})
      const d=await r.json()
      if(!r.ok){toast.error(d.error||'Upload failed');return}
      toast.success(file.name+' uploaded!');loadDocs()
    }catch(e:any){toast.error(e.message)}finally{setUploading(false)}
  }
  async function deleteDoc(id:string,name:string){
    if(!confirm('Delete "'+name+'"?'))return
    const r=await fetch('/api/agent/knowledge',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    if(r.ok){toast.success('Deleted');loadDocs()}else toast.error('Failed')
  }
  async function save(){
    setSaving(true)
    const{data:{user}}=await supabase.auth.getUser();if(!user)return
    const{error}=await supabase.from('agent_configs').upsert({user_id:user.id,config:agent,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    setSaving(false)
    if(error){toast.error('Failed: '+error.message);return}
    setSaved(true);toast.success('Agent saved!')
    setTimeout(()=>setSaved(false),2000)
  }
  async function testBot(){
    if(!testMsg.trim())return
    setTesting(true);const msg=testMsg;setTestMsg('')
    setChatHistory(h=>[...h,{role:'user',msg}])
    try{
      const r=await fetch('/api/agent/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,agent,history:chatHistory})})
      const d=await r.json()
      setChatHistory(h=>[...h,{role:'agent',msg:d.reply||'No response.'}])
    }catch{setChatHistory(h=>[...h,{role:'agent',msg:'Error connecting to AI.'}])}
    setTesting(false)
  }

  function upd(k:string,v:any){setAgent(a=>({...a,[k]:v}))}
  const curAvatar=AVATARS.find(a=>a.id===agent.avatar)||AVATARS[0]
  const curTone=TONES.find(t=>t.id===agent.tone)||TONES[0]
  const curLang=LANGUAGES.find(l=>l.code===agent.language)||LANGUAGES[0]
  const inp:React.CSSProperties={width:'100%',padding:'10px 13px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none',marginTop:5}
  const currentTab=TABS.find(t=>t.id===tab)!

  return(
    <div style={{padding:'var(--page-pad)',maxWidth:1100,paddingBottom:40}}>
      

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,gap:12,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:52,height:52,borderRadius:16,background:curAvatar.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff',flexShrink:0,boxShadow:'0 6px 20px rgba(237,25,102,0.3)'}}>
            {agent.avatar||'S'}
          </div>
          <div>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.3}}>{agent.name||'Your Agent'}</div>
            <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{agent.role} Â· {curTone.label} Â· {curLang.label}</div>
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 18px',borderRadius:11,background:saved?'#22c55e':'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',transition:'background 0.2s',whiteSpace:'nowrap'}}>
          {saved?<><Check size={15}/>Saved!</>:saving?<><RefreshCw size={15} style={{animation:'spin 0.8s linear infinite'}}/>Saving...</>:<><Save size={15}/>Save</>}
        </button>
      </div>

      {/* Mobile tab dropdown */}
      <div className="tab-dropdown" style={{marginBottom:12}}>
        <button onClick={()=>setTabOpen(!tabOpen)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',cursor:'pointer',color:'var(--text)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <currentTab.icon size={16} color="var(--pink)"/>
            <span style={{fontWeight:600,fontSize:14}}>{currentTab.label}</span>
          </div>
          <ChevronDown size={16} color="var(--text-3)" style={{transform:tabOpen?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
        </button>
        {tabOpen&&(
          <div style={{position:'absolute',left:'var(--page-pad)',right:'var(--page-pad)',background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:12,padding:6,zIndex:50,boxShadow:'0 8px 30px rgba(0,0,0,0.5)',marginTop:4}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setTabOpen(false)}} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'11px 12px',borderRadius:10,border:'none',background:tab===t.id?'rgba(237,25,102,0.08)':'transparent',color:tab===t.id?'var(--text)':'var(--text-3)',fontSize:14,fontWeight:tab===t.id?600:400,cursor:'pointer',textAlign:'left'}}>
                <t.icon size={15} color={tab===t.id?'var(--pink)':'var(--text-4)'}/>{t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="agent-layout" style={{position:'relative'}}>
        {/* Desktop sidenav */}
        <div className="agent-sidenav">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:9,padding:'10px 12px',borderRadius:11,border:'none',cursor:'pointer',textAlign:'left',background:tab===t.id?'rgba(237,25,102,0.08)':'transparent',color:tab===t.id?'var(--text)':'var(--text-3)',fontWeight:tab===t.id?600:400,fontSize:13,borderLeft:'2px solid '+(tab===t.id?'var(--pink)':'transparent'),transition:'all 0.15s'}}>
              <t.icon size={15} color={tab===t.id?'var(--pink)':'var(--text-4)'}/>{t.label}
            </button>
          ))}
          <div style={{marginTop:12,padding:14,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.7,marginBottom:10}}>Summary</div>
            {[{l:'Name',v:agent.name||'-'},{l:'Language',v:curLang.label},{l:'Tone',v:curTone.label},{l:'Docs',v:docs.length+' files'}].map(i=>(
              <div key={i.l} style={{display:'flex',justifyContent:'space-between',marginBottom:7,fontSize:11}}>
                <span style={{color:'var(--text-4)'}}>{i.l}</span>
                <span style={{color:'var(--text-2)',fontWeight:500}}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div style={{background:'var(--surface)',borderRadius:16,border:'1px solid var(--border-2)',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:8}}>
            <currentTab.icon size={16} color="var(--pink)"/>
            <span style={{fontSize:15,fontWeight:700}}>{currentTab.label}</span>
          </div>
          <div style={{padding:'18px'}}>

            {/* IDENTITY */}
            {tab==='identity'&&(
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div className="identity-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block'}}>Agent Name</label><input value={agent.name} onChange={e=>upd('name',e.target.value)} placeholder="Sofia, Alex..." style={inp}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block'}}>Role</label><input value={agent.role} onChange={e=>upd('role',e.target.value)} placeholder="Sales Agent..." style={inp}/></div>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:8}}>Avatar Color</label>
                  <div className="avatar-grid" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {AVATARS.map(av=>(
                      <button key={av.id} onClick={()=>{upd('avatar',av.id);upd('avatarBg',av.bg)}} style={{width:44,height:44,borderRadius:12,background:av.bg,border:agent.avatar===av.id?'3px solid #fff':'3px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#fff',boxShadow:agent.avatar===av.id?'0 0 0 2px var(--pink)':'none',transition:'all 0.15s'}}>
                        {av.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:8}}>Primary Language</label>
                  <div className="lang-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                    {LANGUAGES.map(lang=>(
                      <button key={lang.code} onClick={()=>upd('language',lang.code)} style={{display:'flex',alignItems:'center',gap:9,padding:'11px 14px',borderRadius:11,border:'2px solid '+(agent.language===lang.code?'var(--pink)':'var(--border-2)'),background:agent.language===lang.code?'rgba(237,25,102,0.07)':'var(--surface-2)',cursor:'pointer',transition:'all 0.15s'}}>
                        <Globe size={14} color={agent.language===lang.code?'var(--pink)':'var(--text-4)'}/>
                        <div style={{textAlign:'left'}}>
                          <div style={{fontSize:13,fontWeight:agent.language===lang.code?700:500,color:agent.language===lang.code?'var(--text)':'var(--text-3)'}}>{lang.label}</div>
                          <div style={{fontSize:10,color:'var(--text-4)'}}>{lang.region}</div>
                        </div>
                        {agent.language===lang.code&&<Check size={12} color="var(--pink)" strokeWidth={3} style={{marginLeft:'auto'}}/>}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{padding:16,borderRadius:13,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:7}}><Building2 size={14} color="var(--pink)"/>Business Info</div>
                  <div className="biz-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><label style={{fontSize:11,fontWeight:600,color:'var(--text-3)',display:'block'}}>Business Name</label><input value={agent.business_name} onChange={e=>upd('business_name',e.target.value)} placeholder="Your company" style={inp}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:'var(--text-3)',display:'block'}}>Business Type</label><select value={agent.business_type} onChange={e=>upd('business_type',e.target.value)} style={{...inp,cursor:'pointer'}}><option value="">Select...</option>{BUSINESS_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:'var(--text-3)',display:'block'}}>Instagram</label><input value={agent.instagram} onChange={e=>upd('instagram',e.target.value)} placeholder="@yourbusiness" style={inp}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:'var(--text-3)',display:'block'}}>WhatsApp</label><input value={agent.whatsapp} onChange={e=>upd('whatsapp',e.target.value)} placeholder="+57 300 000 0000" style={inp}/></div>
                  </div>
                </div>
              </div>
            )}

            {/* PERSONALITY */}
            {tab==='personality'&&(
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <label style={{fontSize:13,fontWeight:700,display:'block',marginBottom:10}}>Conversation Tone</label>
                  <div className="tone-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {TONES.map(t=>(
                      <button key={t.id} onClick={()=>upd('tone',t.id)} style={{padding:'12px 10px',borderRadius:12,border:'2px solid '+(agent.tone===t.id?'var(--pink)':'var(--border-2)'),background:agent.tone===t.id?'rgba(237,25,102,0.07)':'var(--surface-2)',cursor:'pointer',textAlign:'center',transition:'all 0.15s'}}>
                        <div style={{width:28,height:28,borderRadius:8,background:agent.tone===t.id?'var(--pink)':'var(--surface-3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px'}}><MessageSquare size={14} color={agent.tone===t.id?'#fff':'var(--text-4)'}/></div>
                        <div style={{fontSize:12,fontWeight:agent.tone===t.id?700:500,color:agent.tone===t.id?'var(--text)':'var(--text-2)'}}>{t.label}</div>
                        <div style={{fontSize:10,color:'var(--text-4)',lineHeight:1.3,marginTop:2}}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:700,display:'block',marginBottom:10}}>Response Length</label>
                  <div className="rl-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {RESPONSE_LENGTHS.map(r=>(
                      <button key={r.id} onClick={()=>upd('response_length',r.id)} style={{padding:'12px 10px',borderRadius:12,border:'2px solid '+(agent.response_length===r.id?'var(--pink)':'var(--border-2)'),background:agent.response_length===r.id?'rgba(237,25,102,0.07)':'var(--surface-2)',cursor:'pointer',textAlign:'center',transition:'all 0.15s'}}>
                        <div style={{fontSize:13,fontWeight:agent.response_length===r.id?700:500,color:agent.response_length===r.id?'var(--text)':'var(--text-2)',marginBottom:3}}>{r.label}</div>
                        <div style={{fontSize:10,color:'var(--text-4)',lineHeight:1.3}}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:700,display:'block',marginBottom:8}}>Personality Traits</label>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                    {['helpful','professional','empathetic','direct','creative','patient','proactive','concise','witty'].map(trait=>{
                      const sel=(agent.personality_traits||[]).includes(trait)
                      return(<button key={trait} onClick={()=>{const t=agent.personality_traits||[];upd('personality_traits',sel?t.filter((x:string)=>x!==trait):[...t,trait])}} style={{padding:'6px 12px',borderRadius:999,fontSize:12,fontWeight:sel?600:400,border:'1px solid '+(sel?'var(--pink)':'var(--border-2)'),background:sel?'rgba(237,25,102,0.1)':'var(--surface-2)',color:sel?'var(--pink)':'var(--text-3)',cursor:'pointer',transition:'all 0.15s'}}>
                        {sel&&<Check size={9} style={{marginRight:3}}/>}{trait}
                      </button>)
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* KNOWLEDGE */}
            {tab==='knowledge'&&(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{padding:12,borderRadius:11,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)'}}>
                  <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>Upload documents and your agent will use them to answer questions. Supports PDF, TXT, MD, CSV, JSON.</p>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:10,display:'flex',alignItems:'center',gap:6}}><Upload size={14} color="var(--pink)"/>Upload Documents</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                    {DOC_TYPES.map(dt=>(
                      <button key={dt.type} onClick={()=>{if(fileUploadRef.current){fileUploadRef.current.dataset.type=dt.type;fileUploadRef.current.click()}}} style={{padding:'12px 8px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',cursor:'pointer',textAlign:'center',transition:'all 0.15s',display:'flex',flexDirection:'column',alignItems:'center',gap:7}}>
                        <div style={{width:32,height:32,borderRadius:9,background:'rgba(237,25,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><dt.Icon size={16} color="var(--pink)"/></div>
                        <span style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{dt.label}</span>
                      </button>
                    ))}
                  </div>
                  <input ref={fileUploadRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.doc,.docx" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)uploadDoc(f,fileUploadRef.current?.dataset.type||'document');e.target.value=''}}/>
                  {uploading&&<div style={{padding:10,borderRadius:10,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.2)',display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{width:14,height:14,borderRadius:'50%',border:'2px solid rgba(237,25,102,0.2)',borderTopColor:'var(--pink)',animation:'spin 0.8s linear infinite',flexShrink:0}}/><span style={{fontSize:12,color:'var(--text-2)'}}>Uploading...</span></div>}
                </div>
                {docs.length>0&&(
                  <div style={{display:'flex',flexDirection:'column',gap:7}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',display:'flex',alignItems:'center',gap:6}}><FileType size={13}/>Documents ({docs.length})</div>
                    {docs.map(doc=>{
                      const dt=DOC_TYPES.find(d=>d.type===doc.type)||DOC_TYPES[5]
                      return(<div key={doc.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                        <div style={{width:30,height:30,borderRadius:8,background:'rgba(237,25,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><dt.Icon size={14} color="var(--pink)"/></div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.name}</div>
                          <div style={{fontSize:10,color:'var(--text-4)'}}>{doc.word_count>0?doc.word_count.toLocaleString()+' words':doc.file_name}</div>
                        </div>
                        <button onClick={()=>deleteDoc(doc.id,doc.name)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',opacity:0.6,padding:4,flexShrink:0}}><Trash2 size={13}/></button>
                      </div>)
                    })}
                  </div>
                )}
                <div>
                  <label style={{fontSize:12,fontWeight:700,display:'block',marginBottom:5}}>Quick Text Notes</label>
                  <textarea value={agent.knowledge} onChange={e=>upd('knowledge',e.target.value)} placeholder={'Products:
- Plan Growth: $79/month

Business hours: Mon-Fri 9am-6pm

FAQ:
Q: How to cancel?
A: Email support@getjut.io'} rows={7} style={{...inp,resize:'vertical',lineHeight:1.7,fontFamily:'monospace',fontSize:12}}/>
                </div>
              </div>
            )}

            {/* OFFERS */}
            {tab==='offers'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:12,borderRadius:11,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.12)'}}>
                  <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>Add promotions and discount codes the agent should mention to increase conversions.</p>
                </div>
                <textarea value={agent.offers} onChange={e=>upd('offers',e.target.value)} placeholder={'- 20% off with code WELCOME20
- Free shipping over $50
- Referral: give $10, get $10'} rows={10} style={{...inp,resize:'vertical',lineHeight:1.7}}/>
              </div>
            )}

            {/* RULES */}
            {tab==='rules'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:12,borderRadius:11,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)'}}>
                  <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>Define topics to avoid, when to escalate to a human, and things the agent should never say.</p>
                </div>
                <textarea value={agent.rules} onChange={e=>upd('rules',e.target.value)} placeholder={'- Never discuss competitors
- Escalate refunds over $100
- Always ask if there is anything else'} rows={12} style={{...inp,resize:'vertical',lineHeight:1.7}}/>
              </div>
            )}

            {/* TEST BOT */}
            {tab==='test'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:12,borderRadius:11,background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',display:'flex',gap:8}}>
                  <Bot size={15} color="#22c55e" style={{flexShrink:0,marginTop:2}}/>
                  <p style={{fontSize:13,color:'var(--text-2)'}}>Test how <strong>{agent.name}</strong> responds. Not sent to real users.</p>
                </div>
                <div style={{minHeight:260,maxHeight:380,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,padding:4,WebkitOverflowScrolling:'touch'}}>
                  {chatHistory.length===0&&(
                    <div style={{textAlign:'center',padding:'32px 16px',color:'var(--text-4)'}}>
                      <Bot size={36} style={{opacity:0.1,display:'block',margin:'0 auto 10px',color:'var(--text-3)'}}/>
                      <p style={{fontSize:13,color:'var(--text-3)'}}>Send a message to test</p>
                      <p style={{fontSize:11,marginTop:4}}>"What are your prices?"</p>
                    </div>
                  )}
                  {chatHistory.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',gap:7}}>
                      {m.role==='agent'&&<div style={{width:28,height:28,borderRadius:9,background:curAvatar.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff',flexShrink:0}}>{agent.avatar||'S'}</div>}
                      <div style={{maxWidth:'78%',padding:'10px 13px',borderRadius:m.role==='user'?'13px 13px 4px 13px':'13px 13px 13px 4px',background:m.role==='user'?'var(--pink)':'var(--surface-2)',color:m.role==='user'?'#fff':'var(--text)',fontSize:13,lineHeight:1.55,border:m.role==='agent'?'1px solid var(--border-2)':'none'}}>{m.msg}</div>
                    </div>
                  ))}
                  {testing&&<div style={{display:'flex',gap:7}}><div style={{width:28,height:28,borderRadius:9,background:curAvatar.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff'}}>{agent.avatar||'S'}</div><div style={{padding:'10px 14px',borderRadius:'13px 13px 13px 4px',background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--text-3)',display:'inline-block',animation:'bounce 1.4s ease infinite',animationDelay:(i*0.2)+'s'}}/>)}</div></div>}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={testMsg} onChange={e=>setTestMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&testBot()} placeholder={'Message '+( agent.name||'agent')+'...'} style={{...inp,marginTop:0,flex:1}}/>
                  <button onClick={testBot} disabled={testing||!testMsg.trim()} style={{padding:'10px 16px',borderRadius:10,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,opacity:(testing||!testMsg.trim())?0.6:1,flexShrink:0}}>
                    <MessageSquare size={14}/>Send
                  </button>
                </div>
                <button onClick={()=>setChatHistory([])} style={{background:'none',border:'none',color:'var(--text-4)',cursor:'pointer',fontSize:12,alignSelf:'center'}}>Clear chat</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}