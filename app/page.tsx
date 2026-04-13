import Link from 'next/link'
import { Zap, Bot, BarChart3, MessageSquare, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{background:'#0d0d14',color:'#f0f0ff',fontFamily:'system-ui,sans-serif',minHeight:'100vh'}}>
      {/* Nav */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,background:'rgba(13,13,20,0.95)',backdropFilter:'blur(20px)',zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'#ED1966',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{fontWeight:800,fontSize:20,letterSpacing:-0.5}}>JUT</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link href="/en/login" style={{padding:'8px 18px',borderRadius:10,fontSize:14,fontWeight:600,color:'rgba(240,240,255,0.7)',textDecoration:'none'}}>Sign in</Link>
          <Link href="/en/signup" style={{padding:'8px 18px',borderRadius:10,fontSize:14,fontWeight:700,background:'#ED1966',color:'#fff',textDecoration:'none'}}>Start free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{textAlign:'center',padding:'100px 24px 80px',maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:999,border:'1px solid rgba(237,25,102,0.3)',background:'rgba(237,25,102,0.08)',marginBottom:32,fontSize:13,color:'#ED1966',fontWeight:600}}>
          <Zap size={13} /> AI-powered business automation
        </div>
        <h1 style={{fontSize:'clamp(42px,7vw,80px)',fontWeight:900,lineHeight:1.05,letterSpacing:-2,marginBottom:24}}>
          Automate your business<br/>
          <span style={{background:'linear-gradient(135deg,#ED1966,#2152A4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>with AI agents</span>
        </h1>
        <p style={{fontSize:20,color:'rgba(240,240,255,0.55)',maxWidth:560,margin:'0 auto 40px',lineHeight:1.6}}>
          JUT connects your Instagram, WhatsApp and more — automating responses, qualifying leads, and closing sales while you sleep.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/en/signup" style={{padding:'14px 32px',borderRadius:14,fontSize:16,fontWeight:700,background:'#ED1966',color:'#fff',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}>
            Get started free <ArrowRight size={16} />
          </Link>
          <Link href="/en/login" style={{padding:'14px 32px',borderRadius:14,fontSize:16,fontWeight:600,background:'rgba(255,255,255,0.06)',color:'rgba(240,240,255,0.8)',textDecoration:'none',border:'1px solid rgba(255,255,255,0.1)'}}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'0 24px 100px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {[
            {icon:Bot,color:'#ED1966',title:'AI Agent',desc:'Configure your AI agent personality, tone, and knowledge base. Responds to customers 24/7 automatically.'},
            {icon:MessageSquare,color:'#2152A4',title:'Multi-channel',desc:'Instagram DMs, comments, WhatsApp. One platform to rule all your conversations.'},
            {icon:Zap,color:'#f59e0b',title:'Automations',desc:'Visual automation builder. Trigger flows from Instagram comments, DMs, or schedule them.'},
            {icon:BarChart3,color:'#22c55e',title:'Analytics',desc:'Track leads, conversion rates, revenue, and automation performance in real time.'},
          ].map(({icon:Icon,color,title,desc}) => (
            <div key={title} style={{padding:28,borderRadius:20,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{width:44,height:44,borderRadius:12,background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,border:'1px solid '+color+'30'}}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:14,color:'rgba(240,240,255,0.5)',lineHeight:1.6}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{maxWidth:1000,margin:'0 auto',padding:'0 24px 120px',textAlign:'center'}}>
        <h2 style={{fontSize:40,fontWeight:800,marginBottom:12,letterSpacing:-1}}>Simple pricing</h2>
        <p style={{color:'rgba(240,240,255,0.5)',marginBottom:48,fontSize:17}}>Start free, upgrade when you grow</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,textAlign:'left'}}>
          {[
            {name:'Free',price:'$0',period:'/month',features:['1 automation','100 conversations/mo','Basic analytics','AI responses'],cta:'Start free',highlight:false},
            {name:'Growth',price:'$79',period:'/month',features:['20 automations','5,000 conversations/mo','AI agent config','Creative AI','Priority support'],cta:'Get Growth',highlight:true},
            {name:'Elite',price:'$199',period:'/month',features:['Unlimited automations','Unlimited conversations','Custom AI model','White-label','Dedicated support'],cta:'Get Elite',highlight:false},
          ].map(plan => (
            <div key={plan.name} style={{padding:28,borderRadius:20,background:plan.highlight?'rgba(237,25,102,0.08)':'rgba(255,255,255,0.03)',border:'2px solid '+(plan.highlight?'#ED1966':'rgba(255,255,255,0.08)')}}>
              {plan.highlight && <div style={{fontSize:12,fontWeight:700,color:'#ED1966',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Most popular</div>}
              <div style={{fontSize:32,fontWeight:800,marginBottom:4}}>{plan.price}<span style={{fontSize:14,fontWeight:400,color:'rgba(240,240,255,0.4)'}}>{plan.period}</span></div>
              <div style={{fontSize:18,fontWeight:700,marginBottom:20}}>{plan.name}</div>
              <div style={{marginBottom:24,display:'flex',flexDirection:'column',gap:10}}>
                {plan.features.map(f => (
                  <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:'rgba(240,240,255,0.7)'}}>
                    <Check size={14} color="#22c55e" />{f}
                  </div>
                ))}
              </div>
              <Link href="/en/signup" style={{display:'block',textAlign:'center',padding:'12px',borderRadius:12,fontWeight:700,fontSize:14,background:plan.highlight?'#ED1966':'rgba(255,255,255,0.08)',color:plan.highlight?'#fff':'rgba(240,240,255,0.8)',textDecoration:'none'}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'32px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:'#ED1966',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{fontWeight:700,fontSize:15}}>JUT</span>
        </div>
        <p style={{fontSize:13,color:'rgba(240,240,255,0.3)'}}>© 2026 JUT. All rights reserved.</p>
      </footer>
    </div>
  )
}
