export default function HelpPage({ params }: { params: { locale: string } }) {
  const faqs = [
    { q: 'How do I connect Instagram?', a: 'Go to Social Triggers and click Connect Instagram. You need a Facebook Business account linked to your Instagram.' },
    { q: 'How do automations work?', a: 'You set a trigger (like someone commenting a keyword on your post) and actions (like sending them a DM). JUT handles the rest 24/7.' },
    { q: 'What is the AI Agent?', a: 'Your AI Agent is your customizable AI persona that responds to leads. Configure its name, personality, and knowledge in the Agent settings.' },
    { q: 'How does Creative AI work?', a: 'Upload a marketing image and the AI will score it across 5 dimensions and give specific improvement recommendations.' },
    { q: 'Can I use JUT in Spanish?', a: 'Yes! JUT is fully bilingual. Your AI agent can respond in Spanish or English depending on how you configure it.' },
  ]

  return (
    <div style={{padding:32,maxWidth:800}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Help & Support</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Frequently asked questions and resources</p>
      </div>

      <div style={{display:'grid',gap:16,marginBottom:40}}>
        {faqs.map((faq, i) => (
          <div key={i} style={{padding:24,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:10}}>{faq.q}</div>
            <div style={{fontSize:14,color:'var(--text-3)',lineHeight:1.6}}>{faq.a}</div>
          </div>
        ))}
      </div>

      <div style={{padding:28,borderRadius:16,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.2)',textAlign:'center'}}>
        <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:8}}>Need more help?</div>
        <div style={{fontSize:14,color:'var(--text-3)',marginBottom:16}}>Contact our support team or check the documentation</div>
        <a href="mailto:support@jut.ai" style={{padding:'10px 24px',borderRadius:10,background:'var(--pink)',color:'#fff',textDecoration:'none',fontWeight:700,fontSize:14}}>
          Contact Support
        </a>
      </div>
    </div>
  )
}
