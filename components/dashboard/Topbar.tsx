'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search, Globe, LogOut, User, ChevronDown, Settings, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { CommandPalette } from './CommandPalette'

interface TopbarProps { locale: string; userName?: string | null }

const TYPE_ICONS: Record<string, string> = {
  automation_fired: '⚡', lead_captured: '👤', lead_qualified: '🎯',
  sale: '💰', system: '🔔', automation_failed: '❌', conversation_started: '💬',
}

export function Topbar({ locale, userName }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load real notifications
  useEffect(() => {
    loadNotifications()

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 20))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadNotifications() {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data ?? [])
    } catch { /* table may not exist yet */ }
  }

  async function markAllRead() {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ read: true }).in('id', ids)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function dismissNotif(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  function timeAgoStr(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // ⌘K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const switchLocale = (l: string) => {
    router.push(window.location.pathname.replace(`/${locale}`, `/${l}`))
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-64 h-[68px] z-30 flex items-center px-6 gap-4"
        style={{ background: 'rgba(13,13,20,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>

        <div className="flex-1" />

        {/* Search */}
        <button onClick={() => setCmdOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all hover:opacity-80"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text-3)', minWidth: 220 }}>
          <Search size={13} />
          <span className="flex-1 text-left">{locale === 'es' ? 'Buscar...' : 'Search...'}</span>
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-3)', fontFamily: 'monospace' }}>⌘K</kbd>
        </button>

        {/* Lang */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <Globe size={11} style={{ color: 'var(--text-3)', marginLeft: 3 }} />
          {['en', 'es'].map(l => (
            <button key={l} onClick={() => switchLocale(l)}
              className="text-xs font-bold px-2.5 py-1 rounded-md transition-all"
              style={l === locale ? { background: 'var(--pink)', color: '#fff' } : { color: 'var(--text-3)' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: notifOpen ? 'var(--surface-2)' : 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <Bell size={15} style={{ color: 'var(--text-2)' }} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: 'var(--pink)', fontSize: 9 }}>{unread}</span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
                  {locale === 'es' ? 'Notificaciones' : 'Notifications'}
                  {unread > 0 && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--pink)', color: '#fff' }}>{unread}</span>}
                </span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs flex items-center gap-1" style={{ color: 'var(--pink)' }}>
                    <Check size={11} /> {locale === 'es' ? 'Leer todo' : 'Mark all read'}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                      {locale === 'es' ? 'Sin notificaciones aún' : 'No notifications yet'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                      {locale === 'es' ? 'Las automatizaciones aparecerán aquí' : 'Automations will appear here'}
                    </p>
                  </div>
                ) : notifications.map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b group"
                    style={{ borderColor: 'var(--border)', background: n.read ? 'transparent' : 'rgba(237,25,102,0.04)' }}>
                    <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: n.read ? 'var(--text-3)' : 'var(--text)' }}>{n.title}</p>
                      {n.body && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{n.body}</p>}
                      <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{timeAgoStr(n.created_at)}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--pink)' }} />}
                    <button onClick={(e) => dismissNotif(n.id, e)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: 'var(--text-3)' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
            style={{ background: userMenuOpen ? 'var(--surface-2)' : 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}>
              {(userName ?? 'U').slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden md:block" style={{ color: 'var(--text)' }}>{userName ?? 'User'}</span>
            <ChevronDown size={12} style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1.5 z-50"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{userName}</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>JUT Account</p>
              </div>
              <Link href={`/${locale}/settings`} onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-2)]" style={{ color: 'var(--text-2)' }}>
                <User size={14} />{locale === 'es' ? 'Perfil' : 'Profile'}
              </Link>
              <Link href={`/${locale}/settings`} onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-2)]" style={{ color: 'var(--text-2)' }}>
                <Settings size={14} />{locale === 'es' ? 'Ajustes' : 'Settings'}
              </Link>
              <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-2)]" style={{ color: '#ef4444' }}>
                <LogOut size={14} />{locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} locale={locale} />
    </>
  )
}
