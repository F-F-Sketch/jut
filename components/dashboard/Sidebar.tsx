'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, MessageSquare, Zap,
  AtSign, ShoppingBag, Building2, BarChart3,
  Settings, HelpCircle, ChevronRight, Sparkles
} from 'lucide-react'

interface SidebarProps {
  locale: string
  userName?: string | null
  userPlan?: string
}

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'leads', href: '/leads', icon: Users },
  { key: 'conversations', href: '/conversations', icon: MessageSquare },
  { key: 'automations', href: '/automations', icon: Zap },
  { key: 'social', href: '/social', icon: AtSign },
  { key: 'sales', href: '/sales', icon: ShoppingBag },
  { key: 'business', href: '/business', icon: Building2 },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'help', href: '/help', icon: HelpCircle },
]

export function Sidebar({ locale, userName, userPlan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('sidebar')

  const isActive = (href: string) => {
    const full = `/${locale}${href}`
    return pathname === full || pathname.startsWith(`${full}/`)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40"
      style={{
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[68px] border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
          style={{ background: 'var(--pink)', boxShadow: '0 0 20px rgba(237,25,102,0.4)' }}
        >
          J
        </div>
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
              <span className="flex-1">{t(key as keyof typeof t)}</span>
              {active && <ChevronRight size={14} style={{ color: 'var(--pink)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade card */}
      {userPlan === 'free' && (
        <div className="px-3 mb-3">
          <div
            className="rounded-xl p-4 relative overflow-hidden"
            style={{
              background: 'rgba(237,25,102,0.08)',
              border: '1px solid rgba(237,25,102,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: 'var(--pink)' }} />
              <span className="font-display font-bold text-xs" style={{ color: 'var(--pink)' }}>
                {t('upgrade')}
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
              Unlock unlimited automations and AI conversations.
            </p>
            <Link
              href={`/${locale}/settings#billing`}
              className="btn-primary text-xs px-3 py-1.5 w-full text-center"
            >
              Upgrade now
            </Link>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
        {BOTTOM_ITEMS.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={`/${locale}${href}`}
            className={cn('nav-item', isActive(href) && 'active')}
          >
            <Icon size={17} className="flex-shrink-0" />
            <span>{t(key as keyof typeof t)}</span>
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
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {userName}
            </div>
            <div className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>
              {userPlan} plan
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
