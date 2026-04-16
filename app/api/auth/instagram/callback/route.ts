import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const sb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getjut.io'

  if (error) {
    return NextResponse.redirect(appUrl + '/en/social?error=access_denied')
  }

  if (!code || !state) {
    return NextResponse.redirect(appUrl + '/en/social?error=missing_params')
  }

  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    if (!userId) throw new Error('No userId')
  } catch {
    return NextResponse.redirect(appUrl + '/en/social?error=invalid_state')
  }

  const redirectUri = appUrl + '/api/auth/instagram/callback'

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token?' + new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    }))
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)

    // Exchange for long-lived token
    const longRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token?' + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: tokenData.access_token,
    }))
    const longData = await longRes.json()
    const longToken = longData.access_token || tokenData.access_token

    // Get user info
    const meRes = await fetch('https://graph.facebook.com/v18.0/me?fields=id,name&access_token=' + longToken)
    const meData = await meRes.json()

    // Get Instagram accounts
    const igRes = await fetch('https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account,name&access_token=' + longToken)
    const igData = await igRes.json()
    const igAccount = igData.data?.find((p: any) => p.instagram_business_account)

    await sb.from('integrations').upsert({
      user_id: userId,
      platform: 'instagram',
      status: 'active',
      account_id: igAccount?.instagram_business_account?.id || meData.id,
      account_name: meData.name,
      access_token: longToken,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { fb_user_id: meData.id, ig_account_id: igAccount?.instagram_business_account?.id },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' })

    return NextResponse.redirect(appUrl + '/en/social?success=instagram_connected&account=' + encodeURIComponent(meData.name || 'Instagram'))
  } catch(e: any) {
    console.error('Instagram callback error:', e)
    return NextResponse.redirect(appUrl + '/en/social?error=' + encodeURIComponent(e.message || 'unknown'))
  }
}