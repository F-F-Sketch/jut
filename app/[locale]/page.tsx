import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface PageProps { params: { locale: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params
  return {
    title: locale === 'es' ? 'JUT — Automatiza Cada Conversación' : 'JUT — Automate Every Conversation',
    description: locale === 'es'
      ? 'Plataforma de operaciones comerciales con IA. Captura leads, automatiza conversaciones y cierra ventas en Instagram y más.'
      : 'AI-powered commercial operations platform. Capture leads, automate conversations, and close sales on Instagram and beyond.',
  }
}

const FLOW_STEPS = {
  en: [
    { n: '01', icon: '💬', title: 'Someone Comments', desc: 'A prospect comments on your reel, post, or story. JUT detects it instantly.' },
    { n: '02', icon: '🤖', title: 'JUT Responds', desc: 'Your AI sends a natural human-like DM, qualifies the lead, and answers questions — 24/7.' },
    { n: '03', icon: '💰', title: 'Leads Convert', desc: 'Captured leads land in your CRM. Deals close through your integrated sales flow.' },
  ],
  es: [
    { n: '01', icon: '💬', title: 'Alguien Comenta', desc: 'Un prospecto comenta en tu reel, post o historia. JUT lo detecta al instante.' },
    { n: '02', icon: '🤖', title: 'JUT Responde', desc: 'Tu IA envía un DM natural y humanizado, califica el lead y responde preguntas — 24/7.' },
    { n: '03', icon: '💰', title: 'Los Leads Convierten', desc: 'Los leads capturados llegan a tu CRM. Los negocios se cierran mediante tu flujo integrado.' },
  ],
}

const FEATURES = {
  en: [
    { icon: '🧠', title: 'AI Conversations', desc: 'Natural, brand-aware AI that chats like your best salesperson — 24/7 in any language.' },
    { icon: '⚡', title: 'Comment Triggers', desc: 'Keyword detection on Instagram posts, reels, and carousels that fires DM flows instantly.' },
    { icon: '👥', title: 'CRM & Leads', desc: 'Capture, qualify, and track every lead with full conversation history and activity timelines.' },
    { icon: '🔁', title: 'Automation Builder', desc: 'Design multi-step flows, branching logic, and conditional sequences in one visual builder.' },
    { icon: '🛒', title: 'Sales & POS', desc: 'Sell products, services, and packages directly inside the platform with full order management.' },
    { icon: '📊', title: 'Analytics', desc: 'Real-time data on automations, lead conversion, message engagement, and revenue attribution.' },
  ],
  es: [
    { icon: '🧠', title: 'Conversaciones con IA', desc: 'IA natural y consciente de tu marca que habla como tu mejor vendedor — 24/7 en cualquier idioma.' },
    { icon: '⚡', title: 'Triggers de Comentarios', desc: 'Detección por palabras clave en Instagram que dispara flujos de DM al instante.' },
    { icon: '👥', title: 'CRM y Leads', desc: 'Captura, califica y rastrea cada lead con historial completo de conversaciones.' },
    { icon: '🔁', title: 'Constructor de Flujos', desc: 'Diseña flujos de múltiples pasos, lógica condicional y secuencias — todo visual e intuitivo.' },
    { icon: '🛒', title: 'Ventas y POS', desc: 'Vende productos y servicios directamente desde la plataforma con gestión completa de pedidos.' },
    { icon: '📊', title: 'Analítica', desc: 'Datos en tiempo real sobre automatizaciones, conversión de leads y atribución de ingresos.' },
  ],
}

const WHY = {
  en: [
    { badge: 'Human-first', title: 'Conversations that feel real', desc: 'Every message is configured to match your brand voice and selling style. No robotic scripts.' },
    { badge: 'Revenue-driven', title: 'Built to close deals', desc: 'Every flow, trigger, and message is designed to move prospects toward a purchase decision.' },
    { badge: 'Omnichannel', title: 'Start on Instagram. Scale everywhere.', desc: 'Architected for every channel — Instagram, WhatsApp, Facebook, and beyond.' },
    { badge: 'Founder-grade', title: 'Designed for operators', desc: 'Enterprise-grade automation without enterprise-grade complexity. Built for real operators.' },
  ],
  es: [
    { badge: 'Primero humano', title: 'Conversaciones que se sienten reales', desc: 'Cada mensaje está configurado para coincidir con tu voz de marca. Sin guiones robóticos.' },
    { badge: 'Orientado a ingresos', title: 'Construido para cerrar ventas', desc: 'Cada flujo y mensaje está diseñado para llevar a los prospectos hacia una decisión de compra.' },
    { badge: 'Omnicanal', title: 'Empieza en Instagram. Escala en todos lados.', desc: 'Diseñado para cada canal — Instagram, WhatsApp, Facebook y más.' },
    { badge: 'Para fundadores', title: 'Diseñado para operadores', desc: 'Automatización de nivel empresarial sin la complejidad empresarial. Para operadores reales.' },
  ],
}

export default async function LandingPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const otherLocale = locale === 'en' ? 'es' : 'en'
  const flow = FLOW_STEPS[loc]
  const features = FEATURES[loc]
  const why = WHY[loc]

  const t = {
    en: {
      badge: 'AI-Powered Commercial Operations',
      h1a: 'Automate Every', h1b: 'Conversation.', h1c: 'Close Every Deal.',
      sub: 'JUT transforms how businesses capture leads, manage conversations, and drive sales — automatically, across every social channel.',
      cta1: 'Start for Free', cta2: 'See how it works',
      howLabel: 'How It Works', howTitle: 'From comment to closed deal',
      howSub: 'Three intelligent steps that turn passive social engagement into active revenue — automatically.',
      featLabel: 'Platform', featTitle: 'Everything you need to dominate',
      whyLabel: 'Why JUT', whyTitle: 'Not just automation. Operations intelligence.',
      whySub: "JUT is not a chatbot. Not a CRM. Not a workflow tool. It's all three — unified, AI-powered, built for results.",
      statsLabel: 'Built for Scale', statsTitle: 'Numbers that matter',
      ctaTitle: 'Your business runs. JUT sells.',
      ctaSub: "Join operators who've put their commercial conversations on autopilot. Start free. Scale fast.",
      ctaBtn: 'Start for Free →',
      ctaNote: 'No credit card required · Setup in minutes · Cancel anytime',
      loginBtn: 'Log in',
      channels: ['📸 Instagram Reels', '🖼️ Carousels', '📌 Posts', '💬 Comments', '📩 Direct Messages', '+ More soon'],
      stats: [
        { v: '<3s', l: 'Response time after trigger' },
        { v: '24/7', l: 'Always-on automation' },
        { v: '∞', l: 'Simultaneous conversations' },
        { v: '2×', l: 'Average conversion uplift' },
      ],
    },
    es: {
      badge: 'Operaciones Comerciales con Inteligencia Artificial',
      h1a: 'Automatiza Cada', h1b: 'Conversación.', h1c: 'Cierra Cada Venta.',
      sub: 'JUT transforma cómo los negocios capturan leads, gestionan conversaciones y generan ventas — automáticamente, en cada canal.',
      cta1: 'Empezar Gratis', cta2: 'Ver cómo funciona',
      howLabel: 'Cómo Funciona', howTitle: 'Del comentario al negocio cerrado',
      howSub: 'Tres pasos inteligentes que convierten el engagement social pasivo en ingresos activos — automáticamente.',
      featLabel: 'Plataforma', featTitle: 'Todo lo que necesitas para dominar',
      whyLabel: 'Por qué JUT', whyTitle: 'No solo automatización. Inteligencia operacional.',
      whySub: 'JUT no es un chatbot. No es un CRM. No es una herramienta de flujos. Es los tres — unificado, con IA, construido para resultados.',
      statsLabel: 'Construido para Escalar', statsTitle: 'Números que importan',
      ctaTitle: 'Tu negocio funciona. JUT vende.',
      ctaSub: 'Únete a los operadores que han puesto sus conversaciones comerciales en piloto automático. Empieza gratis.',
      ctaBtn: 'Empezar Gratis →',
      ctaNote: 'Sin tarjeta de crédito · Configuración en minutos · Cancela cuando quieras',
      loginBtn: 'Iniciar sesión',
      channels: ['📸 Instagram Reels', '🖼️ Carruseles', '📌 Posts', '💬 Comentarios', '📩 Mensajes Directos', '+ Más pronto'],
      stats: [
        { v: '<3s', l: 'Tiempo de respuesta tras el trigger' },
        { v: '24/7', l: 'Automatización siempre activa' },
        { v: '∞', l: 'Conversaciones simultáneas' },
        { v: '2×', l: 'Incremento promedio de conversión' },
      ],
    },
  }[loc]

  return (
    <div style={{ background: '#050508', color: '#f0f0f8', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw', height: 68, background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>
          J<span style={{ color: '#ED1966' }}>U</span>T
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Lang toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#16161f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 3 }}>
            <Link href="/en" style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textDecoration: 'none', background: locale === 'en' ? '#ED1966' : 'transparent', color: locale === 'en' ? '#fff' : '#8888a8' }}>EN</Link>
            <Link href="/es" style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textDecoration: 'none', background: locale === 'es' ? '#ED1966' : 'transparent', color: locale === 'es' ? '#fff' : '#8888a8' }}>ES</Link>
          </div>
          <Link href={`/${locale}/login`} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#8888a8', fontSize: 14, padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>{t.loginBtn}</Link>
          <Link href={`/${locale}/signup`} style={{ background: '#ED1966', border: 'none', color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, padding: '9px 22px', borderRadius: 8, textDecoration: 'none' }}>{t.cta1}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 5vw 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(33,82,164,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(237,25,102,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.25)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 500, color: '#ED1966', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ED1966', display: 'inline-block' }} />
          {t.badge}
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(52px, 8vw, 108px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff', marginBottom: 24 }}>
          {t.h1a}<br />
          <span style={{ color: '#ED1966' }}>{t.h1b}</span><br />
          <span style={{ background: 'linear-gradient(135deg, #4a90d9, #2152A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.h1c}</span>
        </h1>

        <p style={{ maxWidth: 580, fontSize: 18, color: '#8888a8', fontWeight: 300, lineHeight: 1.7, margin: '0 auto 40px' }}>{t.sub}</p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href={`/${locale}/signup`} style={{ background: '#ED1966', border: 'none', color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, padding: '15px 36px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 40px rgba(237,25,102,0.35)' }}>{t.cta1}</Link>
          <Link href={`#how`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 400, padding: '15px 36px', borderRadius: 10, textDecoration: 'none' }}>▶ {t.cta2}</Link>
        </div>

        {/* Hero chat preview */}
        <div style={{ width: '100%', maxWidth: 860, background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 24, textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #ED1966, #2152A4, transparent)' }} />
          <div style={{ display: 'inline-block', background: 'rgba(33,82,164,0.15)', border: '1px solid rgba(33,82,164,0.3)', color: '#4a90d9', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.04em', marginBottom: 16 }}>
            {locale === 'es' ? '⚡ TRIGGER DE REEL DE INSTAGRAM' : '⚡ INSTAGRAM REEL TRIGGER — ACTIVATED'}
          </div>
          <ChatLine avatar="AI" gradient msg={locale === 'es' ? '¡Hola! 👋 Vi que comentaste en nuestra publicación. ¿Quieres que te envíe todos los detalles + precios ahora mismo?' : "Hey! 👋 I saw you commented on our post. Want me to send you full details + pricing right now?"} meta={locale === 'es' ? 'JUT IA · ahora mismo · Instagram DM' : 'JUT AI · just now · Instagram DM'} />
          <ChatLine avatar="MR" msg={locale === 'es' ? '¡Sí por favor! Estoy interesada 😊' : "Yes please! I'm very interested 😊"} meta={locale === 'es' ? 'Maria R. · hace 12s' : 'Maria R. · 12s ago'} right />
          <ChatLine avatar="AI" gradient msg={locale === 'es' ? '¡Perfecto! Nuestro paquete inicial es $297/mes e incluye configuración completa + IA. ¿Te envío el link de pago? 🎯' : "Perfect! Our starter package is $297/mo and includes full setup + AI config. Shall I send you the payment link? 🎯"} meta={locale === 'es' ? 'JUT IA · Respuesta automatizada' : 'JUT AI · Automated response'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12, paddingLeft: 48 }}>
            {[0, 200, 400].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#ED1966', display: 'inline-block', animation: 'bounce 1.4s infinite', animationDelay: `${d}ms` }} />)}
            <span style={{ fontSize: 13, color: '#606080', marginLeft: 4 }}>{locale === 'es' ? 'Lead capturado · Calificación en progreso' : 'Lead captured · Qualification in progress'}</span>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, width: 'max-content', animation: 'ticker 25s linear infinite' }}>
          {[...t.channels, ...t.channels].map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#444460', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <span style={{ color: '#ED1966' }}>●</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '100px 5vw', background: '#0d0d14' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ED1966', marginBottom: 16 }}>{t.howLabel}</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>{t.howTitle}</h2>
          <p style={{ fontSize: 18, color: '#8888a8', maxWidth: 520, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>{t.howSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {flow.map(step => (
            <div key={step.n} style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 12, right: 16, fontFamily: "'Syne', sans-serif", fontSize: 72, fontWeight: 800, color: 'rgba(255,255,255,0.03)', lineHeight: 1 }}>{step.n}</span>
              <div style={{ fontSize: 28, marginBottom: 20 }}>{step.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: '#8888a8', lineHeight: 1.6, fontWeight: 300 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ED1966', marginBottom: 16 }}>{t.featLabel}</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{t.featTitle}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', maxWidth: 1100, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#050508', padding: '40px 32px', transition: 'background 0.3s' }}>
              <div style={{ fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#8888a8', lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '80px 5vw', background: '#0d0d14', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ED1966', marginBottom: 16 }}>{t.statsLabel}</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, color: '#fff', marginBottom: 48, letterSpacing: '-0.02em' }}>{t.statsTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48, maxWidth: 900, margin: '0 auto' }}>
          {t.stats.map(s => (
            <div key={s.l}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {s.v.includes('<') ? <><span style={{ color: '#ED1966' }}>&lt;</span>{s.v.replace('<', '')}</> : s.v.includes('/') ? <>{s.v.split('/')[0]}<span style={{ color: '#ED1966' }}>/{s.v.split('/')[1]}</span></> : s.v.includes('×') ? <>{s.v.replace('×', '')}<span style={{ color: '#ED1966' }}>×</span></> : s.v === '∞' ? <span style={{ color: '#ED1966' }}>∞</span> : s.v}
              </p>
              <p style={{ fontSize: 14, color: '#8888a8', marginTop: 8, fontWeight: 300 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY JUT ── */}
      <section style={{ padding: '100px 5vw' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ED1966', marginBottom: 16 }}>{t.whyLabel}</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em', maxWidth: 700 }}>{t.whyTitle}</h2>
        <p style={{ fontSize: 18, color: '#8888a8', maxWidth: 560, marginBottom: 64, fontWeight: 300, lineHeight: 1.7 }}>{t.whySub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {why.map(card => (
            <div key={card.title} style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 }}>
              <div style={{ display: 'inline-block', background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)', color: '#ED1966', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>{card.badge}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: '#8888a8', lineHeight: 1.65, fontWeight: 300 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 5vw', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#0d0d14' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(237,25,102,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ED1966', marginBottom: 16, position: 'relative' }}>{locale === 'es' ? 'Empieza Ahora' : 'Get Started'}</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em', position: 'relative' }} dangerouslySetInnerHTML={{ __html: t.ctaTitle.replace('JUT', '<span style="color:#ED1966">JUT</span>') }} />
        <p style={{ fontSize: 18, color: '#8888a8', maxWidth: 500, margin: '0 auto 40px', fontWeight: 300, lineHeight: 1.7, position: 'relative' }}>{t.ctaSub}</p>
        <div style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto 16px', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input type="email" placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'} style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 15, padding: '14px 20px', borderRadius: 10, flex: 1, minWidth: 220, outline: 'none' }} />
          <Link href={`/${locale}/signup`} style={{ background: '#ED1966', border: 'none', color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>{t.ctaBtn}</Link>
        </div>
        <p style={{ fontSize: 13, color: '#444460', position: 'relative' }}>{t.ctaNote}</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d0d14', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 5vw 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 12 }}>J<span style={{ color: '#ED1966' }}>U</span>T</div>
            <p style={{ fontSize: 14, color: '#8888a8', lineHeight: 1.6, fontWeight: 300, maxWidth: 220 }}>{locale === 'es' ? 'La plataforma de operaciones comerciales con IA para negocios que quieren vender más inteligente.' : 'The AI-powered commercial operations platform for businesses that want to sell smarter, not harder.'}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {['🇨🇴 Colombia', '🇺🇸 United States'].map(c => <span key={c} style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px', fontSize: 12, color: '#8888a8' }}>{c}</span>)}
            </div>
          </div>
          {[
            { title: locale === 'es' ? 'Producto' : 'Product', links: [locale === 'es' ? 'Funciones' : 'Features', locale === 'es' ? 'Automatización' : 'Automation', 'CRM', locale === 'es' ? 'Ventas' : 'Sales'] },
            { title: locale === 'es' ? 'Empresa' : 'Company', links: [locale === 'es' ? 'Acerca de' : 'About', 'Blog', locale === 'es' ? 'Carreras' : 'Careers', locale === 'es' ? 'Contacto' : 'Contact'] },
            { title: 'Legal', links: [locale === 'es' ? 'Privacidad' : 'Privacy', locale === 'es' ? 'Términos' : 'Terms', 'Cookies'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '0.04em' }}>{col.title}</h4>
              {col.links.map(link => <a key={link} href="#" style={{ display: 'block', fontSize: 14, color: '#8888a8', textDecoration: 'none', marginBottom: 10, fontWeight: 300 }}>{link}</a>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#444460', fontWeight: 300 }}>© 2025 JUT. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/en" style={{ fontSize: 13, color: '#444460', textDecoration: 'none' }}>English</Link>
            <Link href="/es" style={{ fontSize: 13, color: '#444460', textDecoration: 'none' }}>Español</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: rgba(237,25,102,0.5) !important; }
        a:hover { opacity: 0.85; }
      `}</style>
    </div>
  )
}

function ChatLine({ avatar, msg, meta, right = false, gradient = false }: { avatar: string; msg: string; meta: string; right?: boolean; gradient?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, flexDirection: right ? 'row-reverse' : 'row' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff', background: gradient ? 'linear-gradient(135deg, #ED1966, #2152A4)' : '#12121c', border: gradient ? 'none' : '1px solid rgba(255,255,255,0.10)' }}>{avatar}</div>
      <div style={{ textAlign: right ? 'right' : 'left' }}>
        <div style={{ background: right ? 'rgba(237,25,102,0.1)' : '#12121c', border: `1px solid ${right ? 'rgba(237,25,102,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: '#f0f0f8', maxWidth: 460, lineHeight: 1.5 }}>{msg}</div>
        <div style={{ fontSize: 11, color: '#444460', marginTop: 4, padding: '0 4px' }}>{meta}</div>
      </div>
    </div>
  )
}
