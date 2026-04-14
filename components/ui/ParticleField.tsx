'use client'
import { useEffect, useRef } from 'react'
export function ParticleField({ count=35 }:{count?:number}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c=ref.current; if(!c) return
    const ctx=c.getContext('2d'); if(!ctx) return
    let raf:number
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight}
    resize(); window.addEventListener('resize',resize)
    const cols=['rgba(237,25,102,','rgba(33,82,164,','rgba(201,168,76,']
    const ps=Array.from({length:count},()=>({
      x:Math.random()*c.width,y:Math.random()*c.height,
      vx:(Math.random()-0.5)*0.35,vy:(Math.random()-0.5)*0.35,
      life:Math.random()*200,max:150+Math.random()*150,
      r:0.6+Math.random()*1.6,col:cols[Math.floor(Math.random()*3)]
    }))
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height)
      ps.forEach(p=>{
        p.life++; if(p.life>p.max){p.life=0;p.x=Math.random()*c.width;p.y=Math.random()*c.height}
        const prog=p.life/p.max
        const op=prog<0.2?prog/0.2:prog>0.8?(1-prog)/0.2:1
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=p.col+(op*0.55)+')';ctx.fill()
        p.x+=p.vx;p.y+=p.vy
        if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0
        if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0
      })
      ps.forEach((p,i)=>ps.slice(i+1).forEach(q=>{
        const dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<110){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)
          ctx.strokeStyle='rgba(237,25,102,'+(1-d/110)*0.05+')';ctx.lineWidth=0.5;ctx.stroke()}
      }))
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[count])
  return <canvas ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}/>
}