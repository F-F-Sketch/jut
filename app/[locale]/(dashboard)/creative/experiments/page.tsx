'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, FlaskConical, TrendingUp, Users, Zap, MoreHorizontal, Play, Pause, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreativeExperimentsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const supabase = createClient()
  const [experiments, setExperiments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', test_type: 'ab', channel: '', campaign_tag: '' })

  useEffect(() => { loadExperiments() }, [])

  async function loadExperiments() {
    try {
      const { data } = await supabase
        .from('creative_experiments')
        .select('*, creative_variants(id, name, impressions, clicks, conversions, is_control)')
        .order('created_at', { ascending: false })
      setExperiments(data ?? [])
    } catch {}
    setLoading(false)
  }

  async function createExperiment() {
    if (!form.name) { toast.error('Name required'); return }
    setCreating(true)
    const { data, error } = await supabase.from('creative_experiments').insert({
      name: form.name, description: form.description,
      test_type: form.test_type, channel: form.channel,
      campaign_tag: form.campaign_tag, status: 'draft',
    }).select().single()
    if (error) { toast.error(error.message); setCreating(false); return }
    setExperiments(p => [data, ...p])
    setShowCreate(false)
    setForm({ name: '', description: '', test_type: 'ab', channel: '', campaign_tag: '' })
    toast.success(loc === 'es' ? 'Experimento creado' : 'Experiment created')
    setCreating(false)
  }

  function ctr(impressions: number, clicks: number) {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0'
  }
  function cvr(clicks: number, conversions: number) {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0'
  }

  const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(96,96,128,0.15)', color: 'var(--text-3)', label: 'Draft' },
    running: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Running' },
    paused: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Paused' },
    completed: { bg: 'rgba(74,144,217,0.1)', color: '#4a90d9', label: 'Completed' },
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>
            {loc === 'es' ? 'Experimentos Creativos' : 'Creative Experiments'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {loc === 'es' ? 'Prueba variantes de creativos y encuentra el ganador con datos reales' : 'Test creative variants and find the winner with real data'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: 'var(--pink)', color: '#fff' }}>
          <Plus size={14} />{loc === 'es' ? 'Nuevo Experimento' : 'New Experiment'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid rgba(237,25,102,0.3)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {loc === 'es' ? 'Nuevo Experimento' : 'New Experiment'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? 'Nombre del experimento' : 'Experiment name'}</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Black Friday Ad Test" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? 'Tipo de test' : 'Test type'}</label>
              <select value={form.test_type} onChange={e => setForm(p => ({ ...p, test_type: e.target.value }))} className="input">
                <option value="ab">A/B Test (2 variants)</option>
                <option value="multivariate">Multivariate (3+ variants)</option>
                <option value="split">Split URL Test</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? 'Canal' : 'Channel'}</label>
              <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="input">
                <option value="">Select channel</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? 'Campaña' : 'Campaign tag'}</label>
              <input value={form.campaign_tag} onChange={e => setForm(p => ({ ...p, campaign_tag: e.target.value }))} placeholder="Q1-2025-BFRIDAY" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{loc === 'es' ? 'Descripción' : 'Description'}</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Testing CTA placement vs original" className="input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createExperiment} disabled={creating}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'var(--pink)', color: '#fff', opacity: creating ? 0.7 : 1 }}>
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {loc === 'es' ? 'Crear' : 'Create'}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
              {loc === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Experiments list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--pink)' }} />
        </div>
      ) : experiments.length === 0 ? (
        <div className="rounded-2xl p-16 flex flex-col items-center text-center"
          style={{ background: 'var(--surface)', border: '1px dashed var(--border-2)' }}>
          <FlaskConical size={40} style={{ color: 'var(--text-3)', marginBottom: 16 }} />
          <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-2)' }}>
            {loc === 'es' ? 'Sin experimentos aún' : 'No experiments yet'}
          </p>
          <p className="text-sm max-w-xs" style={{ color: 'var(--text-3)' }}>
            {loc === 'es' ? 'Crea tu primer experimento A/B para descubrir qué creativos convierten mejor.' : 'Create your first A/B experiment to discover which creatives convert better.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map(exp => {
            const variants = exp.creative_variants ?? []
            const totalImpressions = variants.reduce((s: number, v: any) => s + (v.impressions ?? 0), 0)
            const winner = variants.sort((a: any, b: any) => (b.conversions ?? 0) - (a.conversions ?? 0))[0]
            const style = STATUS_STYLES[exp.status] ?? STATUS_STYLES.draft

            return (
              <div key={exp.id} className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{exp.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: style.bg, color: style.color }}>{style.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {exp.test_type?.toUpperCase()} · {exp.channel || loc === 'es' ? 'Sin canal' : 'No channel'} · {exp.campaign_tag || '—'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {exp.status === 'draft' && (
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        <Play size={11} />{loc === 'es' ? 'Iniciar' : 'Start'}
                      </button>
                    )}
                    {exp.status === 'running' && (
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        <Pause size={11} />{loc === 'es' ? 'Pausar' : 'Pause'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Variants */}
                {variants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {variants.map((v: any) => {
                      const isWinner = winner?.id === v.id && totalImpressions > 0
                      return (
                        <div key={v.id} className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: isWinner ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-2)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{v.name}</p>
                              {v.is_control && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(74,144,217,0.1)', color: '#4a90d9' }}>Control</span>}
                              {isWinner && <Trophy size={12} style={{ color: '#f59e0b' }} />}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: loc === 'es' ? 'Impresiones' : 'Impressions', value: v.impressions ?? 0 },
                              { label: 'CTR', value: `${ctr(v.impressions, v.clicks)}%` },
                              { label: 'CVR', value: `${cvr(v.clicks, v.conversions)}%` },
                            ].map(({ label, value }) => (
                              <div key={label} className="text-center">
                                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{value}</p>
                                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-2)' }}>
                    <Plus size={16} style={{ color: 'var(--text-3)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                      {loc === 'es' ? 'Añade variantes desde el Analizador' : 'Add variants from the Analyzer page'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {totalImpressions} {loc === 'es' ? 'impresiones totales' : 'total impressions'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {new Date(exp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
