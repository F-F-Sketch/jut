import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const PROTECTED_PATHS = [
  '/dashboard',
  '/leads',
  '/conversations',
  '/automations',
  '/social',
  '/sales',
  '/business',
  '/settings',
  '/analytics',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix to check path
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/'

  const isProtected = PROTECTED_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  )

  if (isProtected) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const locale = pathname.split('/')[1] || defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
