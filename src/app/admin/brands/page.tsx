'use client'
import { useEffect, useState, useRef } from 'react'
import { uploadImage } from '@/lib/supabase'

export default function AdminBrandsPage() {
  const [brands, setBrands]   = useState<any[]>([])
  const [form, setForm]       = useState({ name:'', logoUrl:'', description:'' })
  const [editing, setEditing] = useState<number|null>(null)
  const [msg, setMsg]         = useState('')
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetch('/api/brands').then(r=>r.json()).then(setBrands).catch(()=>{}) }, [])

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setMsg('⏳ Uploading logo...')
    try {
      const url = await uploadImage(file, 'brands')
      setForm(f=>({...f,logoUrl:url}))
      setPreview(url)
      setMsg('✓ Logo uploaded!')
    } catch(err:any) {
      setMsg('❌ '+err.message)
      setPreview('')
    } finally {
      setUploading(false)
      if(fileRef.current) fileRef.current.value=''
    }
  }

  async function save() {
    if(!form.name.trim()) { setMsg('❌ Brand name is required.'); return }
    setSaving(true)
    const res = editing
      ? await fetch(`/api/brands/${editing}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
      : await fetch('/api/brands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if(res.ok) {
      const b = await res.json()
      setBrands(prev=>editing?prev.map(x=>x.id===editing?b:x):[...prev,b])
      setMsg(editing?'✓ Brand updated!':'✓ Brand added!')
      reset()
    } else { setMsg('❌ Error saving brand.') }
    setTimeout(()=>setMsg(''),3000)
    setSaving(false)
  }

  async function del(id:number,name:string) {
    if(!confirm(`Delete "${name}"?`))return
    await fetch(`/api/brands/${id}`,{method:'DELETE'})
    setBrands(p=>p.filter(b=>b.id!==id))
  }

  async function toggleActive(b:any) {
    const res = await fetch(`/api/brands/${b.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...b,active:!b.active})})
    if(res.ok) setBrands(prev=>prev.map(x=>x.id===b.id?{...x,active:!x.active}:x))
  }

  function reset() { setForm({name:'',logoUrl:'',description:''}); setEditing(null); setPreview(''); setMsg('') }
  function edit(b:any) { setForm({name:b.name,logoUrl:b.logoUrl||'',description:b.description||''}); setEditing(b.id); setPreview(b.logoUrl||'') }

  const inp = {width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',fontFamily:'Jost,sans-serif',fontSize:13,outline:'none'} as React.CSSProperties

  return (
    <div>
      <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:26,color:'#1A1A2E',marginBottom:24}}>🏷️ Brands</h1>

      {msg && (
        <div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,
          background:msg.startsWith('✓')?'#D1FAE5':msg.startsWith('⏳')?'#EFF6FF':'#FEE2E2',
          color:msg.startsWith('✓')?'#065F46':msg.startsWith('⏳')?'#1E40AF':'#DC2626'}}>
          {msg}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:24}}>
        {/* Form */}
        <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.06)',height:'fit-content'}}>
          <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:18,marginBottom:20}}>
            {editing?'✏️ Edit':'➕ New'} Brand
          </h3>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Brand Name *</label>
            <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. AIC Natural"/>
          </div>

          {/* Logo Upload */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:8}}>Brand Logo</label>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:72,height:72,borderRadius:12,border:'1.5px solid #E5E7EB',background:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0,fontSize:26,fontWeight:700,color:'#2E5F8A'}}>
                {preview
                  ? <img src={preview} style={{width:'100%',height:'100%',objectFit:'contain'}} onError={()=>setPreview('')}/>
                  : form.name.charAt(0)||'B'
                }
              </div>
              <div style={{flex:1}}>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{display:'none'}} onChange={uploadLogo}/>
                <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading}
                  style={{width:'100%',padding:'9px',borderRadius:8,border:`2px dashed ${uploading?'#9CA3AF':'#2E5F8A'}`,background:uploading?'#F9FAFB':'#EFF6FF',color:uploading?'#9CA3AF':'#2E5F8A',cursor:uploading?'wait':'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {uploading
                    ? <><span style={{display:'inline-block',width:13,height:13,border:'2px solid rgba(46,95,138,.3)',borderTopColor:'#2E5F8A',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> Uploading...</>
                    : '📤 Upload Logo'
                  }
                </button>
                <input style={{...inp,fontSize:11}}
                  placeholder="Or paste logo URL..."
                  value={form.logoUrl}
                  onChange={e=>{setForm(f=>({...f,logoUrl:e.target.value}));setPreview(e.target.value)}}
                />
                {preview && (
                  <button type="button" onClick={()=>{setPreview('');setForm(f=>({...f,logoUrl:''}))}}
                    style={{marginTop:4,padding:'3px 10px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:11}}>
                    ✕ Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Description</label>
            <textarea rows={2} style={{...inp,resize:'vertical'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={save} disabled={saving||uploading}
              style={{flex:1,padding:'10px',borderRadius:20,background:(saving||uploading)?'#9CA3AF':'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600}}>
              {saving?'Saving...':editing?'✓ Update':'+ Add Brand'}
            </button>
            {editing && (
              <button onClick={reset}
                style={{padding:'10px 16px',borderRadius:20,border:'1.5px solid #E5E7EB',background:'none',cursor:'pointer',color:'#6B7280',fontFamily:'Jost,sans-serif',fontSize:13}}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Brands Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,alignContent:'start'}}>
          {brands.length===0
            ? <div style={{gridColumn:'1/-1',padding:60,textAlign:'center',color:'#9CA3AF',background:'#fff',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{fontSize:40,marginBottom:12}}>🏷️</div>No brands yet.
              </div>
            : brands.map(b=>(
              <div key={b.id} style={{background:'#fff',borderRadius:16,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,.06)',textAlign:'center',opacity:b.active?1:.5,transition:'opacity .2s'}}>
                <div style={{width:64,height:64,borderRadius:12,background:'#F9FAFB',border:'1.5px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',margin:'0 auto 12px',fontSize:24,fontWeight:700,color:'#2E5F8A'}}>
                  {b.logoUrl?<img src={b.logoUrl} alt={b.name} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:b.name.charAt(0)}
                </div>
                <div style={{fontWeight:700,fontSize:14,color:'#1A1A2E',marginBottom:4}}>{b.name}</div>
                {b.description&&<div style={{fontSize:11,color:'#9CA3AF',marginBottom:12,lineHeight:1.4}}>{b.description}</div>}
                <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                  <button onClick={()=>edit(b)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #2E5F8A',color:'#2E5F8A',background:'none',cursor:'pointer',fontSize:11}}>✏️</button>
                  <button onClick={()=>toggleActive(b)} style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${b.active?'#F59E0B':'#10B981'}`,color:b.active?'#92400E':'#065F46',background:'none',cursor:'pointer',fontSize:11}}>
                    {b.active?'Hide':'Show'}
                  </button>
                  <button onClick={()=>del(b.id,b.name)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:11}}>🗑️</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
