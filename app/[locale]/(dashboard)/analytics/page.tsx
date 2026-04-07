'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Zap, DollarSign, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { Lead, Order, Automation } from '@/types'

interface PageProps { params: { locale: string } }

const PINK = '#ED1966'
const BLUE = '#2152A4'
const GREEN = '#22c55e'
const YELLOW = '#f59e0b'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>
      {label && <p style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11 }}>{label}</p>}
      {payload.map(p => <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} /><span style={{ color: 'var(--text-2)' }}>{p.name}:</span><strong>{p.value}</strong></div>)}
    </div>
  )
}

function EmptyChart({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="h-48 flex items-center justify-center flex-col gap-2" style={{ color: 'var(--text-3)' }}>
      <Icon size={32} style={{ opacity: 0.2 }} />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export default function AnalyticsPage({ params }: PageProps) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const [leads, setLeads] = useState<Lead[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: l }, { data: o }, { data: a }] = await Promise.all([
        supabase.from('leads').select('*').eq('user_id', user.id),
        supabase.from('orders').select('*').eq('user_id', user.id),
        supabase.from('automations').select('*').eq('user_id', user.id),
      ])
      setLeads((l ?? []) as Lead[])
      setOrders((o ?? []) as Order[])
      setAutomations((a ?? []) as Automation[])
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)
  const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100).toFixed(1) : '0'
  const totalRuns = automations.reduce((s, a) => s + a.run_count, 0)
  const activeAutos = automations.filter(a => a.status === 'active').length

  const leadsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const day = d.toLocaleDateString(loc === 'es' ? 'es-CO' : 'en-US', { weekday: 'short' })
    const count = leads.filter(l => new Date(l.created_at).toDateString() === d.toDateString()).length
    return { day, leads: count }
  })

  const months: Record<string, number> = {}
  orders.filter(o => o.payment_status === 'paid').forEach(o => {
    const month = new Date(o.created_at).toLocaleDateString(loc === 'es' ? 'es-CO' : 'en-US', { month: 'short' })
    months[month] = (months[month] ?? 0) + o.total
  })
  const revByMonth = Object.entries(months).slice(-6).map(([month, revenue]) => ({ month, revenue }))

  const statusDist = [
    { name: loc === 'es' ? 'Nuevos' : 'New', value: leads.filter(l => l.status === 'new').length, color: BLUE },
    { name: loc === 'es' ? 'Calificados' : 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: GREEN },
    { name: loc === 'es' ? 'Contactados' : 'Contacted', value: leads.filter(l => l.status === 'contacted').length, color: YELLOW },
    { name: loc === 'es' ? 'Convertidos' : 'Converted', value: leads.filter(l => l.status === 'converted').length, color: PINK },
  ].filter(s => s.value > 0)

  const funnel = [
    { name: loc === 'es' ? 'Conocimiento' : 'Awareness', value: leads.filter(l => l.stage === 'awareness').length },
    { name: loc === 'es' ? 'Interés' : 'Interest', value: leads.filter(l => l.stage === 'interest').length },
    { name: loc === 'es' ? 'Consideración' : 'Consideration', value: leads.filter(l => l.stage === 'consideration').length },
    { name: loc === 'es' ? 'Intención' : 'Intent', value: leads.filter(l => l.stage === 'intent').length },
    { name: loc === 'es' ? 'Compra' : 'Purchase', value: leads.filter(l => l.stage === 'purchase').length },
  ]

  const STATS = [
    { label: 'Total Leads', value: formatNumber(leads.length, loc), icon: Users, delta: '+12%', color: PINK },
    { label: loc === 'es' ? 'Conversión' : 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, delta: '+4.1%', color: GREEN },
    { label: loc === 'es' ? 'Ejecuciones' : 'Auto Runs', value: formatNumber(totalRuns, loc), icon: Zap, delta: `${activeAutos} ${loc === 'es' ? 'activas' : 'active'}`, color: BLUE },
    { label: loc === 'es' ? 'Ingresos' : 'Revenue', value: formatCurrency(totalRevenue, 'USD', loc), icon: DollarSign, delta: '+23%', color: YELLOW },
  ]

  const noData = (label: string) => loc === 'es' ? `Sin ${label} aún` : `No ${label} yet`

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div><h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Analítica' : 'Analytics'}</h1><p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Rendimiento de tus automatizaciones, leads y ventas' : 'Performance across automations, leads, and sales'}</p></div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="card rounded-2xl p-5 relative overflow-hidden" style={{ borderColor: `${stat.color}22` }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: stat.color, transform: 'translate(30%,-30%)' }} />
            <div className="flex items-start justify-between mb-3"><p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-3)' }}>{stat.label}</p><stat.icon size={15} style={{ color: stat.color }} /></div>
            <p className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{stat.value}</p>
            <p className="text-xs flex items-center gap-1 text-green-400"><ArrowUpRight size={11} /> {stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6">
          <h2 className="font-display font-bold text-base mb-6" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Leads — Últimos 7 días' : 'Leads — Last 7 Days'}</h2>
          {leadsByDay.every(d => d.leads === 0) ? <EmptyChart icon={Users} text={noData('leads')} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leadsByDay}><defs><linearGradient id="lgPink" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PINK} stopOpacity={0.3} /><stop offset="95%" stopColor={PINK} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} /><YAxis hide allowDecimals={false} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="leads" name="Leads" stroke={PINK} strokeWidth={2} fill="url(#lgPink)" dot={{ fill: PINK, r: 4 }} /></AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card rounded-2xl p-6">
          <h2 className="font-display font-bold text-base mb-6" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Ingresos por Mes' : 'Revenue by Month'}</h2>
          {revByMonth.length === 0 ? <EmptyChart icon={DollarSign} text={noData('sales')} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revByMonth}><XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CustomTooltip />} /><Bar dataKey="revenue" name={loc === 'es' ? 'Ingresos' : 'Revenue'} fill={BLUE} radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card rounded-2xl p-6">
          <h2 className="font-display font-bold text-base mb-6" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Distribución de Leads' : 'Lead Distribution'}</h2>
          {statusDist.length === 0 ? <EmptyChart icon={Users} text={noData('leads')} /> : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}><PieChart><Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">{statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer>
              <div className="flex-1 space-y-2">{statusDist.map(s => (<div key={s.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-sm" style={{ color: 'var(--text-2)' }}>{s.name}</span></div><span className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{s.value}</span></div>))}</div>
            </div>
          )}
        </div>

        <div className="card rounded-2xl p-6">
          <h2 className="font-display font-bold text-base mb-6" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Embudo de Conversión' : 'Conversion Funnel'}</h2>
          {funnel.every(f => f.value === 0) ? <EmptyChart icon={TrendingUp} text={noData('funnel data')} /> : (
            <ResponsiveContainer width="100%" height={200}><BarChart data={funnel} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={100} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="value" name="Leads" fill={PINK} radius={[0, 6, 6, 0]} background={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }} /></BarChart></ResponsiveContainer>
          )}
        </div>
      </div>

      {automations.length > 0 && (
        <div className="card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}><h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Rendimiento de Automatizaciones' : 'Automation Performance'}</h2></div>
          <table className="jut-table"><thead><tr><th>{loc === 'es' ? 'Nombre' : 'Name'}</th><th>Status</th><th>{loc === 'es' ? 'Ejecuciones' : 'Runs'}</th><th>Trigger</th></tr></thead><tbody>{automations.sort((a, b) => b.run_count - a.run_count).map(a => (<tr key={a.id}><td className="font-semibold" style={{ color: 'var(--text)' }}>{a.name}</td><td><span className="badge text-xs capitalize" style={a.status === 'active' ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.2)' } : { background: 'var(--surface-2)', color: 'var(--text-3)', borderColor: 'var(--border)' }}>{a.status}</span></td><td><div className="flex items-center gap-3"><div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}><div className="h-full rounded-full" style={{ width: `${Math.max(...automations.map(x => x.run_count), 1) > 0 ? (a.run_count / Math.max(...automations.map(x => x.run_count), 1) * 100) : 0}%`, background: PINK }} /></div><span className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{a.run_count}</span></div></td><td className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{a.trigger.type?.replace(/_/g, ' ')}</td></tr>))}</tbody></table>
        </div>
      )}
    </div>
  )
}
