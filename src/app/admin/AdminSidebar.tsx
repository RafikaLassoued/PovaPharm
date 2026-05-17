'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'

interface Props { adminName: string; adminRole: string }

const NAV = [
  { id:'dashboard',           label:'Dashboard',          icon:'📊', href:'/admin' },
  { id:'profile',             label:'Profile',            icon:'👤', href:'/admin/profile' },
  { id:'products',            label:'Products',           icon:'📦', href:'/admin/products' },
  { id:'hero',                label:'Hero Slider',        icon:'🎠', href:'/admin/hero' },
  { id:'categories',          label:'Categories',         icon:'🗂️', href:'/admin/categories' },
  { id:'brands',              label:'Brands',             icon:'🏷️', href:'/admin/brands' },
  { id:'orders',              label:'Orders',             icon:'🛒', href:'/admin/orders' },
  { id:'reviews',             label:'Reviews',            icon:'⭐', href:'/admin/reviews' },
  //{ id:'customers',           label:'Customers',          icon:'👥', href:'/admin/customers' },
  { id:'messages',            label:'Messages',           icon:'💬', href:'/admin/messages' },
//{ id:'wilayas',             label:'Wilaya Prices',      icon:'📍', href:'/admin/wilayas' },
  { id:'delivery-companies',  label:'Delivery Companies', icon:'🚛', href:'/admin/delivery-companies' },
  { id:'offers',              label:'Promo Codes',        icon:'🎫', href:'/admin/offers' },
  //{ id:'pages',               label:'Pages',              icon:'📄', href:'/admin/pages' },
  { id:'trash',               label:'Trash',              icon:'🗑️', href:'/admin/trash' },
  { id:'analytics',           label:'Analytics',          icon:'📈', href:'/admin/analytics' },
  { id:'settings',            label:'Settings',           icon:'⚙️', href:'/admin/settings' },
]

export function AdminSidebar({ adminName, adminRole }: Props) {
  const pathname = usePathname()
  const { settings } = useSettings()
  const [trashCount, setTrashCount] = useState(0)
  const [msgCount, setMsgCount]     = useState(0)

  useEffect(() => {
    // عدد المنتجات المحذوفة
    fetch('/api/products?deleted=1')
      .then(r => r.json())
      .then(d => setTrashCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
    // عدد الرسائل غير المقروءة
    fetch('/api/contact')
      .then(r => r.json())
      .then(d => setMsgCount(Array.isArray(d) ? d.filter((m:any) => !m.read).length : 0))
      .catch(() => {})
  }, [pathname])

  async function logout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    window.location.href = '/'
  }

  const badges: Record<string, number> = {
    trash:    trashCount,
    messages: msgCount,
  }

  return (
    <aside className="admin-sidebar" style={{ width: 240, background: '#1A1A2E', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2E5F8A,#4A7C59)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, overflow: 'hidden' }}>
            {settings?.logoUrl
              ? <img src={settings.logoUrl} alt={settings.siteName || 'Pova Pharm'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : '🌿'
            }
          </div>
          <div>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 15, fontWeight: 700 }}>{settings?.siteName || 'Pova Pharm'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Admin info */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2E5F8A,#4A7C59)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 6 }}>👤</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{adminName}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'capitalize' }}>{adminRole}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          const badge    = badges[item.id] || 0
          return (
            <Link key={item.id} href={item.href}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 10, marginBottom: 2,
                background: isActive ? 'rgba(46,95,138,.5)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                cursor: 'pointer', transition: 'all .2s', fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #4A88C7' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </div>
                {badge > 0 && (
                  <span style={{ background: item.id === 'trash' ? '#DC2626' : '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, minWidth: 20, textAlign: 'center' }}>
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <Link href="/" target="_blank">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: 4 }}>
            <span>🌐</span> View Store
          </div>
        </Link>
        <button onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, fontFamily: 'Jost,sans-serif' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,.2)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.4)' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )
}

