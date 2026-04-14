'use client'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useEffect } from 'react'

// ── Page transition wrapper ──────────────────────────────────────────────────
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

// ── Staggered container ──────────────────────────────────────────────────────
export function StaggerContainer({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger item ─────────────────────────────────────────────────────────────
export function StaggerItem({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Fade in on scroll ────────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

// ── Hover card ───────────────────────────────────────────────────────────────
export function HoverCard({ children, style, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ── Animated number counter ──────────────────────────────────────────────────
export function CountUp({ value, duration = 1.5, prefix = '', suffix = '' }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, v => prefix + Math.round(v).toLocaleString() + suffix)

  useEffect(() => {
    if (inView) motionVal.set(value)
  }, [inView, value, motionVal])

  return <motion.span ref={ref}>{display}</motion.span>
}

// ── Shimmer skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, borderRadius = 8 }: { width?: string|number; height?: number; borderRadius?: number }) {
  return (
    <motion.div
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ── Pulse dot ────────────────────────────────────────────────────────────────
export function PulseDot({ color = 'var(--pink)', size = 8 }: { color?: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <motion.div
        style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'absolute' }}
        animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'absolute' }} />
    </div>
  )
}

// ── Slide in from side ───────────────────────────────────────────────────────
export function SlideIn({ children, from = 'left', delay = 0, style }: { children: React.ReactNode; from?: 'left'|'right'|'bottom'; delay?: number; style?: React.CSSProperties }) {
  const x = from === 'left' ? -30 : from === 'right' ? 30 : 0
  const y = from === 'bottom' ? 30 : 0
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

// ── Scale in ─────────────────────────────────────────────────────────────────
export function ScaleIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Modal animation ──────────────────────────────────────────────────────────
export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Animated button ──────────────────────────────────────────────────────────
export function AnimButton({ children, onClick, style, disabled, className }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; disabled?: boolean; className?: string }) {
  return (
    <motion.button
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  )
}

// ── Glow border on hover ─────────────────────────────────────────────────────
export function GlowCard({ children, style, color = 'rgba(237,25,102,0.3)', onClick }: { children: React.ReactNode; style?: React.CSSProperties; color?: string; onClick?: () => void }) {
  return (
    <motion.div
      style={{ position: 'relative', ...style }}
      whileHover={{ boxShadow: '0 0 0 1px ' + color + ', 0 8px 32px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export { motion, AnimatePresence }
