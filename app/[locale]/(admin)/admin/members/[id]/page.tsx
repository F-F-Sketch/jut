import { createClient, getUser } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, CreditCard, Zap, Users } from 'lucide-react'

export default async function MemberDetailPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params
  const supabase = await createClient()
  const [profileRes, leadsRes, autoRes, subsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', id),
    supabase.from('automations').select('id, name, is_active, run_count').eq('user_id', id),
    supabase.from('subscriptions').select('*').eq('user_id', id).single(),
  ])
  if (!profileRes.data) notFound()
  const profile = profileRes.data
  const leadCount = leadsRes.count ?? 0
  const automations = autoRes.data ?? []
  const sub = subsRes.data
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-3)' }}>
        <ArrowLeft size={14} /> Back to members
      </Link>
      <div className="rounded-2xl p-6 flex items-start gap-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>
          {(profile.full_name ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>{profile.full_name ?? 'No name'}</h1>
          <p className="text-sm mb-3" style={{ color: 'var(--text-3)' }}>{profile.business_name ?? 'No business'}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)' }}>{profile.plan ?? 'free'}</span>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-bold uppercase" style={{ background: sub?.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(96,96,128,0.1)', color: sub?.status === 'active' ? '#22c55e' : 'var(--text-3)' }}>{sub?.status ?? 'free'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Total Leads', value: leadCount, icon: Users },{ label: 'Automations', value: automations.length, icon: Zap },{ label: 'Revenue', value: sub?.amount_paid ? `$${Number(sub.amount_paid).toLocaleString()} ${sub.currency}` : '$0', icon: CreditCard }].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <Icon size={18} style={{ color: 'var(--pink)', marginBottom: 12 }} />
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
