'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Table = 'leads' | 'conversations' | 'messages' | 'automations' | 'automation_runs' | 'orders'
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions<T> {
  table: Table
  event?: Event
  filter?: string
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (record: T) => void
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions<T>) {
  const supabase = createClient()

  useEffect(() => {
    const channelName = `realtime-${table}-${filter ?? 'all'}`
    let channel = supabase.channel(channelName)

    channel = channel.on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        onChange?.(payload)
        if (payload.eventType === 'INSERT') onInsert?.(payload.new as T)
        if (payload.eventType === 'UPDATE') onUpdate?.(payload.new as T)
        if (payload.eventType === 'DELETE') onDelete?.(payload.old as T)
      }
    )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, filter])
}

// ── Specific hooks ────────────────────────────────────────────

export function useNewMessages(
  conversationId: string,
  onMessage: (msg: Record<string, unknown>) => void
) {
  useRealtime({
    table: 'messages',
    event: 'INSERT',
    filter: `conversation_id=eq.${conversationId}`,
    onInsert: onMessage,
  })
}

export function useLeadUpdates(
  leadId: string,
  onUpdate: (lead: Record<string, unknown>) => void
) {
  useRealtime({
    table: 'leads',
    event: 'UPDATE',
    filter: `id=eq.${leadId}`,
    onUpdate,
  })
}

export function useAutomationRuns(
  automationId: string,
  onRun: (run: Record<string, unknown>) => void
) {
  useRealtime({
    table: 'automation_runs',
    event: 'INSERT',
    filter: `automation_id=eq.${automationId}`,
    onInsert: onRun,
  })
}
