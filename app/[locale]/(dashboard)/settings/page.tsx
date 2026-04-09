'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Plug, CreditCard, Webhook, Save, Loader2, Check, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = createClient()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhooks, setWebhooks] = useState<any[]>([])

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (data) setProfile(data)
    const { data: hooks } = await supabase.from('webhooks').select('*').eq('user_id', user.id)
    setWebhooks(hooks ?? [])
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        full_name: profile.full_name,
        business_name: profile.business_name,
        locale: profile.locale,
        currency: profile.currency,
      }).eq('user_id', user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success(locale === 'es' ? 'Guardado' : 'Saved')
    }
    setSaving(false)
  }

  async function changePassword(current: string, next: string) {
    const { error } = await supabase.auth.updateUser({ password: next })
    if (error) toast.error(error.message)
    else toast.success(locale === 'es' ? 'Contrasena actualizada' : 'Password updated')
  }

  async function addWebhook() {
    if (!webhookUrl.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('webhooks').insert({ user_id: user.id, url: webhookUrl, events: ['lead_captured','sale','automation_fired'], active: true }).select().single()
    if (data) { setWebhooks(prev => [...prev, data]); setWebhookUrl('') }
  }

  async function deleteWebhook(id: string) {
    await supabase.from('webhooks').delete().eq('id', id)
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  const TABS = [
    { key: 'profile', label: locale === 'es' ? 'Perfil' : 'Profile', icon: User },
    { key: 'security', label: locale === 'es' ? 'Seguridad' : 'Security', icon: Lock },
    { key: 'integrations', label: locale === 'es' ? 'Integraciones' : 'Integrations', icon: Plug },
    { key: 'billing', label: locale === 'es' ? 'Facturacion' : 'Billing', icon: CreditCard },
    { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  ]

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
        {TABS.map(({key, label, icon: Icon}) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={{
              background: tab === key ? 'var(--surface-2)' : 'transparent',
              color: tab === key ? 'var(--text)' : 'var(--text-3)',
              border: tab === key ? '1px solid var(--border-2)' : '1px solid transparent',
            }}>
            <Icon size={14} /><span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Informacion personal' : 'Personal information'}
          </h2>
          {[
            {key:'full_name',label:locale==='es'?'Nombre completo':'Full name',type:'text'},
            {key:'business_name',label:locale==='es'?'Nombre del negocio':'Business name',type:'text'},
          ].map(({key,label,type}) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{color:'var(--text-3)'}}>{label}</label>
              <input type={type} value={profile?.[key] ?? ''} onChange={e => setProfile((p: any) => ({...p,[key]:e.target.value}))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)'}} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'var(--text-3)'}}>Language</label>
              <select value={profile?.locale ?? 'en'} onChange={e => setProfile((p: any) => ({...p,locale:e.target.value}))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)'}}>
                <option value="en">English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'var(--text-3)'}}>Currency</label>
              <select value={profile?.currency ?? 'USD'} onChange={e => setProfile((p: any) => ({...p,currency:e.target.value}))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)'}}>
                <option value="USD">USD $</option>
                <option value="COP">COP $</option>
              </select>
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all"
            style={{background:'var(--pink)',color:'#fff',opacity:saving?0.7:1}}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? (locale==='es'?'Guardado!':'Saved!') : (locale==='es'?'Guardar cambios':'Save changes')}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Cambiar contrasena' : 'Change password'}
          </h2>
          <PasswordForm locale={locale} onSave={changePassword} />
        </div>
      )}

      {tab === 'integrations' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>Integrations</h2>
          <p className="text-sm" style={{color:'var(--text-3)'}}>
            {locale === 'es' ? 'Conecta tus plataformas' : 'Connect your platforms'}
          </p>
          {['Instagram','WhatsApp','Facebook'].map(name => (
            <div key={name} className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
              <span className="text-sm font-medium" style={{color:'var(--text)'}}>{name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(96,96,128,0.15)',color:'var(--text-3)'}}>
                {locale === 'es' ? 'No conectado' : 'Not connected'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'billing' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Plan y facturacion' : 'Plan & billing'}
          </h2>
          <div className="p-4 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
            <p className="text-sm font-semibold" style={{color:'var(--text)'}}>
              {locale === 'es' ? 'Plan actual' : 'Current plan'}: <span style={{color:'var(--pink)'}}>{profile?.plan ?? 'Free'}</span>
            </p>
          </div>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <h2 className="font-display font-bold text-base" style={{color:'var(--text)'}}>Webhooks</h2>
          <div className="flex gap-3">
            <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-endpoint.com/webhook"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)'}} />
            <button onClick={addWebhook} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>
              <Plus size={14} /> Add
            </button>
          </div>
          {webhooks.map(w => (
            <div key={w.id} className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
              <span className="text-xs font-mono truncate flex-1 mr-4" style={{color:'var(--text-2)'}}>{w.url}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(w.url); toast.success('Copied!') }}
                  className="p-1.5 rounded-lg" style={{color:'var(--text-3)'}}><Copy size={12} /></button>
                <button onClick={() => deleteWebhook(w.id)} className="p-1.5 rounded-lg" style={{color:'#ef4444'}}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PasswordForm({ locale, onSave }: { locale: string; onSave: (current: string, next: string) => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  return (
    <div className="space-y-3">
      {[
        {label:locale==='es'?'Contrasena actual':'Current password',val:current,set:setCurrent},
        {label:locale==='es'?'Nueva contrasena':'New password',val:next,set:setNext},
        {label:locale==='es'?'Confirmar contrasena':'Confirm password',val:confirm,set:setConfirm},
      ].map(({label,val,set}) => (
        <div key={label}>
          <label className="block text-xs font-medium mb-1.5" style={{color:'var(--text-3)'}}>{label}</label>
          <input type="password" value={val} onChange={e => set(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)'}} />
        </div>
      ))}
      <button onClick={() => next === confirm ? onSave(current, next) : null}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>
        <Save size={14} /> {locale === 'es' ? 'Actualizar contrasena' : 'Update password'}
      </button>
    </div>
  )
}
