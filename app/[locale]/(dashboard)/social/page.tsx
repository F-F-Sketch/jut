'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink, CheckCircle2, AlertCircle, Zap, RefreshCw, Unplug, Settings } from 'lucide-react'
import { IconInstagram, IconWhatsApp, IconFacebook, IconTikTok, IconPinterest, IconYouTube, IconTwitterX, IconTelegram } from '@/components/ui/Icons'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

const NETWORKS = [
  {
    id: 'instagram', name: 'Instagram', color: '#E1306C',
    gradient: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
    icon: 'ð¸', status: 'available',
    triggers: ['Comment with keyword','DM received','Story reply','Reel engagement'],
    desc: 'Most powerful channel for DM automation and lead capture',
    docs: 'https://developers.facebook.com/docs/instagram-api',
  },
  {
    id: 'whatsapp', name: 'WhatsApp Business', color: '#25D366',
    gradient: 'linear-gradient(135deg,#25D366,#128C7E)',
    icon: 'ð¬', status: 'available',
    triggers: ['Message received','Keyword trigger','Contact joined'],
    desc: 'Automate WhatsApp Business conversations with the Cloud API',
    docs: 'https://developers.facebook.com/docs/whatsapp',
  },
  {
    id: 'facebook', name: 'Facebook', color: '#1877F2',
    gradient: 'linear-gradient(135deg,#1877F2,#0d5dbf)',
    icon: 'ð¤', status: 'coming_soon',
    triggers: ['Post comment','Page DM','Ad lead form'],
    desc: 'Facebook Page comments and Messenger automation',
    docs: 'https://developers.facebook.com',
  },
  {
    id: 'tiktok', name: 'TikTok', color: '#010101',
    gradient: 'linear-gradient(135deg,#010101,#69C9D0,#EE1D52)',
    icon: 'ðµ', status: 'coming_soon',
    triggers: ['Video comment','Profile DM','Mention'],
    desc: 'TikTok comment automation and DM flows (TikTok for Business API)',
    docs: 'https://developers.tiktok.com',
  },
  {
    id: 'pinterest', name: 'Pinterest', color: '#E60023',
    gradient: 'linear-gradient(135deg,#E60023,#ad081b)',
    icon: 'ð', status: 'coming_soon',
    triggers: ['Pin save','Board follow','Comment'],
    desc: 'Pinterest audience automation and lead capture',
    docs: 'https://developers.pinterest.com',
  },
  {
    id: 'youtube', name: 'YouTube', color: '#FF0000',
    gradient: 'linear-gradient(135deg,#FF0000,#cc0000)',
    icon: 'â¶ï¸', status: 'coming_soon',
    triggers: ['Comment trigger','Subscriber joined','Video mention'],
    desc: 'YouTube comment responses and subscriber automation',
    docs: 'https://developers.google.com/youtube',
  },
  {
    id: 'twitter', name: 'X (Twitter)', color: '#000000',
    gradient: 'linear-gradient(135deg,#000,#333)',
    icon: 'ð', status: 'coming_soon',
    triggers: ['Mention','DM received','Keyword in tweet'],
    desc: 'Twitter/X mentions and DM automation',
    docs: 'https://developer.twitter.com',
  },
  {
    id: 'telegram', name: 'Telegram', color: '#0088cc',
    gradient: 'linear-gradient(135deg,#0088cc,#005fa3)',
    icon: 'âï¸', status: 'coming_soon',
    triggers: ['Bot message','Group keyword','Channel post'],
    desc: 'Telegram bot automation and group management',
    docs: 'https://core.telegram.org/bots/api',
  },
]

export default function SocialPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)
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

  function isConnected(id: string) {
    return integrations.some(i => i.platform === id && i.status === 'active')
  }

  function getCount(id: string) {
    return automations.filter(a => a.trigger?.platform === id).length
  }

  function handleConnect(network: typeof NETWORKS[0]) {
    if (network.status === 'coming_soon') {
      toast('Coming soon! We are working on ' + network.name + ' integration. Join the waitlist to get notified.', { duration: 4000, icon: 'ð' })
      return
    }
    toast('To connect ' + network.name + ': Follow the setup instructions below and add your API credentials in Settings â Integrations.', { duration: 5000, icon: 'â¹ï¸' })
  }

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Social Networks</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Connect social channels Â· {integrations.filter(i=>i.status==='active').length} connected Â· {NETWORKS.filter(n=>n.status==='available').length} available Â· {NETWORKS.filter(n=>n.status==='coming_soon').length} coming soon</p>
      </div>

      <div style={{display:'grid',gap:16}}>
        {NETWORKS.map(network => {
          const connected = isConnected(network.id)
          const count = getCount(network.id)
          const isExpanded = expanded === network.id
          return (
            <div key={network.id} style={{borderRadius:16,background:'var(--surface)',border:'1px solid '+(connected?'rgba(34,197,94,0.3)':'var(--border-2)'),overflow:'hidden',transition:'border-color 0.2s'}}>
              <div style={{padding:20,display:'flex',alignItems:'center',gap:16,cursor:'pointer'}} onClick={()=>setExpanded(isExpanded?null:network.id)}>
                <div style={{width:52,height:52,borderRadius:14,background:network.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                  {network.IconComponent && <network.IconComponent size={24} color={network.iconColor || '#fff'}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>{network.name}</span>
                    {network.status === 'coming_soon' && (
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:'rgba(251,191,36,0.1)',color:'#fbbf24',fontWeight:600}}>Coming Soon</span>
                    )}
                    {connected && (
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:'rgba(34,197,94,0.1)',color:'#22c55e',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                        <CheckCircle2 size={11}/> Connected
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:13,color:'var(--text-3)',marginTop:3}}>{network.desc}</div>
                  {count > 0 && <div style={{fontSize:12,color:'#22c55e',marginTop:4}}>{count} active automation{count!==1?'s':''}</div>}
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                  <button onClick={e=>{e.stopPropagation();handleConnect(network)}}
                    style={{padding:'8px 16px',borderRadius:10,background:connected?'rgba(34,197,94,0.1)':network.status==='coming_soon'?'var(--surface-2)':'var(--pink)',border:connected?'1px solid rgba(34,197,94,0.3)':'none',color:connected?'#22c55e':network.status==='coming_soon'?'var(--text-3)':'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                    {connected ? 'â Connected' : network.status === 'coming_soon' ? 'Notify Me' : 'Connect'}
                  </button>
                  <a href={network.docs} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{padding:'8px 10px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',display:'flex',alignItems:'center',textDecoration:'none'}}>
                    <ExternalLink size={14}/>
                  </a>
                </div>
              </div>

              {isExpanded && (
                <div style={{padding:'0 20px 20px',borderTop:'1px solid var(--border-2)'}}>
                  <div style={{paddingTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:'var(--text-3)',marginBottom:10}}>Available Triggers</p>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {network.triggers.map(t => (
                          <div key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                            <Zap size={13} color="var(--pink)"/>
                            <span style={{fontSize:13,color:'var(--text-2)'}}>{t}</span>
                            {network.status === 'coming_soon' && <span style={{marginLeft:'auto',fontSize:11,color:'var(--text-3)'}}>Soon</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:'var(--text-3)',marginBottom:10}}>Setup Steps</p>
                      {network.status === 'coming_soon' ? (
                        <div style={{padding:16,borderRadius:10,background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.2)',textAlign:'center'}}>
                          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.6}}>We are actively building the {network.name} integration. Click <strong>Notify Me</strong> to be the first to know when it launches.</p>
                        </div>
                      ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          {['Create a developer account','Create an App and enable the required API','Request necessary permissions','Get your API credentials','Add token in Settings â Integrations'].map((step,i) => (
                            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                              <div style={{width:22,height:22,borderRadius:999,background:'var(--pink)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0,marginTop:1}}>{i+1}</div>
                              <span style={{fontSize:13,color:'var(--text-2)',lineHeight:1.5}}>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
