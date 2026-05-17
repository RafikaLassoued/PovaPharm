import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    // Return all pages for admin
    const pages = await prisma.staticPage.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(pages)
  }

  const page = await prisma.staticPage.findUnique({
    where: { slug }
  })

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  return NextResponse.json(page)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const page = await prisma.staticPage.create({ data })
  return NextResponse.json(page)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const { id, ...updateData } = data
  const page = await prisma.staticPage.update({
    where: { id },
    data: updateData
  })
  return NextResponse.json(page)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.staticPage.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}