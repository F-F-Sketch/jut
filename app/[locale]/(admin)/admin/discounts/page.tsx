'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Tag, Copy, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDiscountsPage() {
  const supabase = createClient()
  const [discounts, setDiscounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', type: 'percentage', value: 0,
    max_uses: '', expires_at: '', applies_to: [] as string[],
  })

  useEffect(() => { loadDiscounts() }, [])

  async function loadDiscounts() {
    setLoading(true)
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false })
    setDiscounts(data ?? [])
    setLoading(false)
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'JUT-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  async function createDiscount() {
    if (!form.code || !form.value) { toast.error('Code and value required'); return }
    setCreating(true)
    const { error } = await supabase.from('discounts').insert({
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      value: form.value,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      applies_to: form.applies_to,
      is_active: true,
    })
    if (error) { toast.error(error.message); setCreating(false); return }
    toast.success('Discount created!')
    setShowForm(false)
    setForm({ code: '', description: '', type: 'percentage', value: 0, max_uses: '', expires_at: '', applies_to: [] })
    setCreating(false)
    loadDiscounts()
  }

  async function toggleDiscount(id: string, is_active: boolean) {
    await supabase.from('discounts').update({ is_active }).eq('id', id)
    loadDiscounts()
  }

  async function deleteDiscount(id: string) {
    if (!confirm('Delete this discount?')) return
    await supabase.from('discounts').delete().eq('id', id)
    toast.success('Deleted')
    loadDiscounts()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>Discount Codes</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{discounts.length} codes created</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: 'var(--pink)', color: '#fff' }}>
          <Plus size={14} /> New Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid rgba(237,25,102,0.3)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Create Discount</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Code</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="JUT-PROMO" className="input text-sm flex-1 uppercase" />
                <button onClick={() => setForm(p => ({ ...p, code: generateCode() }))}
                  className="text-xs px-3 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Black Friday 2025" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_usd">Fixed (USD)</option>
                <option value="fixed_cop">Fixed (COP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>
                Value {form.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: parseFloat(e.target.value) }))}
                className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Max Uses (leave blank = unlimited)</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                placeholder="e.g. 100" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Expires At</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                className="input text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Applies To Plans</label>
            <div className="flex gap-3 flex-wrap">
              {['free', 'starter', 'growth', 'elite'].map(plan => (
                <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer capitalize" style={{ color: 'var(--text-2)' }}>
                  <input type="checkbox" checked={form.applies_to.includes(plan)}
                    onChange={e => setForm(p => ({
                      ...p, applies_to: e.target.checked
                        ? [...p.applies_to, plan]
                        : p.applies_to.filter(x => x !== plan)
                    }))} />
                  {plan}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createDiscount} disabled={creating}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'var(--pink)', color: '#fff', opacity: creating ? 0.7 : 1 }}>
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discounts list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--pink)' }} />
          </div>
        ) : discounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Tag size={28} style={{ color: 'var(--text-3)' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No discount codes yet</p>
          </div>
        ) : (
          <div>
            {discounts.map(d => (
              <div key={d.id} className="flex items-center gap-4 px-6 py-4 transition-all hover:bg-[var(--surface-2)]"
                style={{ borderBottom: '1px solid var(--border)', opacity: d.is_active ? 1 : 0.5 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <code className="text-sm font-bold" style={{ color: 'var(--pink)', letterSpacing: '0.05em' }}>{d.code}</code>
                    <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success('Copied!') }}
                      className="p-1 rounded opacity-50 hover:opacity-100">
                      <Copy size={11} style={{ color: 'var(--text-3)' }} />
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: d.type === 'percentage' ? 'rgba(34,197,94,0.1)' : 'rgba(74,144,217,0.1)', color: d.type === 'percentage' ? '#22c55e' : '#4a90d9' }}>
                      {d.type === 'percentage' ? `${d.value}% OFF` : d.type === 'fixed_cop' ? `$${d.value} COP OFF` : `$${d.value} USD OFF`}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {d.description} · {d.uses_count}/{d.max_uses ?? '∞'} uses
                    {d.expires_at && ` · expires ${new Date(d.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleDiscount(d.id, !d.is_active)}
                    className="text-xs px-3 py-1 rounded-lg font-medium"
                    style={{ background: d.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(96,96,128,0.1)', color: d.is_active ? '#22c55e' : 'var(--text-3)' }}>
                    {d.is_active ? 'Active' : 'Disabled'}
                  </button>
                  <button onClick={() => deleteDiscount(d.id)} className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
