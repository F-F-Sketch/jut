'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, Brain, Sparkles, Eye, Target, Zap, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2, Download, RotateCcw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

const ASSET_TYPES = [
  { value: 'static_ad', label: 'Static Ad' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'banner', label: 'Banner' },
  { value: 'landing_page', label: 'Landing Page Screenshot' },
  { value: 'email', label: 'Email Design' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'carousel', label: 'Carousel Slide' },
  { value: 'product_page', label: 'Product Page' },
]

const ENHANCE_MODES = [
  { value: 'conversion', label: '🎯 Conversion Focused', desc: 'Maximize conversion rate' },
  { value: 'luxury', label: '💎 Luxury / Premium', desc: 'Refined, high-end feel' },
  { value: 'minimal', label: '◻️ Cleaner / Minimal', desc: 'Reduce noise, improve focus' },
  { value: 'attention', label: '⚡ High Attention', desc: 'Thumb-stopping impact' },
  { value: 'emotional', label: '❤️ More Emotional', desc: 'Human connection & feeling' },
  { value: 'direct_response', label: '📣 Direct Response', desc: 'Aggressive performance focus' },
  { value: 'social_ad', label: '📱 Social Ad Optimized', desc: 'Platform best practices' },
  { value: 'ecommerce', label: '🛒 Ecommerce Optimized', desc: 'Product & purchase focus' },
]

const INTENSITIES = [
  { value: 'light', label: 'Light', desc: 'Subtle fixes only' },
  { value: 'medium', label: 'Medium', desc: 'Fix all key issues' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Full optimization' },
]

const SCORE_LABELS: Record<string, string> = {
  attention: 'Attention', clarity: 'Clarity', focus: 'Focus',
  visual_hierarchy: 'Visual Hierarchy', cta_visibility: 'CTA Visibility',
  brand_presence: 'Brand Presence', readability: 'Readability',
  engagement_likelihood: 'Engagement', conversion_likelihood: 'Conversion',
  memory_recall: 'Memory Recall', emotional_impact: 'Emotional Impact',
}

const CATEGORY_ICONS: Record<string, string> = {
  visual_hierarchy: '👁', conversion: '💰', messaging: '✍️', cta: '🎯',
  layout: '📐', typography: '🔤', color: '🎨', branding: '⭐',
  emotional: '❤️', ad_performance: '📈',
}

export default function CreativeAnalyzerPage({ params }: PageProps) {
  const { locale } = params
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [assetType, setAssetType] = useState('static_ad')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analysis' | 'heatmap' | 'recommendations' | 'enhance' | 'compare'>('analysis')
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set())
  const [heatmapMode, setHeatmapMode] = useState<'heatmap' | 'focus' | 'flow' | 'weaknesses'>('heatmap')
  const [enhanceMode, setEnhanceMode] = useState('conversion')
  const [enhanceIntensity, setEnhanceIntensity] = useState('medium')
  const [enhancing, setEnhancing] = useState(false)
  const [enhancement, setEnhancement] = useState<any>(null)
  const [showCompare, setShowCompare] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      setImageBase64(result)
    }
    reader.readAsDataURL(file)
    setAnalysis(null)
    setEnhancement(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  async function runAnalysis() {
    if (!imageBase64) { toast.error('Upload an image first'); return }
    setAnalyzing(true)
    setActiveTab('analysis')
    try {
      const res = await fetch('/api/creative/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, assetType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data)
      setAnalysisId(data.analysis_id)
      toast.success('Analysis complete!')
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    }
    setAnalyzing(false)
  }

  async function runEnhancement() {
    if (!analysisId) { toast.error('Run analysis first'); return }
    setEnhancing(true)
    try {
      const res = await fetch('/api/creative/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, mode: enhanceMode, intensity: enhanceIntensity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Enhancement failed')
      setEnhancement(data)
      setActiveTab('compare')
      toast.success('Enhancement plan ready!')
    } catch (err: any) {
      toast.error(err.message || 'Enhancement failed')
    }
    setEnhancing(false)
  }

  function getScoreColor(score: number) {
    if (score >= 75) return '#22c55e'
    if (score >= 55) return '#f59e0b'
    return '#ef4444'
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Average'
    if (score >= 35) return 'Weak'
    return 'Poor'
  }

  const overallScore = analysis?.overall_score ?? 0
  const overallColor = getScoreColor(overallScore)

  const tabs = [
    { key: 'analysis', label: 'Scores', icon: TrendingUp },
    { key: 'heatmap', label: 'Heatmap', icon: Eye },
    { key: 'recommendations', label: `Recs ${analysis?.recommendations?.length ? `(${analysis.recommendations.length})` : ''}`, icon: Target },
    { key: 'enhance', label: 'Enhance', icon: Sparkles },
    { key: 'compare', label: 'Compare', icon: RotateCcw },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>Creative Analyzer</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Upload a marketing creative for AI-powered analysis, heatmap simulation, and optimization</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEFT: Upload + Preview */}
        <div className="space-y-5">
          {/* Upload zone */}
          {!imagePreview ? (
            <div
              onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{ border: `2px dashed ${dragOver ? 'var(--pink)' : 'var(--border-2)'}`, background: dragOver ? 'rgba(237,25,102,0.04)' : 'var(--surface)', minHeight: 320, padding: 48 }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.2)' }}>
                <Upload size={28} style={{ color: 'var(--pink)' }} />
              </div>
              <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Drop your creative here</p>
              <p className="text-sm text-center" style={{ color: 'var(--text-3)' }}>JPG, PNG, WebP, GIF · Any marketing creative</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Static Ad', 'Social Post', 'Banner', 'Landing Page', 'Email'].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>{t}</span>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden relative" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
              <img src={imagePreview} alt="Creative" className="w-full object-contain" style={{ maxHeight: 400 }} />
              {/* Heatmap overlay when on heatmap tab */}
              {activeTab === 'heatmap' && analysis?.heatmap_data && (
                <div className="absolute inset-0 pointer-events-none">
                  {(analysis.heatmap_data as any[]).map((zone: any, i: number) => {
                    const colors: Record<string, string> = {
                      heatmap: `rgba(237,25,102,${zone.intensity * 0.6})`,
                      focus: zone.priority <= 2 ? `rgba(237,25,102,0.5)` : 'transparent',
                      flow: `rgba(74,144,217,${zone.intensity * 0.5})`,
                      weaknesses: zone.intensity < 0.3 ? 'rgba(239,68,68,0.4)' : 'transparent',
                    }
                    return (
                      <div key={i} className="absolute rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          left: `${zone.x}%`, top: `${zone.y}%`,
                          width: `${zone.width}%`, height: `${zone.height}%`,
                          background: colors[heatmapMode] ?? 'transparent',
                          backdropFilter: zone.intensity > 0.6 ? 'blur(1px)' : 'none',
                          transition: 'background 0.3s',
                          border: zone.priority === 1 ? '2px solid rgba(237,25,102,0.8)' : 'none',
                        }}>
                        {heatmapMode === 'flow' && zone.priority <= 3 && (
                          <span className="bg-black bg-opacity-60 rounded px-1">{zone.priority}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <button onClick={() => { setImagePreview(null); setImageFile(null); setAnalysis(null); setEnhancement(null) }}
                className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                ✕ Remove
              </button>
            </div>
          )}

          {/* Asset type + Analyze button */}
          {imagePreview && (
            <div className="flex gap-3">
              <select value={assetType} onChange={e => setAssetType(e.target.value)} className="input flex-1 text-sm">
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button onClick={runAnalysis} disabled={analyzing || !imagePreview}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold whitespace-nowrap"
                style={{ background: 'var(--pink)', color: '#fff', opacity: analyzing ? 0.7 : 1 }}>
                {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Brain size={14} /> Analyze</>}
              </button>
            </div>
          )}

          {/* Overall score widget */}
          {analysis && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: `1px solid ${overallColor}30` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>Creative Effectiveness Score</p>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-4xl" style={{ color: overallColor }}>{overallScore}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: overallColor }}>{getScoreLabel(overallScore)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>/100 points</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold mb-1" style={{ color: '#22c55e' }}>✓ {analysis.top_strength?.slice(0, 30)}</p>
                  <p className="text-xs font-bold" style={{ color: '#ef4444' }}>⚠ {analysis.top_weakness?.slice(0, 30)}</p>
                </div>
              </div>
              {/* Score bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${overallScore}%`, background: `linear-gradient(90deg, ${overallColor}, ${overallColor}88)` }} />
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-2)' }}>{analysis.summary}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Analysis tabs */}
        <div className="space-y-5">
          {!analysis && !analyzing && (
            <div className="rounded-2xl flex flex-col items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', minHeight: 400 }}>
              <Brain size={40} style={{ color: 'var(--text-3)', marginBottom: 16 }} />
              <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-2)' }}>Ready to analyze</p>
              <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-3)' }}>Upload a creative and click Analyze to get AI-powered insights, scores, and optimization recommendations</p>
            </div>
          )}

          {analyzing && (
            <div className="rounded-2xl flex flex-col items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid rgba(237,25,102,0.2)', minHeight: 400 }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.2)' }}>
                  <Brain size={36} style={{ color: 'var(--pink)' }} className="animate-pulse" />
                </div>
              </div>
              <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Analyzing your creative...</p>
              <div className="space-y-2 text-center">
                {['Evaluating visual hierarchy...', 'Simulating attention patterns...', 'Scoring conversion signals...', 'Generating recommendations...'].map((s, i) => (
                  <p key={i} className="text-xs" style={{ color: 'var(--text-3)', opacity: 0.6 + (i * 0.1) }}>{s}</p>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key as any)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
                    style={{ background: activeTab === key ? 'var(--surface-2)' : 'transparent', color: activeTab === key ? 'var(--text)' : 'var(--text-3)', border: activeTab === key ? '1px solid var(--border-2)' : '1px solid transparent' }}>
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>

              {/* SCORES TAB */}
              {activeTab === 'analysis' && (
                <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                  <h3 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Score Breakdown</h3>
                  {Object.entries(analysis.scores ?? {}).map(([key, val]: [string, any]) => {
                    const score = val as number
                    const color = getScoreColor(score)
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-2)' }}>{SCORE_LABELS[key] ?? key}</span>
                          <span className="font-bold" style={{ color }}>{score}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                          <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                  <div className="mt-5 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Key Insights</h4>
                    {Object.entries(analysis.insights ?? {}).filter(([k]) => !['summary', 'top_strength', 'top_weakness'].includes(k)).map(([key, val]: [string, any]) => (
                      <div key={key} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-xs font-semibold mb-1 capitalize" style={{ color: 'var(--text-2)' }}>{key.replace(/_/g, ' ')}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HEATMAP TAB */}
              {activeTab === 'heatmap' && (
                <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'heatmap', label: '🔥 Heatmap' },
                      { key: 'focus', label: '🎯 Focus Areas' },
                      { key: 'flow', label: '👁 Attention Flow' },
                      { key: 'weaknesses', label: '⚠️ Weak Zones' },
                    ].map(({ key, label }) => (
                      <button key={key} onClick={() => setHeatmapMode(key as any)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ background: heatmapMode === key ? 'rgba(237,25,102,0.1)' : 'var(--surface-2)', color: heatmapMode === key ? 'var(--pink)' : 'var(--text-3)', border: `1px solid ${heatmapMode === key ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}` }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {heatmapMode === 'heatmap' && '🔥 Red = high attention zones. The darker the overlay, the more eyes land here.'}
                    {heatmapMode === 'focus' && '🎯 Highlighted zones are the top 2 primary focus areas your audience will fixate on.'}
                    {heatmapMode === 'flow' && '👁 Numbers show the order in which a viewer scans this creative (1 = first, 2 = second...).'}
                    {heatmapMode === 'weaknesses' && '⚠️ Red zones show areas with critically low attention — these elements are being missed.'}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>← See the overlay on your creative on the left</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>Attention zone breakdown:</p>
                    {(analysis.heatmap_data as any[]).sort((a: any, b: any) => a.priority - b.priority).map((zone: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                        <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: i < 2 ? 'var(--pink)' : 'var(--surface-3)', color: i < 2 ? '#fff' : 'var(--text-3)' }}>{zone.priority}</div>
                        <div className="flex-1">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{zone.label}</p>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-3)' }}>{Math.round(zone.intensity * 100)}% attention</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDATIONS TAB */}
              {activeTab === 'recommendations' && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(analysis.recommendations as any[]).map((rec: any) => {
                    const isExpanded = expandedRecs.has(rec.id)
                    const impactColor = rec.impact === 'high' ? '#ef4444' : rec.impact === 'medium' ? '#f59e0b' : '#22c55e'
                    return (
                      <div key={rec.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${impactColor}20`, background: 'var(--surface)' }}>
                        <button onClick={() => setExpandedRecs(prev => { const s = new Set(prev); s.has(rec.id) ? s.delete(rec.id) : s.add(rec.id); return s })}
                          className="w-full flex items-center gap-3 p-4 text-left">
                          <span className="text-base">{CATEGORY_ICONS[rec.category] ?? '💡'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: `${impactColor}15`, color: impactColor }}>{rec.impact}</span>
                              <span className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{rec.category.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{rec.what_is_wrong}</p>
                          </div>
                          {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="pt-3 grid grid-cols-1 gap-2">
                              {[
                                { label: 'Why it matters', value: rec.why_it_matters, color: '#f59e0b' },
                                { label: 'What to change', value: rec.what_to_change, color: '#4a90d9' },
                                { label: 'Expected effect', value: rec.expected_effect, color: '#22c55e' },
                              ].map(({ label, value, color }) => (
                                <div key={label} className="p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                                  <p className="text-xs font-bold mb-1" style={{ color }}>{label}</p>
                                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ENHANCE TAB */}
              {activeTab === 'enhance' && (
                <div className="rounded-2xl p-5 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                  <div>
                    <h3 className="font-display font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>Enhancement Mode</h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>JUT will analyze your creative's weaknesses and generate a detailed optimization plan</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ENHANCE_MODES.map(m => (
                        <button key={m.value} onClick={() => setEnhanceMode(m.value)}
                          className="p-3 rounded-xl text-left transition-all"
                          style={{ background: enhanceMode === m.value ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${enhanceMode === m.value ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}` }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{m.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Intensity</h4>
                    <div className="flex gap-2">
                      {INTENSITIES.map(i => (
                        <button key={i.value} onClick={() => setEnhanceIntensity(i.value)}
                          className="flex-1 p-3 rounded-xl text-center transition-all"
                          style={{ background: enhanceIntensity === i.value ? 'rgba(237,25,102,0.08)' : 'var(--surface-2)', border: `1px solid ${enhanceIntensity === i.value ? 'rgba(237,25,102,0.3)' : 'var(--border-2)'}` }}>
                          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{i.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{i.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={runEnhancement} disabled={enhancing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--pink), #2152A4)', color: '#fff', opacity: enhancing ? 0.7 : 1 }}>
                    {enhancing ? <><Loader2 size={14} className="animate-spin" /> Generating enhancement plan...</> : <><Sparkles size={14} /> Generate Enhancement Plan</>}
                  </button>
                </div>
              )}

              {/* COMPARE TAB */}
              {activeTab === 'compare' && (
                <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                  {!enhancement ? (
                    <div className="text-center py-8">
                      <Sparkles size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
                      <p className="text-sm" style={{ color: 'var(--text-2)' }}>Run Enhancement first to see the comparison</p>
                      <button onClick={() => setActiveTab('enhance')} className="mt-3 text-xs font-medium flex items-center gap-1 mx-auto" style={{ color: 'var(--pink)' }}>
                        Go to Enhance <ArrowRight size={11} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>Original vs Enhanced</h3>
                      {/* Score deltas */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Original Score</p>
                          <p className="font-display font-bold text-2xl" style={{ color: overallColor }}>{overallScore}</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Projected Score</p>
                          <p className="font-display font-bold text-2xl" style={{ color: '#22c55e' }}>
                            {Math.min(100, overallScore + (enhancement.score_delta?.overall ?? 0))}
                          </p>
                        </div>
                      </div>
                      {/* Key changes */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>What changes:</p>
                        {(enhancement.key_changes ?? []).slice(0, 5).map((c: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold" style={{ color: 'var(--pink)' }}>{c.element}</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span style={{ color: '#ef4444' }}>Before: {c.before}</span>
                              <ArrowRight size={10} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 2 }} />
                              <span style={{ color: '#22c55e' }}>After: {c.after}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Enhancement directives */}
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Enhancement directives for your designer:</p>
                        <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'var(--surface-2)', maxHeight: 180, overflowY: 'auto' }}>
                          {(enhancement.directives ?? []).map((d: string, i: number) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--pink)' }}>{i + 1}.</span>
                              <p className="text-xs" style={{ color: 'var(--text-2)' }}>{d}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Impact */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Conversion lift</p>
                          <p className="font-bold text-sm" style={{ color: '#22c55e' }}>{enhancement.conversion_impact}</p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(237,25,102,0.08)', border: '1px solid rgba(237,25,102,0.2)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Attention lift</p>
                          <p className="font-bold text-sm" style={{ color: 'var(--pink)' }}>{enhancement.attention_impact}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
