'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/lib/utils'
type DeliveryType = 'home' | 'office' | 'commune'

const TYPE_LABELS: Record<DeliveryType, string> = {
  home:    '🏠 Home Delivery',
  office:  '🏢 Office / Bureau de Poste',
  commune: '🏘️ Commune Center',
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, subtotal, discount, promoCode, applyPromo } = useCart()
  const { showToast } = useToast()
  const router = useRouter()

  const [promoInput, setPromoInput]         = useState('')
  const [form, setForm]                     = useState({ name:'', phone:'', address:'', wilaya:'', deliveryType:'home' as DeliveryType, companyId:0, payment:'cod' })
  const [placing, setPlacing]               = useState(false)
  const [companies, setCompanies]           = useState<any[]>([])
  const [settings, setSettings]             = useState<any>(null)
  const [deliveryPrice, setDeliveryPrice]   = useState(500)
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  // قائمة الولايات الـ 58
  const WILAYAS = [
    'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
    'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
    'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','MSila','Mascara',
    'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf',
    'Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
    'Aïn Témouchent','Ghardaïa','Relizane',"El M'Ghair",'El Menia','Ouled Djellal',
    'Bordj Badji Mokhtar','Béni Abbès','Timimoun','Touggourt','Djanet','In Salah','In Guezzam',
  ]

  useEffect(() => {
    fetch('/api/delivery-companies').then(r=>r.json()).then(data => {
      setCompanies(data)
      if (data[0]) setForm(f => ({ ...f, companyId: data[0].id }))
    }).catch(()=>{})
    fetch('/api/settings').then(r=>r.json()).then(setSettings).catch(()=>{})
  }, [])

  // حساب سعر التوصيل عند تغيير الولاية أو النوع أو الشركة
  useEffect(() => {
    if (!form.wilaya || !form.companyId) return
    const company = companies.find(c => c.id === form.companyId)
    if (!company) return
    // البحث عن كود الولاية
    const wilayaIdx = WILAYAS.indexOf(form.wilaya) + 1
    const priceRow = company.prices?.find((p: any) => p.wilayaCode === wilayaIdx)
    if (priceRow) {
      const price = form.deliveryType === 'home' ? priceRow.homePrice
        : form.deliveryType === 'office' ? priceRow.officePrice
        : priceRow.communePrice
      setDeliveryPrice(price)
    } else {
      // افتراضي
      setDeliveryPrice(form.deliveryType === 'home' ? 500 : form.deliveryType === 'office' ? 400 : 600)
    }
  }, [form.wilaya, form.deliveryType, form.companyId, companies])

  const sub = subtotal()
  const freeMin = settings?.freeDeliveryMin || 10000
  const actualDelivery = sub >= freeMin ? 0 : deliveryPrice
  const total = Math.max(0, sub + actualDelivery - discount)

  const selectedCompany = companies.find(c => c.id === form.companyId)

  async function applyPromoCode() {
    const res = await fetch('/api/cart/promo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: promoInput, subtotal: sub }) })
    const data = await res.json()
    if (data.valid) { applyPromo(data.code, data.discountAmount); showToast(`✓ ${Math.round(data.discount*100)}% discount applied!`) }
    else showToast('❌ Invalid promo code.')
  }

  async function placeOrder() {
    if (!items.length) { showToast('Your cart is empty!'); return }
    if (!form.name || !form.phone || !form.address || !form.wilaya) { showToast('Please fill all delivery fields.'); return }
    if (!form.companyId) { showToast('Please select a delivery company.'); return }
    setPlacing(true)
    const res = await fetch('/api/orders', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.product.id, name: i.product.name, code: i.product.code, price: i.product.price, quantity: i.qty })),
        customerName: form.name, customerPhone: form.phone, customerAddress: form.address,
        customerWilaya: form.wilaya, deliveryType: form.deliveryType,
        deliveryCompany: selectedCompany?.name || '', paymentMethod: form.payment, promoCode,
      }),
    })
    if (res.ok) {
      const order = await res.json()
      setCompletedOrder({
        ...order,
        items: items.map(i => ({ name: i.product.name, code: i.product.code, price: i.product.price, quantity: i.qty })),
        customerName: form.name, customerPhone: form.phone, customerAddress: form.address,
        customerWilaya: form.wilaya, deliveryType: form.deliveryType,
        deliveryCompany: selectedCompany?.name || '',
        subtotal: sub, delivery: actualDelivery, discount, total, paymentMethod: form.payment,
      })
      clearCart()
      showToast('🎉 Order placed successfully!')
    } else { showToast('Something went wrong. Please try again.') }
    setPlacing(false)
  }

   async function printReceipt() {
  if (!completedOrder) return
  const o = completedOrder
  const receiptHtml = document.createElement('div')
  receiptHtml.innerHTML = `
    <h2 style="text-align:center;">Pova Pharm</h2>
    <p><strong>Order:</strong> ${o.orderNumber}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString('en-US')}</p>
    <p><strong>Customer:</strong> ${o.customerName}</p>
    <p><strong>Phone:</strong> ${o.customerPhone}</p>
    <p><strong>Wilaya:</strong> ${o.customerWilaya}</p>
    <p><strong>Address:</strong> ${o.customerAddress}</p>
    <p><strong>Delivery:</strong> ${o.deliveryCompany || ''} (${o.deliveryType})</p>
    <p><strong>Payment:</strong> ${o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod}</p>
    <hr/>
    <table style="width:100%; border-collapse: collapse;">
      ${o.items.map((item:any) => `<tr><td>${item.name} x${item.quantity}</td><td style="text-align:right;">${(item.price*item.quantity).toLocaleString('en-US')} DZD</td></tr>`).join('')}
    </table>
    <hr/>
    <p>Subtotal: ${o.subtotal.toLocaleString('en-US')} DZD</p>
    <p>Delivery: ${o.delivery === 0 ? 'FREE' : o.delivery.toLocaleString('en-US') + ' DZD'}</p>
    ${o.discount > 0 ? `<p>Discount: -${o.discount.toLocaleString('en-US')} DZD</p>` : ''}
    <p><strong>Total: ${o.total.toLocaleString('en-US')} DZD</strong></p>
    <hr/>
    <p style="text-align:center;">Thank you for shopping with us!<br/>شكراً لتسوقكم معنا</p>
  `
  const html2pdf = (await import('html2pdf.js')).default
  html2pdf()
    .set({ margin: 10, filename: `Receipt-${o.orderNumber}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' } })
    .from(receiptHtml)
    .save()
}
  // ── Completed Order Screen ──
  if (completedOrder) return (
    <div style={{background:'var(--beige)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:24,padding:48,maxWidth:500,width:'100%',textAlign:'center',boxShadow:'0 8px 40px rgba(0,0,0,.12)'}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,marginBottom:8}}>Order Placed!</h2>
        <p style={{fontSize:15,color:'var(--text-mid)',marginBottom:4}}>Order: <strong style={{color:'var(--blue)'}}>{completedOrder.orderNumber}</strong></p>
        <p style={{fontSize:14,color:'var(--text-light)',marginBottom:8}}>
          Delivery by <strong>{completedOrder.deliveryCompany}</strong> — {completedOrder.deliveryType}
        </p>
        <p style={{fontSize:14,color:'var(--text-light)',marginBottom:32}}>
          We'll contact you at <strong>{completedOrder.customerPhone}</strong>
        </p>
        <div style={{background:'var(--beige)',borderRadius:12,padding:20,marginBottom:28,textAlign:'left'}}>
          {completedOrder.items.map((item:any)=>(
            <div key={item.code} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,color:'var(--text-mid)'}}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price*item.quantity).toLocaleString('en-US')} DZD</span>
            </div>
          ))}
          <div style={{borderTop:'1px dashed var(--beige-dark)',paddingTop:10,marginTop:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--text-mid)',marginBottom:4}}>
              <span>Delivery ({completedOrder.deliveryCompany})</span>
              <span>{completedOrder.delivery===0?'FREE 🎉':completedOrder.delivery.toLocaleString('en-US')+' DZD'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16}}>
              <span>Total</span>
              <span style={{color:'var(--blue)',fontFamily:'"Playfair Display",serif'}}>{completedOrder.total.toLocaleString('en-US')} DZD</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={printReceipt} style={{padding:'12px 24px',borderRadius:30,background:'var(--green)',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>
            🖨️ Print Receipt
          </button>
          <Link href="/products">
            <button style={{padding:'12px 24px',borderRadius:30,background:'var(--blue)',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  )

  if (items.length === 0) return (
    <div style={{textAlign:'center',padding:'100px 20px'}}>
      <div style={{fontSize:64,marginBottom:20}}>🛒</div>
      <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,marginBottom:12}}>Your cart is empty</h2>
      <Link href="/products"><button style={{padding:'14px 32px',borderRadius:30,background:'var(--blue)',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:15,fontWeight:600}}>Shop Now</button></Link>
    </div>
  )

  const inp = {width:'100%',padding:'10px 14px',borderRadius:8,border:'1.5px solid var(--beige-dark)',fontFamily:'Jost,sans-serif',fontSize:14,outline:'none'} as React.CSSProperties

  return (
    <div style={{background:'var(--beige)',minHeight:'100vh'}}>
      <div style={{background:'linear-gradient(135deg,var(--beige),var(--blue-pale))',padding:'40px 20px',textAlign:'center'}}>
        <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:36,color:'var(--text-dark)'}}>Shopping Cart</h1>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'40px 20px',display:'grid',gridTemplateColumns:'1fr 400px',gap:30}}>
        {/* Items */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {items.map(item=>(
            <div key={item.product.id} style={{background:'#fff',borderRadius:'var(--radius)',padding:20,display:'grid',gridTemplateColumns:'80px 1fr auto',gap:20,alignItems:'center'}}>
              <div style={{width:80,height:80,borderRadius:12,background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,overflow:'hidden'}}>
                {item.product.image?<img src={item.product.image} alt={item.product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:item.product.emoji}
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{item.product.name}</div>
                <div style={{fontSize:12,color:'var(--text-light)',marginBottom:10}}>{item.product.code}</div>
                <div style={{display:'flex',alignItems:'center',border:'1.5px solid var(--beige-dark)',borderRadius:20,overflow:'hidden',width:'fit-content'}}>
                  <button onClick={()=>updateQty(item.product.id,item.qty-1)} style={{width:32,height:32,background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--blue)'}}>−</button>
                  <span style={{width:40,textAlign:'center',fontWeight:600,fontSize:14}}>{item.qty}</span>
                  <button onClick={()=>updateQty(item.product.id,item.qty+1)} style={{width:32,height:32,background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--blue)'}}>+</button>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'"Playfair Display",serif',fontSize:20,fontWeight:700,color:'var(--blue)',marginBottom:8}}>{(item.product.price*item.qty).toLocaleString('en-US')} DZD</div>
                <button onClick={()=>removeItem(item.product.id)} style={{background:'none',border:'none',color:'var(--text-light)',cursor:'pointer',fontSize:18}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Summary */}
          <div style={{background:'#fff',borderRadius:'var(--radius)',padding:24}}>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:20,marginBottom:20}}>Order Summary</h3>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:14,color:'var(--text-mid)'}}>
              <span>Subtotal</span><span>{sub.toLocaleString('en-US')} DZD</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:14,color:'var(--text-mid)'}}>
              <span>Delivery {form.wilaya && selectedCompany ? `(${selectedCompany.name})` : ''}</span>
              <span style={{color:actualDelivery===0?'var(--green)':'inherit'}}>{actualDelivery===0?'FREE 🎉':formatNumber(actualDelivery) + ' DZD'}</span>
            </div>
            {discount>0 && <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:14,color:'var(--green)'}}>
              <span>Discount</span><span>-{discount.toLocaleString('en-US')} DZD</span>
            </div>}
            <div style={{display:'flex',justifyContent:'space-between',borderTop:'2px solid var(--beige-dark)',paddingTop:14,marginTop:4,fontSize:18,fontWeight:700}}>
              <span>Total</span>
              <span style={{color:'var(--blue)',fontFamily:'"Playfair Display",serif',fontSize:22}}>{total.toLocaleString('en-US')} DZD</span>
            </div>
            {sub<freeMin && <p style={{fontSize:12,color:'var(--green)',marginTop:10}}>🎁 Add {(freeMin-sub).toLocaleString('en-US')} DZD more for FREE delivery!</p>}
            {/* Promo */}
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <input value={promoInput} onChange={e=>setPromoInput(e.target.value.toUpperCase())} placeholder="Promo code"
                style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1.5px solid var(--beige-dark)',fontFamily:'Jost,sans-serif',fontSize:14,outline:'none'}}/>
              <button onClick={applyPromoCode} style={{padding:'8px 16px',borderRadius:8,background:'var(--blue)',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600}}>Apply</button>
            </div>
          </div>

          {/* Delivery Form */}
          <div style={{background:'#fff',borderRadius:'var(--radius)',padding:24}}>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:18,marginBottom:20}}>Delivery Information</h3>

            {[['Full Name','name','text'],['Phone Number','phone','tel'],['Address (Street)','address','text']].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:6}}>{l}</label>
                <input type={t} style={inp} value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}

            {/* Wilaya */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:6}}>Wilaya</label>
              <select style={{...inp,background:'#fff'}} value={form.wilaya} onChange={e=>setForm(f=>({...f,wilaya:e.target.value}))}>
                <option value="">— Select Wilaya —</option>
                {WILAYAS.map(w=><option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Delivery Type */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:10}}>Delivery Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {(['home','office','commune'] as DeliveryType[]).map(t=>(
                  <label key={t} onClick={()=>setForm(f=>({...f,deliveryType:t}))}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 6px',borderRadius:10,border:`2px solid ${form.deliveryType===t?'var(--blue)':'var(--beige-dark)'}`,background:form.deliveryType===t?'var(--blue-pale)':'#fff',cursor:'pointer',textAlign:'center'}}>
                    <span style={{fontSize:20,marginBottom:4}}>{t==='home'?'🏠':t==='office'?'🏢':'🏘️'}</span>
                    <span style={{fontSize:11,fontWeight:600,color:form.deliveryType===t?'var(--blue)':'var(--text-mid)'}}>{t==='home'?'Home':t==='office'?'Office':'Commune'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Company */}
            {companies.length > 0 && (
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:10}}>Delivery Company</label>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {companies.map(c=>{
                    const wilayaIdx = WILAYAS.indexOf(form.wilaya)+1
                    const priceRow = form.wilaya ? c.prices?.find((p:any)=>p.wilayaCode===wilayaIdx) : null
                    const price = priceRow
                      ? form.deliveryType==='home' ? priceRow.homePrice : form.deliveryType==='office' ? priceRow.officePrice : priceRow.communePrice
                      : form.deliveryType==='home' ? 500 : form.deliveryType==='office' ? 400 : 600
                    const isFree = sub>=freeMin
                    return (
                      <label key={c.id} onClick={()=>setForm(f=>({...f,companyId:c.id}))}
                        style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:10,border:`2px solid ${form.companyId===c.id?'var(--blue)':'var(--beige-dark)'}`,background:form.companyId===c.id?'var(--blue-pale)':'#fff',cursor:'pointer'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:36,height:36,borderRadius:8,background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',fontSize:18,flexShrink:0}}>
                            {c.logoUrl?<img src={c.logoUrl} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:'🚛'}
                          </div>
                          <div>
                            <div style={{fontSize:14,fontWeight:600,color:'var(--text-dark)'}}>{c.name}</div>
                            {form.wilaya && <div style={{fontSize:11,color:'var(--text-light)',marginTop:2}}>{TYPE_LABELS[form.deliveryType]}</div>}
                          </div>
                        </div>
                        <span style={{fontSize:15,fontWeight:700,color:isFree?'var(--green)':'var(--blue)'}}>
                          {isFree?'FREE 🎉':price.toLocaleString('en-US')+' DZD'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Payment */}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:10}}>Payment Method</label>
              <label onClick={()=>setForm(f=>({...f,payment:'cod'}))}
                style={{display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,border:`2px solid ${form.payment==='cod'?'var(--blue)':'var(--beige-dark)'}`,background:form.payment==='cod'?'var(--blue-pale)':'#fff',cursor:'pointer',marginBottom:8}}>
                <span style={{fontSize:22}}>💵</span>
                <span style={{fontSize:14,fontWeight:500}}>Cash on Delivery</span>
              </label>
              <div style={{padding:'12px 14px',borderRadius:10,background:'#F9FAFB',border:'1.5px solid var(--beige-dark)',fontSize:13,color:'var(--text-light)'}}>
                💳 CCP / BaridiMob — Coming soon
              </div>
            </div>

            <button onClick={placeOrder} disabled={placing}
              style={{width:'100%',padding:'16px',borderRadius:30,background:'var(--blue)',color:'#fff',border:'none',cursor:placing?'wait':'pointer',fontFamily:'Jost,sans-serif',fontSize:15,fontWeight:600}}>
              {placing?'⏳ Placing Order...':'🔒 Place Order Securely'}
            </button>
            <p style={{textAlign:'center',fontSize:12,color:'var(--text-light)',marginTop:10}}>🔐 SSL Secured · Your data is protected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

