import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const search = req.nextUrl.searchParams.get('search') || ''
  const pageSize = 20

  const where: Record<string, any> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
    ]
  }

  const reviews = await prisma.review.findMany({
    where,
    include: { product: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const total = await prisma.review.count({ where })

  return NextResponse.json({
    reviews,
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.review.delete({ where: { id } })
  
  return NextResponse.json({ success: true })
}
