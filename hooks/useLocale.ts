'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/types'

export function useLocale(): Locale {
  const pathname = usePathname()
  const segment = pathname.split('/')[1]
  return (segment === 'es' ? 'es' : 'en') as Locale
}
