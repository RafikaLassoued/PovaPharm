'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AboutPage() {
  const [page, setPage] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [rating, setRating] = useState<any>(null)
  const [userRating, setUserRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/pages?slug=about').then(r=>r.json()).then(d => setPage(d?.slug ? d : null)).catch(()=>{})
    fetch('/api/settings').then(r=>r.json()).then(setSettings).catch(()=>{})
    fetch('/api/site-rating').then(r=>r.json()).then(setRating).catch(()=>{})
  }, [])

  async function submitRating() {
    if (!userRating) { setMsg('Please select a rating!'); return }
    const res = await fetch('/api/site-rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: userRating, comment }),
    })
    if (res.ok) {
      setSubmitted(true)
      setMsg('✓ Thank you for your rating!')
      fetch('/api/site-rating').then(r=>r.json()).then(setRating)
    }
  }

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(32px,5vw,48px)', color: 'var(--text-dark)', marginBottom: 16 }}>
          {page?.title || 'About Us'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto' }}>
          {settings?.siteName || 'Pova Pharm'} — Premium Beauty Store
        </p>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 10 }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>Home</Link> › About Us
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>

        {/* Content */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 48, boxShadow: 'var(--shadow)', marginBottom: 32 }}>
          {page?.content ? (
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.9 }} dangerouslySetInnerHTML={{ __html: page.content }}>
            </div>
          ) : (
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.9 }}>
              <p style={{ marginBottom: 20 }}>
                Welcome to <strong>{settings?.siteName || 'Pova Pharm'}</strong>, your trusted destination for premium beauty and personal care products in Algeria.
              </p>
              <p style={{ marginBottom: 20 }}>
                We are committed to bringing you the finest natural cosmetics, carefully selected and tested to meet the highest standards of quality and safety.
              </p>
              <p>
                Our mission is to make premium beauty accessible to everyone across Algeria, with fast delivery and exceptional customer service.
              </p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {settings && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)', marginBottom: 32 }}>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 24, marginBottom: 24 }}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
              {[
                ['📍', 'Address', settings.address],
                ['📞', 'Phone', settings.phone],
                ['💬', 'WhatsApp', settings.whatsapp],
                ['📧', 'Email', settings.contactEmail],
                ['🕐', 'Working Hours', settings.workingHours],
              ].map(([icon, label, val]) => val && (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dark)' }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Rating */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 24, marginBottom: 8 }}>Rate Our Website</h2>

          {rating && rating.count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px 20px', borderRadius: 12, background: 'var(--beige)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 48, fontWeight: 700, color: 'var(--blue)', lineHeight: 1 }}>{rating.average}</div>
                <div style={{ color: '#F59E0B', fontSize: 20 }}>{'★'.repeat(Math.round(rating.average))}{'☆'.repeat(5-Math.round(rating.average))}</div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>
                Based on <strong>{rating.count}</strong> ratings
              </div>
            </div>
          )}

          {submitted ? (
            <div style={{ padding: '20px', borderRadius: 12, background: '#D1FAE5', color: '#065F46', fontSize: 15, textAlign: 'center' }}>
              ✓ Thank you for your rating! We appreciate your feedback.
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 16 }}>How would you rate your experience with our website?</p>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setUserRating(star)}
                    style={{ fontSize: 40, background: 'none', border: 'none', cursor: 'pointer', color: star <= (hover || userRating) ? '#F59E0B' : '#E5E7EB', transition: 'all .15s' }}>
                    ★
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>
                  {['','😞 Poor','😐 Fair','🙂 Good','😊 Very Good','🤩 Excellent!'][userRating]}
                </div>
              )}
              <textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)}
                placeholder="Leave a comment (optional)..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--beige-dark)', fontFamily: 'Jost,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
              {msg && <div style={{ fontSize: 13, color: msg.startsWith('✓') ? '#065F46' : '#DC2626', marginBottom: 12 }}>{msg}</div>}
              <button onClick={submitRating}
                style={{ padding: '12px 32px', borderRadius: 30, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
                Submit Rating
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

