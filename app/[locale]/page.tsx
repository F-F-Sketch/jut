import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getConfig() {
  try {
    const { data } = await sb.from('landing_config').select('config').eq('id', '00000000-0000-0000-0000-000000000001').single()
    if (data?.config && Object.keys(data.config).length > 0) return data.config
  } catch(e) {}
  return {
    hero: {
      headline: 'Automate Every Conversation.',
      subheadline: 'JUT connects to Instagram, WhatsApp and more — capturing leads and closing deals while you sleep.',
      cta_primary: 'Get Started Free',
      cta_secondary: 'See how it works',
      bg_color: '#050508',
    },
    features: {
      title: 'Everything you need to automate',
      items: [
        { icon: '🤖', title: 'AI Agent', desc: '24/7 automated responses that sound 100% human' },
        { icon: '⚡', title: 'Automations', desc: 'Set triggers, fire flows instantly' },
        { icon: '📊', title: 'Analytics', desc: 'Real-time insights on every conversation' },
        { icon: '🎨', title: 'Creative AI', desc: 'Score and improve your marketing creatives' },
      ]
    },
    stats: { items: [{ value:'<3s', label:'Response time' },{ value:'24/7', label:'Always on' },{ value:'2x', label:'Conversion uplift' },{ value:'inf', label:'Conversations' }] },
    cta: { title: 'Ready to automate?', subtitle: 'Start free. Scale fast.', button: 'Get Started Free' },
    colors: { primary: '#ED1966', text: '#f0f0fc', bg: '#050508' },
    fonts: { headline: 'Syne', body: 'DM Sans' },
    navbar: { logo: 'JUT', links: ['Features', 'Pricing'] },
  }
}

export default async function Page({ params }: { params: { locale: string } }) {
  const { locale } = params
  const config = await getConfig()
  const primary = config.colors?.primary || '#ED1966'
  const bg = config.colors?.bg || '#050508'
  const textColor = config.colors?.text || '#f0f0fc'
  const headlineFont = config.fonts?.headline || 'Syne'
  const bodyFont = config.fonts?.body || 'DM Sans'

  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href={`https://fonts.googleapis.com/css2?family=${headlineFont.replace(' ','+')}:wght@700;800;900&family=${bodyFont.replace(' ','+')}:wght@300;400;500&display=swap`} rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          a{color:inherit;text-decoration:none}
          ::-webkit-scrollbar{width:3px}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}
        `}</style>
      </head>
      <body style={{ background: bg, color: textColor, fontFamily: bodyFont + ', system-ui, sans-serif', overflowX: 'hidden' }}>

        {/* NAVBAR */}
        <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 5vw',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(5,5,8,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <a href={'/' + locale} style={{ fontFamily:headlineFont+', system-ui',fontWeight:900,fontSize:22,color:textColor,letterSpacing:-0.5 }}>
            {config.navbar?.logo || 'JUT'}
          </a>
          <div style={{ display:'flex',gap:28,alignItems:'center' }}>
            {(config.navbar?.links || ['Features','Pricing']).map((l: string) => (
              <a key={l} href={'/' + locale + '/' + l.toLowerCase()} style={{ fontSize:14,color:'rgba(255,255,255,0.5)',fontWeight:500 }}>{l}</a>
            ))}
            <a href={'/' + locale + '/login'} style={{ fontSize:14,color:'rgba(255,255,255,0.55)',fontWeight:500 }}>Log in</a>
            <a href={'/' + locale + '/signup'} style={{ padding:'9px 20px',borderRadius:10,background:primary,color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 4px 20px '+primary+'45' }}>
              Get Started
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 5vw 80px',position:'relative',overflow:'hidden',background:config.hero?.bg_color||bg }}>
          <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:'60vw',height:'60vw',maxWidth:800,borderRadius:'50%',background:'radial-gradient(circle, '+primary+'12 0%, transparent 65%)',pointerEvents:'none' }}/>
          <div style={{ position:'relative',maxWidth:860 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'5px 14px',borderRadius:999,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',marginBottom:28 }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 8px rgba(34,197,94,0.6)' }}/>
              <span style={{ fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.6)',letterSpacing:0.4 }}>Now live — try it free</span>
            </div>
            <h1 style={{ fontFamily:headlineFont+', system-ui',fontSize:'clamp(42px,7vw,82px)',fontWeight:900,lineHeight:1.0,letterSpacing:-3,marginBottom:24,color:textColor }}>
              {config.hero?.headline}
            </h1>
            <p style={{ fontSize:'clamp(16px,2vw,20px)',color:'rgba(255,255,255,0.5)',maxWidth:580,margin:'0 auto 44px',lineHeight:1.65 }}>
              {config.hero?.subheadline}
            </p>
            <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
              <a href={'/' + locale + '/signup'} style={{ padding:'16px 36px',borderRadius:13,background:primary,color:'#fff',fontSize:16,fontWeight:700,boxShadow:'0 6px 30px '+primary+'50',display:'inline-block' }}>
                {config.hero?.cta_primary || 'Get Started Free'}
              </a>
              {config.hero?.cta_secondary && (
                <a href="#features" style={{ padding:'16px 32px',borderRadius:13,background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.8)',fontSize:16,fontWeight:600,border:'1px solid rgba(255,255,255,0.1)',display:'inline-block' }}>
                  {config.hero?.cta_secondary}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* STATS */}
        {config.stats?.items && (
          <section style={{ padding:'60px 5vw',background:'rgba(255,255,255,0.02)',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:32 }}>
              {config.stats.items.map((s: any, i: number) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:headlineFont+', system-ui',fontSize:'clamp(40px,5vw,58px)',fontWeight:900,color:textColor,letterSpacing:-2,lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:14,color:'rgba(255,255,255,0.4)',marginTop:8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEATURES */}
        <section id="features" style={{ padding:'100px 5vw' }}>
          <div style={{ maxWidth:1100,margin:'0 auto' }}>
            <h2 style={{ fontFamily:headlineFont+', system-ui',fontSize:'clamp(32px,4vw,50px)',fontWeight:900,textAlign:'center',marginBottom:60,letterSpacing:-1.5,lineHeight:1.1 }}>
              {config.features?.title}
            </h2>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20 }}>
              {(config.features?.items || []).map((f: any, i: number) => (
                <div key={i} style={{ padding:28,borderRadius:20,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize:36,marginBottom:16 }}>{f.icon}</div>
                  <div style={{ fontFamily:headlineFont+', system-ui',fontSize:20,fontWeight:700,color:textColor,marginBottom:10 }}>{f.title}</div>
                  <div style={{ fontSize:14,color:'rgba(255,255,255,0.45)',lineHeight:1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:'100px 5vw',textAlign:'center',background:'radial-gradient(ellipse at center, '+primary+'08 0%, transparent 70%)' }}>
          <div style={{ maxWidth:600,margin:'0 auto' }}>
            <h2 style={{ fontFamily:headlineFont+', system-ui',fontSize:'clamp(36px,5vw,58px)',fontWeight:900,letterSpacing:-2,marginBottom:16,lineHeight:1.05 }}>
              {config.cta?.title}
            </h2>
            <p style={{ fontSize:18,color:'rgba(255,255,255,0.45)',marginBottom:36 }}>{config.cta?.subtitle}</p>
            <a href={'/' + locale + '/signup'} style={{ padding:'18px 48px',borderRadius:14,background:primary,color:'#fff',fontSize:18,fontWeight:700,display:'inline-block',boxShadow:'0 8px 40px '+primary+'50' }}>
              {config.cta?.button || 'Get Started Free'}
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding:'40px 5vw',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
          <span style={{ fontFamily:headlineFont+', system-ui',fontWeight:800,fontSize:18,color:textColor }}>JUT</span>
          <span style={{ fontSize:13,color:'rgba(255,255,255,0.25)' }}>© 2026 JUT Platform. Made in 🇨🇴 Colombia.</span>
          <div style={{ display:'flex',gap:20 }}>
            {['Privacy','Terms'].map(l => <a key={l} href={'/' + locale + '/' + l.toLowerCase()} style={{ fontSize:13,color:'rgba(255,255,255,0.3)' }}>{l}</a>)}
          </div>
        </footer>

      </body>
    </html>
  )
}