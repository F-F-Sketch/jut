import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { StatCard } from '@/components/dashboard/StatCard'
import { Users, MessageSquare, Zap, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import { formatCurrency, timeAgo, STATUS_COLORS, CHANNEL_ICONS } from '@/lib/utils'
import Link from 'next/link'
import type { Lead, Conversation } from '@/types'

interface PageProps { params: { locale: string } }

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const [leadsRes, convoRes, ordersRes, autoRes] = await Promise.all([
    supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('conversations').select('*').eq('user_id', userId).order('last_message_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').eq('user_id', userId).eq('payment_status', 'paid'),
    supabase.from('automations').select('run_count').eq('user_id', userId),
  ])
  const revenue = ordersRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0
  const automationsFired = autoRes.data?.reduce((sum, a) => sum + (a.run_count ?? 0), 0) ?? 0
  return {
    recentLeads: (leadsRes.data ?? []) as Lead[],
    recentConvos: (convoRes.data ?? []) as Conversation[],
    totalLeads: leadsRes.data?.length ?? 0,
    revenue, automationsFired,
  }
}

function EmptyInline({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-center max-w-[200px]" style={{ color: 'var(--text-3)' }}>{text}</p>
    </div>
  )
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('dashboard')
  const user = await getUser()
  const profile = await getUserProfile(user!.id)
  const { recentLeads, recentConvos, totalLeads, revenue, automationsFired } = await getDashboardData(user!.id)
  const userName = profile?.full_name?.split(' ')[0] ?? 'there'
  const currency = (profile?.currency ?? 'USD') as 'USD' | 'COP'
  const loc = locale as 'en' | 'es'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? (locale === 'es' ? 'Buenos días' : 'Good morning') : hour < 18 ? (locale === 'es' ? 'Buenas tardes' : 'Good afternoon') : (locale === 'es' ? 'Buenas noches' : 'Good evening')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{greeting}, {userName} 👋</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('welcome_sub')}</p>
      </div>

      <div className="flex flex-wrap gap-3 animate-fade-up animation-delay-100">
        {[
          { label: locale === 'es' ? 'Nueva Automatización' : 'New Automation', href: `/${locale}/automations`, icon: Zap },
          { label: locale === 'es' ? 'Agregar Lead' : 'Add Lead', href: `/${locale}/leads`, icon: Users },
          { label: locale === 'es' ? 'Ver Analítica' : 'View Analytics', href: `/${locale}/analytics`, icon: TrendingUp },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="btn-secondary text-sm flex items-center gap-2"><Icon size={14} />{label}</Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-up animation-delay-200">
        <StatCard label={t('total_leads')} value={totalLeads} icon={Users} delta={locale === 'es' ? '+12 esta semana' : '+12 this week'} accent="pink" />
        <StatCard label={t('active_convos')} value={recentConvos.filter(c => c.status === 'active').length} icon={MessageSquare} accent="blue" />
        <StatCard label={t('automations_fired')} value={automationsFired} icon={Zap} delta={locale === 'es' ? '+8 hoy' : '+8 today'} accent="green" />
        <StatCard label={t('revenue')} value={formatCurrency(revenue, currency, loc)} icon={DollarSign} delta="+23%" accent="yellow" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-up animation-delay-300">
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{t('recent_leads')}</h2>
            <Link href={`/${locale}/leads`} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--pink)' }}>{t('view_all')} <ArrowRight size={12} /></Link>
          </div>
          {recentLeads.length === 0 ? <EmptyInline icon="👤" text={locale === 'es' ? 'Aún no hay leads.' : 'No leads yet.'} /> : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentLeads.map(lead => (
                <Link key={lead.id} href={`/${locale}/leads/${lead.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--surface)] transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>{lead.full_name.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{lead.full_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{lead.email ?? lead.instagram_handle ?? '—'}</p>
                  </div>
                  <span className={`badge text-xs ${STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] ?? ''}`}>{lead.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{t('recent_convos')}</h2>
            <Link href={`/${locale}/conversations`} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--pink)' }}>{t('view_all')} <ArrowRight size={12} /></Link>
          </div>
          {recentConvos.length === 0 ? <EmptyInline icon="💬" text={locale === 'es' ? 'Aún no hay conversaciones.' : 'No conversations yet.'} /> : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentConvos.map(convo => (
                <Link key={convo.id} href={`/${locale}/conversations/${convo.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--surface)] transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--surface-2)' }}>{CHANNEL_ICONS[convo.channel] ?? '💬'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{convo.participant_name ?? convo.participant_handle ?? 'Unknown'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{convo.last_message ?? '—'}</p>
                  </div>
                  {convo.unread_count > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--pink)' }}>{convo.unread_count}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6 relative overflow-hidden animate-fade-up animation-delay-400" style={{ background: 'linear-gradient(135deg, rgba(237,25,102,0.08), rgba(33,82,164,0.08))', border: '1px solid rgba(237,25,102,0.15)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--pink)' }}>{locale === 'es' ? 'Sistema activo' : 'System Active'}</span></div>
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'JUT está escuchando tus canales' : 'JUT is listening to your channels'}</h3>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Triggers sociales y flujos activos.' : 'Social triggers and automation flows are running.'}</p>
          </div>
          <Link href={`/${locale}/automations`} className="btn-primary whitespace-nowrap flex items-center gap-2"><Zap size={14} />{locale === 'es' ? 'Ver Automatizaciones' : 'View Automations'}</Link>
        </div>
      </div>
    </div>
  )
}
