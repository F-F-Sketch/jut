import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PageProps { params: { locale: string } }

async function getDashboardData(userId: string) {
  try {
    const supabase = await createClient()
    const [leadsRes, convoRes, ordersRes, autoRes] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('conversations').select('*').eq('user_id', userId).order('last_message_at', { ascending: false }).limit(5),
      supabase.from('orders').select('total').eq('user_id', userId).eq('payment_status', 'paid'),
      supabase.from('automations').select('run_count').eq('user_id', userId),
    ])
    const revenue = ordersRes.data?.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0) ?? 0
    const automationsFired = autoRes.data?.reduce((sum: number, a: any) => sum + (a.run_count ?? 0), 0) ?? 0
    return { recentLeads: leadsRes.data ?? [], recentConvos: convoRes.data ?? [], totalLeads: leadsRes.data?.length ?? 0, revenue, automationsFired, dbReady: !leadsRes.error }
  } catch {
    return { recentLeads: [], recentConvos: [], totalLeads: 0, revenue: 0, automationsFired: 0, dbReady: false }
  }
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'

  let user = null
  try { user = await getUser() } catch {}

  let profile = null
  try { if (user) profile = await getUserProfile(user.id) } catch {}

  const data = user ? await getDashboardData(user.id) : { recentLeads: [], recentConvos: [], totalLeads: 0, revenue: 0, automationsFired: 0, dbReady: false }

  const userName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? (loc === 'es' ? 'Buenos días' : 'Good morning') : hour < 18 ? (loc === 'es' ? 'Buenas tardes' : 'Good afternoon') : (loc === 'es' ? 'Buenas noches' : 'Good evening')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{greeting}, {userName} 👋</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Aquí tienes el resumen de tu negocio.' : "Here's your business overview."}</p>
      </div>

      {!data.dbReady && (
        <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.25)' }}>
          <AlertCircle size={20} style={{ color: '#ED1966', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Base de datos no configurada' : 'Database not set up yet'}</p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Ve a Supabase → SQL Editor y ejecuta el schema para activar todo.' : 'Go to Supabase → SQL Editor and run the schema to enable all features.'}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {[
          { label: loc === 'es' ? 'Nueva Automatización' : 'New Automation', href: `/${locale}/automations`, icon: '⚡' },
          { label: loc === 'es' ? 'Agregar Lead' : 'Add Lead', href: `/${locale}/leads/new`, icon: '👤' },
          { label: loc === 'es' ? 'Ver Analítica' : 'View Analytics', href: `/${locale}/analytics`, icon: '📊' },
        ].map(({ label, href, icon }) => (
          <Link key={href} href={href} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
            {icon} {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: loc === 'es' ? 'Total Leads' : 'Total Leads', value: data.totalLeads, icon: '👥', color: '#ED1966' },
          { label: loc === 'es' ? 'Conversaciones' : 'Conversations', value: data.recentConvos.length, icon: '💬', color: '#4a90d9' },
          { label: loc === 'es' ? 'Automatizaciones' : 'Automations Fired', value: data.automationsFired, icon: '⚡', color: '#22c55e' },
          { label: loc === 'es' ? 'Ingresos' : 'Revenue', value: `$${data.revenue.toLocaleString()}`, icon: '💰', color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <span className="text-2xl block mb-3">{icon}</span>
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Leads Recientes' : 'Recent Leads'}</h2>
            <Link href={`/${locale}/leads`} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#ED1966' }}>{loc === 'es' ? 'Ver todos' : 'View all'} <ArrowRight size={12} /></Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">👤</span>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Aún no hay leads' : 'No leads yet'}</p>
              <Link href={`/${locale}/leads/new`} className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: '#ED1966', color: '#fff' }}>{loc === 'es' ? 'Agregar lead' : 'Add lead'}</Link>
            </div>
          ) : (
            data.recentLeads.map((lead: any) => (
              <Link key={lead.id} href={`/${locale}/leads/${lead.id}`} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[var(--surface-2)]" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ED1966, #2152A4)' }}>{lead.full_name?.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{lead.full_name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{lead.email ?? lead.instagram_handle ?? '—'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: 'rgba(237,25,102,0.1)', color: '#ED1966' }}>{lead.status}</span>
              </Link>
            ))
          )}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Conversaciones Recientes' : 'Recent Conversations'}</h2>
            <Link href={`/${locale}/conversations`} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#ED1966' }}>{loc === 'es' ? 'Ver todas' : 'View all'} <ArrowRight size={12} /></Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-4xl">💬</span>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Aún no hay conversaciones' : 'No conversations yet'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(237,25,102,0.08), rgba(33,82,164,0.08))', border: '1px solid rgba(237,25,102,0.15)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#ED1966' }}>{loc === 'es' ? 'Sistema activo' : 'System Active'}</span>
            </div>
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'JUT está listo para automatizar' : 'JUT is ready to automate'}</h3>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Conecta Instagram y crea tu primera automatización.' : 'Connect Instagram and create your first automation.'}</p>
          </div>
          <Link href={`/${locale}/automations`} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap" style={{ background: '#ED1966', color: '#fff' }}>
            ⚡ {loc === 'es' ? 'Ver Automatizaciones' : 'View Automations'}
          </Link>
        </div>
      </div>
    </div>
  )
}
