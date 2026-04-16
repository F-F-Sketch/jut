import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/en/login', req.url))

    const appId = process.env.META_APP_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getjut.io'

    if (!appId) {
      // Redirect to social page with config error
      return NextResponse.redirect(new URL('/en/social?error=meta_not_configured', req.url))
    }

    const redirectUri = appUrl + '/api/auth/instagram/callback'
    const scopes = [
      'instagram_basic',
      'instagram_manage_messages',
      'instagram_manage_comments',
      'pages_show_list',
    ].join(',')

    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      ts: Date.now()
    })).toString('base64url')

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    authUrl.searchParams.set('client_id', appId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_type', 'code')

    return NextResponse.redirect(authUrl.toString())
  } catch(e: any) {
    console.error('Instagram redirect error:', e)
    return NextResponse.redirect(new URL('/en/social?error=server_error', req.url))
  }
}