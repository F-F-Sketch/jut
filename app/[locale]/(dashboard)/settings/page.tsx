'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Plug, CreditCard, Save, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations('settings')
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [openaiKey, setOpenaiKey] = useState('')
  const [profile, setProfile] = useState({ full_name: '', email: '', currency: 'USD', locale })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) setProfile({ full_name: data.full_name ?? '', email: user.email ?? '', currency: data.currency ?? 'USD', locale: data.locale ?? locale })
    }
    load()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ full_name: profile.full_name, currency: profile.currency, locale: profile.locale }).eq('user_id', user.id)
    toast.success(t('save'))
    setSaving(false)
  }

  const TABS = [
    { key: 'profile', label: t('profile'), icon: User },
    { key: 'security', label: t('security'), icon: Lock },
    { key: 'integrations', label: t('integrations'), icon: Plug },
    { key: 'billing', label: t('billing'), icon: CreditCard },
  ]

  const INTEGRATIONS = [
    { id: 'instagram', name: 'Instagram', icon: '📸', connected: false, desc: locale === 'es' ? 'Conecta para triggers de comentarios y DMs' : 'Connect for comment triggers and DMs' },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', connected: false, desc: locale === 'es' ? 'Mensajes de WhatsApp' : 'WhatsApp messaging' },
    { id: 'stripe', name: 'Stripe', icon: '💳', connected: false, desc: locale === 'es' ? 'Procesa pagos en JUT' : 'Process payments in JUT' },
  ]

  const PLANS = [
    { id: 'free', name: locale === 'es' ? 'Gratis' : 'Free', price: '$0', features: locale === 'es' ? ['3 automatizaciones', '100 leads/mes'] : ['3 automations', '100 leads/month'] },
    { id: 'starter', name: 'Starter', price: '$97', features: locale === 'es' ? ['10 automatizaciones', '500 leads/mes', 'IA avanzada'] : ['10 automations', '500 leads/month', 'Advanced AI'], popular: true },
    { id: 'growth', name: 'Growth', price: '$297', features: locale === 'es' ? ['Ilimitado', 'IA premium', 'Voz'] : ['Unlimited', 'Premium AI', 'Voice'] },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1><p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p></div>
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap" style={activeTab === tab.key ? { color: 'var(--pink)', borderBottom: '2px solid var(--pink)' } : { color: 'var(--text-3)' }}><tab.icon size={14} />{tab.label}</button>)}
      </div>
      <div className="card rounded-2xl p-6 space-y-5">
        {activeTab === 'profile' && <>
          <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl" style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>{(profile.full_name || 'U').slice(0, 2).toUpperCase()}</div>
            <div><p className="font-bold" style={{ color: 'var(--text)' }}>{profile.full_name || 'Your Name'}</p><p className="text-sm" style={{ color: 'var(--text-3)' }}>{profile.email}</p></div>
          </div>
          <div className="space-y-2"><label className="block text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t('display_name')}</label><input className="input" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="block text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t('language')}</label><select className="input" value={profile.locale} onChange={e => setProfile(p => ({ ...p, locale: e.target.value }))}><option value="en">🇺🇸 English</option><option value="es">🇨🇴 Español</option></select></div>
            <div className="space-y-2"><label className="block text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t('currency')}</label><select className="input" value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}><option value="USD">USD ($)</option><option value="COP">COP ($)</option></select></div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{t('save')}</button>
        </>}
        {activeTab === 'integrations' && <div className="space-y-3">
          {INTEGRATIONS.map(int => (
            <div key={int.id} className="flex items-center gap-4 rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              <span className="text-2xl">{int.icon}</span>
              <div className="flex-1"><p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{int.name}</p><p className="text-xs" style={{ color: 'var(--text-3)' }}>{int.desc}</p></div>
              <button className="btn-primary text-xs px-3 py-1.5">{locale === 'es' ? 'Conectar' : 'Connect'}</button>
            </div>
          ))}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>🤖 OpenAI API Key</p>
            <div className="flex gap-3"><input className="input flex-1 text-sm" type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." /><button className="btn-primary px-4 text-sm">{t('save_key')}</button></div>
          </div>
        </div>}
        {activeTab === 'billing' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className="rounded-2xl p-5 relative" style={plan.popular ? { background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.3)' } : { background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: 'var(--pink)' }}>Popular</div>}
              <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text)' }}>{plan.name}</h3>
              <p className="font-display font-bold text-3xl mb-4" style={{ color: plan.popular ? 'var(--pink)' : 'var(--text)' }}>{plan.price}<span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>/mo</span></p>
              <ul className="space-y-2 mb-5">{plan.features.map(f => <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}><Check size={11} style={{ color: 'var(--pink)' }} />{f}</li>)}</ul>
              <button className={plan.popular ? 'btn-primary w-full text-sm' : 'btn-secondary w-full text-sm'}>{locale === 'es' ? 'Seleccionar' : 'Select plan'}</button>
            </div>
          ))}
        </div>}
        {activeTab === 'security' && <>
          <h3 className="font-display font-bold" style={{ color: 'var(--text)' }}>{t('change_password')}</h3>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t('current_password')}</label><input type="password" className="input" placeholder="••••••••" /></div>
            <div className="space-y-2"><label className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t('new_password')}</label><input type="password" className="input" placeholder="••••••••" /></div>
            <button className="btn-primary flex items-center gap-2"><Lock size={14} />{t('save')}</button>
          </div>
        </>}
      </div>
    </div>
  )
}
