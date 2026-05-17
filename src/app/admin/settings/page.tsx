'use client'
import { useEffect, useState, useRef } from 'react'
import { uploadProductImage } from '@/lib/supabase'
import { formatNumber } from '@/lib/utils'

// ── Modal Component ──────────────────────────────────────
function Modal({ title, onClose, onSave, saving, children }: {
  title: string
  onClose: () => void
  onSave: () => void
  saving: boolean
  children: React.ReactNode
}) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#1A1A2E' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px 28px' }}>{children}</div>
        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 12, justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: '#fff' }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 20, border: '1.5px solid #E5E7EB', background: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, color: '#6B7280' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: 20, background: saving ? '#9CA3AF' : '#2E5F8A', color: '#fff', border: 'none', cursor: saving ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
            {saving ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Info Row ─────────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #F9FAFB', alignItems: 'flex-start' }}>
      {icon && <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#1A1A2E', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  )
}

// ── Section Card ─────────────────────────────────────────
function SectionCard({ title, icon, onEdit, children }: { title: string; icon: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '0', boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 17, color: '#1A1A2E' }}>{title}</h3>
        </div>
        <button onClick={onEdit}
          style={{ padding: '7px 18px', borderRadius: 20, background: '#EFF6FF', color: '#2E5F8A', border: '1.5px solid #BFDBFE', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          ✏️ Edit
        </button>
      </div>
      <div style={{ padding: '8px 24px 8px' }}>{children}</div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [s, setS]           = useState<any>(null)
  const [draft, setDraft]   = useState<any>(null)
  const [modal, setModal]   = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [uploading, setUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  // Password state
  const [pw, setPw]     = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [showPwModal, setShowPwModal] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => { setS(data); setDraft(data) })
  }, [])

  function openModal(tab: string) {
    setDraft({ ...s })
    setModal(tab)
  }

  function closeModal() { setModal(null); setDraft({ ...s }) }

  async function saveModal() {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    if (res.ok) {
      const updated = await res.json()
      setS(updated); setDraft(updated)
      setMsg('✓ Saved successfully!')
      setModal(null)
    } else { setMsg('❌ Error saving.') }
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setDraft((p: any) => ({ ...p, logoUrl: url }))
    } catch { setMsg('❌ Upload failed.') }
    setUploading(false)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pw.newPw !== pw.confirm) { setPwMsg('❌ Passwords do not match.'); return }
    if (pw.newPw.length < 6) { setPwMsg('❌ Min 6 characters.'); return }
    const res = await fetch('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }) })
    const d = await res.json()
    setPwMsg(res.ok ? '✓ Password changed!' : '❌ ' + (d.error || 'Failed'))
    if (res.ok) { setPw({ current: '', newPw: '', confirm: '' }); setTimeout(() => { setShowPwModal(false); setPwMsg('') }, 1500) }
  }

  if (!s) return <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading settings...</div>

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontFamily: 'Jost,sans-serif', fontSize: 14, outline: 'none' }

  return (
    <div>
      <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E', marginBottom: 6 }}>⚙️ Settings</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Manage your store settings — click Edit to update any section</p>

      {msg && (
        <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14, background: msg.startsWith('✓') ? '#D1FAE5' : '#FEE2E2', color: msg.startsWith('✓') ? '#065F46' : '#DC2626' }}>
          {msg}
        </div>
      )}

      {/* ── General ── */}
      <SectionCard title="General" icon="🏠" onEdit={() => openModal('general')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #F9FAFB' }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#F9FAFB', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {s.logoUrl ? <img src={s.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🌿</span>}
          </div>
          <div>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, fontWeight: 700, color: '#1A1A2E' }}>{s.siteName}</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Store Name & Logo</div>
          </div>
        </div>
      
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '14px 0' }}>
          {[['Products', s.statProducts], ['Clients', s.statClients], ['Natural', s.statNatural]].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: '#F9FAFB' }}>
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, color: '#2E5F8A' }}>{v}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{l}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Contact ── */}
      <SectionCard title="Contact Information" icon="📞" onEdit={() => openModal('contact')}>
        <InfoRow label="Address" value={s.address} icon="📍" />
        <InfoRow label="Phone" value={s.phone} icon="📞" />
        <InfoRow label="WhatsApp" value={s.whatsapp} icon="💬" />
        <InfoRow label="Email" value={s.contactEmail} icon="📧" />
        <InfoRow label="Working Hours" value={s.workingHours} icon="🕐" />
      </SectionCard>

      {/* ── Social ── */}
      <SectionCard title="Social Media" icon="📱" onEdit={() => openModal('social')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: '12px 0' }}>
          {[['Facebook', s.facebook, '📘'], ['Instagram', s.instagram, '📸'], ['TikTok', s.tiktok, '🎵'], ['WhatsApp Link', s.whatsappLink, '💬']].map(([l, v, icon]) => (
            <div key={l} style={{ padding: '12px 16px', borderRadius: 10, background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 13, color: v && v !== '#' ? '#2E5F8A' : '#D1D5DB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                  {v && v !== '#' ? v : 'Not set'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Delivery ── */}
      <SectionCard title="Delivery Settings" icon="🚚" onEdit={() => openModal('delivery')}>
        <InfoRow label="Free Delivery Minimum" value={s.freeDeliveryMin ? formatNumber(s.freeDeliveryMin) + ' DZD' : '10,000 DZD'} icon="🎁" />
        <InfoRow label="Top Bar Message" value={s.topBarText} icon="📢" />
        <div style={{ padding: '12px 0 4px' }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            💡 For per-wilaya delivery prices, go to <strong>Wilaya Prices</strong> in the sidebar.
          </div>
        </div>
      </SectionCard>

      {/* ── SMS ── */}
      <SectionCard title="SMS Notifications" icon="💬" onEdit={() => openModal('sms')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #F9FAFB' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: s.smsEnabled ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            {s.smsEnabled ? '✅' : '❌'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>SMS on New Order</div>
            <div style={{ fontSize: 12, color: s.smsEnabled ? '#065F46' : '#DC2626' }}>{s.smsEnabled ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>
        <InfoRow label="Admin Phone" value={s.adminPhone || 'Not set'} icon="📱" />
        <InfoRow label="API Key" value={s.smsApiKey ? '••••••••' + s.smsApiKey.slice(-4) : 'Not configured'} icon="🔑" />
      </SectionCard>

      {/* ── Analytics ── */}
      <SectionCard title="Analytics & Tracking" icon="📊" onEdit={() => openModal('analytics')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: '12px 0' }}>
          {[['Meta Pixel', s.metaPixelId, '📘'], ['TikTok Pixel', s.tiktokPixelId, '🎵'], ['Google Analytics', s.googleAnalyticsId, '📈']].map(([l, v, icon]) => (
            <div key={l} style={{ padding: '12px 16px', borderRadius: 10, background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 12, color: v ? '#2E5F8A' : '#D1D5DB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                  {v ? '✓ Configured' : 'Not set'}
                </div>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>💬</span>
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>WhatsApp Number</div>
              <div style={{ fontSize: 12, color: s.whatsappLink && s.whatsappLink.includes('wa.me') ? '#2E5F8A' : '#D1D5DB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                {s.whatsappLink && s.whatsappLink.includes('wa.me') ? '✓ Set' : 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── SEO ── */}
      <SectionCard title="SEO Settings" icon="🔍" onEdit={() => openModal('seo')}>
        <InfoRow label="Meta Title" value={s.seoTitle || 'Not set'} icon="📝" />
        <InfoRow label="Meta Description" value={s.seoDescription || 'Not set'} icon="📄" />
        <InfoRow label="Keywords" value={s.seoKeywords || 'Not set'} icon="🏷️" />
      </SectionCard>

      {/* ── Security ── */}
      <SectionCard title="Security" icon="🔐" onEdit={() => setShowPwModal(true)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, padding: '12px 0' }}>
         {(['JWT Auth', 'HttpOnly Cookies', 'Session Duration', 'Brute-force Protection'] as string[]).map((label, i) => {
  const statuses = ['Active', 'Enabled', '8 Hours', 'Active']
  return (
    <div key={label} style={{ padding: '12px 16px', borderRadius: 10, background: '#F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#1A1A2E' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46' }}>{statuses[i]}</span>
    </div>
  )
})}
        </div>
      </SectionCard>

      {/* ════════════ MODALS ════════════ */}

      {/* General Modal */}
      {modal === 'general' && (
        <Modal title="🏠 Edit General Settings" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Site Name</label>
              <input style={inp} value={draft.siteName || ''} onChange={e => setDraft((p: any) => ({ ...p, siteName: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 70, height: 70, borderRadius: 12, background: '#F9FAFB', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {draft.logoUrl ? <img src={draft.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🌿</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadLogo} />
                  <button onClick={() => logoRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1.5px dashed #2E5F8A', background: '#EFF6FF', color: '#2E5F8A', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    {uploading ? '⏳ Uploading...' : '📤 Upload Logo'}
                  </button>
                  {draft.logoUrl && (
                    <button onClick={() => setDraft((p: any) => ({ ...p, logoUrl: '' }))}
                      style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #EF4444', color: '#EF4444', background: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 12 }}>
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Top Bar Text</label>
              <input style={inp} value={draft.topBarText || ''} onChange={e => setDraft((p: any) => ({ ...p, topBarText: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Free Delivery Min (DZD)</label>
                <input type="number" style={inp} value={draft.freeDeliveryMin || 0} onChange={e => setDraft((p: any) => ({ ...p, freeDeliveryMin: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Location Label</label>
                <input style={inp} value={draft.locationLabel || ''} onChange={e => setDraft((p: any) => ({ ...p, locationLabel: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 10 }}>Hero Stats</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['statProducts', 'Products'], ['statClients', 'Clients'], ['statNatural', 'Natural']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginBottom: 4 }}>{l}</label>
                    <input style={{ ...inp, padding: '8px 10px', fontSize: 13 }} value={draft[k] || ''} onChange={e => setDraft((p: any) => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Contact Modal */}
      {modal === 'contact' && (
        <Modal title="📞 Edit Contact Information" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['address', '📍 Address'], ['phone', '📞 Phone'], ['whatsapp', '💬 WhatsApp'], ['contactEmail', '📧 Email'], ['workingHours', '🕐 Working Hours']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
                <input style={inp} value={draft[k] || ''} onChange={e => setDraft((p: any) => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Social Modal */}
      {modal === 'social' && (
        <Modal title="📱 Edit Social Media Links" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['facebook', '📘 Facebook URL'], ['instagram', '📸 Instagram URL'], ['tiktok', '🎵 TikTok URL'], ['whatsappLink', '💬 WhatsApp Link']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
                <input style={inp} value={draft[k] || ''} onChange={e => setDraft((p: any) => ({ ...p, [k]: e.target.value }))} placeholder="https://..." />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Delivery Modal */}
      {modal === 'delivery' && (
        <Modal title="🚚 Edit Delivery Settings" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Free Delivery Minimum (DZD)</label>
              <input type="number" style={inp} value={draft.freeDeliveryMin || 0} onChange={e => setDraft((p: any) => ({ ...p, freeDeliveryMin: parseInt(e.target.value) || 0 }))} />
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>Orders above this amount get free delivery.</p>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Top Bar Text</label>
              <input style={inp} value={draft.topBarText || ''} onChange={e => setDraft((p: any) => ({ ...p, topBarText: e.target.value }))} />
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: '#EFF6FF', fontSize: 13, color: '#1E40AF' }}>
              💡 For per-wilaya prices, go to <strong>Wilaya Prices</strong> in the sidebar.
            </div>
          </div>
        </Modal>
      )}

      {/* SMS Modal */}
      {modal === 'sms' && (
        <Modal title="💬 Edit SMS Settings" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF3C7', fontSize: 13, color: '#92400E' }}>
              ⚠️ Requires Twilio or Infobip subscription for API Key.
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 10, background: '#F9FAFB', cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={draft.smsEnabled || false} onChange={e => setDraft((p: any) => ({ ...p, smsEnabled: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#1A1A2E' }}>Enable SMS on New Order</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Receive SMS notification when a customer places an order</div>
              </div>
            </label>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Admin Phone Number</label>
              <input style={inp} value={draft.adminPhone || ''} onChange={e => setDraft((p: any) => ({ ...p, adminPhone: e.target.value }))} placeholder="+213..." />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>SMS API Key</label>
              <input style={inp} value={draft.smsApiKey || ''} onChange={e => setDraft((p: any) => ({ ...p, smsApiKey: e.target.value }))} placeholder="API key from Twilio/Infobip..." />
            </div>
          </div>
        </Modal>
      )}

      {/* Analytics Modal */}
      {modal === 'analytics' && (
        <Modal title="📊 Edit Analytics & Tracking" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#EFF6FF', fontSize: 13, color: '#1E40AF' }}>
              💡 Add your tracking IDs to monitor user behavior and conversions across platforms.
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>📘 Meta Pixel ID</label>
              <input style={inp} value={draft.metaPixelId || ''} onChange={e => setDraft((p: any) => ({ ...p, metaPixelId: e.target.value }))} placeholder="e.g., 123456789..." />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>🎵 TikTok Pixel ID</label>
              <input style={inp} value={draft.tiktokPixelId || ''} onChange={e => setDraft((p: any) => ({ ...p, tiktokPixelId: e.target.value }))} placeholder="e.g., C12345..." />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>📈 Google Analytics ID</label>
              <input style={inp} value={draft.googleAnalyticsId || ''} onChange={e => setDraft((p: any) => ({ ...p, googleAnalyticsId: e.target.value }))} placeholder="e.g., G-XXXXXXXXXX" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>💬 WhatsApp Number (for wa.me link)</label>
              <input style={inp} value={draft.whatsappLink || ''} onChange={e => setDraft((p: any) => ({ ...p, whatsappLink: e.target.value }))} placeholder="https://wa.me/213..." />
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Format: https://wa.me/213XXXXXXXXX (without spaces or special chars)</div>
            </div>
          </div>
        </Modal>
      )}

      {/* SEO Modal */}
      {modal === 'seo' && (
        <Modal title="🔍 Edit SEO Settings" onClose={closeModal} onSave={saveModal} saving={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F0FDF4', fontSize: 13, color: '#065F46' }}>
              ✓ These settings improve your search engine visibility and determine how your site appears in search results.
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>📝 Meta Title</label>
              <input style={inp} value={draft.seoTitle || ''} onChange={e => setDraft((p: any) => ({ ...p, seoTitle: e.target.value }))} placeholder="e.g., Pova Pharm - Premium Beauty Products in Algeria" />
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>50-60 characters recommended</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>📄 Meta Description</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' } as React.CSSProperties} value={draft.seoDescription || ''} onChange={e => setDraft((p: any) => ({ ...p, seoDescription: e.target.value }))} placeholder="e.g., Discover premium beauty and skincare products. Fast delivery across Algeria. Shop now for natural cosmetics, makeup, and haircare." />
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>155-160 characters recommended</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>🏷️ Keywords (comma-separated)</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' } as React.CSSProperties} value={draft.seoKeywords || ''} onChange={e => setDraft((p: any) => ({ ...p, seoKeywords: e.target.value }))} placeholder="e.g., beauty products, skincare, cosmetics, Algeria, natural beauty, makeup" />
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Separate keywords with commas</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Password Modal */}
      {showPwModal && (
        <Modal title="🔐 Change Password" onClose={() => { setShowPwModal(false); setPwMsg('') }} onSave={() => {}} saving={false}>
          {pwMsg && (
            <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, background: pwMsg.startsWith('✓') ? '#D1FAE5' : '#FEE2E2', color: pwMsg.startsWith('✓') ? '#065F46' : '#DC2626' }}>
              {pwMsg}
            </div>
          )}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['current', '🔒 Current Password'], ['newPw', '🔑 New Password'], ['confirm', '✅ Confirm Password']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
                <input type="password" style={inp} value={(pw as any)[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} required />
              </div>
            ))}
            <button type="submit"
              style={{ padding: '12px', borderRadius: 20, background: '#2E5F8A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              Update Password
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

