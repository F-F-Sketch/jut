'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Plus, Play, Pause, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AutomationsPage({ params }: { params: { locale: string } }) {
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('automations').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setAutomations(data || [])
    setLoading(false)
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'paused' : 'active'
    const { error } = await supabase.from('automations').update({ status: newStatus }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    setAutomations(prev => prev.map(a => a.id === id ? {...a, status: newStatus} : a))
    toast.success(newStatus === 'active' ? 'Automation activated' : 'Automation paused')
  }

  async function runTest(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/automations/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automation_id: id })
    })
    const data = await res.json()
    if (data.success) toast.success('Test run: ' + data.message)
    else toast.error(data.error || 'Run failed')
  }

  async function deleteAuto(id: string) {
    if (!confirm('Delete this automation?')) return
    await supabase.from('automations').delete().eq('id', id)
    setAutomations(prev => prev.filter(a => a.id !== id))
    toast.success('Deleted')
  }

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Automations</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{automations.filter(a=>a.status==='active').length} active · {automations.length} total</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
          <Plus size={16}/> New Automation
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>Loading automations...</div>
      ) : automations.length === 0 ? (
        <div style={{textAlign:'center',padding:80,color:'var(--text-3)'}}>
          <Zap size={48} style={{opacity:0.2,marginBottom:16,display:'block',margin:'0 auto 16px'}}/>
          <p style={{fontSize:16,fontWeight:600}}>No automations yet</p>
          <p style={{fontSize:14,marginTop:8}}>Create your first automation to start capturing leads automatically</p>
          <button style={{marginTop:20,padding:'10px 24px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            <Plus size={14} style={{display:'inline',marginRight:6}}/>Create First Automation
          </button>
        </div>
      ) : (
        <div style={{display:'grid',gap:16}}>
          {automations.map(auto => (
            <div key={auto.id} style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:auto.status==='active'?'#22c55e':'#666',flexShrink:0}}/>
                    <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>{auto.name || 'Unnamed Automation'}</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--text-3)',marginBottom:12}}>
                    Trigger: <strong style={{color:'var(--text-2)'}}>{auto.trigger?.type || 'manual'}</strong>
                    {auto.trigger?.platform && <> · Platform: <strong style={{color:'var(--text-2)'}}>{auto.trigger.platform}</strong></>}
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <span style={{padding:'3px 10px',borderRadius:999,fontSize:12,background:'var(--surface-2)',color:'var(--text-3)'}}>
                      {(auto.actions?.length || 0)} action{auto.actions?.length !== 1 ? 's':''}</span>
                    {auto.status === 'active' && <span style={{padding:'3px 10px',borderRadius:999,fontSize:12,background:'rgba(34,197,94,0.1)',color:'#22c55e'}}>Active</span>}
                    {auto.status === 'paused' && <span style={{padding:'3px 10px',borderRadius:999,fontSize:12,background:'rgba(251,191,36,0.1)',color:'#fbbf24'}}>Paused</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>runTest(auto.id)} title="Test run"
                    style={{padding:'8px 12px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-2)',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
                    <Play size={14}/> Test
                  </button>
                  <button onClick={()=>toggleStatus(auto.id, auto.status)} title="Toggle"
                    style={{padding:'8px 12px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:auto.status==='active'?'#fbbf24':'#22c55e',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
                    {auto.status==='active' ? <Pause size={14}/> : <Play size={14}/>}
                    {auto.status==='active' ? 'Pause' : 'Activate'}
                  </button>
                  <button onClick={()=>deleteAuto(auto.id)} title="Delete"
                    style={{padding:'8px',borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
