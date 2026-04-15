'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, MessageSquare, Zap, BarChart3,
  Settings, Share2, ShoppingBag, Bot, Sparkles, HelpCircle,
  Shield, ChevronRight, Crown, Star, X, Menu, DollarSign
} from 'lucide-react'
import { useState, useEffect } from 'react'

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
  ]},
  { group:'Business', items:[
    { href:'sales', label:'Sales', icon:ShoppingBag },
    { href:'analytics', label:'Analytics', icon:BarChart3 },
    { href:'creative', label:'Creative AI', icon:Sparkles },
    { href:'pricing', label:'Pricing', icon:DollarSign },
  ]},
  { group:'Account', items:[
    { href:'settings', label:'Settings', icon:Settings },
    { href:'help', label:'Help', icon:HelpCircle },
  ]},
]

const ADMIN_NAV = [
  { href:'admin', label:'Admin Panel', icon:Shield },
  { href:'customization', label:'Customization', icon:Sparkles },
  { href:'landing-builder', label:'Landing Builder', icon:LayoutDashboard },
]

interface SidebarProps { locale:string; userRole?:string; mobileOpen?:boolean; onClose?:()=>void }

export function Sidebar({ locale, userRole, mobileOpen=false, onClose }:SidebarProps) {
  const pathname = usePathname()
  const isActive = (href:string) => pathname.includes('/'+href)
  const navLink = (href:string) => '/'+locale+'/'+href

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay open" onClick={onClose}/>}

      <aside className={'dashboard-sidebar'+(mobileOpen?' open':'')} style={{
        height:'100vh', position:'fixed', left:0, top:0, zIndex:100,
        background:'var(--bg-2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', overflow:'hidden', width:240,
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:180,background:'radial-gradient(ellipse at 50% 0%,rgba(237,25,102,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

        {/* Logo */}
        <div style={{padding:'20px 16px 14px',position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link href={navLink('dashboard')} style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
            <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,var(--pink),#b0124e)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(237,25,102,0.35)',flexShrink:0}}>
              <Zap size={15} color="#fff" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:17,color:'var(--text)',letterSpacing:-0.5,lineHeight:1}}>JUT</div>
              <div style={{fontSize:9,color:'var(--text-4)',letterSpacing:0.5,fontWeight:500}}>AI PLATFORM</div>
            </div>
          </Link>
          {/* Mobile close */}
          <button onClick={onClose} style={{display:'none',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:4}} className="hide-desktop" aria-label="Close menu">
            <X size={18}/>
          </button>
        </div>

        <div style={{height:1,background:'linear-gradient(90deg,transparent,var(--border-2),transparent)',margin:'0 14px'}}/>

        <nav style={{flex:1,overflowY:'auto',padding:'10px 10px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(group=>(
            <div key={group.group} style={{marginBottom:6}}>
              <div style={{fontSize:9,fontWeight:700,color:'var(--text-4)',letterSpacing:0.8,textTransform:'uppercase',padding:'4px 10px',marginBottom:2}}>{group.group}</div>
              {group.items.map(item=>{
                const active=isActive(item.href)
                return(
                  <Link key={item.href} href={navLink(item.href)} onClick={onClose} style={{
                    display:'flex',alignItems:'center',gap:9,padding:'9px 10px',
                    borderRadius:10,fontSize:13.5,fontWeight:active?600:400,
                    color:active?'var(--text)':'var(--text-3)',textDecoration:'none',
                    transition:'all 0.15s',
                    background:active?'rgba(237,25,102,0.08)':'transparent',
                    border:'1px solid '+(active?'rgba(237,25,102,0.12)':'transparent'),
                    position:'relative',marginBottom:1,
                  }}>
                    {active&&<div style={{position:'absolute',left:0,top:'20%',bottom:'20%',width:2,background:'var(--pink)',borderRadius:2}}/>}
                    <item.icon size={15} strokeWidth={active?2.2:1.8} color={active?'var(--pink)':'var(--text-3)'}/>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}

          {true&&(
            <div style={{marginBottom:6}}>
              <div style={{fontSize:9,fontWeight:700,color:'var(--text-4)',letterSpacing:0.8,textTransform:'uppercase',padding:'4px 10px',marginBottom:2,display:'flex',alignItems:'center',gap:4}}>
                <Crown size={8} color="var(--gold)"/> Admin
              </div>
              {ADMIN_NAV.map(item=>{
                const active=isActive(item.href)
                return(
                  <Link key={item.href} href={navLink(item.href)} onClick={onClose} style={{
                    display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:10,
                    fontSize:13.5,fontWeight:active?600:400,
                    color:active?'var(--gold-light)':'var(--text-3)',textDecoration:'none',
                    transition:'all 0.15s',
                    background:active?'rgba(201,168,76,0.07)':'transparent',
                    border:'1px solid '+(active?'rgba(201,168,76,0.15)':'transparent'),
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

        <div style={{padding:10,borderTop:'1px solid var(--border)'}}>
          <Link href={navLink('pricing')} onClick={onClose} style={{
            display:'block',padding:'12px 14px',borderRadius:12,
            background:'linear-gradient(135deg,rgba(237,25,102,0.1),rgba(33,82,164,0.08))',
            border:'1px solid rgba(237,25,102,0.15)',textDecoration:'none',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
              <Crown size={12} color="var(--gold)"/>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text-2)'}}>Upgrade to Elite</span>
            </div>
            <p style={{fontSize:11,color:'var(--text-4)',lineHeight:1.4,marginBottom:7}}>Unlimited automations, custom AI</p>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,fontWeight:700,color:'var(--pink)'}}>
              View plans <ChevronRight size={11}/>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
