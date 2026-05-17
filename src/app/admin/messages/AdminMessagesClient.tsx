'use client'
import { useState } from 'react'

export function AdminMessagesClient({ messages: initial }: { messages: any[] }) {
  const [messages, setMessages] = useState(initial)
  const [selected, setSelected] = useState<any | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filtered = messages.filter(m =>
    filter === 'all' ? true : filter === 'unread' ? !m.read : m.read
  )

  const unreadCount = messages.filter(m => !m.read).length

  async function markRead(id: number) {
    await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
    if (selected?.id === id) setSelected((s: any) => ({ ...s, read: true }))
  }

  async function deleteMsg(id: number) {
    if (!confirm('Delete this message?')) return
    await fetch(`/api/contact/${id}`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function openMsg(msg: any) {
    setSelected(msg)
    if (!msg.read) markRead(msg.id)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, color: '#1A1A2E' }}>
          💬 Messages
          {unreadCount > 0 && (
            <span style={{ marginLeft: 12, background: '#EF4444', color: '#fff', fontSize: 13, padding: '2px 10px', borderRadius: 20, fontFamily: 'Jost,sans-serif', fontWeight: 700 }}>
              {unreadCount} new
            </span>
          )}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{messages.length} total messages</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['all', 'All', messages.length], ['unread', '🔴 Unread', unreadCount], ['read', '✓ Read', messages.length - unreadCount]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600, background: filter === key ? '#2E5F8A' : '#F3F4F6', color: filter === key ? '#fff' : '#6B7280' }}>
            {label} ({count})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 20 }}>
        {/* Messages List */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>No messages found.</p>
            </div>
          ) : filtered.map(msg => (
            <div key={msg.id} onClick={() => openMsg(msg)}
              style={{ padding: '16px 20px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: selected?.id === msg.id ? '#EFF6FF' : msg.read ? '#fff' : '#FFFBEB', borderLeft: `4px solid ${selected?.id === msg.id ? '#2E5F8A' : msg.read ? 'transparent' : '#F59E0B'}`, transition: 'all .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!msg.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />}
                  <div style={{ fontWeight: msg.read ? 500 : 700, fontSize: 14, color: '#1A1A2E' }}>
                    {msg.firstName} {msg.lastName}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
                  {new Date(msg.createdAt).toLocaleDateString('fr-DZ')}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{msg.email} · {msg.phone || ''}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{msg.subject}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,.06)', height: 'fit-content', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, color: '#1A1A2E' }}>Message Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>

            {/* Sender Info */}
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#2E5F8A,#4A7C59)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: '"Playfair Display",serif', fontSize: 20, fontWeight: 700 }}>
                  {selected.firstName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A2E' }}>{selected.firstName} {selected.lastName}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{new Date(selected.createdAt).toLocaleString('fr-DZ')}</div>
                </div>
              </div>
              {[['📧', selected.email], ['📞', selected.phone || '—']].map(([icon, val]) => (
                <div key={icon} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                  <span>{icon}</span><span>{val}</span>
                </div>
              ))}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Subject</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', padding: '10px 14px', background: '#EFF6FF', borderRadius: 8, borderLeft: '3px solid #2E5F8A' }}>
                {selected.subject}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Message</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                style={{ flex: 1, padding: '11px', borderRadius: 12, background: '#2E5F8A', color: '#fff', textDecoration: 'none', textAlign: 'center', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
                📧 Reply by Email
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  style={{ flex: 1, padding: '11px', borderRadius: 12, background: '#25D366', color: '#fff', textDecoration: 'none', textAlign: 'center', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
                  💬 WhatsApp
                </a>
              )}
              <button onClick={() => deleteMsg(selected.id)}
                style={{ padding: '11px 16px', borderRadius: 12, border: '1.5px solid #EF4444', color: '#EF4444', background: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14 }}>
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
