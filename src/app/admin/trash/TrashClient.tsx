'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/lib/utils'

export function TrashClient({ products: initial }: { products: any[] }) {
  const [products, setProducts] = useState(initial)
  const [loading, setLoading]   = useState<number | null>(null)
  const [msg, setMsg]           = useState('')
  const router = useRouter()

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  async function restore(id: number, name: string) {
    setLoading(id)
    const res = await fetch('/api/products/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setProducts(p => p.filter(x => x.id !== id))
      flash(`✓ "${name}" restored successfully!`)
      router.refresh()
    } else { flash('❌ Error restoring product.') }
    setLoading(null)
  }

  async function hardDelete(id: number, name: string) {
    if (!confirm(`⚠️ Permanently delete "${name}"?\n\nThis CANNOT be undone. The product will be removed from the database forever.`)) return
    setLoading(id)
    const res = await fetch('/api/products/restore', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setProducts(p => p.filter(x => x.id !== id))
      flash(`🗑️ "${name}" permanently deleted.`)
    } else { flash('❌ Error deleting product.') }
    setLoading(null)
  }

  async function restoreAll() {
    if (!confirm(`Restore all ${products.length} products from trash?`)) return
    for (const p of products) {
      await fetch('/api/products/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id }),
      })
    }
    setProducts([])
    flash(`✓ All ${products.length} products restored!`)
    router.refresh()
  }

  async function emptyTrash() {
    if (!confirm(`⚠️ Permanently delete ALL ${products.length} products in trash?\n\nThis CANNOT be undone!`)) return
    for (const p of products) {
      await fetch('/api/products/restore', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id }),
      })
    }
    setProducts([])
    flash('🗑️ Trash emptied.')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 10 }}>
            🗑️ Trash
            {products.length > 0 && (
              <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 13, padding: '3px 12px', borderRadius: 20, fontFamily: 'Jost,sans-serif', fontWeight: 700 }}>
                {products.length}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            Deleted products are kept here for 30 days before permanent removal
          </p>
        </div>
        {products.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={restoreAll}
              style={{ padding: '9px 20px', borderRadius: 20, background: '#D1FAE5', color: '#065F46', border: '1.5px solid #6EE7B7', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600 }}>
              ♻️ Restore All
            </button>
            <button onClick={emptyTrash}
              style={{ padding: '9px 20px', borderRadius: 20, background: '#FEE2E2', color: '#DC2626', border: '1.5px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600 }}>
              🗑️ Empty Trash
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: msg.startsWith('✓') ? '#D1FAE5' : msg.startsWith('🗑️') ? '#FEF3C7' : '#FEE2E2', color: msg.startsWith('✓') ? '#065F46' : msg.startsWith('🗑️') ? '#92400E' : '#DC2626' }}>
          {msg}
        </div>
      )}

      {/* Info Banner */}
      <div style={{ padding: '14px 18px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 20, fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <span>Products in trash are <strong>hidden from the store</strong> but not permanently deleted. You can restore them anytime.</span>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: '80px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, color: '#1A1A2E', marginBottom: 8 }}>Trash is empty</h3>
          <p style={{ fontSize: 14, color: '#6B7280' }}>No deleted products. Everything is active!</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FEF2F2', borderBottom: '2px solid #FEE2E2' }}>
                {['Product', 'Code', 'Category', 'Price', 'Deleted On', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #FEF2F2' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, opacity: .6 }}>
                        {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#374151', textDecoration: 'line-through', opacity: .7 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#9CA3AF' }}>{p.code}</td>
                  <td style={{ padding: '14px 16px', color: '#9CA3AF' }}>{p.category}</td>
                  <td style={{ padding: '14px 16px', color: '#9CA3AF' }}>{p.price ? formatNumber(p.price) + ' DZD' : '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 12 }}>
                    <div>{new Date(p.deletedAt).toLocaleDateString('fr-DZ')}</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>{new Date(p.deletedAt).toLocaleTimeString('fr-DZ')}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Restore */}
                      <button onClick={() => restore(p.id, p.name)} disabled={loading === p.id}
                        style={{ padding: '6px 14px', borderRadius: 8, background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7', cursor: loading === p.id ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {loading === p.id ? '...' : '♻️ Restore'}
                      </button>
                      {/* Hard Delete */}
                      <button onClick={() => hardDelete(p.id, p.name)} disabled={loading === p.id}
                        style={{ padding: '6px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', cursor: loading === p.id ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {loading === p.id ? '...' : '🗑️ Delete Forever'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
