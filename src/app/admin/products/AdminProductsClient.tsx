'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { uploadImage } from '@/lib/supabase'
import { formatNumber, generateUniqueProductCode } from '@/lib/utils'
import type { Product } from '@/types'

//const CATS = ['Skincare','Makeup','Serums','Fragrance','Haircare','Suncare']
const createEmptyForm = () => ({
  name:'', code:generateUniqueProductCode(), category:'none', brand:'none',
  price:'', oldPrice:'', stock:'', emoji:'✨',
  image:'', images:[] as string[],
  description:'', shortDesc:'',
  sale:false, featured:false
})

// ═══════════════════════════════════════════════════════════
// ── Single Image Upload ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function SingleImageUpload({
  label, value, onChange, bucket='products', fallback='🖼️', required=false
}: {
  label:string; value:string; onChange:(url:string)=>void
  bucket?:'products'|'categories'|'brands'|'logos'
  fallback?:string; required?:boolean
}) {
  const fileRef            = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]  = useState('')
  const [drag, setDrag]    = useState(false)

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5*1024*1024) { setError('Max file size is 5MB.'); return }
    setError(''); setUploading(true)
    try {
      const url = await uploadImage(file, bucket)
      onChange(url)
    } catch(ex:any) { setError(ex.message || 'Upload failed') }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value='' }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if(f) processFile(f)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]; if(f) processFile(f)
  }

  return (
    <div>
      <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:8,color:'#374151'}}>
        {label} {required && <span style={{color:'#EF4444'}}>*</span>}
      </label>

      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        {/* Preview square */}
        <div style={{
          width:90, height:90, borderRadius:12, flexShrink:0,
          border:`2px solid ${value?'#2E5F8A':'#E5E7EB'}`,
          background:'#F9FAFB', overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative', fontSize:36,
        }}>
          {value
            ? <>
                <img src={value} alt="preview"
                  style={{width:'100%',height:'100%',objectFit:'cover'}}
                  onError={()=>onChange('')}/>
                <button type="button" onClick={()=>onChange('')}
                  style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',
                    background:'rgba(0,0,0,.55)',color:'#fff',border:'none',cursor:'pointer',
                    fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  ✕
                </button>
              </>
            : <span>{fallback}</span>
          }
        </div>

        {/* Upload area */}
        <div style={{flex:1}}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileInput}/>

          {/* Drop zone */}
          <div
            onClick={()=>!uploading && fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)}
            onDrop={onDrop}
            style={{
              border:`2px dashed ${drag?'#2E5F8A':uploading?'#9CA3AF':'#CBD5E1'}`,
              borderRadius:10, padding:'14px 12px',
              background:drag?'#EFF6FF':uploading?'#F9FAFB':'#FAFAFA',
              cursor:uploading?'wait':'pointer',
              textAlign:'center', transition:'all .15s', marginBottom:8,
            }}>
            {uploading ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:13,color:'#6B7280'}}>
                <span style={{display:'inline-block',width:14,height:14,border:'2px solid rgba(46,95,138,.3)',borderTopColor:'#2E5F8A',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                Uploading...
              </div>
            ) : (
              <>
                <div style={{fontSize:22,marginBottom:4}}>📤</div>
                <div style={{fontSize:12,fontWeight:600,color:'#374151'}}>
                  {drag ? 'Drop here!' : 'Click or drag image here'}
                </div>
                <div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>PNG, JPG, WebP · Max 5MB</div>
              </>
            )}
          </div>

          {/* Manual URL input */}
          <input
            style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1.5px solid #E5E7EB',
              fontFamily:'Jost,sans-serif',fontSize:11,outline:'none'}}
            placeholder="Or paste image URL..."
            value={value}
            onChange={e=>onChange(e.target.value)}
          />
        </div>
      </div>

      {error && <p style={{fontSize:11,color:'#DC2626',marginTop:6}}>❌ {error}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── Multiple Images Upload ──────────────────────────────
// ═══════════════════════════════════════════════════════════
function MultiImagesUpload({
  images, onChange
}: { images:string[]; onChange:(imgs:string[])=>void }) {
  const fileRef            = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]  = useState('')
  const [drag, setDrag]    = useState(false)

  async function processFiles(files: File[]) {
    if (!files.length) return
    setError(''); setUploading(true); setProgress(0)
    const results: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5*1024*1024) { setError(`${file.name} exceeds 5MB`); continue }
      try {
        const url = await uploadImage(file, 'products')
        results.push(url)
        setProgress(Math.round(((i+1)/files.length)*100))
      } catch(ex:any) { setError(ex.message) }
    }
    onChange([...images, ...results])
    setUploading(false); setProgress(0)
    if(fileRef.current) fileRef.current.value=''
  }

  function onFilesInput(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(Array.from(e.target.files||[]))
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function moveLeft(i: number) {
    if(i===0) return
    const a=[...images]; [a[i-1],a[i]]=[a[i],a[i-1]]; onChange(a)
  }
  function moveRight(i: number) {
    if(i===images.length-1) return
    const a=[...images]; [a[i],a[i+1]]=[a[i+1],a[i]]; onChange(a)
  }
  function remove(i: number) { onChange(images.filter((_,j)=>j!==i)) }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>
          Additional Images
          <span style={{marginLeft:6,background:'#EFF6FF',color:'#2E5F8A',fontSize:10,
            fontWeight:700,padding:'1px 7px',borderRadius:10}}>
            {images.length}
          </span>
        </label>
        {images.length>0 &&
          <button type="button" onClick={()=>onChange([])}
            style={{fontSize:11,color:'#EF4444',background:'none',border:'none',cursor:'pointer'}}>
            Clear all
          </button>
        }
      </div>

      {/* Images grid */}
      {images.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8,marginBottom:10}}>
          {images.map((img,i)=>(
            <div key={i} style={{position:'relative',borderRadius:10,overflow:'hidden',border:'1.5px solid #E5E7EB',aspectRatio:'1/1',background:'#f0f0f0'}}>
              <img src={img} alt={`img-${i}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              {/* Overlay controls */}
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.0)',transition:'background .2s',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:4}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,.45)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,.0)'}>
                {/* Top: remove */}
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <button type="button" onClick={()=>remove(i)}
                    style={{width:18,height:18,borderRadius:'50%',background:'rgba(220,38,38,.85)',color:'#fff',border:'none',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    ✕
                  </button>
                </div>
                {/* Bottom: reorder */}
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <button type="button" onClick={()=>moveLeft(i)} disabled={i===0}
                    style={{width:20,height:20,borderRadius:5,background:'rgba(255,255,255,.8)',border:'none',cursor:i===0?'default':'pointer',fontSize:11,opacity:i===0?.3:1}}>
                    ←
                  </button>
                  <span style={{fontSize:9,color:'rgba(255,255,255,.8)',alignSelf:'center'}}>{i+1}</span>
                  <button type="button" onClick={()=>moveRight(i)} disabled={i===images.length-1}
                    style={{width:20,height:20,borderRadius:5,background:'rgba(255,255,255,.8)',border:'none',cursor:i===images.length-1?'default':'pointer',fontSize:11,opacity:i===images.length-1?.3:1}}>
                    →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={onFilesInput}/>
      <div
        onClick={()=>!uploading && fileRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={onDrop}
        style={{
          border:`2px dashed ${drag?'#2E5F8A':uploading?'#9CA3AF':'#CBD5E1'}`,
          borderRadius:10, padding:'12px',
          background:drag?'#EFF6FF':uploading?'#F9FAFB':'#FAFAFA',
          cursor:uploading?'wait':'pointer',
          textAlign:'center', transition:'all .15s',
        }}>
        {uploading ? (
          <div>
            <div style={{fontSize:12,color:'#6B7280',marginBottom:6}}>Uploading... {progress}%</div>
            <div style={{height:4,background:'#E5E7EB',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',background:'#2E5F8A',borderRadius:4,width:`${progress}%`,transition:'width .3s'}}/>
            </div>
          </div>
        ) : (
          <>
            <div style={{fontSize:18,marginBottom:2}}>📸</div>
            <div style={{fontSize:12,fontWeight:600,color:'#374151'}}>
              {drag?'Drop images here!':'Click or drag to add multiple images'}
            </div>
            <div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>Select multiple files at once · PNG, JPG, WebP</div>
          </>
        )}
      </div>

      {error && <p style={{fontSize:11,color:'#DC2626',marginTop:6}}>❌ {error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── Main Admin Products Component ──────────────────────
// ═══════════════════════════════════════════════════════════
export function AdminProductsClient({ products: initial }: { products: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<any>(createEmptyForm())
  const [editing, setEditing]   = useState<number|null>(null)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [brands, setBrands]     = useState<any[]>([])

  const [categoryList, setCategoryList] = useState<any[]>([])
  
  // ── جلب الفئات من API عند التحميل ──
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategoryList(data)
      } catch (err) {
        console.error('Error fetching categories', err)
      }
    }
    fetchCategories()
  }, [])
  useEffect(() => {
    fetch('/api/brands').then(r=>r.json()).then(d=>setBrands(Array.isArray(d)?d:[])).catch(()=>{})
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  function setF(key: string, val: any) { setForm((f:any)=>({...f,[key]:val})) }

  function openEdit(p: Product) {
    setForm({
      name:p.name, code:p.code, category:p.category, brand:p.brand,
      price:String(p.price), oldPrice:String(p.oldPrice||''), stock:String(p.stock),
      emoji:p.emoji, image:p.image||'', images:(p as any).images||[],
      description:p.description, shortDesc:(p as any).shortDesc||'',
      sale:p.sale, featured:p.featured,
    })
    setEditing(p.id); setShowForm(true); setMsg('')
    setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),50)
  }

  function resetForm() { setForm(createEmptyForm()); setEditing(null); setShowForm(false); setMsg('') }

  async function handleSave() {
    if(!form.name||!form.price||!form.stock) {
      setMsg('❌ Please fill Name, Price and Stock.'); return
    }
    setSaving(true)
    const body = {
      ...form,
      code: form.code?.trim() || generateUniqueProductCode(),
      price: parseInt(form.price) || 0,
      oldPrice: form.oldPrice ? parseInt(form.oldPrice) : null,
      stock: parseInt(form.stock) || 0,
    }
    const res = editing
      ? await fetch(`/api/products/${editing}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      : await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    if(res.ok) {
      setMsg(editing?'✓ Product updated!':'✓ Product added!')
      router.refresh()
      setTimeout(resetForm,1200)
    } else {
      const err = await res.json().catch(()=>({}))
      setMsg('❌ '+(err.error||'Error saving product.'))
    }
    setSaving(false)
  }

  async function handleDelete(id:number,name:string) {
    if(!confirm(`Move "${name}" to trash?`)) return
    const res = await fetch(`/api/products/${id}`,{method:'DELETE'})
    if(res.ok) {
      setProducts(p=>p.filter(x=>x.id!==id))
      setMsg('🗑️ Product moved to trash.')
      setTimeout(()=>setMsg(''),3000)
    }
  }

  const inp = {width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',fontFamily:'Jost,sans-serif',fontSize:13,outline:'none',background:'#fff'} as React.CSSProperties

  return (
    <div>
      {/* ── Header ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:26,color:'#1A1A2E'}}>Products</h1>
          <p style={{fontSize:13,color:'#6B7280',marginTop:4}}>{products.length} total products</p>
        </div>
        <button onClick={()=>{resetForm();setShowForm(true)}}
          style={{padding:'10px 22px',borderRadius:20,background:'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>
          + Add Product
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div style={{background:'#fff',borderRadius:16,padding:28,marginBottom:24,boxShadow:'0 2px 12px rgba(0,0,0,.08)',border:'2px solid #2E5F8A'}}>
          {/* Form header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:20,color:'#1A1A2E'}}>
              {editing?'✏️ Edit Product':'➕ Add New Product'}
            </h3>
            <button onClick={resetForm} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9CA3AF'}}>✕</button>
          </div>

          {msg && (
            <div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,
              background:msg.startsWith('✓')?'#D1FAE5':'#FEE2E2',
              color:msg.startsWith('✓')?'#065F46':'#DC2626'}}>
              {msg}
            </div>
          )}

          {/* Two column layout */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32}}>

            {/* ── LEFT: Info ── */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>

              <div>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Product Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} value={form.name} onChange={e=>setF('name',e.target.value)} placeholder="e.g. Rose Glow Serum"/>
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Code <span style={{color:'#EF4444'}}>*</span> <span style={{color:'#9CA3AF',fontWeight:400,fontSize:11}}>(unique identifier)</span></label>
                <input style={inp} value={form.code} onChange={e=>setF('code',e.target.value.toUpperCase())} placeholder="e.g. AIC-001"/>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Category</label>
                  
                   <select style={inp} value={form.category} onChange={e => setForm((f:any) => ({ ...f, category: e.target.value }))}>
                      <option value="">— Select Category —</option>
                       {categoryList.map(cat => (
                      <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                       ))}
                       
                      <option value="__custom__">+ Type manually...</option>
                   </select>
                
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Brand</label>
                  <select style={inp} value={form.brand} onChange={e=>setF('brand',e.target.value==='__custom__'?'':e.target.value)}>
                    <option value="">— Select Brand —</option>
                    {brands.filter(b=>b.active!==false).map(b=>(
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="__custom__">+ Type manually...</option>
                  </select>
                  {(!form.brand || !brands.find((b:any)=>b.name===form.brand)) && (
                    <input style={{...inp,marginTop:6,fontSize:12}} placeholder="Type brand name..."
                      value={form.brand==='__custom__'?'':form.brand}
                      onChange={e=>setF('brand',e.target.value)}/>
                  )}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                {[['Price (DZD)','price'],['Old Price','oldPrice'],['Stock','stock']].map(([l,k])=>(
                  <div key={k}>
                    <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>{l}</label>
                    <input type="number" style={inp} value={form[k]} onChange={e=>setF(k,e.target.value)}/>
                  </div>
                ))}
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Emoji <span style={{color:'#9CA3AF',fontWeight:400}}>(shown if no image)</span></label>
                <input style={{...inp,width:70,fontSize:24,textAlign:'center',padding:'6px'}} value={form.emoji} onChange={e=>setF('emoji',e.target.value)}/>
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Short Description</label>
                <input style={inp} value={form.shortDesc} onChange={e=>setF('shortDesc',e.target.value)} placeholder="One-line tagline..."/>
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6,color:'#374151'}}>Full Description</label>
                <textarea rows={4} style={{...inp,resize:'vertical'}} value={form.description} onChange={e=>setF('description',e.target.value)}/>
              </div>

              <div style={{display:'flex',gap:24}}>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',userSelect:'none'}}>
                  <input type="checkbox" checked={form.sale} onChange={e=>setF('sale',e.target.checked)}/> 🏷️ On Sale
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',userSelect:'none'}}>
                  <input type="checkbox" checked={form.featured} onChange={e=>setF('featured',e.target.checked)}/> ⭐ Featured
                </label>
              </div>
            </div>

            {/* ── RIGHT: Images ── */}
            <div>
              <div style={{background:'#F9FAFB',borderRadius:14,padding:20,border:'1.5px solid #E5E7EB'}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1A1A2E',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  🖼️ Product Images
                </div>

                {/* Main image */}
                <SingleImageUpload
                  label="Main Image"
                  value={form.image}
                  onChange={url=>setF('image',url)}
                  bucket="products"
                  fallback={form.emoji||'📦'}
                  required
                />

                <div style={{borderTop:'1px solid #E5E7EB',margin:'16px 0'}}/>

                {/* Additional images */}
                <MultiImagesUpload
                  images={form.images}
                  onChange={imgs=>setF('images',imgs)}
                />
              </div>

              {/* Live preview */}
              {(form.image || form.name) && (
                <div style={{marginTop:12,background:'#fff',borderRadius:14,padding:16,border:'1.5px solid #E5E7EB'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>
                    Live Preview
                  </div>
                  <div style={{display:'flex',gap:12,alignItems:'center'}}>
                    <div style={{width:56,height:56,borderRadius:10,background:'#f0f0f0',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
                      {form.image?<img src={form.image} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:form.emoji}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:'#1A1A2E'}}>{form.name||'Product Name'}</div>
                      <div style={{fontSize:11,color:'#6B7280',marginTop:2}}>{form.category} · {form.brand}</div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                        <span style={{fontFamily:'"Playfair Display",serif',fontSize:15,fontWeight:700,color:'#2E5F8A'}}>
                          {form.price ? formatNumber(parseInt(form.price)) + ' DZD' : '—'}
                        </span>
                        {form.oldPrice && <span style={{fontSize:11,color:'#9CA3AF',textDecoration:'line-through'}}>
                          {formatNumber(parseInt(form.oldPrice))} DZD
                        </span>}
                      </div>
                    </div>
                  </div>
                  {/* Thumbnail strip */}
                  {form.images.length > 0 && (
                    <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                      {form.images.slice(0,6).map((img:string,i:number)=>(
                        <div key={i} style={{width:36,height:36,borderRadius:6,overflow:'hidden',border:'1.5px solid #E5E7EB'}}>
                          <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                      ))}
                      {form.images.length>6 && (
                        <div style={{width:36,height:36,borderRadius:6,background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#6B7280',fontWeight:700}}>
                          +{form.images.length-6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{display:'flex',gap:12,marginTop:24,paddingTop:20,borderTop:'1px solid #F3F4F6'}}>
            <button onClick={handleSave} disabled={saving}
              style={{padding:'12px 36px',borderRadius:20,background:saving?'#9CA3AF':'#2E5F8A',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer',fontFamily:'Jost,sans-serif',fontSize:14,fontWeight:600}}>
              {saving?'⏳ Saving...':editing?'✓ Update Product':'+ Save Product'}
            </button>
            <button onClick={resetForm}
              style={{padding:'12px 24px',borderRadius:20,background:'transparent',color:'#6B7280',border:'1.5px solid #E5E7EB',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:14}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Msg outside form */}
      {msg && !showForm && (
        <div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,
          background:msg.startsWith('✓')?'#D1FAE5':msg.startsWith('🗑️')?'#FEF3C7':'#FEE2E2',
          color:msg.startsWith('✓')?'#065F46':msg.startsWith('🗑️')?'#92400E':'#DC2626'}}>
          {msg}
        </div>
      )}

      {/* ── Search ── */}
      <div style={{background:'#fff',borderRadius:16,padding:'14px 20px',marginBottom:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:10}}>
        <span>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name or code..."
          style={{flex:1,border:'none',outline:'none',fontFamily:'Jost,sans-serif',fontSize:14,color:'#374151',background:'transparent'}}/>
        {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:18}}>✕</button>}
      </div>

      {/* ── Table ── */}
      <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#F9FAFB',borderBottom:'2px solid #F3F4F6'}}>
              {['Image','Code','Name','Category','Brand','Price','Stock','Status','Actions'].map(h=>(
                <th key={h} style={{padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={9} style={{padding:48,textAlign:'center',color:'#9CA3AF'}}>
                  {search?'No products match your search.':'No products yet.'}
                </td></tr>
              : filtered.map(p=>(
                <tr key={p.id} style={{borderBottom:'1px solid #F9FAFB'}}>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{position:'relative',width:48,height:48,borderRadius:8,overflow:'hidden',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}
                            onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                        : p.emoji
                      }
                      {/* Multi-image badge */}
                      {(p as any).images?.length > 0 && (
                        <span style={{position:'absolute',bottom:0,right:0,background:'rgba(46,95,138,.85)',color:'#fff',fontSize:8,fontWeight:700,padding:'1px 4px',borderRadius:'6px 0 0 0'}}>
                          +{(p as any).images.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{padding:'10px 14px',fontWeight:700,color:'#2E5F8A',fontFamily:'monospace'}}>{p.code}</td>
                  <td style={{padding:'10px 14px',fontWeight:500,color:'#1A1A2E',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</td>
                  <td style={{padding:'10px 14px',color:'#6B7280'}}>{p.category}</td>
                  <td style={{padding:'10px 14px',color:'#6B7280'}}>{p.brand||'—'}</td>
                  <td style={{padding:'10px 14px',fontWeight:600}}>{formatNumber(p.price)} DZD</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,
                      background:p.stock===0?'#FEE2E2':p.stock<10?'#FEF3C7':'#D1FAE5',
                      color:p.stock===0?'#DC2626':p.stock<10?'#92400E':'#065F46'}}>
                      {p.stock===0?'Out':p.stock}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {p.sale&&<span style={{background:'#D1FAE5',color:'#065F46',padding:'2px 7px',borderRadius:10,fontSize:10,fontWeight:700}}>Sale</span>}
                      {p.featured&&<span style={{background:'#FEF3C7',color:'#92400E',padding:'2px 7px',borderRadius:10,fontSize:10,fontWeight:700}}>⭐</span>}
                      {!p.sale&&!p.featured&&<span style={{color:'#9CA3AF',fontSize:11}}>—</span>}
                    </div>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>openEdit(p)}
                        style={{padding:'5px 12px',borderRadius:6,border:'1px solid #2E5F8A',color:'#2E5F8A',background:'none',cursor:'pointer',fontSize:12}}>
                        ✏️ Edit
                      </button>
                      <button onClick={()=>handleDelete(p.id,p.name)}
                        style={{padding:'5px 10px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:12}}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
