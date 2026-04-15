'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, MessageSquare, Zap, BarChart3,
  Settings, Share2, ShoppingBag, Bot, Sparkles, HelpCircle,
  Shield, ChevronRight, Crown
} from 'lucide-react'

const NAV = [
  { group: 'Main', items: [
    { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: 'leads', label: 'Leads', icon: Users },
    { href: 'conversations', label: 'Conversations', icon: MessageSquare },
  ]},
  { group: 'Automation', items: [
    { href: 'automations', label: 'Automations', icon: Zap },
    { href: 'social', label: 'Social Networks', icon: Share2 },
    { href: 'agent', label: 'AI Agent', icon: Bot },
  ]},
  { group: 'Business', items: [
    { href: 'sales', label: 'Sales', icon: ShoppingBag },
    { href: 'analytics', label: 'Analytics', icon: BarChart3 },
    { href: 'creative', label: 'Creative AI', icon: Sparkles },
    { href: 'pricing', label: 'Pricing', icon: Star },
  ]},
  { group: 'Account', items: [
    { href: 'settings', label: 'Settings', icon: Settings },
    { href: 'help', label: 'Help', icon: HelpCircle },
  ]},
]

const ADMIN_NAV = [
  { href: 'admin', label: 'Admin Panel', icon: Shield },
  { href: 'customization', label: 'Customization', icon: Sparkles },
  { href: 'landing-builder', label: 'Landing Builder', icon: LayoutDashboard },
]

interface SidebarProps { locale: string; userRole?: string }

export function Sidebar({ locale, userRole }: SidebarProps) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname.includes('/' + href)
  const navLink = (href: string) => '/' + locale + '/' + href

  return (
    <aside style={{
      width: 240, height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 40,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Subtle gradient top */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:200,background:'radial-gradient(ellipse at 50% 0%, rgba(237,25,102,0.06) 0%, transparent 70%)',pointerEvents:'none'}}/>

      {/* Logo */}
      <div style={{padding:'24px 20px 16px',position:'relative'}}>
        <Link href={navLink('dashboard')} style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'linear-gradient(135deg, var(--pink), #b0124e)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(237,25,102,0.35)',
            flexShrink:0,
          }}>
            <Zap size={16} color="#fff" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color:'var(--text)',letterSpacing:-0.5,lineHeight:1}}>JUT</div>
            <div style={{fontSize:10,color:'var(--text-4)',letterSpacing:0.5,fontWeight:500}}>AI PLATFORM</div>
          </div>
        </Link>
      </div>

      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,var(--border-2),transparent)',margin:'0 16px'}}/>

      {/* Nav */}
      <nav style={{flex:1,overflowY:'auto',padding:'12px 12px',display:'flex',flexDirection:'column',gap:4}}>
        {NAV.map(group => (
          <div key={group.group} style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',letterSpacing:0.8,textTransform:'uppercase',padding:'4px 10px',marginBottom:4}}>{group.group}</div>
            {group.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={navLink(item.href)} style={{
                  display:'flex', alignItems:'center', gap:9, padding:'9px 10px',
                  borderRadius:10, fontSize:13.5, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text)' : 'var(--text-3)',
                  textDecoration:'none', transition:'all 0.15s',
                  background: active ? 'rgba(237,25,102,0.08)' : 'transparent',
                  border: '1px solid ' + (active ? 'rgba(237,25,102,0.12)' : 'transparent'),
                  position:'relative', marginBottom:1,
                }}>
                  {active && <div style={{position:'absolute',left:0,top:'20%',bottom:'20%',width:2,background:'var(--pink)',borderRadius:2}}/>}
                  <item.icon size={15} strokeWidth={active?2.2:1.8} color={active?'var(--pink)':'var(--text-3)'}/>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}

        {/* Admin section */}
        {(userRole === 'owner' || userRole === 'admin') && (
          <div style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',letterSpacing:0.8,textTransform:'uppercase',padding:'4px 10px',marginBottom:4,display:'flex',alignItems:'center',gap:5}}>
              <Crown size={9} color="var(--gold)"/> Admin
            </div>
            {ADMIN_NAV.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={navLink(item.href)} style={{
                  display:'flex', alignItems:'center', gap:9, padding:'9px 10px',
                  borderRadius:10, fontSize:13.5, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--gold-light)' : 'var(--text-3)',
                  textDecoration:'none', transition:'all 0.15s',
                  background: active ? 'rgba(201,168,76,0.07)' : 'transparent',
                  border: '1px solid ' + (active ? 'rgba(201,168,76,0.15)' : 'transparent'),
                  marginBottom:1,
                }}>
                  <item.icon size={15} strokeWidth={1.8} color={active?'var(--gold)':'var(--text-3)'}/>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Upgrade CTA */}
      <div style={{padding:12,borderTop:'1px solid var(--border)'}}>
        <div style={{
          padding:'14px 14px', borderRadius:12,
          background:'linear-gradient(135deg, rgba(237,25,102,0.1), rgba(33,82,164,0.08))',
          border:'1px solid rgba(237,25,102,0.15)',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
            <Crown size={13} color="var(--gold)"/>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text-2)'}}>Upgrade to Elite</span>
          </div>
          <p style={{fontSize:11,color:'var(--text-4)',lineHeight:1.5,marginBottom:8}}>Unlimited automations, custom AI & white-label</p>
          <button style={{width:'100%',padding:'7px',borderRadius:8,background:'var(--pink)',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
            Upgrade <ChevronRight size={11}/>
          </button>
        </div>
      </div>
    </aside>
  )
}