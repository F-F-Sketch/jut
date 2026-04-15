'use client'
import React from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import Link from 'next/link'
import { Brain, Upload, FlaskConical, BarChart3, ArrowRight, Sparkles, TrendingUp, Eye } from 'lucide-react'

export default async function CreativePage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const supabase = await createClient()
  const user = await getUser()
  let stats = { analyses: 0, experiments: 0, avg_score: 0, enhancements: 0 }
  let recentAnalyses: any[] = []
  if (user) {
    try {
      const [analysesRes, expsRes, enhRes] = await Promise.all([
        supabase.from('creative_analyses').select('id,overall_score,created_at,insights').eq('user_id',user.id).order('created_at',{ascending:false}).limit(5),
        supabase.from('creative_experiments').select('id',{count:'exact'}).eq('user_id',user.id),
        supabase.from('creative_enhancements').select('id',{count:'exact'}).eq('user_id',user.id),
      ])
      const analyses = analysesRes.data ?? []
      recentAnalyses = analyses
      stats = {
        analyses: analyses.length,
        experiments: expsRes.count ?? 0,
        enhancements: enhRes.count ?? 0,
        avg_score: analyses.length ? Math.round(analyses.reduce((s,a) => s + (a.overall_score ?? 0), 0) / analyses.length) : 0,
      }
    } catch {}
  }
  const loc = locale as 'en' | 'es'
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,rgba(237,25,102,0.2),rgba(33,82,164,0.2))',border:'1px solid rgba(237,25,102,0.3)'}}>
              <Brain size={20} style={{color:'var(--pink)'}} />
            </div>
            <h1 className="font-display font-bold text-3xl" style={{color:'var(--text)'}}>Creative Intelligence</h1>
          </div>
          <p className="text-sm" style={{color:'var(--text-3)'}}>
            {loc === 'es' ? 'Analiza, optimiza y experimenta con tus creativos usando IA.' : 'Analyze, optimize, and experiment with your marketing creatives using AI.'}
          </p>
        </div>
        <Link href={'/' + locale + '/creative/analyzer'} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>
          <Upload size={14} />
          {loc === 'es' ? 'Analizar Creativo' : 'Analyze Creative'}
        </Link>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {label: loc === 'es' ? 'AnÃ¡lisis realizados' : 'Analyses run', value: stats.analyses, icon: Brain, color: 'var(--pink)'},
          {label: loc === 'es' ? 'Score promedio' : 'Average score', value: stats.avg_score ? stats.avg_score + '/100' : 'â', icon: TrendingUp, color: '#22c55e'},
          {label: loc === 'es' ? 'Mejoras generadas' : 'Enhancements', value: stats.enhancements, icon: Sparkles, color: '#4a90d9'},
          {label: loc === 'es' ? 'Experimentos' : 'Experiments', value: stats.experiments, icon: FlaskConical, color: '#f59e0b'},
        ].map(({label, value, icon: Icon, color}) => (
          <div key={label} className="rounded-2xl p-5" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{background:color+'20'}}>
              <Icon size={16} style={{color}} />
            </div>
            <p className="font-display font-bold text-2xl" style={{color:'var(--text)'}}>{value}</p>
            <p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {href:'/'+locale+'/creative/analyzer',icon:Eye,label:loc==='es'?'Analizador':'Analyzer',desc:loc==='es'?'Sube un creativo y obtÃ©n anÃ¡lisis con scores y heatmap':'Upload a creative and get scores, heatmap, recommendations',color:'var(--pink)',badge:'AI'},
          {href:'/'+locale+'/creative/analyzer',icon:Sparkles,label:loc==='es'?'Mejorador':'Enhancer',desc:loc==='es'?'JUT genera una versiÃ³n mejorada de tu creativo':'JUT generates an optimized version of your creative',color:'#4a90d9',badge:loc==='es'?'IA Generativa':'Generative AI'},
          {href:'/'+locale+'/creative/experiments',icon:FlaskConical,label:loc==='es'?'Experimentos':'Experiments',desc:loc==='es'?'Crea tests A/B y multivariados para tus creativos':'Create A/B and multivariate tests for your creatives',color:'#f59e0b',badge:'A/B'},
          {href:'/'+locale+'/creative/reports',icon:BarChart3,label:loc==='es'?'Reportes':'Reports',desc:loc==='es'?'Exporta anÃ¡lisis y reportes de performance':'Export analyses and performance reports',color:'#22c55e',badge:'PDF'},
        ].map(({href,icon:Icon,label,desc,color,badge}) => (
          <Link key={href+label} href={href} className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:opacity-90" style={{background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:color+'15',border:'1px solid '+color+'30'}}>
                <Icon size={18} style={{color}} />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:color+'15',color}}>{badge}</span>
            </div>
            <div>
              <p className="font-display font-bold text-base mb-2" style={{color:'var(--text)'}}>{label}</p>
              <p className="text-xs leading-relaxed" style={{color:'var(--text-3)'}}>{desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium" style={{color}}>
              {loc === 'es' ? 'Abrir' : 'Open'} <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
      {recentAnalyses.length === 0 && (
        <div className="rounded-2xl p-12 flex flex-col items-center justify-center text-center" style={{background:'linear-gradient(135deg,rgba(237,25,102,0.04),rgba(33,82,164,0.04))',border:'1px dashed var(--border-2)'}}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{background:'rgba(237,25,102,0.08)',border:'1px solid rgba(237,25,102,0.2)'}}>
            <Brain size={28} style={{color:'var(--pink)'}} />
          </div>
          <h3 className="font-display font-bold text-xl mb-2" style={{color:'var(--text)'}}>
            {loc === 'es' ? 'Tu inteligencia creativa empieza aquÃ­' : 'Your creative intelligence starts here'}
          </h3>
          <p className="text-sm max-w-md mb-6" style={{color:'var(--text-3)'}}>
            {loc === 'es' ? 'Sube cualquier creativo de marketing â JUT lo analizarÃ¡ con IA.' : 'Upload any marketing creative â JUT will analyze it with AI.'}
          </p>
          <Link href={'/' + locale + '/creative/analyzer'} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold" style={{background:'var(--pink)',color:'#fff'}}>
            <Upload size={14} />
            {loc === 'es' ? 'Subir primer creativo' : 'Upload first creative'}
          </Link>
        </div>
      )}
    </div>
  )
}
