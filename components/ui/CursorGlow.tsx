'use client'
import { useEffect } from 'react'
export function CursorGlow() {
  useEffect(() => {
    const el = document.createElement('div')
    Object.assign(el.style, {
      position:'fixed',width:'360px',height:'360px',borderRadius:'50%',
      background:'radial-gradient(circle,rgba(237,25,102,0.05) 0%,transparent 70%)',
      pointerEvents:'none',zIndex:'0',
      transform:'translate(-50%,-50%)',
      transition:'left 0.12s ease,top 0.12s ease',
      left:'-600px',top:'-600px',
    })
    document.body.appendChild(el)
    const fn = (e: MouseEvent) => { el.style.left=e.clientX+'px'; el.style.top=e.clientY+'px' }
    window.addEventListener('mousemove',fn)
    return () => { window.removeEventListener('mousemove',fn); el.remove() }
  },[])
  return null
}