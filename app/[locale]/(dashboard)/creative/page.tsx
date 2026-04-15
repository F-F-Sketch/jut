'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Upload, BarChart3, Eye, Sparkles, TrendingUp, Wand2, Download, RefreshCw, CheckCircle2, AlertCircle, Zap, Target, Image as ImageIcon, ChevronRight, Star, ArrowUp, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'analyze', label:'AI Score', icon:Brain },
  { id:'heatmap', label:'Heatmap', icon:Eye },
  { id:'improve', label:'Improve', icon:Wand2 },
  { id:'insights', label:'Insights', icon:Sparkles },
  { id:'history', label:'History', icon:BarChart3 },
]

const SCORE_META: Record<string,{label:string;color:string;desc:string}> = {
  visual_impact: { label:'Visual Impact', color:'#ED1966', desc:'How eye-catching and striking' },
  message_clarity: { label:'Message Clarity', color:'#3b82f6', desc:'How clearly message comes across' },
  cta_strength: { label:'CTA Strength', color:'#f59e0b', desc:'How compelling the call-to-action is' },
  brand_consistency: { label:'Brand Consistency', color:'#8b5cf6', desc:'Professionalism and brand alignment' },
  emotional_appeal: { label:'Emotional Appeal', color:'#22c55e', desc:'Emotional resonance and engagement' },
}

export default function CreativePage() {
  const [tab, setTab] = useState('analyze')
  const [analysis, setAnalysis] = useState<any>(null)
  const [improving, setImproving] = useState(false)
  const [improvements, setImprovements] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [preview, setPreview] = useState<string|null>(null)
  const [fileName, setFileName] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const heatmapCanvas = useRef<HTMLCanvasElement>(null)
  const heatmapImg = useRef<HTMLImageElement>(null)
  const supabase = createClient()

  useEffect(() => { if (tab === 'heatmap' && analysis && preview) renderHeatmap() }, [tab, analysis, preview])

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreview(base64); setAnalysis(null); setImprovements(null)
      await runAnalysis(base64, file.name)
    }
    reader.readAsDataURL(file)
  }

  async function runAnalysis(base64: string, name: string) {
    setAnalyzing(true); setTab('analyze')
    try {
      const res = await fetch('/api/creative/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, assetName: name, assetType: 'static_ad' }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { toast.error(data.error || 'Analysis failed'); return }
      setAnalysis(data.analysis)
      toast.success('Analysis complete!')
    } catch (e: any) { toast.error(e.message) } finally { setAnalyzing(false) }
  }

  async function runImprovement() {
    if (!preview || !analysis) return
    setImproving(true)
    try {
      const res = await fetch('/api/creative/improve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: preview, analysis, assetName: fileName }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Improvement failed'); return }
      setImprovements(data.improvements)
      setTab('improve')
      toast.success('Improvement plan ready!')
    } catch (e: any) { toast.error(e.message) } finally { setImproving(false) }
  }

  function renderHeatmap() {
    const canvas = heatmapCanvas.current
    const img = heatmapImg.current
    if (!canvas || !img || !analysis?.heatmap_zones) return
    const zones = analysis.heatmap_zones
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Draw each zone as a radial gradient blob
    zones.forEach((z: any) => {
      const x = (z.x / 100) * canvas.width
      const y = (z.y / 100) * canvas.height
      const r = (z.intensity / 100) * Math.min(canvas.width, canvas.height) * 0.3
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
      const intensity = z.intensity / 100
      if (intensity > 0.7) {
        gradient.addColorStop(0, 'rgba(255,0,0,' + intensity * 0.85 + ')')
        gradient.addColorStop(0.4, 'rgba(255,165,0,' + intensity * 0.6 + ')')
        gradient.addColorStop(0.7, 'rgba(255,255,0,' + intensity * 0.3 + ')')
        gradient.addColorStop(1, 'rgba(0,0,255,0)')
      } else if (intensity > 0.4) {
        gradient.addColorStop(0, 'rgba(255,165,0,' + intensity * 0.8 + ')')
        gradient.addColorStop(0.5, 'rgba(255,255,0,' + intensity * 0.4 + ')')
        gradient.addColorStop(1, 'rgba(0,255,0,0)')
      } else {
        gradient.addColorStop(0, 'rgba(0,255,128,' + intensity * 0.7 + ')')
        gradient.addColorStop(0.6, 'rgba(0,100,255,' + intensity * 0.3 + ')')
        gradient.addColorStop(1, 'rgba(0,0,255,0)')
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = gradient
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    })
    // Add scanline effect for premium look
    ctx.globalCompositeOperation = 'destination-over'
  }

  async function loadHistory() {
    if (historyLoaded) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('creative_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
    setHistory(data || []); setHistoryLoaded(true)
  }

  function getGrade(score: number) {
    if (score >= 90) return { grade:'A+', color:'#22c55e' }
    if (score >= 80) return { grade:'A', color:'#22c55e' }
    if (score >= 70) return { grade:'B', color:'#f59e0b' }
    if (score >= 60) return { grade:'C', color:'#f59e0b' }
    return { grade:'D', color:'#ef4444' }
  }

  function ScoreBar({ k, val }: { k:string; val:number }) {
    const meta = SCORE_META[k] || { label:k, color:'var(--pink)', desc:'' }
    const [animated, setAnimated] = useState(0)
    useEffect(() => { const t = setTimeout(() => setAnimated(val), 100); return () => clearTimeout(t) }, [val])
    return (
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
          <div>
            <span style={{ fontSize:13, color:'var(--text)', fontWeight:600 }}>{meta.label}</span>
            <span style={{ fontSize:11, color:'var(--text-4)', marginLeft:8 }}>{meta.desc}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:800, color: meta.color, fontFamily:'var(--font-display)' }}>{val}</span>
            <span style={{ fontSize:11, color:'var(--text-4)' }}>/100</span>
          </div>
        </div>
        <div style={{ height:10, borderRadius:999, background:'var(--surface-3)', overflow:'hidden', position:'relative' }}>
          <div style={{
            height:'100%', borderRadius:999,
            width: animated + '%',
            background: 'linear-gradient(90deg, ' + meta.color + '88, ' + meta.color + ')',
            transition:'width 1.2s cubic-bezier(0.22,1,0.36,1)',
            boxShadow:'0 0 12px ' + meta.color + '60',
            position:'relative',
          }}>
            <div style={{ position:'absolute', right:0, top:0, bottom:0, width:4, background:'white', opacity:0.4, borderRadius:2 }}/>
          </div>
        </div>
      </div>
    )
  }

  const grade = analysis ? getGrade(analysis.overall_score) : null

  return (
    <div style={{ padding:28, maxWidth:1300, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-0.5, marginBottom:4 }}>
            Creative AI Analyzer
          </h1>
          <p style={{ fontSize:14, color:'var(--text-3)' }}>Upload any marketing creative for instant AI-powered scoring, heatmap, and improvement plan</p>
        </div>
        {analysis && !analyzing && (
          <button onClick={runImprovement} disabled={improving} style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 20px',
            borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            color:'#fff', border:'none', fontWeight:700, fontSize:14, cursor:'pointer',
            boxShadow:'0 4px 20px rgba(139,92,246,0.4)', transition:'all 0.2s',
            opacity: improving ? 0.7 : 1,
          }}>
            {improving ? <RefreshCw size={15} style={{ animation:'spin 0.8s linear infinite' }}/> : <Wand2 size={15}/>}
            {improving ? 'Generating...' : 'Improve Creative'}
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:24, alignItems:'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Upload */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleFile(f) }}
            style={{
              borderRadius:18, border:'2px dashed ' + (dragOver ? 'var(--pink)' : 'var(--border-2)'),
              background: dragOver ? 'rgba(237,25,102,0.04)' : 'var(--surface)',
              cursor:'pointer', overflow:'hidden', position:'relative',
              transition:'all 0.2s', minHeight: preview ? 0 : 200,
            }}>
            {preview ? (
              <div style={{ position:'relative' }}>
                <img src={preview} alt="creative" style={{ width:'100%', display:'block', borderRadius:16 }}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6))', borderRadius:16 }}/>
                <div style={{ position:'absolute', bottom:12, left:12, right:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{fileName}</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', background:'rgba(0,0,0,0.4)', padding:'3px 8px', borderRadius:999 }}>Click to change</span>
                </div>
              </div>
            ) : (
              <div style={{ padding:40, textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:16, background:'rgba(237,25,102,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <Upload size={24} color="var(--pink)"/>
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:6 }}>Drop your creative here</p>
                <p style={{ fontSize:13, color:'var(--text-4)' }}>JPG, PNG, GIF, WebP supported</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
          </div>

          {/* Analyzing */}
          {analyzing && (
            <div style={{ padding:18, borderRadius:14, background:'rgba(237,25,102,0.06)', border:'1px solid rgba(237,25,102,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(237,25,102,0.2)', borderTopColor:'var(--pink)', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
                <span style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>Claude AI is analyzing...</span>
              </div>
              {['Detecting visual elements','Scoring message clarity','Mapping attention zones','Generating insights'].map((step,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, opacity: 0.5 + i * 0.15 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--pink)' }}/>
                  <span style={{ fontSize:12, color:'var(--text-3)' }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Score Card */}
          {analysis && !analyzing && grade && (
            <div style={{
              padding:24, borderRadius:18,
              background:'linear-gradient(135deg, rgba(237,25,102,0.08), rgba(33,82,164,0.06))',
              border:'1px solid rgba(237,25,102,0.2)', position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(237,25,102,0.08)', filter:'blur(20px)' }}/>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ fontSize:12, color:'var(--text-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>Overall Score</div>
                <div style={{ padding:'4px 12px', borderRadius:999, background: grade.color + '20', border:'1px solid ' + grade.color + '40' }}>
                  <span style={{ fontSize:13, fontWeight:800, color: grade.color }}>Grade {grade.grade}</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:12 }}>
                <span style={{ fontSize:80, fontWeight:900, color:'var(--pink)', letterSpacing:-4, lineHeight:1, fontFamily:'var(--font-display)' }}>{analysis.overall_score}</span>
                <span style={{ fontSize:20, color:'var(--text-4)', marginBottom:12 }}>/100</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {analysis.best_platform && (
                  <span style={{ padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)' }}>
                    📱 {analysis.best_platform}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick stats */}
          {analysis && !analyzing && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Best Platform', value: analysis.best_platform || 'Instagram', icon:'📱' },
                { label:'Audience', value: (analysis.target_audience || 'General').slice(0,22), icon:'👥' },
              ].map(item => (
                <div key={item.label} style={{ padding:14, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{item.icon}</div>
                  <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:3 }}>{item.label}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Tabs */}
        <div style={{ background:'var(--surface)', borderRadius:20, border:'1px solid var(--border-2)', overflow:'hidden', minHeight:560 }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border-2)', background:'var(--bg-2)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); if(t.id==='history') loadHistory() }} style={{
                flex:1, padding:'13px 6px', border:'none', cursor:'pointer',
                background: tab===t.id ? 'var(--surface)' : 'transparent',
                color: tab===t.id ? 'var(--text)' : 'var(--text-4)',
                fontSize:12, fontWeight: tab===t.id ? 700 : 500,
                borderBottom: '2px solid ' + (tab===t.id ? 'var(--pink)' : 'transparent'),
                display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                transition:'all 0.15s',
              }}>
                <t.icon size={13}/>{t.label}
              </button>
            ))}
          </div>

          <div style={{ padding:24, minHeight:480 }}>

            {/* ANALYZE TAB */}
            {tab==='analyze' && (
              !analysis ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
                  <Brain size={52} style={{ opacity:0.12, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Ready to analyze</p>
                  <p style={{ fontSize:13 }}>Upload a creative on the left to get your AI performance score</p>
                </div>
              ) : (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <h3 style={{ fontSize:16, fontWeight:700 }}>Score Breakdown</h3>
                    <button onClick={() => preview && runAnalysis(preview, fileName)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text-3)', cursor:'pointer', fontSize:12 }}>
                      <RefreshCw size={12}/> Re-analyze
                    </button>
                  </div>
                  {Object.entries(analysis.scores||{}).map(([k,v]) => <ScoreBar key={k} k={k} val={Number(v)}/>)}
                  {analysis.summary && (
                    <div style={{ marginTop:20, padding:16, borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border-2)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:8 }}>AI Summary</div>
                      <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.7 }}>{analysis.summary}</p>
                    </div>
                  )}
                </div>
              )
            )}

            {/* HEATMAP TAB */}
            {tab==='heatmap' && (
              !preview ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
                  <Eye size={52} style={{ opacity:0.12, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>No image uploaded</p>
                  <p style={{ fontSize:13 }}>Upload and analyze an image to see the attention heatmap</p>
                </div>
              ) : (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>Attention Heatmap</h3>
                      <p style={{ fontSize:12, color:'var(--text-4)' }}>Red = highest attention · Yellow = medium · Green = low</p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {[['🔴','High'],['🟡','Med'],['🟢','Low']].map(([dot,lbl]) => (
                        <span key={lbl} style={{ fontSize:11, color:'var(--text-3)', display:'flex', alignItems:'center', gap:3 }}>{dot} {lbl}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ position:'relative', borderRadius:14, overflow:'hidden' }}>
                    <img ref={heatmapImg} src={preview} alt="base" style={{ width:'100%', display:'block', borderRadius:14 }} onLoad={renderHeatmap}/>
                    <canvas ref={heatmapCanvas} style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:14, mixBlendMode:'multiply', opacity:0.75 }}/>
                    {/* Zone labels */}
                    {(analysis?.heatmap_zones||[]).map((z:any,i:number) => (
                      <div key={i} style={{
                        position:'absolute', left:z.x+'%', top:z.y+'%',
                        transform:'translate(-50%,-120%)',
                        background:'rgba(0,0,0,0.75)', color:'#fff',
                        fontSize:10, padding:'3px 8px', borderRadius:6, whiteSpace:'nowrap',
                        backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.1)',
                        pointerEvents:'none',
                      }}>
                        {z.intensity>=70?'🔴':z.intensity>=40?'🟡':'🟢'} {z.label}
                      </div>
                    ))}
                  </div>
                  {!analysis && (
                    <div style={{ marginTop:12, padding:12, borderRadius:10, background:'rgba(237,25,102,0.06)', border:'1px solid rgba(237,25,102,0.15)', fontSize:13, color:'var(--text-3)', textAlign:'center' }}>
                      Run an analysis first to generate attention zones
                    </div>
                  )}
                </div>
              )
            )}

            {/* IMPROVE TAB */}
            {tab==='improve' && (
              !improvements ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
                  <Wand2 size={52} style={{ opacity:0.12, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Improvement Plan</p>
                  <p style={{ fontSize:13, marginBottom:24 }}>Get a detailed AI-generated plan to boost your creative performance</p>
                  {analysis ? (
                    <button onClick={runImprovement} disabled={improving} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 4px 20px rgba(139,92,246,0.35)' }}>
                      {improving ? <RefreshCw size={15} style={{ animation:'spin 0.8s linear infinite' }}/> : <Wand2 size={15}/>}
                      {improving ? 'Generating Plan...' : 'Generate Improvement Plan'}
                    </button>
                  ) : (
                    <p style={{ fontSize:13, color:'var(--pink)' }}>Analyze your creative first →</p>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(139,92,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Wand2 size={18} color="#8b5cf6"/>
                    </div>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:700 }}>AI Improvement Plan</h3>
                      <p style={{ fontSize:12, color:'var(--text-4)' }}>Actionable steps to boost performance</p>
                    </div>
                  </div>

                  {improvements.priority_fixes && (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                        <Zap size={13}/> Priority Fixes
                      </div>
                      {improvements.priority_fixes.map((fix:any,i:number) => (
                        <div key={i} style={{ padding:14, borderRadius:12, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', marginBottom:10 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                            <span style={{ width:22, height:22, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{i+1}</span>
                            <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{fix.title}</span>
                            {fix.impact && <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 8px', borderRadius:999, background:'rgba(239,68,68,0.1)', color:'#ef4444', fontWeight:600 }}>+{fix.impact}pts</span>}
                          </div>
                          <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6, paddingLeft:30 }}>{fix.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {improvements.copy_suggestions && (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#3b82f6', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                        <Target size={13}/> Copy & Text Improvements
                      </div>
                      {improvements.copy_suggestions.map((s:any,i:number) => (
                        <div key={i} style={{ padding:14, borderRadius:12, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', marginBottom:10 }}>
                          <div style={{ fontSize:12, color:'var(--text-4)', marginBottom:4 }}>Current</div>
                          <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:8, fontStyle:'italic' }}>"{s.current || 'No clear copy detected'}"</div>
                          <div style={{ fontSize:12, color:'#22c55e', marginBottom:4, fontWeight:600 }}>Suggested</div>
                          <div style={{ fontSize:14, color:'var(--text)', fontWeight:600 }}>"{s.suggested}"</div>
                          {s.reason && <p style={{ fontSize:12, color:'var(--text-4)', marginTop:6 }}>{s.reason}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {improvements.design_tweaks && (
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#22c55e', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                        <Star size={13}/> Design Tweaks
                      </div>
                      {improvements.design_tweaks.map((t:any,i:number) => (
                        <div key={i} style={{ display:'flex', gap:10, padding:12, borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)', marginBottom:8 }}>
                          <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink:0, marginTop:1 }}/>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:3 }}>{t.title}</div>
                            <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.5 }}>{t.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {/* INSIGHTS TAB */}
            {tab==='insights' && (
              !analysis ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
                  <Sparkles size={52} style={{ opacity:0.12, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'var(--text-2)' }}>Analyze an image to see insights</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ padding:16, borderRadius:12, background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.2)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#22c55e', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}><CheckCircle2 size={13}/> Strengths</div>
                      {(analysis.strengths||[]).map((s:string,i:number) => (
                        <div key={i} style={{ display:'flex', gap:7, marginBottom:8 }}>
                          <ArrowUp size={13} color="#22c55e" style={{ flexShrink:0, marginTop:2 }}/>
                          <span style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding:16, borderRadius:12, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#ef4444', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}><AlertCircle size={13}/> Weaknesses</div>
                      {(analysis.improvements||[]).map((s:string,i:number) => (
                        <div key={i} style={{ display:'flex', gap:7, marginBottom:8 }}>
                          <ChevronRight size={13} color="#ef4444" style={{ flexShrink:0, marginTop:2 }}/>
                          <span style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:16, borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border-2)' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>Full Analysis</div>
                    <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.7 }}>{analysis.summary}</p>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div style={{ padding:14, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
                      <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:5 }}>Target Audience</div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{analysis.target_audience}</div>
                    </div>
                    <div style={{ padding:14, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border-2)' }}>
                      <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:5 }}>Best Platform</div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#3b82f6' }}>{analysis.best_platform}</div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* HISTORY TAB */}
            {tab==='history' && (
              !historyLoaded ? (
                <div style={{ textAlign:'center', padding:40, color:'var(--text-3)' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', border:'2px solid var(--border-2)', borderTopColor:'var(--pink)', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
                  Loading history...
                </div>
              ) : history.length===0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
                  <Clock size={48} style={{ opacity:0.12, display:'block', margin:'0 auto 16px' }}/>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>No analyses yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ fontSize:12, color:'var(--text-4)', marginBottom:4 }}>{history.length} total analyses</div>
                  {history.map(item => {
                    const g = getGrade(item.overall_score||0)
                    return (
                      <div key={item.id} onClick={() => { setAnalysis(item.raw_response||item); setTab('analyze') }}
                        style={{ padding:14, borderRadius:12, background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(237,25,102,0.25)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = ''}>
                        <div style={{ width:38, height:38, borderRadius:10, background:'rgba(237,25,102,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <ImageIcon size={17} color="var(--pink)"/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.asset_name||'Creative'}</div>
                          <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>{new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign:'center', flexShrink:0 }}>
                          <div style={{ fontSize:22, fontWeight:900, color: g.color, fontFamily:'var(--font-display)', lineHeight:1 }}>{item.overall_score||0}</div>
                          <div style={{ fontSize:11, color: g.color, fontWeight:700 }}>{g.grade}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  )
}