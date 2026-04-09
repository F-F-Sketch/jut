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
    if (passwords.new !== passwords.confirm) { toast.error(locale === 'es' ? 'Las contraseÃ±as no coinciden' : "Passwords don't match"); return }
    if (passwords.new.length < 6) { toast.error('Min 6 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.new })
    if (error) toast.error(error.message)
    else { toast.success(locale === 'es' ? 'ContraseÃ±a actualizada' : 'Password updated'); setPasswords({ new: '', confirm: '' }) }
    setSaving(false)
  }

  async function addWebhook() {
    if (!newWh.name || !newWh.url || !newWh.events.length) { toast.error('Name, URL and at least one event required'); return }
    setAddingWh(true)
    const secret = `wh_${Math.random().toString(36).slice(2,18)}`
    const { data, error } = await supabase.from('user_webhooks').insert({ name: newWh.name, url: newWh.url, events: newWh.events, secret, is_active: true }).select().single()
    if (error) { toast.error(error.message); setAddingWh(false); return }
    setWebhooks(p => [...p, data])
    setNewWh({ name: '', url: '', events: [] })
    toast.success(locale === 'es' ? 'Webhook creado' : 'Webhook created')
    setAddingWh(false)
  }

  async function deleteWebhook(id: string) {
    await supabase.from('user_webhooks').delete().eq('id', id)
    setWebhooks(p => p.filter(w => w.id !== id))
    toast.success(locale === 'es' ? 'Eliminado' : 'Deleted')
  }

  async function testWebhook(wh: any) {
    try {
      const res = await fetch(wh.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-JUT-Event': 'test', 'X-JUT-Secret': wh.secret ?? '' }, body: JSON.stringify({ event_type: 'test', message: 'JUT webhook test', timestamp: new Date().toISOString() }) })
      res.ok ? toast.success(`Sent â ${res.status}`) : toast.error(`Status ${res.status}`)
    } catch { toast.error('Could not reach URL') }
  }

  const TABS = [
    { key: 'profile', label: locale === 'es' ? 'Perfil' : 'Profile', icon: User },
    { key: 'security', label: locale === 'es' ? 'Seguridad' : 'Security', icon: Lock },
    { key: 'integrations', label: locale === 'es' ? 'Integraciones' : 'Integrations', icon: Plug },
    { key: 'billing', label: locale === 'es' ? 'FacturaciÃ³n' : 'Billing', icon: CreditCard },
    { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>{locale === 'es' ? 'Ajustes' : 'Settings'}</h1></div>
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
        {TABSDmap(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={{background:tab===key?'var(--surface-2)':'transparent',color:tab===key?'var(--text)':'var(--text-3)',border:tab===key?'1px solid var(--border-2)':'1px solid transparent'}}>
            <Icon size={14} /><span>{label}</span>
          </button>
        ))}
      </div>
      <p className="text-sm" style={{color:'var(--text-3)'}}>Settings content loads by tab</p>
    </div>
  )
}
