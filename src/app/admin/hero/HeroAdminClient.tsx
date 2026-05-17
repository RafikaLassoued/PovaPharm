'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/lib/utils'
import type { Product } from '@/types'

export function HeroAdminClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [list, setList]     = useState(products)
  const [loading, setLoading] = useState<number | null>(null)
  const [msg, setMsg]       = useState('')

  const featured    = list.filter(p => p.featured)
  const notFeatured = list.filter(p => !p.featured)

  async function toggle(p: Product) {
    setLoading(p.id)
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, featured: !p.featured }),
    })
    if (res.ok) {
      setList(prev => prev.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x))
      setMsg(p.featured ? `❌ "${p.name}" removed from Hero.` : `✅ "${p.name}" added to Hero!`)
      setTimeout(() => setMsg(''), 3000)
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E' }}>🎠 Hero Slider</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          المنتجات المميزة تظهر في الصفحة الرئيسية وتتبدل تلقائياً كل 3 ثوانٍ
        </p>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: msg.startsWith('✅') ? '#D1FAE5' : '#FEE2E2',
          color:      msg.startsWith('✅') ? '#065F46' : '#DC2626',
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Featured — في الـ Hero */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '2px solid #4A7C59' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 22 }}>⭐</span>
            <div>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, color: '#1A1A2E' }}>Hero Products</h3>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{featured.length} منتج يظهر في الـ Slider</p>
            </div>
          </div>

          {featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>
              لا يوجد منتجات مضافة للـ Hero بعد.<br />أضف من القائمة على اليمين.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {featured.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : p.emoji}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{formatNumber(p.price)} DZD · {p.category}</div>
                  </div>
                  {/* Remove button */}
                  <button onClick={() => toggle(p)} disabled={loading === p.id}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #EF4444', color: '#EF4444', background: '#FFF', cursor: 'pointer', fontSize: 12, fontFamily: 'Jost,sans-serif', fontWeight: 600, flexShrink: 0 }}>
                    {loading === p.id ? '...' : '✕ Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Not Featured — إضافة للـ Hero */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 22 }}>📦</span>
            <div>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, color: '#1A1A2E' }}>All Products</h3>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>اضغط + لإضافة منتج للـ Hero</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
            {notFeatured.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: '#F9FAFB', border: '1.5px solid #E5E7EB' }}>
                {/* Thumbnail */}
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {p.image
                    ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : p.emoji}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{formatNumber(p.price)} DZD · {p.category}</div>
                </div>
                {/* Add button */}
                <button onClick={() => toggle(p)} disabled={loading === p.id}
                  style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#2E5F8A', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {loading === p.id ? '·' : '+'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Preview note */}
      <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 13, color: '#1E40AF' }}>
        💡 التغييرات تظهر فوراً في الصفحة الرئيسية — لا تحتاج لإعادة تشغيل المشروع.
      </div>
    </div>
  )
}
