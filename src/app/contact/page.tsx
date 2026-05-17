'use client'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function ContactPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: 'Product Inquiry', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      showToast('✓ Message sent! We\'ll respond within 24 hours.')
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: 'Product Inquiry', message: '' })
    } else { showToast('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--beige-dark)', fontFamily: 'Jost,sans-serif', fontSize: 14, outline: 'none', background: '#fff' } as React.CSSProperties

  return (
    <div style={{ background: 'var(--beige)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 42, color: 'var(--text-dark)', marginBottom: 10 }}>Contact Us</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>We're here to help. Reach out and we'll respond within 24 hours.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 50 }}>
        {/* Info */}
        <div>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 28, marginBottom: 16 }}>Get In Touch</h2>
          <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 32 }}>
            Whether you have a question about our products, need help with your order, or want to learn more, our team is ready to assist.
          </p>
          {[
            { icon: '📍', label: 'Address', val: '123 Rue de la Beauté, El Oued, 39000, Algeria' },
            { icon: '📞', label: 'Phone', val: '+213 (0) 29 XX XX XX' },
            { icon: '💬', label: 'WhatsApp', val: '+213 (0) 5X XX XX XX' },
            { icon: '📧', label: 'Email', val: 'contact@Povapharm.dz' },
            { icon: '🕐', label: 'Working Hours', val: 'Saturday – Thursday: 9:00 AM – 8:00 PM' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: 'var(--text-dark)' }}>{item.val}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Follow Us</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['fab fa-facebook-f','#'],['fab fa-instagram','#'],['fab fa-tiktok','#'],['fab fa-whatsapp','https://wa.me/213000000000']].map(([icon, href]) => (
                <a key={icon} href={href} target="_blank" rel="noreferrer"
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontSize: 16, transition: 'var(--transition)' }}>
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 36, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, marginBottom: 24 }}>Send Us a Message</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>First Name</label>
                <input style={inp} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Your first name" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Last Name</label>
                <input style={inp} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Your last name" required />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" style={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input type="tel" style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+213..." />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Subject</label>
              <select style={{ ...inp, background: '#fff' }} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {['Product Inquiry','Order Status','Returns & Refunds','Wholesale Inquiry','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message</label>
              <textarea rows={5} style={{ ...inp, resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help you?" required />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 30, background: 'var(--blue)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
              {loading ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
