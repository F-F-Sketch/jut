'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Plug, CreditCard, Webhook, Save, Loader2, Check, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const EVENTS = ['instagram_comment','instagram_dm','lead_captured','lead_qualified','automation_fired','conversation_started','order_placed']

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === 'es' ? 'es' : 'en'
  const supabase = createClient()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', email: '', currency: 'COP', locale })
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [newWh, setNewWh] = useState({ name: '', url: '', events: [] as string[] })
  const [addingWh, setAddingWh] = useState(false)
  useEffect(() => { loadData() }, [])
  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (p) setProfile({ full_name: p.full_name ?? '', email: user.email ?? '', currency: p.currency ?? 'COP', locale: p.locale ?? locale })
      const { data: wh } = await supabase.from('user_webhooks').select('*').order('created_at').catch(() => ({ data: null }))
      setWebhooks(wh ?? [])
    } catch {}
  }
  async function saveProfile() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ full_name: profile.full_name, currency: profile.currency, locale: profile.locale }).eq('user_id', user.id)
      toast.success(locale === 'es' ? 'Perfil guardado' : 'Profile saved')
    } catch { toast.error('Error') }
    setSaving(false)
  }
  async function changePassword() {
    if (passwords.new !== passwords.confirm) { toast.error(locale === 'es' ? "No coinciden" : "Don't match"); return }
    if (passwords.new.length < 6) { toast.error('Min 6 chars'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.new })
    if (error) toast.error(error.message)
    else { toast.success(locale === 'es' ? 'ContraseÃ±a actualizada' : 'Password updated'); setPasswords({ new: '', confirm: '' }) }
    setSaving(false)
  }
  async function addWebhook() {
    if (!newWh.name || !newWh.url || !newWh.events.length) { toast.error('Name, URL and events required'); return }
    setAddingWh(true)
    const secret = `wh_${Math.random().toString(36).slice(2,18)}`
    const { data, error } = await supabase.from('user_webhooks').insert({ name: newWh.name, url: newWh.url, events: newWh.events, secret, is_active: true }).select().single()
    if (error) { toast.error(error.message); setAddingWh(false); return }
    setWebhooks(p => [...p, data]); setNewWh({ name: '', url: '', events: [] }); toast.success('Webhook created'); setAddingWh(false)
  }
  async function deleteWebhook(id: string) {
    await supabase.from('user_webhooks').delete().eq('id', id)
    setWebhooks(p => p.filter(w => w.id !== id)); toast.success('Deleted')
  }
  async function testWebhook(wh: any) {
    try {
      const res = await fetch(wh.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-JUT-Event': 'test' }, body: JSON.stringify({ event_type: 'test', message: 'JUT test' }) })
      res.ok ? toast.success(`Sent â ${res.status}`) : toast.error(`Status ${res.status}`)
    } catch { toast.error('Could not reach') }
  }
  const TABS = [{ key: 'profile', label: locale === 'es' ? 'Perfil' : 'Profile', icon: User },{ key: 'security', label: locale === 'es' ? 'Seguridad' : 'Security', icon: Lock },{ key: 'integrations', label: locale === 'es' ? 'Integraciones' : 'Integrations', icon: Plug },{ key: 'billing', label: locale === 'es' ? 'FacturaciÃ³n' : 'Billing', icon: CreditCard },{ key: 'webhooks', label: 'Webhooks', icon: Webhook }]
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Ajustes' : 'Settings'}</h1><p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Gestiona tu cuenta' : 'Manage your account'}</p></div>
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        {TABSv.map(({ key, label, icon: Icon }) => (<button key={key} onClick={() => setTab(key)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0" style={{ background: tab === key ? 'var(--surface-2)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)', border: tab === key ? '1px solid var(--border-2)' : '1px solid transparent' }}><Icon size={14} /><span>{label}</span></button>))}
      </div>
      {tab === 'profile' && (<div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'InformaciÃ³n Personal' : 'Personal Information'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{label:locale==='es'?'Nombre':'Full name',field:'full_name',type:'text',disabled:false},{label:locale==='es'?'Correo':'Email',field:'email',type:'email',disabled:true}].map(({label,field,type,disabled})=>(<div key={field}><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{label}</label><input type={type} value={(profile as any)[field]} disabled={disabled} onChange={e=>setProfile(p=>({...p,[field]:e.target.value}))} className={`input ${disabled?'opacity-50 cursor-not-allowed':''}`} /></div>))}
          <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{locale==='es'?'Moneda':'Currency'}</label><select value={profile.currency} onChange={e=>setProfile(p=>({...p,currency:e.target.value}))} className="input"><option value="COP">COP - Peso</option><option value="USD">USD - Dollar</option></select></div>
          <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{locale==='es'?'Idioma':'Language'}</label><select value={profile.locale} onChange={e=>setProfile(p=>({...p,locale:e.target.value}))} className="input"><option value="es">EspaÃ±ol</option><option value="en">English</option></select></div>
        </div>
        <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff',opacity:saving?0.7:1}}>{saving?<Loader2 size={14} className="animate-spin" />:<Save size={14} />} {locale==='es'?'Guardar':'Save'}</button>
      </div>)}
      {tab === 'security' && (<div className="rounded-2xl p-6 space-y-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
        <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>{locale==='es'?'Cambiar ContraseÃ±a':'Change Password'}</h2>
        <div className="space-y-4 max-w-md">
          {(['new','confirm'] as const).map(f=>(<div key={f}><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{f==='new'?(locale==='es'?'Nueva contraseÃ±a':'New password'):(locale==='es'?'Confirmar':'Confirm')}</label><div className="relative"><input type={showPass?'text':'password'} value={passwords[f]} onChange={e=>setPasswords(p=>({...p,[f]:e.target.value}))} className="input pr-10" />{f==='new'&&(<button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-3)'}}>{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>)}</div></div>))}
          <button onClick={changePassword} disabled={saving} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'.opacity:saving?0.7:1}}>{saving?<Loader2 size={14} className="animate-spin" />:<Check size={14} />} {locale==='es'?'Actualizar':'Update password'}</button>
        </div>
      </div>)}
      {tab === 'integrations' && (<div className="space-y-4">{[{name:'Instagram',icon:'ð¸',desc:locale==='es'?'Conecta para DMs automÃ¡ticos':'Connect for automated DMs'},{name:'WhatsApp Business',icon:'0ð¬',desc:locale==='es'?'Mensajes automÃ¡ticos':'Automated messages'}].map(({name,icon,desc})=>(<div key={name} className="rounded-2xl p-5 flex items-center gap-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}><span className="text-2xl">{icon}</span><div className="flex-1"><p className="font-bold text-sm" style={{color:'var(--text)"}}>{name}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{desc}</p></div><span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{background:'rgba(96,96,128,0.15)',color:'var(--text-3)'}}>{locale==='es'?'PrÃ³ximamente':'Coming soon'}</span></div>))}</div>)}
      {tab === 'webhooks' && (<div className="space-y-5">
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>{locale==='es'?'Nuevo Webhook':'New Webhook'</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{locale==='es'?'Nombre':'Name'}</label><input value={newWh.name} onChange={e=>setNewWh(p=>({...p,name:e.target.value}))} placeholder="n8n" className="input" /></div>
            <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>URL</label><input value={newWh.url} onChange={e=>setNewWh(p=>({...p,url:e.target.value}))} placeholder="https://..." className="input" /></div>
          </div>
          <div className="flex flex-wrap gap-2">{EVENTS.map(ev=>(<button key={ev} onClick={()=>setNewWh(p=>({...p,events:p.events.includes(ev)?p.events.filter(x=>x!==ev):[...p.events,ev]}))} className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{background:newWh.events.includes(ev)?'rgba(237,25,102,0.1)':'var(--surface-2)',color:newWh.events.includes(ev)?'var(--pink)':'var(--text-3)',border:`1px solid ${newWh.events.includes(ev)?'rgba(237,25,102,0.3)':'var(--border-2)'}`}}>{ev.replace(/_/g,' ')}</button>))}</div>
          <button onClick={addWebhook} disabled={addingWh} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff',opacity:addingWh?0.7:1}}>{addingWh?<Loader2 size={14} className="animate-spin" />:<Plus size={14} />} {locale==='es'?'Agregar':'Add Webhook'}</button>
        </div>
        {webhooks.length>0&&(<div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>{webhooks.map((wh:any)=>(<div key={wh.id} className="px-6 py-4 flex items-start gap-4" style={{borderBottom:'1px solid var(--border)'}}><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="font-semibold text-sm" style={{color:'var(--text)'}}>{wh.name}</p><span className="text-xs px-2 py-0.5 rounded-full" style={{background:wh.is_active?'rgba(34,197,94,0.1)':'rgba(96,96,128,0.1)',color:wh.is_active?'#22c55e':'var(--text-3)'}}>{wh.is_active?'Active':'Paused'}</span></div><p className="text-xs truncate" style={{color:'var(--text-3)'}}>{wh.url}</p><div className="flex flex-wrap gap-1 mt-1">{wh.events?.map((ev:string)=><span key={ev} className="text-xs px-2 py-0.5 rounded" style={{background:'var(--surface-2)',color:'var(--text-3)'}}>{ev}</span>)}</div></div><div className="flex items-center gap-2"><button onClick={()=>testWebhook(wh)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{background:'rgba(74,144,217,0.1)',color:'#4a90d9'}}>Test</button><button onClick={()=>deleteWebhook(wh.id)} className="p-2 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}><Trash2 size={13} /></button></div></div>))}</div>)}
      </div>)}
    </div>
  )
}
