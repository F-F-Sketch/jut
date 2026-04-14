'use client'
import { useEffect } from 'react'

export function CursorGlow() {
  useEffect(() => {
    const glow = document.createElement('div')
    glow.id = 'cursor-glow'
    Object.assign(glow.style, {
      position:'fixed', width:'400px', height:'400px', borderRadius:'50%',
      background:'radial-gradient(circle, rgba(237,25,102,0.04) 0%, transparent 70%)',
      pointerEvents:'none', zIndex:'1', transform:'translate(-50%,-50%)',
      transition:'left 0.08s ease, top 0.08s ease', left:'-500px', top:'-500px',
    })
    document.body.appendChild(glow)
    const move = (e) => { glow.style.left = e.clientX+'px'; glow.style.top = e.clientY+'px' }
    window.addEventListener('mousemove', move)
    return () => { window.removeEventListener('mousemove', move); glow.remove() }
  }, [])
  return null
}

export function MagneticButton({ children, strength = 0.3, style = {}, onClick, className = '' }: any) {
  useEffect(() => {
    const buttons = document.querySelectorAll('[data-magnetic]')
    buttons.forEach(btn => {
      const handleMove = (e: any) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        ;(btn as HTMLElement).style.transform = 'translate(' + x * strength + 'px, ' + y * strength + 'px)'
      }
      const handleLeave = () => { (btn as HTMLElement).style.transform = 'translate(0,0)' }
      btn.addEventListener('mousemove', handleMove as any)
      btn.addEventListener('mouseleave', handleLeave)
    })
  }, [])
  return (
    <button data-magnetic onClick={onClick} className={className} style={{
      ...style, transition:'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
    }}>{children}</button>
  )
}