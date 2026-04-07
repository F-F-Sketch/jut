import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon | string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-10' : size === 'lg' ? 'py-24' : 'py-16'
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} gap-4 px-6`}>
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          width: iconSize + 32,
          height: iconSize + 32,
          background: 'rgba(237,25,102,0.08)',
          border: '1px solid rgba(237,25,102,0.15)',
        }}
      >
        {typeof Icon === 'string' ? (
          <span style={{ fontSize: iconSize }}>{Icon}</span>
        ) : (
          <Icon size={iconSize} style={{ color: 'rgba(237,25,102,0.6)' }} />
        )}
      </div>

      <div>
        <h3
          className="font-display font-bold mb-2"
          style={{
            fontSize: size === 'sm' ? 15 : size === 'lg' ? 22 : 18,
            color: 'var(--text-2)',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="max-w-xs mx-auto leading-relaxed"
            style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 300 }}
          >
            {description}
          </p>
        )}
      </div>

      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="btn-primary text-sm mt-2">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary text-sm mt-2">
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  )
}
