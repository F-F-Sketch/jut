'use client'
import { useEffect, useRef, useState } from 'react'

export function FadeUp({children,delay=0,className=''}:{children:React.ReactNode;delay?:number;className?:string}) {
  const ref=useRef<HTMLDivElement>(null)
  const [v,setV]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);ob.disconnect()}},{threshold:0.08})
    ob.observe(el); return()=>ob.disconnect()
  },[])
  return(
    <div ref={ref} className={className} style={{
      opacity:v?1:0,transform:v?'translateY(0)':'translateY(28px)',
      transition:'opacity 0.6s cubic-bezier(0.22,1,0.36,1),transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      transitionDelay:v?delay+'ms':'0ms',
    }}>{children}</div>
  )
}

export function StaggerChildren({children,stagger=75}:{children:React.ReactNode;stagger?:number}) {
  const ref=useRef<HTMLDivElement>(null)
  const [v,setV]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);ob.disconnect()}},{threshold:0.04})
    ob.observe(el); return()=>ob.disconnect()
  },[])
  return(
    <div ref={ref}>
      {Array.isArray(children)?children.map((c,i)=>(
        <div key={i} style={{
          opacity:v?1:0,transform:v?'translateY(0)':'translateY(22px)',
          transition:'opacity 0.5s cubic-bezier(0.22,1,0.36,1),transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          transitionDelay:v?(i*stagger)+'ms':'0ms',
        }}>{c}</div>
      )):children}
    </div>
  )
}

export function ScaleIn({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  const ref=useRef<HTMLDivElement>(null)
  const [v,setV]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);ob.disconnect()}},{threshold:0.1})
    ob.observe(el); return()=>ob.disconnect()
  },[])
  return(
    <div ref={ref} style={{
      opacity:v?1:0,transform:v?'scale(1)':'scale(0.93)',
      transition:'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1),transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      transitionDelay:v?delay+'ms':'0ms',
    }}>{children}</div>
  )
}

export function CountUp({to,duration=1400,prefix='',suffix=''}:{to:number;duration?:number;prefix?:string;suffix?:string}) {
  const ref=useRef<HTMLSpanElement>(null)
  const [val,setVal]=useState(0)
  const [started,setStarted]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started){setStarted(true);ob.disconnect()}},{threshold:0.5})
    ob.observe(el); return()=>ob.disconnect()
  },[])
  useEffect(()=>{
    if(!started) return
    const t0=Date.now()
    const tick=()=>{
      const p=Math.min((Date.now()-t0)/duration,1)
      const e=1-Math.pow(1-p,3)
      setVal(Math.floor(e*to))
      if(p<1)requestAnimationFrame(tick); else setVal(to)
    }
    requestAnimationFrame(tick)
  },[started,to,duration])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

export function Skeleton({width='100%',height=18,radius=8}:{width?:string|number;height?:number;radius?:number}) {
  return <div className="animate-shimmer" style={{width,height,borderRadius:radius}}/>
}