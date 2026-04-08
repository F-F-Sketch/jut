import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = params

  let user = null
  try { user = await getUser() } catch {}
  if (!user) redirect(`/${locale}/login`)

  let profile = null
  try { profile = await getUserProfile(user.id) } catch {}

  const userName = profile?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const userPlan = profile?.plan ?? 'free'
  const userRole = profile?.role ?? 'user'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar locale={locale} userName={userName} userPlan={userPlan} userRole={userRole} />
      <div className="ml-64">
        <Topbar locale={locale} userName={userName} />
        <main className="pt-[68px] min-h-screen">{children}</main>
      </div>
    </div>
  )
}
