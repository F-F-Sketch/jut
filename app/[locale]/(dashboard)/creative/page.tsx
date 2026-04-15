'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Upload, BarChart3, Eye, Sparkles, Wand2, RefreshCw, CheckCircle2, AlertCircle, Zap, Target, Image as ImageIcon, ArrowUp, ChevronRight, Lock, Star, Clock, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

const OWNER_IDS = ['501272f0-032f-4630-986d-e75487f1806d']
const OWNER_EMAILS = ['juanpafirez@gmail.com']

const TABS = [
  { id:'analyze', label:'AI Score', icon:Brain },
  { id:'heatmap', label:'Heatmap', icon:Eye },
  { id:'focusmap', label:'Focus Map', icon:Target },
  { id:'improve', label:'Improve', icon:Wand2 },
  { id:'variants', label:'Variants', icon:Layers },
  { id:'insights', label:'Insights', icon:Sparkles },
  { id:'history', label:'History', icon:BarChart3 },
]

const SCORE_META: Record<string,{label:string;color:string;desc:string}> = {
  visual_impact:{label:'Visual Impact',color:'#ED1966',desc:'How eye-catching'},
  message_clarity:{label:'Message Clarity',color:'#3b82f6',desc:'How clear the message is'},
  cta_strength:{label:'CTA Strength',color:'#f59e0b',desc:'How compelling the CTA'},
  brand_consistency:{label:'Brand Consistency',color:'#8b5cf6',desc:'Brand alignment'},
  emotional_appeal:{label:'Emotional Appeal',color:'#22c55e',desc:'Emotional resonance'},
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
  const [heatmapMode,setHeatmapMode]=useState<'thermal'|'focus'|'both'>('thermal')
  const [userPlan,setUserPlan]=useState('owner')
  const fileRef=useRef<HTMLInputElement>(null)
  const heatCanvas=useRef<HTMLCanvasElement>(null)
  const focusCanvas=useRef<HTMLCanvasElement>(null)
  const heatImg=useRef<HTMLImageElement>(null)
  const focusImg=useRef<HTMLImageElement>(null)
  const supabase=createClient()

  useEffect(()=>{
    (async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user)return
      // Owner check by UID or email - always full access
      if(OWNER_IDS.includes(user.id)||OWNER_EMAILS.includes(user.email||'')){
        setUserPlan('owner'); return
      }
      const{data}=await supabase.from('profiles').select('plan,role').eq('id',user.id).single()
      if(data?.role==='owner'||data?.role==='admin'){setUserPlan('owner')}
      else if(data?.plan==='elite'){setUserPlan('elite')}
      else if(data?.plan==='growth'){setUserPlan('growth')}
      else{setUserPlan('free')}
    })()
  },[])

  useEffect(()=>{
    if(tab==='heatmap'&&analysis&&preview)setTimeout(renderThermalHeatmap,120)
    if(tab==='focusmap'&&preview)setTimeout(renderFocusMap,120)
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

  function renderThermalHeatmap(){
    const canvas=heatCanvas.current; const img=heatImg.current
    if(!canvas||!img||!analysis?.heatmap_zones)return
    const w=img.offsetWidth||600; const h=img.offsetHeight||400
    canvas.width=w; canvas.height=h
    const ctx=canvas.getContext('2d')!
    ctx.clearRect(0,0,w,h)
    // Draw thermal blobs like real eye-tracking software
    const zones=analysis.heatmap_zones
    zones.forEach((z:any)=>{
      const x=(z.x/100)*w; const y=(z.y/100)*h
      const baseR=(z.intensity/100)*Math.min(w,h)*0.28
      // Multiple passes for realistic thermal spread
      for(let pass=0;pass<3;pass++){
        const r=baseR*(1+pass*0.4)
        const grad=ctx.createRadialGradient(x,y,0,x,y,r)
        const int=z.intensity/100
        const alpha=int*(0.7-pass*0.18)
        if(int>0.75){
          grad.addColorStop(0,'rgba(255,0,0,'+alpha+')')
          grad.addColorStop(0.2,'rgba(255,30,0,'+(alpha*0.85)+')')
          grad.addColorStop(0.45,'rgba(255,120,0,'+(alpha*0.65)+')')
          grad.addColorStop(0.65,'rgba(255,220,0,'+(alpha*0.4)+')')
          grad.addColorStop(0.82,'rgba(100,255,50,'+(alpha*0.2)+')')
          grad.addColorStop(1,'rgba(0,100,255,0)')
        }else if(int>0.45){
          grad.addColorStop(0,'rgba(255,130,0,'+alpha+')')
          grad.addColorStop(0.35,'rgba(255,210,0,'+(alpha*0.75)+')')
          grad.addColorStop(0.6,'rgba(80,230,80,'+(alpha*0.45)+')')
          grad.addColorStop(0.85,'rgba(0,80,200,'+(alpha*0.15)+')')
          grad.addColorStop(1,'rgba(0,0,150,0)')
        }else{
          grad.addColorStop(0,'rgba(50,200,80,'+alpha+')')
          grad.addColorStop(0.4,'rgba(0,150,220,'+(alpha*0.6)+')')
          grad.addColorStop(0.75,'rgba(0,50,180,'+(alpha*0.25)+')')
          grad.addColorStop(1,'rgba(0,0,100,0)')
        }
        ctx.globalCompositeOperation=pass===0?'source-over':'screen'
        ctx.fillStyle=grad
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()
      }
    })
    ctx.globalCompositeOperation='source-over'
  }

  function renderFocusMap(){
    const canvas=focusCanvas.current; const img=focusImg.current
    if(!canvas||!img)return
    const w=img.offsetWidth||600; const h=img.offsetHeight||400
    canvas.width=w; canvas.height=h
    const ctx=canvas.getContext('2d')!
    // Dark overlay base
    ctx.fillStyle='rgba(0,0,0,0.82)'
    ctx.fillRect(0,0,w,h)
    if(!analysis?.heatmap_zones){
      // Default focus points if no analysis yet
      const defaults=[{x:50,y:30,intensity:80},{x:50,y:70,intensity:60},{x:80,y:60,intensity:50}]
      defaults.forEach(z=>drawFocusSpot(ctx,w,h,z))
    }else{
      analysis.heatmap_zones.forEach((z:any)=>drawFocusSpot(ctx,w,h,z))
    }
  }

  function drawFocusSpot(ctx:CanvasRenderingContext2D,w:number,h:number,z:any){
    const x=(z.x/100)*w; const y=(z.y/100)*h
    const r=(z.intensity/100)*Math.min(w,h)*0.22
    // Cut out bright spot from dark overlay
    const grad=ctx.createRadialGradient(x,y,0,x,y,r)
    grad.addColorStop(0,'rgba(0,0,0,1)')
    grad.addColorStop(0.3,'rgba(0,0,0,0.95)')
    grad.addColorStop(0.6,'rgba(0,0,0,0.7)')
    grad.addColorStop(0.85,'rgba(0,0,0,0.4)')
    grad.addColorStop(1,'rgba(0,0,0,0)')
    ctx.globalCompositeOperation='destination-out'
    ctx.fillStyle=grad
    ctx.beginPath();ctx.arc(x,y,r*1.5,0,Math.PI*2);ctx.fill()
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
          <div><span style={{fontSize:13,color:'var(--text)',fontWeight:600}}>{m.label}</span><span style={{fontSize:11,color:'var(--text-4)',marginLeft:8}}>{m.desc}</span></div>
          <div style={{display:'flex',alignItems:'baseline',gap:2}}><span style={{fontSize:18,fontWeight:900,color:m.color,fontFamily:'var(--font-display)'}}>{val}</span><span style={{fontSize:11,color:'var(--text-4)'}}>/100</span></div>
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
          <p style={{fontSize:14,color:'var(--text-3)'}}>AI-powered scoring, eye-tracking heatmaps and complete creative redesign</p>
        </div>
        {analysis&&!analyzing&&(
          <div style={{display:'flex',gap:10}}>
            <button onClick={runImprovement} disabled={improving} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:11,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',border:'none',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 18px rgba(139,92,246,0.4)',opacity:improving?0.7:1}}>
              {improving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Wand2 size={14}/>}
              {improving?'Analyzing...':'Improve Plan'}
            </button>
            <button onClick={generateVariants} disabled={generatingVariants} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:11,background:'linear-gradient(135deg,#ED1966,#b0124e)',color:'#fff',border:'none',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 18px rgba(237,25,102,0.4)',opacity:generatingVariants?0.7:1}}>
              {generatingVariants?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Layers size={14}/>}
              {generatingVariants?'Designing...':'Generate Redesigns'}
            </button>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:24,alignItems:'start'}}>
        {/* LEFT */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} style={{borderRadius:18,border:'2px dashed '+(dragOver?'var(--pink)':'var(--border-2)'),background:dragOver?'rgba(237,25,102,0.04)':'var(--surface)',cursor:'pointer',overflow:'hidden',transition:'all 0.2s',minHeight:preview?0:180}}>
            {preview?(
              <div style={{position:'relative'}}>
                <img src={preview} alt="creative" style={{width:'100%',display:'block',borderRadius:16}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.65))',borderRadius:16}}/>
                <div style={{position:'absolute',bottom:10,left:12,right:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.75)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{fileName}</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.45)',background:'rgba(0,0,0,0.45)',padding:'2px 7px',borderRadius:999}}>Change</span>
                </div>
              </div>
            ):(
              <div style={{padding:36,textAlign:'center'}}>
                <div style={{width:48,height:48,borderRadius:14,background:'rgba(237,25,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}><Upload size={20} color="var(--pink)"/></div>
                <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:4}}>Drop your creative here</p>
                <p style={{fontSize:12,color:'var(--text-4)'}}>JPG, PNG, GIF, WebP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
          </div>

          {analyzing&&(
            <div style={{padding:16,borderRadius:14,background:'rgba(237,25,102,0.06)',border:'1px solid rgba(237,25,102,0.2)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{position:'relative',width:20,height:20,flexShrink:0}}>
                  <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid rgba(237,25,102,0.2)',borderTopColor:'var(--pink)',animation:'spin 0.7s linear infinite'}}/>
                </div>
                <div><div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>JUT AI is analyzing...</div><div style={{fontSize:11,color:'var(--text-4)'}}>Processing your creative</div></div>
              </div>
              {['Detecting visual composition','Scoring all 5 dimensions','Mapping attention zones','Generating insights'].map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6,opacity:0.4+i*0.15}}>
                  <div style={{width:4,height:4,borderRadius:'50%',background:'var(--pink)',flexShrink:0}}/>
                  <span style={{fontSize:11,color:'var(--text-3)'}}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {analysis&&!analyzing&&grade&&(
            <div style={{padding:20,borderRadius:18,background:'linear-gradient(135deg,rgba(237,25,102,0.08),rgba(33,82,164,0.06))',border:'1px solid rgba(237,25,102,0.2)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:'rgba(237,25,102,0.08)',filter:'blur(16px)'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <span style={{fontSize:11,color:'var(--text-4)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.8}}>Overall Score</span>
                <div style={{padding:'3px 9px',borderRadius:999,background:grade.color+'20',border:'1px solid '+grade.color+'40'}}>
                  <span style={{fontSize:12,fontWeight:800,color:grade.color}}>Grade {grade.grade}</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:3,marginBottom:10}}>
                <span style={{fontSize:72,fontWeight:900,color:'var(--pink)',letterSpacing:-4,lineHeight:1,fontFamily:'var(--font-display)'}}>{analysis.overall_score}</span>
                <span style={{fontSize:16,color:'var(--text-4)',marginBottom:8}}>/100</span>
              </div>
              {analysis.best_platform&&<span style={{padding:'3px 9px',borderRadius:999,fontSize:11,fontWeight:600,background:'rgba(59,130,246,0.1)',color:'#60a5fa',border:'1px solid rgba(59,130,246,0.2)'}}>📱 {analysis.best_platform}</span>}
            </div>
          )}

          {analysis&&!analyzing&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{padding:11,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{fontSize:10,color:'var(--text-4)',marginBottom:3}}>Platform</div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{analysis.best_platform||'Instagram'}</div>
              </div>
              <div style={{padding:11,borderRadius:11,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{fontSize:10,color:'var(--text-4)',marginBottom:3}}>Audience</div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(analysis.target_audience||'General').slice(0,20)}</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{background:'var(--surface)',borderRadius:20,border:'1px solid var(--border-2)',overflow:'hidden',minHeight:540}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--border-2)',background:'var(--bg-2)',overflowX:'auto'}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==='history')loadHistory()}} style={{flexShrink:0,padding:'12px 10px',border:'none',cursor:'pointer',background:tab===t.id?'var(--surface)':'transparent',color:tab===t.id?'var(--text)':'var(--text-4)',fontSize:11,fontWeight:tab===t.id?700:500,borderBottom:'2px solid '+(tab===t.id?'var(--pink)':'transparent'),display:'flex',alignItems:'center',justifyContent:'center',gap:4,transition:'all 0.15s',whiteSpace:'nowrap'}}>
                <t.icon size={12}/>{t.label}
              </button>
            ))}
          </div>

          <div style={{padding:22,minHeight:480,position:'relative'}}>

            {/* ANALYZE */}
            {tab==='analyze'&&(!analysis?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Brain size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>Ready to analyze</p>
                <p style={{fontSize:13}}>Upload a creative to get your AI performance score</p>
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

            {/* HEATMAP — Thermal like example 1 */}
            {tab==='heatmap'&&(!preview?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Eye size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>Upload an image first</p>
              </div>
            ):(
              <div>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,marginBottom:3}}>Thermal Heatmap</h3>
                    <p style={{fontSize:12,color:'var(--text-4)'}}>Eye-tracking simulation — red = maximum attention</p>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {[['#ff0000','High'],['#ffa500','Med'],['#ffff00','Low'],['#00c864','Min']].map(([color,lbl])=>(
                      <div key={lbl} style={{display:'flex',alignItems:'center',gap:3}}>
                        <div style={{width:9,height:9,borderRadius:2,background:color}}/>
                        <span style={{fontSize:9,color:'var(--text-3)'}}>{lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{position:'relative',borderRadius:14,overflow:'hidden',display:'block',width:'100%'}}>
                  <img ref={heatImg} src={preview} alt="base" style={{width:'100%',display:'block',borderRadius:14}} onLoad={renderThermalHeatmap}/>
                  <canvas ref={heatCanvas} style={{position:'absolute',inset:0,width:'100%',height:'100%',borderRadius:14,opacity:0.78,mixBlendMode:'hard-light',pointerEvents:'none'}}/>
                  {/* Zone labels */}
                  {(analysis?.heatmap_zones||[]).map((z:any,i:number)=>(
                    <div key={i} style={{position:'absolute',left:z.x+'%',top:z.y+'%',transform:'translate(-50%,-130%)',background:'rgba(0,0,0,0.82)',color:'#fff',fontSize:9,padding:'3px 7px',borderRadius:5,whiteSpace:'nowrap',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,0.1)',pointerEvents:'none',zIndex:2}}>
                      {z.intensity>=70?'🔴':z.intensity>=40?'🟡':'🟢'} {z.label} {z.intensity}%
                    </div>
                  ))}
                </div>
                {analysis?.heatmap_zones&&(
                  <div style={{marginTop:14,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8}}>
                    {analysis.heatmap_zones.map((z:any,i:number)=>(
                      <div key={i} style={{padding:10,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                          <span style={{fontSize:10,color:'var(--text-3)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:80}}>{z.label}</span>
                          <span style={{fontSize:12,fontWeight:800,color:z.intensity>=70?'#ef4444':z.intensity>=40?'#f59e0b':'#22c55e'}}>{z.intensity}%</span>
                        </div>
                        <div style={{height:4,borderRadius:999,background:'var(--surface-3)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:z.intensity+'%',borderRadius:999,background:z.intensity>=70?'#ef4444':z.intensity>=40?'#f59e0b':'#22c55e'}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* FOCUS MAP — Dark overlay like example 2 */}
            {tab==='focusmap'&&(!preview?(
              <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                <Target size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>Upload an image first</p>
              </div>
            ):(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,marginBottom:3}}>Focus Map</h3>
                    <p style={{fontSize:12,color:'var(--text-4)'}}>Dark overlay reveals only what viewers actually notice</p>
                  </div>
                </div>
                <div style={{position:'relative',borderRadius:14,overflow:'hidden',display:'block',width:'100%'}}>
                  <img ref={focusImg} src={preview} alt="base" style={{width:'100%',display:'block',borderRadius:14}} onLoad={renderFocusMap}/>
                  <canvas ref={focusCanvas} style={{position:'absolute',inset:0,width:'100%',height:'100%',borderRadius:14,pointerEvents:'none'}}/>
                </div>
                <div style={{marginTop:14,padding:14,borderRadius:12,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--text-4)',marginBottom:8}}>ATTENTION INSIGHT</div>
                  <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65}}>{analysis?.summary||'The bright areas show where viewers focus their attention. Dark areas are likely to be ignored in the first 3 seconds of viewing.'}</p>
                  {analysis?.heatmap_zones&&(
                    <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
                      {analysis.heatmap_zones.filter((z:any)=>z.intensity>=60).map((z:any,i:number)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:7,height:7,borderRadius:'50%',background:z.intensity>=70?'#ef4444':'#f59e0b',flexShrink:0}}/>
                          <span style={{fontSize:12,color:'var(--text-2)'}}><strong>{z.label}</strong> — {z.intensity>=75?'Critical focal point':'Strong attention zone'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* IMPROVE */}
            {tab==='improve'&&(
              <div style={{position:'relative'}}>
                <PlanGate feature="AI Improvement Plan" plan={userPlan}/>
                {!improvements?(
                  <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-3)'}}>
                    <Wand2 size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                    <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>Improvement Plan</p>
                    <p style={{fontSize:13,marginBottom:22}}>JUT AI will generate a detailed plan to boost your creative performance</p>
                    {analysis?(
                      <button onClick={runImprovement} disabled={improving} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 18px rgba(139,92,246,0.35)'}}>
                        {improving?<RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>:<Wand2 size={14}/>}
                        {improving?'JUT AI is analyzing...':'Generate Improvement Plan'}
                      </button>
                    ):<p style={{fontSize:13,color:'var(--pink)'}}>Analyze your creative first</p>}
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <div style={{width:34,height:34,borderRadius:10,background:'rgba(139,92,246,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}><Wand2 size={16} color="#8b5cf6"/></div>
                      <div><h3 style={{fontSize:15,fontWeight:700}}>JUT AI Improvement Plan</h3><p style={{fontSize:11,color:'var(--text-4)'}}>Sorted by impact</p></div>
                    </div>
                    {improvements.priority_fixes&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#ef4444',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Zap size={12}/> Priority Fixes</div>
                        {improvements.priority_fixes.map((fix:any,i:number)=>(
                          <div key={i} style={{padding:13,borderRadius:11,background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.12)',marginBottom:9}}>
                            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                              <span style={{width:19,height:19,borderRadius:'50%',background:'#ef4444',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}}>{i+1}</span>
                              <span style={{fontSize:13,fontWeight:700,color:'var(--text)',flex:1}}>{fix.title}</span>
                              {fix.impact&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:999,background:'rgba(239,68,68,0.1)',color:'#ef4444',fontWeight:700}}>+{fix.impact}pts</span>}
                            </div>
                            <p style={{fontSize:12,color:'var(--text-3)',lineHeight:1.6,paddingLeft:26}}>{fix.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {improvements.copy_suggestions&&improvements.copy_suggestions.length>0&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Target size={12}/> Copy Improvements</div>
                        {improvements.copy_suggestions.map((s:any,i:number)=>(
                          <div key={i} style={{padding:13,borderRadius:11,background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)',marginBottom:9}}>
                            {s.current&&<div style={{fontSize:11,color:'var(--text-4)',marginBottom:3}}>Current: <span style={{fontStyle:'italic'}}>"{s.current}"</span></div>}
                            <div style={{fontSize:13,fontWeight:600,color:'#22c55e',marginBottom:3}}>Better: "{s.suggested}"</div>
                            {s.reason&&<p style={{fontSize:11,color:'var(--text-4)',marginTop:3}}>{s.reason}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {improvements.design_tweaks&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10,display:'flex',alignItems:'center',gap:5}}><Star size={12}/> Design Tweaks</div>
                        {improvements.design_tweaks.map((t:any,i:number)=>(
                          <div key={i} style={{display:'flex',gap:9,padding:11,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border-2)',marginBottom:7}}>
                            <CheckCircle2 size={14} color="#22c55e" style={{flexShrink:0,marginTop:1}}/>
                            <div><div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{t.title}</div><div style={{fontSize:12,color:'var(--text-3)',lineHeight:1.5}}>{t.description}</div></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VARIANTS — Full canvas redesigns */}
            {tab==='variants'&&(
              <div style={{position:'relative'}}>
                <PlanGate feature="AI Creative Redesigns" plan={userPlan}/>
                {generatingVariants?(
                  <div style={{textAlign:'center',padding:'50px 20px'}}>
                    <div style={{width:48,height:48,borderRadius:'50%',border:'3px solid rgba(237,25,102,0.15)',borderTopColor:'var(--pink)',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
                    <p style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:6}}>JUT AI is redesigning your creative...</p>
                    <p style={{fontSize:13,color:'var(--text-3)'}}>Generating 4 complete redesigns with all improvements applied</p>
                  </div>
                ):variants.length===0?(
                  <div style={{textAlign:'center',padding:'50px 20px',color:'var(--text-3)'}}>
                    <Layers size={50} style={{opacity:0.1,display:'block',margin:'0 auto 14px'}}/>
                    <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:7}}>AI Creative Redesigns</p>
                    <p style={{fontSize:13,marginBottom:22,maxWidth:360,margin:'0 auto 22px'}}>JUT AI will generate 4 complete redesigns of your creative — new layout, colors, copy and visuals — with all improvements applied</p>
                    {analysis?(
                      <button onClick={generateVariants} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:12,background:'linear-gradient(135deg,#ED1966,#b0124e)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 18px rgba(237,25,102,0.35)'}}>
                        <Layers size={14}/> Generate 4 Redesigns
                      </button>
                    ):<p style={{fontSize:13,color:'var(--pink)'}}>Analyze your creative first</p>}
                  </div>
                ):(
                  <div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
                      <div><h3 style={{fontSize:16,fontWeight:700,marginBottom:2}}>Complete Redesigns</h3><p style={{fontSize:12,color:'var(--text-4)'}}>Each applies different improvement strategies to the full creative</p></div>
                      <button onClick={generateVariants} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-3)',cursor:'pointer',fontSize:12}}>
                        <RefreshCw size={11}/> Regenerate
                      </button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      {variants.map((v:any,i:number)=>(
                        <div key={i} style={{borderRadius:16,background:'var(--surface-2)',border:'1px solid var(--border-2)',overflow:'hidden',transition:'all 0.2s'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='rgba(237,25,102,0.35)'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=''}>
                          {/* Full canvas redesign mockup */}
                          <VariantCanvas variant={v} index={i} originalImage={preview||''}/>
                          <div style={{padding:14}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                              <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{v.name}</div>
                              {v.score&&<div style={{fontSize:13,fontWeight:800,color:'#22c55e',fontFamily:'var(--font-display)'}}>{v.score}/100</div>}
                            </div>
                            <div style={{fontSize:11,color:'var(--text-4)',lineHeight:1.5,marginBottom:8}}>{v.description}</div>
                            {v.changes&&(
                              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                                {v.changes.slice(0,3).map((c:string,j:number)=>(
                                  <span key={j} style={{fontSize:10,padding:'2px 7px',borderRadius:999,background:'rgba(237,25,102,0.07)',color:'var(--pink)',border:'1px solid rgba(237,25,102,0.15)'}}>{c}</span>
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
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{padding:15,borderRadius:12,background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.2)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#22c55e',marginBottom:9,display:'flex',alignItems:'center',gap:4}}><CheckCircle2 size={12}/> Strengths</div>
                    {(analysis.strengths||[]).map((s:string,i:number)=>(
                      <div key={i} style={{display:'flex',gap:6,marginBottom:6}}><ArrowUp size={11} color="#22c55e" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{s}</span></div>
                    ))}
                  </div>
                  <div style={{padding:15,borderRadius:12,background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#ef4444',marginBottom:9,display:'flex',alignItems:'center',gap:4}}><AlertCircle size={12}/> Weaknesses</div>
                    {(analysis.improvements||[]).map((s:string,i:number)=>(
                      <div key={i} style={{display:'flex',gap:6,marginBottom:6}}><ChevronRight size={11} color="#ef4444" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{s}</span></div>
                    ))}
                  </div>
                </div>
                <div style={{padding:14,borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7}}>JUT AI Assessment</div>
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
                    <div key={item.id} onClick={()=>{setAnalysis(item.raw_response||item);setTab('analyze')}} style={{padding:13,borderRadius:12,background:'var(--surface-2)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:11,cursor:'pointer',transition:'border-color 0.15s'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='rgba(237,25,102,0.25)'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=''}>
                      <div style={{width:34,height:34,borderRadius:9,background:'rgba(237,25,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ImageIcon size={15} color="var(--pink)"/></div>
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

// VariantCanvas — renders a full canvas redesign of the creative
function VariantCanvas({variant,index,originalImage}:{variant:any;index:number;originalImage:string}){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')!
    canvas.width=400; canvas.height=400
    const img=new Image()
    img.crossOrigin='anonymous'
    img.onload=()=>{
      // Draw original image as base with filter
      ctx.filter=variant.filter||'none'
      ctx.drawImage(img,0,0,400,400)
      ctx.filter='none'
      // Apply color overlay based on variant
      ctx.globalCompositeOperation='multiply'
      ctx.fillStyle=variant.overlay||'rgba(0,0,0,0)'
      ctx.fillRect(0,0,400,400)
      ctx.globalCompositeOperation='source-over'
      // Dark gradient at bottom for text readability
      const grad=ctx.createLinearGradient(0,200,0,400)
      grad.addColorStop(0,'rgba(0,0,0,0)')
      grad.addColorStop(0.5,'rgba(0,0,0,0.55)')
      grad.addColorStop(1,'rgba(0,0,0,0.88)')
      ctx.fillStyle=grad; ctx.fillRect(0,0,400,400)
      // Strategy badge top right
      ctx.fillStyle='rgba(0,0,0,0.6)'
      const badgeW=ctx.measureText(variant.strategy||'Variant '+(index+1)).width+24
      roundRect(ctx,400-badgeW-10,10,badgeW,26,8)
      ctx.font='bold 11px system-ui'; ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='right'
      ctx.fillText(variant.strategy||'Variant '+(index+1),400-18,27)
      // Headline
      ctx.textAlign='center'; ctx.fillStyle='#ffffff'
      ctx.font='bold 22px system-ui'
      wrapText(ctx,variant.headline||'Headline',200,300,360,28)
      // Subtext
      ctx.font='14px system-ui'; ctx.fillStyle='rgba(255,255,255,0.72)'
      ctx.fillText((variant.subtext||'').slice(0,40),200,338)
      // CTA button
      const ctaW=ctx.measureText(variant.cta||'Get Started').width+48
      ctx.fillStyle=variant.ctaColor||'#ED1966'
      roundRect(ctx,200-ctaW/2,356,ctaW,34,10)
      ctx.font='bold 13px system-ui'; ctx.fillStyle='#ffffff'; ctx.textAlign='center'
      ctx.fillText(variant.cta||'Get Started',200,378)
      // Score badge bottom left
      if(variant.score){
        ctx.fillStyle='rgba(0,0,0,0.65)'
        roundRect(ctx,10,366,68,24,8)
        ctx.font='bold 12px system-ui'; ctx.fillStyle='#22c55e'; ctx.textAlign='left'
        ctx.fillText('Est. '+variant.score,18,382)
      }
    }
    img.src=originalImage
  },[variant,originalImage])

  function roundRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y)
    ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r)
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h)
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r)
    ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill()
  }
  function wrapText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxW:number,lineH:number){
    const words=text.split(' '); let line=''
    words.forEach((word,i)=>{
      const test=line+word+' '
      if(ctx.measureText(test).width>maxW&&i>0){ctx.fillText(line,x,y);line=word+' ';y+=lineH}
      else line=test
    })
    ctx.fillText(line,x,y)
  }

  return <canvas ref={canvasRef} style={{width:'100%',display:'block',borderRadius:'14px 14px 0 0'}}/>
}