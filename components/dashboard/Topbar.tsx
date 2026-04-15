'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, ChevronDown, LogOut, Settings, User, Zap, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TopbarProps { locale:string; userName?:string; onMenuToggle?:()=>void }

export function Topbar({ locale, userName='User', onMenuToggle }:TopbarProps) {
  const [showMenu,setShowMenu]=useState(false)
  const [showNotifs,setShowNotifs]=useState(false)
  const [hour]=useState(new Date().getHours())
  const supabase=createClient()
  const router=useRouter()
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening'
  const firstName=userName?.split(' ')[0]||userName?.split('@')[0]||'there'
  const initials=firstName.slice(0,2).toUpperCase()

  async function signOut(){
    await supabase.auth.signOut()
    router.push('/'+locale+'/login')
  }

  return(
    <header style={{
      position:'fixed',top:0,left:0,right:0,height:60,zIndex:30,
      background:'rgba(6,6,8,0.88)',backdropFilter:'blur(20px)',
      borderBottom:'1px solid var(--border)',
      display:'flex',alignItems:'center',padding:'0 16px',gap:12,
    }}>
      {/* Mobile menu button */}
      <button onClick={onMenuToggle} style={{display:'none',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:6,borderRadius:8,flexShrink:0}} className="mobile-menu-btn" aria-label="Open menu">
        <Menu size={20}/>
      </button>

      {/* Spacer for desktop sidebar */}
      <div style={{width:240,flexShrink:0,display:'flex',alignItems:'center'}} className="sidebar-spacer">
        <Link href={'/'+locale+'/dashboard'} style={{display:'flex',alignItems:'center',gap:9,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,var(--pink),#b0124e)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Zap size={13} color="#fff"/>
          </div>
          <span style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,color:'var(--text)',letterSpacing:-0.5}}>JUT</span>
        </Link>
      </div>

      <div style={{flex:1,minWidth:0}}>
        <span style={{fontSize:14,color:'var(--text-2)',fontWeight:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>
          {greeting}, <strong style={{color:'var(--text)',fontFamily:'var(--font-display)',fontWeight:700}}>{firstName}</strong>
        </span>
      </div>

      {/* Notifications */}
      <div style={{position:'relative'}}>
        <button onClick={()=>{setShowNotifs(!showNotifs);setShowMenu(false)}} style={{width:36,height:36,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-3)'}}>
          <Bell size={15}/>
        </button>
        {showNotifs&&(
          <div style={{position:'absolute',top:44,right:0,width:280,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:14,padding:8,boxShadow:'var(--shadow-md)',zIndex:100}}>
            <div style={{padding:'8px 12px 6px'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Notifications</span></div>
            <div style={{padding:'16px 12px',textAlign:'center',fontSize:13,color:'var(--text-4)'}}>All caught up ✓</div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div style={{position:'relative'}}>
        <button onClick={()=>{setShowMenu(!showMenu);setShowNotifs(false)}} style={{display:'flex',alignItems:'center',gap:7,padding:'5px 10px 5px 5px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',cursor:'pointer'}}>
          <div style={{width:26,height:26,borderRadius:8,background:'linear-gradient(135deg,var(--pink),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',fontFamily:'var(--font-display)'}}>{initials}</div>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text)',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} className="hide-mobile">{firstName}</span>
          <ChevronDown size={12} color="var(--text-3)"/>
        </button>
        {showMenu&&(
          <div style={{position:'absolute',top:44,right:0,width:190,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:14,padding:6,boxShadow:'var(--shadow-md)',zIndex:100}}>
            <div style={{padding:'8px 12px 6px',borderBottom:'1px solid var(--border)',marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            </div>
            {[{href:'/'+locale+'/settings',icon:Settings,label:'Settings'},{href:'/'+locale+'/settings',icon:User,label:'Profile'}].map(item=>(
              <Link key={item.label} href={item.href} onClick={()=>setShowMenu(false)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:9,color:'var(--text-2)',fontSize:13,textDecoration:'none'}}>
                <item.icon size={14} color="var(--text-3)"/>{item.label}
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
