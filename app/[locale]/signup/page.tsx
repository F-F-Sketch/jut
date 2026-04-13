'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success(locale === 'es' ? 'Cuenta creada!' : 'Account created!')
    router.push('/' + locale + '/onboarding')
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
          <p className="text-sm" style={{color:'var(--text-3)'}}>{locale === 'es' ? 'Crea tu cuenta' : 'Create your account'}</p>
        </div>
        <form onSubmit={handleSignup} className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{locale === 'es' ? 'Nombre' : 'Name'}</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{locale === 'es' ? 'Contrasena' : 'Password'}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
            style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {locale === 'es' ? 'Crear cuenta' : 'Create account'}
          </button>
          <p className="text-center text-xs pt-2" style={{color:'var(--text-3)'}}>
            {locale === 'es' ? 'Ya tienes cuenta? ' : 'Already have an account? '}
            <Link href={'/' + locale + '/login'} style={{color:'var(--pink)',fontWeight:600}}>
              {locale === 'es' ? 'Inicia sesion' : 'Sign in'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
