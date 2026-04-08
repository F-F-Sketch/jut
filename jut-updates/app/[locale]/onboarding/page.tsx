'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

const T = {
  en: {
    title: "Let's set up JUT",
    subtitle: "3 quick steps to start automating",
    step1: "Your Business", step2: "Your Goals", step3: "Choose Plan",
    bizName: "Business name", bizType: "Type of business",
    instagram: "Instagram handle", phone: "WhatsApp number",
    tone: "AI conversation tone",
    goals: "What do you want to automate?",
    next: "Continue", back: "Back", finish: "Launch JUT 🚀",
    skip: "Skip for now",
  },
  es: {
    title: "Configuremos JUT",
    subtitle: "3 pasos rápidos para empezar a automatizar",
    step1: "Tu Negocio", step2: "Tus Metas", step3: "Elige Plan",
    bizName: "Nombre del negocio", bizType: "Tipo de negocio",
    instagram: "Usuario de Instagram", phone: "Número de WhatsApp",
    tone: "Tono de conversación IA",
    goals: "¿Qué quieres automatizar?",
    next: "Continuar", back: "Atrás", finish: "Lanzar JUT 🚀",
    skip: "Saltar por ahora",
  },
}

const BIZ_TYPES = {
  en: ['E-commerce', 'Services', 'Coaching / Consulting', 'Restaurant / Food', 'Fashion / Beauty', 'Real Estate', 'Education', 'Other'],
  es: ['E-commerce', 'Servicios', 'Coaching / Consultoría', 'Restaurante / Comida', 'Moda / Belleza', 'Inmobiliaria', 'Educación', 'Otro'],
}

const GOALS = {
  en: ['Capture leads from Instagram comments', 'Automate DM responses 24/7', 'Qualify prospects automatically', 'Send product catalogs via DM', 'Book appointments automatically', 'Increase sales conversions'],
  es: ['Capturar leads de comentarios de Instagram', 'Automatizar respuestas de DMs 24/7', 'Calificar prospectos automáticamente', 'Enviar catálogos por DM', 'Agendar citas automáticamente', 'Aumentar conversiones de ventas'],
}

const TONES = {
  en: [{ value: 'friendly', label: '😊 Friendly & warm' }, { value: 'formal', label: '👔 Professional & formal' }, { value: 'casual', label: '😎 Casual & relatable' }, { value: 'sales', label: '🎯 Direct & sales-focused' }],
  es: [{ value: 'friendly', label: '😊 Amigable y cálido' }, { value: 'formal', label: '👔 Profesional y formal' }, { value: 'casual', label: '😎 Casual y cercano' }, { value: 'sales', label: '🎯 Directo y orientado a ventas' }],
}

export default function OnboardingPage({ params }: PageProps) {
  const locale = params.locale === 'es' ? 'es' : 'en'
  const loc = locale as 'en' | 'es'
  const t = T[loc]
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    business_name: '', business_type: '',
    instagram_handle: '', phone: '', tone: 'friendly',
    goals: [] as string[],
  })

  function toggleGoal(goal: string) {
    setData(d => ({
      ...d,
      goals: d.goals.includes(goal) ? d.goals.filter(g => g !== goal) : [...d.goals, goal],
    }))
  }

  async function finish() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }

      await supabase.from('profiles').update({
        business_name: data.business_name,
        onboarded: true,
      }).eq('user_id', user.id)

      try {
        await supabase.from('business_configs').upsert({
          user_id: user.id,
          business_name: data.business_name,
          business_type: data.business_type,
          instagram_handle: data.instagram_handle,
          whatsapp_number: data.phone,
          ai_tone: data.tone,
          automation_goals: data.goals.join(', '),
          primary_language: locale,
        }, { onConflict: 'user_id' })
      } catch {}

      router.push(`/${locale}/dashboard`)
    } catch {
      toast.error('Something went wrong')
      setSaving(false)
    }
  }

  const steps = [t.step1, t.step2, t.step3]

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--pink)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: i < step ? 'var(--pink)' : i === step ? 'var(--pink)' : 'var(--surface-2)', color: i <= step ? '#fff' : 'var(--text-3)' }}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: i === step ? 'var(--text)' : 'var(--text-3)' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px" style={{ background: i < step ? 'var(--pink)' : 'var(--border-2)' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>{t.title}</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>{t.subtitle}</p>

          {/* Step 0: Business info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{t.bizName}</label>
                <input value={data.business_name} onChange={e => setData(d => ({ ...d, business_name: e.target.value }))}
                  placeholder={loc === 'es' ? 'Ej: StyleCo Medellín' : 'e.g. StyleCo NYC'} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{t.bizType}</label>
                <select value={data.business_type} onChange={e => setData(d => ({ ...d, business_type: e.target.value }))} className="input">
                  <option value="">{loc === 'es' ? 'Selecciona...' : 'Select...'}</option>
                  {BIZ_TYPES[loc].map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{t.instagram}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                  <input value={data.instagram_handle} onChange={e => setData(d => ({ ...d, instagram_handle: e.target.value.replace('@', '') }))}
                    placeholder="mybusiness" className="input pl-8" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{t.phone}</label>
                <input value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                  placeholder="+57 300 000 0000" className="input" />
              </div>
            </div>
          )}

          {/* Step 1: Goals + Tone */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>{t.goals}</label>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS[loc].map(goal => (
                    <button key={goal} onClick={() => toggleGoal(goal)}
                      className="flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-all"
                      style={{ background: data.goals.includes(goal) ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${data.goals.includes(goal) ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}`, color: 'var(--text)' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: data.goals.includes(goal) ? 'var(--pink)' : 'var(--surface-3)', border: `1px solid ${data.goals.includes(goal) ? 'var(--pink)' : 'var(--border-2)'}` }}>
                        {data.goals.includes(goal) && <Check size={10} color="#fff" />}
                      </div>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>{t.tone}</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES[loc].map(({ value, label }) => (
                    <button key={value} onClick={() => setData(d => ({ ...d, tone: value }))}
                      className="p-3 rounded-xl text-sm text-left transition-all"
                      style={{ background: data.tone === value ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${data.tone === value ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}`, color: 'var(--text)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan selection */}
          {step === 2 && (
            <div className="space-y-3">
              {[
                { slug: 'free', name: loc === 'es' ? 'Gratis' : 'Free', price: '$0', desc: loc === 'es' ? '100 conversaciones IA/mes' : '100 AI conversations/mo', color: 'var(--text-3)' },
                { slug: 'starter', name: 'Starter', price: loc === 'es' ? '$199.000/mes' : '$49/mo', desc: loc === 'es' ? '1.000 conversaciones, 10 automatizaciones' : '1,000 conversations, 10 automations', color: '#4a90d9' },
                { slug: 'growth', name: 'Growth', price: loc === 'es' ? '$399.000/mes' : '$97/mo', desc: loc === 'es' ? '5.000 conversaciones, ilimitadas auto.' : '5,000 conversations, unlimited automations', color: '#22c55e', featured: true },
                { slug: 'elite', name: 'Elite', price: loc === 'es' ? '$1.190.000/mes' : '$297/mo', desc: loc === 'es' ? 'Todo ilimitado + white-label' : 'Unlimited everything + white-label', color: 'var(--pink)' },
              ].map(plan => (
                <button key={plan.slug} onClick={() => setData(d => ({ ...d, ...plan }))}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all relative"
                  style={{ background: 'var(--surface-2)', border: plan.featured ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-2)' }}>
                  {plan.featured && (
                    <div className="absolute -top-2.5 left-4 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#22c55e', color: '#fff' }}>
                      {loc === 'es' ? 'Más popular' : 'Most popular'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{plan.name}</span>
                      <span className="text-xs font-bold" style={{ color: plan.color }}>{plan.price}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{plan.desc}</p>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--text-2)' }}>
                <ArrowLeft size={14} /> {t.back}
              </button>
            ) : (
              <button onClick={() => router.push(`/${locale}/dashboard`)} className="text-sm" style={{ color: 'var(--text-3)' }}>
                {t.skip}
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold"
                style={{ background: 'var(--pink)', color: '#fff' }}>
                {t.next} <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold"
                style={{ background: 'var(--pink)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : t.finish}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
