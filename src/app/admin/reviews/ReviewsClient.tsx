'use client'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

interface Review {
  id: number
  productId: number
  name: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
  product: { id: number; name: string }
}

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const { showToast } = useToast()

  const filtered = reviews.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.product.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete')
      setReviews(reviews.filter(r => r.id !== id))
      showToast('✓ Review deleted')
    } catch (err) {
      showToast('❌ Failed to delete review')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '30px 20px' }}>
      <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 32, marginBottom: 30 }}>Product Reviews</h1>

      {/* Search */}
      <div style={{ marginBottom: 30 }}>
        <input type="text" placeholder="Search reviews by name, comment, or product..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 30 }}>
        <div style={{ background: '#f5f7fa', padding: 20, borderRadius: 8, border: '1px solid #e0e6ed' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Total Reviews</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)', marginTop: 8 }}>{reviews.length}</div>
        </div>
        <div style={{ background: '#f5f7fa', padding: 20, borderRadius: 8, border: '1px solid #e0e6ed' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Avg Rating</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B', marginTop: 8 }}>
            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)}
          </div>
        </div>
        <div style={{ background: '#f5f7fa', padding: 20, borderRadius: 8, border: '1px solid #e0e6ed' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>5-Star Reviews</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981', marginTop: 8 }}>
            {reviews.filter(r => r.rating === 5).length}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e6ed', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            No reviews found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f7fa', borderBottom: '1px solid #e0e6ed' }}>
                  <th style={{ padding: '14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>Customer</th>
                  <th style={{ padding: '14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>Product</th>
                  <th style={{ padding: '14px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#666' }}>Rating</th>
                  <th style={{ padding: '14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>Comment</th>
                  <th style={{ padding: '14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>Date</th>
                  <th style={{ padding: '14px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#666' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review, idx) => (
                  <tr key={review.id} style={{ borderBottom: '1px solid #e0e6ed', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '14px', fontSize: 14, fontWeight: 500 }}>{review.name}</td>
                    <td style={{ padding: '14px', fontSize: 14 }}>
                      <a href={`/products/${review.product.id}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                        {review.product.name}
                      </a>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', fontSize: 16, color: '#F59E0B' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </td>
                    <td style={{ padding: '14px', fontSize: 14, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.comment}
                    </td>
                    <td style={{ padding: '14px', fontSize: 13, color: '#999' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id}
                        style={{ padding: '6px 10px', borderRadius: 4, background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: deleting === review.id ? 0.5 : 1 }}>
                        {deleting === review.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
