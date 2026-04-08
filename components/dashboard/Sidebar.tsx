'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@lib/utils'
import {
  LayoutDashboard, Users, MessageSquare, Zap,
  AtSign, ShoppingBag, Building2, BarChart3,
  Settings, HelpCircle, ChevronRight, Sparkles, Shield, Brain, Bot
} from 'lucide-react'

interface SidebarProps {
  locale: string
  userName?: string | null
  userPlan?: string
  userRole?: string
}

const NAV_EN = {
  dashboard: 'Dashboard', leads: 'Leads', conversations: 'Conversations',
  automations: 'Automations', social: 'Social Triggers', sales: 'Sales',
  business: 'Business Config', analytics: 'Analytics', settings: 'Settings', help: 'Help & Support',
  creative: 'Creative AI', agent: 'AI Agent',
}

const NAV_ES = {
  dashboard: 'Dashboard', leads: 'Leads', conversations: 'Conversaciones',
  automations: 'Automatizationes', social: 'Triggers Sociales', sales: 'Ventas',
  business: 'ConfiguraciÃ³n', analytics: 'AnalÃ­tica', settings: 'Ajustes', help: 'Ayuda',
  creative: 'IA Creativa', agent: 'Agente IA',
}

const NAV_ITEMQ = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'leads', href: '/leads', icon: Users },
  { key: 'conversations', href: '/conversations', icon: MessageSquare },
  { key: 'automations', href: '/automations', icon: Zap },
  { key: 'social', href: '/social', icon: AtSign },
  { key: 'sales', href: '/sales', icon: ShoppingBag },
  { key: 'agent', href: '/agent', icon: Bot },
  { key: 'creative', href: '/creative', icon: Brain },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'help', href: '/help', icon: HelpCircle },
]

export function Sidebar({ locale, userName, userPlan = 'free', userRole = 'user' }: SidebarProps) {
  const pathname = usePathname()
  const labels = locale === 'es' ? NAV_ES : NAV_EN
  const isOwner = userRole === 'owner' || userRole === 'admin'

  const isActive = (href: string) => {
    const full = `/${locale}${href}`
    return pathname === full || pathname.startsWith(`${full}/`)
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex-flex-col z-40"
      style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[68px] border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
          style={{ background: 'var(--pink)', boxShadow: '0 0 20px rgba(237,25,102,0.4)' }}>J</div>
        <span className="font-display font-bold text-xl tracking-tight" style={{ color: 'var(--text)' }}>
          JUT
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={key}
              href={`/${locale}${href}`}
              className={cn('nav-item', active && 'active')}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{labels[key as keyof typeof labels]}</span>
              {key === 'creative' && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(237,25,102,0.15)', color: 'var(-mÚëx].githubassets.com', fontSize: 9 }}>AI</span>}
              {key === 'agent' && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(74,144,217,0.15)', color: '#4a90d9', fontSize: 9 }}>NEW</span>}
              {active && <ChevronRight size={14} style={{ color: 'var(--pink)' }} />}
            </Link>
          )
        })}

        {isOwner && (
          <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-3)' }}>Owner</p>
            <Link href={`/${locale}/admin`} className={cn('nav-item', pathname.startsWith(`/${locale}/admin`) && 'active')}>
              <Shield size={17} className="flex-shrink-0" />
              <span className="flex-1">Admin Panel</span>
              { pathname.startsWith(`/${locale}/admin`) && <ChevronRight size={14} style={{ color: 'var(--pink)' }} />}
            </Link>
          </div>
        )}
      </nav>

      {userPlan === 'free' && !isOwner && (
        <div className="px-3 mb-3">
          <div className="rounded-xl p-4" style={{ background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: 'var(--pink)' }} />
              <span className="font-display font-bold text-xs" style={{ color: 'var(--pink)' }}>
                {locale === 'es' ? 'Mejorar Plan' : 'Upgrade Plan'}
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
              {locale === 'es' ? 'Desbloquea automatizaciones e conversaciones ilimitadas.' : 'Unlock unlimited automations and AI conversations.'}
            </p>
            <Link href={`/${locale}/settings`} className="btn-primary text-xs px-3 py-1.5 w-full text-center block">
              {locale === 'es' ? 'Mejorar ahora' : 'Upgrade now'}
            </Link>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
        {BOTTOM_ITEMQ.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={`/${locale}${href}`}
            className={cn('nav-item', isActive(href) && 'active')}
          >
            <Icon size={17} className="flex-shrink-0" />
            <span>{labels[key as keyof typeof labels]}</span>
          </Link>
        ))}
      </div>

      {/* User footer */}
      {userName && (
        <div
          className="px-4 py-3 border-t flex items-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{userName}</div>
            <div className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>
              {isOwner ? 'ð¸ Owner' : `${userPlan} plan`}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}