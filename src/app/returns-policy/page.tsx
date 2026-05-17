'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ReturnsPolicyPage() {
  const [page, setPage] = useState<any>(null)

  useEffect(() => {
    fetch('/api/pages?slug=returns-policy').then(r=>r.json()).then(d => setPage(d?.slug ? d : null)).catch(()=>{})
  }, [])

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--green-pale))', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>↩️</div>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,5vw,44px)', color: 'var(--text-dark)', marginBottom: 12 }}>
          {page?.title || 'Returns Policy'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto' }}>
          We want you to be 100% satisfied with your purchase
        </p>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 14 }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>Home</Link> › {page?.title || 'Returns'}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>
        {page?.content ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: page.content }}>
            </div>
          </div>
        ) : (
          <>
            {/* 14 Days Banner */}
            <div style={{ background: 'linear-gradient(135deg,var(--blue),var(--blue-light))', borderRadius: 20, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, color: '#fff' }}>
              <span style={{ fontSize: 56, flexShrink: 0 }}>14</span>
              <div>
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                  14-Day Return Guarantee
                </div>
                <div style={{ fontSize: 14, opacity: .9 }}>
                  If you are not satisfied, return unopened products within 14 days for a full refund or exchange.
                </div>
              </div>
            </div>

            {/* What can be returned */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Can Return */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#065F46' }}>Can Be Returned</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Unopened products in original packaging',
                    'Items received damaged or defective',
                    'Wrong item delivered',
                    'Products within 14 days of delivery',
                    'Items with intact seals and labels',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-mid)' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cannot Return */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>❌</div>
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#DC2626' }}>Cannot Be Returned</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Opened or used cosmetic products',
                    'Products without original packaging',
                    'Items returned after 14 days',
                    'Products damaged by misuse',
                    'Customized or personalized items',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-mid)' }}>
                      <span style={{ color: '#DC2626', fontWeight: 700, flexShrink: 0 }}>✗</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
