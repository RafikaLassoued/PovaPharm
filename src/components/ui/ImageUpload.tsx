'use client'
import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/supabase'

type BucketKey = 'products' | 'categories' | 'brands' | 'logos'

interface Props {
  value: string
  onChange: (url: string) => void
  bucket?: BucketKey
  label?: string
  preview?: string
  fallback?: string
}

export function ImageUpload({ value, onChange, bucket = 'products', label = 'Image', fallback = '🖼️' }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5MB.'); return }

    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file, bucket)
      onChange(url)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Check Supabase Storage settings.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#374151' }}>{label}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Preview */}
        <div style={{ width: 72, height: 72, borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontSize: 28 }}>
          {value
            ? <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => onChange('')} />
            : <span>{fallback}</span>
          }
        </div>

        {/* Controls */}
        <div style={{ flex: 1 }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFile} />

          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ width: '100%', padding: '9px', borderRadius: 8, border: `2px dashed ${uploading ? '#9CA3AF' : '#2E5F8A'}`, background: uploading ? '#F9FAFB' : '#EFF6FF', color: uploading ? '#9CA3AF' : '#2E5F8A', cursor: uploading ? 'wait' : 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading
              ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(46,95,138,.3)', borderTopColor: '#2E5F8A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Uploading...</>
              : '📤 Upload Image'
            }
          </button>

          <input style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E5E7EB', fontFamily: 'Jost,sans-serif', fontSize: 11, outline: 'none' }}
            placeholder="Or paste image URL..." value={value} onChange={e => onChange(e.target.value)} />

          <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>PNG, JPG, WebP · Max 5MB</p>
          {error && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{error}</p>}
        </div>
      </div>

      {value && (
        <button type="button" onClick={() => onChange('')}
          style={{ marginTop: 8, padding: '4px 12px', borderRadius: 6, border: '1px solid #EF4444', color: '#EF4444', background: 'none', cursor: 'pointer', fontSize: 11 }}>
          ✕ Remove Image
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
