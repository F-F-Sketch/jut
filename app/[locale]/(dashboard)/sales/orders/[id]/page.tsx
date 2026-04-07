import { createClient, getUser } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, User, CreditCard, Clock } from 'lucide-react'
import { formatCurrency, formatDatetime, STATUS_COLORS } from '@/lib/utils'
import type { Order } from '@/types'

interface PageProps { params: { locale: string; id: string } }

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, id } = params
  const user = await getUser()
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, leads(full_name, email), conversations(channel, participant_name)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!data) notFound()
  const order = data as Order & { leads?: { full_name: string; email: string }; conversations?: { channel: string; participant_name: string } }
  const loc = locale as 'en' | 'es'

  const labels = {
    en: { order: 'Order', customer: 'Customer', items: 'Order Items', payment: 'Payment', summary: 'Summary', status: 'Status', created: 'Created', lead: 'Associated Lead', subtotal: 'Subtotal', total: 'Total', qty: 'Qty', unit: 'Unit Price' },
    es: { order: 'Pedido', customer: 'Cliente', items: 'Artículos del Pedido', payment: 'Pago', summary: 'Resumen', status: 'Estado', created: 'Creado', lead: 'Lead Asociado', subtotal: 'Subtotal', total: 'Total', qty: 'Cant.', unit: 'Precio Unitario' },
  }
  const l = labels[loc]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/sales`} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
              {l.order} #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className={`badge text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ?? ''}`}>{order.status}</span>
            <span className={`badge text-xs ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{order.payment_status}</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{formatDatetime(order.created_at, loc)}</p>
        </div>
        <div className="font-display font-bold text-2xl" style={{ color: 'var(--pink)' }}>
          {formatCurrency(order.total, order.currency as 'USD' | 'COP', loc)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column — items + summary */}
        <div className="xl:col-span-2 space-y-6">
          {/* Items */}
          <div className="card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <Package size={16} style={{ color: 'var(--pink)' }} />
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{l.items}</h2>
            </div>
            <table className="jut-table">
              <thead>
                <tr>
                  <th>{locale === 'es' ? 'Producto' : 'Product'}</th>
                  <th className="text-center">{l.qty}</th>
                  <th className="text-right">{l.unit}</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items as { product_name: string; quantity: number; unit_price: number; total: number }[]).map((item, i) => (
                  <tr key={i}>
                    <td className="font-medium" style={{ color: 'var(--text)' }}>{item.product_name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.unit_price, order.currency as 'USD' | 'COP', loc)}</td>
                    <td className="text-right font-semibold" style={{ color: 'var(--text)' }}>{formatCurrency(item.total, order.currency as 'USD' | 'COP', loc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="px-6 py-4 border-t space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-3)' }}>{l.subtotal}</span>
                <span style={{ color: 'var(--text-2)' }}>{formatCurrency(order.subtotal, order.currency as 'USD' | 'COP', loc)}</span>
              </div>
              <div className="flex items-center justify-between font-display font-bold text-base pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text)' }}>{l.total}</span>
                <span style={{ color: 'var(--pink)' }}>{formatCurrency(order.total, order.currency as 'USD' | 'COP', loc)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>{locale === 'es' ? 'Notas' : 'Notes'}</h3>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right column — customer + payment + meta */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} style={{ color: 'var(--pink)' }} />
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{l.customer}</h3>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--pink), var(--blue))' }}
            >
              {order.customer_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{order.customer_name}</p>
              {order.customer_email && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{order.customer_email}</p>}
              {order.customer_phone && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{order.customer_phone}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} style={{ color: 'var(--pink)' }} />
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{l.payment}</h3>
            </div>
            {[
              { label: l.status, value: order.payment_status },
              { label: locale === 'es' ? 'Moneda' : 'Currency', value: order.currency },
              { label: locale === 'es' ? 'Método' : 'Method', value: order.payment_method ?? (locale === 'es' ? 'Sin especificar' : 'Not specified') },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{row.label}</span>
                <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-2)' }}>{row.value}</span>
              </div>
            ))}
            {order.stripe_payment_intent && (
              <p className="text-xs font-mono truncate" style={{ color: 'var(--text-3)' }}>{order.stripe_payment_intent}</p>
            )}
          </div>

          {/* Associated lead */}
          {order.leads && (
            <div className="card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--text)' }}>{l.lead}</h3>
              <Link
                href={`/${locale}/leads/${order.lead_id}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors"
                style={{ background: 'var(--surface-2)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--pink)' }}>
                  {order.leads.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{order.leads.full_name}</p>
                  {order.leads.email && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{order.leads.email}</p>}
                </div>
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: 'var(--pink)' }} />
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>Timeline</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: locale === 'es' ? 'Pedido creado' : 'Order created', time: order.created_at, color: 'var(--blue)' },
                ...(order.payment_status === 'paid' ? [{ label: locale === 'es' ? 'Pago confirmado' : 'Payment confirmed', time: order.updated_at, color: '#22c55e' }] : []),
              ].map(evt => (
                <div key={evt.label} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: evt.color }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{evt.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDatetime(evt.time, loc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
