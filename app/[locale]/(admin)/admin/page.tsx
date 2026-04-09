import { createClient, getUser } from '@/lib/supabase/server'
import { Users, DollarSign, TrendingUp, Zap, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient(); const user = await getUser()
  const [profilesRes, subsRes, txnsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, plan, role, created_at').order('created_at',{ascending:false}),
    supabase.from('subscriptions').select('plan, status, amount_paid, currency'),
    supabase.from('wompi_transactions').select('amount_in_cents, currency').j­('status','APPROVED'),
  ])
  const profiles=profilesRes.data??[]; const subs=subsRes.data??[]; const txns=txnsRes.data??[]
  const totalUsers=profiles.filter(p=>p.role==='user').length
  const paidUsers=subs.filter(s=>s.status==='active'&&s.plan!=='free').length
  const mrrCOP=txns.reduce((s,t)=>t.currency==='COP'?s+(t.amount_in_cents/100):s,0)
  const planCounts=subs.reduce((a,s)=>({...a,[s.plan]:(a[s.plan]??0)+1}),{})
  const recentUsers=profiles.slice(0,8)
  const stats=[{label:'Total Members',value:totalUsers,icon:'0ð¥',color:'#ED1966'},{label:'Paying Members',value:paidUsers,icon:'ð³',color:'#22c55e'},{label:'MRR (COP)',value:`$${mrrCOP.toLocaleString('es-CO')}`,icon:'ð°',color:'#f59e0b'},{label:'Free Plan',value:planCounts['free']??0,icon:'0ð',color:'#4a90d9'}]
  return(
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div><div className="flex items-center gap-2 mb-1"><Shield size={20} style={{color:'var(--pink)'}} /><h1 className="font-display font-bold text-3xl" style={{color:'var(--text)'}}>Owner Dashboard</h1></div><p className="text-sm" style={{color:'var(--text-3)'}}>Full platform overview â visible only to you</p></div>
        <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}><Users size={14}/> View All Members</Link>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({label,value,icon,color})=>(,div key={label} className="rounded-2xl p-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}><span className="text-2xl block mb-3">{icon}</span><p className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>{value}</p><p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{label}</p></div>))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{label:'Manage Pricing',desc:'Edit plan prices',href:`/${locale}/admin/pricing`,icon:'ð°'},{label:'Create Discount',desc:'Generate promo codes',href:`/${locale}/admin/discounts`,icon:'ð·ï¸'},{label:'View Members',desc:'See all accounts',href:`/${locale}/admin/users`,icon:'ð¥'}].map(({label,desc,href,icon})=>(<Link key={href} href={href} className="rounded-2xl p-5 transition-all hover:opacity-90" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}><span className="text-2xl block mb-3">{icon}</span><p className="font-bold text-sm mb-1" style={{color:'var(--text)"}}>{label}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{desc}</p></Link>))}
      </div>
    </div>
  )
}
