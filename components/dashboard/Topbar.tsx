'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, ChevronDown, LogOut, Settings, User, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TopbarProps { locale: string; userName?: string }

export function Topbar({ locale, userName = 'User' }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [hour] = useState(new Date().getHours())
  const supabase = createClient()
  const router = useRouter()

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = userName?.split(' ')[0] || userName?.split('@')[0] || 'there'

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).order('created_at', {ascending:false}).limit(10)
    setNotifications(data || [])
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/' + locale + '/login')
  }

  const initials = firstName.slice(0, 2).toUpperCase()
  const unread = notifications.length

  return (
    <header style={{
      position:'fixed', top:0, left:240, right:0, height:60, zIndex:30,
      background:'rgba(6,6,8,0.85)',
      backdropFilter:'blur(20px)',
      borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', padding:'0 24px', gap:16,
    }}>
      {/* Greeting */}
      <div style={{flex:1}}>
        <span style={{fontSize:14,color:'var(--text-2)',fontWeight:400}}>
          {greeting}, <strong style={{color:'var(--text)',fontFamily:'var(--font-display)',fontWeight:700}}>{firstName}</strong>
        </span>
      </div>

      {/* Search */}
      <div style={{position:'relative',width:220}}>
        <Search size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)'}}/>
        <input placeholder="Search..." style={{
          width:'100%', paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7,
          borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)',
          color:'var(--text)', fontSize:13, outline:'none', transition:'border-color 0.2s',
        }}/>
      </div>

      {/* Notifications */}
      <div style={{position:'relative'}}>
        <button onClick={()=>{setShowNotifs(!showNotifs);setShowMenu(false)}} style={{
          width:36, height:36, borderRadius:10, background:'var(--surface-2)',
          border:'1px solid var(--border-2)', display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', position:'relative', color:'var(--text-3)',
        }}>
          <Bell size={15}/>
          {unread > 0 && (
            <div style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'var(--pink)',border:'2px solid var(--bg)'}}/>
          )}
        </button>
        {showNotifs && (
          <div style={{position:'absolute',top:44,right:0,width:300,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:14,padding:8,boxShadow:'var(--shadow-md)',zIndex:100}}>
            <div style={{padding:'8px 12px',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Notifications</span>
              {unread > 0 && <span style={{marginLeft:8,fontSize:11,padding:'1px 7px',borderRadius:999,background:'rgba(237,25,102,0.1)',color:'var(--pink)',fontWeight:700}}>{unread}</span>}
            </div>
            {notifications.length === 0 ? (
              <div style={{padding:'20px 12px',textAlign:'center',fontSize:13,color:'var(--text-4)'}}>All caught up ✓</div>
            ) : notifications.map(n => (
              <div key={n.id} style={{padding:'10px 12px',borderRadius:10,background:'var(--surface-2)',marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User menu */}
      <div style={{position:'relative'}}>
        <button onClick={()=>{setShowMenu(!showMenu);setShowNotifs(false)}} style={{
          display:'flex', alignItems:'center', gap:8, padding:'5px 10px 5px 5px',
          borderRadius:11, background:'var(--surface-2)', border:'1px solid var(--border-2)',
          cursor:'pointer', transition:'border-color 0.2s',
        }}>
          <div style={{
            width:28, height:28, borderRadius:8,
            background:'linear-gradient(135deg, var(--pink), var(--blue))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, color:'#fff', fontFamily:'var(--font-display)',
          }}>{initials}</div>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text)',maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{firstName}</span>
          <ChevronDown size={13} color="var(--text-3)"/>
        </button>
        {showMenu && (
          <div style={{position:'absolute',top:44,right:0,width:200,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:14,padding:6,boxShadow:'var(--shadow-md)',zIndex:100}}>
            <div style={{padding:'8px 12px 6px',marginBottom:2}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            </div>
            <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
            {[
              {href:'/' + locale + '/settings', icon:Settings, label:'Settings'},
              {href:'/' + locale + '/settings', icon:User, label:'Profile'},
            ].map(item => (
              <Link key={item.label} href={item.href} onClick={()=>setShowMenu(false)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:9,color:'var(--text-2)',fontSize:13,textDecoration:'none',transition:'background 0.1s'}}>
                <item.icon size={14} color="var(--text-3)"/>
                {item.label}
              </Link>
            ))}
            <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
            <button onClick={signOut} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:9,color:'#ef4444',fontSize:13,background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
              <LogOut size={14}/>Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}