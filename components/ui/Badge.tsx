import { cn, STATUS_COLORS, CHANNEL_ICONS } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'pink' | 'blue' | 'green' | 'yellow' | 'red' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-surface-2 text-text-2 border-border',
  pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  muted: 'bg-surface-3/50 text-surface-400 border-surface-600/20',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? 'bg-surface-2 text-surface-400 border-surface-600/20'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold capitalize',
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5',
        colorClass,
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: status === 'active' || status === 'qualified' || status === 'completed' || status === 'paid'
            ? '#22c55e'
            : status === 'new' || status === 'pending' || status === 'draft'
            ? '#3b82f6'
            : status === 'converted'
            ? '#ED1966'
            : '#f59e0b',
        }}
      />
      {status.replace('_', ' ')}
    </span>
  )
}

interface ChannelBadgeProps {
  channel: string
  size?: 'sm' | 'md'
}

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const icon = CHANNEL_ICONS[channel] ?? '💬'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border capitalize',
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5',
      )}
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border-2)',
        color: 'var(--text-2)',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: size === 'sm' ? 12 : 14 }}>{icon}</span>
      {channel}
    </span>
  )
}

interface PlanBadgeProps { plan: string }

export function PlanBadge({ plan }: PlanBadgeProps) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    free:    { bg: 'rgba(136,136,168,0.1)', color: '#8888a8', border: 'rgba(136,136,168,0.2)' },
    starter: { bg: 'rgba(33,82,164,0.12)',  color: '#4a90d9', border: 'rgba(33,82,164,0.25)' },
    growth:  { bg: 'rgba(237,25,102,0.1)',  color: '#ED1966', border: 'rgba(237,25,102,0.25)' },
    elite:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  }
  const s = styles[plan] ?? styles.free
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-1 capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {plan === 'elite' ? '💎' : plan === 'growth' ? '⚡' : plan === 'starter' ? '🚀' : '✨'} {plan}
    </span>
  )
}
