'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, Plus, Phone, Mail, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const STAGES = ['new','contacted','qualified','proposal','closed_won','closed_lost']
const STAGE_COLORS: Record<string,string> = {
  new:'#6366f1',contacted:'#f59e0b',qualified:'#3b82f6',
  proposal:'#8b5cf6',closed_won:'#22c55e',closed_lost:'#ef4444'
}

export default function LeadsPage({ params }: { params: { locale: string } }) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    })()
  }, [])

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  )

  const s = (obj: Record<string,any>) => Object.entries(obj).map(([k,v]) => k+':'+v).join(';')

  return (
    <div style={{padding:32,maxWidth:1200}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Leads</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{leads.length} total leads</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}} />
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search leads..." style={{width:'100%',paddingLeft:42,paddingRight:16,paddingTop:10,paddingBottom:10,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border-2)',color:'var(--text)',fontSize:14,outline:'none'}} />
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:80,color:'var(--text-3)'}}>
          <Users size={48} style={{opacity:0.2,marginBottom:16}} />
          <p style={{fontSize:16,fontWeight:600}}>No leads yet</p>
          <p style={{fontSize:14,marginTop:8}}>Leads captured from automations will appear here</p>
        </div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(lead => (
            <div key={lead.id} style={{padding:20,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:'var(--pink)20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'var(--pink)',flexShrink:0}}>
                {lead.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{lead.name || 'Unknown'}</div>
                <div style={{display:'flex',gap:12,marginTop:4,flexWrap:'wrap'}}>
                  {lead.email && <span style={{fontSize:12,color:'var(--text-3)',display:'flex',alignItems:'center',gap:4}}><Mail size={11}/>{lead.email}</span>}
                  {lead.phone && <span style={{fontSize:12,color:'var(--text-3)',display:'flex',alignItems:'center',gap:4}}><Phone size={11}/>{lead.phone}</span>}
                  {lead.source && <span style={{fontSize:12,color:'var(--text-3)',display:'flex',alignItems:'center',gap:4}}><Tag size={11}/>{lead.source}</span>}
                </div>
              </div>
              <div style={{padding:'4px 12px',borderRadius:999,fontSize:12,fontWeight:600,background:(STAGE_COLORS[lead.stage]||'#6366f1')+'20',color:STAGE_COLORS[lead.stage]||'#6366f1',textTransform:'capitalize',whiteSpace:'nowrap'}}>
                {lead.stage?.replace('_',' ') || 'new'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
