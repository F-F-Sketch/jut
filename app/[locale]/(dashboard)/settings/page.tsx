'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, EyeOff, CheckCircle2, ExternalLink, Key, User, Bell, Shield, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'profile', label:'Profile', icon:User },
  { id:'integrations', label:'Integrations', icon:Key },
  { id:'notifications', label:'Notifications', icon:Bell },
  { id:'security', label:'Security', icon:Shield },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ full_name:'', email:'', company:'', timezone:'America/Bogota' })
  const [saving, setSaving] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string,boolean>>({})
  const supabase = createClient()

  useEffect(()=>{
    (async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user) return
      const{data}=await supabase.from('profiles').select('*').eq('id',user.id).single()
      if(data) setProfile({full_name:data.full_name||'',email:user.email||'',company:data.company||'',timezone:data.timezone||'America/Bogota'})
    })()
  },[])

  async function saveProfile(){
    setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    if(!user){setSaving(false);return}
    const{error}=await supabase.from('profiles').update({full_name:profile.full_name,company:profile.company,timezone:profile.timezone}).eq('id',user.id)
    setSaving(false)
    error?toast.error('Failed to save'):toast.success('Profile saved!')
  }

  const inp: React.CSSProperties = {width:'100%',padding:'10px 14px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none',transition:'border-color 0.2s'}

  const INTEGRATION_GROUPS = [
    {
      title:'AI Models',
      color:'#8b5cf6',
      items:[
        {key:'OPENAI_API_KEY',label:'OpenAI API Key',desc:'Required for DALL-E 3 image generation',link:'https://platform.openai.com/api-keys',prefix:'sk-'},
        {key:'STABILITY_API_KEY',label:'Stability AI Key',desc:'For Stable Diffusion XL image generation',link:'https://platform.stability.ai/',prefix:'sk-'},
        {key:'REPLICATE_API_KEY',label:'Replicate API Key',desc:'Alternative for SDXL via Replicate',link:'https://replicate.com/account/api-tokens',prefix:'r8_'},
      ]
    },
    {
      title:'Payments — Colombia',
      color:'#22c55e',
      items:[
        {key:'WOMPI_PUBLIC_KEY',label:'Wompi Public Key',desc:'For PSE, Nequi, Bancolombia payments',link:'https://wompi.co',prefix:'pub_'},
        {key:'WOMPI_INTEGRITY_SECRET',label:'Wompi Integrity Secret',desc:'For secure transaction signatures',link:'https://wompi.co',prefix:''},
      ]
    },
    {
      title:'Payments — International',
      color:'#3b82f6',
      items:[
        {key:'STRIPE_SECRET_KEY',label:'Stripe Secret Key',desc:'For international credit card payments',link:'https://dashboard.stripe.com/apikeys',prefix:'sk_live_'},
        {key:'STRIPE_PRICE_GROWTH',label:'Stripe Growth Price ID',desc:'Price ID for the Growth plan',link:'https://dashboard.stripe.com/products',prefix:'price_'},
        {key:'STRIPE_PRICE_ELITE',label:'Stripe Elite Price ID',desc:'Price ID for the Elite plan',link:'https://dashboard.stripe.com/products',prefix:'price_'},
      ]
    },
    {
      title:'Social Networks',
      color:'#ED1966',
      items:[
        {key:'META_APP_ID',label:'Meta App ID',desc:'Facebook/Instagram App ID',link:'https://developers.facebook.com',prefix:''},
        {key:'META_APP_SECRET',label:'Meta App Secret',desc:'Facebook/Instagram App Secret',link:'https://developers.facebook.com',prefix:''},
        {key:'WHATSAPP_TOKEN',label:'WhatsApp Token',desc:'WhatsApp Business Cloud API token',link:'https://developers.facebook.com/docs/whatsapp',prefix:''},
      ]
    },
  ]

  return (
    <div style={{padding:28,maxWidth:900}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:-0.5}}>Settings</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:3}}>Manage your account, integrations and API keys</p>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:24,background:'var(--surface)',borderRadius:12,padding:4,width:'fit-content',border:'1px solid var(--border-2)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:tab===t.id?'var(--pink)':'transparent',color:tab===t.id?'#fff':'var(--text-3)',transition:'all 0.15s'}}>
            <t.icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {tab==='profile'&&(
        <div style={{display:'grid',gap:16,maxWidth:600}}>
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:18}}>Profile Information</h2>
            <div style={{display:'grid',gap:14}}>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Full Name</label><input value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))} placeholder="Your name" style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Email</label><input value={profile.email} disabled style={{...inp,opacity:0.6,cursor:'not-allowed'}}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Company</label><input value={profile.company} onChange={e=>setProfile(p=>({...p,company:e.target.value}))} placeholder="Your company name" style={inp}/></div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Timezone</label>
                <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  <option value="America/Bogota">🇨🇴 Colombia (UTC-5)</option>
                  <option value="America/New_York">🇺🇸 New York (UTC-5)</option>
                  <option value="America/Mexico_City">🇲🇽 Mexico City (UTC-6)</option>
                  <option value="Europe/Madrid">🇪🇸 Madrid (UTC+1)</option>
                  <option value="America/Sao_Paulo">🇧🇷 São Paulo (UTC-3)</option>
                </select>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{marginTop:18,padding:'10px 22px',borderRadius:11,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:7,opacity:saving?0.7:1}}>
              <Save size={14}/>{saving?'Saving...':'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {tab==='integrations'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{padding:14,borderRadius:12,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)'}}>
            <div style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>
              <strong style={{color:'var(--text)'}}>Important:</strong> API keys must be added in <a href="https://vercel.com/juanpafirez-creates-projects/jut-for-all/settings/environment-variables" target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa',textDecoration:'underline'}}>Vercel Environment Variables</a> and a redeploy triggered. Keys shown here are for reference only.
            </div>
          </div>

          {INTEGRATION_GROUPS.map(group=>(
            <div key={group.title} style={{padding:22,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
              <h2 style={{fontSize:15,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:10,height:10,borderRadius:2,background:group.color}}/>
                {group.title}
              </h2>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {group.items.map(item=>(
                  <div key={item.key}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{item.label}</div>
                        <div style={{fontSize:11,color:'var(--text-4)',marginTop:2}}>{item.desc}</div>
                      </div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text-3)',textDecoration:'none',padding:'4px 8px',borderRadius:7,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                        Get key <ExternalLink size={10}/>
                      </a>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <code style={{flex:1,padding:'8px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',fontSize:12,color:'var(--text-3)',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {item.prefix}{'*'.repeat(24)}
                      </code>
                      <div style={{padding:'8px 12px',borderRadius:9,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',fontSize:11,color:'#fbbf24',fontWeight:600,whiteSpace:'nowrap'}}>
                        Add in Vercel
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='notifications'&&(
        <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)',maxWidth:600}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:18}}>Notification Preferences</h2>
          {[
            {label:'New lead captured',desc:'When an automation captures a new lead',default:true},
            {label:'Automation triggered',desc:'When an automation fires',default:false},
            {label:'Conversation reply',desc:'When someone replies in a conversation',default:true},
            {label:'Payment received',desc:'When a subscription payment is made',default:true},
            {label:'Weekly digest',desc:'Weekly summary of your account activity',default:true},
          ].map((n,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--border)',gap:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{n.label}</div>
                <div style={{fontSize:12,color:'var(--text-4)',marginTop:2}}>{n.desc}</div>
              </div>
              <div style={{width:44,height:24,borderRadius:999,background:n.default?'var(--pink)':'var(--surface-3)',position:'relative',cursor:'pointer',flexShrink:0,border:'1px solid '+(n.default?'rgba(237,25,102,0.5)':'var(--border-2)'),transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:2,left:n.default?22:2,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='security'&&(
        <div style={{maxWidth:600,display:'flex',flexDirection:'column',gap:14}}>
          <div style={{padding:22,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:15,fontWeight:700,marginBottom:14}}>Change Password</h2>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Current Password</label><input type="password" placeholder="••••••••" style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>New Password</label><input type="password" placeholder="••••••••" style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:5}}>Confirm New Password</label><input type="password" placeholder="••••••••" style={inp}/></div>
            </div>
            <button style={{marginTop:16,padding:'10px 22px',borderRadius:11,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Update Password</button>
          </div>
          <div style={{padding:22,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:15,fontWeight:700,marginBottom:6,color:'#ef4444'}}>Danger Zone</h2>
            <p style={{fontSize:13,color:'var(--text-3)',marginBottom:14}}>Permanently delete your account and all data. This cannot be undone.</p>
            <button style={{padding:'10px 18px',borderRadius:11,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',color:'#ef4444',fontWeight:600,fontSize:13,cursor:'pointer'}}>Delete Account</button>
          </div>
        </div>
      )}
    </div>
  )
}