'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  const [key, setKey] = useState(pathname)

  useEffect(() => {
    setShow(false)
    const t = setTimeout(() => { setKey(pathname); setShow(true) }, 50)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
    }}>
      {children}
    </div>
  )
}
