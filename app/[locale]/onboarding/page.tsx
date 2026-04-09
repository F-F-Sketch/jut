'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  en: {
    title: "Let's set up JUT",
    subtitle: '3 quick steps to start automating',
    step1: 'Your Business', step2: 'Your Goals', step3: 'Choose Plan',
    bizName: 'Business name', bizType: 'Type of business',
    instagram: 'Instagram handle', phone: 'WhatsApp number',
    tone: 'AI conversation tone', goals: 'What do you want to automate?',
    next: 'Continue', back: 'Back', finish: 'Launch JUT', skip: 'Skip for now',
  },
  es: {
    title: 'Configuremos JUT',
    subtitle: '3 pasos rapidos para empezar',
    step1: 'Tu Negocio', step2: 'Tus Metas', step3: 'Elige Plan',
    bizName: 'Nombre del negocio', bizType: 'Tipo de negocio',
    instagram: 'Usuario de Instagram', phone: 'Numero de WhatsApp',
    tone: 'Tono de conversacion IA', goals: 'Que quieres automatizar?',
    next: 'Continuar', back: 'Atras', finish: 'Lanzar JUT', skip: 'Saltar por ahora',
  },
}

const BIZ_TYPES = {
  en: ['E-commerce','Services','Coaching / Consulting','Restaurant / Food','Fashion / Beauty','Real Estate','Education','Other'],
  es: ['E-commerce','Servicios','Coaching / Consultoria','Restaurante / Comida','Moda / Belleza','Inmobiliaria','Educacion','Otro'],
}

const GOALS = {
  en: ['Respond to Instagram DMs','Reply to comments automatically','Qualify leads','Send promotions','Schedule appointments','Support 24/7'],
  es: ['Responder DMs de Instagram','Responder comentarios automaticamente','Calificar prospectos','Enviar promociones','Agendar citas','Soporte 24/7'],
}

const TONES = {
  en: [{value:'friendly',label:'Friendly'},{value:'formal',label:'Formal'},{value:'casual',label:'Casual'},{value:'sales',label:'Sales-focused'}],
  es: [{value:'friendly',label:'Amigable'},{value:'formal',label:'Formal'},{value:'casual',label:'Casual'},{value:'sales',label:'Orientado a ventas'}],
}

const PLANS = [
  {id:'free',name:'Free',price:'$0',features:['1 automation','100 conversations/mo','Basic analytics']},
  {id:'starter',name:'Starter',price:'$29',features:['5 automations','1,000 conversations/mo','Advanced analytics']},
  {id:'growth',name:'Growth',price:'$79',features:['20 automations','5,000 conversations/mo','AI agent','Priority support']},
]

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const loc = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'
  const t = T[loc]
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    bizName: '', bizType: BIZ_TYPES[loc][0], instagram: '', phone: '',
    tone: 'friendly', goals: [] as string[], plan: 'free',
  })

  function toggleGoal(g: string) {
    setForm(f => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g] }))
  }

  async function finish() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/' + locale + '/login'); return }
      await supabase.from('profiles').update({ business_name: form.bizName, plan: form.plan, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      await supabase.from('business_configs').upsert({
        user_id: user.id, business_name: form.bizName, business_type: form.bizType,
        instagram_handle: form.instagram || null, whatsapp_number: form.phone || null,
        ai_tone: form.tone, automation_goals: form.goals.join(', '),
        primary_language: loc, country: loc === 'es' ? 'CO' : 'US',
        timezone: 'America/Bogota', faqs: [], offers: [], updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      toast.success(loc === 'es' ? 'Cuenta configurada!' : 'Account set up!')
      router.push('/' + locale + '/dashboard')
    } catch { toast.error('Error saving') }
    finally { setLoading(false) }
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg)'}}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--pink)'}}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>{t.title}</h1>
          <p className="text-sm" style={{color:'var(--text-3)'}}>{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1,2,3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{background:step>=n?'var(--pink)':'var(--surface)',color:step>=n?'#fff':'var(--text-3)',border:'1px solid '+(step>=n?'var(--pink)':'var(--border-2)')}}>
                {n}
              </div>
              {n < 3 && <div className="w-12 h-0.5" style={{background:step>n?'var(--pink)':'var(--border-2)'}} />}
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          {step === 1 && (
            <>
              <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>{t.step1}</h2>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{t.bizName}</label>
                <input value={form.bizName} onChange={e=>setForm(f=>({...f,bizName:e.target.value}))} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{t.bizType}</label>
                <select value={form.bizType} onChange={e=>setForm(f=>({...f,bizType:e.target.value}))} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp}>
                  {BIZ_TYPES[loc].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{t.instagram}</label>
                  <input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@handle" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{t.phone}</label>
                  <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+57..." className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{t.tone}</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES[loc].map(({value,label}) => (
                    <button key={value} onClick={()=>setForm(f=>({...f,tone:value}))}
                      className="py-2 rounded-lg text-sm font-medium transition-all"
                      style={{background:form.tone===value?'var(--pink)':'var(--surface-2)',color:form.tone===value?'#fff':'var(--text-2)',border:'1px solid '+(form.tone===value?'var(--pink)':'var(--border)')}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>{t.step2}</h2>
              <p className="text-sm" style={{color:'var(--text-3)'}}>{t.goals}</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS[loc].map(g => (
                  <button key={g} onClick={()=>toggleGoal(g)}
                    className="py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all"
                    style={{background:form.goals.includes(g)?'rgba(237,25,102,0.1)':'var(--surface-2)',color:form.goals.includes(g)?'var(--pink)':'var(--text-2)',border:'1px solid '+(form.goals.includes(g)?'rgba(237,25,102,0.3)':'var(--border)')}}>
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-display font-bold text-lg" style={{color:'var(--text)'}}>{t.step3}</h2>
              <div className="space-y-3">
                {PLANS.map(plan => (
                  <button key={plan.id} onClick={()=>setForm(f=>({...f,plan:plan.id}))}
                    className="w-full p-4 rounded-xl text-left transition-all"
                    style={{background:form.plan===plan.id?'rgba(237,25,102,0.08)':'var(--surface-2)',border:'2px solid '+(form.plan===plan.id?'var(--pink)':'var(--border)')}}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm" style={{color:'var(--text)'}}>{plan.name}</span>
                      <span className="font-bold text-sm" style={{color:'var(--pink)'}}>{plan.price}/mo</span>
                    </div>
                    {plan.features.map(f=><p key={f} className="text-xs" style={{color:'var(--text-3)'}}>- {f}</p>)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button onClick={()=>step>1?setStep(s=>s-1):router.push('/'+locale+'/dashboard')}
            className="flex items-center gap-1.5 text-sm font-medium" style={{color:'var(--text-3)'}}>
            <ChevronLeft size={15} />{step > 1 ? t.back : t.skip}
          </button>
          {step < 3 ? (
            <button onClick={()=>setStep(s=>s+1)} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>
              {t.next} <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={finish} disabled={loading} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}{t.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
