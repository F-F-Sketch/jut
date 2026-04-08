import { createClient, getUser } from '@/lib/supabase/server'
import { Users, DollarSign, TrendingUp, Zap, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient()
  const user = await getUser()

  // Fetch aggregate stats
  const [profilesRes, subsRes, txnsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, plan, role, created_at').order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('plan, status, amount_paid, currency'),
    supabase.from('wompi_transactions').select('amount_in_cents, currency, status, created_at').eq('status', 'APPROVED'),
  ])

  const profiles = profilesRes.data ?? []
  const subs = subsRes.data ?? []
  const txns = txnsRes.data ?? []

  const totalUsers = profiles.filter(p => p.role === 'user').length
  const paidUsers = subs.filter(s => s.status === 'active' && s.plan !== 'free').length
  const mrrCOP = txns.reduce((sum, t) => t.currency === 'COP' ? sum + (t.amount_in_cents / 100) : sum, 0)
  const planCounts = subs.reduce((acc: Record<string, number>, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1; return acc
  }, {})

  const recentUsers = profiles.slice(0, 8)

  const stats = [
    { label: 'Total Members', value: totalUsers, icon: '👥', color: '#ED1966' },
    { label: 'Paying Members', value: paidUsers, icon: '💳', color: '#22c55e' },
    { label: 'MRR (COP)', value: `$${mrrCOP.toLocaleString('es-CO')}`, icon: '💰', color: '#f59e0b' },
    { label: 'Free Plan', value: planCounts['free'] ?? 0, icon: '🆓', color: '#4a90d9' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} style={{ color: 'var(--pink)' }} />
            <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>Owner Dashboard</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Full platform overview — only visible to you</p>
        </div>
        <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: 'var(--pink)', color: '#fff' }}>
          <Users size={14} /> View All Members
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <span className="text-2xl block mb-3">{icon}</span>
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text)' }}>Plan Distribution</h2>
          <div className="space-y-3">
            {['elite', 'growth', 'starter', 'free'].map(plan => {
              const count = planCounts[plan] ?? 0
              const total = subs.length || 1
              const pct = Math.round((count / total) * 100)
              const colors: Record<string, string> = { elite: '#ED1966', growth: '#22c55e', starter: '#4a90d9', free: '#606080' }
              return (
                <div key={plan}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-2)' }}>
                    <span className="capitalize font-semibold">{plan}</span>
                    <span>{count} users ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[plan] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Recent Signups</h2>
            <Link href={`/${locale}/admin/users`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--pink)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentUsers.filter(p => p.role === 'user').slice(0, 6).map((p: any) => (
              <Link key={p.id} href={`/${locale}/admin/members/${p.id}`}
                className="flex items-center gap-3 px-6 py-3 transition-all hover:bg-[var(--surface-2)]"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>
                  {(p.full_name ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{p.full_name ?? 'No name'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ background: p.plan === 'free' ? 'rgba(96,96,128,0.15)' : 'rgba(237,25,102,0.1)', color: p.plan === 'free' ? 'var(--text-3)' : 'var(--pink)' }}>
                  {p.plan ?? 'free'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Manage Pricing', desc: 'Edit plan prices & features', href: `/${locale}/admin/pricing`, icon: '💰' },
          { label: 'Create Discount', desc: 'Generate promo codes', href: `/${locale}/admin/discounts`, icon: '🏷️' },
          { label: 'View Members', desc: 'See all accounts', href: `/${locale}/admin/users`, icon: '👥' },
        ].map(({ label, desc, href, icon }) => (
          <Link key={href} href={href} className="rounded-2xl p-5 transition-all hover:opacity-90"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <span className="text-2xl block mb-3">{icon}</span>
            <p className="font-display font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
