import Link from 'next/link'
import { Zap, Bot, BarChart3, MessageSquare, ArrowRight, Check, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const features = [
    { icon: Bot, color: '#ED1966', title: 'AI Agent', desc: 'Configure your AI to respond to customers 24/7 with your tone, knowledge, and offers.' },
    { icon: MessageSquare, color: '#2152A4', title: 'Multi-channel', desc: 'Instagram DMs, comments, WhatsApp. One platform for all your conversations.' },
    { icon: Zap, color: '#f59e0b', title: 'Automations', desc: 'Trigger workflows from Instagram comments or DMs. Qualify leads automatically.' },
    { icon: BarChart3, color: '#22c55e', title: 'Analytics', desc: 'Track leads, revenue, conversion rates and automation performance in real time.' },
    { icon: Sparkles, color: '#8b5cf6', title: 'Creative AI', desc: 'Analyze your marketing creatives with AI. Get scores, heatmaps and recommendations.' },
    { icon: Zap, color: '#06b6d4', title: 'Sales CRM', desc: 'Built-in CRM to manage leads, conversations, orders and products in one place.' },
  ]
  const plans = [
    { name: 'Free', price: '$0', period: '/month', features: ['1 automation', '100 conversations/mo', 'Basic analytics', 'AI responses'], cta: 'Start free', highlight: false },
    { name: 'Growth', price: '$79', period: '/month', features: ['20 automations', '5,000 conversations/mo', 'AI agent config', 'Creative AI', 'Priority support'], cta: 'Get Growth', highlight: true },
    { name: 'Elite', price: '$199', period: '/month', features: ['Unlimited automations', 'Unlimited conversations', 'Custom AI training', 'White-label', 'Dedicated account manager'], cta: 'Get Elite', highlight: false },
  ]

  const s: React.CSSProperties & Record<string, string> = {} as any
  const bg = '#0d0d14', surf = '#13131f', border = 'rgba(255,255,255,0.08)', text = '#f0f0ff', sub = 'rgba(240,240,255,0.5)', pink = '#ED1966'

  return (
    <div style={{ background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 40px', borderBottom:'1px solid '+border, position:'sticky', top:0, background:'rgba(13,13,20,0.96)', backdropFilter:'blur(20px)', zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:pink, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:20, letterSpacing:-0.5 }}>JUT</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link href="/en/login" style={{ padding:'8px 18px', borderRadius:10, fontSize:14, fontWeight:600, color:'rgba(240,240,255,0.65)', textDecoration:'none' }}>Sign in</Link>
          <Link href="/en/signup" style={{ padding:'9px 20px', borderRadius:10, fontSize:14, fontWeight:700, background:pink, color:'#fff', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign:'center', padding:'110px 24px 90px', maxWidth:820, margin:'0 auto' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:999, border:'1px solid rgba(237,25,102,0.35)', background:'rgba(237,25,102,0.08)', marginBottom:28, fontSize:13, color:pink, fontWeight:600 }}>
          <Sparkles size={13} /> AI-powered business automation
        </div>
        <h1 style={{ fontSize:'clamp(40px,7vw,76px)', fontWeight:900, lineHeight:1.05, letterSpacing:-2, marginBottom:22 }}>
          Automate your business<br />
          <span style={{ background:'linear-gradient(135deg,#ED1966,#2152A4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            with AI agents
          </span>
        </h1>
        <p style={{ fontSize:19, color:sub, maxWidth:540, margin:'0 auto 40px', lineHeight:1.65 }}>
          Connect Instagram and WhatsApp. Let JUT respond, qualify leads, and close sales — automatically, 24/7.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/en/signup" style={{ padding:'14px 32px', borderRadius:14, fontSize:16, fontWeight:700, background:pink, color:'#fff', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 0 40px rgba(237,25,102,0.35)' }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/en/login" style={{ padding:'14px 32px', borderRadius:14, fontSize:16, fontWeight:600, background:'rgba(255,255,255,0.06)', color:'rgba(240,240,255,0.8)', textDecoration:'none', border:'1px solid '+border }}>
            Sign in
          </Link>
        </div>
        <p style={{ marginTop:20, fontSize:13, color:'rgba(240,240,255,0.3)' }}>No credit card required · Free plan forever</p>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 100px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:-1, marginBottom:10 }}>Everything you need to grow</h2>
          <p style={{ color:sub, fontSize:17 }}>One platform for all your sales and marketing automation</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:18 }}>
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} style={{ padding:28, borderRadius:20, background:surf, border:'1px solid '+border, transition:'border-color 0.2s' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, border:'1px solid '+color+'30' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:14, color:sub, lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth:1000, margin:'0 auto', padding:'0 24px 120px', textAlign:'center' }}>
        <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:-1, marginBottom:10 }}>Simple, transparent pricing</h2>
        <p style={{ color:sub, marginBottom:48, fontSize:17 }}>Start free. Upgrade as you grow.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:16, textAlign:'left' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{ padding:28, borderRadius:22, background:plan.highlight?'rgba(237,25,102,0.06)':surf, border:'2px solid '+(plan.highlight?pink:border), position:'relative' }}>
              {plan.highlight && (
                <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:pink, color:'#fff', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:999, letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap' }}>
                  Most popular
                </div>
              )}
              <div style={{ fontSize:34, fontWeight:900, marginBottom:4, letterSpacing:-1 }}>
                {plan.price}
                <span style={{ fontSize:14, fontWeight:400, color:sub }}>{plan.period}</span>
              </div>
              <div style={{ fontSize:19, fontWeight:700, marginBottom:20 }}>{plan.name}</div>
              <div style={{ marginBottom:28, display:'flex', flexDirection:'column', gap:10 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:9, fontSize:14, color:'rgba(240,240,255,0.75)' }}>
                    <Check size={14} color="#22c55e" strokeWidth={2.5} />{f}
                  </div>
                ))}
              </div>
              <Link href="/en/signup" style={{ display:'block', textAlign:'center', padding:'13px', borderRadius:13, fontWeight:700, fontSize:15, background:plan.highlight?pink:'rgba(255,255,255,0.07)', color:plan.highlight?'#fff':'rgba(240,240,255,0.8)', textDecoration:'none', border:plan.highlight?'none':'1px solid '+border }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin:'0 24px 100px', borderRadius:24, background:'linear-gradient(135deg,rgba(237,25,102,0.15),rgba(33,82,164,0.15))', border:'1px solid rgba(237,25,102,0.2)', padding:'60px 40px', textAlign:'center', maxWidth:900, marginLeft:'auto', marginRight:'auto' }}>
        <h2 style={{ fontSize:36, fontWeight:800, marginBottom:14, letterSpacing:-1 }}>Ready to automate your business?</h2>
        <p style={{ color:sub, fontSize:17, marginBottom:32 }}>Join thousands of businesses using JUT to grow faster.</p>
        <Link href="/en/signup" style={{ padding:'14px 36px', borderRadius:14, fontSize:16, fontWeight:700, background:pink, color:'#fff', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 0 40px rgba(237,25,102,0.4)' }}>
          Get started free <ArrowRight size={16} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid '+border, padding:'32px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:pink, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontWeight:700, fontSize:15 }}>JUT</span>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          <Link href="/en/login" style={{ fontSize:13, color:sub, textDecoration:'none' }}>Sign in</Link>
          <Link href="/en/signup" style={{ fontSize:13, color:sub, textDecoration:'none' }}>Sign up</Link>
        </div>
        <p style={{ fontSize:13, color:'rgba(240,240,255,0.25)' }}>© 2026 JUT. All rights reserved.</p>
      </footer>
    </div>
  )
}
