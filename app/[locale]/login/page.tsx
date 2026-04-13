'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push('/' + locale + '/dashboard')
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--pink)'}}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{color:'var(--text)'}}>JUT</h1>
          <p className="text-sm" style={{color:'var(--text-3)'}}>{locale === 'es' ? 'Inicia sesion en tu cuenta' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleLogin} className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'Contrasena' : 'Password'}
            </label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
            style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {locale === 'es' ? 'Iniciar sesion' : 'Sign in'}
          </button>
          <div className="text-center space-y-2 pt-2">
            <Link href={'/' + locale + '/forgot-password'} className="block text-xs" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'Olvide mi contrasena' : 'Forgot password?'}
            </Link>
            <p className="text-xs" style={{color:'var(--text-3)'}}>
              {locale === 'es' ? 'No tienes cuenta? ' : "Don't have an account? "}
              <Link href={'/' + locale + '/signup'} style={{color:'var(--pink)',fontWeight:600}}>
                {locale === 'es' ? 'Registrate' : 'Sign up'}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
