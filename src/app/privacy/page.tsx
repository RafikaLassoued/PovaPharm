'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PrivacyPage() {
  const [page, setPage] = useState<any>(null)

  useEffect(() => {
    fetch('/api/pages?slug=privacy').then(r=>r.json()).then(d => setPage(d?.slug ? d : null)).catch(()=>{})
  }, [])

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 40, color: 'var(--text-dark)' }}>
          {page?.title || 'Privacy Policy'}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 10 }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>Home</Link> › {page?.title || 'Privacy'}
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 48, boxShadow: 'var(--shadow)' }}>
          {page?.content ? (
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: page.content }}>
            </div>
          ) : (
            <p style={{ fontSize: 15, color: 'var(--text-light)' }}>Loading...</p>
          )}
        </div>
      </div>
    </div>
  )
}
