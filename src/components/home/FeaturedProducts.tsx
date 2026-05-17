import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'
import Link from 'next/link'

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section style={{ padding: '70px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>FEATURED</div>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,4vw,40px)', color: 'var(--text-dark)' }}>Best Sellers</h2>
          </div>
          <Link href="/products" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
            View All →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

export function FlashSale({ products }: { products: Product[] }) {
  return (
    <section style={{ padding: '70px 0', background: 'linear-gradient(135deg,#1A1A2E,#2E5F8A)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 10 }}>LIMITED TIME</div>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,4vw,40px)', color: '#fff', marginBottom: 16 }}>⚡ Flash Sale</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)' }}>Grab these deals before they&apos;re gone!</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/products?sale=1">
            <button style={{ padding: '14px 40px', borderRadius: 30, background: 'var(--green)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
              Shop All Offers →
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
