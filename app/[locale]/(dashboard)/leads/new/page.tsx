'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function NewLeadPage({ params }: PageProps) {
  const { locale } = params
  const t = useTranslations('leads')
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', instagram_handle: '',
    source: 'manual', status: 'new', stage: 'awareness',
    tags: '', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error(locale === 'es' ? 'El nombre es requerido' : 'Name is required'); return }
    setSaving(true)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    })
    if (res.ok) {
      const { data } = await res.json()
      toast.success(locale === 'es' ? 'Lead creado' : 'Lead created')
      router.push(`/${locale}/leads/${data.id}`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error')
      setSaving(false)
    }
  }

  const SOURCES = [
    { value: 'manual', label: locale === 'es' ? 'Manual' : 'Manual' },
    { value: 'instagram_comment', label: 'Instagram Comment' },
    { value: 'instagram_dm', label: 'Instagram DM' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'form', label: locale === 'es' ? 'Formulario' : 'Form' },
    { value: 'other', label: locale === 'es' ? 'Otro' : 'Other' },
  ]

  const STAGES = [
    { value: 'awareness', label: locale === 'es' ? 'Conocimiento' : 'Awareness' },
    { value: 'interest', label: locale === 'es' ? 'Interés' : 'Interest' },
    { value: 'consideration', label: locale === 'es' ? 'Consideración' : 'Consideration' },
    { value: 'intent', label: locale === 'es' ? 'Intención' : 'Intent' },
    { value: 'purchase', label: locale === 'es' ? 'Compra' : 'Purchase' },
    { value: 'retention', label: locale === 'es' ? 'Retención' : 'Retention' },
  ]

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/leads`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{t('new_lead')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Agrega un lead manualmente a tu CRM' : 'Manually add a lead to your CRM'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Información de contacto' : 'Contact Information'}
          </h2>
          <Field label={`${t('name')} *`}>
            <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder={locale === 'es' ? 'Nombre completo' : 'Full name'} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('email')}>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@ejemplo.com" />
            </Field>
            <Field label={t('phone')}>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+57 300 000 0000" />
            </Field>
          </div>
          <Field label="Instagram">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
              <input className="input pl-8" value={form.instagram_handle} onChange={e => set('instagram_handle', e.target.value)} placeholder="username" />
            </div>
          </Field>
        </div>

        {/* Classification */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Clasificación' : 'Classification'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('source')}>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label={t('stage')}>
              <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label={`${t('tags')} (${locale === 'es' ? 'separadas por coma' : 'comma separated'})`}>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder={locale === 'es' ? 'caliente, interesado, vip' : 'hot, interested, vip'} />
          </Field>
        </div>

        {/* Notes */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{t('notes')}</h2>
          <textarea
            className="input resize-none w-full"
            rows={4}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={t('add_note')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link href={`/${locale}/leads`} className="btn-secondary">{t('cancel')}</Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {t('new_lead')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{label}</label>
      {children}
    </div>
  )
}
