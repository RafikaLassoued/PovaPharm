import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      SUPABASE_URL: url ? '✅ Set' : '❌ Missing',
      ANON_KEY:     key ? '✅ Set' : '❌ Missing',
    })
  }

  // Test connection to Supabase
  try {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
      },
    })
    const data = await res.json()
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      buckets: data,
      SUPABASE_URL: url,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 })

    const fileName = `test-${Date.now()}.${file.name.split('.').pop()}`
    const arrayBuffer = await file.arrayBuffer()

    const uploadRes = await fetch(`${url}/storage/v1/object/categories/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: arrayBuffer,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return NextResponse.json({ ok: false, status: uploadRes.status, error: err })
    }

    const publicUrl = `${url}/storage/v1/object/public/categories/${fileName}`
    return NextResponse.json({ ok: true, url: publicUrl })

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
