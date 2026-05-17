'use client'
import { useEffect, useState, useRef } from 'react'
import { uploadProductImage } from '@/lib/supabase'

const WILAYAS = [
  {code:1,name:'Adrar'},{code:2,name:'Chlef'},{code:3,name:'Laghouat'},{code:4,name:'Oum El Bouaghi'},
  {code:5,name:'Batna'},{code:6,name:'Béjaïa'},{code:7,name:'Biskra'},{code:8,name:'Béchar'},
  {code:9,name:'Blida'},{code:10,name:'Bouira'},{code:11,name:'Tamanrasset'},{code:12,name:'Tébessa'},
  {code:13,name:'Tlemcen'},{code:14,name:'Tiaret'},{code:15,name:'Tizi Ouzou'},{code:16,name:'Alger'},
  {code:17,name:'Djelfa'},{code:18,name:'Jijel'},{code:19,name:'Sétif'},{code:20,name:'Saïda'},
  {code:21,name:'Skikda'},{code:22,name:'Sidi Bel Abbès'},{code:23,name:'Annaba'},{code:24,name:'Guelma'},
  {code:25,name:'Constantine'},{code:26,name:'Médéa'},{code:27,name:'Mostaganem'},{code:28,name:'MSila'},
  {code:29,name:'Mascara'},{code:30,name:'Ouargla'},{code:31,name:'Oran'},{code:32,name:'El Bayadh'},
  {code:33,name:'Illizi'},{code:34,name:'Bordj Bou Arréridj'},{code:35,name:'Boumerdès'},{code:36,name:'El Tarf'},
  {code:37,name:'Tindouf'},{code:38,name:'Tissemsilt'},{code:39,name:'El Oued'},{code:40,name:'Khenchela'},
  {code:41,name:'Souk Ahras'},{code:42,name:'Tipaza'},{code:43,name:'Mila'},{code:44,name:'Aïn Defla'},
  {code:45,name:'Naâma'},{code:46,name:'Aïn Témouchent'},{code:47,name:'Ghardaïa'},{code:48,name:'Relizane'},
  {code:49,name:"El M'Ghair"},{code:50,name:'El Menia'},{code:51,name:'Ouled Djellal'},{code:52,name:'Bordj Badji Mokhtar'},
  {code:53,name:'Béni Abbès'},{code:54,name:'Timimoun'},{code:55,name:'Touggourt'},{code:56,name:'Djanet'},
  {code:57,name:'In Salah'},{code:58,name:'In Guezzam'},
]

type DeliveryType = 'home' | 'office' | 'commune'

export default function AdminDeliveryCompaniesPage() {
  const [companies, setCompanies]   = useState<any[]>([])
  const [selected, setSelected]     = useState<any | null>(null)
  const [prices, setPrices]         = useState<Record<number, {home:number,office:number,commune:number}>>({})
  const [search, setSearch]         = useState('')
  const [saving, setSaving]         = useState(false)
  const [savingAll, setSavingAll]   = useState(false)
  const [msg, setMsg]               = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newLogo, setNewLogo]       = useState('')
  const [uploading, setUploading]   = useState(false)
  const [activeTab, setActiveTab]   = useState<DeliveryType>('home')
  // Bulk fill
  const [bulkHome, setBulkHome]     = useState('')
  const [bulkOffice, setBulkOffice] = useState('')
  const [bulkCommune, setBulkCommune] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadCompanies() }, [])

  async function loadCompanies() {
    const res = await fetch('/api/delivery-companies')
    const data = await res.json()
    setCompanies(data)
  }

  async function selectCompany(c: any) {
    setSelected(c)
    setMsg('')
    // بناء map من الأسعار الموجودة
    const map: Record<number, {home:number,office:number,commune:number}> = {}
    WILAYAS.forEach(w => { map[w.code] = { home: 500, office: 400, commune: 600 } })
    c.prices?.forEach((p: any) => {
      map[p.wilayaCode] = { home: p.homePrice, office: p.officePrice, commune: p.communePrice }
    })
    setPrices(map)
  }

  function updatePrice(code: number, type: DeliveryType, val: number) {
    setPrices(prev => ({ ...prev, [code]: { ...prev[code], [type]: val } }))
  }

  function applyBulk() {
    if (!bulkHome && !bulkOffice && !bulkCommune) return
    const visible = WILAYAS.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || String(w.code).includes(search))
    setPrices(prev => {
      const updated = { ...prev }
      visible.forEach(w => {
        updated[w.code] = {
          home:    bulkHome    ? parseInt(bulkHome)    : prev[w.code]?.home    || 500,
          office:  bulkOffice  ? parseInt(bulkOffice)  : prev[w.code]?.office  || 400,
          commune: bulkCommune ? parseInt(bulkCommune) : prev[w.code]?.commune || 600,
        }
      })
      return updated
    })
    setBulkHome(''); setBulkOffice(''); setBulkCommune('')
    setMsg(`✓ Applied to ${visible.length} wilayas (not saved yet — click Save All)`)
    setTimeout(() => setMsg(''), 4000)
  }

  async function saveAllPrices() {
    if (!selected) return
    setSavingAll(true)
    const payload = WILAYAS.map(w => ({
      wilayaCode:   w.code,
      wilayaName:   w.name,
      homePrice:    prices[w.code]?.home    || 500,
      officePrice:  prices[w.code]?.office  || 400,
      communePrice: prices[w.code]?.commune || 600,
    }))
    const res = await fetch(`/api/delivery-companies/${selected.id}/prices`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prices: payload }),
    })
    if (res.ok) {
      setMsg('✓ All prices saved successfully!')
      loadCompanies()
    } else { setMsg('❌ Error saving prices.') }
    setTimeout(() => setMsg(''), 4000)
    setSavingAll(false)
  }

  async function addCompany() {
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/delivery-companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), logoUrl: newLogo || null }),
    })
    if (res.ok) {
      const c = await res.json()
      setCompanies(prev => [...prev, c])
      setNewName(''); setNewLogo(''); setShowAdd(false)
      selectCompany(c)
      setMsg('✓ Company added!')
    } else { setMsg('❌ Error.') }
    setSaving(false)
  }

  async function deleteCompany(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/delivery-companies/${id}`, { method: 'DELETE' })
    setCompanies(prev => prev.filter(c => c.id !== id))
    if (selected?.id === id) { setSelected(null); setPrices({}) }
  }

  async function toggleActive(c: any) {
    const res = await fetch(`/api/delivery-companies/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, active: !c.active }),
    })
    if (res.ok) setCompanies(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x))
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await uploadProductImage(file); setNewLogo(url) }
    catch { setMsg('❌ Upload failed.') }
    setUploading(false)
  }

  const filteredWilayas = WILAYAS.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) || String(w.code).includes(search)
  )

  const inp = { padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontFamily: 'Jost,sans-serif', fontSize: 13, outline: 'none' } as React.CSSProperties
  const numInp = { ...inp, width: 80, textAlign: 'center' as const }

  const TYPE_LABELS: Record<DeliveryType, string> = { home: '🏠 Home', office: '🏢 Office', commune: '🏘️ Commune' }
  const TYPE_KEYS: Record<DeliveryType, 'home' | 'office' | 'commune'> = { home: 'home', office: 'office', commune: 'commune' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E' }}>🚛 Delivery Companies</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            كل شركة لها أسعار مستقلة لكل ولاية ولكل نوع توصيل (منزل / مكتب / بلدية)
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ padding: '10px 22px', borderRadius: 20, background: '#2E5F8A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
          + Add Company
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: msg.startsWith('✓') ? '#D1FAE5' : '#FEE2E2', color: msg.startsWith('✓') ? '#065F46' : '#DC2626' }}>
          {msg}
        </div>
      )}

      {/* Add Company Modal */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 32, width: 400, boxShadow: '0 24px 80px rgba(0,0,0,.2)' }}>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, marginBottom: 20 }}>➕ Add Delivery Company</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Company Name *</label>
              <input style={{ ...inp, width: '100%' }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Yalidine, Zaki, Guepex..." />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Logo (optional)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F9FAFB', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 24, flexShrink: 0 }}>
                  {newLogo ? <img src={newLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🚛'}
                </div>
                <div style={{ flex: 1 }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadLogo} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px dashed #2E5F8A', background: '#EFF6FF', color: '#2E5F8A', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {uploading ? '⏳...' : '📤 Upload Logo'}
                  </button>
                  <input style={{ ...inp, width: '100%', marginTop: 6, fontSize: 11 }} placeholder="Or paste URL..." value={newLogo} onChange={e => setNewLogo(e.target.value)} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addCompany} disabled={saving || !newName.trim()}
                style={{ flex: 1, padding: '11px', borderRadius: 20, background: '#2E5F8A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
                {saving ? 'Adding...' : 'Add Company'}
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '11px 20px', borderRadius: 20, border: '1.5px solid #E5E7EB', background: 'none', cursor: 'pointer', color: '#6B7280', fontFamily: 'Jost,sans-serif', fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Companies List */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5 }}>
              Companies ({companies.length})
            </div>
            {companies.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🚛</div>
                No companies yet
              </div>
            ) : companies.map(c => (
              <div key={c.id} onClick={() => selectCompany(c)}
                style={{ padding: '14px 16px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: selected?.id === c.id ? '#EFF6FF' : '#fff', borderLeft: selected?.id === c.id ? '3px solid #2E5F8A' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F9FAFB', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 22, flexShrink: 0 }}>
                  {c.logoUrl ? <img src={c.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🚛'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: selected?.id === c.id ? '#2E5F8A' : '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.prices?.length || 0} wilayas configured</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={e => { e.stopPropagation(); toggleActive(c) }}
                    style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: c.active ? '#D1FAE5' : '#FEE2E2', color: c.active ? '#065F46' : '#DC2626', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                    {c.active ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteCompany(c.id, c.name) }}
                    style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', fontSize: 11 }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prices Table */}
        {selected ? (
          <div>
            {/* Company Header */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#F9FAFB', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 26 }}>
                  {selected.logoUrl ? <img src={selected.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🚛'}
                </div>
                <div>
                  <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#1A1A2E' }}>{selected.name}</h2>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>Set delivery prices for all 58 wilayas</div>
                </div>
              </div>
              <button onClick={saveAllPrices} disabled={savingAll}
                style={{ padding: '12px 28px', borderRadius: 20, background: savingAll ? '#9CA3AF' : '#4A7C59', color: '#fff', border: 'none', cursor: savingAll ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 700 }}>
                {savingAll ? '⏳ Saving...' : '💾 Save All Prices'}
              </button>
            </div>

            {/* Bulk Fill + Search */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', alignSelf: 'center' }}>⚡ Fill All Visible:</div>
                {[['🏠 Home', bulkHome, setBulkHome], ['🏢 Office', bulkOffice, setBulkOffice], ['🏘️ Commune', bulkCommune, setBulkCommune]].map(([label, val, set]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label as string}</div>
                    <input type="number" style={numInp} placeholder="DZD" value={val as string} onChange={e => (set as any)(e.target.value)} />
                  </div>
                ))}
                <button onClick={applyBulk}
                  style={{ padding: '8px 20px', borderRadius: 20, background: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600 }}>
                  Apply
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search wilaya..."
                    style={{ ...inp, width: 200 }} />
                </div>
              </div>
            </div>

            {/* Delivery Type Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['home', 'office', 'commune'] as DeliveryType[]).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{ padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600, background: activeTab === t ? '#2E5F8A' : '#F3F4F6', color: activeTab === t ? '#fff' : '#6B7280' }}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7280', alignSelf: 'center' }}>
                Showing {filteredWilayas.length} of 58 wilayas
              </div>
            </div>

            {/* Prices Grid */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #F3F4F6' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5, width: 40 }}>#</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5 }}>Wilaya</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5 }}>
                      {TYPE_LABELS[activeTab]} Price (DZD)
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: .5 }}>Other Prices</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWilayas.map((w, i) => {
                    const p = prices[w.code] || { home: 500, office: 400, commune: 600 }
                    const activePrice = p[TYPE_KEYS[activeTab]]
                    return (
                      <tr key={w.code} style={{ borderBottom: '1px solid #F9FAFB', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                        <td style={{ padding: '10px 16px', color: '#9CA3AF', fontWeight: 600, fontSize: 12 }}>{w.code}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1A1A2E' }}>{w.name}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <input
                            type="number"
                            style={{ ...numInp, width: 100, padding: '8px 12px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', fontWeight: 600, color: '#1E40AF' }}
                            value={activePrice}
                            onChange={e => updatePrice(w.code, activeTab, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {(['home', 'office', 'commune'] as DeliveryType[]).filter(t => t !== activeTab).map(t => (
                              <div key={t} style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>{t === 'home' ? '🏠' : t === 'office' ? '🏢' : '🏘️'}</span>
                                <span style={{ fontWeight: 600, color: '#6B7280' }}>{p[t]}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={saveAllPrices} disabled={savingAll}
                style={{ padding: '12px 36px', borderRadius: 20, background: savingAll ? '#9CA3AF' : '#4A7C59', color: '#fff', border: 'none', cursor: savingAll ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 15, fontWeight: 700 }}>
                {savingAll ? '⏳ Saving...' : '💾 Save All Prices for ' + selected.name}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, padding: 80, textAlign: 'center', color: '#9CA3AF', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🚛</div>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#374151', marginBottom: 8 }}>Select a Company</h3>
            <p style={{ fontSize: 14 }}>Choose a delivery company from the left to manage its prices</p>
          </div>
        )}
      </div>
    </div>
  )
}
