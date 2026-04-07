import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { timeAgo, STATUS_COLORS, CHANNEL_ICONS } from '@/lib/utils'
import type { Lead } from '@/types'

interface PageProps { params: { locale: string } }

export default async function LeadsPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('leads')
  const user = await getUser()
  const supabase = await createClient()
  const { data: leads } = await supabase.from('leads').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
  const all = (leads ?? []) as Lead[]

  const stages = [
    { key: 'all', label: t('all_leads'), count: all.length },
    { key: 'qualified', label: t('qualified'), count: all.filter(l => l.status === 'qualified').length },
    { key: 'new', label: locale === 'es' ? 'Nuevos' : 'New', count: all.filter(l => l.status === 'new').length },
    { key: 'converted', label: t('converted'), count: all.filter(l => l.status === 'converted').length },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/leads/new`} className="btn-primary flex items-center gap-2"><Plus size={15} />{t('new_lead')}</Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {stages.map(s => (
          <div key={s.key} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm cursor-pointer transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
            <span>{s.label}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{s.count}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input type="text" placeholder={t('search')} className="input pl-10" />
        </div>
        <button className="btn-secondary flex items-center gap-2 px-4"><Filter size={14} />{locale === 'es' ? 'Filtrar' : 'Filter'}</button>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        {all.length === 0 ? (
          <div className="empty-state">
            <span className="text-5xl">👤</span>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-2)' }}>{t('empty_title')}</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-3)' }}>{t('empty_desc')}</p>
            <Link href={`/${locale}/automations`} className="btn-primary mt-2">{locale === 'es' ? 'Crear Automatización' : 'Create Automation'}</Link>
          </div>
        ) : (
          <table className="jut-table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('source')}</th>
                <th>{t('status')}</th>
                <th>{t('stage')}</th>
                <th>{t('created')}</th>
              </tr>
            </thead>
            <tbody>
              {all.map(lead => (
                <tr key={lead.id} className="cursor-pointer">
                  <td>
                    <Link href={`/${locale}/leads/${lead.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>{lead.full_name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{lead.full_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{lead.email ?? lead.instagram_handle ?? '—'}</p>
                      </div>
                    </Link>
                  </td>
                  <td><span className="flex items-center gap-1 text-xs">{CHANNEL_ICONS[lead.source] ?? '🔗'} {lead.source.replace('_', ' ')}</span></td>
                  <td><span className={`badge text-xs ${STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] ?? ''}`}>{lead.status}</span></td>
                  <td><span className="text-xs capitalize">{lead.stage}</span></td>
                  <td><span className="text-xs">{timeAgo(lead.created_at, locale as 'en' | 'es')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
