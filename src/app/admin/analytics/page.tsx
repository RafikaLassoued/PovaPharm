import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics | Admin' }

export default async function AdminAnalyticsPage() {
  const [revenue, ordersByStatus, topProducts, recentRevenue] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.orderItem.groupBy({ by: ['productId', 'name'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
    prisma.order.findMany({ where: { status: { not: 'CANCELLED' } }, select: { total: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ])

  const totalRevenue = revenue._sum.total || 0
  const STATUS_COLORS: Record<string, string> = { PENDING: '#F59E0B', CONFIRMED: '#3B82F6', SHIPPING: '#8B5CF6', DELIVERED: '#10B981', CANCELLED: '#EF4444' }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Store performance overview</p>
      </div>

      {/* Revenue Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: totalRevenue.toLocaleString('en-US') + ' DZD', icon: '💰', color: '#2E5F8A' },
          { label: 'Avg Order Value', value: recentRevenue.length > 0 ? Math.round(totalRevenue / recentRevenue.length).toLocaleString('en-US') + ' DZD' : '0 DZD', icon: '📊', color: '#4A7C59' },
          { label: 'Orders This Month', value: recentRevenue.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).length.toString(), icon: '📅', color: '#7C3AED' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, color: '#1A1A2E' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Orders by Status */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, marginBottom: 20 }}>Orders by Status</h3>
          {ordersByStatus.map(item => {
            const total = ordersByStatus.reduce((s, i) => s + i._count.id, 0)
            const pct = total > 0 ? Math.round((item._count.id / total) * 100) : 0
            const color = STATUS_COLORS[item.status] || '#9CA3AF'
            return (
              <div key={item.status} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{item.status.charAt(0) + item.status.slice(1).toLowerCase()}</span>
                  <span style={{ color: '#6B7280' }}>{item._count.id} ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: color, borderRadius: 4, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Top Products */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, marginBottom: 20 }}>Top Selling Products</h3>
          {topProducts.length === 0
            ? <p style={{ color: '#9CA3AF', fontSize: 14 }}>No sales data yet.</p>
            : topProducts.map((p, i) => (
              <div key={p.productId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#2E5F8A,#4A7C59)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p._sum.quantity} units sold</div>
                </div>
                <span style={{ background: '#E5EEF7', color: '#2E5F8A', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  #{i + 1}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
