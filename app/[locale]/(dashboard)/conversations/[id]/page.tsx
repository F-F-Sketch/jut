'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Bot, User, Loader2, Phone, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { timeAgo, CHANNEL_ICONS, cn } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

interface PageProps { params: { locale: string; id: string } }

export default function ConversationDetailPage({ params }: PageProps) {
  const { locale, id } = params
  const t = useTranslations('conversations')
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [convo, setConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: convoData } = await supabase.from('conversations').select('*').eq('id', id).single()
      const { data: msgData } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true })
      setConvo(convoData)
      setMessages((msgData ?? []) as Message[])
    }
    load()

    // Real-time subscription
    const channel = supabase.channel(`convo-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    // Insert human agent message
    const { data: msg } = await supabase.from('messages').insert({
      conversation_id: id, role: 'human_agent', content, channel: convo?.channel ?? 'internal', status: 'sent'
    }).select().single()

    if (msg) setMessages(prev => [...prev, msg as Message])

    // Update conversation
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', id)

    setSending(false)
  }

  const generateAIReply = async () => {
    if (aiLoading || messages.length === 0) return
    setAiLoading(true)

    const chatHistory = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory, conversation_id: id, locale }),
    })

    if (res.ok) {
      const { response } = await res.json()
      const { data: msg } = await supabase.from('messages').insert({
        conversation_id: id, role: 'ai', content: response, channel: convo?.channel ?? 'internal', status: 'sent'
      }).select().single()
      if (msg) setMessages(prev => [...prev, msg as Message])
    }

    setAiLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!convo) return (
    <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} /></div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-68px)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <Link href={`/${locale}/conversations`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--surface-2)' }}>
          {CHANNEL_ICONS[convo.channel] ?? '💬'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {convo.participant_name ?? convo.participant_handle ?? 'Unknown'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{convo.channel} · {convo.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAIReply}
            disabled={aiLoading}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.25)', color: 'var(--pink)' }}
            title={locale === 'es' ? 'Generar respuesta de IA' : 'Generate AI reply'}
          >
            {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Bot size={13} />}
            {locale === 'es' ? 'Respuesta IA' : 'AI Reply'}
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <MoreVertical size={15} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: 'var(--bg)' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-3)' }}>
            <Bot size={36} style={{ opacity: 0.3 }} />
            <p className="text-sm">{locale === 'es' ? 'No hay mensajes aún.' : 'No messages yet.'}</p>
          </div>
        )}
        {messages.map(msg => {
          const isAI = msg.role === 'ai'
          const isUser = msg.role === 'user'
          const isAgent = msg.role === 'human_agent'
          return (
            <div key={msg.id} className={cn('flex gap-3', !isUser && 'flex-row', isUser && 'flex-row-reverse')}>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: isAI ? 'linear-gradient(135deg, var(--pink), var(--blue))' : isAgent ? 'var(--blue)' : 'var(--surface-2)',
                  color: '#fff',
                  border: isUser ? '1px solid rgba(255,255,255,0.10)' : 'none',
                }}
              >
                {isAI ? <Bot size={14} /> : isAgent ? <User size={14} /> : (convo.participant_name ?? 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className={cn('max-w-[70%]', isUser && 'items-end')}>
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: isUser ? 'rgba(237,25,102,0.1)' : 'var(--surface)',
                    border: `1px solid ${isUser ? 'rgba(237,25,102,0.2)' : 'var(--border)'}`,
                    color: 'var(--text)',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  {isAI && <span className="text-xs font-medium" style={{ color: 'var(--pink)' }}>{t('ai_label')}</span>}
                  {isAgent && <span className="text-xs" style={{ color: 'var(--blue)' }}>{t('human_label')}</span>}
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(msg.created_at, locale as 'en' | 'es')}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('type_message')}
            rows={1}
            className="input flex-1 resize-none min-h-[44px] max-h-32 py-3"
            style={{ lineHeight: 1.5 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: input.trim() ? 'var(--pink)' : 'var(--surface-2)', border: '1px solid var(--border-2)' }}
          >
            {sending ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} style={{ color: input.trim() ? '#fff' : 'var(--text-3)' }} />}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
          {locale === 'es' ? 'Enter para enviar · Shift+Enter para nueva línea' : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
