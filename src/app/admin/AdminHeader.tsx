'use client'
import Link from 'next/link'

interface Props { adminName: string; adminEmail: string }

export function AdminHeader({ adminName, adminEmail }: Props) {
  return (
    <header className="admin-header" style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ fontSize: 14, color: '#6B7280' }}>
        Welcome back, <strong style={{ color: '#1A1A2E' }}>{adminName}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" target="_blank">
          <button style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'Jost,sans-serif', color: '#4A4A6A', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌐 View Store
          </button>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2E5F8A,#4A7C59)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, color: '#1A1A2E' }}>{adminName}</div>
            <div style={{ color: '#8A8AAA' }}>{adminEmail}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
