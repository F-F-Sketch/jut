'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Zap, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { toast.error(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/' + locale + '/login'), 2000)
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--pink)'}}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>
            {locale === 'es' ? 'Nueva contrasena' : 'New password'}
          </h1>
        </div>
        {done ? (
          <div className="rounded-2xl p-8 text-center" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'rgba(34,197,94,0.1)'}}>
              <Check size={20} style={{color:'#22c55e'}} />
            </div>
            <p className="text-sm font-semibold" style={{color:'var(--text)'}}>
              {locale === 'es' ? 'Contrasena actualizada!' : 'Password updated!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            {[
              {label:locale==='es'?'Nueva contrasena':'New password',val:password,set:setPassword},
              {label:locale==='es'?'Confirmar contrasena':'Confirm password',val:confirm,set:setConfirm},
            ].map(({label,val,set}) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-3)'}}>{label}</label>
                <input type="password" value={val} onChange={e=>set(e.target.value)} required minLength={6}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inp} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
              style={{background:'var(--pink)',color:'#fff',opacity:loading?0.7:1}}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {locale === 'es' ? 'Actualizar contrasena' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
