import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, Zap, Play, Pause, MoreHorizontal } from 'lucide-react'
import { timeAgo, STATUS_COLORS } from '@/lib/utils'
import type { Automation } from '@/types'

interface PageProps { params: { locale: string } }

const TRIGGER_ICONS: Record<string, string> = {
  instagram_comment: '💬', instagram_dm: '📩', keyword_match: '🔑', new_follower: '👤', schedule: '⏰', webhook: '🔗', manual: '▶️',
}

export default async function AutomationsPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('automations')
  const user = await getUser()
  const supabase = await createClient()
  const { data } = await supabase.from('automations').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
  const automations = (data ?? []) as Automation[]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/automations/new`} className="btn-primary flex items-center gap-2"><Plus size={15} />{t('new')}</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: locale === 'es' ? 'Total' : 'Total', value: automations.length },
          { label: t('active'), value: automations.filter(a => a.status === 'active').length },
          { label: locale === 'es' ? 'Ejecuciones totales' : 'Total runs', value: automations.reduce((s, a) => s + a.run_count, 0) },
        ].map(stat => (
          <div key={stat.label} className="card rounded-2xl p-5 text-center">
            <p className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {automations.length === 0 ? (
        <div className="card rounded-2xl">
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}><Zap size={28} style={{ color: 'var(--pink)' }} /></div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-2)' }}>{t('empty_title')}</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-3)' }}>{t('empty_desc')}</p>
            <Link href={`/${locale}/automations/new`} className="btn-primary mt-2 flex items-center gap-2"><Plus size={14} />{t('new')}</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map(auto => (
            <div key={auto.id} className="card-hover rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                {TRIGGER_ICONS[auto.trigger.type] ?? '⚡'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{auto.name}</h3>
                  <span className={`badge text-xs ${STATUS_COLORS[auto.status as keyof typeof STATUS_COLORS] ?? ''}`}>{auto.status}</span>
                </div>
                <p className="text-sm truncate mb-2" style={{ color: 'var(--text-3)' }}>{auto.description ?? `Trigger: ${auto.trigger.type.replace('_', ' ')}`}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                  <span>⚡ {auto.run_count} {t('runs')}</span>
                  {auto.last_run_at && <span>🕐 {timeAgo(auto.last_run_at, locale as 'en' | 'es')}</span>}
                  <span>📋 {auto.actions.length} {t('actions')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                  {auto.status === 'active' ? <Pause size={14} style={{ color: 'var(--text-2)' }} /> : <Play size={14} style={{ color: 'var(--pink)' }} />}
                </button>
                <Link href={`/${locale}/automations/${auto.id}`} className="btn-secondary text-xs px-3 py-2">{locale === 'es' ? 'Editar' : 'Edit'}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
