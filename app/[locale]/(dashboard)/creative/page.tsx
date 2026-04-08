import { createClient, getUser } from '@/lib/supabase/server'
import Link from 'next/link'
import { Brain, Upload, FlaskConical, BarChart3, ArrowRight, Sparkles, TrendingUp, Eye, Zap } from 'lucide-react'

export default async function CreativePage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient()
  const user = await getUser()
  let stats = { analyses: 0, experiments: 0, avg_score: 0, enhancements: 0 }
  let recentAnalyses: any[] = []
  if (user) {
    try {
      const [analysesRes, expsRes, enhRes] = await Promise.all([
        supabase.from('creative_analyses').select('id, overall_score, created_at, insights').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('creative_experiments').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('creative_enhancements').select('id', { count: 'exact' }).eq('user_id', user.id),
      ])
      const analyses = analysesRes.data ?? []
      recentAnalyses = analyses
      stats = { analyses: analyses.length, experiments: expsRes.count ?? 0, enhancements: enhRes.count ?? 0, avg_score: analyses.length ? Math.round(analyses.reduce((s, a) => s + (a.overall_score ?? 0), 0) / analyses.length) : 0 }
    } catch {}
  }
  const loc = locale as 'en' | 'es'
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(237,25,102,0.2), rgba(33,82,164,0.2))', border: '1px solid rgba(237,25,102,0.3)' }}><Brain size={20} style={{ color: 'var(--pink)' }} /></div>
            <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>Creative Intelligence</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{loc === 'es' ? 'Analiza, optimiza y experimenta con tus creativos de marketing usando IA.' : 'Analyze, optimize, and experiment with your marketing creatives using AI.'}</p>
        </div>
        <Link href={`/${locale}/creative/analyzer`} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{ background: 'var(--pink)', color: '#fff' }}><Upload size={14} />{loc === 'es' ? 'Analizar Creativo' : 'Analyze Creative'}</Link>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{label:loc==='es'?'AnÃ¡lisis realizados':'Analyses run',value:stats.analyses,icon:Brain,color:'var(--pink)'},{label:loc==='es'?'Score promedio':'Average score', value:stats.avg_score?`${stats.avg_score}/100`:'â',icon:TrendingUp,color:'#22c55e'},{label:loc==='es'?'Mejoras':'Enhancements',value:stats.enhancements,icon:Sparkles,color:'#4a90d9'},{label:loc==='es'?'Experimentos':'Experiments',value:stats.experiments,icon:FlaskConical,color:'#f59e0b'}].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="rounded-2xl p-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{background:`${color}20`}}><Icon size={16} style={{color}} /></div>
            <p className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>{value}</p>
            <p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{label}</p>
          </div>))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[{href:`/${locale}/creative/analyzer`,icon:Eye,label:loc==='es'?'Analizador':'Analyzer',title:loc==='es'?'Sube un creativo y obtÃ©n un anÃ¡lisis completo':'Upload a creative and get full analysis',color:'var(--pink)',badge:'AI'},{href:`/${locale}/creative/analyzer`,icon:Sparkles,label:loc==='es'?'Mejorador':'Enhancer',title:loc==='es'?'JUT genera una versiÃ³n mejorada':'JUT generates an optimized version',0color:'#4a90d9',badge:loc==='es'?'IA Generativa':'Generative AI.},{href:`/${locale}/creative/experiments`,icon:FlaskConical,label:loc==='es'?'Experimentos':'Experiments',color:'#f59e0b',badge:'A/B'},{href:`/${locale}/creative/reports`,icon:BarChart3,label:loc==='es'?'Reportes':'Reports',color:'#22c55e',badge:'PDF'}].map(({href,icon:Icon,label,color,badge})=>(
          <Link key={href} href={href} className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:opacity-90" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="flex items-start justify-between"><div className="w410 h-10 rounded-xl flex items-center justify-center" style={{background:`${color}15`,border:`1px solid ${color}30`}}><Icon size={18} style={{color}} /></div><aria-label>{badge}</aria-label></div>
            <p className="font-display font-bold text-base" style={{color:'var(--text)'}}>{label}</p>
          </Link>
        ))}
      </div>
      </div>
  )
}
