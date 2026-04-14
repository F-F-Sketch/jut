'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Plus, Package, DollarSign, TrendingUp, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalesPage({ params }: { params: { locale: string } }) {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders'|'products'>('orders')
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [ords, prods] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setOrders(ords.data || [])
      setProducts(prods.data || [])
      setLoading(false)
    })()
  }, [])

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0)

  const STATUS_COLORS: Record<string,string> = { paid:'#22c55e', pending:'#f59e0b', cancelled:'#ef4444', draft:'#666' }

  return (
    <div style={{padding:32,maxWidth:1200}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Sales</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{orders.length} orders · ${totalRevenue.toLocaleString()} revenue</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
          <Plus size={16}/> {activeTab === 'orders' ? 'New Order' : 'Add Product'}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
        {[
          { label:'Total Revenue', value:'$'+totalRevenue.toLocaleString(), icon:DollarSign, color:'#22c55e' },
          { label:'Orders', value:orders.length, icon:ShoppingCart, color:'#3b82f6' },
          { label:'Products', value:products.length, icon:Package, color:'#8b5cf6' },
          { label:'Pending', value:orders.filter(o=>o.status==='pending').length, icon:Clock, color:'#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:12,color:'var(--text-3)'}}>{c.label}</span>
              <c.icon size={16} color={c.color}/>
            </div>
            <div style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>{loading ? '—' : c.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--surface)',borderRadius:12,padding:4,width:'fit-content',border:'1px solid var(--border-2)'}}>
        {(['orders','products'] as const).map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{padding:'8px 18px',borderRadius:9,fontSize:14,fontWeight:600,cursor:'pointer',border:'none',
              background:activeTab===tab?'var(--pink)':'transparent',
              color:activeTab===tab?'#fff':'var(--text-3)'}}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        orders.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>
            <ShoppingCart size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
            <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No orders yet</p>
            <p style={{fontSize:13,marginTop:8}}>Orders created through automations will appear here</p>
          </div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {orders.map(order => (
              <div key={order.id} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'var(--text)',marginBottom:4}}>Order #{order.id?.slice(0,8)}</div>
                  <div style={{fontSize:13,color:'var(--text-3)'}}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:'var(--text)'}}>${(order.total||0).toLocaleString()}</div>
                <span style={{padding:'4px 12px',borderRadius:999,fontSize:12,fontWeight:600,background:(STATUS_COLORS[order.status]||'#666')+'18',color:STATUS_COLORS[order.status]||'#666'}}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'products' && (
        products.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>
            <Package size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
            <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No products yet</p>
            <p style={{fontSize:13,marginTop:8}}>Add products to sell directly through your automations</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
            {products.map(p => (
              <div key={p.id} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{fontWeight:700,color:'var(--text)',marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:22,fontWeight:800,color:'var(--pink)',marginBottom:8}}>${(p.price||0).toLocaleString()}</div>
                <div style={{fontSize:13,color:'var(--text-3)'}}>{p.description}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
