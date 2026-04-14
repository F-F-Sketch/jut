'use client'
import { useEffect, useState } from 'react'
export function TypingText({words,speed=75,pause=2200,style={},className=''}:{words:string[];speed?:number;pause?:number;style?:React.CSSProperties;className?:string}) {
  const [disp,setDisp]=useState('')
  const [wi,setWi]=useState(0)
  const [ci,setCi]=useState(0)
  const [del,setDel]=useState(false)
  const [wait,setWait]=useState(false)
  useEffect(()=>{
    if(wait) return
    const w=words[wi]
    if(!del&&ci===w.length){setWait(true);setTimeout(()=>{setDel(true);setWait(false)},pause);return}
    if(del&&ci===0){setDel(false);setWi(i=>(i+1)%words.length);return}
    const t=setTimeout(()=>{
      const next=del?ci-1:ci+1
      setCi(next); setDisp(w.slice(0,next))
    },del?speed/2:speed)
    return()=>clearTimeout(t)
  },[ci,del,wait,wi,words,speed,pause])
  return(
    <span className={className} style={style}>
      {disp}
      <span style={{display:'inline-block',width:2,height:'0.85em',background:'var(--pink)',marginLeft:2,verticalAlign:'middle',animation:'cursor-blink 1s step-end infinite'}}/>
    </span>
  )
}