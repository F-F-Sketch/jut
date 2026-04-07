'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface PageProps { params: { locale: string } }

export default function NewProductPage({ params }: PageProps) {
  const { locale } = params
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', currency: locale === 'es' ? 'COP' : 'USD',
    category: '', type: 'service', status: 'active',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) {
      toast.error(locale === 'es' ? 'Nombre y precio son requeridos' : 'Name and price are required')
      return
    }
    setSaving(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    })
    if (res.ok) {
      toast.success(locale === 'es' ? 'Producto creado' : 'Product created')
      router.push(`/${locale}/sales`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error')
      setSaving(false)
    }
  }

  const TYPES = {
    en: [
      { v: 'product', icon: '📦', l: 'Physical Product' },
      { v: 'service', icon: '⚡', l: 'Service' },
      { v: 'package', icon: '🎁', l: 'Package / Bundle' },
      { v: 'subscription', icon: '🔁', l: 'Subscription' },
    ],
    es: [
      { v: 'product', icon: '📦', l: 'Producto Físico' },
      { v: 'service', icon: '⚡', l: 'Servicio' },
      { v: 'package', icon: '🎁', l: 'Paquete / Bundle' },
      { v: 'subscription', icon: '🔁', l: 'Suscripción' },
    ],
  }
  const loc = locale as 'en' | 'es'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/sales`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Nuevo Producto' : 'New Product'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {locale === 'es' ? 'Agrega un producto o servicio a tu catálogo' : 'Add a product or service to your catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selection */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Tipo' : 'Type'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TYPES[loc].map(t => (
              <button
                key={t.v}
                type="button"
                onClick={() => set('type', t.v)}
                className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                style={form.type === t.v
                  ? { background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.3)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border-2)' }
                }
              >
                <span className="text-xl">{t.icon}</span>
                <span className="font-semibold text-sm" style={{ color: form.type === t.v ? 'var(--pink)' : 'var(--text)' }}>{t.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product details */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Detalles' : 'Details'}
          </h2>
          <Field label={`${locale === 'es' ? 'Nombre del producto' : 'Product name'} *`}>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder={locale === 'es' ? 'ej. Paquete Emprendedor Starter' : 'e.g. Entrepreneur Starter Package'} />
          </Field>
          <Field label={locale === 'es' ? 'Descripción' : 'Description'}>
            <textarea className="input resize-none w-full" rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder={locale === 'es' ? 'Describe qué incluye este producto o servicio...' : 'Describe what this product or service includes...'} />
          </Field>
          <Field label={locale === 'es' ? 'Categoría' : 'Category'}>
            <input className="input" value={form.category} onChange={e => set('category', e.target.value)}
              placeholder={locale === 'es' ? 'ej. Marketing, Consultoría, Cursos...' : 'e.g. Marketing, Consulting, Courses...'} />
          </Field>
        </div>

        {/* Pricing */}
        <div className="card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Precio' : 'Pricing'}
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
                {locale === 'es' ? 'Precio *' : 'Price *'}
              </label>
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>
            <div className="w-32 space-y-2">
              <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>
                {locale === 'es' ? 'Moneda' : 'Currency'}
              </label>
              <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
          </div>
          {form.price && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(237,25,102,0.06)', border: '1px solid rgba(237,25,102,0.15)' }}
            >
              <span className="font-display font-bold text-2xl" style={{ color: 'var(--pink)' }}>
                {form.currency === 'COP'
                  ? `$${Number(form.price).toLocaleString('es-CO')} COP`
                  : `$${Number(form.price).toFixed(2)} USD`}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                {locale === 'es' ? 'precio de venta' : 'selling price'}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="card rounded-2xl p-6 space-y-3">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {locale === 'es' ? 'Estado' : 'Status'}
          </h2>
          <div className="flex gap-3">
            {[
              { v: 'active', l: locale === 'es' ? 'Activo' : 'Active', icon: '🟢' },
              { v: 'draft', l: locale === 'es' ? 'Borrador' : 'Draft', icon: '🟡' },
              { v: 'inactive', l: locale === 'es' ? 'Inactivo' : 'Inactive', icon: '⚫' },
            ].map(s => (
              <button
                key={s.v}
                type="button"
                onClick={() => set('status', s.v)}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all"
                style={form.status === s.v
                  ? { background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.3)', color: 'var(--pink)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }
                }
              >
                {s.icon} {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link href={`/${locale}/sales`} className="btn-secondary">
            {locale === 'es' ? 'Cancelar' : 'Cancel'}
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {locale === 'es' ? 'Crear Producto' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)' }}>{label}</label>
      {children}
    </div>
  )
}
