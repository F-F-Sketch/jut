'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  params?: { locale?: string }
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle size={28} style={{ color: '#ef4444' }} />
        </div>

        <h2 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text)' }}>
          Page failed to load
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
          Something went wrong loading this page. This is usually a temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div
            className="rounded-xl p-4 mb-6 text-left"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <p className="text-xs font-mono break-words" style={{ color: '#ef4444' }}>
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <Link href="/en/dashboard" className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
