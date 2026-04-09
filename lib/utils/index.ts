import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import type { Locale } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function formatCurrency(amount: number, currency: 'USD' | 'COP' = 'USD', locale: Locale = 'en'): string {
  const fmtLocale = locale === 'es' ? 'es-CO' : 'en-US'
  return new Intl.NumberFormat(fmtLocale, {
    style: 'currency', currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount)
}

export function formatNumber(n: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US').format(n)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export const STATUS_COLORS = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
  unqualified: 'bg-red-500/10 text-red-400 border-red-500/20',
  converted: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  lost: 'bg-surface-700/50 text-surface-400 border-surface-600/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-surface-700/50 text-surface-400 border-surface-600/20',
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paused: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const

export const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📸', facebook: '📘', whatsapp: '💬', sms: '📱', email: '📧', internal: '🏠',
}

export function generateId(): string { return crypto.randomUUID() }
export function isValidEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
export function isValidPhone(phone: string): boolean { return /^\+?[\d\s\-().]{7,20}$/.test(phone) }
export function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try { return await fn() } catch (error) {
    if (retries === 0) throw error
    await sleep(delay)
    return withRetry(fn, retries - 1, delay * 2)
  }
}
