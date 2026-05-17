'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Footer() {
  const [settings, setSettings] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])   // ← NEW

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {})
  }, [])

  // ← NEW: جلب الفئات
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => console.error('Failed to fetch categories'))
  }, [])

  const s = settings || {}

  return (
    <footer style={{ background: 'var(--text-dark)', color: 'rgba(255,255,255,.8)', marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {s.logoUrl
                ? <img src={s.logoUrl} alt="logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain' }} />
                : <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,var(--blue),var(--green))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}><i className="fas fa-leaf" /></div>
              }
              <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>{s.siteName || 'Pova Pharm'}</span>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, color: 'rgba(255,255,255,.6)' }}>
              Premium beauty products crafted with natural ingredients for radiant, healthy skin.
            </p>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[['fab fa-facebook-f', s.facebook || '#'], ['fab fa-instagram', s.instagram || '#'], ['fab fa-tiktok', s.tiktok || '#'], ['fab fa-whatsapp', s.whatsappLink || '#']].map(([icon, href]) => (
                <a key={icon} href={href} target="_blank" rel="noreferrer"
                  style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', fontSize: 15 }}>
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 20, fontSize: 16 }}>Shop</h4>

            {categories
              .filter(c => c.active)
              .map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.name}`}
                  style={{
                    display: 'block',
                    fontSize: 14,
                    marginBottom: 10,
                    color: 'rgba(255,255,255,.6)',
                  }}
                >
                  {cat.name}
                </Link>
              ))}

            {categories.filter(c => c.active).length > 0 && (
              <Link
                href="/products"
                style={{
                  display: 'block',
                  fontSize: 14,
                  marginTop: 10,
                  color: 'rgba(255,255,255,.9)',
                  fontWeight: 600,
                }}
              >
                All Products
              </Link>
            )}

            {categories.filter(c => c.active).length === 0 && (
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
                No categories yet.
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 20, fontSize: 16 }}>Information</h4>
            {[['About Us', '/about'], ['Contact Us', '/contact'], ['Delivery Info', '/delivery-info'], ['Returns Policy', '/returns-policy'], ['Terms of Use', '/terms'], ['Privacy Policy', '/privacy']].map(([label, href]) => (
              <Link key={label} href={href} style={{ display: 'block', fontSize: 14, marginBottom: 10, color: 'rgba(255,255,255,.6)' }}>{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 20, fontSize: 16 }}>Contact</h4>
            {[['📍', s.address], ['📞', s.phone], ['💬', s.whatsapp], ['📧', s.contactEmail], ['🕐', s.workingHours]]
              .filter(([, v]) => v)
              .map(([icon, val]) => (
                <div key={val} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,.6)', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span>{val}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.1)',
        marginTop: 40,
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        maxWidth: 1200,
        margin: '40px auto 0',
        fontSize: 13,
        color: 'rgba(255,255,255,.4)'
      }}>
        <span>© 2026 {s.siteName || 'Pova Pharm'}. All rights reserved. | Developed by Offitex code</span>
        <span>🔒 SSL Secured · Safe Shopping</span>
      </div>
    </footer>
  )
}
