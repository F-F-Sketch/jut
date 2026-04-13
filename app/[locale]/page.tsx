import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LocaleRootPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    redirect('/' + locale + (user ? '/dashboard' : '/login'))
  } catch {
    redirect('/' + locale + '/login')
  }
}
