'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminUsersPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role', 'user').order('created_at', {ascending:false})
    setUsers(data ?? [])
    setLoading(false)
  }

  async function changePlan(userId: string, newPlan: string) {
    await supabase.from('profiles').update({ plan: newPlan }).eq('user_id', userId)
    toast.success(`Plan updated to ${newPlan}`)
    loadUsers()
  }

  const filtered = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>Members</h1><p className="text-sm" style={{color:'var(--text-3)'}}>{users.length} total</p></div>
      </div>
      <div className="relative"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--text-3)'}} /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members..." className="input pl-10 w-full" /></div>
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
        {loading ? <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'var(--pink)',borderTopColor:'transparent'}} /></div> : filtered.map((u: any) => (
          <div key={u.id} className="flex items-center gap-4 px-6 py-4" style={{borderBottom:'1px solid var(--border)'}}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:'linear-gradient(135deg, var(--pink), var(--blue))'}}>{(u.full_name??'?').slice(0,2).toUpperCase()}</div>
            <div className="flex-1"><p className="text-sm font-semibold" style={{color:'var(--text)'}}>{u.full_name??'\oname'}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{new Date(u.created_at).toLocaleDateString()}</p></div>
            <select value={u.plan??'free'} onChange={e=>changePlan(u.user_id,e.target.value)} className="text-xs px-3 py-1 rounded-full cursor-pointer" style={{background:'var(--surface-2)',color:'var(--text-2)',border:'none'}}>{['free','starter','growth','elite'].map(p => <option key={p} value={p}>{p}</option>)}</select>
            <Link href={`/${locale}/admin/members/${u.id}`} className="flex items-center gap-1 text-xs font-medium" style={{color:'var(--pink)'}}><ExternalLink size={12} /> View</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
