'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  delta?: string
  deltaPositive?: boolean
  accent?: 'pink' | 'blue' | 'green' | 'yellow'
  className?: string
}

const ACCENT_MAP = {
  pink:   { bg: 'rgba(237,25,102,0.1)',  icon: 'rgba(237,25,102,1)',  border: 'rgba(237,25,102,0.15)' },
  blue:   { bg: 'rgba(33,82,164,0.12)',  icon: '#4a90d9',             border: 'rgba(33,82,164,0.2)'   },
  green:  { bg: 'rgba(34,197,94,0.1)',   icon: '#22c55e',             border: 'rgba(34,197,94,0.15)'  },
  yellow: { bg: 'rgba(245,158,11,0.1)',  icon: '#f59e0b',             border: 'rgba(245,158,11,0.15)' },
}

export function StatCard({
  label, value, icon: Icon, delta, deltaPositive = true, accent = 'pink', className
}: StatCardProps) {
  const colors = ACCENT_MAP[accent]

  return (
    <div
      className={cn('card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px]', className)}
      style={{ borderColor: colors.border }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: colors.bg, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--text-3)' }}>
            {label}
          </p>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>
            {value}
          </p>
          {delta && (
            <p className={cn('text-xs mt-1.5 font-medium', deltaPositive ? 'text-green-400' : 'text-red-400')}>
              {deltaPositive ? '↑' : '↓'} {delta}
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon size={19} style={{ color: colors.icon }} />
        </div>
      </div>
    </div>
  )
}
