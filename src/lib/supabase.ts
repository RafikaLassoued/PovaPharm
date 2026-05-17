export type BucketKey = 'products' | 'categories' | 'brands' | 'logos'

/**
 * رفع صورة عبر API (Server-side upload)
 */
export async function uploadImage(
  file: File,
  bucket: BucketKey = 'products'
): Promise<string> {
  if (!file) throw new Error('No file selected')

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be under 5MB')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Upload failed (${res.status})`)
  }

  const data = await res.json()

  if (!data?.url) {
    throw new Error('No URL returned from server')
  }

  return data.url
}

/**
 * للـ products فقط (اختصار قديم للتوافق)
 */
export function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, 'products')
}