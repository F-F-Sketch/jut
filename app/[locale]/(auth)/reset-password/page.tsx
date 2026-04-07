'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Loader2, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function ResetPasswordPage({ params }: PageProps) {
  const { locale } = params
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if this is a valid recovery session
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
      }
    })
    // Also check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidSession(true)
      else setValidSession(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error(locale === 'es' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error(locale === 'es' ? 'Las contraseñas no coinciden' : "Passwords don't match")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success(locale === 'es' ? 'Contraseña actualizada' : 'Password updated!')
      router.push(`/${locale}/dashboard`)
    }
  }

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  const strengthLabels = {
    en: ['', 'Weak', 'Fair', 'Good', 'Strong'],
    es: ['', 'Débil', 'Regular', 'Buena', 'Fuerte'],
  }

  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} />
      </div>
    )
  }

  if (validSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Enlace inválido o expirado' : 'Invalid or expired link'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
            {locale === 'es' ? 'Este enlace ya no es válido. Solicita uno nuevo.' : 'This link is no longer valid. Please request a new one.'}
          </p>
          <Link href={`/${locale}/forgot-password`} className="btn-primary">
            {locale === 'es' ? 'Solicitar nuevo enlace' : 'Request new link'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--pink)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
            <Lock size={24} style={{ color: 'var(--pink)' }} />
          </div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Nueva contraseña' : 'New password'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
            {locale === 'es' ? 'Crea una contraseña segura para tu cuenta.' : 'Create a strong password for your account.'}
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
              {locale === 'es' ? 'Nueva contraseña' : 'New password'}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pr-10"
                autoFocus
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: strength >= level ? strengthColors[strength] : 'var(--surface-3)' }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[locale as 'en' | 'es'][strength]}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
              {locale === 'es' ? 'Confirmar contraseña' : 'Confirm password'}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="input pr-10"
              />
              {confirm.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirm === password
                    ? <Check size={15} style={{ color: '#22c55e' }} />
                    : <AlertTriangle size={15} style={{ color: '#ef4444' }} />}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirm}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {locale === 'es' ? 'Actualizar contraseña' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
