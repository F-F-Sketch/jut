'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Upload, BarChart3, Eye, Sparkles, Wand2, RefreshCw, CheckCircle2, AlertCircle, Zap, Target, Image as ImageIcon, ArrowUp, ChevronRight, Lock, Star, Clock, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'analyze', label:'AI Score', icon:Brain },
  { id:'heatmap', label:'Heatmap', icon:Eye },
  { id:'improve', label:'Improve', icon:Wand2 },
  { id:'variants', label:'Variants', icon:Layers },
  { id:'insights', label:'Insights', icon:Sparkles },
  { id:'history', label:'History', icon:BarChart3 },
]

const SCORE_META: Record<string,{label:string;color:string;desc:string}> = {
  visual_impact:{label:'Visual Impact',color:'#ED1966',desc:'How eye-catching and striking'},
  message_clarity:{label:'Message Clarity',color:'#3b82f6',desc:'How clearly message comes across'},
  cta_strength:{label:'CTA Strength',color:'#f59e0b',desc:'How compelling the call-to-action is'},
  brand_consistency:{label:'Brand Consistency',color:'#8b5cf6',desc:'Professionalism and brand alignment'},
  emotional_appeal:{label:'Emotional Appeal',color:'#22c55e',desc:'Emotional resonance and engagement'},
}

function getGrade(s:number){
  if(s>=90)return{grade:'A+',color:'#22c55e'}
  if(s>=80)return{grade:'A',color:'#22c55e'}
  if(s>=70)return{grade:'B',color:'#f59e0b'}
  if(s>=60)return{grade:'C',color:'#f59e0b'}
  return{grade:'D',color:'#ef4444'}
}

function PlanGate({feature,plan}:{feature:string;plan:string}){
  if(plan==='owner'||plan==='elite'||plan==='growth') return null
  return(
    <div style={{position:'absolute',inset:0,background:'rgba(6,6,8,0.92)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:10,backdropFilter:'blur(4px)'}}>
      <div style={{width:52,height:52,borderRadius:16,background:'rgba(237,25,102,0.12)',border:'1px solid rgba(237,25,102,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
        <Lock size={24} color="var(--pink)"/>
      </div>
      <div style={{fontSize:16,fontWeight:800,color:'var(--text)',marginBottom:6}}>{feature}</div>
      <div style={{fontSize:13,color:'var(--text-3)',marginBottom:20,textAlign:'center',maxWidth:260}}>Upgrade your plan to unlock this feature</div>
      <a href="/en/settings" style={{padding:'10px 24px',borderRadius:12,background:'var(--pink)',color:'#fff',fontWeight:700,fontSize:14,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,boxShadow:'0 4px 20px rgba(237,25,102,0.35)'}}>
        <Star size={14}/> Upgrade Plan
      </a>
    </div>
  )
}

export default function CreativePage(){
  const [tab,setTab]=useState('analyze')
  const [analysis,setAnalysis]=useState<any>(null)
  const [improving,setImproving]=useState(false)
  const [improvements,setImprovements]=useState<any>(null)
  const [variants,setVariants]=useState<any[]>([])
  const [generatingVariants,setGeneratingVariants]=useState(false)
  const [analyzing,setAnalyzing]=useState(false)
  const [preview,setPreview]=useState<string|null>(null)
  const [fileName,setFileName]=useState('')
  const [history,setHistory]=useState<any[]>([])
  const [historyLoaded,setHistoryLoaded]=useState(false)
  const [dragOver,setDragOver]=useState(false)
  const [userPlan,setUserPlan]=useState('owner')
  const fileRef=useRef<HTMLInputElement>(null)
  const heatCanvas=useRef<HTMLCanvasElement>(null)
  const heatImg=useRef<HTMLImageElement>(null)
  const supabase=createClient()

  useEffect(()=>{
    (async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user)return
      const{data}=await supabase.from('profiles').select('plan,role').eq('id',user.id).single()
      if(data?.role==='owner'||data?.role==='admin')setUserPlan('owner')
      else setUserPlan(data?.plan||'free')
    })()
  },[])

  useEffect(()=>{
    if(tab==='heatmap'&&analysis&&preview)setTimeout(renderHeatmap,100)
  },[tab,analysis,preview])

  async function handleFile(file:File){
    if(!file.type.startsWith('image/')){toast.error('Please upload an image');return}
    setFileName(file.name)
    const reader=new FileReader()
    reader.onload=async(e)=>{
      const b64=e.target?.result as string
      setPreview(b64);setAnalysis(null);setImprovements(null);setVariants([])
      await runAnalysis(b64,file.name)
    }
    reader.readAsDataURL(file)
  }

  async function runAnalysis(b64:string,name:string){
    setAnalyzing(true);setTab('analyze')
    try{
      const res=await fetch('/api/creative/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:b64,assetName:name,assetType:'static_ad'})})
      const data=await res.json()
      if(!res.ok||!data.success){toast.error(data.error||'Analysis failed');return}
      setAnalysis(data.analysis);toast.success('Analysis complete!')
    }catch(e:any){toast.error(e.message)}finally{setAnalyzing(false)}
  }

  async function runImprovement(){
    if(!preview||!analysis)return
    setImproving(true)
    try{
      const res=await fetch('/api/creative/improve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:preview,analysis,assetName:fileName})})
      const data=await res.json()
      if(!res.ok){toast.error(data.error||'Failed');return}
      setImprovements(data.improvements);setTab('improve');toast.success('Improvement plan ready!')
    }catch(e:any){toast.error(e.message)}finally{setImproving(false)}
  }

  async function generateVariants(){
    if(!preview||!analysis)return
    setGeneratingVariants(true);setTab('variants')
    try{
      const res=await fetch('/api/creative/variants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:preview,analysis,improvements})})
      const data=await res.json()
      if(!res.ok){toast.error(data.error||'Failed');return}
      setVariants(data.variants);toast.success('Variants generated!')
    }catch(e:any){toast.error(e.message)}finally{setGeneratingVariants(false)}
  }

  function renderHeatmap(){
    const canvas=heatCanvas.current
    const img=heatImg.current
    if(!canvas||!img||!analysis?.heatmap_zones)return
    const w=img.offsetWidth||img.width
    const h=img.offsetHeight||img.height
    canvas.width=w;canvas.height=h
    const ctx=canvas.getContext('2d')!
    ctx.clearRect(0,0,w,h)
    const zones=analysis.heatmap_zones
    // Layer 1: Base heat blobs
    zones.forEach((z:any)=>{
      const x=(z.x/100)*w
      const y=(z.y/100)*h
      const r=(z.intensity/100)*Math.min(w,h)*0.32
      const grad=ctx.createRadialGradient(x,y,0,x,y,r)
      const int=z.intensity/100
      if(int>0.7){
        grad.addColorStop(0,'rgba(255,0,0,'+int*0.9+')')
        grad.addColorStop(0.25,'rgba(255,60,0,'+int*0.75+')')
        grad.addColorStop(0.5,'rgba(255,165,0,'+int*0.55+')')
        grad.addColorStop(0.75,'rgba(255,255,0,'+int*0.3+')')
        grad.addColorStop(1,'rgba(0,0,255,0)')
      } else if(int>0.4){
        grad.addColorStop(0,'rgba(255,140,0,'+int*0.85+')')
        grad.addColorStop(0.4,'rgba(255,220,0,'+int*0.6+')')
        grad.addColorStop(0.75,'rgba(0,200,100,'+int*0.25+')')
        grad.addColorStop(1,'rgba(0,0,255,0)')
      } else {
        grad.addColorStop(0,'rgba(0,200,100,'+int*0.8+')')
        grad.addColorStop(0.5,'rgba(0,100,255,'+int*0.4+')')
        grad.addColorStop(1,'rgba(0,0,255,0)')
      }
      ctx.globalCompositeOperation='source-over'
      ctx.fillStyle=grad
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()
    })
    // Layer 2: Noise/texture for realism
    ctx.globalCompositeOperation='overlay'
    for(let i=0;i<w*h*0.001;i++){
      const nx=Math.random()*w; const ny=Math.random()*h
      ctx.fillStyle='rgba(255,255,255,0.03)'
      ctx.beginPath();ctx.arc(nx,ny,Math.random()*3,0,Math.PI*2);ctx.fill()
    }
    ctx.globalCompositeOperation='source-over'
  }

  async function loadHistory(){
    if(historyLoaded)return
    const{data:{user}}=await supabase.auth.getUser()
    if(!user)return
    const{data}=await supabase.from('creative_analyses').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30)
    setHistory(data||[]);setHistoryLoaded(true)
  }

  function ScoreBar({k,val}:{k:string;val:number}){
    const m=SCORE_META[k]||{label:k,color:'var(--pink)',desc:''}
    const [anim,setAnim]=useState(0)
    useEffect(()=>{const t=setTimeout(()=>setAnim(val),150);return()=>clearTimeout(t)},[val])
    return(
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
          <div>
            <span style={{fontSize:13,color:'var(--text)',fontWeight:600}}>{m.label}</span>
            <span style={{fontSize:11,color:'var(--text-4)',marginLeft:8}}>{m.desc}</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}>
            <span style={{fontSize:18,fontWeight:900,color:m.color,fontFamily:'var(--font-display)'}}>{val}</span>
            <span style={{fontSize:11,color:'var(--text-4)'}}>/100</span>
          </div>
        </div>
        <div style={{height:10,borderRadius:999,background:'var(--surface-3)',overflow:'hidden',position:'relative'}}>
          <div style={{height:'100%',borderRadius:999,width:anim+'%',background:'linear-gradient(90deg,'+m.color+'88,'+m.color+')',transition:'width 1.3s cubic-bezier(0.22,1,0.36,1)',boxShadow:'0 0 14px '+m.color+'60',position:'relative'}}>
            <div style={{position:'absolute',right:0,top:0,bottom:0,width:3,background:'rgba(255,255,255,0.5)',borderRadius:2}}/>
          </div>
        </div>
      </div>
    )
  }

  const grade=analysis?getGrade(analysis.overall_score):null

  return(
    <div style={{padding:28,maxWidth:1300}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Creative AI Analyzer</h1>
          <p style={{fontSize:14,color:'var(--text-3)'}}>Upload any marketing creative for instant AI-powered scoring, heatmap, and improvement variants</p>
        </div>
        {analysis&&!analyzing&&(
          <div style={{display:'flex',gap:10}}>
            <button onClick={runImprovement} disabled={improving} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:11,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',border:'none',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 18px rgba(139,92,246,0.4)',opacity:improving?0.7:1}}>
              {improving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Wand2 size={14}/>}
              {improving?'Generating...':'Improve Plan'}
            </button>
            <button onClick={generateVariants} disabled={generatingVariants} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:11,background:'linear-gradient(135deg,#ED1966,#b0124e)',color:'#fff',border:'none',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 18px rgba(237,25,102,0.4)',opacity:generatingVariants?0.7:1,position:'relative'}}>
              {generatingVariants?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Layers size={14}/>}
              {generatingVariants?'Generating...':'Generate Variants'}
              {(userPlan==='free')&&<div style={{position:'absolute',top:-6,right:-6,width:16,height:16,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center'}}><Lock size={8} color="#000"/></div>}
            </button>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:24,alignItems:'start'}}>

        {/* LEFT */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} style={{borderRadius:18,border:'2px dashed '+(dragOver?'var(--pink)':'var(--border-2)'),background:dragOver?'rgba(237,25,102,0.04)':'var(--surface)',cursor:'pointer',overflow:'hidden',transition:'all 0.2s',minHeight:preview?0:200}}>
            {preview?(
              <div style={{position:'relative'}}>
                <img src={preview} alt="creative" style={{width:'100%',display:'block',borderRadius:16}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.65))',borderRadius:16}}/>
                <div style={{position:'absolute',bottom:10,left:12,right:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.75)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:170}}>{fileName}</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.45)',background:'rgba(0,0,0,0.45)',padding:'2px 7px',borderRadius:999}}>Click to change</span>
                </div>
              </div>
            ):(
              <div style={{padding:40,textAlign:'center'}}>
                <div style={{width:52,height:52,borderRadius:14,background:'rgba(237,25,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><Upload size={22} color="var(--pink)"/></div>
                <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:5}}>Drop your creative here</p>
                <p style={{fontSize:12,color:'var(--text-4)'}}>JPG, PNG, GIF, WebP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
          </div>

          {analyzing&&(
            <div style={{padding:18,borderRadius:14,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.2)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{position:'relative',width:22,height:22,flexShrink:0}}>
                  <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid rgba(237,25,102,0.15)',borderTopColor:'var(--pink)',animation:'spin 0.7s linear infinite'}}/>
                  <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'var(--pink)',opacity:0.3}}/>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>JUT AI is analyzing...</div>
                  <div style={{fontSize:11,color:'var(--text-4)'}}>Processing your creative</div>
                </div>
              </div>
              {['Detecting visual composition','Scoring message clarity','Mapping attention zones','Generating performance insights'].map((step,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7,opacity:0.4+i*0.15}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:'var(--pink)',flexShrink:0}}/>
                  <span style={{fontSize:12,color:'var(--text-3)'}}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {analysis&&!analyzing&&grade&&(
            <div style={{padding:22,borderRadius:18,background:'linear-gradient(135deg,rgba(237,25,102,0.08),rgba(33,82,164,0.06))',border:'1px solid rgba(237,25,102,0.2)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-20,right:-20,width:90,height:90,borderRadius:'50%',background:'rgba(237,25,102,0.08)',filter:'blur(18px)'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <span style={{fontSize:11,color:'var(--text-4)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.8}}>Overall Score</span>
                <div style={{padding:'3px 10px',borderRadius:999,background:grade.color+'20',border:'1px solid '+grade.color+'40'}}>
                  <span style={{fontSize:12,fontWeight:800,color:grade.color}}>Grade {grade.grade}</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:3,marginBottom:10}}>
                <span style={{fontSize:76,fontWeight:900,color:'var(--pink)',letterSpacing:-4,lineHeight:1,fontFamily:'var(--font-display)'}}>{analysis.overall_score}</span>
                <span style={{fontSize:18,color:'var(--text-4)',marginBottom:10}}>/100</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {analysis.best_platform&&<span style={{padding:'3px 9px',borderRadius:999,fontSize:11,fontWeight:600,background:'rgba(59,130,246,0.1)',color:'#60a5fa',border:'1px solid rgba(59,130,246,0.2)'}}>📱 {analysis.best_platform}</span>}
              </div>
            </div>
          )}

          {analysis&&!analyzing&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{padding:12,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{fontSize:10,color:'var(--text-4)',marginBottom:3}}>Platform</div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{analysis.best_platform||'Instagram'}</div>
              </div>
              <div style={{padding:12,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{fontSize:10,color:'var(--text-4)',marginBottom:3}}>Audience</div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(analysis.target_audience||'General').slice(0,22)}</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{background:'var(--surface)',borderRadius:20,border:'1px solid var(--border-2)',overflow:'hidden',minHeight:560}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--border-2)',background:'var(--bg-2)'}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==='history')loadHistory()}} style={{flex:1,padding:'12px 4px',border:'none',cursor:'pointer',background:tab===t.id?'var(--surface)':'transparent',color:tab===t.id?'var(--text)':'var(--text-4)',fontSize:11,fontWeight:tab===t.id?700:500,borderBottom:'2px solid '+(tab===t.id?'var(--pink)':'transparent'),display:'flex',alignItems:'center',justifyContent:'center',gap:4,transition:'all 0.15s'}}>
                <t.icon size={12}/>{t.label}
              </button>
            ))}
          </div>

          <div style={{padding:22,minHeight:500,position:'relative'}}>

            {/* ANALYZE */}
            {tab==='analyze'&&(!analysis?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Brain size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>Ready to analyze</p>
                <p style={{fontSize:13}}>Upload a creative on the left to get your AI performance score</p>
              </div>
            ):(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                  <h3 style={{fontSize:16,fontWeight:700}}>Score Breakdown</h3>
                  <button onClick={()=>preview&&runAnalysis(preview,fileName)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',cursor:'pointer',fontSize:12}}>
                    <RefreshCw size={11}/> Re-analyze
                  </button>
                </div>
                {Object.entries(analysis.scores||{}).map(([k,v])=><ScoreBar key={k} k={k} val={Number(v)}/>)}
                {analysis.summary&&(
                  <div style={{marginTop:18,padding:14,borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7}}>JUT AI Summary</div>
                    <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.7}}>{analysis.summary}</p>
                  </div>
                )}
              </div>
            ))}

            {/* HEATMAP */}
            {tab==='heatmap'&&(
              !preview?(
                <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                  <Eye size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                  <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>Upload an image first</p>
                </div>
              ):(
                <div>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                    <div>
                      <h3 style={{fontSize:16,fontWeight:700,marginBottom:3}}>Attention Heatmap</h3>
                      <p style={{fontSize:12,color:'var(--text-4)'}}>AI-predicted eye-tracking simulation — where viewers focus first</p>
                    </div>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      {[['#ff0000','High'],['#ffa500','Med'],['#00c864','Low']].map(([color,lbl])=>(
                        <div key={lbl} style={{display:'flex',alignItems:'center',gap:4}}>
                          <div style={{width:10,height:10,borderRadius:2,background:color}}/>
                          <span style={{fontSize:10,color:'var(--text-3)'}}>{lbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{position:'relative',borderRadius:14,overflow:'hidden',display:'inline-block',width:'100%'}}>
                    <img ref={heatImg} src={preview} alt="base" style={{width:'100%',display:'block',borderRadius:14}} onLoad={renderHeatmap}/>
                    <canvas ref={heatCanvas} style={{position:'absolute',inset:0,width:'100%',height:'100%',borderRadius:14,opacity:0.72,mixBlendMode:'hard-light',pointerEvents:'none'}}/>
                    {/* Zone labels */}
                    {(analysis?.heatmap_zones||[]).map((z:any,i:number)=>(
                      <div key={i} style={{position:'absolute',left:z.x+'%',top:z.y+'%',transform:'translate(-50%,-130%)',background:'rgba(0,0,0,0.8)',color:'#fff',fontSize:10,padding:'3px 8px',borderRadius:6,whiteSpace:'nowrap',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,0.12)',pointerEvents:'none',zIndex:2}}>
                        {z.intensity>=70?'🔴':z.intensity>=40?'🟡':'🟢'} {z.label} <span style={{color:'rgba(255,255,255,0.5)',marginLeft:3}}>{z.intensity}%</span>
                      </div>
                    ))}
                  </div>
                  {/* Attention breakdown */}
                  {analysis?.heatmap_zones&&(
                    <div style={{marginTop:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
                      {analysis.heatmap_zones.map((z:any,i:number)=>(
                        <div key={i} style={{padding:12,borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                            <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{z.label}</span>
                            <span style={{fontSize:13,fontWeight:800,color:z.intensity>=70?'#ef4444':z.intensity>=40?'#f59e0b':'#22c55e'}}>{z.intensity}%</span>
                          </div>
                          <div style={{height:5,borderRadius:999,background:'var(--surface-3)',overflow:'hidden'}}>
                            <div style={{height:'100%',width:z.intensity+'%',borderRadius:999,background:z.intensity>=70?'#ef4444':z.intensity>=40?'#f59e0b':'#22c55e',transition:'width 1s ease'}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!analysis&&<div style={{marginTop:12,padding:12,borderRadius:10,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.15)',fontSize:13,color:'var(--text-3)',textAlign:'center'}}>Run an analysis to generate attention heatmap zones</div>}
                </div>
              )
            )}

            {/* IMPROVE */}
            {tab==='improve'&&(
              <div style={{position:'relative'}}>
                <PlanGate feature="AI Improvement Plan" plan={userPlan}/>
                {!improvements?(
                  <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                    <Wand2 size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                    <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>Improvement Plan</p>
                    <p style={{fontSize:13,marginBottom:22}}>Get a detailed JUT AI plan to boost performance</p>
                    {analysis?(
                      <button onClick={runImprovement} disabled={improving} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 18px rgba(139,92,246,0.35)'}}>
                        {improving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Wand2 size={14}/>}
                        {improving?'JUT AI is generating...':'Generate Improvement Plan'}
                      </button>
                    ):<p style={{fontSize:13,color:'var(--pink)'}}>Analyze your creative first</p>}
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:18}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <div style={{width:34,height:34,borderRadius:10,background:'rgba(139,92,246,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}><Wand2 size={16} color="#8b5cf6"/></div>
                      <div><h3 style={{fontSize:15,fontWeight:700}}>JUT AI Improvement Plan</h3><p style={{fontSize:11,color:'var(--text-4)'}}>Actionable steps sorted by impact</p></div>
                    </div>
                    {improvements.priority_fixes&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#ef4444',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Zap size={12}/> Priority Fixes</div>
                        {improvements.priority_fixes.map((fix:any,i:number)=>(
                          <div key={i} style={{padding:14,borderRadius:12,background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.12)',marginBottom:10}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                              <span style={{width:20,height:20,borderRadius:'50%',background:'#ef4444',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{i+1}</span>
                              <span style={{fontSize:13,fontWeight:700,color:'var(--text)',flex:1}}>{fix.title}</span>
                              {fix.impact&&<span style={{fontSize:11,padding:'2px 7px',borderRadius:999,background:'rgba(239,68,68,0.1)',color:'#ef4444',fontWeight:700,flexShrink:0}}>+{fix.impact}pts</span>}
                            </div>
                            <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.6,paddingLeft:28}}>{fix.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {improvements.copy_suggestions&&improvements.copy_suggestions.length>0&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Target size={12}/> Copy Improvements</div>
                        {improvements.copy_suggestions.map((s:any,i:number)=>(
                          <div key={i} style={{padding:14,borderRadius:12,background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)',marginBottom:10}}>
                            {s.current&&<div style={{fontSize:11,color:'var(--text-4)',marginBottom:3}}>Current: <span style={{color:'var(--text-3)',fontStyle:'italic'}}>"{s.current}"</span></div>}
                            <div style={{fontSize:13,fontWeight:600,color:'#22c55e',marginBottom:3}}>Suggested: "{s.suggested}"</div>
                            {s.reason&&<p style={{fontSize:11,color:'var(--text-4)',marginTop:4}}>{s.reason}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {improvements.design_tweaks&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Star size={12}/> Design Tweaks</div>
                        {improvements.design_tweaks.map((t:any,i:number)=>(
                          <div key={i} style={{display:'flex',gap:10,padding:11,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',marginBottom:8}}>
                            <CheckCircle2 size={15} color="#22c55e" style={{flexShrink:0,marginTop:1}}/>
                            <div><div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{t.title}</div><div style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>{t.description}</div></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VARIANTS */}
            {tab==='variants'&&(
              <div style={{position:'relative'}}>
                <PlanGate feature="AI Creative Variants" plan={userPlan}/>
                {generatingVariants?(
                  <div style={{textAlign:'center',padding:'50px 20px'}}>
                    <div style={{width:48,height:48,borderRadius:'50%',border:'3px solid rgba(237,25,102,0.15)',borderTopColor:'var(--pink)',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
                    <p style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:6}}>JUT AI is designing variants...</p>
                    <p style={{fontSize:13,color:'var(--text-3)'}}>Applying all improvement suggestions to generate 4 redesigned versions</p>
                  </div>
                ):variants.length===0?(
                  <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                    <Layers size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                    <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>Creative Variants</p>
                    <p style={{fontSize:13,marginBottom:22}}>JUT AI will generate 4 redesigned versions of your creative with all improvements applied</p>
                    {analysis?(
                      <button onClick={generateVariants} disabled={generatingVariants} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:12,background:'linear-gradient(135deg,#ED1966,#b0124e)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 18px rgba(237,25,102,0.35)'}}>
                        <Layers size={14}/> Generate 4 Variants
                      </button>
                    ):<p style={{fontSize:13,color:'var(--pink)'}}>Analyze your creative first</p>}
                  </div>
                ):(
                  <div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
                      <div>
                        <h3 style={{fontSize:16,fontWeight:700,marginBottom:3}}>AI-Generated Variants</h3>
                        <p style={{fontSize:12,color:'var(--text-4)'}}>Each variant applies different improvement strategies</p>
                      </div>
                      <button onClick={generateVariants} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',cursor:'pointer',fontSize:12}}>
                        <RefreshCw size={11}/> Regenerate
                      </button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      {variants.map((v:any,i:number)=>(
                        <div key={i} style={{borderRadius:16,background:'var(--surface-2)',border:'1px solid var(--border-2)',overflow:'hidden',transition:'border-color 0.2s'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='rgba(237,25,102,0.3)'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=''}>
                          {/* Visual mockup using canvas */}
                          <div style={{aspectRatio:'1',background:'linear-gradient(135deg,'+v.bg1+','+v.bg2+')',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',padding:16}}>
                            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Variant {i+1}</div>
                            <div style={{fontSize:16,fontWeight:900,color:'#fff',textAlign:'center',marginBottom:8,lineHeight:1.2,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{v.headline}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',textAlign:'center',marginBottom:12,lineHeight:1.4}}>{v.subtext}</div>
                            <div style={{padding:'7px 16px',borderRadius:999,background:v.ctaColor,color:'#fff',fontSize:11,fontWeight:700,boxShadow:'0 3px 12px rgba(0,0,0,0.25)'}}>{v.cta}</div>
                            <div style={{position:'absolute',top:8,right:8,padding:'3px 8px',borderRadius:999,background:'rgba(0,0,0,0.4)',fontSize:10,color:'rgba(255,255,255,0.7)',backdropFilter:'blur(4px)'}}>{v.strategy}</div>
                            {v.score&&<div style={{position:'absolute',bottom:8,left:8,padding:'3px 8px',borderRadius:999,background:'rgba(0,0,0,0.4)',fontSize:10,color:'#22c55e',fontWeight:700,backdropFilter:'blur(4px)'}}>Est. {v.score}/100</div>}
                          </div>
                          <div style={{padding:12}}>
                            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4}}>{v.name}</div>
                            <div style={{fontSize:11,color:'var(--text-4)',lineHeight:1.5}}>{v.description}</div>
                            {v.changes&&(
                              <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:4}}>
                                {v.changes.slice(0,3).map((c:string,j:number)=>(
                                  <span key={j} style={{fontSize:10,padding:'2px 7px',borderRadius:999,background:'rgba(237,25,102,0.08)',color:'var(--pink)',border:'1px solid rgba(237,25,102,0.15)'}}>{c}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INSIGHTS */}
            {tab==='insights'&&(!analysis?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Sparkles size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>Analyze an image to see insights</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{padding:16,borderRadius:12,background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.2)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#22c55e',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><CheckCircle2 size={12}/> Strengths</div>
                    {(analysis.strengths||[]).map((s:string,i:number)=>(
                      <div key={i} style={{display:'flex',gap:6,marginBottom:7}}><ArrowUp size={12} color="#22c55e" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{s}</span></div>
                    ))}
                  </div>
                  <div style={{padding:16,borderRadius:12,background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#ef4444',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><AlertCircle size={12}/> Weaknesses</div>
                    {(analysis.improvements||[]).map((s:string,i:number)=>(
                      <div key={i} style={{display:'flex',gap:6,marginBottom:7}}><ChevronRight size={12} color="#ef4444" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{s}</span></div>
                    ))}
                  </div>
                </div>
                <div style={{padding:14,borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7}}>JUT AI Full Assessment</div>
                  <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.7}}>{analysis.summary}</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div style={{padding:13,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                    <div style={{fontSize:10,color:'var(--text-4)',marginBottom:4}}>Target Audience</div>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{analysis.target_audience}</div>
                  </div>
                  <div style={{padding:13,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                    <div style={{fontSize:10,color:'var(--text-4)',marginBottom:4}}>Best Platform</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#3b82f6'}}>{analysis.best_platform}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* HISTORY */}
            {tab==='history'&&(!historyLoaded?(
              <div style={{textAlign:'center',padding:40,color:'var(--text-3)'}}>
                <div style={{width:22,height:22,borderRadius:'50%',border:'2px solid var(--border-2)',borderTopColor:'var(--pink)',animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>Loading...
              </div>
            ):history.length===0?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Clock size={48} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:14,fontWeight:600,color:'var(--text-2)'}}>No analyses yet</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:11,color:'var(--text-4)',marginBottom:4}}>{history.length} total analyses</div>
                {history.map(item=>{
                  const g=getGrade(item.overall_score||0)
                  return(
                    <div key={item.id} onClick={()=>{setAnalysis(item.raw_response||item);setTab('analyze')}} style={{padding:13,borderRadius:12,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:12,cursor:'pointer',transition:'border-color 0.15s'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='rgba(237,25,102,0.25)'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=''}>
                      <div style={{width:36,height:36,borderRadius:10,background:'rgba(237,25,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ImageIcon size={16} color="var(--pink)"/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.asset_name||'Creative'}</div>
                        <div style={{fontSize:11,color:'var(--text-4)',marginTop:1}}>{new Date(item.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <div style={{fontSize:20,fontWeight:900,color:g.color,fontFamily:'var(--font-display)',lineHeight:1}}>{item.overall_score||0}</div>
                        <div style={{fontSize:10,color:g.color,fontWeight:700}}>{g.grade}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}