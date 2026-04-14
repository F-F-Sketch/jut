'use client'
import { useRef, useState } from 'react'

export function MetricCard({ label, value, prefix='', suffix='', icon: Icon, color, delay=0, trend }: {
  label:string; value:number; prefix?:string; suffix?:string; icon:any; color:string; delay?:number; trend?: { value:number; up:boolean }
}) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x:0, y:0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    setTilt({ x, y })
  }

  const iconBg = hovered ? color + '28' : color + '15'
  const iconBorder = hovered ? color + '40' : color + '20'

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x:0, y:0 }) }}
      onMouseMove={handleMove}
      style={{
        padding: 24,
        borderRadius: 20,
        background: 'var(--surface)',
        border: '1px solid ' + (hovered ? 'rgba(237,25,102,0.2)' : 'var(--border-2)'),
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transform: 'perspective(800px) rotateX(' + tilt.y + 'deg) rotateY(' + tilt.x + 'deg) ' + (hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)'),
        transition: 'transform 0.15s ease, border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(237,25,102,0.08)' : 'none',
      }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background: color + '12', filter:'blur(24px)', pointerEvents:'none', opacity: hovered ? 1 : 0.4, transition:'opacity 0.2s' }}/>
      {hovered && <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.02) 50%,transparent 60%)', pointerEvents:'none' }}/>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, position:'relative' }}>
        <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:500, letterSpacing:0.3 }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:10, background: iconBg, display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid ' + iconBorder, transition:'background 0.2s, border-color 0.2s' }}>
          <Icon size={16} color={color} strokeWidth={2}/>
        </div>
      </div>
      <div style={{ fontSize:38, fontWeight:800, color:'var(--text)', letterSpacing:-1.5, lineHeight:1, position:'relative', fontFamily:'var(--font-display)' }}>
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      {trend && (
        <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:12, color: trend.up ? '#22c55e' : '#ef4444', fontWeight:600 }}>
            {trend.up ? '↑' : '↓'} {trend.value}%
          </span>
          <span style={{ fontSize:12, color:'var(--text-4)' }}>vs last month</span>
        </div>
      )}
    </div>
  )
}