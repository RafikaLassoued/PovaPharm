'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { formatNumber } from '@/lib/utils'
import type { Product } from '@/types'

export function ProductCard({ product: p }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const { showToast } = useToast()
  const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
  const [wishlisted, setWishlisted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setWishlisted(isWishlisted(p.id))
    setMounted(true)
  }, [p.id, isWishlisted])

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (p.stock === 0) return
    addItem(p)
    showToast('✓ Added to cart!')
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    toggleWishlist(p)
    setWishlisted(!wishlisted)
    showToast(wishlisted ? 'Removed from wishlist.' : '❤️ Added to wishlist!')
  }

  return (
    <Link href={`/products/${p.id}`}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'var(--transition)', cursor: 'pointer', position: 'relative' }}
        className="hover:-translate-y-1 hover:shadow-card-lg">

        {/* Image area */}
        <div style={{ position: 'relative', aspectRatio: '1/1', background: 'linear-gradient(135deg,var(--beige),var(--beige-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {disc > 0 && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: '#DC2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
              -{disc}%
            </div>
          )}
          {p.stock === 0 && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: '#6B7280', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
              Out of Stock
            </div>
          )}
          {p.image ? (
            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <span style={{ fontSize: 56 }}>{p.emoji}</span>
          )}
          <button onClick={handleWishlist}
            style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,.1)', opacity: 0, transition: 'var(--transition)' }}
            className="group-hover:opacity-100 wishlist-btn">
            {mounted ? (wishlisted ? '❤️' : '♡') : '♡'}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{p.category}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 10 }}>{p.code}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}</span>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>({p.reviewCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {p.oldPrice && <span style={{ fontSize: 13, color: 'var(--text-light)', textDecoration: 'line-through', display: 'block' }}>{formatNumber(p.oldPrice)} DZD</span>}
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{formatNumber(p.price)} DZD</div>
            </div>
            <button onClick={handleAdd} disabled={p.stock === 0}
              style={{ background: p.stock === 0 ? '#ccc' : 'var(--blue)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
              +
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
