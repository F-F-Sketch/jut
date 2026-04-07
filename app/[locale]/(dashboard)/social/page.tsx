import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, AtSign, Zap } from 'lucide-react'
import type { SocialTrigger } from '@/types'

interface PageProps { params: { locale: string } }

export default async function SocialPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('social')
  const user = await getUser()
  const supabase = await createClient()
  const { data } = await supabase.from('social_triggers').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
  const triggers = (data ?? []) as SocialTrigger[]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/social/new`} className="btn-primary flex items-center gap-2"><Plus size={15} />{t('new_trigger')}</Link>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { platform: 'Instagram', icon: '📸', connected: false, color: 'rgba(237,25,102,0.1)', border: 'rgba(237,25,102,0.2)' },
          { platform: 'Facebook', icon: '📘', connected: false, color: 'rgba(33,82,164,0.1)', border: 'rgba(33,82,164,0.2)' },
          { platform: 'WhatsApp', icon: '💬', connected: false, color: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
        ].map(p => (
          <div key={p.platform} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: p.color, border: `1px solid ${p.border}` }}>
            <span className="text-3xl">{p.icon}</span>
            <div className="flex-1">
              <p className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{p.platform}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.connected ? (locale === 'es' ? 'Conectado' : 'Connected') : (locale === 'es' ? 'No conectado' : 'Not connected')}</p>
            </div>
            <button className={p.connected ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}>
              {p.connected ? (locale === 'es' ? 'Gestionar' : 'Manage') : (locale === 'es' ? 'Conectar' : 'Connect')}
            </button>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card rounded-2xl p-6">
        <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Cómo funcionan los triggers' : 'How triggers work'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', icon: '💬', title: locale === 'es' ? 'Alguien comenta' : 'Someone comments', desc: locale === 'es' ? 'En tu reel, post o historia de Instagram' : 'On your Instagram reel, post or story' },
            { step: '02', icon: '🔍', title: locale === 'es' ? 'JUT detecta' : 'JUT detects', desc: locale === 'es' ? 'El comentario y busca tus palabras clave configuradas' : 'The comment and matches your configured keywords' },
            { step: '03', icon: '📩', title: locale === 'es' ? 'DM automático' : 'Auto DM sent', desc: locale === 'es' ? 'Se envía un mensaje personalizado al instante' : 'A personalized message is sent instantly' },
          ].map(s => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display font-bold flex-shrink-0" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', border: '1px solid rgba(237,25,102,0.2)' }}>{s.step}</div>
              <div>
                <div className="text-lg mb-1">{s.icon}</div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Triggers list */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Triggers configurados' : 'Configured Triggers'}</h2>
        </div>
        {triggers.length === 0 ? (
          <div className="empty-state">
            <AtSign size={32} style={{ color: 'var(--text-3)' }} />
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-2)' }}>{t('empty_title')}</h3>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('empty_desc')}</p>
          </div>
        ) : (
          <table className="jut-table">
            <thead><tr><th>{t('platform')}</th><th>{t('content_type')}</th><th>{t('keyword')}</th><th>{t('status')}</th></tr></thead>
            <tbody>
              {triggers.map(trigger => (
                <tr key={trigger.id}>
                  <td className="capitalize">{trigger.platform}</td>
                  <td className="capitalize">{trigger.content_type}</td>
                  <td><div className="flex gap-1 flex-wrap">{trigger.keywords.map(k => <span key={k} className="badge text-xs" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', borderColor: 'rgba(237,25,102,0.2)' }}>{k}</span>)}</div></td>
                  <td><span className="badge text-xs" style={trigger.status === 'active' ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.2)' } : { background: 'var(--surface-2)', color: 'var(--text-3)', borderColor: 'var(--border)' }}>{trigger.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
