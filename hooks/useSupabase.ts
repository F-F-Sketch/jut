'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export function useData<T>(
  table: string,
  options: {
    select?: string
    filter?: Record<string, string | number | boolean>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
  } = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let query = supabase.from(table).select(options.select ?? '*').eq('user_id', user.id)

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => { query = query.eq(key, value) })
    }
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false })
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data: result, error: err } = await query
    if (err) setError(err.message)
    else setData((result ?? []) as T[])
    setLoading(false)
  }

  useEffect(() => { load() }, [table])

  return { data, loading, error, refetch: load }
}
