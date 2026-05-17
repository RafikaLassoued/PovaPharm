'use client'
import { useState } from 'react'

const STATUS_MAP = {
  PENDING:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  CONFIRMED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
  SHIPPING:  { bg: '#E0E7FF', color: '#3730A3', label: 'Shipping' },
  DELIVERED: { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
}

export function AdminOrdersClient({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState(initial)
  const [selected, setSelected] = useState<any | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = orders
    .filter(o => filter === 'ALL' || o.status === filter)
    .filter(o => !search || o.orderNumber.includes(search.toUpperCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerPhone.includes(search))

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (selected?.id === id) setSelected((s: any) => ({ ...s, status }))
    }
  }

  function openReceipt(order: any) {
    window.open(`/admin/orders/receipt?id=${order.id}`, '_blank')
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E' }}>Orders</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{orders.length} total orders</p>
      </div>

      {/* Filter tabs + Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', ...Object.keys(STATUS_MAP)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 600,
              background: filter === s ? '#2E5F8A' : '#F3F4F6',
              color: filter === s ? '#fff' : '#6B7280',
            }}>
            {s === 'ALL' ? 'All Orders' : (STATUS_MAP as any)[s].label}
            <span style={{ marginLeft: 6, background: 'rgba(255,255,255,.25)', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>
              {s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by order#, name, phone..."
          style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #E5E7EB', fontFamily: 'Jost,sans-serif', fontSize: 13, outline: 'none', width: 240 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #F3F4F6' }}>
                {['Order #', 'Customer', 'Phone', 'Wilaya', 'Total', 'Payment', 'Delivery', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '12px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>No orders found.</td></tr>
              ) : filtered.map(order => {
                const st = (STATUS_MAP as any)[order.status] || STATUS_MAP.PENDING
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F9FAFB', background: selected?.id === order.id ? '#EFF6FF' : 'white' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2E5F8A' }}>{order.orderNumber}</td>
                    <td style={{ padding: '10px 12px', color: '#1A1A2E', fontWeight: 500 }}>{order.customerName}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280' }}>{order.customerPhone}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280' }}>{order.customerWilaya}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{order.total ? formatNumber(order.total) + ' DZD' : '0 DZD'}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280', textTransform: 'capitalize' }}>{order.paymentMethod === 'cod' ? '💵 COD' : order.paymentMethod}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 12 }}>{order.deliveryCompany || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#9CA3AF', fontSize: 11 }}>{new Date(order.createdAt).toLocaleDateString('fr-DZ')}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setSelected(selected?.id === order.id ? null : order)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2E5F8A', color: '#2E5F8A', background: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Jost,sans-serif' }}>
                          {selected?.id === order.id ? 'Close' : 'View'}
                        </button>
                        <button onClick={() => openReceipt(order)}
                          title="Print Shipping Label"
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #4A7C59', color: '#4A7C59', background: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Jost,sans-serif' }}>
                          🏷️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', height: 'fit-content', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18 }}>Order Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>

            <div style={{ marginBottom: 16, padding: '12px', borderRadius: 10, background: '#F9FAFB' }}>
              <div style={{ fontWeight: 700, color: '#2E5F8A', fontSize: 15, marginBottom: 2 }}>{selected.orderNumber}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{new Date(selected.createdAt).toLocaleString('fr-DZ')}</div>
            </div>

            {/* Print Label Button */}
            <button onClick={() => openReceipt(selected)}
              style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#1A1A2E,#2E5F8A)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              🏷️ Print Shipping Label
            </button>

            {[
              ['Customer', selected.customerName],
              ['Phone', selected.customerPhone],
              ['Wilaya', selected.customerWilaya],
              ['Address', selected.customerAddress],
              ['Delivery', `${selected.deliveryType || '—'} · ${selected.deliveryCompany || '—'}`],
              ['Payment', selected.paymentMethod === 'cod' ? '💵 Cash on Delivery' : selected.paymentMethod],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: '#6B7280' }}>{l}</span>
                <span style={{ fontWeight: 500, color: '#1A1A2E', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 14, marginTop: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Items</div>
              {selected.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#1A1A2E' }}>{item.name} <span style={{ color: '#9CA3AF' }}>×{item.quantity}</span></span>
                  <span style={{ fontWeight: 600 }}>{formatNumber(item.price * item.quantity)} DZD</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10, marginTop: 8 }}>
                {selected.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#065F46', marginBottom: 4 }}>
                    <span>Discount</span><span>-{selected.discount ? formatNumber(selected.discount) : '0'} DZD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                  <span>Total</span><span style={{ color: '#2E5F8A' }}>{selected.total ? formatNumber(selected.total) + ' DZD' : '0 DZD'}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Update Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(STATUS_MAP).map(([key, val]) => (
                  <button key={key} onClick={() => updateStatus(selected.id, key)}
                    style={{ padding: '8px', borderRadius: 8, border: `1.5px solid ${selected.status === key ? val.color : '#E5E7EB'}`, background: selected.status === key ? val.bg : '#fff', color: selected.status === key ? val.color : '#6B7280', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
