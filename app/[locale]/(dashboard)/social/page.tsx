'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Instagram, MessageSquare, Heart, Zap, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [ints, autos] = await Promise.all([
      supabase.from('integrations').select('*').eq('user_id', user.id),
      supabase.from('automations').select('*').eq('user_id', user.id).eq('status', 'active'),
    ])
    setIntegrations(ints.data || [])
    setAutomations(autos.data || [])
    setLoading(false)
  }

  const igConnected = integrations.some(i => i.platform === 'instagram' && i.status === 'active')
  const igTriggers = automations.filter(a => a.trigger?.platform === 'instagram')

  function connectIG() {
    toast('Instagram connection requires a Meta Business App.

To connect: go to developers.facebook.com, create an app with Instagram Basic Display API, then add your token in Settings â Integrations.', { duration: 6000, icon: 'â¹ï¸' })
  }

  const TRIGGERS = [
    { icon: MessageSquare, color:'#ED1966', title:'Comment Trigger', desc:'Someone comments a keyword on your post', type:'instagram_comment', count: igTriggers.filter(a=>a.trigger?.type==='instagram_comment').length },
    { icon: MessageSquare, color:'#3b82f6', title:'DM Trigger', desc:'Someone sends you a direct message', type:'instagram_dm', count: igTriggers.filter(a=>a.trigger?.type==='instagram_dm').length },
    { icon: Heart, color:'#f43f5e', title:'Story Reply', desc:'Someone replies to your story', type:'story_reply', soon:true, count:0 },
    { icon: Zap, color:'#8b5cf6', title:'Reel Engagement', desc:'Someone engages with your reel', type:'reel_engage', soon:true, count:0 },
  ]

  return (
    <div style={{padding:32,maxWidth:1000}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Social Triggers</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Connect your social channels and configure automation triggers</p>
      </div>

      {/* Instagram Card */}
      <div style={{padding:28,borderRadius:18,background:'var(--surface)',border:'2px solid '+(igConnected?'rgba(34,197,94,0.3)':'var(--border-2)'),marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Instagram size={26} color="#fff"/>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:'var(--text)'}}>Instagram</div>
              <div style={{fontSize:13,color:'var(--text-3)',marginTop:3}}>
                {igConnected ? 'Connected and active â automations can fire from Instagram' : 'Not connected â connect to enable Instagram automations'}
              </div>
              {igConnected && (
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:6}}>
                  <CheckCircle2 size={14} color="#22c55e"/>
                  <span style={{fontSize:12,color:'#22c55e',fontWeight:600}}>Active Â· {igTriggers.length} automation{igTriggers.length!==1?'s':''} running</span>
                </div>
              )}
              {!igConnected && (
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:6}}>
                  <AlertCircle size={14} color="#f59e0b"/>
                  <span style={{fontSize:12,color:'#f59e0b'}}>Requires Meta Business App approval</span>
                </div>
              )}
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            {!igConnected && (
              <button onClick={connectIG} style={{padding:'10px 20px',borderRadius:11,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                <Instagram size={16}/> Connect Instagram
              </button>
            )}
            <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-2)',fontWeight:600,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
              <ExternalLink size={14}/> Meta Docs
            </a>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      {!igConnected && (
        <div style={{padding:24,borderRadius:14,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.15)',marginBottom:28}}>
          <div style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:12}}>How to connect Instagram</div>
          {[
            'Create a Facebook Developer account at developers.facebook.com',
            'Create a new App and add the Instagram Basic Display product',
            'Submit for App Review to get instagram_basic and instagram_manage_messages permissions',
            'Once approved, add your Instagram Business Account and generate a long-lived token',
            'Paste your token in Settings â Integrations',
          ].map((step, i) => (
            <div key={i} style={{display:'flex',gap:12,marginBottom:10}}>
              <div style={{width:24,height:24,borderRadius:999,background:'var(--pink)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:14,color:'var(--text-2)',lineHeight:1.5}}>{step}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trigger Types */}
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:14}}>Trigger Types</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:32}}>
        {TRIGGERS.map(t => (
          <div key={t.type} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',opacity:t.soon?0.5:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:t.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <t.icon size={18} color={t.color}/>
              </div>
              {t.soon ? <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:'var(--surface-2)',color:'var(--text-3)',fontWeight:600}}>Soon</span>
              : t.count > 0 ? <span style={{fontSize:12,padding:'2px 8px',borderRadius:999,background:'rgba(34,197,94,0.1)',color:'#22c55e',fontWeight:600}}>{t.count} active</span>
              : null}
            </div>
            <div style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:5}}>{t.title}</div>
            <div style={{fontSize:13,color:'var(--text-3)',lineHeight:1.5}}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Active automations */}
      {igTriggers.length > 0 && (
        <>
          <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:14}}>Active Instagram Automations</h2>
          <div style={{display:'grid',gap:10}}>
            {igTriggers.map(a => (
              <div key={a.id} style={{padding:16,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e'}}/>
                <div style={{flex:1}}>
                  <span style={{fontWeight:600,color:'var(--text)'}}>{a.name}</span>
                  <span style={{fontSize:12,color:'var(--text-3)',marginLeft:10}}>{a.trigger?.type} {a.trigger?.keyword ? 'Â· "'+a.trigger.keyword+'"' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}