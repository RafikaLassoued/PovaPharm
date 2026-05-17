'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'

interface Props {
  from: string
  reason?: string
}

export function LoginClient({ from, reason }: Props) {
  const router = useRouter()
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)

  // رسالة انتهاء الجلسة
  const sessionExpired = reason === 'session_expired'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        router.push(from)
        router.refresh()
      } else if (res.status === 429) {
        setError(data.error)
      } else {
        setError(data.error || 'Login failed.')
        // تلميح بعدد المحاولات (اختياري)
        if (res.status === 401) {
          setAttemptsLeft(prev => (prev === null ? 4 : Math.max(0, prev - 1)))
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #2E5F8A 60%, #4A7C59 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 44px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 32px 80px rgba(0,0,0,.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative top strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 5,
          background: 'linear-gradient(90deg, #2E5F8A, #4A7C59)',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #2E5F8A, #4A7C59)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 26,
            overflow: 'hidden',
          }}>
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || 'Pova Pharm'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              '🌿'
            )}
          </div>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 26, fontWeight: 700,
            color: '#1A1A2E', marginBottom: 6,
          }}>
            Pova Pharm
          </h1>
          <p style={{ fontSize: 13, color: '#8A8AAA' }}>Admin Dashboard Access</p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #F59E0B',
            borderRadius: 10, padding: '12px 16px',
            marginBottom: 20, fontSize: 13, color: '#92400E',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ⚠️ Your session has expired. Please sign in again.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FCA5A5',
            borderRadius: 10, padding: '12px 16px',
            marginBottom: 20, fontSize: 13, color: '#DC2626',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ❌ {error}
            {attemptsLeft !== null && attemptsLeft > 0 && (
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', display: 'block', marginBottom: 8 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#8A8AAA' }}>
                ✉️
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@povapharm.dz"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 10,
                  border: '1.5px solid #E8DCCC',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color .2s',
                  background: '#FAFAFA',
                }}
                onFocus={e => { e.target.style.borderColor = '#2E5F8A'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#E8DCCC'; e.target.style.background = '#FAFAFA' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#8A8AAA' }}>
                🔒
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  borderRadius: 10,
                  border: '1.5px solid #E8DCCC',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color .2s',
                  background: '#FAFAFA',
                }}
                onFocus={e => { e.target.style.borderColor = '#2E5F8A'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#E8DCCC'; e.target.style.background = '#FAFAFA' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#8A8AAA' }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 30,
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #2E5F8A, #4A7C59)',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'Jost, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '.5px',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              '🔐 Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8AAA', marginTop: 24 }}>
          🛡️ Secured with JWT · Sessions expire in 8 hours
        </p>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

