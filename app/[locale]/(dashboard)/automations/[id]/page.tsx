'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Play, Pause } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Automation } from '@/types'
import { timeAgo } from '@/lib/utils'

interface PageProps { params: { locale: string; id: string } }

const TRIGGER_ICONS: Record<string, string> = {
  instagram_comment: '💬', instagram_dm: '📩', keyword_match: '🔑',
  new_follower: '👤', schedule: '⏰', webhook: '🔗', manual: '▶️',
}

const ACTION_LABELS: Record<string, { en: string; es: string }> = {
  send_dm:            { en: 'Send DM',           es: 'Enviar DM' },
  send_comment_reply: { en: 'Reply to Comment',  es: 'Responder Comentario' },
  create_lead:        { en: 'Create Lead',        es: 'Crear Lead' },
  add_tag:            { en: 'Add Tag',            es: 'Agregar Etiqueta' },
  ai_response:        { en: 'AI Response',        es: 'Respuesta IA' },
  wait:               { en: 'Wait',               es: 'Esperar' },
  update_lead_status: { en: 'Update Lead Status', es: 'Actualizar Estado Lead' },
  webhook:            { en: 'Webhook',            es: 'Webhook' },
}

export default function AutomationEditPage({ params }: PageProps) {
  const { locale, id } = params
  const loc = locale as 'en' | 'es'
  const router = useRouter()
  const supabase = createClient()

  const [auto, setAuto] = useState<Automation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft' | 'paused'>('draft')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('automations').select('*').eq('id', id).single()
      if (data) {
        setAuto(data as Automation)
        setName(data.name)
        setDescription(data.description ?? '')
        setStatus(data.status)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('automations').update({
      name, description, status, updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) toast.error(error.message)
    else toast.success(locale === 'es' ? 'Guardado' : 'Saved')
    setSaving(false)
  }

  const toggleStatus = async () => {
    const newStatus = status === 'active' ? 'paused' : 'active'
    setStatus(newStatus)
    await supabase.from('automations').update({ status: newStatus }).eq('id', id)
    toast.success(newStatus === 'active'
      ? (locale === 'es' ? 'Automatización activada' : 'Automation activated')
      : (locale === 'es' ? 'Automatización pausada' : 'Automation paused'))
  }

  const deleteAutomation = async () => {
    if (!confirm(locale === 'es' ? '¿Eliminar esta automatización?' : 'Delete this automation?')) return
    await supabase.from('automations').delete().eq('id', id)
    toast.success(locale === 'es' ? 'Eliminada' : 'Deleted')
    router.push(`/${locale}/automations`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} />
    </div>
  )

  if (!auto) return (
    <div className="p-8 text-center" style={{ color: 'var(--text-3)' }}>
      {locale === 'es' ? 'Automatización no encontrada' : 'Automation not found'}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/automations`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Editar Automatización' : 'Edit Automation'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {locale === 'es' ? 'Última ejecución:' : 'Last run:'}{' '}
            {auto.last_run_at ? timeAgo(auto.last_run_at, loc) : (locale === 'es' ? 'Nunca' : 'Never')} · {auto.run_count} {locale === 'es' ? 'ejecuciones' : 'runs'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleStatus}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
            style={status === 'active'
              ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }
              : { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
          >
            {status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            {status === 'active' ? (locale === 'es' ? 'Pausar' : 'Pause') : (locale === 'es' ? 'Activar' : 'Activate')}
          </button>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {locale === 'es' ? 'Guardar' : 'Save'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: locale === 'es' ? 'Estado' : 'Status', value: status },
          { label: locale === 'es' ? 'Ejecuciones' : 'Total Runs', value: String(auto.run_count) },
          { label: locale === 'es' ? 'Acciones' : 'Actions', value: String(auto.actions.length) },
        ].map(s => (
          <div key={s.label} className="card rounded-2xl p-4 text-center">
            <p className="font-display font-bold text-xl capitalize" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Basic info */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
          {locale === 'es' ? 'Información' : 'Information'}
        </h2>
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
            {locale === 'es' ? 'Nombre' : 'Name'}
          </label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
            {locale === 'es' ? 'Descripción' : 'Description'}
          </label>
          <textarea className="input resize-none w-full" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>

      {/* Trigger */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Trigger</h2>
        <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
          <span className="text-3xl">{TRIGGER_ICONS[auto.trigger.type] ?? '⚡'}</span>
          <div>
            <p className="font-semibold text-sm capitalize" style={{ color: 'var(--text)' }}>
              {auto.trigger.type.replace(/_/g, ' ')}
            </p>
            {auto.trigger.keywords && auto.trigger.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {auto.trigger.keywords.map((kw: string) => (
                  <span key={kw} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', border: '1px solid rgba(237,25,102,0.2)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
          {locale === 'es' ? 'Acciones' : 'Actions'} ({auto.actions.length})
        </h2>
        {auto.actions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {locale === 'es' ? 'Sin acciones configuradas' : 'No actions configured'}
          </p>
        ) : (
          <div className="space-y-3">
            {[...auto.actions].sort((a, b) => a.order - b.order).map((action, i) => (
              <div key={action.id} className="flex items-center gap-4 rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--pink)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {ACTION_LABELS[action.type]?.[loc] ?? action.type}
                  </p>
                  {action.config.message && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {String(action.config.message).slice(0, 80)}
                    </p>
                  )}
                  {action.delay_seconds && action.delay_seconds > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      ⏰ {locale === 'es' ? 'Espera' : 'Wait'} {action.delay_seconds}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h2 className="font-display font-bold text-base mb-2" style={{ color: '#ef4444' }}>
          {locale === 'es' ? 'Zona de peligro' : 'Danger Zone'}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>
          {locale === 'es' ? 'Esta acción no se puede deshacer.' : 'This action cannot be undone.'}
        </p>
        <button
          onClick={deleteAutomation}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
        >
          <Trash2 size={14} />
          {locale === 'es' ? 'Eliminar automatización' : 'Delete automation'}
        </button>
      </div>

    </div>
  )
}