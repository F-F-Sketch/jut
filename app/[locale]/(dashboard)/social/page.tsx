'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Instagram, Plus, Zap, MessageSquare, Heart, Link } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPage({ params }: { params: { locale: string } }) {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [triggers, setTriggers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [ints, trigs] = await Promise.all([
        supabase.from('integrations').select('*').eq('user_id', user.id),
        supabase.from('automations').select('*').eq('user_id', user.id).in('trigger->type' as any, ['instagram_comment','instagram_dm']),
      ])
      setIntegrations(ints.data || [])
      setTriggers(trigs.data || [])
      setLoading(false)
    })()
  }, [])

  const igConnected = integrations.some(i => i.platform === 'instagram' && i.status === 'active')

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Social Triggers</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Connect social channels and configure automation triggers</p>
      </div>

      {/* Instagram Connection */}
      <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Instagram size={22} color="#fff"/>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Instagram</div>
              <div style={{fontSize:13,color:'var(--text-3)',marginTop:2}}>
                {igConnected ? 'Connected · Comment & DM triggers active' : 'Not connected'}
              </div>
            </div>
          </div>
          <button onClick={() => toast('Instagram connection coming soon — requires Meta App approval', {icon:'ℹ️'})}
            style={{padding:'9px 18px',borderRadius:10,background:igConnected?'rgba(34,197,94,0.1)':'var(--pink)',border:igConnected?'1px solid rgba(34,197,94,0.3)':'none',color:igConnected?'#22c55e':'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            {igConnected ? '✓ Connected' : 'Connect Instagram'}
          </button>
        </div>
      </div>

      {/* Trigger Types */}
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Available Trigger Types</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginBottom:32}}>
        {[
          { icon: MessageSquare, color:'#ED1966', title:'Comment Trigger', desc:'Fire automation when someone comments on your post with specific keywords', type:'instagram_comment' },
          { icon: Zap, color:'#3b82f6', title:'DM Trigger', desc:'Activate when someone sends you a direct message', type:'instagram_dm' },
          { icon: Heart, color:'#f43f5e', title:'Story Reply', desc:'Trigger when someone replies to your Instagram story', type:'instagram_story', soon:true },
          { icon: Link, color:'#8b5cf6', title:'Link Click', desc:'Fire when someone clicks your bio link', type:'link_click', soon:true },
        ].map(t => (
          <div key={t.type} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',opacity:t.soon?0.5:1}}>
            <div style={{width:40,height:40,borderRadius:10,background:t.color+'18',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
              <t.icon size={18} color={t.color}/>
            </div>
            <div style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:6}}>{t.title}{t.soon && <span style={{fontSize:11,marginLeft:8,color:'var(--text-3)'}}>Soon</span>}</div>
            <div style={{fontSize:13,color:'var(--text-3)',lineHeight:1.5}}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Active Triggers */}
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Active Social Triggers ({triggers.length})</h2>
      {triggers.length === 0 ? (
        <div style={{padding:40,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)',textAlign:'center',color:'var(--text-3)'}}>
          <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No social triggers yet</p>
          <p style={{fontSize:13,marginTop:8}}>Create an automation with an Instagram trigger to see it here</p>
        </div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {triggers.map(t => (
            <div key={t.id} style={{padding:16,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:t.status==='active'?'#22c55e':'#666'}}/>
              <div style={{flex:1}}>
                <span style={{fontWeight:600,color:'var(--text)'}}>{t.name}</span>
                <span style={{fontSize:12,color:'var(--text-3)',marginLeft:10}}>{t.trigger?.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
