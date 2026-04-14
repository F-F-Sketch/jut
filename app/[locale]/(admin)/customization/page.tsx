'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload, Palette, Code, Globe, Image, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_CSS = `/* Custom CSS for JUT Platform */
/* This CSS is injected globally across your platform */

/* Example: Change primary color */
/* :root { --pink: #your-color; } */

/* Example: Custom button style */
/* .jut-btn-primary { border-radius: 4px; } */
`

export default function CustomizationPage() {
  const [tab, setTab] = useState<'brand'|'css'|'seo'>('brand')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [brand, setBrand] = useState({
    platform_name: 'JUT',
    tagline: 'Automate Every Conversation',
    logo_url: '',
    favicon_url: '',
    primary_color: '#ED1966',
    secondary_color: '#2152A4',
    bg_color: '#0d0d14',
    font: 'system-ui',
  })
  const [customCss, setCustomCss] = useState(DEFAULT_CSS)
  const [seo, setSeo] = useState({
    meta_title: 'JUT — AI Platform',
    meta_description: 'Automate your business with AI agents',
    og_image: '',
    google_analytics: '',
    facebook_pixel: '',
  })
  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('platform_settings').select('*').eq('user_id', user.id).single()
    if (data) {
      if (data.brand) setBrand({ ...brand, ...data.brand })
      if (data.custom_css) setCustomCss(data.custom_css)
      if (data.seo) setSeo({ ...seo, ...data.seo })
    }
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { user_id: user.id, brand, custom_css: customCss, seo, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('platform_settings').upsert(payload, { onConflict: 'user_id' })
    if (error) { toast.error('Save failed: ' + error.message); setSaving(false); return }
    setSaving(false); setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  async function uploadFile(file: File, type: 'logo' | 'favicon') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${type}.${ext}`
    const { error } = await supabase.storage.from('brand').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); return }
    const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(path)
    if (type === 'logo') setBrand(b => ({ ...b, logo_url: publicUrl }))
    else setBrand(b => ({ ...b, favicon_url: publicUrl }))
    toast.success(`${type} uploaded!`)
  }

  const FONTS = ['system-ui', 'Inter', 'DM Sans', 'Syne', 'Poppins', 'Geist', 'Roboto', 'Montserrat']
  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:14, outline:'none', marginTop:6 }
  const label = (txt: string) => <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)',display:'block',marginBottom:4}}>{txt}</label>

  return (
    <div style={{padding:32,maxWidth:1000}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Customization</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Brand, CSS, SEO and global platform settings</p>
        </div>
        <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:12,background:saved?'#22c55e':'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',transition:'background 0.2s'}}>
          {saved ? <><Check size={16}/> Saved</> : saving ? <><RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> Saving...</> : <><Save size={16}/> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,background:'var(--surface)',borderRadius:12,padding:4,width:'fit-content',border:'1px solid var(--border-2)'}}>
        {([['brand','Brand & Logo',Palette],['css','Custom CSS',Code],['seo','SEO & Tracking',Globe]] as any[]).map(([id,name,Icon]) => (
          <button key={id} onClick={()=>setTab(id)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',borderRadius:9,fontSize:14,fontWeight:600,cursor:'pointer',border:'none',background:tab===id?'var(--pink)':'transparent',color:tab===id?'#fff':'var(--text-3)'}}>
            <Icon size={14}/>{name}
          </button>
        ))}
      </div>

      {/* BRAND TAB */}
      {tab === 'brand' && (
        <div style={{display:'grid',gap:20}}>
          {/* Logo & Favicon */}
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:20}}>Logo & Favicon</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div>
                {label('Platform Logo')}
                <div style={{marginTop:8,padding:24,borderRadius:12,border:'2px dashed var(--border-2)',textAlign:'center',cursor:'pointer',background:'var(--surface-2)'}} onClick={()=>logoRef.current?.click()}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt="Logo" style={{maxHeight:60,maxWidth:'100%',objectFit:'contain'}}/>
                  ) : (
                    <div>
                      <Image size={32} style={{color:'var(--text-3)',display:'block',margin:'0 auto 8px'}}/>
                      <p style={{fontSize:13,color:'var(--text-3)'}}>Click to upload logo</p>
                      <p style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>PNG, SVG recommended</p>
                    </div>
                  )}
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0],'logo')}/>
                </div>
                {label('Or paste URL')}
                <input value={brand.logo_url} onChange={e=>setBrand(b=>({...b,logo_url:e.target.value}))} placeholder="https://..." style={inp}/>
              </div>
              <div>
                {label('Favicon (32x32)')}
                <div style={{marginTop:8,padding:24,borderRadius:12,border:'2px dashed var(--border-2)',textAlign:'center',cursor:'pointer',background:'var(--surface-2)'}} onClick={()=>faviconRef.current?.click()}>
                  {brand.favicon_url ? (
                    <img src={brand.favicon_url} alt="Favicon" style={{width:32,height:32,objectFit:'contain',display:'block',margin:'0 auto'}}/>
                  ) : (
                    <div>
                      <Upload size={32} style={{color:'var(--text-3)',display:'block',margin:'0 auto 8px'}}/>
                      <p style={{fontSize:13,color:'var(--text-3)'}}>Click to upload favicon</p>
                      <p style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>.ico or 32x32 PNG</p>
                    </div>
                  )}
                  <input ref={faviconRef} type="file" accept="image/*,.ico" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0],'favicon')}/>
                </div>
                {label('Or paste URL')}
                <input value={brand.favicon_url} onChange={e=>setBrand(b=>({...b,favicon_url:e.target.value}))} placeholder="https://..." style={inp}/>
              </div>
            </div>
          </div>

          {/* Identity */}
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:20}}>Identity</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>{label('Platform Name')}<input value={brand.platform_name} onChange={e=>setBrand(b=>({...b,platform_name:e.target.value}))} placeholder="JUT" style={inp}/></div>
              <div>{label('Tagline')}<input value={brand.tagline} onChange={e=>setBrand(b=>({...b,tagline:e.target.value}))} placeholder="Automate Every Conversation" style={inp}/></div>
              <div>
                {label('Font Family')}
                <select value={brand.font} onChange={e=>setBrand(b=>({...b,font:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:20}}>Colors</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
              {([['primary_color','Primary (Pink)'],['secondary_color','Secondary (Blue)'],['bg_color','Background']] as [string,string][]).map(([key,name]) => (
                <div key={key}>
                  {label(name)}
                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
                    <input type="color" value={(brand as any)[key]} onChange={e=>setBrand(b=>({...b,[key]:e.target.value}))} style={{width:44,height:44,borderRadius:10,border:'1px solid var(--border-2)',cursor:'pointer',background:'none',padding:2}}/>
                    <input value={(brand as any)[key]} onChange={e=>setBrand(b=>({...b,[key]:e.target.value}))} style={{...inp,marginTop:0,flex:1,fontFamily:'monospace'}}/>
                  </div>
                  <div style={{marginTop:8,height:32,borderRadius:8,background:(brand as any)[key]}}/>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Preview</h2>
            <div style={{padding:20,borderRadius:12,background:(brand.bg_color)||'#0d0d14',display:'flex',alignItems:'center',gap:12}}>
              {brand.logo_url ? <img src={brand.logo_url} alt="logo" style={{height:36,objectFit:'contain'}}/> : <div style={{width:36,height:36,borderRadius:10,background:brand.primary_color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:14}}>J</div>}
              <div>
                <div style={{fontFamily:brand.font,fontWeight:800,fontSize:20,color:'#fff',letterSpacing:-0.5}}>{brand.platform_name}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:2}}>{brand.tagline}</div>
              </div>
              <button style={{marginLeft:'auto',padding:'8px 16px',borderRadius:8,background:brand.primary_color,border:'none',color:'#fff',fontWeight:700,fontSize:13,fontFamily:brand.font}}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS TAB */}
      {tab === 'css' && (
        <div style={{display:'grid',gap:20}}>
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Custom CSS</h2>
                <p style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>Injected globally — affects all pages and all users</p>
              </div>
              <div style={{padding:'4px 12px',borderRadius:999,fontSize:12,background:'rgba(34,197,94,0.1)',color:'#22c55e',fontWeight:600}}>Live</div>
            </div>
            <textarea value={customCss} onChange={e=>setCustomCss(e.target.value)} rows={20}
              style={{width:'100%',padding:16,borderRadius:12,background:'#0a0a0f',border:'1px solid var(--border-2)',color:'#e0e0ff',fontSize:13,fontFamily:'Monaco, Consolas, monospace',lineHeight:1.6,resize:'vertical',outline:'none'}}/>
          </div>
          <div style={{padding:20,borderRadius:14,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.15)'}}>
            <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:8}}>CSS Variables you can override:</p>
            <div style={{fontFamily:'monospace',fontSize:12,color:'var(--text-3)',lineHeight:2}}>
              {['--pink: #ED1966','--blue: #2152A4','--bg: #0d0d14','--surface: #13131f','--text: #f0f0ff','--text-3: #7070a0','--border-2: rgba(255,255,255,0.1)'].map(v => (
                <div key={v} style={{padding:'2px 10px',borderRadius:6,background:'var(--surface-2)',marginBottom:4,display:'inline-block',marginRight:8}}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {tab === 'seo' && (
        <div style={{display:'grid',gap:20}}>
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:20}}>SEO & Meta Tags</h2>
            <div style={{display:'grid',gap:16}}>
              <div>{label('Meta Title')}<input value={seo.meta_title} onChange={e=>setSeo(s=>({...s,meta_title:e.target.value}))} placeholder="JUT — AI Platform" style={inp}/></div>
              <div>{label('Meta Description')}<textarea value={seo.meta_description} onChange={e=>setSeo(s=>({...s,meta_description:e.target.value}))} rows={3} style={{...inp,resize:'vertical'}}/></div>
              <div>{label('OG Image URL (for social sharing)')}<input value={seo.og_image} onChange={e=>setSeo(s=>({...s,og_image:e.target.value}))} placeholder="https://..." style={inp}/></div>
            </div>
          </div>
          <div style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:20}}>Tracking & Analytics</h2>
            <div style={{display:'grid',gap:16}}>
              <div>{label('Google Analytics ID (G-XXXXXXXXXX)')}<input value={seo.google_analytics} onChange={e=>setSeo(s=>({...s,google_analytics:e.target.value}))} placeholder="G-XXXXXXXXXX" style={inp}/></div>
              <div>{label('Facebook Pixel ID')}<input value={seo.facebook_pixel} onChange={e=>setSeo(s=>({...s,facebook_pixel:e.target.value}))} placeholder="1234567890" style={inp}/></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
