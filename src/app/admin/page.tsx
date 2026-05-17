import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalProducts, totalOrders, pendingOrders, totalCustomers,
    revenueData, lowStock, recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.customer.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.product.findMany({ where: { stock: { lt: 10 } }, orderBy: { stock: 'asc' }, take: 5 }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ])

  const totalRevenue = revenueData._sum.total || 0

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    CONFIRMED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
    SHIPPING:  { bg: '#E0E7FF', color: '#3730A3', label: 'Shipping' },
    DELIVERED: { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
    CANCELLED: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 28, color: '#1A1A2E', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 32 }}>
        {[ //4500.toLocaleString("ar-DZ")  // 4 500
          { label: 'Total Revenue',  value: totalRevenue.toString() + ' DZD', icon: '💰', color: '#2E5F8A', bg: '#E5EEF7' },
          { label: 'Total Orders',   value: totalOrders.toString(), icon: '🛒', color: '#4A7C59', bg: '#E8F2EB' },
          { label: 'Pending Orders', value: pendingOrders.toString(), icon: '⏳', color: '#D97706', bg: '#FEF3C7' },
          { label: 'Total Products', value: totalProducts.toString(), icon: '📦', color: '#7C3AED', bg: '#EDE9FE' },
          //{ label: 'Customers',      value: totalCustomers.toString(), icon: '👥', color: '#DC2626', bg: '#FEE2E2' },

          /*/{ label: 'Total Revenue',  value: totalRevenue.toLocaleString("en-US") + ' DZD', icon: '💰', color: '#2E5F8A', bg: '#E5EEF7' },
          { label: 'Total Orders',   value: totalOrders.toLocaleString("en-US"), icon: '🛒', color: '#4A7C59', bg: '#E8F2EB' },
          { label: 'Pending Orders', value: pendingOrders.toLocaleString("en-US"), icon: '⏳', color: '#D97706', bg: '#FEF3C7' },
          { label: 'Total Products', value: totalProducts.toLocaleString("en-US"), icon: '📦', color: '#7C3AED', bg: '#EDE9FE' },
          //{ label: 'Customers',      value: totalCustomers.toString(), icon: '👥', color: '#DC2626', bg: '#FEE2E2' },*/
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, fontWeight: 700, color: '#1A1A2E' }}>{card.value}</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, color: '#1A1A2E' }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: 13, color: '#2E5F8A', fontWeight: 600 }}>View All →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>No orders yet</td></tr>
              ) : recentOrders.map(order => {
                const st = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#2E5F8A' }}>{order.orderNumber}</td>
                    <td style={{ padding: '12px', color: '#1A1A2E' }}>{order.customerName}</td>
                    <td style={{ padding: '12px', color: '#6B7280' }}>{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1A1A2E' }}>{order.total.toLocaleString('en-US')} DZD</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, color: '#1A1A2E' }}>⚠️ Low Stock</h3>
            <Link href="/admin/products" style={{ fontSize: 13, color: '#2E5F8A', fontWeight: 600 }}>Manage →</Link>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>
              ✅ All products have sufficient stock
            </div>
          ) : lowStock.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.code}</div>
              </div>
              <span style={{ background: p.stock === 0 ? '#FEE2E2' : '#FEF3C7', color: p.stock === 0 ? '#DC2626' : '#92400E', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {p.stock === 0 ? 'Out' : p.stock + ' left'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
