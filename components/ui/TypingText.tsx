'use client'
import { useEffect, useState } from 'react'

export function TypingText({ words, speed = 80, pause = 2000, className = '', style = {} }: {
  words: string[]; speed?: number; pause?: number; className?: string; style?: React.CSSProperties
}) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (waiting) return
    const current = words[wordIdx]
    if (!deleting && charIdx === current.length) {
      setWaiting(true)
      setTimeout(() => { setDeleting(true); setWaiting(false) }, pause)
      return
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
      return
    }
    const delay = deleting ? speed / 2 : speed
    const t = setTimeout(() => {
      setCharIdx(i => deleting ? i - 1 : i + 1)
      setDisplay(current.slice(0, deleting ? charIdx - 1 : charIdx + 1))
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, deleting, waiting, wordIdx, words, speed, pause])

  return (
    <span className={className} style={style}>
      {display}
      <span style={{
        display:'inline-block', width:2, height:'0.9em', background:'var(--pink)',
        marginLeft:2, verticalAlign:'middle', animation:'cursor-blink 1s step-end infinite',
      }}/>
    </span>
  )
}