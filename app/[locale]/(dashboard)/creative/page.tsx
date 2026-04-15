'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Upload, BarChart3, Eye, Sparkles, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, Image } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'analyze', label: 'Analyze', icon: Brain },
  { id: 'heatmap', label: 'Heatmap', icon: Eye },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'history', label: 'History', icon: BarChart3 },
]

const SCORE_LABELS: Record<string,string> = {
  visual_impact: 'Visual Impact',
  message_clarity: 'Message Clarity',
  cta_strength: 'CTA Strength',
  brand_consistency: 'Brand Consistency',
  emotional_appeal: 'Emotional Appeal',
}

const SCORE_COLORS: Record<string,string> = {
  visual_impact: '#ED1966',
  message_clarity: '#3b82f6',
  cta_strength: '#f59e0b',
  brand_consistency: '#8b5cf6',
  emotional_appeal: '#22c55e',
}

export default function CreativePage() {
  const [tab, setTab] = useState('analyze')
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [preview, setPreview] = useState<string|null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      setAnalysis(null)
      await analyze(base64, file.name)
    }
    reader.readAsDataURL(file)
  }

  async function analyze(base64: string, name: string) {
    setAnalyzing(true)
    setTab('analyze')
    try {
      const res = await fetch('/api/creative/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, assetName: name, assetType: 'static_ad' }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Analysis failed'); return }
      setAnalysis(data.analysis)
      toast.success('Analysis complete!')
    } catch (e: any) {
      toast.error('Failed: ' + e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function loadHistory() {
    if (historyLoaded) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('creative_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    setHistory(data || [])
    setHistoryLoaded(true)
  }

  function ScoreBar({ label, value, color }: { label:string; value:number; color:string }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color:'var(--text-2)', fontWeight:500 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight:700, color }}>{value}/100</span>
        </div>
        <div style={{ height:8, borderRadius:999, background:'var(--surface-3)', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:999, background: color,
            width: value + '%',
            transition:'width 1s cubic-bezier(0.22,1,0.36,1)',
            boxShadow: '0 0 8px ' + color + '60',
          }}/>
        </div>
      </div>
    )
  }

  function HeatmapView() {
    if (!preview) return (
      <div style={{ textAlign:'center', padding:60, color:'var(--text-3)' }}>
        <Eye size={40} style={{ opacity:0.2, display:'block', margin:'0 auto 12px' }}/>
        <p>Upload and analyze an image first</p>
      </div>
    )
    const zones = analysis?.heatmap_zones || []
    return (
      <div>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Attention Heatmap</h2>
        <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20 }}>Visual representation of where viewers focus their attention</p>
        <div style={{ position:'relative', display:'inline-block', width:'100%', maxWidth:600 }}>
          <img src={preview} alt="creative" style={{ width:'100%', borderRadius:12, display:'block' }}/>
          <div style={{ position:'absolute', inset:0, borderRadius:12, overflow:'hidden' }}>
            {zones.map((z: any, i: number) => (
              <div key={i} style={{
                position:'absolute',
                left: z.x + '%', top: z.y + '%',
                transform:'translate(-50%,-50%)',
                width: (z.intensity * 0.8) + 'px',
                height: (z.intensity * 0.8) + 'px',
                borderRadius:'50%',
                background: 'radial-gradient(circle, rgba(237,25,102,' + (z.intensity/100*0.5) + ') 0%, transparent 70%)',
                pointerEvents:'none',
              }}>
                <div style={{ position:'absolute', top:'105%', left:'50%', transform:'translateX(-50%)', fontSize:10, color:'#fff', background:'rgba(0,0,0,0.7)', padding:'2px 6px', borderRadius:4, whiteSpace:'nowrap' }}>
                  {z.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        {zones.length === 0 && analysis && (
          <p style={{ marginTop:12, fontSize:13, color:'var(--text-3)' }}>No heatmap data available for this analysis.</p>
        )}
      </div>
    )
  }

  function InsightsView() {
    if (!analysis) return (
      <div style={{ textAlign:'center', padding:60, color:'var(--text-3)' }}>
        <Sparkles size={40} style={{ opacity:0.2, display:'block', margin:'0 auto 12px' }}/>
        <p>Analyze an image to see insights</p>
      </div>
    )
    return (
      <div style={{ display:'grid', gap:20 }}>
        <div style={{ padding:20, borderRadius:14, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Summary</h3>
          <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>{analysis.summary}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ padding:20, borderRadius:14, background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#22c55e', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <CheckCircle2 size={15}/> Strengths
            </h3>
            {(analysis.strengths||[]).map((s: string, i: number) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ color:'#22c55e', fontSize:13, flexShrink:0 }}>+</span>
                <span style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:20, borderRadius:14, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#ef4444', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <AlertCircle size={15}/> Improvements
            </h3>
            {(analysis.improvements||[]).map((s: string, i: number) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ color:'#ef4444', fontSize:13, flexShrink:0 }}>!</span>
                <span style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'Best Platform', value: analysis.best_platform, color:'#3b82f6' },
            { label:'Target Audience', value: analysis.target_audience, color:'#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{ padding:16, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
              <div style={{ fontSize:11, color:'var(--text-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{item.label}</div>
              <div style={{ fontSize:14, fontWeight:600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function HistoryView() {
    if (!historyLoaded) {
      loadHistory()
      return <div style={{ textAlign:'center', padding:40, color:'var(--text-3)' }}>Loading...</div>
    }
    if (history.length === 0) return (
      <div style={{ textAlign:'center', padding:60, color:'var(--text-3)' }}>
        <BarChart3 size={40} style={{ opacity:0.2, display:'block', margin:'0 auto 12px' }}/>
        <p>No analyses yet</p>
      </div>
    )
    return (
      <div style={{ display:'grid', gap:10 }}>
        {history.map(item => (
          <div key={item.id} style={{ padding:16, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
            onClick={() => { setAnalysis(item.raw_response || { ...item, scores: item.scores }); setTab('analyze') }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'rgba(237,25,102,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Image size={18} color="var(--pink)"/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{item.asset_name || 'Creative'}</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:'var(--pink)', fontFamily:'var(--font-display)' }}>{item.overall_score}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding:32, maxWidth:1100 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-0.5, marginBottom:4 }}>Creative AI Analyzer</h1>
        <p style={{ fontSize:14, color:'var(--text-3)' }}>Upload a marketing creative and get an instant AI-powered performance analysis</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}>

        {/* LEFT: Upload + Score */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Upload Zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f) }}
            style={{
              padding: preview ? 0 : 48,
              borderRadius:16, border:'2px dashed var(--border-2)',
              background:'var(--surface)', cursor:'pointer',
              textAlign:'center', position:'relative', overflow:'hidden',
              transition:'border-color 0.2s',
              minHeight: 200,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(237,25,102,0.4)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = ''}>
            {preview ? (
              <img src={preview} alt="preview" style={{ width:'100%', display:'block', borderRadius:14 }}/>
            ) : (
              <div>
                <Upload size={36} style={{ color:'var(--text-4)', display:'block', margin:'0 auto 12px' }}/>
                <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Drop your creative here</p>
                <p style={{ fontSize:13, color:'var(--text-4)' }}>JPG, PNG, GIF, WebP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
          </div>

          {/* Analyzing spinner */}
          {analyzing && (
            <div style={{ padding:20, borderRadius:14, background:'rgba(237,25,102,0.06)', border:'1px solid rgba(237,25,102,0.15)', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid rgba(237,25,102,0.2)', borderTopColor:'var(--pink)', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>Analyzing with Claude AI...</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Scoring visual impact, clarity, CTA strength</div>
              </div>
            </div>
          )}

          {/* Overall Score */}
          {analysis && !analyzing && (
            <div style={{ padding:24, borderRadius:16, background:'linear-gradient(135deg,rgba(237,25,102,0.08),rgba(33,82,164,0.06))', border:'1px solid rgba(237,25,102,0.2)', textAlign:'center' }}>
              <div style={{ fontSize:12, color:'var(--text-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>Overall Score</div>
              <div style={{ fontSize:72, fontWeight:900, color:'var(--pink)', letterSpacing:-3, lineHeight:1, fontFamily:'var(--font-display)' }}>
                {analysis.overall_score}
              </div>
              <div style={{ fontSize:13, color:'var(--text-3)', marginTop:8 }}>out of 100</div>
              <div style={{ marginTop:16, display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                {analysis.best_platform && (
                  <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600, background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)' }}>
                    Best: {analysis.best_platform}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Tabs */}
        <div style={{ background:'var(--surface)', borderRadius:20, border:'1px solid var(--border-2)', overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border-2)', background:'var(--bg-2)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:1, padding:'12px 8px', border:'none', cursor:'pointer',
                background: tab===t.id ? 'var(--surface)' : 'transparent',
                color: tab===t.id ? 'var(--text)' : 'var(--text-4)',
                fontSize:12, fontWeight: tab===t.id ? 700 : 500,
                borderBottom: tab===t.id ? '2px solid var(--pink)' : '2px solid transparent',
                display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                transition:'all 0.15s',
              }}>
                <t.icon size={13}/>{t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding:20, minHeight:400 }}>
            {tab === 'analyze' && (
              analysis ? (
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Score Breakdown</h3>
                  {Object.entries(analysis.scores||{}).map(([key, val]) => (
                    <ScoreBar key={key} label={SCORE_LABELS[key]||key} value={Number(val)} color={SCORE_COLORS[key]||'var(--pink)'}/>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-3)' }}>
                  <Brain size={44} style={{ opacity:0.15, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Ready to analyze</p>
                  <p style={{ fontSize:13 }}>Upload a creative image on the left to get your AI score</p>
                </div>
              )
            )}
            {tab === 'heatmap' && <HeatmapView/>}
            {tab === 'insights' && <InsightsView/>}
            {tab === 'history' && <HistoryView/>}
          </div>
        </div>
      </div>
    </div>
  )
}