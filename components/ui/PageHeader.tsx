import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  breadcrumb?: { label: string; href?: string }[]
}

export function PageHeader({ title, subtitle, icon: Icon, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(237,25,102,0.1)',
              border: '1px solid rgba(237,25,102,0.2)',
            }}
          >
            <Icon size={20} style={{ color: 'var(--pink)' }} />
          </div>
        )}
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 mb-1">
              {breadcrumb.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  {i > 0 && <span style={{ color: 'var(--text-3)' }}>/</span>}
                  <span
                    className="text-xs"
                    style={{ color: i === breadcrumb.length - 1 ? 'var(--text-3)' : 'var(--pink)' }}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          )}
          <h1
            className="font-display font-bold"
            style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--text)', lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  )
}
