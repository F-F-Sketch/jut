'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === 'es' ? 'es' : 'en'
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({ business_name: '', instagram_handle: '', phone: '', tone: 'friendly', goals: [] as string[] })

  const BIZ_GOALS = locale === 'es'
    ? ['Capturar leads de comentarios','Automatizar respuestas DM 24/7','Calificar prospectos automáticamente','Enviar catálogos por DM','Agendar citas automáticamente','Aumentar conversiones de ventas']
    : ['Capture leads from comments','Automate DM responses 24/7','Qualify prospects automatically','Send product catalogs via DM','Book appointments automatically','Increase sales conversions']

  async function finish() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }
      await supabase.from('profiles').update({ business_name: data.business_name, onboarded: true }).eq('user_id', user.id)
      try {
        await supabase.from('business_configs').upsert({ user_id: user.id, business_name: data.business_name, instagram_handle: data.instagram_handle, whatsapp_number: data.phone, ai_tone: data.tone, automation_goals: data.goals.join(', '), primary_language: locale }, { onConflict: 'user_id' })
      } catch {}
      router.push(`/${locale}/dashboard`)
    } catch { router.push(`/${locale}/dashboard`) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--pink)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </div>
        <h1 className="font-display font-bold text-2xl mb-1 text-center" style={{ color: 'var(--text)' }}>
          {locale === 'es' ? 'Configuremos JUT' : "Let's set up JUT"}
        </h1>
        <p className="text-sm mb-8 text-center" style={{ color: 'var(--text-3)' }}>
          {locale === 'es' ? '3 pasos rápidos para empezar a automatizar' : '3 quick steps to start automating'}
        </p>
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: i <= step ? 'var(--pink)' : 'var(--surface-2)', color: i <= step ? '#fff' : 'var(--text-3)' }}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: i < step ? 'var(--pink)' : 'var(--border-2)' }} />}
            </div>
          ))}
        </div>
        <div className="space-y-4 mb-8">
          {step === 0 && (<>
            <div><label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{locale === 'es' ? 'Nombre del negocio' : 'Business name'}</label>
              <input value={data.business_name} onChange={e => setData(d => ({ ...d, business_name: e.target.value }))} placeholder={locale === 'es' ? 'Ej: StyleCo Medellín' : 'e.g. StyleCo NYC'} className="input" /></div>
            <div><label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Instagram</label>
              <input value={data.instagram_handle} onChange={e => setData(d => ({ ...d, instagram_handle: e.target.value.replace('@','') }))} placeholder="@mybusiness" className="input" /></div>
            <div><label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>WhatsApp</label>
              <input value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} placeholder="+57 300 000 0000" className="input" /></div>
          </>)}
          {step === 1 && (<>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>{locale === 'es' ? '¿Qué quieres automatizar?' : 'What do you want to automate?'}</p>
            <div className="grid grid-cols-1 gap-2">
              {BIZ_GOALS.map(g => (
                <button key={g} onClick={() => setData(d => ({ ...d, goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] }))}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-all"
                  style={{ background: data.goals.includes(g) ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${data.goals.includes(g) ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}`, color: 'var(--text)' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: data.goals.includes(g) ? 'var(--pink)' : 'var(--surface-3)', border: `1px solid ${data.goals.includes(g) ? 'var(--pink)' : 'var(--border-2)'}` }}>
                    {data.goals.includes(g) && <Check size={10} color="#fff" />}
                  </div>
                  {g}
                </button>
              ))}
            </div>
          </>)}
          {step === 2 && (
            <div className="space-y-3">
              {[{slug:'free',price:'$0',name:'Free',desc:locale==='es'?'100 conversaciones IA/mes':'100 AI conversations/mo'},{slug:'starter',price:locale==='es'?'$199.000/mes':'$49/mo',name:'Starter',desc:locale==='es'?'1.000 conversaciones, 10 automatizaciones':'1,000 conversations, 10 automations'},{slug:'growth',price:locale==='es'?'$399.000/mes':'$97/mo',name:'Growth',desc:locale==='es'?'5.000 conv., automatizaciones ilimitadas':'5,000 conv., unlimited automations',featured:true},{slug:'elite',price:locale==='es'?'$1.190.000/mes':'$297/mo',name:'Elite',desc:locale==='es'?'Todo ilimitado + white-label':'Unlimited everything + white-label'}].map(p => (
                <button key={p.slug} onClick={() => router.push(`/${locale}/dashboard`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all relative"
                  style={{ background: 'var(--surface-2)', border: (p as any).featured ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-2)' }}>
                  {(p as any).featured && <div className="absolute -top-2.5 left-4 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#22c55e', color: '#fff' }}>{locale === 'es' ? 'Más popular' : 'Most popular'}</div>}
                  <div className="flex-1"><p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{p.name} — {p.price}</p><p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.desc}</p></div>
                  <ArrowRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push(`/${locale}/dashboard`)} className="text-sm" style={{ color: 'var(--text-3)' }}>
            {step > 0 ? (locale === 'es' ? '← Atrás' : '← Back') : (locale === 'es' ? 'Saltar' : 'Skip')}
          </button>
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold" style={{ background: 'var(--pink)', color: '#fff' }}>
              {locale === 'es' ? 'Continuar' : 'Continue'} <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={finish} disabled={saving} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold" style={{ background: 'var(--pink)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : (locale === 'es' ? 'Lanzar JUT 🚀' : 'Launch JUT 🚀')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
