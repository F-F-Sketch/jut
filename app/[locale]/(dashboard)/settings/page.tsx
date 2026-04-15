'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload, Eye, EyeOff, CheckCircle2, ExternalLink, Key, User, Bell, Shield, Palette, Code, Globe, Image, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'profile', label:'Profile', icon:User },
  { id:'brand', label:'Brand & Logo', icon:Palette },
  { id:'css', label:'Custom CSS', icon:Code },
  { id:'seo', label:'SEO & Tracking', icon:Globe },
  { id:'integrations', label:'Integrations', icon:Key },
  { id:'notifications', label:'Notifications', icon:Bell },
  { id:'security', label:'Security', icon:Shield },
]

const DEFAULT_CSS = `/* Custom CSS for JUT Platform */
/* This CSS is injected globally across your platform */

/* Example: Change primary color */
/* :root { --pink: #your-color; } */

/* Example: Custom button style */
/* .btn-primary { border-radius: 4px; } */
`

const FONTS = ['system-ui','Inter','DM Sans','Syne','Poppins','Geist','Roboto','Montserrat']

export default function SettingsPage() {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile
  const [profile, setProfile] = useState({ full_name:'', email:'', company:'', timezone:'America/Bogota' })

  // Brand
  const [brand, setBrand] = useState({
    platform_name:'JUT', tagline:'Automate Every Conversation',
    logo_url:'', favicon_url:'',
    primary_color:'#ED1966', secondary_color:'#2152A4', bg_color:'#0d0d14',
    font:'system-ui',
  })

  // CSS
  const [customCss, setCustomCss] = useState(DEFAULT_CSS)

  // SEO
  const [seo, setSeo] = useState({
    meta_title:'JUT — AI Platform', meta_description:'Automate your business with AI agents',
    og_image:'', google_analytics:'', facebook_pixel:'',
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [profileData, settingsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('platform_settings').select('*').eq('user_id', user.id).single(),
    ])
    if (profileData.data) {
      setProfile({
        full_name: profileData.data.full_name || '',
        email: user.email || '',
        company: profileData.data.company || '',
        timezone: profileData.data.timezone || 'America/Bogota',
      })
    }
    if (settingsData.data) {
      if (settingsData.data.brand) setBrand(b => ({ ...b, ...settingsData.data.brand }))
      if (settingsData.data.custom_css) setCustomCss(settingsData.data.custom_css)
      if (settingsData.data.seo) setSeo(s => ({ ...s, ...settingsData.data.seo }))
    }
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save profile
    if (tab === 'profile') {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        company: profile.company,
        timezone: profile.timezone,
      }).eq('id', user.id)
      if (error) { toast.error('Failed: ' + error.message); setSaving(false); return }
    }

    // Save platform settings (brand/css/seo)
    if (tab === 'brand' || tab === 'css' || tab === 'seo') {
      const { error } = await supabase.from('platform_settings').upsert({
        user_id: user.id, brand, custom_css: customCss, seo,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (error) { toast.error('Failed: ' + error.message); setSaving(false); return }
    }

    setSaving(false); setSaved(true)
    toast.success('Saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  async function uploadFile(file: File, type: 'logo' | 'favicon') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = user.id + '/' + type + '.' + ext
    const { error } = await supabase.storage.from('brand').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); return }
    const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(path)
    if (type === 'logo') setBrand(b => ({ ...b, logo_url: publicUrl }))
    else setBrand(b => ({ ...b, favicon_url: publicUrl }))
    toast.success(type + ' uploaded!')
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:11,
    background:'var(--surface-2)', border:'1px solid var(--border-2)',
    color:'var(--text)', fontSize:14, outline:'none', marginTop:6,
    transition:'border-color 0.2s',
  }
  const label = (txt: string) => (
    <label style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', display:'block', marginBottom:4 }}>{txt}</label>
  )

  const needsSave = ['profile','brand','css','seo'].includes(tab)

  return (
    <div style={{ padding:'clamp(16px,3vw,32px)', maxWidth:1000 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:-0.5 }}>Settings</h1>
          <p style={{ fontSize:14, color:'var(--text-3)', marginTop:3 }}>Platform configuration, brand and integrations</p>
        </div>
        {needsSave && (
          <button onClick={save} disabled={saving} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:12, background:saved?'#22c55e':'var(--pink)', color:'#fff', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', transition:'background 0.2s' }}>
            {saved ? <><Check size={15}/> Saved</> : saving ? <><RefreshCw size={15} style={{ animation:'spin 1s linear infinite' }}/> Saving...</> : <><Save size={15}/> Save Changes</>}
          </button>
        )}
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div style={{ display:'flex', gap:3, marginBottom:24, background:'var(--surface)', borderRadius:13, padding:4, border:'1px solid var(--border-2)', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', background:tab===t.id?'var(--pink)':'transparent', color:tab===t.id?'#fff':'var(--text-3)', whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
            <t.icon size={12}/>{t.label}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab === 'profile' && (
        <div style={{ display:'grid', gap:16, maxWidth:600 }}>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Profile Information</h2>
            <div style={{ display:'grid', gap:14 }}>
              <div>{label('Full Name')}<input value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))} placeholder="Your name" style={inp}/></div>
              <div>{label('Email')}<input value={profile.email} disabled style={{ ...inp, opacity:0.6, cursor:'not-allowed' }}/></div>
              <div>{label('Company')}<input value={profile.company} onChange={e=>setProfile(p=>({...p,company:e.target.value}))} placeholder="Your company" style={inp}/></div>
              <div>
                {label('Timezone')}
                <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))} style={{ ...inp, cursor:'pointer' }}>
                  <option value="America/Bogota">🇨🇴 Colombia (UTC-5)</option>
                  <option value="America/New_York">🇺🇸 New York (UTC-5)</option>
                  <option value="America/Mexico_City">🇲🇽 Mexico City (UTC-6)</option>
                  <option value="Europe/Madrid">🇪🇸 Madrid (UTC+1)</option>
                  <option value="America/Sao_Paulo">🇧🇷 São Paulo (UTC-3)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRAND */}
      {tab === 'brand' && (
        <div style={{ display:'grid', gap:18 }}>
          {/* Logo & Favicon */}
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Logo & Favicon</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div>
                {label('Platform Logo')}
                <div style={{ marginTop:8, padding:24, borderRadius:12, border:'2px dashed var(--border-2)', textAlign:'center', cursor:'pointer', background:'var(--surface-2)' }} onClick={() => logoRef.current?.click()}>
                  {brand.logo_url
                    ? <img src={brand.logo_url} alt="Logo" style={{ maxHeight:60, maxWidth:'100%', objectFit:'contain' }}/>
                    : <div><Image size={32} style={{ color:'var(--text-3)', display:'block', margin:'0 auto 8px' }}/><p style={{ fontSize:13, color:'var(--text-3)' }}>Click to upload</p><p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>PNG, SVG recommended</p></div>
                  }
                  <input ref={logoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0],'logo')}/>
                </div>
                {label('Or paste URL')}
                <input value={brand.logo_url} onChange={e=>setBrand(b=>({...b,logo_url:e.target.value}))} placeholder="https://..." style={inp}/>
              </div>
              <div>
                {label('Favicon (32x32)')}
                <div style={{ marginTop:8, padding:24, borderRadius:12, border:'2px dashed var(--border-2)', textAlign:'center', cursor:'pointer', background:'var(--surface-2)' }} onClick={() => faviconRef.current?.click()}>
                  {brand.favicon_url
                    ? <img src={brand.favicon_url} alt="Favicon" style={{ width:32, height:32, objectFit:'contain', display:'block', margin:'0 auto' }}/>
                    : <div><Upload size={32} style={{ color:'var(--text-3)', display:'block', margin:'0 auto 8px' }}/><p style={{ fontSize:13, color:'var(--text-3)' }}>Click to upload</p><p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>.ico or 32x32 PNG</p></div>
                  }
                  <input ref={faviconRef} type="file" accept="image/*,.ico" style={{ display:'none' }} onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0],'favicon')}/>
                </div>
                {label('Or paste URL')}
                <input value={brand.favicon_url} onChange={e=>setBrand(b=>({...b,favicon_url:e.target.value}))} placeholder="https://..." style={inp}/>
              </div>
            </div>
          </div>

          {/* Identity */}
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Identity</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>{label('Platform Name')}<input value={brand.platform_name} onChange={e=>setBrand(b=>({...b,platform_name:e.target.value}))} placeholder="JUT" style={inp}/></div>
              <div>{label('Tagline')}<input value={brand.tagline} onChange={e=>setBrand(b=>({...b,tagline:e.target.value}))} placeholder="Automate Every Conversation" style={inp}/></div>
              <div>
                {label('Font Family')}
                <select value={brand.font} onChange={e=>setBrand(b=>({...b,font:e.target.value}))} style={{ ...inp, cursor:'pointer' }}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Colors</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:18 }}>
              {([['primary_color','Primary Color'],['secondary_color','Secondary Color'],['bg_color','Background']] as [string,string][]).map(([key,name]) => (
                <div key={key}>
                  {label(name)}
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:6 }}>
                    <input type="color" value={(brand as any)[key]} onChange={e=>setBrand(b=>({...b,[key]:e.target.value}))} style={{ width:44, height:44, borderRadius:10, border:'1px solid var(--border-2)', cursor:'pointer', background:'none', padding:2 }}/>
                    <input value={(brand as any)[key]} onChange={e=>setBrand(b=>({...b,[key]:e.target.value}))} style={{ ...inp, marginTop:0, flex:1, fontFamily:'monospace', fontSize:13 }}/>
                  </div>
                  <div style={{ marginTop:8, height:28, borderRadius:8, background:(brand as any)[key] }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding:22, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Preview</h2>
            <div style={{ padding:20, borderRadius:12, background:brand.bg_color||'#0d0d14', display:'flex', alignItems:'center', gap:12 }}>
              {brand.logo_url
                ? <img src={brand.logo_url} alt="logo" style={{ height:34, objectFit:'contain' }}/>
                : <div style={{ width:34, height:34, borderRadius:9, background:brand.primary_color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:14 }}>J</div>
              }
              <div>
                <div style={{ fontFamily:brand.font, fontWeight:800, fontSize:18, color:'#fff', letterSpacing:-0.5 }}>{brand.platform_name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{brand.tagline}</div>
              </div>
              <button style={{ marginLeft:'auto', padding:'8px 16px', borderRadius:9, background:brand.primary_color, border:'none', color:'#fff', fontWeight:700, fontSize:13, fontFamily:brand.font, cursor:'pointer' }}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CSS */}
      {tab === 'css' && (
        <div style={{ display:'grid', gap:18 }}>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700 }}>Custom CSS</h2>
                <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>Injected globally — affects all pages and users of your platform</p>
              </div>
              <div style={{ padding:'3px 10px', borderRadius:999, fontSize:11, background:'rgba(34,197,94,0.1)', color:'#22c55e', fontWeight:600, border:'1px solid rgba(34,197,94,0.2)' }}>Live</div>
            </div>
            <textarea
              value={customCss}
              onChange={e => setCustomCss(e.target.value)}
              rows={22}
              style={{ width:'100%', padding:16, borderRadius:12, background:'#0a0a0f', border:'1px solid var(--border-2)', color:'#e0e0ff', fontSize:13, fontFamily:'Monaco, Consolas, monospace', lineHeight:1.65, resize:'vertical', outline:'none' }}
            />
          </div>
          <div style={{ padding:18, borderRadius:14, background:'rgba(237,25,102,0.05)', border:'1px solid rgba(237,25,102,0.15)' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:10 }}>CSS Variables you can override:</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {['--pink: #ED1966','--blue: #2152A4','--bg: #0d0d14','--surface: #13131f','--text: #f0f0ff','--text-3: #7070a0','--border-2: rgba(255,255,255,0.1)'].map(v => (
                <code key={v} style={{ padding:'3px 9px', borderRadius:6, background:'var(--surface-2)', border:'1px solid var(--border-2)', fontSize:12, color:'var(--text-3)', fontFamily:'monospace' }}>{v}</code>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO & TRACKING */}
      {tab === 'seo' && (
        <div style={{ display:'grid', gap:18, maxWidth:700 }}>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>SEO & Meta Tags</h2>
            <div style={{ display:'grid', gap:14 }}>
              <div>{label('Meta Title')}<input value={seo.meta_title} onChange={e=>setSeo(s=>({...s,meta_title:e.target.value}))} placeholder="JUT — AI Platform" style={inp}/></div>
              <div>{label('Meta Description')}<textarea value={seo.meta_description} onChange={e=>setSeo(s=>({...s,meta_description:e.target.value}))} rows={3} style={{ ...inp, resize:'vertical' }}/></div>
              <div>{label('OG Image URL (for social sharing)')}<input value={seo.og_image} onChange={e=>setSeo(s=>({...s,og_image:e.target.value}))} placeholder="https://..." style={inp}/></div>
            </div>
          </div>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Analytics & Tracking</h2>
            <div style={{ display:'grid', gap:14 }}>
              <div>
                {label('Google Analytics ID')}
                <input value={seo.google_analytics} onChange={e=>setSeo(s=>({...s,google_analytics:e.target.value}))} placeholder="G-XXXXXXXXXX" style={inp}/>
                <p style={{ fontSize:11, color:'var(--text-4)', marginTop:4 }}>Get this from <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ color:'var(--pink)' }}>analytics.google.com</a></p>
              </div>
              <div>
                {label('Facebook Pixel ID')}
                <input value={seo.facebook_pixel} onChange={e=>setSeo(s=>({...s,facebook_pixel:e.target.value}))} placeholder="1234567890" style={inp}/>
                <p style={{ fontSize:11, color:'var(--text-4)', marginTop:4 }}>Get this from <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" style={{ color:'var(--pink)' }}>Facebook Events Manager</a></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRATIONS */}
      {tab === 'integrations' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ padding:14, borderRadius:12, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
              <strong>Important:</strong> API keys must be added in{' '}
              <a href="https://vercel.com/juanpafirez-creates-projects/jut-for-all/settings/environment-variables" target="_blank" rel="noopener noreferrer" style={{ color:'#60a5fa', textDecoration:'underline' }}>Vercel Environment Variables</a>
              {' '}and a redeploy triggered for changes to take effect.
            </div>
          </div>

          {[
            { title:'AI Image Generation', color:'#8b5cf6', items:[
              { key:'OPENAI_API_KEY', label:'OpenAI API Key', desc:'DALL-E 3 image generation (~$0.04/image)', link:'https://platform.openai.com/api-keys' },
              { key:'STABILITY_API_KEY', label:'Stability AI Key', desc:'Stable Diffusion XL (~$0.002/image) — Recommended', link:'https://platform.stability.ai/' },
              { key:'REPLICATE_API_KEY', label:'Replicate API Key', desc:'SDXL via Replicate (~$0.003/image)', link:'https://replicate.com/account/api-tokens' },
            ]},
            { title:'Payments — Colombia (Wompi)', color:'#22c55e', items:[
              { key:'WOMPI_PUBLIC_KEY', label:'Wompi Public Key', desc:'PSE, Nequi, Bancolombia, credit cards', link:'https://wompi.co' },
              { key:'WOMPI_INTEGRITY_SECRET', label:'Wompi Integrity Secret', desc:'For secure transaction signatures', link:'https://wompi.co' },
              { key:'WOMPI_EVENTS_SECRET', label:'Wompi Events Secret', desc:'For webhook verification', link:'https://wompi.co' },
            ]},
            { title:'Payments — International (Stripe)', color:'#3b82f6', items:[
              { key:'STRIPE_SECRET_KEY', label:'Stripe Secret Key', desc:'International credit card payments', link:'https://dashboard.stripe.com/apikeys' },
              { key:'STRIPE_PRICE_GROWTH', label:'Stripe Growth Price ID', desc:'Price ID for the Growth plan', link:'https://dashboard.stripe.com/products' },
              { key:'STRIPE_PRICE_ELITE', label:'Stripe Elite Price ID', desc:'Price ID for the Elite plan', link:'https://dashboard.stripe.com/products' },
            ]},
            { title:'Social Networks (Meta)', color:'#ED1966', items:[
              { key:'META_APP_ID', label:'Meta App ID', desc:'Facebook/Instagram App ID from developers.facebook.com', link:'https://developers.facebook.com' },
              { key:'META_APP_SECRET', label:'Meta App Secret', desc:'Facebook/Instagram App Secret', link:'https://developers.facebook.com' },
              { key:'META_WEBHOOK_VERIFY_TOKEN', label:'Webhook Verify Token', desc:'Any secret string you create for webhook verification', link:'https://developers.facebook.com' },
            ]},
            { title:'Email', color:'#f59e0b', items:[
              { key:'RESEND_API_KEY', label:'Resend API Key', desc:'For transactional emails (welcome, reset password)', link:'https://resend.com' },
            ]},
          ].map(group => (
            <div key={group.title} style={{ padding:22, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
              <h2 style={{ fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:group.color, flexShrink:0 }}/>
                {group.title}
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {group.items.map(item => (
                  <div key={item.key}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{item.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>{item.desc}</div>
                      </div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text-3)', textDecoration:'none', padding:'4px 8px', borderRadius:7, background:'var(--surface-2)', border:'1px solid var(--border-2)', flexShrink:0 }}>
                        Get key <ExternalLink size={10}/>
                      </a>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <code style={{ flex:1, padding:'8px 12px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border-2)', fontSize:12, color:'var(--text-3)', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {item.key} = {'*'.repeat(20)}
                      </code>
                      <div style={{ padding:'7px 11px', borderRadius:9, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', fontSize:11, color:'#fbbf24', fontWeight:600, whiteSpace:'nowrap', flexShrink:0 }}>
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

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)', maxWidth:600 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Notification Preferences</h2>
          {[
            { label:'New lead captured', desc:'When an automation captures a new lead', on:true },
            { label:'Automation triggered', desc:'When an automation fires successfully', on:false },
            { label:'Conversation reply', desc:'When someone replies in a conversation', on:true },
            { label:'Payment received', desc:'When a subscription payment is processed', on:true },
            { label:'Weekly digest', desc:'Weekly summary of your account activity', on:true },
            { label:'System alerts', desc:'Important platform updates and downtime', on:true },
          ].map((n, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:i<5?'1px solid var(--border)':'none', gap:16 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{n.label}</div>
                <div style={{ fontSize:12, color:'var(--text-4)', marginTop:2 }}>{n.desc}</div>
              </div>
              <div style={{ width:42, height:22, borderRadius:999, background:n.on?'var(--pink)':'var(--surface-3)', position:'relative', cursor:'pointer', flexShrink:0, border:'1px solid '+(n.on?'rgba(237,25,102,0.4)':'var(--border-2)'), transition:'background 0.2s' }}>
                <div style={{ position:'absolute', top:2, left:n.on?21:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY */}
      {tab === 'security' && (
        <div style={{ maxWidth:600, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Change Password</h2>
            <div style={{ display:'grid', gap:12 }}>
              <div>{label('Current Password')}<input type="password" placeholder="••••••••" style={inp}/></div>
              <div>{label('New Password')}<input type="password" placeholder="••••••••" style={inp}/></div>
              <div>{label('Confirm New Password')}<input type="password" placeholder="••••••••" style={inp}/></div>
            </div>
            <button style={{ marginTop:16, padding:'10px 22px', borderRadius:11, background:'var(--pink)', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Update Password
            </button>
          </div>
          <div style={{ padding:24, borderRadius:18, background:'var(--surface)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6, color:'#ef4444' }}>Danger Zone</h2>
            <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:14 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button style={{ padding:'10px 18px', borderRadius:11, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444', fontWeight:600, fontSize:13, cursor:'pointer' }}>
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}