'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function ForgotPasswordPage({ params }: PageProps) {
  const { locale } = params
  const t = useTranslations('auth')
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(33,82,164,0.12), transparent)' }} />

      <div className="w-full max-w-[400px] animate-fade-up relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--pink)', boxShadow: '0 0 20px rgba(237,25,102,0.4)' }}>J</div>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>JUT</span>
        </div>

        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
                <Mail size={24} style={{ color: 'var(--pink)' }} />
              </div>
              <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
                {locale === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
                {locale === 'es'
                  ? 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.'
                  : "Enter your email and we'll send you a link to reset your password."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Mail size={15} />}
                {locale === 'es' ? 'Enviar enlace de restablecimiento' : 'Send reset link'}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: 'var(--text-3)' }}>
              <Link href={`/${locale}/login`} className="flex items-center justify-center gap-1.5 transition-colors" style={{ color: 'var(--text-2)' }}>
                <ArrowLeft size={13} />
                {locale === 'es' ? 'Volver a iniciar sesión' : 'Back to sign in'}
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <h1 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text)' }}>
              {locale === 'es' ? '¡Revisa tu correo!' : 'Check your email!'}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-3)', fontWeight: 300, lineHeight: 1.7 }}>
              {locale === 'es'
                ? `Enviamos un enlace de restablecimiento a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
                : `We sent a reset link to ${email}. Check your inbox and spam folder.`}
            </p>
            <Link
              href={`/${locale}/login`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              {locale === 'es' ? 'Volver a iniciar sesión' : 'Back to sign in'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
