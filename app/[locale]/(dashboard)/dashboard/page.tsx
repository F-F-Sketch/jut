'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, MessageSquare, Zap, DollarSign, ArrowRight, TrendingUp, Activity, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { FadeUp, StaggerChildren, CountUp, ScaleIn } from '@/components/ui/Animate'

export default function DashboardPage({ params }:{ params:{ locale:string } }) {
  const { locale } = params
  const [stats,setStats]=useState({leads:0,conversations:0,automations:0})
  const [loading,setLoading]=useState(true)
  const [hovered,setHovered]=useState<number|null>(null)
  const [tilt,setTilt]=useState({x:0,y:0,idx:-1})
  const hour=new Date().getHours()
  const supabase=createClient()

  useEffect(()=>{
    (async()=>{
      const{data:{user}}=await supabase.auth.getUser(); if(!user) return
      const[a,b,c]=await Promise.all([
        supabase.from('leads').select('id',{count:'exact'}).eq('user_id',user.id),
        supabase.from('conversations').select('id',{count:'exact'}).eq('user_id',user.id),
        supabase.from('automations').select('id',{count:'exact'}).eq('user_id',user.id).eq('status','active'),
      ])
      setStats({leads:a.count||0,conversations:b.count||0,automations:c.count||0})
      setLoading(false)
    })()
  },[])

  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening'
  const STATS=[
    {label:'Total Leads',value:stats.leads,icon:Users,color:'#6366f1'},
    {label:'Conversations',value:stats.conversations,icon:MessageSquare,color:'#3b82f6'},
    {label:'Active Automations',value:stats.automations,icon:Zap,color:'var(--pink)'},
    {label:'Revenue',value:0,icon:DollarSign,color:'#22c55e',prefix:'$'},
  ]
  const ACTIONS=[
    {label:'New Automation',href:locale+'/automations',icon:Zap,color:'var(--pink)'},
    {label:'Add Lead',href:locale+'/leads',icon:Users,color:'#6366f1'},
    {label:'Analytics',href:locale+'/analytics',icon:TrendingUp,color:'#22c55e'},
    {label:'Creative AI',href:locale+'/creative',icon:Sparkles,color:'#8b5cf6'},
  ]

  const onMove=(e:React.MouseEvent,idx:number)=>{
    const r=e.currentTarget.getBoundingClientRect()
    setTilt({x:((e.clientX-r.left)/r.width-0.5)*14,y:((e.clientY-r.top)/r.height-0.5)*-14,idx})
  }

  return(
    <div style={{padding:'32px 32px 60px',maxWidth:1200}}>

      {/* Header */}
      <FadeUp>
        <div style={{marginBottom:36}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block',
              boxShadow:'0 0 12px rgba(34,197,94,0.7)',animation:'pulse-dot 2s ease infinite'}}/>
            <span style={{fontSize:11,color:'var(--text-4)',fontWeight:600,letterSpacing:0.8,textTransform:'uppercase'}}>System Active</span>
          </div>
          <h1 style={{fontSize:'clamp(26px,3vw,36px)',fontWeight:800,letterSpacing:-0.8,marginBottom:6}}>
            {greeting} 👋
          </h1>
          <p style={{fontSize:15,color:'var(--text-3)'}}>Here is your business overview.</p>
        </div>
      </FadeUp>

      {/* Stat cards with 3D tilt */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:28}}>
        {STATS.map((s,i)=>(
          <FadeUp key={s.label} delay={i*70}>
            <div
              onMouseEnter={()=>setHovered(i)}
              onMouseLeave={()=>{setHovered(null);setTilt({x:0,y:0,idx:-1})}}
              onMouseMove={e=>onMove(e,i)}
              style={{
                padding:24,borderRadius:20,
                background:'var(--surface)',
                border:'1px solid '+(hovered===i?'rgba(237,25,102,0.2)':'var(--border-2)'),
                position:'relative',overflow:'hidden',cursor:'default',
                transform:tilt.idx===i
                  ?'perspective(700px) rotateX('+tilt.y+'deg) rotateY('+tilt.x+'deg) translateY(-4px) scale(1.01)'
                  :'perspective(700px) rotateX(0) rotateY(0) translateY(0) scale(1)',
                transition:'transform 0.12s ease,border-color 0.2s,box-shadow 0.2s',
                boxShadow:hovered===i?'0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)':'none',
              }}>
              {/* Color blob */}
              <div style={{position:'absolute',top:-20,right:-20,width:90,height:90,borderRadius:'50%',
                background:s.color+'15',filter:'blur(20px)',pointerEvents:'none',
                opacity:hovered===i?1:0.3,transition:'opacity 0.3s'}}/>
              {/* Shimmer sweep */}
              {hovered===i&&<div style={{position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.025) 50%,transparent 65%)',pointerEvents:'none'}}/>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,position:'relative'}}>
                <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>{s.label}</span>
                <div style={{width:36,height:36,borderRadius:10,
                  background:hovered===i?s.color+'28':s.color+'15',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  border:'1px solid '+(hovered===i?s.color+'40':s.color+'20'),
                  transition:'background 0.2s,border-color 0.2s'}}>
                  <s.icon size={16} color={s.color} strokeWidth={2}/>
                </div>
              </div>
              <div style={{fontSize:38,fontWeight:800,letterSpacing:-1.5,lineHeight:1,position:'relative',fontFamily:'var(--font-display)'}}>
                {loading?'—':<CountUp to={s.value} prefix={s.prefix||''}/>}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Quick actions + status */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <FadeUp delay={300}>
          <div style={{padding:24,borderRadius:20,background:'var(--surface)',border:'1px solid var(--border-2)',height:'100%'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
              <Activity size={15} color="var(--pink)" strokeWidth={2}/>
              <span style={{fontSize:15,fontWeight:700}}>Quick Actions</span>
            </div>
            <StaggerChildren stagger={60}>
              {ACTIONS.map(a=>(
                <Link key={a.label} href={'/'+a.href} style={{
                  display:'flex',alignItems:'center',gap:12,padding:'11px 13px',
                  borderRadius:12,background:'var(--surface-2)',border:'1px solid var(--border)',
                  marginBottom:8,textDecoration:'none',
                  transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=a.color;el.style.background='var(--surface-3)';el.style.transform='translateX(3px)'}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor='';el.style.background='';el.style.transform=''}}>
                  <div style={{width:30,height:30,borderRadius:9,background:a.color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <a.icon size={13} color={a.color}/>
                  </div>
                  <span style={{fontSize:14,fontWeight:500,color:'var(--text-2)',flex:1}}>{a.label}</span>
                  <ArrowRight size={13} color="var(--text-4)"/>
                </Link>
              ))}
            </StaggerChildren>
          </div>
        </FadeUp>

        <FadeUp delay={380}>
          <div style={{
            padding:28,borderRadius:20,height:'100%',position:'relative',overflow:'hidden',
            background:'linear-gradient(135deg,rgba(237,25,102,0.07),rgba(33,82,164,0.07))',
            border:'1px solid rgba(237,25,102,0.18)',
          }}>
            <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',
              background:'rgba(237,25,102,0.06)',filter:'blur(40px)',pointerEvents:'none',
              animation:'float 4s ease-in-out infinite'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'pulse-dot 2s ease infinite'}}/>
                <span style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>JUT is ready to automate</span>
              </div>
              <p style={{fontSize:14,color:'var(--text-3)',lineHeight:1.65,marginBottom:22}}>
                Connect Instagram and create your first automation to start capturing leads automatically — 24/7.
              </p>
              <Link href={'/'+locale+'/automations'} className="btn-premium" style={{
                display:'inline-flex',alignItems:'center',gap:7,
                padding:'10px 20px',borderRadius:12,
                background:'var(--pink)',color:'#fff',
                fontSize:14,fontWeight:700,textDecoration:'none',
                boxShadow:'0 4px 24px rgba(237,25,102,0.35)',
                transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)',
              }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(-2px)';el.style.boxShadow='0 8px 36px rgba(237,25,102,0.5)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='';el.style.boxShadow='0 4px 24px rgba(237,25,102,0.35)'}}>
                <Zap size={14}/> View Automations
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>

    </div>
  )
}