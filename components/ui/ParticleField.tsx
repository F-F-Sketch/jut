'use client'
import { useEffect, useRef } from 'react'

interface Particle { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; size:number; color:string }

export function ParticleField({ count = 40 }: { count?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    let raf: number
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const colors = ['rgba(237,25,102,', 'rgba(33,82,164,', 'rgba(201,168,76,']
    const particles: Particle[] = Array.from({length: count}, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      life: Math.random() * 200, maxLife: 150 + Math.random() * 150,
      size: 0.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      particles.forEach(p => {
        p.life++; if (p.life > p.maxLife) { p.life = 0; p.x = Math.random() * c.width; p.y = Math.random() * c.height }
        const progress = p.life / p.maxLife
        const opacity = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (opacity * 0.6) + ')'
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0
      })
      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i+1).forEach(q => {
          const dx = p.x - q.x; const dy = p.y - q.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = 'rgba(237,25,102,' + (1 - dist/120) * 0.06 + ')'
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [count])
  return <canvas ref={canvas} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}/>
}