'use client'
import { useEffect, useState, useRef } from 'react'
import { uploadImage } from '@/lib/supabase'

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [form, setForm] = useState({ name:'', emoji:'✨', image:'', description:'' })
  const [editing, setEditing] = useState<number|null>(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetch('/api/categories').then(r=>r.json()).then(setCats) }, [])

  async function uploadImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // معاينة محلية فورية
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setMsg('⏳ Uploading...')

    try {
      // ← هنا التغيير: نستخدم bucket 'categories' بدل 'products'
      const url = await uploadImage(file, 'categories')
      setForm(f => ({ ...f, image: url }))
      setPreview(url)
      setMsg('✓ Image uploaded!')
    } catch (err: any) {
      console.error('Upload error:', err)
      setMsg('❌ Upload failed: ' + (err.message || 'Check Supabase Storage settings'))
      setPreview('')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function save() {
    if (!form.name.trim()) { setMsg('❌ Name is required.'); return }
    const slug = form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    const res = editing
      ? await fetch(`/api/categories/${editing}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,slug})})
      : await fetch('/api/categories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,slug})})
    if (res.ok) {
      const cat = await res.json()
      setCats(prev => editing ? prev.map(c=>c.id===editing?cat:c) : [...prev,cat])
      setMsg(editing?'✓ Updated!':'✓ Added!'); reset()
    } else { setMsg('❌ Error saving.') }
    setTimeout(()=>setMsg(''),3000)
  }

  async function del(id:number,name:string) {
    if(!confirm(`Delete "${name}"?`))return
    await fetch(`/api/categories/${id}`,{method:'DELETE'})
    setCats(p=>p.filter(c=>c.id!==id))
  }

  function reset() { setForm({name:'',emoji:'✨',image:'',description:''}); setEditing(null); setPreview('') }
  function edit(c:any) { setForm({name:c.name,emoji:c.emoji,image:c.image||'',description:c.description||''}); setEditing(c.id); setPreview(c.image||'') }

  const inp = {width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',fontFamily:'Jost,sans-serif',fontSize:13,outline:'none'} as React.CSSProperties

  return (
    <div>
      <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:26,color:'#1A1A2E',marginBottom:24}}>🗂️ Categories</h1>
      {msg && (
        <div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,
          background:msg.startsWith('✓')?'#D1FAE5':msg.startsWith('⏳')?'#EFF6FF':'#FEE2E2',
          color:msg.startsWith('✓')?'#065F46':msg.startsWith('⏳')?'#1E40AF':'#DC2626'}}>
          {msg}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'350px 1fr',gap:24}}>
        {/* Form */}
        <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.06)',height:'fit-content'}}>
          <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:18,marginBottom:20}}>{editing?'✏️ Edit':'➕ New'} Category</h3>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Name *</label>
            <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Skincare" />
          </div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Emoji (fallback)</label>
            <input style={{...inp,width:80,fontSize:20,textAlign:'center'}} value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} />
          </div>

          {/* Image Upload */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:8}}>Image</label>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              {/* Preview */}
              <div style={{width:64,height:64,borderRadius:10,background:'#F9FAFB',border:'1.5px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',fontSize:28,flexShrink:0}}>
                {preview
                  ? <img src={preview} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>setPreview('')} />
                  : <span>{form.emoji||'🗂️'}</span>
                }
              </div>
              <div style={{flex:1}}>
                {/* Hidden file input */}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:'none'}} onChange={uploadImg} />
                {/* Upload button */}
                <button
                  type="button"
                  onClick={()=>fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width:'100%',padding:'9px',borderRadius:8,marginBottom:8,
                    border:`2px dashed ${uploading?'#9CA3AF':'#2E5F8A'}`,
                    background:uploading?'#F9FAFB':'#EFF6FF',
                    color:uploading?'#9CA3AF':'#2E5F8A',
                    cursor:uploading?'wait':'pointer',
                    fontFamily:'Jost,sans-serif',fontSize:12,fontWeight:600,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                  }}>
                  {uploading
                    ? <><span style={{display:'inline-block',width:12,height:12,border:'2px solid rgba(46,95,138,.3)',borderTopColor:'#2E5F8A',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> Uploading...</>
                    : '📤 Upload Image'
                  }
                </button>
                {/* Manual URL */}
                <input
                  style={{...inp,fontSize:11}}
                  placeholder="Or paste image URL..."
                  value={form.image}
                  onChange={e=>{setForm(f=>({...f,image:e.target.value}));setPreview(e.target.value)}}
                />
                {preview && (
                  <button type="button" onClick={()=>{setPreview('');setForm(f=>({...f,image:''}))}}
                    style={{marginTop:4,padding:'3px 10px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:11}}>
                    ✕ Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Description</label>
            <textarea rows={2} style={{...inp,resize:'vertical'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={save}
              style={{flex:1,padding:'10px',borderRadius:20,background:'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600}}>
              {editing?'✓ Update':'+ Add Category'}
            </button>
            {editing && (
              <button onClick={reset}
                style={{padding:'10px 16px',borderRadius:20,border:'1.5px solid #E5E7EB',background:'none',cursor:'pointer',color:'#6B7280',fontFamily:'Jost,sans-serif',fontSize:13}}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'#F9FAFB',borderBottom:'2px solid #F3F4F6'}}>
                {['Image','Name','Emoji','Description','Actions'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cats.length===0
                ? <tr><td colSpan={5} style={{padding:40,textAlign:'center',color:'#9CA3AF'}}>No categories yet.</td></tr>
                : cats.map(c=>(
                  <tr key={c.id} style={{borderBottom:'1px solid #F9FAFB'}}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{width:44,height:44,borderRadius:8,overflow:'hidden',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
                        {c.image?<img src={c.image} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:c.emoji}
                      </div>
                    </td>
                    <td style={{padding:'12px 16px',fontWeight:600,color:'#1A1A2E'}}>{c.name}</td>
                    <td style={{padding:'12px 16px',fontSize:22}}>{c.emoji}</td>
                    <td style={{padding:'12px 16px',color:'#6B7280',fontSize:12}}>{c.description||'—'}</td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>edit(c)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid #2E5F8A',color:'#2E5F8A',background:'none',cursor:'pointer',fontSize:12}}>✏️ Edit</button>
                        <button onClick={()=>del(c.id,c.name)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:12}}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
