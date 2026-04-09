'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, MessageSquare, Zap, ShoppingBag, Loader2, X } from 'lucide-react'

interface SearchResult {
  type: 'lead' | 'conversation' | 'automation' | 'product'
  id: string
  title: string
  subtitle?: string
  meta?: string
  url: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  locale: string
}

const TYPE_CONFIG = {
  lead:         { icon: Users,          color: '#ED1966' },
  conversation: { icon: MessageSquare,  color: '#2152A4' },
  automation:   { icon: Zap,            color: '#f59e0b' },
  product:      { icon: ShoppingBag,    color: '#22c55e' },
}

export function CommandPalette({ open, onClose, locale }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery(''); setResults([]); setSelected(0)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) { const data = await res.json(); setResults(data.results ?? []); setSelected(0) }
      } finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(timer)
  }, [query])

  const navigate = useCallback((result: SearchResult) => {
    router.push(`/${locale}${result.url}`); onClose()
  }, [locale, router, onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) { navigate(results[selected]) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, results, selected, navigate, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z'50 flex items-start justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', paddingTop: '15vh' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[600px] rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {loading ? <Loader2 size={18} className="animate-spin flex-shrink-0" style={{ color: 'var(--pink)' }} /> : <Search size={18} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />}
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder={locale === 'es' ? 'Buscar leads...' : 'Search leads...'}
            className="flex-1 bg-transparent outline-none text-base" style={{ color: 'var(--text)', caretColor: 'var(--pink)' }} />
          {query && <button onClick={() => setQuery('')} style={{ color: 'var(--text-3)' }}><X size={15} /></button>}
        </div>
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto py-2">
            {results.map((result, i) => {
              const cfg = TYPE_CONFIG[result.type]; const Icon = cfg.icon
              return (
                <button key={result.id} onClick={() => navigate(result)}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left transition-all"
                  style={{ background: i === selected ? 'var(--surface-2)' : 'transparent' }}
                  onMouseEnter={() => setSelected(i)}>
                  <div className="w9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{result.title}</p>
                    {result.subtitle && <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{result.subtitle}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="py-12 text-center"><p className="text-sm" style={{ color: 'var(--text-3)' }}>{locale === 'es' ? `Sin resultados para "${query}"` : `No results for "${query}"`}</p></div>
        )}
      </div>
    </div>
  )
}
