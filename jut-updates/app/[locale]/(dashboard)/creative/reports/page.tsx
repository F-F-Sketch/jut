import { createClient, getUser } from '@/lib/supabase/server'
import { Download, FileText, BarChart3, Brain, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CreativeReportsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const loc = locale as 'en' | 'es'
  const supabase = await createClient()
  const user = await getUser()

  let analyses: any[] = []
  let experiments: any[] = []

  if (user) {
    try {
      const [aRes, eRes] = await Promise.all([
        supabase.from('creative_analyses').select('*, creative_enhancements(id, mode, score_delta, status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('creative_experiments').select('*, creative_variants(id, name, impressions, clicks, conversions)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])
      analyses = aRes.data ?? []
      experiments = eRes.data ?? []
    } catch {}
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Reportes Creativos' : 'Creative Reports'}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Exporta análisis, comparativas y resultados de experimentos' : 'Export analyses, comparisons, and experiment results'}</p>
        </div>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Brain, label: loc === 'es' ? 'Reporte de Análisis' : 'Analysis Report', desc: loc === 'es' ? 'Scores, insights y recomendaciones completas' : 'Full scores, insights and recommendations', color: 'var(--pink)', badge: 'PDF' },
          { icon: Sparkles, label: loc === 'es' ? 'Comparativa Original vs Mejorado' : 'Original vs Enhanced', desc: loc === 'es' ? 'Side-by-side con métricas de mejora esperada' : 'Side-by-side with expected improvement metrics', color: '#4a90d9', badge: 'PDF' },
          { icon: BarChart3, label: loc === 'es' ? 'Reporte de Experimentos' : 'Experiment Report', desc: loc === 'es' ? 'Performance de variantes y ganador proyectado' : 'Variant performance and projected winner', color: '#22c55e', badge: 'PDF' },
        ].map(({ icon: Icon, label, desc, color, badge }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{badge}</span>
            </div>
            <p className="font-display font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{desc}</p>
            <button className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold"
              style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}
              onClick={() => alert('PDF export coming soon — connects to your analysis data')}>
              <Download size={12} />{loc === 'es' ? 'Exportar PDF' : 'Export PDF'}
            </button>
          </div>
        ))}
      </div>

      {/* Analysis history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>{loc === 'es' ? 'Historial de análisis' : 'Analysis history'}</h2>
          <Link href={`/${locale}/creative/analyzer`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--pink)' }}>
            {loc === 'es' ? 'Nuevo análisis' : 'New analysis'} <ArrowRight size={12} />
          </Link>
        </div>
        {analyses.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px dashed var(--border-2)' }}>
            <Brain size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Sin análisis aún. Ve al Analizador para empezar.' : 'No analyses yet. Go to Analyzer to get started.'}</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[loc === 'es' ? 'Fecha' : 'Date', loc === 'es' ? 'Score general' : 'Overall score', loc === 'es' ? 'Recomendaciones' : 'Recommendations', loc === 'es' ? 'Mejorado' : 'Enhanced', ''].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analyses.map((a: any) => {
                  const score = a.overall_score ?? 0
                  const scoreColor = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
                  const hasEnhancement = (a.creative_enhancements ?? []).length > 0
                  const recs = (a.recommendations ?? []).length
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-2)' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: scoreColor }} />
                          </div>
                          <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-3)' }}>{recs} recs</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: hasEnhancement ? 'rgba(74,144,217,0.1)' : 'var(--surface-2)', color: hasEnhancement ? '#4a90d9' : 'var(--text-3)' }}>
                          {hasEnhancement ? '✓ Enhanced' : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--pink)' }}
                          onClick={() => alert('PDF download — coming soon')}>
                          <Download size={11} /> PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
