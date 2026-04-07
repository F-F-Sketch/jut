import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import type { Locale } from '@/types'

// ── Class Utility ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date Formatting ───────────────────────────────────────────
export function formatDate(date: string | Date, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy', { locale: locale === 'es' ? es : enUS })
}

export function formatDatetime(date: string | Date, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy · h:mm a', { locale: locale === 'es' ? es : enUS })
}

export function timeAgo(date: string | Date, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'es' ? es : enUS })
}

// ── Currency Formatting ───────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'COP' = 'USD',
  locale: Locale = 'en'
): string {
  const fmtLocale = locale === 'es' ? 'es-CO' : 'en-US'
  return new Intl.NumberFormat(fmtLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount)
}

// ── Number Formatting ─────────────────────────────────────────
export function formatNumber(n: number, locale: Locale = 'en'): string {
  const fmtLocale = locale === 'es' ? 'es-CO' : 'en-US'
  return new Intl.NumberFormat(fmtLocale).format(n)
}

// ── String Utilities ──────────────────────────────────────────
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Color Utilities ───────────────────────────────────────────
export const STATUS_COLORS = {
  // Lead status
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
  unqualified: 'bg-red-500/10 text-red-400 border-red-500/20',
  converted: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  lost: 'bg-surface-700/50 text-surface-400 border-surface-600/20',
  // Automation status
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-surface-700/50 text-surface-400 border-surface-600/20',
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paused: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  // Order status
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const

export const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '📘',
  whatsapp: '💬',
  sms: '📱',
  email: '📧',
  internal: '🏠',
}

export const SOURCE_LABELS: Record<string, { en: string; es: string }> = {
  instagram_comment: { en: 'Instagram Comment', es: 'Comentario de Instagram' },
  instagram_dm: { en: 'Instagram DM', es: 'DM de Instagram' },
  facebook: { en: 'Facebook', es: 'Facebook' },
  whatsapp: { en: 'WhatsApp', es: 'WhatsApp' },
  manual: { en: 'Manual', es: 'Manual' },
  form: { en: 'Form', es: 'Formulario' },
  other: { en: 'Other', es: 'Otro' },
}

// ── ID Generation ─────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID()
}

// ── Validation ────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone)
}

// ── Async Utilities ───────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await sleep(delay)
    return withRetry(fn, retries - 1, delay * 2)
  }
}
