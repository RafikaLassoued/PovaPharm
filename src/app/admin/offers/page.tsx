'use client'
import { useEffect, useState } from 'react'

export default function AdminOffersPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [form, setForm] = useState({ code:'', discount:'', firstOrder:false, maxUses:'', expiresAt:'' })
  const [editing, setEditing] = useState<number|null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/promos').then(r=>r.json()).then(setPromos).catch(()=>setPromos([])) }, [])

  async function save() {
    setSaving(true)
    const body = { ...form, discount: parseFloat(form.discount)/100, maxUses: form.maxUses?parseInt(form.maxUses):null, expiresAt: form.expiresAt||null, code: form.code.toUpperCase(), active: true }
    const url = editing ? `/api/admin/promos/${editing}` : '/api/admin/promos'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    if (res.ok) {
      const p = await res.json()
      setPromos(prev => editing ? prev.map(x=>x.id===editing?p:x) : [...prev,p])
      setMsg(editing?'✓ Updated!':'✓ Added!'); reset()
    } else { setMsg('❌ Error.') }
    setTimeout(()=>setMsg(''),3000); setSaving(false)
  }

  async function toggleActive(p:any) {
    const res = await fetch(`/api/admin/promos/${p.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,active:!p.active})})
    if (res.ok) setPromos(prev=>prev.map(x=>x.id===p.id?{...x,active:!x.active}:x))
  }

  async function del(id:number,code:string) {
    if(!confirm(`Delete "${code}"?`))return
    await fetch(`/api/admin/promos/${id}`,{method:'DELETE'})
    setPromos(p=>p.filter(x=>x.id!==id))
  }

  function reset() { setForm({code:'',discount:'',firstOrder:false,maxUses:'',expiresAt:''}); setEditing(null) }
  function editP(p:any) { setForm({code:p.code,discount:String(Math.round(p.discount*100)),firstOrder:p.firstOrder,maxUses:p.maxUses?String(p.maxUses):'',expiresAt:p.expiresAt?p.expiresAt.slice(0,10):''}); setEditing(p.id) }

  const inp = {width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',fontFamily:'Jost,sans-serif',fontSize:13,outline:'none'} as React.CSSProperties

  return (
    <div>
      <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:26,color:'#1A1A2E',marginBottom:24}}>🏷️ Promo Codes</h1>
      {msg && <div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,background:msg.startsWith('✓')?'#D1FAE5':'#FEE2E2',color:msg.startsWith('✓')?'#065F46':'#DC2626'}}>{msg}</div>}
      <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.06)',height:'fit-content'}}>
          <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:18,marginBottom:20}}>{editing?'✏️ Edit':'➕ New'} Code</h3>
          {[['Code','code','text'],['Discount (%)','discount','number'],['Max Uses','maxUses','number'],['Expires At','expiresAt','date']].map(([l,k,t])=>(
            <div key={k} style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>{l}</label>
              <input type={t} style={{...inp,textTransform:k==='code'?'uppercase':'none',fontFamily:k==='code'?'monospace':'Jost,sans-serif'}}
                value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',marginBottom:20}}>
            <input type="checkbox" checked={form.firstOrder} onChange={e=>setForm(f=>({...f,firstOrder:e.target.checked}))} />
            First order only
          </label>
          <div style={{display:'flex',gap:10}}>
            <button onClick={save} disabled={saving} style={{flex:1,padding:'10px',borderRadius:20,background:saving?'#9CA3AF':'#2E5F8A',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:13,fontWeight:600}}>
              {saving?'Saving...':editing?'Update':'Add Code'}
            </button>
            {editing&&<button onClick={reset} style={{padding:'10px 16px',borderRadius:20,border:'1.5px solid #E5E7EB',background:'none',cursor:'pointer',color:'#6B7280',fontFamily:'Jost,sans-serif',fontSize:13}}>Cancel</button>}
          </div>
        </div>
        <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#F9FAFB',borderBottom:'2px solid #F3F4F6'}}>
              {['Code','Discount','Used','Expires','Status','Actions'].map(h=>(
                <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {promos.length===0?<tr><td colSpan={6} style={{padding:40,textAlign:'center',color:'#9CA3AF'}}>No promo codes yet.</td></tr>
              :promos.map(p=>(
                <tr key={p.id} style={{borderBottom:'1px solid #F9FAFB'}}>
                  <td style={{padding:'12px 16px',fontWeight:700,color:'#2E5F8A',fontFamily:'monospace'}}>{p.code}</td>
                  <td style={{padding:'12px 16px',fontWeight:700}}>{Math.round(p.discount*100)}%</td>
                  <td style={{padding:'12px 16px',color:'#6B7280'}}>{p.usedCount} {p.maxUses?`/ ${p.maxUses}`:''}</td>
                  <td style={{padding:'12px 16px',color:'#6B7280',fontSize:12}}>{p.expiresAt?new Date(p.expiresAt).toLocaleDateString():'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{background:p.active?'#D1FAE5':'#FEE2E2',color:p.active?'#065F46':'#DC2626',padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{p.active?'Active':'Inactive'}</span>
                  </td>
                  <td style={{padding:'12px 16px'}}><div style={{display:'flex',gap:6}}>
                    <button onClick={()=>editP(p)} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #2E5F8A',color:'#2E5F8A',background:'none',cursor:'pointer',fontSize:11}}>✏️</button>
                    <button onClick={()=>toggleActive(p)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${p.active?'#F59E0B':'#10B981'}`,color:p.active?'#92400E':'#065F46',background:'none',cursor:'pointer',fontSize:11}}>{p.active?'Disable':'Enable'}</button>
                    <button onClick={()=>del(p.id,p.code)} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #EF4444',color:'#EF4444',background:'none',cursor:'pointer',fontSize:11}}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
