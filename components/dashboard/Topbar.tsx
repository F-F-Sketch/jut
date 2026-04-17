'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, ChevronDown, LogOut, Settings, User, Menu, Globe } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface TopbarProps { locale:string; userName?:string; onMenuToggle?:()=>void }

export function Topbar({ locale, userName='User', onMenuToggle }:TopbarProps) {
  const [showMenu,setShowMenu]=useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const firstName = userName?.split(' ')[0]||userName?.split('@')[0]||'there'
  const initials = firstName.slice(0,2).toUpperCase()

  function switchLang() {
    const newLocale = locale==='en'?'es':'en'
    router.push(pathname.replace('/'+locale+'/','/'+newLocale+'/'))
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:10,width:'100%',height:'100%'}}>
      {/* Hamburger */}
      <button onClick={onMenuToggle} style={{flexShrink:0,width:36,height:36,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-2)'}}>
        <Menu size={18}/>
      </button>

      {/* Brand — mobile only */}
      <Link href={'/'+locale+'/dashboard'} style={{fontWeight:900,fontSize:18,color:'var(--text)',letterSpacing:-0.5,fontFamily:'var(--font-display)',textDecoration:'none',flexShrink:0}} className="mob-show">
        JUT
      </Link>

      <div style={{flex:1,minWidth:0}}/>

      {/* Lang toggle */}
      <button onClick={switchLang} style={{flexShrink:0,padding:'6px 10px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',cursor:'pointer',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:5}}>
        <Globe size={13}/>
        <span className="mob-hide">{locale==='en'?'EN':'ES'}</span>
      </button>

      {/* Notifications */}
      <button style={{flexShrink:0,width:36,height:36,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-3)'}} className="mob-hide">
        <Bell size={15}/>
      </button>

      {/* User menu */}
      <div style={{position:'relative',flexShrink:0}}>
        <button onClick={()=>setShowMenu(!showMenu)} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 8px 4px 4px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',cursor:'pointer'}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,var(--pink),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>{initials}</div>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text)',maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} className="mob-hide">{firstName}</span>
          <ChevronDown size={12} color="var(--text-3)" className="mob-hide"/>
        </button>
        {showMenu&&(
          <div style={{position:'absolute',top:44,right:0,width:180,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:14,padding:6,boxShadow:'0 8px 40px rgba(0,0,0,0.6)',zIndex:200}}>
            <div style={{padding:'8px 12px 6px',borderBottom:'1px solid var(--border)',marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            </div>
            <Link href={'/'+locale+'/settings'} onClick={()=>setShowMenu(false)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:9,color:'var(--text-2)',fontSize:13,textDecoration:'none'}}>
              <Settings size={14} color="var(--text-3)"/> Settings
            </Link>
            <button onClick={async()=>{await supabase.auth.signOut();router.push('/'+locale+'/login')}} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:9,color:'#ef4444',fontSize:13,background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
              <LogOut size={14}/>Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}