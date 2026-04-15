'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink, CheckCircle2, AlertCircle, Zap, RefreshCw, Unplug } from 'lucide-react'
import { IcoInstagram, IcoWhatsApp, IcoFacebook, IcoTikTok, IcoPinterest, IcoYouTube, IcoTwitterX, IcoTelegram } from '@/components/ui/Icons'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

const NETWORKS = [
  { id:'instagram', name:'Instagram', color:'#E1306C', gradient:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', Icon:IcoInstagram, status:'available',
    triggers:['Comment with keyword','DM received','Story reply','Reel engagement'], desc:'Automate Instagram DMs and comments to capture leads 24/7',
    docs:'https://developers.facebook.com/docs/instagram-api', oauthPath:'/api/auth/instagram/redirect',
    permissions:['instagram_basic','instagram_manage_messages','instagram_manage_comments'] },
  { id:'whatsapp', name:'WhatsApp Business', color:'#25D366', gradient:'linear-gradient(135deg,#25D366,#128C7E)', Icon:IcoWhatsApp, status:'coming_soon',
    triggers:['Message received','Keyword trigger'], desc:'Automate WhatsApp Business conversations',
    docs:'https://developers.facebook.com/docs/whatsapp' },
  { id:'facebook', name:'Facebook Page', color:'#1877F2', gradient:'linear-gradient(135deg,#1877F2,#0d5dbf)', Icon:IcoFacebook, status:'coming_soon',
    triggers:['Post comment','Page DM'], desc:'Facebook Page comments and Messenger automation',
    docs:'https://developers.facebook.com' },
  { id:'tiktok', name:'TikTok', color:'#000000', gradient:'linear-gradient(135deg,#010101,#69C9D0)', Icon:IcoTikTok, status:'coming_soon',
    triggers:['Video comment','DM'], desc:'TikTok comment automation via TikTok for Business',
    docs:'https://developers.tiktok.com' },
  { id:'pinterest', name:'Pinterest', color:'#E60023', gradient:'linear-gradient(135deg,#E60023,#ad081b)', Icon:IcoPinterest, status:'coming_soon',
    triggers:['Pin save','Comment'], desc:'Pinterest audience automation',
    docs:'https://developers.pinterest.com' },
  { id:'youtube', name:'YouTube', color:'#FF0000', gradient:'linear-gradient(135deg,#FF0000,#cc0000)', Icon:IcoYouTube, status:'coming_soon',
    triggers:['Comment trigger','Subscriber'], desc:'YouTube comment responses',
    docs:'https://developers.google.com/youtube' },
  { id:'twitter', name:'X (Twitter)', color:'#000000', gradient:'linear-gradient(135deg,#111,#333)', Icon:IcoTwitterX, status:'coming_soon',
    triggers:['Mention','DM received'], desc:'X mentions and DM automation',
    docs:'https://developer.twitter.com' },
  { id:'telegram', name:'Telegram', color:'#0088cc', gradient:'linear-gradient(135deg,#0088cc,#005fa3)', Icon:IcoTelegram, status:'coming_soon',
    triggers:['Bot message','Group keyword'], desc:'Telegram bot automation',
    docs:'https://core.telegram.org/bots/api' },
]

export default function SocialPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string|null>('instagram')
  const [disconnecting, setDisconnecting] = useState<string|null>(null)
  const [metaConfigured, setMetaConfigured] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    load()
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const account = searchParams.get('account')
    if (success === 'instagram_connected') { toast.success('Instagram connected!' + (account ? ' Account: ' + account : '')); load() }
    else if (error) { const msgs:Record<string,string> = { access_denied:'Connection cancelled', missing_params:'Invalid OAuth response', invalid_state:'Security check failed', db_error:'Connected but failed to save' }; toast.error(msgs[error] || 'Connection failed: ' + error) }
  }, [])

  async function load() {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return
    const [ints, autos] = await Promise.all([
      supabase.from('integrations').select('*').eq('user_id', user.id),
      supabase.from('automations').select('*').eq('user_id', user.id).eq('status', 'active'),
    ])
    setIntegrations(ints.data || [])
    setAutomations(autos.data || [])
    setLoading(false)
  }

  function isConnected(id:string) { return integrations.some(i => i.platform === id && i.status === 'active') }
  function getIntegration(id:string) { return integrations.find(i => i.platform === id) }
  function getCount(id:string) { return automations.filter(a => a.trigger?.platform === id).length }

  function handleConnect(network: typeof NETWORKS[0]) {
    if (network.status === 'coming_soon') { toast('Coming soon! We are building the ' + network.name + ' integration.', { icon:'🔔', duration:3000 }); return }
    if (network.oauthPath) window.location.href = network.oauthPath
  }

  async function disconnect(platform:string) {
    if (!confirm('Disconnect ' + platform + '?')) return
    setDisconnecting(platform)
    const res = await fetch('/api/auth/disconnect', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({platform}) })
    setDisconnecting(null)
    if (res.ok) { toast.success('Disconnected'); load() } else { toast.error('Failed') }
  }

  if (loading) return <div style={{padding:32,color:'var(--text-3)'}}>Loading...</div>

  return (
    <div style={{padding:28,maxWidth:1000}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Social Networks</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>{integrations.filter(i=>i.status==='active').length} connected of {NETWORKS.filter(n=>n.status==='available').length} available</p>
      </div>

      <div style={{display:'grid',gap:14}}>
        {NETWORKS.map(network => {
          const connected = isConnected(network.id)
          const integration = getIntegration(network.id)
          const count = getCount(network.id)
          const isExpanded = expanded === network.id
          return (
            <div key={network.id} style={{borderRadius:18,background:'var(--surface)',border:'1px solid '+(connected?'rgba(34,197,94,0.3)':'var(--border-2)'),overflow:'hidden',transition:'border-color 0.2s'}}>
              <div style={{padding:'18px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer'}} onClick={()=>setExpanded(isExpanded?null:network.id)}>
                {/* Icon */}
                <div style={{width:52,height:52,borderRadius:14,background:network.gradient,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <network.Icon size={24} color="#fff"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>{network.name}</span>
                    {network.status==='coming_soon'&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:'rgba(251,191,36,0.1)',color:'#fbbf24',fontWeight:600}}>Coming Soon</span>}
                    {connected&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:'rgba(34,197,94,0.1)',color:'#22c55e',fontWeight:600,display:'flex',alignItems:'center',gap:4}}><CheckCircle2 size={11}/> Connected{integration?.account_name?' · '+integration.account_name:''}</span>}
                    {count>0&&<span style={{fontSize:11,color:'#22c55e'}}>{count} automation{count!==1?'s':''}</span>}
                  </div>
                  <div style={{fontSize:13,color:'var(--text-3)'}}>{network.desc}</div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  {connected?(
                    <button onClick={e=>{e.stopPropagation();disconnect(network.id)}} disabled={disconnecting===network.id} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                      {disconnecting===network.id?<RefreshCw size={13} style={{animation:'spin 0.8s linear infinite'}}/>:<Unplug size={13}/>} Disconnect
                    </button>
                  ):(
                    <button onClick={e=>{e.stopPropagation();handleConnect(network)}} style={{padding:'8px 16px',borderRadius:10,background:network.status==='coming_soon'?'var(--surface-2)':'var(--pink)',border:network.status==='coming_soon'?'1px solid var(--border-2)':'none',color:network.status==='coming_soon'?'var(--text-3)':'#fff',fontWeight:700,fontSize:13,cursor:'pointer',transition:'all 0.2s'}}>
                      {network.status==='coming_soon'?'Notify Me':'Connect'}
                    </button>
                  )}
                  <a href={network.docs} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{padding:'8px 10px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',display:'flex',alignItems:'center',textDecoration:'none'}}>
                    <ExternalLink size={14}/>
                  </a>
                </div>
              </div>
              {isExpanded&&(
                <div style={{padding:'0 20px 20px',borderTop:'1px solid var(--border-2)'}}>
                  <div style={{paddingTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                    <div>
                      <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10}}>Triggers Available</p>
                      {network.triggers.map(t=>(
                        <div key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',marginBottom:7}}>
                          <Zap size={12} color="var(--pink)"/><span style={{fontSize:13,color:'var(--text-2)'}}>{t}</span>
                          {network.status==='coming_soon'&&<span style={{marginLeft:'auto',fontSize:10,color:'var(--text-4)'}}>Soon</span>}
                        </div>
                      ))}
                    </div>
                    <div>
                      {connected&&integration?(
                        <div>
                          <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10}}>Connection Details</p>
                          <div style={{padding:16,borderRadius:12,background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><CheckCircle2 size={15} color="#22c55e"/><span style={{fontWeight:700,color:'#22c55e',fontSize:14}}>Active</span></div>
                            {integration.account_name&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:5}}>Account: <strong>{integration.account_name}</strong></div>}
                            {count>0&&<div style={{fontSize:13,color:'#22c55e',fontWeight:600}}>{count} automation{count!==1?'s':''} running</div>}
                          </div>
                        </div>
                      ):network.status==='available'?(
                        <div>
                          <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10}}>How to Connect</p>
                          {['Click Connect to open Meta authorization','Log in with your Facebook account','Select your Instagram Business account','Grant the required permissions','You will be redirected back automatically'].map((s,i)=>(
                            <div key={i} style={{display:'flex',gap:10,marginBottom:8}}>
                              <div style={{width:20,height:20,borderRadius:'50%',background:'var(--pink)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{i+1}</div>
                              <span style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{s}</span>
                            </div>
                          ))}
                        </div>
                      ):(
                        <div style={{padding:16,borderRadius:12,background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.15)',textAlign:'center'}}>
                          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.6}}>We are building the {network.name} integration. Click Notify Me to be first.</p>
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