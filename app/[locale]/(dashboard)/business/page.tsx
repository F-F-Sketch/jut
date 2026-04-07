'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Building2, Globe, Phone, Mail, Instagram, Facebook, MessageSquare, Brain, HelpCircle, Tag, Target, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BusinessConfig, FAQ, Offer, AITone } from '@/types'
import { generateId } from '@/lib/utils'

interface PageProps { params: { locale: string } }

export default function BusinessPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations('business')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [config, setConfig] = useState<Partial<BusinessConfig>>({
    business_name: '', business_type: '', website: '', phone: '', email: '', country: locale === 'es' ? 'CO' : 'US', timezone: locale === 'es' ? 'America/Bogota' : 'America/New_York',
    instagram_handle: '', facebook_url: '', whatsapp_number: '', ai_tone: 'friendly', primary_language: locale as 'en' | 'es',
    qualification_criteria: '', escalation_rules: '', automation_goals: '', faqs: [], offers: [],
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_configs').select('*').eq('user_id', user.id).single()
      if (data) setConfig(data)
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('business_configs').upsert({ ...config, user_id: user.id, updated_at: new Date().toISOString() })
    toast.success(t('saved'))
    setSaving(false)
  }

  const addFaq = () => setConfig(c => ({ ...c, faqs: [...(c.faqs ?? []), { id: generateId(), question: '', answer: '' }] }))
  const removeFaq = (id: string) => setConfig(c => ({ ...c, faqs: c.faqs?.filter(f => f.id !== id) }))
  const updateFaq = (id: string, field: 'question' | 'answer', value: string) =>
    setConfig(c => ({ ...c, faqs: c.faqs?.map(f => f.id === id ? { ...f, [field]: value } : f) }))

  const addOffer = () => setConfig(c => ({ ...c, offers: [...(c.offers ?? []), { id: generateId(), name: '', description: '', price: 0, currency: locale === 'es' ? 'COP' : 'USD' }] }))
  const removeOffer = (id: string) => setConfig(c => ({ ...c, offers: c.offers?.filter(o => o.id !== id) }))

  const TABS = [
    { key: 'basic', label: t('basic_info'), icon: Building2 },
    { key: 'social', label: t('social_links'), icon: Instagram },
    { key: 'ai', label: t('ai_config'), icon: Brain },
    { key: 'faqs', label: t('faqs'), icon: HelpCircle },
    { key: 'offers', label: t('offers'), icon: Tag },
    { key: 'goals', label: t('goals'), icon: Target },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} /></div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{t('save_changes')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all rounded-t-lg" style={activeTab === tab.key ? { color: 'var(--pink)', borderBottom: '2px solid var(--pink)' } : { color: 'var(--text-3)' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl p-6 space-y-5">
        {activeTab === 'basic' && <>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('business_name')}><input className="input" value={config.business_name ?? ''} onChange={e => setConfig(c => ({ ...c, business_name: e.target.value }))} /></Field>
            <Field label={t('business_type')}><input className="input" value={config.business_type ?? ''} placeholder={locale === 'es' ? 'ej. Tienda de ropa' : 'e.g. Clothing store'} onChange={e => setConfig(c => ({ ...c, business_type: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('email')}><input className="input" type="email" value={config.email ?? ''} onChange={e => setConfig(c => ({ ...c, email: e.target.value }))} /></Field>
            <Field label={t('phone')}><input className="input" value={config.phone ?? ''} onChange={e => setConfig(c => ({ ...c, phone: e.target.value }))} /></Field>
          </div>
          <Field label={t('website')}><input className="input" value={config.website ?? ''} placeholder="https://" onChange={e => setConfig(c => ({ ...c, website: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('country')}><select className="input" value={config.country ?? ''} onChange={e => setConfig(c => ({ ...c, country: e.target.value }))}><option value="CO">🇨🇴 Colombia</option><option value="US">🇺🇸 United States</option></select></Field>
            <Field label={t('language_primary')}><select className="input" value={config.primary_language ?? 'en'} onChange={e => setConfig(c => ({ ...c, primary_language: e.target.value as 'en' | 'es' }))}><option value="en">English</option><option value="es">Español</option></select></Field>
          </div>
        </>}

        {activeTab === 'social' && <>
          <Field label={t('instagram')} icon="📸"><input className="input" value={config.instagram_handle ?? ''} placeholder="@tu_cuenta" onChange={e => setConfig(c => ({ ...c, instagram_handle: e.target.value }))} /></Field>
          <Field label={t('facebook')} icon="📘"><input className="input" value={config.facebook_url ?? ''} placeholder="facebook.com/tu_pagina" onChange={e => setConfig(c => ({ ...c, facebook_url: e.target.value }))} /></Field>
          <Field label={t('whatsapp')} icon="💬"><input className="input" value={config.whatsapp_number ?? ''} placeholder="+57 300 000 0000" onChange={e => setConfig(c => ({ ...c, whatsapp_number: e.target.value }))} /></Field>
        </>}

        {activeTab === 'ai' && <>
          <Field label={t('tone')}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['formal', 'friendly', 'casual', 'sales'] as AITone[]).map(tone => (
                <button key={tone} onClick={() => setConfig(c => ({ ...c, ai_tone: tone }))} className="rounded-xl p-3 text-sm font-medium transition-all capitalize text-center" style={config.ai_tone === tone ? { background: 'rgba(237,25,102,0.12)', border: '1px solid rgba(237,25,102,0.3)', color: 'var(--pink)' } : { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                  {tone === 'formal' ? t('tone_formal') : tone === 'friendly' ? t('tone_friendly') : tone === 'casual' ? t('tone_casual') : t('tone_sales')}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('qual_criteria')}><textarea className="input min-h-[100px] resize-none" value={config.qualification_criteria ?? ''} placeholder={locale === 'es' ? 'ej. Presupuesto mínimo $500, decisor de compra, necesidad inmediata' : 'e.g. Min budget $500, decision maker, immediate need'} onChange={e => setConfig(c => ({ ...c, qualification_criteria: e.target.value }))} /></Field>
          <Field label={t('escalation')}><textarea className="input min-h-[80px] resize-none" value={config.escalation_rules ?? ''} placeholder={locale === 'es' ? 'ej. Escalar si el cliente pregunta por algo que no está en las FAQs' : 'e.g. Escalate if customer asks something not in FAQs'} onChange={e => setConfig(c => ({ ...c, escalation_rules: e.target.value }))} /></Field>
        </>}

        {activeTab === 'faqs' && <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Define las preguntas frecuentes para que la IA pueda responderlas.' : 'Define FAQs so your AI can answer them accurately.'}</p>
            <button onClick={addFaq} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"><Plus size={12} />{t('add_faq')}</button>
          </div>
          {(config.faqs ?? []).length === 0 ? <div className="text-center py-10" style={{ color: 'var(--text-3)' }}><HelpCircle size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm">{locale === 'es' ? 'Aún no hay FAQs.' : 'No FAQs yet.'}</p></div> :
            (config.faqs ?? []).map((faq, i) => (
              <div key={faq.id} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-3)' }}>FAQ {i + 1}</span>
                  <button onClick={() => removeFaq(faq.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={13} /></button>
                </div>
                <input className="input text-sm" placeholder={t('faq_question')} value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} />
                <textarea className="input text-sm resize-none" placeholder={t('faq_answer')} rows={2} value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} />
              </div>
            ))
          }
        </>}

        {activeTab === 'offers' && <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Define tus ofertas para que la IA pueda presentarlas.' : 'Define your offers so the AI can present them.'}</p>
            <button onClick={addOffer} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"><Plus size={12} />{t('add_offer')}</button>
          </div>
          {(config.offers ?? []).length === 0 ? <div className="text-center py-10" style={{ color: 'var(--text-3)' }}><Tag size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm">{locale === 'es' ? 'Aún no hay ofertas.' : 'No offers yet.'}</p></div> :
            (config.offers ?? []).map((offer, i) => (
              <div key={offer.id} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between"><span className="text-xs font-bold" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Oferta' : 'Offer'} {i + 1}</span><button onClick={() => removeOffer(offer.id)} className="text-red-400"><Trash2 size={13} /></button></div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input text-sm" placeholder={t('offer_name')} value={offer.name} onChange={e => setConfig(c => ({ ...c, offers: c.offers?.map(o => o.id === offer.id ? { ...o, name: e.target.value } : o) }))} />
                  <div className="flex gap-2">
                    <input className="input text-sm" type="number" placeholder="0" value={offer.price} onChange={e => setConfig(c => ({ ...c, offers: c.offers?.map(o => o.id === offer.id ? { ...o, price: Number(e.target.value) } : o) }))} />
                    <select className="input text-sm w-24" value={offer.currency} onChange={e => setConfig(c => ({ ...c, offers: c.offers?.map(o => o.id === offer.id ? { ...o, currency: e.target.value as 'USD' | 'COP' } : o) }))}><option>USD</option><option>COP</option></select>
                  </div>
                </div>
                <textarea className="input text-sm resize-none" placeholder={t('offer_desc')} rows={2} value={offer.description} onChange={e => setConfig(c => ({ ...c, offers: c.offers?.map(o => o.id === offer.id ? { ...o, description: e.target.value } : o) }))} />
              </div>
            ))
          }
        </>}

        {activeTab === 'goals' && <>
          <Field label={t('goals')}><textarea className="input min-h-[120px] resize-none" value={config.automation_goals ?? ''} placeholder={locale === 'es' ? 'ej. Capturar mínimo 50 leads por semana, cerrar 10 ventas mensuales, calificar leads con presupuesto +$500' : 'e.g. Capture 50 leads/week, close 10 monthly sales, qualify leads with budget +$500'} onChange={e => setConfig(c => ({ ...c, automation_goals: e.target.value }))} /></Field>
        </>}
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{icon && <span className="mr-1">{icon}</span>}{label}</label>
      {children}
    </div>
  )
}
