'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, ArrowRight, Loader2, Building2, Brain, Zap, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateId } from '@/lib/utils'

interface PageProps { params: { locale: string } }

type Step = 'business' | 'ai' | 'automation' | 'done'

export default function OnboardingPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('business')
  const [saving, setSaving] = useState(false)

  const [business, setBusiness] = useState({
    business_name: '', business_type: '', phone: '', country: loc === 'es' ? 'CO' : 'US',
    instagram_handle: '', whatsapp_number: '', primary_language: loc,
  })
  const [ai, setAi] = useState({ ai_tone: 'friendly', automation_goals: '', qualification_criteria: '' })
  const [createSampleAuto, setCreateSampleAuto] = useState(true)

  const steps = [
    { id: 'business', icon: Building2, label: loc === 'es' ? 'Tu negocio' : 'Your business' },
    { id: 'ai', icon: Brain, label: loc === 'es' ? 'Configurar IA' : 'Configure AI' },
    { id: 'automation', icon: Zap, label: loc === 'es' ? 'Primera automatización' : 'First automation' },
  ]

  const currentStepIdx = steps.findIndex(s => s.id === step)

  const handleNext = async () => {
    if (step === 'business') { setStep('ai'); return }
    if (step === 'ai') { setStep('automation'); return }

    if (step === 'automation') {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save business config
      await supabase.from('business_configs').upsert({
        user_id: user.id,
        ...business,
        ...ai,
        faqs: [],
        offers: [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      // Create sample automation if opted in
      if (createSampleAuto) {
        await supabase.from('automations').insert({
          user_id: user.id,
          name: loc === 'es' ? 'Respuesta automática a comentarios' : 'Auto-reply to comments',
          description: loc === 'es'
            ? 'Responde automáticamente cuando alguien comenta en tus posts'
            : 'Automatically respond when someone comments on your posts',
          status: 'active',
          trigger: {
            type: 'instagram_comment',
            platform: 'instagram',
            content_type: 'any',
            keywords: loc === 'es'
              ? ['precio', 'info', 'quiero', 'interesa', 'costo']
              : ['price', 'info', 'interested', 'how much', 'details'],
          },
          actions: [
            { id: generateId(), type: 'create_lead', order: 1, config: {} },
            {
              id: generateId(),
              type: 'send_dm',
              order: 2,
              config: {
                message: loc === 'es'
                  ? '¡Hola! 👋 Vi que comentaste en nuestro post. ¿Quieres que te envíe toda la información?'
                  : "Hey! 👋 I saw you commented on our post. Want me to send you all the details?",
              },
            },
            { id: generateId(), type: 'add_tag', order: 3, config: { tag: 'instagram-comment' } },
          ],
          conditions: [],
        })
      }

      // Mark as onboarded
      await supabase.from('profiles').update({ onboarded: true }).eq('user_id', user.id)

      toast.success(loc === 'es' ? '¡Configuración completada! 🎉' : 'Setup complete! 🎉')
      setStep('done')
      setSaving(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-md animate-fade-up">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: 'rgba(237,25,102,0.1)', border: '2px solid rgba(237,25,102,0.3)' }}>
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="font-display font-bold text-4xl mb-4" style={{ color: 'var(--text)' }}>
            {loc === 'es' ? '¡JUT está listo!' : 'JUT is ready!'}
          </h1>
          <p className="text-lg mb-10" style={{ color: 'var(--text-3)', fontWeight: 300, lineHeight: 1.7 }}>
            {loc === 'es'
              ? 'Tu plataforma de automatización está configurada y lista para capturar leads automáticamente.'
              : 'Your automation platform is configured and ready to capture leads automatically.'}
          </p>
          <div className="space-y-3 mb-10">
            {[
              loc === 'es' ? '✅ Configuración de negocio guardada' : '✅ Business configuration saved',
              loc === 'es' ? '✅ IA configurada con tu tono y objetivos' : '✅ AI configured with your tone and goals',
              createSampleAuto ? (loc === 'es' ? '✅ Primera automatización creada y activa' : '✅ First automation created and active') : null,
              loc === 'es' ? '📱 Conecta Instagram para activar triggers' : '📱 Connect Instagram to activate triggers',
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="text-sm text-left rounded-xl px-4 py-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-2)' }}>{item}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push(`/${locale}/dashboard`)} className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto">
            {loc === 'es' ? 'Ir al Dashboard' : 'Go to Dashboard'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm" style={{ background: 'var(--pink)' }}>J</div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>JUT</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          {loc === 'es' ? 'Configuración inicial' : 'Initial setup'} · {currentStepIdx + 1}/{steps.length}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="flex-1 flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={i <= currentStepIdx
              ? { color: 'var(--pink)', borderBottom: '2px solid var(--pink)' }
              : { color: 'var(--text-3)' }
            }
          >
            {i < currentStepIdx
              ? <Check size={14} style={{ color: '#22c55e' }} />
              : <s.icon size={14} />}
            <span className="hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">

        {/* Step: Business */}
        {step === 'business' && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
                {loc === 'es' ? 'Cuéntanos sobre tu negocio' : 'Tell us about your business'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
                {loc === 'es' ? 'Esta información potencia las respuestas de IA de JUT.' : 'This information powers JUT\'s AI responses.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label={`${loc === 'es' ? 'Nombre del negocio' : 'Business name'} *`}>
                  <input className="input" value={business.business_name} onChange={e => setBusiness(b => ({ ...b, business_name: e.target.value }))} placeholder={loc === 'es' ? 'Mi Empresa SAS' : 'My Business LLC'} />
                </Field>
                <Field label={`${loc === 'es' ? 'Tipo de negocio' : 'Business type'} *`}>
                  <input className="input" value={business.business_type} onChange={e => setBusiness(b => ({ ...b, business_type: e.target.value }))} placeholder={loc === 'es' ? 'ej. Ropa, Servicios, Cursos...' : 'e.g. Clothing, Services, Courses...'} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={loc === 'es' ? 'Instagram' : 'Instagram'}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                    <input className="input pl-8" value={business.instagram_handle.replace('@', '')} onChange={e => setBusiness(b => ({ ...b, instagram_handle: `@${e.target.value.replace('@', '')}` }))} placeholder="tu_cuenta" />
                  </div>
                </Field>
                <Field label="WhatsApp">
                  <input className="input" value={business.whatsapp_number} onChange={e => setBusiness(b => ({ ...b, whatsapp_number: e.target.value }))} placeholder="+57 300 000 0000" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={loc === 'es' ? 'País' : 'Country'}>
                  <select className="input" value={business.country} onChange={e => setBusiness(b => ({ ...b, country: e.target.value }))}>
                    <option value="CO">🇨🇴 Colombia</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="MX">🇲🇽 México</option>
                    <option value="OTHER">{loc === 'es' ? 'Otro' : 'Other'}</option>
                  </select>
                </Field>
                <Field label={loc === 'es' ? 'Idioma principal' : 'Primary language'}>
                  <select className="input" value={business.primary_language} onChange={e => setBusiness(b => ({ ...b, primary_language: e.target.value as 'en' | 'es' }))}>
                    <option value="es">🇨🇴 Español</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* Step: AI Config */}
        {step === 'ai' && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
                {loc === 'es' ? 'Configura tu IA' : 'Configure your AI'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
                {loc === 'es' ? 'Define cómo suena tu IA y qué objetivos tiene.' : 'Define how your AI sounds and what goals it has.'}
              </p>
            </div>
            <div className="space-y-6">
              <Field label={loc === 'es' ? 'Tono de comunicación' : 'Communication tone'}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'formal', icon: '🎩', en: 'Formal & Professional', es: 'Formal y profesional' },
                    { v: 'friendly', icon: '😊', en: 'Friendly & Warm', es: 'Amigable y cálido' },
                    { v: 'casual', icon: '✌️', en: 'Casual & Relaxed', es: 'Casual y relajado' },
                    { v: 'sales', icon: '🎯', en: 'Sales-focused', es: 'Orientado a ventas' },
                  ].map(t => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setAi(a => ({ ...a, ai_tone: t.v }))}
                      className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                      style={ai.ai_tone === t.v
                        ? { background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.3)' }
                        : { background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span className="font-medium text-sm" style={{ color: ai.ai_tone === t.v ? 'var(--pink)' : 'var(--text)' }}>
                        {loc === 'es' ? t.es : t.en}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={loc === 'es' ? 'Objetivos de automatización' : 'Automation goals'}>
                <textarea
                  className="input resize-none w-full"
                  rows={3}
                  value={ai.automation_goals}
                  onChange={e => setAi(a => ({ ...a, automation_goals: e.target.value }))}
                  placeholder={loc === 'es'
                    ? 'ej. Capturar 50 leads por semana, cerrar 10 ventas mensuales, calificar leads con presupuesto mayor a $500.000 COP'
                    : 'e.g. Capture 50 leads/week, close 10 monthly sales, qualify leads with budget over $500'}
                />
              </Field>
              <Field label={loc === 'es' ? 'Criterios de calificación' : 'Qualification criteria'}>
                <textarea
                  className="input resize-none w-full"
                  rows={3}
                  value={ai.qualification_criteria}
                  onChange={e => setAi(a => ({ ...a, qualification_criteria: e.target.value }))}
                  placeholder={loc === 'es'
                    ? 'ej. Presupuesto mínimo $200.000 COP, es el decisor de compra, necesidad inmediata'
                    : 'e.g. Minimum budget $500, is the decision maker, immediate need'}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step: Automation */}
        {step === 'automation' && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
                {loc === 'es' ? 'Tu primera automatización' : 'Your first automation'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
                {loc === 'es' ? 'JUT puede crear una automatización de ejemplo para que empieces rápido.' : 'JUT can create a sample automation to get you started fast.'}
              </p>
            </div>

            {/* Sample automation preview */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
                  <Zap size={18} style={{ color: 'var(--pink)' }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
                    {loc === 'es' ? 'Respuesta automática a comentarios' : 'Auto-reply to comments'}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {loc === 'es' ? 'Instagram · Palabras clave activadas' : 'Instagram · Keyword triggered'}
                  </p>
                </div>
                <div className="ml-auto px-2 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {loc === 'es' ? 'Activa' : 'Active'}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { step: '01', icon: '💬', en: 'Someone comments "price", "info", or "interested"', es: 'Alguien comenta "precio", "info" o "quiero"' },
                  { step: '02', icon: '👤', en: 'JUT creates a lead automatically', es: 'JUT crea un lead automáticamente' },
                  { step: '03', icon: '📩', en: 'AI sends a personalized DM instantly', es: 'La IA envía un DM personalizado al instante' },
                  { step: '04', icon: '🏷️', en: 'Lead is tagged for follow-up', es: 'El lead queda etiquetado para seguimiento' },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-4">
                    <span className="text-xs font-display font-bold w-6 text-center" style={{ color: 'var(--text-3)' }}>{s.step}</span>
                    <span className="text-base w-6 text-center">{s.icon}</span>
                    <p className="text-sm" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? s.es : s.en}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opt-in toggle */}
            <label className="flex items-center gap-4 cursor-pointer rounded-2xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              <div
                className="w-12 h-6 rounded-full transition-all flex items-center relative"
                style={{ background: createSampleAuto ? 'var(--pink)' : 'var(--surface-3)', flexShrink: 0 }}
                onClick={() => setCreateSampleAuto(!createSampleAuto)}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute transition-all"
                  style={{ left: createSampleAuto ? 'calc(100% - 22px)' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  {loc === 'es' ? 'Crear esta automatización ahora' : 'Create this automation now'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {loc === 'es' ? 'Puedes editarla o desactivarla en cualquier momento' : 'You can edit or deactivate it at any time'}
                </p>
              </div>
            </label>

            {/* Instagram connect prompt */}
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(33,82,164,0.08)', border: '1px solid rgba(33,82,164,0.2)' }}>
              <Instagram size={20} style={{ color: '#4a90d9', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>
                  {loc === 'es' ? 'Conecta tu Instagram después' : 'Connect your Instagram after'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)', lineHeight: 1.6 }}>
                  {loc === 'es'
                    ? 'Las automatizaciones necesitan tu cuenta de Instagram conectada para funcionar. Puedes hacerlo en Ajustes → Integraciones.'
                    : 'Automations need your Instagram account connected to work. You can do this in Settings → Integrations.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => {
              if (step === 'ai') setStep('business')
              if (step === 'automation') setStep('ai')
            }}
            className="btn-secondary"
            style={{ visibility: step === 'business' ? 'hidden' : 'visible' }}
          >
            {loc === 'es' ? 'Atrás' : 'Back'}
          </button>
          <button onClick={handleNext} disabled={saving || (step === 'business' && !business.business_name)} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {step === 'automation'
              ? (loc === 'es' ? '¡Empezar ahora! 🚀' : 'Get started! 🚀')
              : (loc === 'es' ? 'Siguiente' : 'Next')}
            {!saving && step !== 'automation' && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
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
