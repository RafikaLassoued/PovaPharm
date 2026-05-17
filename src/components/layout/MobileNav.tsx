'use client'
import Link from 'next/link'
import { useLang } from '@/store/lang'

interface Props { open: boolean; onClose: () => void }

export function MobileNav({ open, onClose }: Props) {
  const { t } = useLang()
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:2000, display:'flex' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:280, background:'#fff', height:'100%', display:'flex', flexDirection:'column', overflow:'auto' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--beige-dark)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'"Playfair Display",serif', fontSize:20, fontWeight:700, color:'var(--blue)' }}>Pova Pharm</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--text-light)' }}>✕</button>
        </div>

        {/* Nav links */}
        <nav style={{ padding:'16px 0', flex:1 }}>
          {([
            ['/', t('home'), '🏠'],
            ['/products', t('products'), '📦'],
            ['/wishlist', t('wishlist'), '❤️'],
            ['/cart', t('cart'), '🛒'],
            ['/about', t('about'), 'ℹ️'],
            ['/contact', t('contact'), '📞'],
            ['/delivery-info', 'Delivery Info', '🚚'],
            ['/returns-policy', 'Returns Policy', '↩️'],
          ] as [string,string,string][]).map(([href, label, icon]) => (
            <Link key={href} href={href} onClick={onClose}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 24px', fontSize:15, fontWeight:500, color:'var(--text-dark)', borderBottom:'1px solid var(--beige)', transition:'var(--transition)' }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                {label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--beige-dark)', fontSize:12, color:'var(--text-light)', textAlign:'center' }}>
          © 2026 Pova Pharm
        </div>
      </div>
    </div>
  )
}

