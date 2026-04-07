import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [
    { count: totalLeads },
    { count: leadsToday },
    { count: leadsThisWeek },
    { count: activeConvos },
    ordersRes,
    autosRes,
    { count: aiRunsToday },
  ] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfDay),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfWeek),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
    supabase.from('orders').select('total').eq('user_id', user.id).eq('payment_status', 'paid').gte('created_at', startOfMonth),
    supabase.from('automations').select('run_count').eq('user_id', user.id),
    supabase.from('ai_runs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfDay),
  ])

  const revenueThisMonth = (ordersRes.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0)
  const automationsFiredTotal = (autosRes.data ?? []).reduce((s, a) => s + (a.run_count ?? 0), 0)

  const totalLeadsNum = totalLeads ?? 0
  const convertedLeads = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'converted')
  const conversionRate = totalLeadsNum > 0 ? ((convertedLeads.count ?? 0) / totalLeadsNum) * 100 : 0

  return NextResponse.json({
    data: {
      total_leads: totalLeadsNum,
      leads_today: leadsToday ?? 0,
      leads_this_week: leadsThisWeek ?? 0,
      active_conversations: activeConvos ?? 0,
      automations_fired_total: automationsFiredTotal,
      ai_runs_today: aiRunsToday ?? 0,
      revenue_this_month: revenueThisMonth,
      conversion_rate: Math.round(conversionRate * 10) / 10,
    },
  })
}
