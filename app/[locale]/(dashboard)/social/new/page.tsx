'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AtSign, Plus, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function NewSocialTriggerPage({ params }: PageProps) {
  const { locale } = params
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [form, setForm] = useState({
    platform: 'instagram',
    content_type: 'any',
    content_id: '',
    keywords: [] as string[],
    reply_comment: true,
    reply_dm: true,
    comment_reply_text: '',
    status: 'active',
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (!kw || form.keywords.includes(kw)) return
    set('keywords', [...form.keywords, kw])
    setKeywordInput('')
  }

  const removeKeyword = (kw: string) => set('keywords', form.keywords.filter(k => k !== kw))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success(locale === 'es' ? 'Trigger creado' : 'Trigger created')
      router.push(`/${locale}/social`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error')
      setSaving(false)
    }
  }

  const PLATFORMS = [
    { v: 'instagram', icon: '📸', label: 'Instagram' },
    { v: 'facebook', icon: '📘', label: 'Facebook' },
  ]

  const CONTENT_TYPES = {
    en: [
      { v: 'any', l: 'Any content' },
      { v: 'reel', l: 'Reels only' },
      { v: 'post', l: 'Posts only' },
      { v: 'carousel', l: 'Carousels only' },
      { v: 'story', l: 'Stories only' },
    ],
    es: [
      { v: 'any', l: 'Cualquier contenido' },
      { v: 'reel', l: 'Solo Reels' },
      { v: 'post', l: 'Solo Posts' },
      { v: 'carousel', l: 'Solo Carruseles' },
      { v: 'story', l: 'Solo Historias' },
    ],
  }

  const loc = locale as 'en' | 'es'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/social`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Nuevo Trigger Social' : 'New Social Trigger'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {locale === 'es' ? 'Configura cuándo y cómo JUT responde automáticamente' : 'Configure when and how JUT responds automatically'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Plataforma' : 'Platform'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map(p => (
              <button
                key={p.v}
                type="button"
                onClick={() => set('platform', p.v)}
                className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                style={form.platform === p.v
                  ? { background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.3)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border-2)' }
                }
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-semibold text-sm" style={{ color: form.platform === p.v ? 'var(--pink)' : 'var(--text)' }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Tipo de Contenido' : 'Content Type'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES[loc].map(ct => (
              <button
                key={ct.v}
                type="button"
                onClick={() => set('content_type', ct.v)}
                className="text-sm px-4 py-2 rounded-xl transition-all"
                style={form.content_type === ct.v
                  ? { background: 'rgba(237,25,102,0.12)', border: '1px solid rgba(237,25,102,0.3)', color: 'var(--pink)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }
                }
              >
                {ct.l}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
              {locale === 'es' ? 'ID de contenido específico (opcional)' : 'Specific content ID (optional)'}
            </label>
            <input
              className="input"
              value={form.content_id}
              onChange={e => set('content_id', e.target.value)}
              placeholder={locale === 'es' ? 'ej. 17854360229135492 — dejar vacío para todo el contenido' : 'e.g. 17854360229135492 — leave empty for all content'}
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="card rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
              {locale === 'es' ? 'Palabras Clave' : 'Keywords'}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {locale === 'es'
                ? 'El trigger se activa cuando el comentario contiene alguna de estas palabras. Dejar vacío para activar con cualquier comentario.'
                : 'The trigger fires when a comment contains any of these words. Leave empty to fire on any comment.'}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
              placeholder={locale === 'es' ? 'precio, info, quiero, me interesa...' : 'price, info, interested, tell me more...'}
            />
            <button type="button" onClick={addKeyword} className="btn-secondary px-4">
              <Plus size={15} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {form.keywords.length === 0 ? (
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                {locale === 'es' ? 'Sin palabras clave — se dispara con cualquier comentario' : 'No keywords — fires on any comment'}
              </span>
            ) : form.keywords.map(kw => (
              <span
                key={kw}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', border: '1px solid rgba(237,25,102,0.2)' }}
              >
                {kw}
                <button type="button" onClick={() => removeKeyword(kw)} className="hover:opacity-70 ml-0.5">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Response Options */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Opciones de Respuesta' : 'Response Options'}
          </h2>

          <div className="space-y-3">
            {[
              { key: 'reply_dm', label: locale === 'es' ? 'Enviar DM automático' : 'Send automatic DM', desc: locale === 'es' ? 'JUT enviará un DM a quien comentó' : 'JUT will DM the person who commented' },
              { key: 'reply_comment', label: locale === 'es' ? 'Responder al comentario' : 'Reply to comment', desc: locale === 'es' ? 'JUT responderá públicamente al comentario' : 'JUT will publicly reply to the comment' },
            ].map(opt => (
              <label
                key={opt.key}
                className="flex items-start gap-3 cursor-pointer rounded-xl p-4"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form[opt.key as keyof typeof form] as boolean}
                    onChange={e => set(opt.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: form[opt.key as keyof typeof form] ? 'var(--pink)' : 'var(--surface-3)',
                      border: form[opt.key as keyof typeof form] ? '1px solid var(--pink)' : '1px solid var(--border-2)',
                    }}
                  >
                    {form[opt.key as keyof typeof form] && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {form.reply_comment && (
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
                {locale === 'es' ? 'Texto de respuesta al comentario (público)' : 'Comment reply text (public)'}
              </label>
              <textarea
                className="input resize-none w-full"
                rows={3}
                value={form.comment_reply_text}
                onChange={e => set('comment_reply_text', e.target.value)}
                placeholder={locale === 'es'
                  ? 'ej. ¡Hola! Te envié toda la info por DM 📩'
                  : 'e.g. Hey! I just sent you all the info via DM 📩'}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link href={`/${locale}/social`} className="btn-secondary">
            {locale === 'es' ? 'Cancelar' : 'Cancel'}
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {locale === 'es' ? 'Crear Trigger' : 'Create Trigger'}
          </button>
        </div>
      </form>
    </div>
  )
}
