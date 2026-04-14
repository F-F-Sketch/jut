import { redirect } from 'next/navigation'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { PageTransition } from '@/components/ui/PageTransition'

export default async function DashboardLayout({
  children, params,
}: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/' + locale + '/login')
  const profile = await getUserProfile(user.id)
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar locale={locale} userRole={profile?.role ?? 'user'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 240 }}>
        <Topbar locale={locale} userName={profile?.full_name ?? user.email ?? 'User'} />
        <main style={{ flex: 1, overflowY: 'auto', paddingTop: 60 }}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
