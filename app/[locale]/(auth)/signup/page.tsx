'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

const PERKS = {
  en: ['Comment-to-DM automation', 'AI lead qualification', 'Full CRM & conversations', 'Sales & POS module'],
  es: ['Automatización comentario-DM', 'Calificación de leads con IA', 'CRM y conversaciones completo', 'Módulo de ventas y POS'],
}

export default function SignupPage({ params }: PageProps) {
  const { locale } = params
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error(locale === 'es' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, business_name: businessName } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({ user_id: data.user.id, full_name: fullName, business_name: businessName, plan: 'free', locale, currency: locale === 'es' ? 'COP' : 'USD' })
      router.push(`/${locale}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
        <div style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(237,25,102,0.12), transparent)', position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <Link href={`/${locale}`} className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--pink)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </Link>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Todo lo que necesitas para crecer' : 'Everything you need to grow'}</h2>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Empieza gratis. Sin tarjeta de crédito.' : 'Start for free. No credit card required.'}</p>
          </div>
          <ul className="space-y-3">
            {PERKS[locale as 'en' | 'es'].map(perk => (
              <li key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(237,25,102,0.15)', border: '1px solid rgba(237,25,102,0.3)' }}><Check size={11} style={{ color: 'var(--pink)' }} /></div>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{perk}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl p-4" style={{ background: 'rgba(33,82,164,0.1)', border: '1px solid rgba(33,82,164,0.2)' }}>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? '🇨🇴 Disponible en Colombia y EE.UU.' : '🇨🇴 Available in Colombia & the US'}</p>
          </div>
        </div>
        <p className="text-xs relative z-10" style={{ color: 'var(--text-3)' }}>© 2025 JUT. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              {['en', 'es'].map(l => (
                <Link key={l} href={`/${l}/signup`} className="text-xs font-bold px-2.5 py-1 rounded-md transition-all" style={l === locale ? { background: 'var(--pink)', color: 'white' } : { color: 'var(--text-3)' }}>{l.toUpperCase()}</Link>
              ))}
            </div>
          </div>

          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>{t('signup_title')}</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>{t('signup_subtitle')}</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>{t('full_name')}</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="María García" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>{t('business_name')}</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="Mi Negocio" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>{t('password')}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><span>{t('signup_button')}</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-3)' }}>
            {t('terms_agree')}{' '}
            <Link href={`/${locale}/terms`} style={{ color: 'var(--pink)' }}>{t('terms')}</Link>{' '}
            {t('and')}{' '}
            <Link href={`/${locale}/privacy`} style={{ color: 'var(--pink)' }}>{t('privacy')}</Link>
          </p>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-3)' }}>
            {t('have_account')}{' '}
            <Link href={`/${locale}/login`} className="font-semibold" style={{ color: 'var(--pink)' }}>{t('sign_in_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
