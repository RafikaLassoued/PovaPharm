'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

export default function DeliveryInfoPage() {
  const [page, setPage] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/pages?slug=delivery-info').then(r=>r.json()).then(d => setPage(d?.slug ? d : null)).catch(()=>{})
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {})
    fetch('/api/delivery-companies').then(r => r.json()).then(setCompanies).catch(() => {})
  }, [])

  const freeMin = settings?.freeDeliveryMin || 10000

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚚</div>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,5vw,44px)', color: 'var(--text-dark)', marginBottom: 12 }}>
          {page?.title || 'Delivery Information'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto' }}>
          Everything you need to know about our delivery options across Algeria
        </p>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 14 }}>
          <Link href="/" style={{ color: 'var(--blue)' }}>Home</Link> › {page?.title || 'Delivery Info'}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>

        {/* Page Content */}
        {page?.content && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: page.content }}>
            </div>
          </div>
        )}

        {/* Free Delivery Banner */}
        <div style={{ background: 'linear-gradient(135deg,var(--green),var(--green-light))', borderRadius: 20, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, color: '#fff' }}>
          <span style={{ fontSize: 48 }}>🎁</span>
          <div>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              Free Delivery on Orders Over {formatNumber(freeMin)} DZD!
            </div>
            <div style={{ fontSize: 14, opacity: .9 }}>
              Shop more and enjoy free delivery anywhere in Algeria.
            </div>
          </div>
        </div>

        {/* Delivery Types */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 8 }}>
            Delivery Options
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 28 }}>
            We offer 3 types of delivery to suit your needs
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { icon: '🏠', type: 'Home Delivery', desc: 'We deliver directly to your home address at the time that suits you best.', color: '#EFF6FF', border: '#BFDBFE' },
              { icon: '🏢', type: 'Office / Bureau de Poste', desc: 'Pickup from the nearest post office or delivery company office in your wilaya.', color: '#F0FDF4', border: '#BBF7D0' },
              { icon: '🏘️', type: 'Commune Center', desc: 'Pickup from the delivery point in your commune — ideal for remote areas.', color: '#FEF3C7', border: '#FDE68A' },
            ].map(item => (
              <div key={item.type} style={{ padding: 24, borderRadius: 16, background: item.color, border: `1.5px solid ${item.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)', marginBottom: 8 }}>{item.type}</div>
                <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Companies */}
        {companies.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 8 }}>
              Our Delivery Partners
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24 }}>
              Choose your preferred delivery company at checkout
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {companies.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 14, background: 'var(--beige)', border: '1.5px solid var(--beige-dark)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 22 }}>
                    {c.logoUrl ? <img src={c.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🚛'}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-dark)' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Times */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 24 }}>
            Delivery Timeframes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { region: '🏙️ Major Cities (Alger, Oran, Constantine...)', time: '1 – 2 business days' },
              { region: '🌆 Medium Wilayas', time: '2 – 3 business days' },
              { region: '🌄 Remote Wilayas (South)', time: '3 – 5 business days' },
              { region: '🏘️ Communes & Villages', time: '3 – 6 business days' },
            ].map((row, i) => (
              <div key={row.region} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 3 ? '1px solid var(--beige-dark)' : 'none' }}>
                <span style={{ fontSize: 14, color: 'var(--text-mid)' }}>{row.region}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-pale)', padding: '4px 14px', borderRadius: 20 }}>{row.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 24 }}>
            Important Notes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📞', text: 'You will receive a call from the delivery agent before arrival.' },
              { icon: '📦', text: 'Orders are processed within 24 hours of placement (business days only).' },
              { icon: '💵', text: 'Cash on Delivery (COD) is available across all 58 wilayas.' },
              { icon: '🔍', text: 'You can track your order status from your order confirmation.' },
              { icon: '📅', text: 'Delivery times may be affected during public holidays and peak seasons.' },
              { icon: '📍', text: 'Please ensure your address and phone number are correct to avoid delays.' },
            ].map(note => (
              <div key={note.text} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: 'var(--beige)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{note.icon}</span>
                <span style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7 }}>{note.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontSize: 15, color: 'var(--text-mid)', marginBottom: 20 }}>Have a question about your delivery?</p>
          <Link href="/contact">
            <button style={{ padding: '14px 36px', borderRadius: 30, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
              Contact Us →
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
