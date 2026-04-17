'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, MessageSquare, Zap, BarChart3, Settings, Share2, ShoppingBag, Bot, Sparkles, HelpCircle, Shield, ChevronRight, Crown, DollarSign, X, Globe } from 'lucide-react'

const NAV = [
  { group:'Main', items:[
    { href:'dashboard', label:'Dashboard', icon:LayoutDashboard },
    { href:'leads', label:'Leads', icon:Users },
    { href:'conversations', label:'Conversations', icon:MessageSquare },
  ]},
  { group:'Automation', items:[
    { href:'automations', label:'Automations', icon:Zap },
    { href:'social', label:'Social Networks', icon:Share2 },
    { href:'agent', label:'AI Agent', icon:Bot },
    { href:'chatbot', label:'Chat Widget', icon:MessageSquare },
  ]},
  { group:'Business', items:[
    { href:'sales', label:'Sales', icon:ShoppingBag },
    { href:'analytics', label:'Analytics', icon:BarChart3 },
    { href:'creative', label:'Creative AI', icon:Sparkles },
    { href:'pricing', label:'Pricing', icon:DollarSign },
  ]},
  { group:'Account', items:[
    { href:'settings', label:'Settings', icon:Settings },
  ]},
]
const ADMIN_NAV = [
  { href:'customization', label:'Customization', icon:Sparkles },
  { href:'landing-builder', label:'Landing Builder', icon:Globe },
  { href:'pricing-editor', label:'Pricing Editor', icon:DollarSign },
]

export function Sidebar({ locale, userRole, onClose }:{ locale:string; userRole?:string; onClose?:()=>void }) {
  const pathname = usePathname()
  const isActive = (href:string) => pathname?.includes('/'+href)
  const to = (href:string) => '/'+locale+'/'+href

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
      {/* Logo row */}
      <div style={{padding:'16px 14px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)',flexShrink:0}}>
        <Link href={to('dashboard')} onClick={onClose} style={{display:'flex',alignItems:'center',gap:9,textDecoration:'none'}}>
          <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,var(--pink),#b0124e)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(237,25,102,0.35)',flexShrink:0}}>
            <Zap size={14} color="#fff" strokeWidth={2.5}/>
          </div>
          <span style={{fontWeight:900,fontSize:18,color:'var(--text)',letterSpacing:-0.5,fontFamily:'var(--font-display)'}}>JUT</span>
        </Link>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:8,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-3)'}}>
          <X size={15}/>
        </button>
      </div>

      {/* Nav */}
      <nav style={{flex:1,overflowY:'auto',padding:'8px 8px',WebkitOverflowScrolling:'touch'}}>
        {NAV.map(group=>(
          <div key={group.group} style={{marginBottom:4}}>
            <div style={{fontSize:9,fontWeight:700,color:'var(--text-4)',letterSpacing:0.8,textTransform:'uppercase',padding:'6px 10px 3px'}}>{group.group}</div>
            {group.items.map(item=>{
              const active = isActive(item.href)
              return(
                <Link key={item.href} href={to(item.href)} onClick={onClose} style={{display:'flex',alignItems:'center',gap:9,padding:'10px 10px',borderRadius:10,fontSize:14,fontWeight:active?600:400,color:active?'var(--text)':'var(--text-3)',textDecoration:'none',transition:'all 0.15s',background:active?'rgba(237,25,102,0.08)':'transparent',borderLeft:'2px solid '+(active?'var(--pink)':'transparent'),marginBottom:2}}>
                  <item.icon size={16} strokeWidth={active?2.2:1.8} color={active?'var(--pink)':'var(--text-3)'}/>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
        {true&&(
          <div style={{marginBottom:4}}>
            <div style={{fontSize:9,fontWeight:700,color:'var(--gold)',letterSpacing:0.8,textTransform:'uppercase',padding:'6px 10px 3px',display:'flex',alignItems:'center',gap:4}}>
              <Crown size={8} color="var(--gold)"/> Admin
            </div>
            {ADMIN_NAV.map(item=>{
              const active = isActive(item.href)
              return(
                <Link key={item.href} href={to(item.href)} onClick={onClose} style={{display:'flex',alignItems:'center',gap:9,padding:'10px 10px',borderRadius:10,fontSize:14,fontWeight:active?600:400,color:active?'var(--gold-light)':'var(--text-3)',textDecoration:'none',transition:'all 0.15s',background:active?'rgba(201,168,76,0.07)':'transparent',borderLeft:'2px solid '+(active?'var(--gold)':'transparent'),marginBottom:2}}>
                  <item.icon size={16} strokeWidth={1.8} color={active?'var(--gold)':'var(--text-3)'}/>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Upgrade CTA */}
      <div style={{padding:10,borderTop:'1px solid var(--border)',flexShrink:0}}>
        <Link href={to('pricing')} onClick={onClose} style={{display:'block',padding:'11px 13px',borderRadius:12,background:'linear-gradient(135deg,rgba(237,25,102,0.1),rgba(33,82,164,0.08))',border:'1px solid rgba(237,25,102,0.15)',textDecoration:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
            <Crown size={12} color="var(--gold)"/>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text-2)'}}>Upgrade to Elite</span>
          </div>
          <div style={{fontSize:11,color:'var(--text-4)'}}>Unlimited automations and AI</div>
        </Link>
      </div>
    </div>
  )
}