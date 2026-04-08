'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

const T = {
  en: { title: 'Welcome back', sub: 'Sign in to your JUT account', google: 'Continue with Google', or: 'or', email: 'Email address', password: 'Password', forgot: 'Forgot password?', btn: 'Sign in', noAccount: "Don't have an account?", signUp: 'Sign up' },
  es: { title: 'Bienvenido de vuelta', sub: 'Inicia sesión en tu cuenta JUT', google: 'Continuar con Google', or: 'o', email: 'Correo electrónico', password: 'Contraseña', forgot: '¿Olvidaste tu contraseña?', btn: 'Iniciar sesión', noAccount: '¿No tienes cuenta?', signUp: 'Regístrate' },
}

export default function LoginPage({ params }: PageProps) {
  const locale = params.locale === 'es' ? 'es' : 'en'
  const t = T[locale]
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message); setLoading(false); return }
      router.push(`/${locale}/dashboard`)
    } catch { toast.error('An error occurred.'); setLoading(false) }
  }

  const handleGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/${locale}/dashboard` } })
    } catch { toast.error('Google login failed.') }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#050508' }}>
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden" style={{ background: '#0d0d14', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href={`/${locale}`} className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#ED1966' }}>J</div>
          <span style={{ color: '#f0f0f8', fontWeight: 800, fontSize: 24 }}>JUT</span>
        </Link>
        <div className="relative z-10">
          <blockquote style={{ color: '#f0f0f8', fontWeight: 700, fontSize: 22, lineHeight: 1.4, marginBottom: 24 }}>
            &ldquo;JUT turned our Instagram comments into a <span style={{ color: '#ED1966' }}>$40K/month</span> sales machine.&rdquo;
          </blockquote>
          <p style={{ color: '#8888a8', fontSize: 14 }}>María Rodríguez · Founder, StyleCo 🇨🇴</p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['500+', 'Leads/mo'], ['24/7', 'Automated'], ['3x', 'Conversions']].map(([v, l]) => (
            <div key={l}><p style={{ color: '#ED1966', fontWeight: 800, fontSize: 28 }}>{v}</p><p style={{ color: '#8888a8', fontSize: 12 }}>{l}</p></div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="flex justify-end mb-8">
            <div style={{ display: 'flex', gap: 4, background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: 3 }}>
              {(['en', 'es'] as const).map(l => (
                <Link key={l} href={`/${l}/login`} style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textDecoration: 'none', background: l === locale ? '#ED1966' : 'transparent', color: l === locale ? '#fff' : '#8888a8' }}>{l.toUpperCase()}</Link>
              ))}
            </div>
          </div>
          <h1 style={{ color: '#f0f0f8', fontWeight: 800, fontSize: 30, marginBottom: 8 }}>{t.title}</h1>
          <p style={{ color: '#8888a8', fontSize: 14, marginBottom: 32 }}>{t.sub}</p>
          <button onClick={handleGoogle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', color: '#f0f0f8', borderRadius: 12, padding: '12px 0', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t.google}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
            <span style={{ color: '#8888a8', fontSize: 12 }}>{t.or}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#a0a0c0', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ width: '100%', background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', color: '#f0f0f8', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: '#a0a0c0', fontSize: 12, fontWeight: 600 }}>{t.password}</label>
                <Link href={`/${locale}/forgot-password`} style={{ color: '#ED1966', fontSize: 12, textDecoration: 'none' }}>{t.forgot}</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', color: '#f0f0f8', borderRadius: 10, padding: '10px 40px 10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#606080' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#ED1966', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <>{t.btn} <ArrowRight size={15} /></>}
            </button>
          </form>
          <p style={{ color: '#8888a8', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
            {t.noAccount}{' '}
            <Link href={`/${locale}/signup`} style={{ color: '#ED1966', fontWeight: 600, textDecoration: 'none' }}>{t.signUp}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
