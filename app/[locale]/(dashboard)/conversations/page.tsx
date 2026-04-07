import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Search, Bot, User } from 'lucide-react'
import { timeAgo, CHANNEL_ICONS } from '@/lib/utils'
import type { Conversation } from '@/types'

interface PageProps { params: { locale: string } }

export default async function ConversationsPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('conversations')
  const user = await getUser()
  const supabase = await createClient()
  const { data } = await supabase.from('conversations').select('*').eq('user_id', user!.id).order('last_message_at', { ascending: false })
  const convos = (data ?? []) as Conversation[]

  return (
    <div className="h-[calc(100vh-68px)] flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar list */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h1 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
            <input type="text" placeholder={t('search')} className="input pl-8 text-xs py-2" />
          </div>
          <div className="flex gap-2 mt-3">
            {[t('all'), t('active'), t('archived')].map(tab => (
              <button key={tab} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: tab === t('all') ? 'rgba(237,25,102,0.12)' : 'var(--surface)', color: tab === t('all') ? 'var(--pink)' : 'var(--text-3)', border: `1px solid ${tab === t('all') ? 'rgba(237,25,102,0.2)' : 'var(--border)'}` }}>{tab}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <span className="text-4xl">💬</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>{t('empty_title')}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{t('empty_desc')}</p>
            </div>
          ) : convos.map(convo => (
            <Link key={convo.id} href={`/${locale}/conversations/${convo.id}`} className="flex items-start gap-3 p-4 border-b transition-colors hover:bg-[var(--surface)]" style={{ borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--surface-2)' }}>{CHANNEL_ICONS[convo.channel] ?? '💬'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{convo.participant_name ?? convo.participant_handle ?? 'Unknown'}</p>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>{convo.last_message_at ? timeAgo(convo.last_message_at, locale as 'en' | 'es') : ''}</span>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{convo.last_message ?? '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {convo.is_automated && <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--pink)' }}><Bot size={10} />{t('ai_label')}</span>}
                  {convo.unread_count > 0 && <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--pink)' }}>{convo.unread_count}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Empty detail state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}>
            <Bot size={28} style={{ color: 'var(--pink)' }} />
          </div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-2)' }}>{locale === 'es' ? 'Selecciona una conversación' : 'Select a conversation'}</h3>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Elige una conversación de la lista para verla.' : 'Choose a conversation from the list to view it.'}</p>
        </div>
      </div>
    </div>
  )
}
