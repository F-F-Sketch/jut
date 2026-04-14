'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, MessageSquare, Zap, DollarSign, TrendingUp, ArrowRight, Bot, Plus } from 'lucide-react'
import Link from 'next/link'
import { PageTransition, StaggerContainer, StaggerItem, CountUp, HoverCard, PulseDot, GlowCard, FadeIn } from '@/components/ui/Motion'

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const [stats, setStats] = useState({ leads: 0, conversations: 0, automations: 0, revenue: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hour] = useState(new Date().getHours())
  const supabase = createClient()

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [leads, convos, autos, recent] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('automations').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ leads: leads.count || 0, conversations: convos.count || 0, automations: autos.count || 0, revenue: 0 })
      setRecentLeads(recent.data || [])
      setLoading(false)
    })()
  }, [])

  const CARDS = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: '#6366f1', suffix: '', href: '/' + locale + '/leads' },
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: '#3b82f6', suffix: '', href: '/' + locale + '/conversations' },
    { label: 'Active Automations', value: stats.automations, icon: Zap, color: '#ED1966', suffix: '', href: '/' + locale + '/automations' },
    { label: 'Revenue', value: stats.revenue, icon: DollarSign, color: '#C9A84C', prefix: '$', suffix: '', href: '/' + locale + '/sales' },
  ]

  const QUICK_ACTIONS = [
    { label: 'New Automation', icon: Zap, color: '#ED1966', href: '/' + locale + '/automations' },
    { label: 'Add Lead', icon: Users, color: '#6366f1', href: '/' + locale + '/leads' },
    { label: 'AI Agent', icon: Bot, color: '#22c55e', href: '/' + locale + '/agent' },
    { label: 'Analytics', icon: TrendingUp, color: '#3b82f6', href: '/' + locale + '/analytics' },
  ]

  return (
    <PageTransition>
      <div style={{ padding: 32, maxWidth: 1200 }}>

        {/* Header */}
        <FadeIn style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <PulseDot color="#22c55e" size={8} />
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5 }}>SYSTEM ACTIVE</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8, lineHeight: 1.2 }}>
                {greeting} 👋
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-3)', marginTop: 4 }}>Here's your business overview</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <Link key={a.label} href={a.href}>
                  <HoverCard style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
                    borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--border-2)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
                  }}>
                    <a.icon size={14} color={a.color} />
                    {a.label}
                  </HoverCard>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {CARDS.map((card) => (
            <StaggerItem key={card.label}>
              <Link href={card.href} style={{ textDecoration: 'none' }}>
                <GlowCard color={card.color + '40'} style={{
                  padding: 24, borderRadius: 18, background: 'var(--surface)',
                  border: '1px solid var(--border-2)', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Subtle gradient bg */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at top right, ' + card.color + '12 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.3 }}>{card.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <card.icon size={17} color={card.color} />
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1 }}>
                    {loading ? <div style={{ height: 36, width: 60, borderRadius: 8, background: 'var(--surface-2)' }} />
                      : <CountUp value={card.value} prefix={card.prefix} suffix={card.suffix} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, color: 'var(--text-4)', fontSize: 12 }}>
                    <ArrowRight size={11} />
                    <span>View details</span>
                  </div>
                </GlowCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Recent Leads */}
          <FadeIn delay={0.2}>
            <div style={{ padding: 24, borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Recent Leads</h2>
                <Link href={'/' + locale + '/leads'} style={{ fontSize: 12, color: 'var(--pink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 52, borderRadius: 12, background: 'var(--surface-2)' }} />)}
                </div>
              ) : recentLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-4)' }}>
                  <Users size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.2 }} />
                  <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No leads yet</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Leads from automations will appear here</p>
                </div>
              ) : (
                <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentLeads.map(lead => (
                    <StaggerItem key={lead.id}>
                      <HoverCard style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                        borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--pink)18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--pink)', flexShrink: 0 }}>
                          {(lead.name || '?')[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name || 'Unknown'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 1 }}>{lead.email || lead.phone || lead.source || 'No contact info'}</div>
                        </div>
                        <div style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'var(--surface-3)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                          {lead.stage || 'new'}
                        </div>
                      </HoverCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </FadeIn>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* System status */}
            <FadeIn delay={0.3}>
              <div style={{ padding: 22, borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>System Status</h2>
                {[
                  { label: 'AI Agent', status: 'active' },
                  { label: 'Automations', status: stats.automations > 0 ? 'active' : 'idle' },
                  { label: 'API', status: 'active' },
                  { label: 'Webhooks', status: 'active' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PulseDot color={item.status === 'active' ? '#22c55e' : '#f59e0b'} size={7} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: item.status === 'active' ? '#22c55e' : '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Connect CTA */}
            <FadeIn delay={0.4}>
              <div style={{
                padding: 22, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(237,25,102,0.1), rgba(33,82,164,0.08))',
                border: '1px solid rgba(237,25,102,0.15)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,25,102,0.12) 0%, transparent 70%)' }} />
                <div style={{ fontSize: 22, marginBottom: 8 }}>⚡</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Connect Instagram</h3>
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 14 }}>Start automating DMs and capturing leads from your posts.</p>
                <Link href={'/' + locale + '/social'}>
                  <HoverCard style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--pink)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Connect now <ArrowRight size={13} />
                  </HoverCard>
                </Link>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}