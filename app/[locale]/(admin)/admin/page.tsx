import Link from 'next/link'
import { Settings, Palette, Layout, Globe } from 'lucide-react'

export default function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const sections = [
    { href: '/' + locale + '/customization', icon: Palette, color: '#ED1966', title: 'Brand & Customization', desc: 'Logo, favicon, colors, custom CSS, SEO tracking' },
    { href: '/' + locale + '/landing-builder', icon: Layout, color: '#3b82f6', title: 'Landing Page Builder', desc: 'Drag-and-drop blocks to build your landing page' },
    { href: '/' + locale + '/social', icon: Globe, color: '#22c55e', title: 'Social Networks', desc: 'Connect Instagram, WhatsApp, TikTok and more' },
    { href: '/' + locale + '/settings', icon: Settings, color: '#8b5cf6', title: 'Platform Settings', desc: 'API keys, integrations, billing' },
  ]
  return (
    <div style={{padding:32,maxWidth:900}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Admin Panel</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Platform management and customization</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
        {sections.map(s => (
          <Link key={s.href} href={s.href} style={{padding:24,borderRadius:18,background:'var(--surface)',border:'1px solid var(--border-2)',textDecoration:'none',display:'block',transition:'border-color 0.2s'}}>
            <div style={{width:48,height:48,borderRadius:14,background:s.color+'18',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <s.icon size={22} color={s.color}/>
            </div>
            <div style={{fontWeight:700,fontSize:17,color:'var(--text)',marginBottom:6}}>{s.title}</div>
            <div style={{fontSize:14,color:'var(--text-3)',lineHeight:1.5}}>{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
