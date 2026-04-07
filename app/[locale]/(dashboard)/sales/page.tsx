import { createClient, getUser } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, ShoppingBag, DollarSign, Package } from 'lucide-react'
import { formatCurrency, STATUS_COLORS } from '@/lib/utils'
import type { Product, Order } from '@/types'

interface PageProps { params: { locale: string } }

export default async function SalesPage({ params }: PageProps) {
  const { locale } = params
  const t = await getTranslations('sales')
  const user = await getUser()
  const supabase = await createClient()

  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
  ])

  const prods = (products ?? []) as Product[]
  const ords = (orders ?? []) as Order[]
  const totalRevenue = ords.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/sales/products/new`} className="btn-primary flex items-center gap-2"><Plus size={15} />{t('new_product')}</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('products'), value: prods.length, icon: Package, accent: 'rgba(237,25,102,0.1)' },
          { label: t('orders'), value: ords.length, icon: ShoppingBag, accent: 'rgba(33,82,164,0.1)' },
          { label: t('revenue'), value: formatCurrency(totalRevenue, 'USD', locale as 'en' | 'es'), icon: DollarSign, accent: 'rgba(34,197,94,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.accent }}>
              <stat.icon size={20} style={{ color: 'var(--text-2)' }} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Products grid */}
      <div>
        <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text)' }}>{t('products')}</h2>
        {prods.length === 0 ? (
          <div className="card rounded-2xl">
            <div className="empty-state">
              <ShoppingBag size={32} style={{ color: 'var(--text-3)' }} />
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-2)' }}>{t('empty_products_title')}</h3>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t('empty_products_desc')}</p>
              <Link href={`/${locale}/sales/products/new`} className="btn-primary mt-2"><Plus size={14} className="inline mr-1" />{t('new_product')}</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prods.map(product => (
              <div key={product.id} className="card-hover rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--surface-2)' }}>📦</div>
                  <span className={`badge text-xs ${STATUS_COLORS[product.status as keyof typeof STATUS_COLORS] ?? ''}`}>{product.status}</span>
                </div>
                <h3 className="font-display font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{product.name}</h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-3)' }}>{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--pink)' }}>{formatCurrency(product.price, product.currency, locale as 'en' | 'es')}</span>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{product.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      {ords.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text)' }}>{t('orders')}</h2>
          <div className="card rounded-2xl overflow-hidden">
            <table className="jut-table">
              <thead><tr><th>{locale === 'es' ? 'Cliente' : 'Customer'}</th><th>{locale === 'es' ? 'Total' : 'Total'}</th><th>{locale === 'es' ? 'Estado' : 'Status'}</th><th>{locale === 'es' ? 'Pago' : 'Payment'}</th></tr></thead>
              <tbody>
                {ords.map(order => (
                  <tr key={order.id}>
                    <td><p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{order.customer_name}</p><p className="text-xs" style={{ color: 'var(--text-3)' }}>{order.customer_email}</p></td>
                    <td className="font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(order.total, order.currency, locale as 'en' | 'es')}</td>
                    <td><span className={`badge text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ?? ''}`}>{order.status}</span></td>
                    <td><span className={`badge text-xs ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{order.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
