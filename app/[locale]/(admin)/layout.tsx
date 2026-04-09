import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, DollarSign, Tag, LayoutDashboard, Settings, ArrowLeft, Shield } from 'lucide-react'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  let user = null
  let profile = null
  try { user = await getUser() } catch {}
  if (!user) redirect(`/${locale}/login`)
  try { profile = await getUserProfile(user.id) } catch {}

  if (!profile || !['owner', 'admin'].includes(profile.role ?? '')) {
    redirect(`/${locale}/dashboard`)
  }

  const nav = [
    { href: `/${locale}/admin`, label: 'Overview', icon: LayoutDashboard },
    { href: `/${locale}/admin/users`, label: 'Members', icon: Users },
    { href: `/${locale}/admin/pricing`, label: 'Pricing', icon: DollarSign },
    { href: `/${locale}/admin/discounts`, label: 'Discounts', icon: Tag },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <aside className="w60 flex-shrink-0 flex flex-col" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', height: '100vh', position: 'sticky', top: 0 }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--pink)' }}>
              <Shield size={14} color="#fff" />
            </div>
            <span className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Admin Panel</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Owner: {profile?.full_name ?? user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--surface)]" style={{ color: 'var(--text-2)' }}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--surface)]" style={{ color: 'var(--text-3)' }}>
            <ArrowLeft size={14} />Back to Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
