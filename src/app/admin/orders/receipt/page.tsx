'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCode } from '@/components/ui/QRCode'
import { formatNumber } from '@/lib/utils'

function BarcodeBar({ value }: { value: string }) {
  const bars: number[] = []
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    const pattern = code.toString(2).padStart(8, '0')
    pattern.split('').forEach(bit => bars.push(parseInt(bit)))
    bars.push(0)
  }
  const all = [1,1,0,1,0,0,0,1,0,0, ...bars, 1,1,0,0,0,1,0,1,1,0]
  const w = all.length * 2.2
  return (
    <svg width={w} height={70} style={{ display:'block', maxWidth:'100%' }}>
      {all.map((b,i) => b===1 ? <rect key={i} x={i*2.2} y={0} width={1.8} height={55} fill="#000"/> : null)}
      <text x={w/2} y={68} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#000">{value}</text>
    </svg>
  )
}

function ReceiptContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!orderId) return
    Promise.all([
      fetch(`/api/orders/${orderId}`).then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([o, s]) => { setOrder(o); setSettings(s) })
      .finally(() => setLoading(false))
  }, [orderId])

  async function handlePrint() { window.print() }

  async function handleDownload() {
    const { downloadReceiptAsPDF } = await import('@/lib/pdf')
    await downloadReceiptAsPDF('admin-receipt', `label-${order?.orderNumber}.pdf`)
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#9CA3AF'}}>Loading...</div>
  if (!order)  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#9CA3AF'}}>Order not found.</div>

  const storeName  = settings?.siteName  || 'Pova Pharm'
  const storePhone = settings?.phone     || ''
  const storeAddr  = settings?.address   || ''

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin:0; background:#fff; }
          #admin-receipt { box-shadow:none !important; margin:0 !important; border-radius:0 !important; }
          @page { size: 100mm 150mm; margin: 3mm; }
        }
        @media screen { body { background:#f3f4f6; } }
      `}</style>

      {/* Controls */}
      <div className="no-print" style={{background:'#1A1A2E',padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{color:'#fff',fontSize:15,fontFamily:'"Playfair Display",serif'}}>
          📦 Shipping Label — {order.orderNumber}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>window.history.back()}
            style={{padding:'8px 18px',borderRadius:20,border:'1.5px solid rgba(255,255,255,.3)',background:'none',color:'#fff',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13}}>
            ← Back
          </button>
          <button onClick={handleDownload}
            style={{padding:'8px 20px',borderRadius:20,background:'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600}}>
            📥 Download PDF
          </button>
          <button onClick={handlePrint}
            style={{padding:'8px 20px',borderRadius:20,background:'#4A7C59',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:700}}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Label */}
      <div style={{display:'flex',justifyContent:'center',padding:'32px 20px',minHeight:'calc(100vh - 56px)'}}>
        <div id="admin-receipt" ref={receiptRef} style={{
          width:378, background:'#fff', border:'2px solid #000',
          fontFamily:'Arial,sans-serif', fontSize:11, color:'#000',
          boxShadow:'0 8px 32px rgba(0,0,0,.15)', overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{background:'#1A1A2E',color:'#fff',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700,fontSize:16,letterSpacing:1}}>{storeName}</div>
              {storePhone && <div style={{fontSize:10,opacity:.7,marginTop:2}}>📞 {storePhone}</div>}
            </div>
            <div style={{fontSize:22}}>🌿</div>
          </div>

          {/* Order # + Barcode */}
          <div style={{padding:'12px 14px',borderBottom:'2px dashed #000',textAlign:'center'}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:'#666',marginBottom:4}}>ORDER NUMBER</div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:3,marginBottom:8}}>{order.orderNumber}</div>
            <div style={{display:'flex',justifyContent:'center',overflow:'hidden'}}>
              <BarcodeBar value={order.orderNumber} />
            </div>
          </div>

          {/* Recipient */}
          <div style={{padding:'10px 14px',borderBottom:'1.5px solid #000'}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:'#666',marginBottom:6,textTransform:'uppercase'}}>📦 Deliver To</div>
            <div style={{fontWeight:900,fontSize:18,marginBottom:4}}>{order.customerName}</div>
            <div style={{fontSize:13,fontWeight:700,color:'#2E5F8A',marginBottom:4}}>📞 {order.customerPhone}</div>
            {order.customerAddress && <div style={{fontSize:11,color:'#333',marginBottom:2}}>📍 {order.customerAddress}</div>}
            <div style={{fontWeight:900,fontSize:14,marginTop:4,background:'#f0f0f0',padding:'4px 8px',borderRadius:4,display:'inline-block'}}>
              🗺️ {order.customerWilaya?.toUpperCase()}
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{padding:'8px 14px',borderBottom:'1.5px solid #ddd',display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {[
              ['Delivery', order.deliveryType==='home'?'🏠 Home':order.deliveryType==='office'?'🏢 Office':'🏘️ Commune'],
              ['Company', '🚛 '+(order.deliveryCompany||'—')],
              ['Payment', order.paymentMethod==='cod'?'💵 Cash on Delivery':order.paymentMethod],
              ['Date', new Date(order.createdAt).toLocaleDateString('fr-DZ')],
            ].map(([l,v])=>(
              <div key={l} style={{padding:'6px 8px',background:'#f5f5f5',borderRadius:6}}>
                <div style={{fontSize:8,color:'#888',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>{l}</div>
                <div style={{fontSize:11,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div style={{padding:'8px 14px',borderBottom:'1.5px solid #ddd'}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:'#666',marginBottom:6,textTransform:'uppercase'}}>Items</div>
            {order.items?.map((item:any)=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4,padding:'3px 0',borderBottom:'1px solid #f5f5f5'}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700}}>{item.name}</div>
                  <div style={{fontSize:9,color:'#888'}}>Code: {item.code}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:'#666'}}>×{item.quantity}</div>
                  <div style={{fontSize:11,fontWeight:700}}>{formatNumber(item.price*item.quantity)} DZD</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{padding:'8px 14px',borderBottom:'2px solid #000'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#666',marginBottom:3}}>
              <span>Subtotal</span><span>{order.subtotal ? formatNumber(order.subtotal) + ' DZD' : '0 DZD'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#666',marginBottom:3}}>
              <span>Delivery</span><span>{order.delivery === 0 ? 'FREE' : formatNumber(order.delivery) + ' DZD'}</span>
            </div>
            {order.discount>0 && (
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#065F46',marginBottom:3}}>
                <span>Discount</span><span>-{order.discount ? formatNumber(order.discount) : '0'} DZD</span>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:900,marginTop:6,paddingTop:6,borderTop:'1.5px solid #000'}}>
              <span>TOTAL</span>
              <div style={{textAlign:'right'}}>
                <span style={{color:order.paymentMethod==='cod'?'#DC2626':'#065F46'}}>
                  {order.total ? formatNumber(order.total) + ' DZD' : '0 DZD'}
                </span>
                {order.paymentMethod==='cod' && (
                  <div style={{fontSize:9,fontWeight:400,color:'#DC2626'}}>← COLLECT ON DELIVERY</div>
                )}
              </div>
            </div>
          </div>

          {/* QR + Footer */}
          <div style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
            <div style={{fontSize:10,color:'#555',flex:1}}>
              <div style={{fontWeight:700,marginBottom:4}}>⚠️ Handle with Care — Cosmetics</div>
              {storeAddr && <div style={{fontSize:9,lineHeight:1.5}}>{storeAddr}</div>}
              <div style={{fontSize:9,marginTop:4,color:'#888'}}>Thank you! / شكراً 🌹</div>
            </div>
            <div style={{textAlign:'center',flexShrink:0}}>
              <QRCode value={`${storeName}|${order.orderNumber}|${order.customerName}|${order.customerWilaya}`} size={70} />
              <div style={{fontSize:8,color:'#888',marginTop:3}}>Scan to verify</div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{background:'#1A1A2E',padding:'6px 14px',display:'flex',justifyContent:'space-between'}}>
            <div style={{color:'rgba(255,255,255,.5)',fontSize:9}}>{storeName} © {new Date().getFullYear()}</div>
            <div style={{color:'rgba(255,255,255,.5)',fontSize:9}}>🔒 Secured Order</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>Loading...</div>}>
      <ReceiptContent />
    </Suspense>
  )
}

