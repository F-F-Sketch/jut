'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, MessageSquare, Zap, DollarSign, ArrowRight, TrendingUp, Plus, Activity } from 'lucide-react'
import Link from 'next/link'
import { FadeUp, StaggerChildren, CountUp, ScaleIn } from '@/components/ui/Animate'

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const [stats, setStats] = useState({ leads: 0, conversations: 0, automations: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [hour] = useState(new Date().getHours())
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [leads, convos, autos] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('automations').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'active'),
      ])
      setStats({ leads: leads.count || 0, conversations: convos.count || 0, automations: autos.count || 0, revenue: 0 })
      setLoading(false)
    })()
  }, [])

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const STATS = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: '#6366f1', suffix: '' },
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: '#3b82f6', suffix: '' },
    { label: 'Active Automations', value: stats.automations, icon: Zap, color: 'var(--pink)', suffix: '' },
    { label: 'Revenue', value: stats.revenue, icon: DollarSign, color: '#22c55e', prefix: '$', suffix: '' },
  ]

  const QUICK_ACTIONS = [
    { label: 'New Automation', href: locale + '/automations', icon: Zap, color: 'var(--pink)' },
    { label: 'Add Lead', href: locale + '/leads', icon: Users, color: '#6366f1' },
    { label: 'View Analytics', href: locale + '/analytics', icon: TrendingUp, color: '#22c55e' },
  ]

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1200 }}>

      {/* Header */}
      <FadeUp>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)', animation: 'pulse-dot 2s infinite' }}/>
            <span style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>System Active</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 8 }}>
            {greeting} 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Here is your business overview.</p>
        </div>
      </FadeUp>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map((s, i) => (
          <FadeUp key={s.label} delay={i * 80}>
            <div style={{
              padding: 24, borderRadius: 20,
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(237,25,102,0.2)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}>
              {/* Background glow */}
              <div style={{ position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:s.color+'15',filter:'blur(20px)',pointerEvents:'none' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position:'relative' }}>
                <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</span>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + s.color + '25' }}>
                  <s.icon size={17} color={s.color} strokeWidth={2}/>
                </div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1, position:'relative' }}>
                {loading ? '—' : <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix}/>}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Quick Actions + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <FadeUp delay={320}>
          <div style={{ padding: 24, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border-2)', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity size={16} color="var(--pink)"/>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Quick Actions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <Link key={a.label} href={'/' + a.href} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = a.color; (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = ''; (e.currentTarget as HTMLAnchorElement).style.background = '' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon size={14} color={a.color}/>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', flex: 1 }}>{a.label}</span>
                  <ArrowRight size={13} color="var(--text-4)"/>
                </Link>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={400}>
          <div style={{ padding: 24, borderRadius: 20, background: 'linear-gradient(135deg,rgba(237,25,102,0.06),rgba(33,82,164,0.06))', border: '1px solid rgba(237,25,102,0.15)', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'rgba(237,25,102,0.05)',filter:'blur(30px)',pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={16} color="var(--pink)"/>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>JUT is ready to automate</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 20 }}>
                Connect Instagram and create your first automation to start capturing leads automatically.
              </p>
              <Link href={'/' + locale + '/automations'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                borderRadius: 11, background: 'var(--pink)', color: '#fff', textDecoration: 'none',
                fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(237,25,102,0.3)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 30px rgba(237,25,102,0.45)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(237,25,102,0.3)' }}>
                <Zap size={14}/> View Automations
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>

    </div>
  )
}
