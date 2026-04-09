import { createClient, getUser } from '@/lib/supabase/server'
import { Users, DollarSign, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient()

  const [profilesRes, subsRes, txnsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, plan, role, created_at').order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('plan, status, amount_paid'),
    supabase.from('wompi_transactions').select('amount_in_cents, currency').eq('status', 'APPROVED'),
  ])
  const profiles = profilesRes.data ?? []
  const subs = subsRes.data ?? []
  const txns: any[] = txnsRes.data ?? []
  const totalUsers = profiles.filter( p => p.role === 'user').length
  const paidUsers = subs.filter((s : any) => s.status === 'active' && s.plan !== 'free').length
  const mrrCOP = txns.reduce((sum, t) => t.currency === 'COP' ? sum + (t.amount_in_cents / 100) : sum, 0)
  const planCounts = subs.reduce((acc: any, s : any) => { acc[s.plan] = (acc[s.plan] ?? 0) + 1; return acc }, {})
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div><div className="flex items-center gap-2 mb-1"><Shield size={20} style={{color:'var(--pink)'}} /><h1 className="font-display font-bold text-3xl" style={{color:'var(--text)'}}>Owner Dashboard</h1></div><pstyle={{color:'var(--text-3)'}}>Full platform overview</p></div>
        <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}><Users size={14} /> View All Members</Link>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{label:'Total Members',value:totalUsers,icon:'ð¥'},{label:'Paying Members',value:paidUsers,icon:'ð³'},{label:'MRR (COP)',value:`$${mrrCOP.toLocaleString('es-CO')}`,icon:'ð°'},{label:'Free Plan',value:planCounts['free']??0,icon:'ð'}].map(({label,value,icon})=>(
          <div key={label} className="rounded-2xl p-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}><span className="text-2xl block mb-3">{icon}</span><p className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>{value}</p><p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{label}</p></div>
        ))}
      </div>
    </div>
  )
}
