'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PLAN_COLORS: Record<string,string> = {
  free:'rgba(96,96,128,0.15)',starter:'rgba(74,144,217,0.15)',growth:'rgba(34,197,94,0.15)',elite:'rgba(237,25,102,0.15)',
}
const PLAN_TEXT: Record<string,string> = {
  free:'var(--text-3)',starter:'#4a90d9',growth:'#22c55e',elite:'var(--pink)',
}

export default function AdminUsersPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role','user').order('created_at',{ascending:false})
    setUsers(data ?? []); setLoading(false)
  }

  async function changePlan(userId: string, newPlan: string) {
    await supabase.from('profiles').update({plan:newPlan}).eq('user_id',userId)
    toast.success('Plan updated to ' + newPlan)
    loadUsers()
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name??'').toLowerCase().includes(search.toLowerCase()) || (u.business_name??'').toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || (u.plan??'free') === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>Members</h1>
          <p className="text-sm" style={{color:'var(--text-3)'}}>{users.length} total accounts</p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--text-3)'}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..." className="w-full rounded-xl px-4 py-2.5 pl-10 text-sm outline-none" style={{background:'var(--surface)',border:'1px solid var(--border-2)',color:'var(--text)'}} />
        </div>
        <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)} className="rounded-xl px-4 py-2.5 text-sm outline-none" style={{background:'var(--surface)',border:'1px solid var(--border-2)',color:'var(--text)',minWidth:140}}>
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="elite">Elite</option>
        </select>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'var(--pink)',borderTopColor:'transparent'}} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Users size={32} style={{color:'var(--text-3)'}} />
            <p className="text-sm" style={{color:'var(--text-3)'}}>No members found</p>
          </div>
        ) : (
          <div>
            {filtered.map((u: any) => {
              const plan = u.plan ?? 'free'
              return (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 transition-all hover:bg-[var(--surface-2)]" style={{borderBottom:'1px solid var(--border)'}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background:'linear-gradient(135deg,var(--pink),var(--blue))'}}>
                    {(u.full_name ?? '?').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{u.full_name ?? 'No name'}</p>
                    <p className="text-xs" style={{color:'var(--text-3)'}}>{u.business_name ?? u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <select value={plan} onChange={e=>changePlan(u.user_id,e.target.value)}
                    className="text-xs font-semibold capitalize px-3 py-1 rounded-full cursor-pointer"
                    style={{background:PLAN_COLORS[plan]??'var(--surface-2)',color:PLAN_TEXT[plan]??'var(--text-2)',border:'none',outline:'none'}}>
                    {['free','starter','growth','elite'].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <Link href={'/' + locale + '/admin/members/' + u.id} className="flex items-center gap-1 text-xs font-medium" style={{color:'var(--pink)'}}>
                    <ExternalLink size={12} /> View
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
