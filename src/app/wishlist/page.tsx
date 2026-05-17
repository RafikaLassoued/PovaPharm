'use client'
import { useCart } from '@/store/cart'
import { useLang } from '@/store/lang'
import { useToast } from '@/components/ui/Toast'
import { ProductCard } from '@/components/products/ProductCard'
import Link from 'next/link'

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useCart()
  const { t, dir } = useLang()
  const { showToast } = useToast()

  function removeAll() {
    wishlist.forEach(p => toggleWishlist(p))
    showToast('Wishlist cleared.')
  }

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }} dir={dir}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,5vw,42px)', color: 'var(--text-dark)', marginBottom: 10 }}>
          {t('myWishlist')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>{t('home')}</Link> › {t('myWishlist')}
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🤍</div>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 12 }}>
              {t('emptyWishlist')}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-light)', marginBottom: 32 }}>
              Browse our products and save your favorites here
            </p>
            <Link href="/products">
              <button style={{ padding: '14px 36px', borderRadius: 30, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
                {t('products')}
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 15, color: 'var(--text-mid)' }}>
                <strong>{wishlist.length}</strong> item{wishlist.length !== 1 ? 's' : ''} saved
              </div>
              <button onClick={removeAll}
                style={{ padding: '8px 20px', borderRadius: 20, border: '1.5px solid #EF4444', color: '#EF4444', background: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13 }}>
                🗑️ Clear All
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
              {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
