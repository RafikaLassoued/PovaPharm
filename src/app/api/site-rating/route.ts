import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [ratings, count] = await Promise.all([
    prisma.siteRating.aggregate({ _avg: { rating: true }, _count: { id: true } }),
    prisma.siteRating.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ])
  return NextResponse.json({
    average: Math.round((ratings._avg.rating || 0) * 10) / 10,
    count: ratings._count.id,
    recent: count,
  })
}

export async function POST(req: NextRequest) {
  const { rating, comment } = await req.json()
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
  const r = await prisma.siteRating.create({ data: { rating, comment } })
  return NextResponse.json(r, { status: 201 })
}
