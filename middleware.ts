import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const PROTECTED_PATHS = [
  '/dashboard', '/leads', '/conversations', '/automations',
  '/social', '/sales', '/business', '/settings', '/analytics',
  '/agent', '/creative', '/help',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip landing page, API routes, and static files
  if (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/'
  const isProtected = PROTECTED_PATHS.some(p => pathnameWithoutLocale.startsWith(p))

  if (isProtected) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseKey) return intlMiddleware(request)

      const { createServerClient } = await import('@supabase/ssr')
      const response = NextResponse.next()
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const locale = pathname.split('/')[1] || defaultLocale
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
      }
      return response
    } catch {
      return intlMiddleware(request)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
