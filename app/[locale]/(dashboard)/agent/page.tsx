'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bot, Save, RefreshCw, Check, MessageSquare, Zap, Target, BookOpen, Tag, Play, ChevronRight, Sparkles, Globe, Building2, User } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'identity', label:'Identity', icon:User },
  { id:'personality', label:'Personality', icon:Sparkles },
  { id:'knowledge', label:'Knowledge', icon:BookOpen },
  { id:'offers', label:'Offers', icon:Tag },
  { id:'rules', label:'Rules', icon:Target },
  { id:'test', label:'Test Bot', icon:Play },
]

const TONES = [
  { id:'friendly', label:'Friendly', emoji:'😊', desc:'Warm and approachable' },
  { id:'professional', label:'Professional', emoji:'💼', desc:'Formal and polished' },
  { id:'casual', label:'Casual', emoji:'😎', desc:'Relaxed and conversational' },
  { id:'enthusiastic', label:'Enthusiastic', emoji:'🚀', desc:'Energetic and exciting' },
  { id:'empathetic', label:'Empathetic', emoji:'💙', desc:'Understanding and caring' },
]

const RESPONSE_LENGTHS = [
  { id:'short', label:'Short', desc:'1-2 sentences, quick answers' },
  { id:'medium', label:'Medium', desc:'2-4 sentences, balanced' },
  { id:'detailed', label:'Detailed', desc:'4+ sentences, thorough' },
]

const BUSINESS_TYPES = [
  'E-commerce', 'Services', 'Coaching', 'Restaurant', 'Fashion / Beauty',
  'Real Estate', 'Education', 'Fitness', 'Technology', 'Healthcare', 'Other'
]

const LANGUAGES = [
  { code:'es', label:'Español', flag:'🇨🇴' },
  { code:'en', label:'English', flag:'🇺🇸' },
  { code:'pt', label:'Português', flag:'🇧🇷' },
  { code:'fr', label:'Français', flag:'🇫🇷' },
]

const DEFAULT_AGENT = {
  name: 'Sofia',
  role: 'Sales & Support Agent',
  emoji: '😊',
  language: 'en',
  business_name: '',
  business_type: '',
  instagram: '',
  whatsapp: '',
  tone: 'friendly',
  response_length: 'medium',
  personality_traits: ['helpful', 'professional'],
  knowledge: '',
  offers: '',
  rules: '',
}

export default function AgentPage() {
  const [tab, setTab] = useState('identity')
  const [agent, setAgent] = useState(DEFAULT_AGENT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testReply, setTestReply] = useState('')
  const [testing, setTesting] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role:string;msg:string}[]>([])
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('agent_configs').select('*').eq('user_id', user.id).single()
    if (data) setAgent({ ...DEFAULT_AGENT, ...data.config })
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('agent_configs').upsert({ user_id: user.id, config: agent, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaving(false)
    if (error) { toast.error('Failed: ' + error.message); return }
    setSaved(true); toast.success('Agent saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  async function testBot() {
    if (!testMsg.trim()) return
    setTesting(true)
    const userMsg = testMsg
    setTestMsg('')
    setChatHistory(h => [...h, { role: 'user', msg: userMsg }])
    try {
      const res = await fetch('/api/agent/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, agent }),
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, I could not generate a response.'
      setChatHistory(h => [...h, { role: 'agent', msg: reply }])
    } catch(e) {
      setChatHistory(h => [...h, { role: 'agent', msg: 'Error connecting to AI. Check your Anthropic credits.' }])
    }
    setTesting(false)
  }

  function upd(key: string, val: any) { setAgent(a => ({ ...a, [key]: val })) }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 11,
    background: 'var(--surface-2)', border: '1px solid var(--border-2)',
    color: 'var(--text)', fontSize: 14, outline: 'none', marginTop: 6,
    transition: 'border-color 0.2s',
  }

  const currentLang = LANGUAGES.find(l => l.code === agent.language) || LANGUAGES[0]
  const currentTone = TONES.find(t => t.id === agent.tone) || TONES[0]

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Agent avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--pink), var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 24px rgba(237,25,102,0.3)',
            flexShrink: 0,
          }}>
            {agent.emoji}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 3 }}>
              {agent.name || 'Your Agent'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{agent.role || 'AI Agent'}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
                Active
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{currentTone.emoji} {currentTone.label} · {currentLang.flag} {currentLang.label}</span>
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: saved ? '#22c55e' : 'var(--pink)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s', boxShadow: saved ? '0 4px 20px rgba(34,197,94,0.3)' : '0 4px 20px rgba(237,25,102,0.3)' }}>
          {saved ? <><Check size={16}/> Saved!</> : saving ? <><RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }}/> Saving...</> : <><Save size={16}/> Save Agent</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT NAV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
              borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: tab === t.id ? 'rgba(237,25,102,0.08)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 14,
              borderLeft: '2px solid ' + (tab === t.id ? 'var(--pink)' : 'transparent'),
              transition: 'all 0.15s',
            }}>
              <t.icon size={16} color={tab === t.id ? 'var(--pink)' : 'var(--text-4)'}/>
              {t.label}
              {tab === t.id && <ChevronRight size={13} style={{ marginLeft: 'auto' }} color="var(--pink)"/>}
            </button>
          ))}

          {/* Stats card */}
          <div style={{ marginTop: 12, padding: 16, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>Agent Summary</div>
            {[
              { label: 'Name', val: agent.name || '—' },
              { label: 'Language', val: currentLang.flag + ' ' + currentLang.label },
              { label: 'Tone', val: currentTone.emoji + ' ' + currentTone.label },
              { label: 'Response', val: agent.response_length || 'medium' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text-4)' }}>{item.label}</span>
                <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border-2)', overflow: 'hidden' }}>
          {/* Tab header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {(() => { const t = TABS.find(x => x.id === tab)!; return <><t.icon size={18} color="var(--pink)"/><span style={{ fontSize: 16, fontWeight: 700 }}>{t.label}</span></> })()}
          </div>

          <div style={{ padding: 24 }}>

            {/* IDENTITY */}
            {tab === 'identity' && (
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Avatar + Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Agent Name</label>
                    <input value={agent.name} onChange={e => upd('name', e.target.value)} placeholder="Sofia, Alex, Max..." style={inp}/>
                    <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 6 }}>This is what the agent calls itself in conversations</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Role / Title</label>
                    <input value={agent.role} onChange={e => upd('role', e.target.value)} placeholder="Sales Agent, Support Assistant..." style={inp}/>
                  </div>
                </div>

                {/* Emoji avatar */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 10 }}>Avatar Emoji</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['😊','🤖','💼','🌟','🚀','💙','🎯','⚡','🦁','🦊','🐺','🌺'].map(e => (
                      <button key={e} onClick={() => upd('emoji', e)} style={{ width: 44, height: 44, borderRadius: 11, fontSize: 22, border: '2px solid ' + (agent.emoji === e ? 'var(--pink)' : 'var(--border-2)'), background: agent.emoji === e ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {e}
                      </button>
                    ))}
                    <input value={agent.emoji} onChange={e => upd('emoji', e.target.value)} placeholder="Any emoji" style={{ ...inp, width: 80, marginTop: 0, textAlign: 'center', fontSize: 18 }}/>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 10 }}>Primary Language</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => upd('language', lang.code)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '2px solid ' + (agent.language === lang.code ? 'var(--pink)' : 'var(--border-2)'), background: agent.language === lang.code ? 'rgba(237,25,102,0.07)' : 'var(--surface-2)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 18 }}>{lang.flag}</span>
                        <span style={{ fontSize: 13, fontWeight: agent.language === lang.code ? 700 : 500, color: agent.language === lang.code ? 'var(--text)' : 'var(--text-3)' }}>{lang.label}</span>
                        {agent.language === lang.code && <Check size={13} color="var(--pink)" strokeWidth={3}/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business info */}
                <div style={{ padding: 20, borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Building2 size={15} color="var(--pink)"/> Business Info
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Business Name</label>
                      <input value={agent.business_name} onChange={e => upd('business_name', e.target.value)} placeholder="Your company name" style={inp}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Business Type</label>
                      <select value={agent.business_type} onChange={e => upd('business_type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                        <option value="">Select type...</option>
                        {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Instagram @</label>
                      <input value={agent.instagram} onChange={e => upd('instagram', e.target.value)} placeholder="@yourbusiness" style={inp}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>WhatsApp</label>
                      <input value={agent.whatsapp} onChange={e => upd('whatsapp', e.target.value)} placeholder="+57 300 000 0000" style={inp}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PERSONALITY */}
            {tab === 'personality' && (
              <div style={{ display: 'grid', gap: 24 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 12 }}>Conversation Tone</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    {TONES.map(t => (
                      <button key={t.id} onClick={() => upd('tone', t.id)} style={{
                        padding: '14px 16px', borderRadius: 14, border: '2px solid ' + (agent.tone === t.id ? 'var(--pink)' : 'var(--border-2)'),
                        background: agent.tone === t.id ? 'rgba(237,25,102,0.07)' : 'var(--surface-2)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{t.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: agent.tone === t.id ? 700 : 500, color: agent.tone === t.id ? 'var(--text)' : 'var(--text-2)', marginBottom: 3 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 12 }}>Response Length</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {RESPONSE_LENGTHS.map(r => (
                      <button key={r.id} onClick={() => upd('response_length', r.id)} style={{
                        padding: '14px', borderRadius: 13, border: '2px solid ' + (agent.response_length === r.id ? 'var(--pink)' : 'var(--border-2)'),
                        background: agent.response_length === r.id ? 'rgba(237,25,102,0.07)' : 'var(--surface-2)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: agent.response_length === r.id ? 700 : 500, color: agent.response_length === r.id ? 'var(--text)' : 'var(--text-2)', marginBottom: 4 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', lineHeight: 1.4 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Personality Traits</label>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 10 }}>Select all that apply to your agent</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['helpful','professional','empathetic','direct','creative','patient','proactive','concise','detailed','witty'].map(trait => {
                      const selected = (agent.personality_traits || []).includes(trait)
                      return (
                        <button key={trait} onClick={() => {
                          const traits = agent.personality_traits || []
                          upd('personality_traits', selected ? traits.filter((t:string) => t !== trait) : [...traits, trait])
                        }} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: selected ? 600 : 400, border: '1px solid ' + (selected ? 'var(--pink)' : 'var(--border-2)'), background: selected ? 'rgba(237,25,102,0.1)' : 'var(--surface-2)', color: selected ? 'var(--pink)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {selected && '✓ '}{trait}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* KNOWLEDGE */}
            {tab === 'knowledge' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 13, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <strong>What to include:</strong> Product catalog, pricing, FAQs, business hours, shipping info, return policy, team info, anything the agent needs to know to answer customer questions accurately.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Business Knowledge Base</label>
                  <textarea
                    value={agent.knowledge}
                    onChange={e => upd('knowledge', e.target.value)}
                    placeholder={'Example:\n\nProducts:\n- Plan A: $29/mo - Includes X, Y, Z\n- Plan B: $79/mo - Includes everything in A plus...\n\nBusiness hours: Mon-Fri 9am-6pm (Colombia time)\n\nReturn policy: 30-day money back guarantee\n\nFrequently asked questions:\nQ: How do I cancel?\nA: Email us at support@...'}
                    rows={16}
                    style={{ ...inp, resize: 'vertical', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-4)' }}>More context = better responses</p>
                    <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{agent.knowledge?.length || 0} characters</p>
                  </div>
                </div>
              </div>
            )}

            {/* OFFERS */}
            {tab === 'offers' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 13, background: 'rgba(237,25,102,0.06)', border: '1px solid rgba(237,25,102,0.12)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <strong>What to include:</strong> Current promotions, discount codes, special offers, upsells, or anything the agent should proactively mention to increase conversions.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Active Offers & Promotions</label>
                  <textarea
                    value={agent.offers}
                    onChange={e => upd('offers', e.target.value)}
                    placeholder={'Example:\n\n- 20% off first purchase with code WELCOME20\n- Free shipping on orders over $50\n- Buy 2 get 1 free on Plan A this month\n- Referral program: give $10, get $10'}
                    rows={10}
                    style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}
                  />
                </div>
              </div>
            )}

            {/* RULES */}
            {tab === 'rules' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 13, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <strong>What to include:</strong> Topics to avoid, escalation triggers (when to say "I'll connect you with a human"), response boundaries, things the agent should never say.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Agent Rules & Boundaries</label>
                  <textarea
                    value={agent.rules}
                    onChange={e => upd('rules', e.target.value)}
                    placeholder={'Example:\n\n- Never discuss competitor products\n- If asked about refunds over $100, escalate to human agent\n- Always end conversations asking if there is anything else to help\n- Never make promises about delivery times\n- If the user seems frustrated, apologize first before answering\n- Do not share internal pricing strategies'}
                    rows={12}
                    style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}
                  />
                </div>
              </div>
            )}

            {/* TEST BOT */}
            {tab === 'test' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 13, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bot size={18} color="#22c55e"/>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    Test how <strong>{agent.name}</strong> responds. Messages are simulated and not sent to any user.
                  </p>
                </div>

                {/* Chat window */}
                <div style={{ minHeight: 320, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 4 }}>
                  {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-4)' }}>
                      <Bot size={40} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }}/>
                      <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>Send a message to test your agent</p>
                      <p style={{ fontSize: 12, marginTop: 6 }}>Try: "What are your prices?" or "How does this work?"</p>
                    </div>
                  )}
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                      {m.role === 'agent' && (
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--pink),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                          {agent.emoji}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '72%', padding: '11px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: m.role === 'user' ? 'var(--pink)' : 'var(--surface-2)',
                        color: m.role === 'user' ? '#fff' : 'var(--text)',
                        fontSize: 14, lineHeight: 1.6,
                        border: m.role === 'agent' ? '1px solid var(--border-2)' : 'none',
                      }}>
                        {m.msg}
                      </div>
                    </div>
                  ))}
                  {testing && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--pink),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{agent.emoji}</div>
                      <div style={{ padding: '12px 16px', borderRadius: '14px 14px 14px 4px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block', animation: 'bounce 1.4s ease infinite', animationDelay: (i*0.2)+'s' }}/>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={testMsg}
                    onChange={e => setTestMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && testBot()}
                    placeholder={"Message " + (agent.name || 'your agent') + "..."}
                    style={{ ...inp, marginTop: 0, flex: 1 }}
                  />
                  <button onClick={testBot} disabled={testing || !testMsg.trim()} style={{ padding: '11px 20px', borderRadius: 11, background: 'var(--pink)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, opacity: (testing || !testMsg.trim()) ? 0.6 : 1, boxShadow: '0 4px 16px rgba(237,25,102,0.3)' }}>
                    <MessageSquare size={15}/> Send
                  </button>
                </div>
                <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 12, alignSelf: 'center' }}>
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}