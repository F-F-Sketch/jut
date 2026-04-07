import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'JUT — Automate Every Conversation',
    template: '%s | JUT',
  },
  description:
    'JUT is the AI-powered commercial operations platform that automates conversations, captures leads, and drives sales across every social channel.',
  keywords: ['AI automation', 'lead capture', 'Instagram automation', 'DM automation', 'sales automation', 'CRM'],
  authors: [{ name: 'JUT' }],
  creator: 'JUT',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jut.ai',
    title: 'JUT — Automate Every Conversation',
    description: 'AI-powered commercial operations platform. Comment triggers, DM flows, lead capture, and sales automation.',
    siteName: 'JUT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JUT — Automate Every Conversation',
    description: 'AI-powered commercial operations platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
