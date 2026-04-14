'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Search, Send, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConversationsPage() {
  const [convos, setConvos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    setConvos(data || [])
    setLoading(false)
  }

  async function openConvo(convo: any) {
    setSelected(convo)
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convo.id).order('created_at')
    setMessages(data || [])
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('messages').insert({ conversation_id: selected.id, user_id: user.id, content: reply, role: 'agent', created_at: new Date().toISOString() })
    if (error) { toast.error('Failed to send'); return }
    setMessages(p => [...p, { content: reply, role: 'agent', created_at: new Date().toISOString() }])
    await supabase.from('conversations').update({ last_message: reply, updated_at: new Date().toISOString() }).eq('id', selected.id)
    setReply('')
    toast.success('Sent')
  }

  const filtered = convos.filter(c => (c.contact_name || c.platform || '').toLowerCase().includes(search.toLowerCase()))
  const timeAgo = (d: string) => { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return 'now'; if (s < 3600) return Math.floor(s/60) + 'm ago'; if (s < 86400) return Math.floor(s/3600) + 'h ago'; return Math.floor(s/86400) + 'd ago' }

  return (
    <div style={{padding:32,maxWidth:1200}}>
      {selected ? (
        <div style={{background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:16,display:'flex',flexDirection:'column',height:'75vh'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:12}}>
            <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',display:'flex',alignItems:'center'}}><ChevronRight size={18} style={{transform:'rotate(180deg)'}}/></button>
            <div style={{width:36,height:36,borderRadius:10,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'var(--pink)'}}>
              {(selected.contact_name||'?')[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:700,color:'var(--text)',fontSize:15}}>{selected.contact_name || 'Unknown'}</div>
              <div style={{fontSize:12,color:'var(--text-3)'}}>{selected.platform || 'unknown'} · {selected.status}</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:10}}>
            {messages.length === 0 && <p style={{textAlign:'center',color:'var(--text-3)',fontSize:14,marginTop:40}}>No messages in this conversation yet</p>}
            {messages.map((m,i) => (
              <div key={i} style={{display:'flex',justifyContent:m.role==='agent'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:12,background:m.role==='agent'?'var(--pink)':'var(--surface-2)',color:m.role==='agent'?'#fff':'var(--text)',fontSize:14,lineHeight:1.5}}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:16,borderTop:'1px solid var(--border-2)',display:'flex',gap:10}}>
            <input value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()} placeholder="Type a reply..." style={{flex:1,padding:'10px 14px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none'}}/>
            <button onClick={sendReply} style={{padding:'10px 16px',borderRadius:10,background:'var(--pink)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontWeight:600}}>
              <Send size={15}/> Send
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{marginBottom:24}}>
            <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Conversations</h1>
            <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{convos.length} total</p>
          </div>
          <div style={{position:'relative',marginBottom:16}}>
            <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..." style={{width:'100%',paddingLeft:42,paddingRight:16,paddingTop:10,paddingBottom:10,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none'}}/>
          </div>
          {loading ? <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>Loading...</div>
          : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:80,color:'var(--text-3)'}}>
              <MessageSquare size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
              <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No conversations yet</p>
              <p style={{fontSize:13,marginTop:8}}>Conversations from Instagram DMs and automations appear here</p>
            </div>
          ) : (
            <div style={{display:'grid',gap:8}}>
              {filtered.map(c => (
                <div key={c.id} onClick={()=>openConvo(c)} style={{padding:16,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
                  <div style={{width:44,height:44,borderRadius:12,background:'var(--pink)20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'var(--pink)',flexShrink:0}}>
                    {(c.contact_name||'?')[0]?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{c.contact_name || 'Unknown'}</span>
                      <span style={{fontSize:12,color:'var(--text-3)'}}>{c.updated_at ? timeAgo(c.updated_at) : ''}</span>
                    </div>
                    <div style={{fontSize:13,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2}}>{c.last_message || 'No messages'}</div>
                  </div>
                  {c.status === 'open' && <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}