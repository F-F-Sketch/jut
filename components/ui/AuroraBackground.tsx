'use client'
import { useEffect, useRef } from 'react'

export function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    let frame: number; let t = 0
    const animate = () => {
      t += 0.003
      const x1 = 50 + Math.sin(t) * 20
      const y1 = 30 + Math.cos(t * 0.7) * 15
      const x2 = 70 + Math.cos(t * 0.8) * 25
      const y2 = 60 + Math.sin(t * 1.2) * 20
      const x3 = 20 + Math.sin(t * 1.1) * 18
      const y3 = 70 + Math.cos(t * 0.9) * 22
      el.style.background = [
        'radial-gradient(ellipse 60% 40% at ' + x1 + '% ' + y1 + '%, rgba(237,25,102,0.06) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 35% at ' + x2 + '% ' + y2 + '%, rgba(33,82,164,0.05) 0%, transparent 55%)',
        'radial-gradient(ellipse 45% 30% at ' + x3 + '% ' + y3 + '%, rgba(201,168,76,0.03) 0%, transparent 50%)',
      ].join(',')
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <div ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,transition:'background 0.1s'}}/>
}