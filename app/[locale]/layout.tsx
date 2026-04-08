export const dynamic = 'force-dynamic'

import {setRequestLocale} from 'next-intl/server';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'es'}];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}