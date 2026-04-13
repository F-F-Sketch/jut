'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Zap, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/' + locale + '/reset-password'
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true); setLoading(false)
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--pink)'}}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Recuperar contrasena' : 'Reset password'}
          </h1>
        </div>
        {sent ? (
          <div className="rounded-2xl p-8 text-center" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'rgba(34,197,94,0.1)'}}>
              <Check size={20} style={{color:'#22c55e'}} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{color:'var(--text)'}}>
              {locale === 'es' ? 'Revisa tu email' : 'Check your email'}
            </p>
            <p className="text-xs" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'Te enviamos un enlace para restablecer tu contrasena.' : 'We sent you a link to reset your password.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
              style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {locale === 'es' ? 'Enviar enlace' : 'Send reset link'}
            </button>
            <Link href={'/' + locale + '/login'} className="block text-center text-xs" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'Volver al inicio' : 'Back to login'}
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
