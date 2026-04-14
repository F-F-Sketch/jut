'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Plus, Package, DollarSign, Clock, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'orders'|'products'>('products')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', price:'', description:'' })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [ords, prods] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    setOrders(ords.data || [])
    setProducts(prods.data || [])
    setLoading(false)
  }

  async function createProduct() {
    if (!form.name.trim()) { toast.error('Product name required'); return }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Valid price required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('products').insert({ user_id: user.id, name: form.name, price: Number(form.price), description: form.description, status: 'active' })
    if (error) { toast.error('Failed: ' + error.message); setSaving(false); return }
    toast.success('Product created!')
    setShowModal(false)
    setForm({ name:'', price:'', description:'' })
    setSaving(false)
    load()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(p => p.filter(x => x.id !== id))
    toast.success('Deleted')
  }

  const totalRevenue = orders.filter(o=>o.status==='paid').reduce((s,o)=>s+(o.total||0),0)
  const STATUS_COLORS: Record<string,string> = { paid:'#22c55e', pending:'#f59e0b', cancelled:'#ef4444', draft:'#888' }
  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:14, outline:'none', marginTop:6 }

  return (
    <div style={{padding:32,maxWidth:1200}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>Sales</h1>
          <p style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>{products.length} products · {orders.length} orders</p>
        </div>
        {tab === 'products' && (
          <button onClick={()=>setShowModal(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            <Plus size={16}/> Add Product
          </button>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:24}}>
        {[
          { label:'Revenue', value:'$'+totalRevenue.toLocaleString(), icon:DollarSign, color:'#22c55e' },
          { label:'Orders', value:orders.length, icon:ShoppingCart, color:'#3b82f6' },
          { label:'Products', value:products.length, icon:Package, color:'#8b5cf6' },
          { label:'Pending', value:orders.filter(o=>o.status==='pending').length, icon:Clock, color:'#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:12,color:'var(--text-3)'}}>{c.label}</span>
              <c.icon size={16} color={c.color}/>
            </div>
            <div style={{fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>{loading?'—':c.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--surface)',borderRadius:12,padding:4,width:'fit-content',border:'1px solid var(--border-2)'}}>
        {(['products','orders'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 20px',borderRadius:9,fontSize:14,fontWeight:600,cursor:'pointer',border:'none',background:tab===t?'var(--pink)':'transparent',color:tab===t?'#fff':'var(--text-3)'}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        products.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>
            <Package size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
            <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No products yet</p>
            <p style={{fontSize:13,marginTop:8}}>Add products to sell directly through your automations</p>
            <button onClick={()=>setShowModal(true)} style={{marginTop:20,padding:'10px 24px',borderRadius:12,background:'var(--pink)',color:'#fff',border:'none',fontWeight:700,fontSize:14,cursor:'pointer'}}>Add First Product</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
            {products.map(p => (
              <div key={p.id} style={{padding:22,borderRadius:16,background:'var(--surface)',border:'1px solid var(--border-2)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{fontWeight:700,color:'var(--text)',fontSize:16}}>{p.name}</div>
                  <button onClick={()=>deleteProduct(p.id)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:4}}><Trash2 size={14}/></button>
                </div>
                <div style={{fontSize:26,fontWeight:800,color:'var(--pink)',marginBottom:8,letterSpacing:-0.5}}>
                  {'$'+(p.price||0).toLocaleString()}
                </div>
                {p.description && <div style={{fontSize:13,color:'var(--text-3)',lineHeight:1.5}}>{p.description}</div>}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'var(--text-3)'}}>
            <ShoppingCart size={48} style={{opacity:0.15,display:'block',margin:'0 auto 16px'}}/>
            <p style={{fontSize:15,fontWeight:600,color:'var(--text-2)'}}>No orders yet</p>
            <p style={{fontSize:13,marginTop:8}}>Orders created through conversations and automations will appear here</p>
          </div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {orders.map(o => (
              <div key={o.id} style={{padding:20,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'var(--text)'}}>{o.contact_name || ('Order #'+o.id?.slice(0,8))}</div>
                  <div style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:20,fontWeight:800,color:'var(--text)',letterSpacing:-0.5}}>{'$'+(o.total||0).toLocaleString()}</div>
                <span style={{padding:'4px 12px',borderRadius:999,fontSize:12,fontWeight:600,background:(STATUS_COLORS[o.status]||'#888')+'18',color:STATUS_COLORS[o.status]||'#888'}}>{o.status}</span>
              </div>
            ))}
          </div>
        )
      )}

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:20,padding:32,width:'100%',maxWidth:460}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'var(--text)'}}>Add Product</h2>
              <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Product Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Starter Package" style={inp}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Price (USD)</label>
              <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="297" style={inp}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:600,color:'var(--text-3)'}}>Description (optional)</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What's included..." rows={3} style={{...inp,resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setShowModal(false)} style={{flex:1,padding:'11px',borderRadius:11,background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-2)',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={createProduct} disabled={saving} style={{flex:2,padding:'11px',borderRadius:11,background:'var(--pink)',border:'none',color:'#fff',fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
                {saving?'Saving...':'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}