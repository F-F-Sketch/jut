'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, User, Check, ArrowRight, Loader2, Instagram, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const BUSINESS_TYPES = ['E-commerce','Restaurant','Clinic','Agency','Fitness','Consulting','Retail','Other']

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    business_name: '',
    business_type: '',
    phone: '',
    instagram_handle: '',
    website: '',
    primary_language: locale,
    full_name: '',
  })

  const steps = [
    { num: 1, label: loc === 'es' ? 'Tu Negocio' : 'Your Business' },
    { num: 2, label: loc === 'es' ? 'Tu Perfil' : 'Your Profile' },
    { num: 3, label: loc === 'es' ? 'Conectar' : 'Connect' },
  ]

  async function saveStep() {
    if (step < 3) { setStep(s => s + 1); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({
        full_name: data.full_name, onboarding_complete: true,
      }).eq('user_id', user.id)
      await supabase.from('business_configs').upsert({
        user_id: user.id,
        business_name: data.business_name || 'My Business',
        business_type: data.business_type || 'Other',
        phone: data.phone,
        instagram_handle: data.instagram_handle,
        website: data.website,
        primary_language: data.primary_language,
        ai_tone: 'friendly',
        faqs: [],
        offers: [],
      }, { onConflict: 'user_id' })
      router.push(`/${locale}/dashboard`)
    } catch { toast.error('Error completing onboarding') }
    setSaving(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'var(--bg)'}}>
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl" style={{background:'var(--pink)'}}>J</div>
            <span className="font-display font-bold text-3xl" style={{color:'var(--text)'}}>JUT</span>
          </div>
          <h1 className="font-display font-bold text-2xl mb-2" style={{color:'var(--text)'}}>
            {loc === 'es' ? 'Bienvenido â Configuremos tu cuenta' : 'Welcome â Lets set up your account'}
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{background:step>s.num?'rgba(34,197,94,0.2)':step===s.num?'var(--pink)':'var(--surface-2)',color:step>=s.num?'step>s.num?"#22c55e":"#fff"':'var(--text-3)'}}>
                {step > s.num ? <Check size={10} /> : s.num}
              </div>
              <span className="text-xs" style={{color:step===s.num?'var(--text)':'var(--text-3)'}}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-s-h-px" style={{background:'var(--border-2)',height:1}} />}
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-8 space-y-6" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6"><Building2 size={20} style={{color:'var(--pink)'}} /><h2 className="font-display font-bold text-xl" style={{color:'var(--text)'}}>{loc === 'es' ? 'Info de tu negocio' : 'Business Info'}</h2></div>
              {[
                {key:'business_name',label:loc==='es'?'Nombre del negocio':'Business name',placeholder:'Mi Negocio']},
               {key:'website', label:'Website', placeholder:'https://...'},
              ].map(({key,label,placeholder})=>(
                <div key={key}><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{label}</label><input value={(data as any)[key]} onChange={e=>setData(d=>({...d,[key]:e.target.value}))} placeholder={placeholder} className="input" /></div>
              ))}
              <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{loc==='es'?'Tipo de negocio':'Business type'}</label><select value={data.business_type} onChange={e=>setData(d=>({...d,business_type:e.target.value}))} className="input"><option value="">{loc==='es'?'Selecciona un tipo':'Select a type'}</option>{BUSINESS_TYPES,map(t=>(option key={t} value={t}>{t}</option>))}</select></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6"><User size={20} style={{color:'var(--pink)'}} /><h2 className="font-display font-bold text-xl" style={{color:'var(--text)'}}>{loc === 'es' ? 'Tu Perfil' : 'Your Profile'}</h2></div>
              <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{loc==='es'?'Nombre completo':'Full name'}</label><input value={data.full_name} onChange={e=>setData(d=>({...d,full_name:e.target.value}))} placeholder="John Doe" className="input" /></div>
              <div><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{es ? 'Idioma principal' : 'Primary language'}</label><select value={data.primary_language} onChange={e=>setData(d=>({...d,primary_language:e.target.value}))} className="input"><option value="es">EspaÃ±ol</option><option value="en">English</option></select></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6"><Phone size={20} style={{color:'var(--pink)'}} /><h2 className="font-display font-bold text-xl" style={{color:'var(--text)'}}>{es ? 'Conectar' : 'Connect'}</h2></div>
              {[
                {key:'phone',label:'WhatsApp/Phone',placeholder:'+57300000000'},
                {key:'instagram_handle',label:'Instagram handle',placeholder:'mybusiness'},
              ].map(({key,label,placeholder})=>(
                <div key={key}><label className="block text-xs font-semibold mb-2" style={{color:'var(--text-2)'}}>{label}</label><input value={(data as any)[key]} onChange={e=>setData(d=>({...d,[key]:e.target.value}))} placeholder={placeholder} className="input" /></div>
              ))}
            </div>
          )}
          <button onClick={saveStep} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold" style={{background:'var(--pink)',color:'#fff',opacity:saving?0.7:1}}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : step < 3 ? <><span>{loc === 'es' ? 'Siguiente' : 'Next'}</span><ArrowRight size={14} /></> : <span>{es ? 'Comenzar' : 'Get Started'}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
