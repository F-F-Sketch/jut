'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
export function PageTransition({ children }:{children:React.ReactNode}) {
  const pathname = usePathname()
  const [show,setShow]=useState(true)
  useEffect(()=>{
    setShow(false)
    const t=setTimeout(()=>setShow(true),40)
    return()=>clearTimeout(t)
  },[pathname])
  return (
    <div style={{
      opacity:show?1:0,
      transform:show?'translateY(0)':'translateY(10px)',
      transition:'opacity 0.32s cubic-bezier(0.22,1,0.36,1),transform 0.32s cubic-bezier(0.22,1,0.36,1)',
    }}>{children}</div>
  )
}