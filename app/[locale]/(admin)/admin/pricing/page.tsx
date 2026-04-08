'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Star, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPricingPage() {
  const supabase = createClient()
  const [plans, setPlans] = useState<any[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPlans() }, [])

  async function loadPlans() {
    const { data } = await supabase.from('plan_configs').select('*').order('sort_order')
    setPlans(data ?? [])
    setLoading(false)
  }

  function updatePlan(id: string, field: string, value: any) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  function updateFeature(id: string, idx: number, val: string) {
    setPlans(prev => prev.map(p => {
      if (p.id !== id) return p
      const features = [...(p.features ?? [])]
      features[idx] = val
      return { ...p, features }
    }))
  }

  function addFeature(id: string) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, features: [...(p.features ?? []), ''] } : p))
  }

  function removeFeature(id: string, idx: number) {
    setPlans(prev => prev.map(p => p.id !== id ? p : { ...p, features: p.features.filter((_: any, i: number) => i !== idx) }))
  }

  async function savePlan(plan: any) {
    setSaving(plan.id)
    const { error } = await supabase.from('plan_configs').update({
      name_en: plan.name_en, name_es: plan.name_es,
      price_usd: plan.price_usd, price_cop: plan.price_cop,
      price_usd_yr: plan.price_usd_yr, price_cop_yr: plan.price_cop_yr,
      features: plan.features,
      is_featured: plan.is_featured, is_active: plan.is_active,
      updated_at: new Date().toISOString(),
    }).eq('id', plan.id)
    if (error) toast.error(error.message)
    else toast.success(`${plan.name_en} saved!`)
    setSaving(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--pink)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>Pricing Management</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Edit plans, prices, and features. Changes apply immediately to new signups.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)', border: plan.is_featured ? '1px solid rgba(237,25,102,0.4)' : '1px solid var(--border-2)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: 'rgba(237,25,102,0.1)', color: 'var(--pink)' }}>{plan.slug}</span>
                {plan.is_featured && <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}><Star size={11} />Featured</span>}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-3)' }}>
                  <input type="checkbox" checked={plan.is_featured} onChange={e => updatePlan(plan.id, 'is_featured', e.target.checked)} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-3)' }}>
                  <input type="checkbox" checked={plan.is_active} onChange={e => updatePlan(plan.id, 'is_active', e.target.checked)} />
                  Active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Name (EN)</label>
                <input value={plan.name_en} onChange={e => updatePlan(plan.id, 'name_en', e.target.value)} className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Name (ES)</label>
                <input value={plan.name_es} onChange={e => updatePlan(plan.id, 'name_es', e.target.value)} className="input text-sm" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Monthly Prices</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>USD / month</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-3)' }}>$</span>
                    <input type="number" value={plan.price_usd} onChange={e => updatePlan(plan.id, 'price_usd', parseFloat(e.target.value))} className="input pl-6 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>COP / month</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-3)' }}>$</span>
                    <input type="number" value={plan.price_cop} onChange={e => updatePlan(plan.id, 'price_cop', parseFloat(e.target.value))} className="input pl-6 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Annual Prices <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(shown as monthly equivalent)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>USD / year</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-3)' }}>$</span>
                    <input type="number" value={plan.price_usd_yr} onChange={e => updatePlan(plan.id, 'price_usd_yr', parseFloat(e.target.value))} className="input pl-6 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>COP / year</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-3)' }}>$</span>
                    <input type="number" value={plan.price_cop_yr} onChange={e => updatePlan(plan.id, 'price_cop_yr', parseFloat(e.target.value))} className="input pl-6 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Features</p>
                <button onClick={() => addFeature(plan.id)} className="text-xs font-medium" style={{ color: 'var(--pink)' }}>+ Add</button>
              </div>
              <div className="space-y-2">
                {(plan.features ?? []).map((f: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input value={f} onChange={e => updateFeature(plan.id, i, e.target.value)} className="input text-sm flex-1" placeholder="Feature description" />
                    <button onClick={() => removeFeature(plan.id, i)} className="text-xs px-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => savePlan(plan)} disabled={saving === plan.id}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{ background: 'var(--pink)', color: '#fff', opacity: saving === plan.id ? 0.7 : 1 }}>
              {saving === plan.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save {plan.name_en}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
