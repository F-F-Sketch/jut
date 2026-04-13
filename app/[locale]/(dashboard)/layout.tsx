import { redirect } from 'next/navigation'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/' + locale + '/login')

  const profile = await getUserProfile(user.id)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar locale={locale} userRole={profile?.role ?? 'user'} />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Topbar locale={locale} userName={profile?.full_name ?? user.email ?? 'User'} />
        <main className="flex-1 overflow-y-auto pt-[68px]">
          {children}
        </main>
      </div>
    </div>
  )
}
