'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bot, Save, Loader2, Plus, Trash2, MessageSquare, Brain, Zap, User,
  Settings, ChevronRight, Send, RefreshCw, Sparkles, Clock, Volume2,
  HelpCircle, ShoppingBag, Shield, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

const TONES = [
  { value: 'friendly', label: '😊 Friendly', desc: 'Warm and approachable' },
  { value: 'formal', label: '👔 Formal', desc: 'Professional and precise' },
  { value: 'casual', label: '😎 Casual', desc: 'Relaxed and conversational' },
  { value: 'sales', label: '🎯 Sales', desc: 'Persuasive and benefit-focused' },
  { value: 'empathetic', label: '❤️ Empathetic', desc: 'Feels first, sells second' },
  { value: 'expert', label: '🧠 Expert', desc: 'Authoritative specialist' },
]

const RESPONSE_LENGTHS = [
  { value: 'short', label: 'Short', desc: '1-2 sentences' },
  { value: 'medium', label: 'Medium', desc: '2-4 sentences' },
  { value: 'long', label: 'Long', desc: 'Full explanations' },
]

const TABS = [
  { key: 'identity', label: 'Identity', icon: User },
  { key: 'personality', label: 'Personality', icon: Brain },
  { key: 'knowledge', label: 'Knowledge', icon: HelpCircle },
  { key: 'offers', label: 'Offers', icon: ShoppingBag },
  { key: 'rules', label: 'Rules', icon: Shield },
  { key: 'test', label: 'Test Bot', icon: MessageSquare },
]

export default function AgentPage({ params }: PageProps) {
  const locale = params.locale === 'es' ? 'es' : 'en'
  const l = locale
  const supabase = createClient()

  const [tab, setTab] = useState('identity')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState({
    agent_name: locale === 'es' ? 'Sofía' : 'Sofia',
    agent_role: locale === 'es' ? 'Agente de Ventas y Soporte' : 'Sales & Support Agent',
    agent_avatar: '🤖',
    business_name: '',
    business_type: '',
    website: '',
    phone: '',
    whatsapp_number: '',
    instagram_handle: '',
    primary_language: locale,
    ai_tone: 'friendly',
    response_length: 'medium',
    human_behavior: {
      use_emojis: true,
      use_informal: true,
      ask_questions: true,
      show_enthusiasm: true,
      vary_greetings: true,
      acknowledge_emotions: true,
    },
    qualification_criteria: '',
    escalation_rules: '',
    custom_instructions: '',
    automation_goals: '',
    faqs: [] as { id: string; question: string; answer: string }[],
    offers: [] as { id: string; name: string; description: string; price: string; currency: string }[],
  })

  const [testMessages, setTestMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([])
  const [testInput, setTestInput] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadConfig() }, [])
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [testMessages])

  async function loadConfig() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_configs').select('*').eq('user_id', user.id).single()
      if (data) {
        setConfig(prev => ({
          ...prev,
          agent_name: data.agent_name ?? prev.agent_name,
          agent_role: data.agent_role ?? prev.agent_role,
          agent_avatar: data.agent_avatar ?? prev.agent_avatar,
          business_name: data.business_name ?? '',
          business_type: data.business_type ?? '',
          website: data.website ?? '',
          phone: data.phone ?? '',
          whatsapp_number: data.whatsapp_number ?? '',
          instagram_handle: data.instagram_handle ?? '',
          primary_language: data.primary_language ?? locale,
          ai_tone: data.ai_tone ?? 'friendly',
          response_length: data.response_length ?? 'medium',
          human_behavior: data.human_behavior ?? prev.human_behavior,
          qualification_criteria: data.qualification_criteria ?? '',
          escalation_rules: data.escalation_rules ?? '',
          custom_instructions: data.custom_instructions ?? '',
          automation_goals: data.automation_goals ?? '',
          faqs: data.faqs ?? [],
          offers: data.offers ?? [],
        }))
      }
    } catch {}
    setLoading(false)
  }

  async function saveConfig() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('business_configs').upsert({
        user_id: user.id,
        ...config,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (error) throw error
      toast.success(l === 'es' ? '✅ Agente guardado' : '✅ Agent saved')
    } catch (e: any) {
      toast.error(e.message ?? 'Error saving')
    }
    setSaving(false)
  }

  function addFaq() {
    setConfig(p => ({ ...p, faqs: [...p.faqs, { id: crypto.randomUUID(), question: '', answer: '' }] }))
  }
  function updateFaq(id: string, field: 'question' | 'answer', value: string) {
    setConfig(p => ({ ...p, faqs: p.faqs.map(f => f.id === id ? { ...f, [field]: value } : f) }))
  }
  function removeFaq(id: string) {
    setConfig(p => ({ ...p, faqs: p.faqs.filter(f => f.id !== id) }))
  }
  function addOffer() {
    setConfig(p => ({ ...p, offers: [...p.offers, { id: crypto.randomUUID(), name: '', description: '', price: '', currency: 'COP' }] }))
  }
  function updateOffer(id: string, field: string, value: string) {
    setConfig(p => ({ ...p, offers: p.offers.map(o => o.id === id ? { ...o, [field]: value } : o) }))
  }
  function removeOffer(id: string) {
    setConfig(p => ({ ...p, offers: p.offers.filter(o => o.id !== id) }))
  }

  async function sendTestMessage() {
    if (!testInput.trim()) return
    const userMsg = testInput.trim()
    setTestInput('')
    setTestMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTestLoading(true)
    try {
      const history = testMessages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }))
      history.push({ role: 'user', content: userMsg })
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, locale }),
      })
      const data = await res.json()
      const botText = data.response ?? (l === 'es' ? 'Lo siento, hubo un error.' : 'Sorry, there was an error.')
      setTestMessages(prev => [...prev, { role: 'bot', text: botText }])
    } catch {
      setTestMessages(prev => [...prev, { role: 'bot', text: l === 'es' ? 'Error de conexión.' : 'Connection error.' }])
    }
    setTestLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} />
    </div>
  )

  const currentTone = TONES.find(t => t.value === config.ai_tone)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
              {config.agent_avatar}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{config.agent_name}</h1>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{config.agent_role}</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {l === 'es' ? 'Personaliza tu agente de IA para que suene 100% humano' : 'Personalize your AI agent to sound 100% human'}
          </p>
        </div>
        <button onClick={saveConfig} disabled={saving}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ background: 'var(--pink)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {l === 'es' ? 'Guardar Agente' : 'Save Agent'}
        </button>
      </div>

      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <p className="text-sm" style={{ color: '#22c55e' }}>
          <strong>{config.agent_name}</strong> · {currentTone?.label} · {config.response_length} responses · {config.primary_language === 'es' ? '🇨🇴 Spanish' : '🇺🇸 English'}
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={{ background: tab === key ? 'var(--surface-2)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)', border: tab === key ? '1px solid var(--border-2)' : '1px solid transparent' }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* IDENTITY */}
      {tab === 'identity' && (
        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? '¿Quién es tu agente?' : "Who is your agent?"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Nombre del agente' : 'Agent name'}</label>
              <input value={config.agent_name} onChange={e => setConfig(p => ({ ...p, agent_name: e.target.value }))} placeholder="Sofia" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Rol del agente' : 'Agent role'}</label>
              <input value={config.agent_role} onChange={e => setConfig(p => ({ ...p, agent_role: e.target.value }))} placeholder="Sales & Support Agent" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Avatar emoji</label>
              <input value={config.agent_avatar} onChange={e => setConfig(p => ({ ...p, agent_avatar: e.target.value }))} placeholder="🤖" className="input" style={{ fontSize: 24, textAlign: 'center', maxWidth: 80 }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Idioma principal' : 'Primary language'}</label>
              <select value={config.primary_language} onChange={e => setConfig(p => ({ ...p, primary_language: e.target.value }))} className="input">
                <option value="es">🇨🇴 Español</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Nombre del negocio' : 'Business name'}</label>
              <input value={config.business_name} onChange={e => setConfig(p => ({ ...p, business_name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Tipo de negocio' : 'Business type'}</label>
              <select value={config.business_type} onChange={e => setConfig(p => ({ ...p, business_type: e.target.value }))} className="input">
                <option value="">Select...</option>
                {['E-commerce','Services','Coaching','Restaurant','Fashion / Beauty','Real Estate','Education'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                <input value={config.instagram_handle} onChange={e => setConfig(p => ({ ...p, instagram_handle: e.target.value }))} placeholder="mybusiness" className="input pl-7" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>WhatsApp</label>
              <input value={config.whatsapp_number} onChange={e => setConfig(p => ({ ...p, whatsapp_number: e.target.value }))} placeholder="+57 300 000 0000" className="input" />
            </div>
          </div>
        </div>
      )}

      {/* PERSONALITY */}
      {tab === 'personality' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? 'Tono de conversación' : 'Conversation tone'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TONES.map(tone => (
                <button key={tone.value} onClick={() => setConfig(p => ({ ...p, ai_tone: tone.value }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{ background: config.ai_tone === tone.value ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${config.ai_tone === tone.value ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}` }}>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{tone.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? 'Longitud de respuestas' : 'Response length'}</h2>
            <div className="flex gap-3">
              {RESPONSE_LENGTHS.map(rl => (
                <button key={rl.value} onClick={() => setConfig(p => ({ ...p, response_length: rl.value }))}
                  className="flex-1 p-3 rounded-xl text-center transition-all"
                  style={{ background: config.response_length === rl.value ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${config.response_length === rl.value ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}` }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{rl.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{rl.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? 'Comportamiento humano' : 'Human behavior settings'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'use_emojis', label: l === 'es' ? 'Usar emojis 😊' : 'Use emojis 😊', desc: l === 'es' ? '1-2 emojis por mensaje' : '1-2 emojis per message' },
                { key: 'use_informal', label: l === 'es' ? 'Lenguaje informal' : 'Informal language', desc: l === 'es' ? 'Contracciones naturales' : 'Natural contractions' },
                { key: 'ask_questions', label: l === 'es' ? 'Hacer preguntas' : 'Ask follow-up questions', desc: l === 'es' ? '1 pregunta por mensaje' : '1 question per message' },
                { key: 'show_enthusiasm', label: l === 'es' ? 'Mostrar entusiasmo' : 'Show enthusiasm', desc: l === 'es' ? 'Positivo y animado' : 'Genuinely upbeat' },
                { key: 'vary_greetings', label: l === 'es' ? 'Variar saludos' : 'Vary greetings', desc: l === 'es' ? 'No repite el mismo saludo' : 'Never repeats the same greeting' },
                { key: 'acknowledge_emotions', label: l === 'es' ? 'Reconocer emociones' : 'Acknowledge emotions', desc: l === 'es' ? 'Entiende la frustración' : 'Understands frustration' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{ background: (config.human_behavior as any)[key] ? 'rgba(237,25,102,0.05)' : 'var(--surface-2)', border: `1px solid ${(config.human_behavior as any)[key] ? 'rgba(237,25,102,0.2)' : 'var(--border-2)'}` }}>
                  <input type="checkbox" checked={(config.human_behavior as any)[key]}
                    onChange={e => setConfig(p => ({ ...p, human_behavior: { ...p.human_behavior, [key]: e.target.checked } }))}
                    className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KNOWLEDGE */}
      {tab === 'knowledge' && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? 'Base de conocimiento' : 'Knowledge base'}</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{l === 'es' ? 'Lo que tu agente sabe responder' : 'What your agent knows how to answer'}</p>
            </div>
            <button onClick={addFaq} className="flex items-center gap-2 text-sm font-bold rounded-xl px-4 py-2" style={{ background: 'var(--pink)', color: '#fff' }}>
              <Plus size={14} />{l === 'es' ? 'Agregar FAQ' : 'Add FAQ'}
            </button>
          </div>
          {config.faqs.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-2)' }}>
              <HelpCircle size={28} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{l === 'es' ? 'Sin FAQs aún' : 'No FAQs yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {config.faqs.map(faq => (
                <div key={faq.id} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>❓ {l === 'es' ? 'Pregunta' : 'Question'}</label>
                      <input value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} placeholder={l === 'es' ? '¿Cuánto cuesta?' : 'How much does it cost?'} className="input text-sm" />
                    </div>
                    <button onClick={() => removeFaq(faq.id)} className="mt-6 p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><Trash2 size={13} /></button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>✅ {l === 'es' ? 'Respuesta' : 'Answer'}</label>
                    <textarea value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} className="input text-sm resize-none" rows={2} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OFFERS */}
      {tab === 'offers' && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l === 'es' ? 'Productos y servicios' : 'Products & services'}</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{l === 'es' ? 'Lo que tu agente puede vender' : 'What your agent can sell'}</p>
            </div>
            <button onClick={addOffer} className="flex items-center gap-2 text-sm font-bold rounded-xl px-4 py-2" style={{ background: 'var(--pink)', color: '#fff' }}>
              <Plus size={14} />{l === 'es' ? 'Agregar oferta' : 'Add offer'}
            </button>
          </div>
          {config.offers.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-2)' }}>
              <ShoppingBag size={28} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{l === 'es' ? 'Sin ofertas aún' : 'No offers yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {config.offers.map(offer => (
                <div key={offer.id} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                  <div className="flex gap-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Nombre' : 'Name'}</label>
                        <input value={offer.name} onChange={e => updateOffer(offer.id, 'name', e.target.value)} placeholder="Starter Package" className="input text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Precio' : 'Price'}</label>
                          <input value={offer.price} onChange={e => updateOffer(offer.id, 'price', e.target.value)} placeholder="299.000" className="input text-sm" />
                        </div>
                        <div style={{ width: 80 }}>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Currency</label>
                          <select value={offer.currency} onChange={e => updateOffer(offer.id, 'currency', e.target.value)} className="input text-sm">
                            <option value="COP">COP</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeOffer(offer.id)} className="mt-6 p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><Trash2 size={13} /></button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>{l === 'es' ? 'Descripción' : 'Description'}</label>
                    <textarea value={offer.description} onChange={e => updateOffer(offer.id, 'description', e.target.value)} className="input text-sm resize-none" rows={2} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RULES */}
      {tab === 'rules' && (
        <div className="space-y-5">
          {[
            { field: 'qualification_criteria', title: l === 'es' ? 'Criterios de calificación' : 'Lead qualification criteria', placeholder: l === 'es' ? 'Ej: Tiene presupuesto mayor a $500.000 COP...' : 'Ex: Has budget over $500...' },
            { field: 'escalation_rules', title: l === 'es' ? 'Reglas de escalación' : 'Human escalation rules', placeholder: l === 'es' ? 'Ej: Si el cliente pide hablar con una persona...' : 'Ex: If the client asks to speak with a person...' },
            { field: 'custom_instructions', title: l === 'es' ? 'Instrucciones especiales' : 'Custom instructions', placeholder: l === 'es' ? 'Ej: Nunca menciones precios de la competencia...' : "Ex: Never mention competitor prices..." },
          ].map(({ field, title, placeholder }) => (
            <div key={field} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{title}</h2>
              <textarea value={(config as any)[field]} onChange={e => setConfig(p => ({ ...p, [field]: e.target.value }))}
                className="input w-full resize-none" rows={4} placeholder={placeholder} />
            </div>
          ))}
        </div>
      )}

      {/* TEST BOT */}
      {tab === 'test' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(237,25,102,0.1)' }}>{config.agent_avatar}</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{config.agent_name}</p>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><p className="text-xs" style={{ color: '#22c55e' }}>Online</p></div>
              </div>
            </div>
            <button onClick={() => setTestMessages([])} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
              <RefreshCw size={12} />{l === 'es' ? 'Reiniciar' : 'Reset'}
            </button>
          </div>
          <div ref={chatRef} className="p-5 space-y-3 overflow-y-auto" style={{ minHeight: 320, maxHeight: 400 }}>
            {testMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>{l === 'es' ? `Prueba cómo responde ${config.agent_name}` : `Test how ${config.agent_name} responds`}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {(l === 'es' ? ['¿Cuánto cuesta?', 'Hola, me interesa', '¿Cómo funciona?'] : ['How much does it cost?', "Hi, I'm interested", 'How does it work?']).map(msg => (
                    <button key={msg} onClick={() => setTestInput(msg)} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>{msg}</button>
                  ))}
                </div>
              </div>
            )}
            {testMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'bot' && <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm" style={{ background: 'rgba(237,25,102,0.1)' }}>{config.agent_avatar}</div>}
                <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
                  style={{ background: msg.role === 'user' ? 'var(--pink)' : 'var(--surface-2)', color: msg.role === 'user' ? '#fff' : 'var(--text)', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {testLoading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(237,25,102,0.1)' }}>{config.agent_avatar}</div>
                <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: 'var(--surface-2)' }}>
                  {[0,150,300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-3)', animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <input value={testInput} onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendTestMessage()}
              placeholder={l === 'es' ? `Escríbele a ${config.agent_name}...` : `Write to ${config.agent_name}...`}
              className="input flex-1 text-sm" />
            <button onClick={sendTestMessage} disabled={testLoading || !testInput.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
              style={{ background: 'var(--pink)', color: '#fff', opacity: testLoading || !testInput.trim() ? 0.5 : 1 }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
