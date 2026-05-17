'use client'
import { useRef } from 'react'
import { QRCode } from '@/components/ui/QRCode'
import { useLang } from '@/store/lang'
import { formatNumber } from '@/lib/utils'

interface Props {
  order: any
  storeName?: string
  onClose: () => void
}

function ReceiptBarcode({ value }: { value: string }) {
  const bars: number[] = []
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    const pattern = code.toString(2).padStart(8, '0')
    pattern.split('').forEach(bit => bars.push(parseInt(bit)))
    bars.push(0)
  }
  const all = [1,1,0,1,0,0,0,1,0,0,...bars,1,1,0,0,0,1,0,1,1,0]
  const w = all.length * 1.8
  return (
    <svg width={w} height={50} style={{ display:'block', maxWidth:'100%' }}>
      {all.map((b,i) => b===1 ? <rect key={i} x={i*1.8} y={0} width={1.5} height={40} fill="#000"/> : null)}
      <text x={w/2} y={48} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#000">{value}</text>
    </svg>
  )
}

export function CustomerReceipt({ order, storeName = 'Pova Pharm', onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  async function handleDownload() {
    const { downloadReceiptAsPDF } = await import('@/lib/pdf')
    await downloadReceiptAsPDF('customer-receipt', `receipt-${order.orderNumber}.pdf`)
  }

  function handlePrint() { window.print() }

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%',maxWidth:440,maxHeight:'90vh',overflowY:'auto',display:'flex',flexDirection:'column',gap:0 }}>
        {/* Buttons */}
        <div style={{ display:'flex',gap:10,marginBottom:12,justifyContent:'center' }}>
          <button onClick={handleDownload}
            style={{ padding:'10px 24px',borderRadius:30,background:'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600 }}>
            📥 {t('downloadReceipt')}
          </button>
          <button onClick={handlePrint}
            style={{ padding:'10px 20px',borderRadius:30,background:'#4A7C59',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600 }}>
            🖨️ {t('printReceipt')}
          </button>
          <button onClick={onClose}
            style={{ padding:'10px 16px',borderRadius:30,border:'1.5px solid rgba(255,255,255,.4)',background:'none',color:'#fff',cursor:'pointer',fontSize:18 }}>
            ✕
          </button>
        </div>

        {/* Receipt */}
        <div id="customer-receipt" ref={receiptRef} style={{
          background:'#fff', border:'1.5px solid #e0e0e0',
          fontFamily:'Arial,sans-serif', fontSize:12, color:'#000',
          borderRadius:4, overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#1A1A2E,#2E5F8A)', color:'#fff', padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontWeight:700, fontSize:20, letterSpacing:1, marginBottom:4 }}>{storeName}</div>
            <div style={{ fontSize:10, opacity:.7 }}>Purchase Receipt / وصل الشراء</div>
          </div>

          {/* Order + Date */}
          <div style={{ padding:'12px 16px', background:'#f9f9f9', borderBottom:'1px dashed #ccc', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'#888', fontWeight:700, letterSpacing:2, marginBottom:4 }}>ORDER NUMBER</div>
            <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, marginBottom:6 }}>{order.orderNumber}</div>
            <ReceiptBarcode value={order.orderNumber} />
          </div>

          {/* Customer Info */}
          <div style={{ padding:'10px 16px', borderBottom:'1px solid #eee' }}>
            <div style={{ fontSize:9, color:'#888', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Customer</div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{order.customerName}</div>
            <div style={{ fontSize:12, color:'#555', marginBottom:2 }}>📞 {order.customerPhone}</div>
            <div style={{ fontSize:11, color:'#555', marginBottom:2 }}>📍 {order.customerAddress}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#2E5F8A' }}>🗺️ {order.customerWilaya}</div>
          </div>

          {/* Delivery */}
          <div style={{ padding:'8px 16px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between' }}>
            <div style={{ fontSize:11 }}>
              <span style={{ color:'#888' }}>Delivery: </span>
              <span style={{ fontWeight:600 }}>
                {order.deliveryType==='home'?'🏠 Home':order.deliveryType==='office'?'🏢 Office':'🏘️ Commune'}
                {order.deliveryCompany ? ` · ${order.deliveryCompany}` : ''}
              </span>
            </div>
            <div style={{ fontSize:11, color:'#888' }}>{new Date(order.createdAt||Date.now()).toLocaleDateString()}</div>
          </div>

          {/* Items */}
          <div style={{ padding:'10px 16px', borderBottom:'1px solid #eee' }}>
            <div style={{ fontSize:9, color:'#888', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Items</div>
            {order.items?.map((item:any, i:number)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, paddingBottom:6, borderBottom:'1px dotted #f0f0f0' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{item.name}</div>
                  <div style={{ fontSize:9, color:'#999' }}>×{item.quantity} · {item.code}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, textAlign:'right' }}>
                  {formatNumber(item.price*item.quantity)} DZD
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ padding:'8px 16px', borderBottom:'2px solid #000' }}>
            {[
              ['Subtotal', order.subtotal ? formatNumber(order.subtotal) + ' DZD' : '0 DZD'],
              ['Delivery', order.delivery === 0 ? 'FREE' : formatNumber(order.delivery) + ' DZD'],
              ...(order.discount > 0 ? [['Discount', '-' + formatNumber(order.discount) + ' DZD']] : []),
            ].map(([l,v])=>(
              <div key={l} style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#555',marginBottom:3 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:900,marginTop:8,paddingTop:8,borderTop:'1.5px solid #000' }}>
              <span>TOTAL</span>
              <span style={{ color:'#2E5F8A' }}>{order.total ? formatNumber(order.total) : '0'} DZD</span>
            </div>
            <div style={{ fontSize:11,color:'#888',marginTop:4 }}>
              Payment: {order.paymentMethod==='cod'?'💵 Cash on Delivery':order.paymentMethod}
            </div>
          </div>

          {/* QR + Thank you */}
          <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#1A1A2E', marginBottom:4 }}>Thank you! 🌹</div>
              <div style={{ fontSize:10, color:'#888', lineHeight:1.6 }}>
                Keep this receipt for your records.<br/>
                For returns/support, contact us.
              </div>
            </div>
            <div style={{ textAlign:'center' }}>
              <QRCode value={`ORDER:${order.orderNumber}|TOTAL:${order.total}DZD`} size={70} />
              <div style={{ fontSize:8, color:'#888', marginTop:3 }}>Scan to verify</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background:'#1A1A2E', padding:'8px 16px', textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:9 }}>
              {storeName} · {new Date().getFullYear()} · 🔒 Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

