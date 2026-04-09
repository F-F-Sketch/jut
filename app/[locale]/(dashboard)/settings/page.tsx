'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Plug, CreditCard, Webhook, Save, Loader2, Check, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = createClient()
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [newWebhookUrl, setNewWebhookUrl] = useState('')

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (data) setProfile(data)
  }

  async function saveProfile() {
    if (!profile) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        business_name: profile.business_name,
        currency: profile.currency,
        locale: profile.locale,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id)
      if (error) toast.error('Error saving')
      else { toast.success('Saved!'); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    }
    setLoading(false)
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newPass = fd.get('new') as string
    const confirm = fd.get('confirm') as string
    if (newPass !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) toast.error(error.message); else toast.success('Password updated!')
    setLoading(false)
    ;(e.target as HTMLFormElement).reset()
  }

  const TABS = [
    { key: 'profile', label: locale === 'es' ? 'Perfil' : 'Profile', icon: User },
    { key: 'security', label: locale === 'es' ? 'Seguridad' : 'Security', icon: Lock },
    { key: 'integrations', label: locale === 'es' ? 'Integraciones' : 'Integrations', icon: Plug },
    { key: 'billing', label: locale === 'es' ? 'Facturacion' : 'Billing', icon: CreditCard },
    { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  ]

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>
          {locale === 'es' ? 'Ajustes' : 'Settings'}
        </h1>
        <p className="text-sm" style={{color:'var(--text-3)'}}>
          {locale === 'es' ? 'Gestiona tu cuenta' : 'Manage your account'}
        </p>
      </div>
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
        {TABS.map(({key,label,icon:Icon}) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={{background:tab===key?'var(--surface-2)':'transparent',color:tab===key?'var(--text)':'var(--text-3)',border:tab===key?'1px solid var(--border-2)':'1px solid transparent'}}>
            <Icon size={14} /><span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="rounded-2xl p-6 space-y-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Informacion de perfil' : 'Profile Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {key:'full_name',label:locale==='es'?'Nombre completo':'Full name'},
              {key:'business_name',label:locale==='es'?'Nombre del negocio':'Business name'},
            ].map(({key,label}) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{label}</label>
                <input value={profile?.[key]??''} onChange={e=>setProfile((p:any)=>({...p,[key]:e.target.value}))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>
                {locale === 'es' ? 'Moneda' : 'Currency'}
              </label>
              <select value={profile?.currency??'USD'} onChange={e=>setProfile((p:any)=>({...p,currency:e.target.value}))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp}>
                <option value="USD">USD</option><option value="COP">COP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>
                {locale === 'es' ? 'Idioma' : 'Language'}
              </label>
              <select value={profile?.locale??'en'} onChange={e=>setProfile((p:any)=>({...p,locale:e.target.value}))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp}>
                <option value="en">English</option><option value="es">Espanol</option>
              </select>
            </div>
          </div>
          <button onClick={saveProfile} disabled={loading}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
            style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
            {loading?<Loader2 size={14} className="animate-spin"/>:saved?<Check size={14}/>:<Save size={14}/>}
            {saved?(locale==='es'?'Guardado':'Saved'):(locale==='es'?'Guardar cambios':'Save changes')}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="rounded-2xl p-6" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-lg mb-5" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Cambiar contrasena' : 'Change Password'}
          </h2>
          <form onSubmit={changePassword} className="space-y-4 max-w-sm">
            {[
              {name:'new',label:locale==='es'?'Nueva contrasena':'New password'},
              {name:'confirm',label:locale==='es'?'Confirmar contrasena':'Confirm password'},
            ].map(({name,label}) => (
              <div key={name}>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{label}</label>
                <input name={name} type="password" required minLength={6}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{background:'var(--pink)',color:'#fff'}}>
              {loading?<Loader2 size={14} className="animate-spin"/>:<Lock size={14}/>}
              {locale === 'es' ? 'Actualizar contrasena' : 'Update password'}
            </button>
          </form>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>Integrations</h2>
          <p className="text-sm" style={{color:'var(--text-3)'}}>
            {locale === 'es' ? 'Conecta tus plataformas para activar automatizaciones.' : 'Connect your platforms to activate automations.'}
          </p>
          {[{name:'Instagram',icon:'📸'},{name:'WhatsApp',icon:'💬'},{name:'Stripe',icon:'💳'}].map(({name,icon}) => (
            <div key={name} className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{color:'var(--text)'}}>{name}</p>
                  <p className="text-xs" style={{color:'var(--text-3)'}}>Not connected</p>
                </div>
              </div>
              <button className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{background:'var(--pink)',color:'#fff'}}>Connect</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'billing' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Facturacion' : 'Billing'}
          </h2>
          <div className="rounded-xl p-5" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
            <p className="text-sm font-semibold mb-1" style={{color:'var(--text)'}}>
              {locale === 'es' ? 'Plan actual' : 'Current plan'}: <span style={{color:'var(--pink)'}}>{profile?.plan ?? 'Free'}</span>
            </p>
            <p className="text-xs" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'Gestiona tu suscripcion desde el panel de precios.' : 'Manage your subscription from the pricing panel.'}
            </p>
          </div>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>Webhooks</h2>
          <p className="text-sm" style={{color:'var(--text-3)'}}>
            {locale === 'es' ? 'Recibe notificaciones HTTP cuando ocurran eventos.' : 'Receive HTTP notifications when events occur.'}
          </p>
          <div className="flex gap-2">
            <input value={newWebhookUrl} onChange={e=>setNewWebhookUrl(e.target.value)}
              placeholder="https://your-endpoint.com/webhook"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
            <button onClick={()=>{if(newWebhookUrl){setWebhooks(w=>[...w,{id:Date.now(),url:newWebhookUrl}]);setNewWebhookUrl('')}}}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl" style={{background:'var(--pink)',color:'#fff'}}>
              <Plus size={13}/> Add
            </button>
          </div>
          {webhooks.map((w:any) => (
            <div key={w.id} className="flex items-center justify-between p-3 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
              <span className="text-sm truncate" style={{color:'var(--text-2)'}}>{w.url}</span>
              <button onClick={()=>setWebhooks(ws=>ws.filter(x=>x.id!==w.id))} style={{color:'var(--text-3)'}}>
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
