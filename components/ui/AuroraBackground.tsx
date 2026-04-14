'use client'
import { useEffect, useRef } from 'react'
export function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let f:number, t=0
    const run = () => {
      t+=0.003
      if(!ref.current) return
      const x1=50+Math.sin(t)*20, y1=25+Math.cos(t*0.7)*15
      const x2=75+Math.cos(t*0.8)*25, y2=65+Math.sin(t*1.2)*20
      const x3=15+Math.sin(t*1.1)*18, y3=75+Math.cos(t*0.9)*22
      ref.current.style.background=[
        'radial-gradient(ellipse 60% 40% at '+x1+'% '+y1+'%,rgba(237,25,102,0.055) 0%,transparent 60%)',
        'radial-gradient(ellipse 50% 35% at '+x2+'% '+y2+'%,rgba(33,82,164,0.045) 0%,transparent 55%)',
        'radial-gradient(ellipse 45% 30% at '+x3+'% '+y3+'%,rgba(201,168,76,0.025) 0%,transparent 50%)',
      ].join(',')
      f=requestAnimationFrame(run)
    }
    run()
    return () => cancelAnimationFrame(f)
  },[])
  return <div ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}/>
}