'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Plus, Play, Pause, Trash2, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const TRIGGER_TYPES = [
  { value: 'instagram_comment', label: 'Instagram Comment', desc: 'Someone comments on your post' },
  { value: 'instagram_dm', label: 'Instagram DM', desc: 'Someone sends you a direct message' },
  { value: 'manual', label: 'Manual / Test', desc: 'Trigger manually or via API' },
  { value: 'schedule', label: 'Scheduled', desc: 'Run on a time schedule' },
]

const ACTION_TYPES = [
  { value: 'send_dm', label: 'Send DM', desc: 'Send a direct message to the user' },
  { value: 'add_tag', label: 'Add Tag', desc: 'Tag the lead in your CRM' },
  { value: 'send_notification', label: 'Send Notification', desc: 'Notify you when triggered' },
  { value: 'wait', label: 'Wait', desc: 'Wait before next action' },
]

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', trigger_type: 'instagram_comment', keyword: '', action_type: 'send_notification', action_message: '' })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('automations').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setAutomations(data || [])
    setLoading(false)
  }

  async function createAutomation() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id,
      name: form.name,
      status: 'active',
      trigger: { type: form.trigger_type, platform: form.trigger_type.startsWith('instagram') ? 'instagram' : 'internal', keyword: form.keyword || null },
      actions: [{ type: form.action_type, config: { message: form.action_message, title: form.name } }],
    }
    const { error } = await supabase.from('automations').insert(payload)
    if (error) { toast.error('Failed: ' + error.message); setSaving(false); return }
    toast.success('Automation created!')
    setShowModal(false)
    setForm({ name: '', trigger_type: 'instagram_comment', keyword: '', action_type: 'send_notification', action_message: '' })
    setSaving(false)
    load()
  }

  async function toggle(id: string, status: string) {
    const next = status === 'active' ? 'paused' : 'active'
    await supabase.from('automations').update({ status: next }).eq('id', id)
    setAutomations(p => p.map(a => a.id === id ? {...a, status: next} : a))
    toast.success(next === 'active' ? 'Activated' : 'Paused')
  }

  async function del(id: string) {
    if (!confirm('Delete this automation?')) return
    await supabase.from('automations').delete().eq('id', id)
    setAutomations(p => p.filter(a => a.id !== id))
    toast.success('Deleted')
  }

  async function testRun(id: string) {
    const r = await fetch('/api/automations/run', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ automation_id: id }) })
    const d = await r.json()
    d.success ? toast.success('Test ran: ' + (d.message || 'OK')) : toast.error(d.error || 'Failed')
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:14, outline:'none', marginTop:6 }
  const sel: React.CSSProperties = { ...inp, cursor:'pointer' }

  return (
    <div style={{padding:32, maxWidth:1100}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Automations</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{automations.filter(a=>a.status==='active').length} active · {automations.length} total</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
          <Plus size={16}/> New Automation
        </button>
      </div>

      {loading ? <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>Loading...</div>
      : automations.length === 0 ? (
        <div style={{textAlign:'center',padding:80,color:'var(--text-3)'}}>
          <Zap size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
          <p style={{fontSize:16,fontWeight:600,color:'var(--text-2)'}}>No automations yet</p>
          <p style={{fontSize:13,marginTop:8}}>Create your first automation to start capturing leads automatically</p>
          <button onClick={()=>setShowModal(true)} style={{marginTop:20,padding:'10px 24px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            Create First Automation
          </button>
        </div>
      ) : (
        <div style={{display:'grid',gap:16}}>
          {automations.map(a => (
            <div key={a.id} style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:a.status==='active'?'#22c55e':'#888'}}/>
                    <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>{a.name}</span>
                    <span style={{padding:'2px 10px',borderRadius:999,fontSize:12,background:a.status==='active'?'rgba(34,197,94,0.1)':'rgba(136,136,136,0.1)',color:a.status==='active'?'#22c55e':'#888'}}>{a.status}</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--text-3)'}}>
                    Trigger: <strong style={{color:'var(--text-2)'}}>{a.trigger?.type || 'manual'}</strong>
                    {a.trigger?.keyword && <> · Keyword: <strong style={{color:'var(--text-2)'}}>{a.trigger.keyword}</strong></>}
                    {' · '}{(a.actions?.length || 0)} action{a.actions?.length !== 1 ? 's':''}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>testRun(a.id)} style={{padding:'7px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-2)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:5}}>
                    <Play size={13}/> Test
                  </button>
                  <button onClick={()=>toggle(a.id,a.status)} style={{padding:'7px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:a.status==='active'?'#fbbf24':'#22c55e',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:5}}>
                    {a.status==='active' ? <><Pause size={13}/> Pause</> : <><Play size={13}/> Activate</>}
                  </button>
                  <button onClick={()=>del(a.id)} style={{padding:'7px 9px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:20,padding:32,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'var(--text)'}}>New Automation</h2>
              <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer'}}><X size={20}/></button>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Automation Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Instagram Comment Lead Capture" style={inp}/>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Trigger</label>
              <select value={form.trigger_type} onChange={e=>setForm(f=>({...f,trigger_type:e.target.value}))} style={sel}>
                {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
              </select>
            </div>

            {(form.trigger_type === 'instagram_comment' || form.trigger_type === 'instagram_dm') && (
              <div style={{marginBottom:18}}>
                <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Keyword to detect (optional)</label>
                <input value={form.keyword} onChange={e=>setForm(f=>({...f,keyword:e.target.value}))} placeholder="e.g. precio, info, quiero" style={inp}/>
              </div>
            )}

            <div style={{marginBottom:18}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Action</label>
              <select value={form.action_type} onChange={e=>setForm(f=>({...f,action_type:e.target.value}))} style={sel}>
                {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
              </select>
            </div>

            {form.action_type === 'send_dm' && (
              <div style={{marginBottom:18}}>
                <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Message to send</label>
                <textarea value={form.action_message} onChange={e=>setForm(f=>({...f,action_message:e.target.value}))} placeholder="Hey! I saw you commented. Want me to send you more info?" rows={3} style={{...inp,resize:'vertical'}}/>
              </div>
            )}

            <div style={{display:'flex',gap:12,marginTop:8}}>
              <button onClick={()=>setShowModal(false)} style={{flex:1,padding:'11px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-2)',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={createAutomation} disabled={saving} style={{flex:2,padding:'11px',borderRadius:11,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
                {saving ? 'Creating...' : 'Create Automation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}