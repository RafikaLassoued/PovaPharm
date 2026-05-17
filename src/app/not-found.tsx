import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🌸</div>
      <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 48, color: 'var(--text-dark)', marginBottom: 12 }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--text-mid)', marginBottom: 8 }}>Page Not Found</p>
      <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 32, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <button style={{ padding: '14px 36px', borderRadius: 30, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 600 }}>
          Back to Home
        </button>
      </Link>
    </div>
  )
}
