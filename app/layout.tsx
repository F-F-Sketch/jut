import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400','500','600','700','800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300','400','500','600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JUT — AI Platform',
  description: 'Automate every conversation. Close every deal.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable + ' ' + dmSans.variable}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border-2)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'var(--font-dm-sans)',
              boxShadow: 'var(--shadow-md)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'var(--surface-2)' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'var(--surface-2)' } },
          }}
        />
      </body>
    </html>
  )
}
