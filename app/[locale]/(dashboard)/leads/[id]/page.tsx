import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Instagram, Tag, Clock, MessageSquare } from 'lucide-react'
import { formatDatetime, STATUS_COLORS, SOURCE_LABELS } from '@/lib/utils'
import type { Lead } from '@/types'

export default async function LeadDetailPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params
  const t = await getTranslations('leads')
  const user = await getUser()
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).eq('user_id', user!.id).single()
  if (!data) notFound()
  const lead = data as Lead
  const loc = locale as 'en' | 'es'

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/leads`} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}><ArrowLeft size={16} style={{ color: 'var(--text-2)' }} /></Link>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{lead.full_name}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{SOURCE_LABELS[lead.source]?.[loc]} · {formatDatetime(lead.created_at, loc)}</p>
        </div>
        <span className={`badge ml-auto ${STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] ?? ''}`}>{lead.status}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="card rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Información de contacto' : 'Contact Information'}</h2>
            {[
              { icon: Mail, label: t('email'), value: lead.email },
              { icon: Phone, label: t('phone'), value: lead.phone },
              { icon: Instagram, label: 'Instagram', value: lead.instagram_handle ? `@${lead.instagram_handle}` : null },
              { icon: Tag, label: t('stage'), value: lead.stage },
            ].map(({ icon: Icon, label, value }) => value && (
              <div key={label} className="flex items-center gap-3">
                <Icon size={15} style={{ color: 'var(--text-3)' }} />
                <span className="text-xs w-20" style={{ color: 'var(--text-3)' }}>{label}</span>
                <span className="text-sm" style={{ color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="card rounded-2xl p-6 space-y-3">
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{t('notes')}</h2>
            <textarea className="input w-full resize-none min-h-[100px]" placeholder={t('add_note')} defaultValue={lead.notes ?? ''} />
            <button className="btn-primary text-sm px-4 py-2">{t('save')}</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card rounded-2xl p-5 space-y-3">
            <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Acciones rápidas' : 'Quick Actions'}</h2>
            {[
              { label: locale === 'es' ? 'Ver conversación' : 'View Conversation', icon: MessageSquare, href: lead.conversation_id ? `/${locale}/conversations/${lead.conversation_id}` : '#' },
            ].map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href} className="btn-secondary text-sm w-full flex items-center gap-2 justify-center"><Icon size={14} />{label}</Link>
            ))}
          </div>
          <div className="card rounded-2xl p-5">
            <h2 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--text)' }}>{t('tags')}</h2>
            <div className="flex flex-wrap gap-2">
              {lead.tags.length === 0 ? <p className="text-xs" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? 'Sin etiquetas' : 'No tags'}</p> : lead.tags.map(tag => <span key={tag} className="badge text-xs" style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)', borderColor: 'rgba(237,25,102,0.2)' }}>{tag}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
