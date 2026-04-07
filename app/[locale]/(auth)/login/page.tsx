'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function LoginPage({ params }: PageProps) {
  const { locale } = params
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push(`/${locale}/dashboard`)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${locale}/dashboard` },
    })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
        <div style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(237,25,102,0.15), transparent)', position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(33,82,164,0.15), transparent)', position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <Link href={`/${locale}`} className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--pink)', boxShadow: '0 0 20px rgba(237,25,102,0.4)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </Link>
        <div className="relative z-10">
          <blockquote className="font-display font-bold text-2xl leading-snug mb-6" style={{ color: 'var(--text)' }}>
            "JUT turned our Instagram comments into a{' '}
            <span style={{ color: 'var(--pink)' }}>$40K/month</span>{' '}
            sales machine — automatically."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>MR</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>María Rodríguez</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Founder, StyleCo · Bogotá 🇨🇴</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['500+', locale === 'es' ? 'Leads/mes' : 'Leads/month'], ['24/7', locale === 'es' ? 'Automatizado' : 'Automated'], ['3x', locale === 'es' ? 'Conversiones' : 'Conversions']].map(([v, l]) => (
            <div key={l}>
              <p className="font-display font-bold text-2xl" style={{ color: 'var(--pink)' }}>{v}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              {['en', 'es'].map(l => (
                <Link key={l} href={`/${l}/login`} className="text-xs font-bold px-2.5 py-1 rounded-md transition-all" style={l === locale ? { background: 'var(--pink)', color: 'white' } : { color: 'var(--text-3)' }}>{l.toUpperCase()}</Link>
              ))}
            </div>
          </div>

          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>{t('login_title')}</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>{t('login_subtitle')}</p>

          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-xl py-3 mb-6 text-sm font-medium transition-all hover:opacity-90" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('google_login')}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-2)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{t('or')}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-2)' }} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{t('password')}</label>
                <button type="button" className="text-xs transition-colors" style={{ color: 'var(--pink)' }}>{t('forgot_password')}</button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><span>{t('login_button')}</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-3)' }}>
            {t('no_account')}{' '}
            <Link href={`/${locale}/signup`} className="font-semibold transition-colors" style={{ color: 'var(--pink)' }}>{t('sign_up_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
