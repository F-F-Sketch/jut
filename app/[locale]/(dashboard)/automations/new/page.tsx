'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Zap, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { generateId } from '@/lib/utils'
import type { AutomationTrigger, AutomationAction } from '@/types'

interface PageProps { params: { locale: string } }

const TRIGGER_TYPES = {
  en: [
    { value: 'instagram_comment', label: '💬 Instagram Comment', desc: 'Fire when someone comments on your post' },
    { value: 'instagram_dm', label: '📩 Instagram DM', desc: 'Fire when someone sends you a DM' },
    { value: 'keyword_match', label: '🔑 Keyword Match', desc: 'Fire when a keyword is detected in a message' },
    { value: 'new_follower', label: '👤 New Follower', desc: 'Fire when someone follows your account' },
    { value: 'manual', label: '▶️ Manual', desc: 'Trigger manually from the dashboard' },
  ],
  es: [
    { value: 'instagram_comment', label: '💬 Comentario de Instagram', desc: 'Dispara cuando alguien comenta en tu post' },
    { value: 'instagram_dm', label: '📩 DM de Instagram', desc: 'Dispara cuando alguien te envía un DM' },
    { value: 'keyword_match', label: '🔑 Palabra Clave', desc: 'Dispara cuando se detecta una palabra clave' },
    { value: 'new_follower', label: '👤 Nuevo Seguidor', desc: 'Dispara cuando alguien te sigue' },
    { value: 'manual', label: '▶️ Manual', desc: 'Dispara manualmente desde el dashboard' },
  ],
}

const ACTION_TYPES = {
  en: [
    { value: 'send_dm', label: '📩 Send DM', desc: 'Send a direct message' },
    { value: 'send_comment_reply', label: '💬 Reply to Comment', desc: 'Reply to a comment publicly' },
    { value: 'create_lead', label: '👤 Create Lead', desc: 'Add the person to your CRM' },
    { value: 'add_tag', label: '🏷️ Add Tag', desc: 'Tag the lead with a label' },
    { value: 'ai_response', label: '🤖 AI Response', desc: 'Generate a smart AI reply' },
    { value: 'wait', label: '⏰ Wait', desc: 'Pause before the next action' },
  ],
  es: [
    { value: 'send_dm', label: '📩 Enviar DM', desc: 'Enviar un mensaje directo' },
    { value: 'send_comment_reply', label: '💬 Responder Comentario', desc: 'Responder un comentario públicamente' },
    { value: 'create_lead', label: '👤 Crear Lead', desc: 'Agregar la persona a tu CRM' },
    { value: 'add_tag', label: '🏷️ Agregar Etiqueta', desc: 'Etiquetar el lead' },
    { value: 'ai_response', label: '🤖 Respuesta IA', desc: 'Generar una respuesta inteligente con IA' },
    { value: 'wait', label: '⏰ Esperar', desc: 'Pausar antes de la siguiente acción' },
  ],
}

export default function NewAutomationPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const t = useTranslations('automations')
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState<Partial<AutomationTrigger>>({ type: 'instagram_comment', platform: 'instagram', keywords: [] })
  const [actions, setActions] = useState<AutomationAction[]>([])
  const [saving, setSaving] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  const addKeyword = () => {
    if (!keywordInput.trim()) return
    setTrigger(t => ({ ...t, keywords: [...(t.keywords ?? []), keywordInput.trim()] }))
    setKeywordInput('')
  }

  const removeKeyword = (kw: string) => setTrigger(t => ({ ...t, keywords: t.keywords?.filter(k => k !== kw) }))

  const addAction = (type: string) => {
    const newAction: AutomationAction = {
      id: generateId(),
      type: type as AutomationAction['type'],
      order: actions.length + 1,
      config: type === 'send_dm' ? { message: '' } : type === 'wait' ? { seconds: 60 } : type === 'add_tag' ? { tag: '' } : {},
    }
    setActions(prev => [...prev, newAction])
  }

  const removeAction = (id: string) => setActions(prev => prev.filter(a => a.id !== id).map((a, i) => ({ ...a, order: i + 1 })))

  const updateActionConfig = (id: string, key: string, value: unknown) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, config: { ...a.config, [key]: value } } : a))
  }

  const save = async () => {
    if (!name.trim()) { toast.error(locale === 'es' ? 'El nombre es requerido' : 'Name is required'); return }
    if (!trigger.type) { toast.error(locale === 'es' ? 'El trigger es requerido' : 'Trigger is required'); return }
    setSaving(true)

    const res = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, status: 'draft', trigger, actions, conditions: [] }),
    })

    if (res.ok) {
      toast.success(locale === 'es' ? 'Automatización creada' : 'Automation created')
      router.push(`/${locale}/automations`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error')
    }
    setSaving(false)
  }

  const triggerTypes = TRIGGER_TYPES[loc]
  const actionTypes = ACTION_TYPES[loc]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/automations`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Nueva Automatización' : 'New Automation'}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Configura un trigger y define las acciones que JUT ejecutará' : 'Configure a trigger and define the actions JUT will execute'}</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {locale === 'es' ? 'Guardar' : 'Save'}
        </button>
      </div>

      {/* Name & Description */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Información básica' : 'Basic Information'}</h2>
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{locale === 'es' ? 'Nombre *' : 'Name *'}</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={locale === 'es' ? 'ej. Respuesta automática a comentarios en Reels' : 'e.g. Auto-reply to Reel comments'} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{locale === 'es' ? 'Descripción' : 'Description'}</label>
          <textarea className="input resize-none" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder={locale === 'es' ? 'Describe qué hace esta automatización...' : 'Describe what this automation does...'} />
        </div>
      </div>

      {/* Trigger */}
      <div className="card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
            <Zap size={16} style={{ color: 'var(--pink)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Trigger' : 'Trigger'}</h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? '¿Qué dispara esta automatización?' : 'What fires this automation?'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {triggerTypes.map(tt => (
            <button key={tt.value} onClick={() => setTrigger(t => ({ ...t, type: tt.value as AutomationTrigger['type'] }))} className="text-left rounded-xl p-4 transition-all" style={trigger.type === tt.value ? { background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.3)' } : { background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: trigger.type === tt.value ? 'var(--pink)' : 'var(--text)' }}>{tt.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{tt.desc}</p>
            </button>
          ))}
        </div>

        {/* Keywords config for comment/dm triggers */}
        {(trigger.type === 'instagram_comment' || trigger.type === 'keyword_match') && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
              {locale === 'es' ? 'Palabras clave (el trigger se activa si el mensaje las contiene)' : 'Keywords (trigger fires if message contains these)'}
            </label>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} placeholder={locale === 'es' ? 'ej. precio, info, quiero...' : 'e.g. price, info, interested...'} />
              <button onClick={addKeyword} className="btn-secondary text-sm px-4">+ {locale === 'es' ? 'Agregar' : 'Add'}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(trigger.keywords ?? []).map(kw => (
                <span key={kw} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', border: '1px solid rgba(237,25,102,0.2)' }}>
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="ml-1 hover:opacity-70">×</button>
                </span>
              ))}
              {(trigger.keywords ?? []).length === 0 && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Sin palabras clave — se dispara con cualquier comentario' : 'No keywords — fires on any comment'}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Acciones' : 'Actions'}</h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? '¿Qué hace JUT cuando se dispara el trigger?' : 'What does JUT do when the trigger fires?'}</p>
          </div>
          <div className="relative group">
            <button className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-2"><Plus size={13} />{locale === 'es' ? 'Agregar Acción' : 'Add Action'}<ChevronDown size={12} /></button>
            <div className="absolute right-0 top-full mt-1 w-56 rounded-xl py-1.5 z-20 hidden group-hover:block" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              {actionTypes.map(at => (
                <button key={at.value} onClick={() => addAction(at.value)} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-2)]" style={{ color: 'var(--text-2)' }}>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{at.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{at.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-2)' }}>
            <Plus size={24} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Agrega tu primera acción' : 'Add your first action'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, i) => (
              <div key={action.id} className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--pink)', color: '#fff' }}>{i + 1}</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{actionTypes.find(a => a.value === action.type)?.label ?? action.type}</span>
                  </div>
                  <button onClick={() => removeAction(action.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>

                {action.type === 'send_dm' && (
                  <textarea className="input text-sm resize-none w-full" rows={3} placeholder={locale === 'es' ? 'Escribe el mensaje... usa {{lead.name}} para personalizar' : 'Write your message... use {{lead.name}} to personalize'} value={(action.config.message as string) ?? ''} onChange={e => updateActionConfig(action.id, 'message', e.target.value)} />
                )}
                {action.type === 'send_comment_reply' && (
                  <textarea className="input text-sm resize-none w-full" rows={2} placeholder={locale === 'es' ? 'Respuesta pública al comentario...' : 'Public reply to the comment...'} value={(action.config.reply as string) ?? ''} onChange={e => updateActionConfig(action.id, 'reply', e.target.value)} />
                )}
                {action.type === 'add_tag' && (
                  <input className="input text-sm" placeholder={locale === 'es' ? 'nombre-de-etiqueta' : 'tag-name'} value={(action.config.tag as string) ?? ''} onChange={e => updateActionConfig(action.id, 'tag', e.target.value)} />
                )}
                {action.type === 'wait' && (
                  <div className="flex items-center gap-3">
                    <input type="number" className="input text-sm w-28" min={5} value={(action.config.seconds as number) ?? 60} onChange={e => updateActionConfig(action.id, 'seconds', Number(e.target.value))} />
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'segundos' : 'seconds'}</span>
                  </div>
                )}
                {action.type === 'ai_response' && (
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'La IA generará una respuesta usando tu configuración de negocio.' : 'AI will generate a response using your business configuration.'}</p>
                )}
                {action.type === 'create_lead' && (
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Se creará un lead automáticamente con la información del usuario.' : 'A lead will be created automatically with the user\'s information.'}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
