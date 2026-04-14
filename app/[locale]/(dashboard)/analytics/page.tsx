'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Zap, MessageSquare, DollarSign } from 'lucide-react'

export default function AnalyticsPage({ params }: { params: { locale: string } }) {
  const [stats, setStats] = useState({ leads:0, conversations:0, automations:0, fired:0, revenue:0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [leads, convos, autos] = await Promise.all([
        supabase.from('leads').select('id', {count:'exact'}).eq('user_id', user.id),
        supabase.from('conversations').select('id', {count:'exact'}).eq('user_id', user.id),
        supabase.from('automations').select('id', {count:'exact'}).eq('user_id', user.id).eq('status','active'),
      ])
      setStats({
        leads: leads.count || 0,
        conversations: convos.count || 0,
        automations: autos.count || 0,
        fired: 0,
        revenue: 0,
      })
      setLoading(false)
    })()
  }, [])

  const cards = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: '#6366f1' },
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: '#3b82f6' },
    { label: 'Active Automations', value: stats.automations, icon: Zap, color: '#ED1966' },
    { label: 'Automation Runs', value: stats.fired, icon: TrendingUp, color: '#22c55e' },
    { label: 'Revenue (COP)', value: '$' + stats.revenue.toLocaleString(), icon: DollarSign, color: '#f59e0b' },
  ]

  return (
    <div style={{padding:32,maxWidth:1200}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Analytics</h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>Performance overview of your JUT platform</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32}}>
        {cards.map(card => (
          <div key={card.label} style={{padding:24,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontSize:13,color:'var(--text-3)',fontWeight:500}}>{card.label}</span>
              <div style={{width:36,height:36,borderRadius:10,background:card.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <card.icon size={18} color={card.color}/>
              </div>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:'var(--text)',letterSpacing:-1}}>
              {loading ? 'â' : card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{padding:48,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)',textAlign:'center',color:'var(--text-3)'}}>
        <BarChart3 size={48} style={{opacity:0.15,marginBottom:16,display:'block',margin:'0 auto 16px'}}/>
        <p style={{fontSize:16,fontWeight:600,color:'var(--text-2)'}}>Charts coming soon</p>
        <p style={{fontSize:14,marginTop:8}}>Detailed conversion funnels and timeline charts will appear here as your data grows</p>
      </div>
    </div>
  )
}
