'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { useLang } from '@/store/lang'
import { useSettings } from '@/context/SettingsContext'
import { LangSwitcher, DirApplier } from '@/components/ui/LangSwitcher'
import { MobileNav } from './MobileNav'

export function Header() {
  const { items, wishlist } = useCart()
  const { settings } = useSettings()
  const { t, dir } = useLang()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const cartCount = items.reduce((s, i) => s + i.qty, 0)
  const wishlistCount = wishlist.length

  function doSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) { router.push(`/products?search=${encodeURIComponent(search.trim())}`); setSearchOpen(false) }
  }

  return (
    <>
      <DirApplier />
      <style>{`
        @media (max-width: 768px) {
          .header-nav { display: none !important; }
          .header-search-desktop { display: none !important; }
          .header-search-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
          .header-search-mobile { display: none !important; }
        }
      `}</style>

      <header style={{ background:'#fff', position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 20px rgba(0,0,0,.07)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', maxWidth:1200, margin:'0 auto', gap:12 }}>
          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'"Playfair Display",serif', fontSize:22, fontWeight:700, color:'var(--blue)', whiteSpace:'nowrap', flexShrink:0 }}>
            <div style={{ width:38, height:38, background:'linear-gradient(135deg,var(--blue),var(--green))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:17, overflow:'hidden' }}>
              {settings?.logoUrl
                ? <img src={settings.logoUrl} alt={settings.siteName || 'Pova Pharm'} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                : <i className="fas fa-leaf" />
              }
            </div>
            <span className="header-nav" style={{ display:'block' }}>{settings?.siteName || 'Pova Pharm'}</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="header-nav" style={{ display:'flex', gap:24, alignItems:'center' }}>
            {([['/', t('home')], ['/products', t('products')], ['/about', t('about')], ['/contact', t('contact')]] as [string,string][]).map(([href, label]) => (
              <Link key={href} href={href} style={{ fontSize:14, fontWeight:500, color:'var(--text-mid)', whiteSpace:'nowrap' }}>{label}</Link>
            ))}
          </nav>

          {/* Search Desktop */}
          <form onSubmit={doSearch} className="header-search-desktop" style={{ display:'flex', alignItems:'center', background:'var(--beige)', border:'2px solid var(--beige-dark)', borderRadius:30, padding:'6px 14px', gap:8, flex:1, maxWidth:240 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:'none', background:'none', outline:'none', fontFamily:'Jost,sans-serif', fontSize:13, width:'100%', color:'var(--text-dark)' }}
              placeholder={t('search')} />
            <button type="submit" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', fontSize:15 }}>
              <i className="fas fa-search" />
            </button>
          </form>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {/* Search Mobile Toggle */}
            <button onClick={()=>setSearchOpen(!searchOpen)} className="header-search-mobile"
              style={{ width:38, height:38, borderRadius:'50%', display:'none', alignItems:'center', justifyContent:'center', background:'var(--beige)', border:'none', cursor:'pointer', fontSize:16, color:'var(--text-mid)' }}>
              <i className="fas fa-search" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist">
              <button style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--beige)', border:'none', cursor:'pointer', fontSize:17, color:'var(--text-mid)', position:'relative' }}>
                <i className="far fa-heart" />
                {wishlistCount > 0 && (
                  <span style={{ position:'absolute', top:-3, right:-3, background:'#EF4444', color:'#fff', width:16, height:16, borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <button style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--beige)', border:'none', cursor:'pointer', fontSize:17, color:'var(--text-mid)', position:'relative' }}>
                <i className="fas fa-shopping-bag" />
                {cartCount > 0 && (
                  <span style={{ position:'absolute', top:-3, right:-3, background:'var(--green)', color:'#fff', width:16, height:16, borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Lang Switcher */}
            <LangSwitcher />

            {/* Hamburger */}
            <button onClick={()=>setMobileOpen(true)} className="hamburger-btn"
              style={{ display:'flex', flexDirection:'column', gap:5, cursor:'pointer', padding:4, background:'none', border:'none' }}>
              <span style={{ display:'block', width:22, height:2, background:'var(--text-dark)', borderRadius:2 }} />
              <span style={{ display:'block', width:22, height:2, background:'var(--text-dark)', borderRadius:2 }} />
              <span style={{ display:'block', width:22, height:2, background:'var(--text-dark)', borderRadius:2 }} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div style={{ padding:'0 16px 12px', borderTop:'1px solid var(--beige-dark)' }}>
            <form onSubmit={doSearch} style={{ display:'flex', gap:8 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} autoFocus
                style={{ flex:1, padding:'10px 14px', borderRadius:20, border:'1.5px solid var(--beige-dark)', fontFamily:'Jost,sans-serif', fontSize:14, outline:'none' }}
                placeholder={t('search')} />
              <button type="submit" style={{ padding:'10px 20px', borderRadius:20, background:'var(--blue)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:13, fontWeight:600 }}>
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileNav open={mobileOpen} onClose={()=>setMobileOpen(false)} />
    </>
  )
}

