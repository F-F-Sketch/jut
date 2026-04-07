import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Instagram OAuth callback
// Meta redirects to /api/integrations/instagram/callback?code=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const locale = searchParams.get('state') ?? 'en'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code) {
    console.error('[Instagram OAuth] Error:', error)
    return NextResponse.redirect(`${appUrl}/${locale}/settings?instagram_error=true`)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${appUrl}/${locale}/login`)

    // Exchange code for access token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${appUrl}/api/integrations/instagram/callback`,
        code,
      }),
    })

    if (!tokenRes.ok) {
      console.error('[Instagram OAuth] Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${appUrl}/${locale}/settings?instagram_error=true`)
    }

    const tokenData = await tokenRes.json()
    const { access_token, user_id: instagramUserId } = tokenData

    // Exchange for long-lived token
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.META_APP_SECRET}&access_token=${access_token}`
    )
    const longLivedData = await longLivedRes.json()
    const longToken = longLivedData.access_token ?? access_token
    const expiresIn = longLivedData.expires_in ?? 5184000 // 60 days default

    // Get Instagram profile info
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,name&access_token=${longToken}`
    )
    const profileData = await profileRes.json()

    // Save integration
    await supabase.from('integrations').upsert({
      user_id: user.id,
      provider: 'instagram',
      status: 'connected',
      access_token: longToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      metadata: {
        instagram_user_id: instagramUserId,
        username: profileData.username,
        name: profileData.name,
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })

    // Update business config with Instagram handle
    if (profileData.username) {
      await supabase
        .from('business_configs')
        .update({ instagram_handle: `@${profileData.username}` })
        .eq('user_id', user.id)
    }

    console.log(`[Instagram OAuth] Connected for user ${user.id}: @${profileData.username}`)
    return NextResponse.redirect(`${appUrl}/${locale}/settings?instagram_connected=true`)

  } catch (err) {
    console.error('[Instagram OAuth] Unexpected error:', err)
    return NextResponse.redirect(`${appUrl}/${locale}/settings?instagram_error=true`)
  }
}
