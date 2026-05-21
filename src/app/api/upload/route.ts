import { NextRequest, NextResponse } from 'next/server'
import { getEnvVar, getOptionalEnvVar } from '@/lib/env'

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
// Service role key للـ server-side (أكثر صلاحيات)
const SERVICE_KEY = getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY') || SUPABASE_KEY

type BucketKey = 'products' | 'categories' | 'brands' | 'logos'
const VALID_BUCKETS: BucketKey[] = ['products', 'categories', 'brands', 'logos']

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env'
    }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File
    const bucket   = (formData.get('bucket') as BucketKey) || 'products'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!VALID_BUCKETS.includes(bucket)) return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })

    // اسم فريد للملف
    const ext      = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // رفع الملف عبر Supabase REST API مباشرة
    const arrayBuffer = await file.arrayBuffer()

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey':        SERVICE_KEY!,
          'Content-Type':  file.type || 'application/octet-stream',
          'x-upsert':      'true',
        },
        body: arrayBuffer,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      let errMsg = errText
      try {
        const errJson = JSON.parse(errText)
        errMsg = errJson.message || errJson.error || errText
      } catch {}

      // إذا كانت مشكلة bucket not found → نحاول نصنعه
      if (uploadRes.status === 400 && errMsg.includes('Bucket not found')) {
        await createBucket(bucket)
        // إعادة المحاولة
        const retry = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'apikey':        SERVICE_KEY!,
              'Content-Type':  file.type || 'application/octet-stream',
              'x-upsert':      'true',
            },
            body: arrayBuffer,
          }
        )
        if (!retry.ok) {
          const retryErr = await retry.text()
          return NextResponse.json({ error: `Bucket not found: "${bucket}". Create it in Supabase Dashboard → Storage` }, { status: 400 })
        }
      } else {
        return NextResponse.json({
          error: errMsg,
          hint: errMsg.includes('policy') || errMsg.includes('security')
            ? `Add a policy for bucket "${bucket}" in Supabase → Storage → Policies`
            : undefined
        }, { status: uploadRes.status })
      }
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
    return NextResponse.json({ ok: true, url: publicUrl })

  } catch (err: any) {
    console.error('[Upload API Error]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

async function createBucket(bucket: string) {
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey':        SERVICE_KEY!,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ id: bucket, name: bucket, public: true }),
    })
  } catch {}
}
