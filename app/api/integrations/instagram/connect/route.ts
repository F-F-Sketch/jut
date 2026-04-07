import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') ?? 'en'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/integrations/instagram/callback`

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_read_engagement',
    response_type: 'code',
    state: locale,
  })

  const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
