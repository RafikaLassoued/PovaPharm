'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { ProductCard } from '@/components/products/ProductCard'
import { formatNumber } from '@/lib/utils'
import type { Product } from '@/types'

interface Props { product: Product & { reviews: any[] }; related: Product[] }

export function ProductDetailClient({ product: p, related }: Props) {
  const [qty, setQty] = useState(1)
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('desc')
  const [wishlisted, setWishlisted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0

  useEffect(() => {
    setWishlisted(isWishlisted(p.id))
    setMounted(true)
  }, [p.id, isWishlisted])
  
  // Review form states
  const [reviews, setReviews] = useState(p.reviews || [])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  async function handleSubmitReview() {
    if (!reviewForm.name.trim()) { showToast('Please enter your name'); return }
    if (!reviewForm.comment.trim()) { showToast('Please enter a comment'); return }
    
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${p.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      const newReview = await res.json()
      setReviews([newReview, ...reviews])
      setReviewForm({ name: '', rating: 5, comment: '' })
      setShowReviewForm(false)
      showToast('✓ Review submitted successfully!')
    } catch (err) {
      showToast('❌ Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  function handleAdd() {
    if (p.stock === 0) return
    addItem(p, qty)
    showToast(`✓ ${qty} × ${p.name} added to cart!`)
  }

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>Home</Link> ›{' '}
          <Link href="/products" style={{ color: 'var(--blue)' }}>Products</Link> › {p.name}
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#f8f8f8', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 }}>
              {p.image
                ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 100 }}>{p.emoji}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)' }}>Additional Images</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{Math.min(p.images.length, 6)} / 6</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const img = p.images?.[i]
                return (
                  <div key={i} style={{ width: 72, height: 72, borderRadius: 8, background: '#f0f0f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {img ? (
                      <img src={img} alt={`additional-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span style={{ fontSize: 24, color: '#9CA3AF' }}>📸</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{p.category}</div>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 32, lineHeight: 1.2, marginBottom: 6 }}>{p.name}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 14 }}>Code: {p.code}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ color: '#F59E0B', fontSize: 18 }}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}</span>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>({p.reviewCount} reviews)</span>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.stock > 0 ? 'var(--green-pale)' : '#FEE2E2', color: p.stock > 0 ? 'var(--green)' : '#DC2626' }}>
                {p.stock > 0 ? `✓ In Stock (${p.stock})` : '✗ Out of Stock'}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              {p.oldPrice && <span style={{ fontSize: 18, color: 'var(--text-light)', textDecoration: 'line-through', marginRight: 10 }}>{formatNumber(p.oldPrice)} DZD</span>}
              <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 38, fontWeight: 700, color: 'var(--blue)' }}>{formatNumber(p.price)} DZD</span>
              {disc > 0 && <div style={{ display: 'inline-block', background: '#FEE2E2', color: '#DC2626', fontSize: 13, fontWeight: 600, padding: '3px 12px', borderRadius: 20, marginTop: 6, marginLeft: 10 }}>You save {disc}%</div>}
            </div>

            <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 24 }}>{p.description}</p>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--beige-dark)', borderRadius: 30, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--blue)' }}>−</button>
                <span style={{ width: 50, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(p.stock, q + 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--blue)' }}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
              <button onClick={handleAdd} disabled={p.stock === 0}
                style={{ flex: 1, padding: '14px 24px', borderRadius: 30, background: p.stock === 0 ? '#ccc' : 'var(--blue)', color: '#fff', border: 'none', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
                🛒 Add to Cart
              </button>
              <button onClick={() => { toggleWishlist(p); setWishlisted(!wishlisted); showToast(wishlisted ? 'Removed from wishlist.' : '❤️ Added to wishlist!') }}
                style={{ padding: '14px 20px', borderRadius: 30, background: 'transparent', color: 'var(--blue)', border: '2px solid var(--blue)', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
                {mounted ? (wishlisted ? '❤️ Wishlisted' : '♡ Wishlist') : '♡ Wishlist'}
              </button>
            </div>

            {/* Features */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['🌿', 'Natural Ingredients'], ['✅', 'Dermatologist Tested'], ['🚚', 'Free Delivery'], ['↩️', '14-day Returns']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-mid)' }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 60, borderTop: '1px solid var(--beige-dark)', paddingTop: 50 }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--beige-dark)', marginBottom: 30 }}>
            {[['desc', 'Description'], ['reviews', `Reviews (${p.reviews?.length || 0})`], ['shipping', 'Shipping']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: '14px 28px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 500, color: activeTab === key ? 'var(--blue)' : 'var(--text-light)', borderBottom: activeTab === key ? '2px solid var(--blue)' : 'none', marginBottom: -2 }}>
                {label}
              </button>
            ))}
          </div>
          {activeTab === 'desc' && (
            <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.9 }}>
              {p.description} Our products are dermatologist tested and approved for all skin types. Free from parabens, sulfates, and harmful chemicals.
            </p>
          )}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'start', marginBottom: 40 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 64, fontWeight: 700, color: 'var(--blue)', lineHeight: 1 }}>{p.rating}</div>
                  <div style={{ color: '#F59E0B', fontSize: 22 }}>{'★'.repeat(Math.floor(p.rating))}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{reviews.length} reviews</div>
                  <button onClick={() => setShowReviewForm(!showReviewForm)}
                    style={{ marginTop: 16, padding: '8px 16px', borderRadius: 20, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    + Add Review
                  </button>
                </div>
                <div>
                  {[5,4,3,2,1].map(star => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-mid)', width: 40 }}>{star} ★</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--beige-dark)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#F59E0B', borderRadius: 4, width: reviews.filter(r => r.rating === star).length > 0 ? `${(reviews.filter(r => r.rating === star).length / reviews.length * 100)}%` : '0%' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)', width: 30 }}>{reviews.filter(r => r.rating === star).length}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div style={{ background: 'var(--beige-pale)', padding: 24, borderRadius: 'var(--radius)', marginBottom: 30, border: '1px solid var(--beige-dark)' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Share Your Review</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Your Name *</label>
                    <input type="text" placeholder="John Doe" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--beige-dark)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Rating *</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewForm.rating ? '#F59E0B' : '#D1D5DB', transition: 'all 0.2s' }}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Your Review *</label>
                    <textarea placeholder="Share your experience with this product..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--beige-dark)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14, minHeight: 100, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleSubmitReview} disabled={submittingReview}
                      style={{ padding: '10px 20px', borderRadius: 6, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: submittingReview ? 0.6 : 1 }}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button onClick={() => setShowReviewForm(false)}
                      style={{ padding: '10px 20px', borderRadius: 6, background: '#f5f5f5', color: 'var(--text-dark)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', textAlign: 'center', paddingTop: 30 }}>No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {reviews.map((review, idx) => (
                      <div key={idx} style={{ paddingBottom: 20, borderBottom: idx < reviews.length - 1 ? '1px solid var(--beige-dark)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>{review.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                              {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ color: '#F59E0B', fontSize: 16 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.9 }}>
              <p>🚚 <strong>Standard Delivery:</strong> 500 DZD (2-5 business days)</p>
              <p>🎁 <strong>Free Delivery:</strong> On orders over 10,000 DZD</p>
              <p>📍 <strong>Delivery Areas:</strong> All 58 wilayas of Algeria</p>
              <p>↩️ <strong>Returns:</strong> 14-day return policy on unopened items</p>
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 28, marginBottom: 30 }}>You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
              {related.map(r => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
