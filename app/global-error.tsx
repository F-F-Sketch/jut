'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[JUT Error]', error)
  }, [error])

  return (
    <html>
      <body style={{ background: '#050508', color: '#f0f0f8', fontFamily: "'DM Sans', system-ui, sans-serif", margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            {/* Icon */}
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              ⚠️
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 16, color: '#8888a8', lineHeight: 1.6, marginBottom: 32, fontWeight: 300 }}>
              An unexpected error occurred. Our team has been notified. Please try again or return to the dashboard.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, textAlign: 'left' }}>
                <p style={{ fontSize: 12, color: '#ef4444', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{ fontSize: 11, color: '#606080', marginTop: 4 }}>Digest: {error.digest}</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{ background: '#ED1966', border: 'none', color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}
              >
                Try again
              </button>
              <a
                href="/en/dashboard"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8', fontFamily: "'DM Sans', sans-serif", fontSize: 14, padding: '10px 24px', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}
              >
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
