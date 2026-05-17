'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import type { Product } from '@/types'

export function HeroSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)
  const [siteLiked, setSiteLiked] = useState(false)

  useEffect(() => {
    fetch('/api/products?featured=1').then(r=>r.json()).then(setProducts)
    fetch('/api/settings').then(r=>r.json()).then(setSettings)
    // تسجيل زيارة
    fetch('/api/stats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'visit'})}).catch(()=>{})
  }, [])

  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => { setCurrent(c=>(c+1)%products.length); setFade(true) }, 300)
    }, 3000)
    return () => clearInterval(timer)
  }, [products])

  function likeSite() {
    if (siteLiked) return
    setSiteLiked(true)
    fetch('/api/stats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'like'})}).catch(()=>{})
    if (settings) setSettings((s:any)=>({...s,totalLikes:(s.totalLikes||0)+1}))
  }

  const p = products[current]
  const stats = settings ? [
    [settings.statProducts||'500+', 'Products'],
    [settings.statClients||'10K+', 'Happy Clients'],
    [settings.statNatural||'100%', 'Natural'],
  ] : [['500+','Products'],['10K+','Happy Clients'],['100%','Natural']]

  return (
    <section style={{background:'linear-gradient(135deg,var(--beige) 0%,#E8F2EB 50%,var(--blue-pale) 100%)',padding:'80px 0',position:'relative',overflow:'hidden'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 20px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:60,alignItems:'center',position:'relative',zIndex:1}}>
        {/* Left */}
        <div>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20}}>
            <span style={{fontSize:13,fontWeight:600,color:'var(--green)',letterSpacing:1,textTransform:'uppercase'}}>🌿 Natural & Premium</span>
          </div>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(36px,5vw,58px)',lineHeight:1.15,marginBottom:20,color:'var(--text-dark)'}}>
            Beauty That <em style={{fontStyle:'italic',color:'var(--blue)'}}>Inspires</em>,<br/>Nature That Heals
          </h1>
          <p style={{fontSize:16,color:'var(--text-mid)',marginBottom:36,maxWidth:440,lineHeight:1.7}}>
            Discover our premium cosmetics collection crafted with the finest natural ingredients for radiant, healthy skin.
          </p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <Link href="/products">
              <button style={{padding:'14px 32px',borderRadius:30,background:'var(--blue)',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>Shop Now →</button>
            </Link>
            <Link href="/products?sale=1">
              <button style={{padding:'14px 32px',borderRadius:30,background:'transparent',color:'var(--blue)',border:'2px solid var(--blue)',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>View Offers</button>
            </Link>
          </div>
          {/* Real Stats */}
          <div style={{display:'flex',gap:32,marginTop:40,alignItems:'center'}}>
            {stats.map(([num,label])=>(
              <div key={label}>
                <div style={{fontFamily:'"Playfair Display",serif',fontSize:28,fontWeight:700,color:'var(--blue)'}}>{num}</div>
                <div style={{fontSize:12,color:'var(--text-light)',fontWeight:500,letterSpacing:'.5px'}}>{label}</div>
              </div>
            ))}
            {/* Like button */}
            
           { /*<button onClick={likeSite}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:20,border:`1.5px solid ${siteLiked?'#EF4444':'var(--beige-dark)'}`,background:siteLiked?'#FEE2E2':'#fff',cursor:siteLiked?'default':'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600,color:siteLiked?'#DC2626':'var(--text-mid)',transition:'all .2s'}}>
              {siteLiked?'❤️':'🤍'} {formatNumber(settings?.totalLikes || 0)}
            </button>*/}
            
          </div>
        </div>

        {/* Right - Floating Products */}
     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 380 }}>
  {!p ? (
    <div className="animate-float" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 240, height: 240, borderRadius: '50%', background: 'var(--beige-dark)', opacity: .3 }} />
    </div>
  ) : (
    <div className="animate-float" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: fade ? 1 : 0, transition: 'opacity .3s ease' }}>
      
      {/* 1. بداية الرابط - يغلف كل محتويات المنتج */}
      <Link 
        href={`/products/${p.id}`} 
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
      >
        {/* شارة Best Seller - أصبحت الآن داخل الرابط */}
        <div style={{ position: 'absolute', top: -16, right: -10, zIndex: 2, background: 'var(--green)', color: '#fff', padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 14px rgba(74,124,89,.35)' }}>
          ⭐ Best Seller
        </div>

        {/* حاوية الصورة أو الإيموجي */}
        <div style={{ width: '100%', maxWidth: 260, aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 24px 48px rgba(46,95,138,.22))' }}>
          {p.image
            ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : <span style={{ fontSize: 140 }}>{p.emoji}</span>}
        </div>

        {/* قسم النصوص */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 17, color: 'var(--text-dark)', fontWeight: 600, marginBottom: 8 }}>
            {p.name}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, fontWeight: 700, color: 'var(--blue)' }}>
              {p.price.toLocaleString("en-US")} DZD
            </span>
            
            {p.oldPrice && (
              <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: 15 }}>
                {p.oldPrice.toLocaleString("en-US")} DZD
              </span>
            )}
          </div>
        </div>
      </Link> {/* 2. إغلاق الرابط هنا ليشمل كل ما سبق */}

      {/* 3. النقاط (Dots) خارج الرابط تماماً */}
      {products.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center' }}>
          {products.map((_, i) => (
            <button 
              key={i} 
              onClick={(e) => {
                e.stopPropagation(); // منع تداخل الضغط مع الرابط
                setFade(false);
                setTimeout(() => {
                  setCurrent(i);
                  setFade(true);
                }, 300);
              }}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 20,
                background: i === current ? 'var(--blue)' : 'var(--beige-deep)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all .3s ease'
              }} 
            />
          ))}
        </div>
      )}
    </div>
  )}
        </div>
      </div>
    </section>
  )
}
