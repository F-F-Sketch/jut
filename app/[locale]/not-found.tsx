import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '2rem',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Giant 404 */}
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(80px, 15vw, 160px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #ED1966, #2152A4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: 12,
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: 16,
            color: '#8888a8',
            lineHeight: 1.7,
            marginBottom: 40,
            fontWeight: 300,
          }}
        >
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/en/dashboard"
            style={{
              background: '#ED1966',
              border: 'none',
              color: '#fff',
              fontFamily: "'Syne', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 0 30px rgba(237,25,102,0.3)',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/en"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f0f0f8',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              padding: '10px 24px',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
