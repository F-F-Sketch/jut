'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Search, Instagram, Send } from 'lucide-react'

export default function ConversationsPage({ params }: { params: { locale: string } }) {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('conversations')
        .select('*, leads(name, phone)')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
      setConversations(data || [])
      setLoading(false)
    })()
  }, [])

  const filtered = conversations.filter(c =>
    c.leads?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.platform?.includes(search.toLowerCase())
  )

  const PLATFORM_ICONS: Record<string,any> = { instagram: Instagram, whatsapp: Send }

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Conversations</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{conversations.length} total conversations</p>
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search conversations..." style={{width:'100%',paddingLeft:42,paddingRight:16,paddingTop:10,paddingBottom:10,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none'}}/>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>Loading conversations...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:80,color:'var(--text-3)'}}>
          <MessageSquare size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
          <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No conversations yet</p>
          <p style={{fontSize:13,marginTop:8}}>Conversations from your AI agent will appear here</p>
        </div>
      ) : (
        <div style={{display:'grid',gap:8}}>
          {filtered.map(conv => {
            const Icon = PLATFORM_ICONS[conv.platform] || MessageSquare
            return (
              <div key={conv.id} style={{padding:16,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={20} color="var(--text-3)"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{conv.leads?.name || conv.contact_name || 'Unknown'}</span>
                    <span style={{fontSize:12,color:'var(--text-3)'}}>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--text-3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {conv.last_message || 'No messages yet'}
                  </div>
                </div>
                {conv.status === 'open' && <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
