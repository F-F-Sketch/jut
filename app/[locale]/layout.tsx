import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n'
import { Toaster } from 'react-hot-toast'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params

  if (!locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16161f',
            color: '#f0f0f8',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#ED1966', secondary: '#fff' },
          },
        }}
      />
    </NextIntlClientProvider>
  )
}
