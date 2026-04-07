'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  footer?: React.ReactNode
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, size = 'md', children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className={cn('w-full rounded-2xl animate-fade-up', SIZE_MAP[size])}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--pink), transparent)', borderRadius: '16px 16px 0 0' }} />

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              {title && <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>{title}</h2>}
              {description && <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-4 flex-shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn('px-6', title ? 'pb-6' : 'py-6')}>
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
            >
              <X size={15} />
            </button>
          )}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 rounded-b-2xl"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
