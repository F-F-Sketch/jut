'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { PageTransition } from '@/components/ui/PageTransition'
import { CursorGlow } from '@/components/ui/CursorGlow'
import { AuroraBackground } from '@/components/ui/AuroraBackground'

export default function DashboardLayout({ children, params }:{ children:React.ReactNode; params:{ locale:string } }) {
  const { locale } = params
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(()=>{
    (async()=>{
      const { data:{ user:u } } = await supabase.auth.getUser()
      if (!u) { router.push('/'+locale+'/login'); return }
      setUser(u)
      // Always owner for this UID
      const OWNER_IDS = ['501272f0-032f-4630-986d-e75487f1806d']
      if(OWNER_IDS.includes(u.id)){
        setProfile({full_name:u.email?.split('@')[0]||'Owner',role:'owner',plan:'elite'})
        return
      }
      const { data:p } = await supabase.from('profiles').select('full_name,role,plan').eq('id',u.id).single()
      setProfile(p)
    })()
  },[])

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'var(--bg)',position:'relative'}}>
      <AuroraBackground/>
      <CursorGlow/>
      <Sidebar
        locale={locale}
        userRole={profile?.role}
        mobileOpen={sidebarOpen}
        onClose={()=>setSidebarOpen(false)}
      />
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,marginLeft:240,position:'relative',zIndex:1,transition:'margin-left 0.3s'}}>
        <style>{'          @media (max-width:768px) {            .dashboard-margin { margin-left: 0 !important; }            .mobile-menu-btn { display: flex !important; }            .sidebar-spacer { display: none !important; }          }        '}</style>
        <div className="dashboard-margin" style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,marginLeft:0}}>
          <Topbar
            locale={locale}
            userName={profile?.full_name || user?.email || 'User'}
            onMenuToggle={()=>setSidebarOpen(!sidebarOpen)}
          />
          <main style={{flex:1,overflowY:'auto',paddingTop:60}}>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  )
}
