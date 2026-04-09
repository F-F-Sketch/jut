import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Users, MessageSquare, Zap, DollarSign, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PageProps { params: { locale: string } }

async function getDashboardData(userId: string) {
  try {
    const supabase = await createClient()
    const [leadsRes, convoRes, ordersRes, autoRes] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', userId).order('created_at', {ascending:false}).limit(5),
      supabase.from('conversations').select('*').eq('user_id', userId).order('last_message_at',{ascending:false}).limit(5),
      supabase.from('orders').select('total').eq('user_id',userId).eq('payment_status','paid'),
      supabase.from('automations').select('run_count').eq('user_id',userId),
    ])
    const revenue = ordersRes.data?.reduce((sum,o)=>sum+(o.total??0),0)??0
    const automationsFired = autoRes.data?.reduce((sum,a)=>sum+(a.run_count??0),0)??0
    return { recentLeads:leadsRes.data??[], recentConvos:convoRes.data?>[], totalLeads:leadsRes.data?.length??0, revenue, automationsFired, dbReady:!leadsRes.error }
  } catch { return { recentLeads:[], recentConvos:[], totalLeads:0, revenue:0, automationsFired:0, dbReady:false } }
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  let user = null
  try { user = await getUser() } catch {}
  let profile = null
  try { if (user) profile = await getUserProfile(user.id) } catch {}
  const { recentLeads, recentConvos, totalLeads, revenue, automationsFired, dbReady } = user ? await getDashboardData(user.id) : { recentLeads:[], recentConvos:[], totalLeads:0, revenue:0, automationsFired:0, dbReady:false }
  const userName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? (loc === 'es' ? 'Buenos dÃ­as' : 'Good morning') : hour < 18 ? (loc === 'es' ? 'Buenas tardes' : 'Good afternoon') : (loc === 'es' ? 'Buenas noches' : 'Good evening')
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text)'}}>{greeting}, {userName} ð à¹q</h1>
        <p className="text-sm" style={{color:'var(--text-3)'}}>{loc === 'es' ? 'AquÃ­ tienes el resumen de tu negocio.' : "Here's your business overview."}</p>
      </div>
      {!dbReady && (<div className="rounded-2xl p-5 flex items-start gap-4" style={{background:'rgba(237,25,102,0.08)',border:'1px solid rgba(237,25,102,0.25)'}}><AlertCircle size={20} style={{color:'var(--pink)',flexShrink:0}} /><div><p className="font-semibold text-sm mb-1" style={{color:'var(--text)'}}>{loc === 'es' ? 'Base de datos no configurada' : 'Database not set up yet'}</p><p className="text-sm" style={{color:'var(--text-3)'}}>{en or run schema.sql in Supabase}</p></div></div>)}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{label:loc==='es'?'Total Leads':'Total Leads',value:totalLeads,icon:'ð¥',color:'var(--pink)'},{label:loc==='es'?'Conversaciones':'Conversations',value:recentConvos.length,icon:'ð¬',color:'var(--blue-light)'},{label:loc==='es'?'Automatizaciones':'Automations Fired',value:automationsFired,icon:'â¡',color:'#22c55e'},{label:loc==='es'?'Ingresos':'Revenue',value:`$${revenue.toLocaleString()}`,icon:'ð°',color:'#f59e0b'}].map(({label,value,icon,color})=>(<div key={label} className="rounded-2xl p-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}><span className="text-2xl block mb-3">{icon}</span><p className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>{value}</p><p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{label}</p></div>))}
      </div>
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{background:'linear-gradient(135deg, rgba(237,25,102,0.08), rgba(33,82,164,0.08))',border:'1px solid rgba(237,25,102,0.15)'}}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs font-bold tracking-wider uppercase" style={{color:'var(--pink)'}}>{es ? 'Sistema activo' : 'System Active'}</span></div><h3 className="font-display font-bold text-lg mb-1" style={{color:'var(--text)'}}>{loc === 'es' ? 'JUT estÃ¡ listo para automatizar' : 'JUT is ready to automate'}</h3></div>
          <Link href={`/${locale}/automations`} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>â¡ {loc === 'es' ? 'Ver Automatizaciones' : 'View Automations'}</Link>
        </div>
      </div>
    </div>
  )
}
