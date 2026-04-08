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
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/'
  const isProtected = PROTECTED_PATHS.some(p => pathnameWithoutLocale.startsWith(p))

  if (isProtected) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        return intlMiddleware(request)
      }

      const { createServerClient } = await import('@supabase/ssr')
      let response = NextResponse.next({ request })

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      })

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const locale = pathname.split('/')[1] || defaultLocale
        const loginUrl = new URL(`/${locale}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      return response
    } catch {
      return intlMiddleware(request)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
