'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { PageTransition } from '@/components/ui/PageTransition'
import { CursorGlow } from '@/components/ui/CursorGlow'
import { AuroraBackground } from '@/components/ui/AuroraBackground'

const OWNER_IDS = ['501272f0-032f-4630-986d-e75487f1806d']

export default function DashboardLayout({ children, params }:{ children:React.ReactNode; params:{ locale:string } }) {
  const { locale } = params
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data:{ user:u } } = await supabase.auth.getUser()
      if (!u) { router.push('/'+locale+'/login'); return }
      setUser(u)
      if (OWNER_IDS.includes(u.id)) {
        setProfile({ full_name:u.email?.split('@')[0]||'Owner', role:'owner', plan:'elite' })
        return
      }
      const { data:p } = await supabase.from('profiles').select('full_name,role,plan').eq('id',u.id).single()
      setProfile(p)
    })()
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [])

  return (
    <div className="dash-root">
      <AuroraBackground/>
      <CursorGlow/>

      {/* Overlay */}
      <div className={'dash-overlay'+(sidebarOpen?' show':'')} onClick={()=>setSidebarOpen(false)}/>

      {/* Sidebar */}
      <div className={'dash-sidebar'+(sidebarOpen?' open':'')}>
        <Sidebar locale={locale} userRole={profile?.role} onClose={()=>setSidebarOpen(false)}/>
      </div>

      {/* Main */}
      <div className="dash-main">
        <div className="dash-topbar">
          <Topbar
            locale={locale}
            userName={profile?.full_name||user?.email||'User'}
            onMenuToggle={()=>setSidebarOpen(!sidebarOpen)}
          />
        </div>
        <main className="dash-content">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}