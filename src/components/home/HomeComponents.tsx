'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────
interface Category {
  id: number
  name: string
  slug: string
  emoji: string
  image: string | null
  active: boolean
}
interface Brand {
  id: number
  name: string
  logoUrl: string | null
  active: boolean
}

// ═══════════════════════════════════════════════════════════
// ── Marquee Bar
// ═══════════════════════════════════════════════════════════
export function MarqueeBar() {
  const items = [
    '🌿 100% Natural Ingredients',
    '✨ Dermatologist Tested',
    '🚚 Free Delivery Over 10,000 DZD',
    '💚 Cruelty Free',
    '🌹 Premium Quality',
    '⭐ 10,000+ Happy Customers',
    '🔒 Secure Payment'
  ]

  const doubled = [...items, ...items]

  return (
    <div style={{ background: 'var(--blue)', padding: '12px 0', overflow: 'hidden' }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 40px;
          white-space: nowrap;
          animation: marquee 18s linear infinite;
          align-items: center;
        }
        .marquee-item {
          color: rgba(255,255,255,.8);
          font-size: 13px;
          font-weight: 500;
          flex: 0 0 auto;
        }
      `}</style>

      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── Categories Section (RESPONSIVE)
// ═══════════════════════════════════════════════════════════
export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const active = categories.filter(c => c.active)

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0)
    scrollLeft.current = trackRef.current?.scrollLeft || 0
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - (trackRef.current?.offsetLeft || 0)
    const walk = (x - startX.current) * 1.5
    if (trackRef.current)
      trackRef.current.scrollLeft = scrollLeft.current - walk
  }

  function onMouseUp() {
    isDragging.current = false
  }

  function scrollTo(dir: 'left' | 'right') {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' })
  }

  return (
    <section className="section" style={{ padding: '60px 0', overflow: 'hidden' }}>

      {/* GLOBAL CSS */}
      <style>{`
        .cat-track::-webkit-scrollbar { display: none; }
        .cat-track { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .cat-card {
          transition: .3s;
          flex: 0 0 auto;
          min-width: clamp(110px, 22vw, 145px);
          width: clamp(110px, 22vw, 145px);
        }
        .cat-card:hover {
          transform: translateY(-6px) scale(1.03);
        }
        .cat-card .cat-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 16px;
          background: #f8fafc;
          margin-bottom: 12px;
        }
        .cat-card .cat-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cat-card .cat-image .emoji {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        @media (max-width: 900px) {
          .cat-card {
            min-width: 120px;
            width: 34vw;
          }
        }

        @media (max-width: 768px) {
          .cat-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .cat-header a {
            align-self: flex-start;
          }

          .cat-track {
            gap: 10px;
            padding: 8px 0;
          }

          .cat-card {
            min-width: 110px;
            width: 40vw;
            padding: 10px;
          }

          .cat-card div {
            font-size: 11px;
          }

          .hide-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* HEADER */}
        <div className="cat-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 30
        }}>
          <div>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              color: 'var(--green)',
              textTransform: 'uppercase'
            }}>
              SHOP BY CATEGORY
            </div>

            <h2 style={{
              fontSize: 'clamp(22px,4vw,36px)',
              fontFamily: '"Playfair Display", serif'
            }}>
              Find Your Perfect Match
            </h2>
          </div>

          <Link href="/products" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        {/* SLIDER */}
        <div style={{ position: 'relative' }}>

          {/* LEFT */}
          <button
            className="hide-mobile"
            onClick={() => scrollTo('left')}
            style={arrowStyle('left')}
          >
            ‹
          </button>

          {/* TRACK */}
          <div
            ref={trackRef}
            className="cat-track"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              cursor: 'grab',
              padding: '10px 0'
            }}
          >
            {active.map((cat, i) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <div
                  className="cat-card"
                  onClick={() => setActiveIdx(i)}
                  style={{
                    minWidth: 'clamp(95px, 26vw, 130px)',
                    background: '#fff',
                    borderRadius: 14,
                    padding: 12,
                    textAlign: 'center',
                    border: activeIdx === i ? '2px solid var(--blue)' : '2px solid transparent'
                  }}
                >

                  {/* IMAGE */}
                  <div className="cat-image">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                      />
                    ) : (
                      <div className="emoji" style={{ background: 'var(--blue-pale)' }}>
                        {cat.emoji}
                      </div>
                    )}
                  </div>

                  {/* NAME */}
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {cat.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* RIGHT */}
          <button
            className="hide-mobile"
            onClick={() => scrollTo('right')}
            style={arrowStyle('right')}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// ── TRUST BADGES
// ═══════════════════════════════════════════════════════════
export function TrustBadges() {
  const badges = [
    { icon: '🚚', title: 'Free Delivery', desc: 'Over 10,000 DZD' },
    { icon: '🔒', title: 'Secure Payment', desc: 'SSL Protected' },
    { icon: '↩️', title: 'Easy Returns', desc: '14 days policy' },
    { icon: '🌿', title: 'Natural', desc: 'No chemicals' }
  ]

  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: 16,
        maxWidth: 1200,
        margin: 'auto',
        padding: '0 16px'
      }}>
        {badges.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <div>{b.icon}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{b.title}</div>
              <div style={{ fontSize: 12 }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// ── BRANDS (RESPONSIVE)
// ═══════════════════════════════════════════════════════════
export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([])
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const active = brands.filter(b => b.active)

  return (
    <section style={{ padding: '50px 0' }}>
      <div style={{ maxWidth: 1200, margin: 'auto', padding: '0 16px' }}>

        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
          Trusted Brands
        </h2>

        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            padding: '10px 0'
          }}
        >
          {active.map(b => (
            <div
              key={b.id}
              style={{
                flex: '0 0 auto',
                minWidth: 110,
                maxWidth: 160,
                height: 70,
                background: '#fff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'start',
                padding: 10,
                boxSizing: 'border-box'
              }}
            >
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
                  {b.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: -10,
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer'
  }
}