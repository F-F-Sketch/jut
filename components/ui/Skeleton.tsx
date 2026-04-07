interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'var(--surface-2)', ...style }}
    />
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton style={{ height: 32, width: 240 }} />
        <Skeleton style={{ height: 16, width: 360 }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card rounded-2xl p-5 space-y-3">
            <Skeleton style={{ height: 12, width: 80 }} />
            <Skeleton style={{ height: 36, width: 120 }} />
            <Skeleton style={{ height: 10, width: 60 }} />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <Skeleton style={{ height: 18, width: 140 }} />
              <Skeleton style={{ height: 14, width: 60 }} />
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div className="flex-1 space-y-2">
                    <Skeleton style={{ height: 14, width: '60%' }} />
                    <Skeleton style={{ height: 11, width: '40%' }} />
                  </div>
                  <Skeleton style={{ height: 20, width: 64, borderRadius: 100 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TablePageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton style={{ height: 32, width: 180 }} />
          <Skeleton style={{ height: 16, width: 280 }} />
        </div>
        <Skeleton style={{ height: 40, width: 140, borderRadius: 10 }} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} style={{ height: 36, width: 100, borderRadius: 12 }} />
        ))}
      </div>

      {/* Search */}
      <Skeleton style={{ height: 44, borderRadius: 12 }} />

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="border-b" style={{ borderColor: 'var(--border)', padding: '12px 24px' }}>
          <div className="flex gap-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} style={{ height: 12, width: 80 }} />
            ))}
          </div>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 flex-1">
              <Skeleton style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div className="space-y-1.5">
                <Skeleton style={{ height: 13, width: 140 }} />
                <Skeleton style={{ height: 11, width: 100 }} />
              </div>
            </div>
            <Skeleton style={{ height: 13, width: 80 }} />
            <Skeleton style={{ height: 22, width: 72, borderRadius: 100 }} />
            <Skeleton style={{ height: 22, width: 72, borderRadius: 100 }} />
            <Skeleton style={{ height: 13, width: 60 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton style={{ width: 36, height: 36, borderRadius: 12 }} />
        <div className="space-y-2">
          <Skeleton style={{ height: 24, width: 200 }} />
          <Skeleton style={{ height: 14, width: 300 }} />
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card rounded-2xl p-6 space-y-4">
          <Skeleton style={{ height: 18, width: 160 }} />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton style={{ height: 12, width: 80 }} />
                <Skeleton style={{ height: 44, borderRadius: 12 }} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton style={{ height: 12, width: 80 }} />
            <Skeleton style={{ height: 88, borderRadius: 12 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
