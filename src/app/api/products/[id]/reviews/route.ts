import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id)
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const pageSize = 10

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const total = await prisma.review.count({ where: { productId } })

  return NextResponse.json({
    reviews,
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id)
  const { name, rating, comment } = await req.json()

  // Validation
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }
  if (!comment || !comment.trim()) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
  }

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      productId,
      name: name.trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
    },
  })

  // Update product rating (calculate average)
  const allReviews = await prisma.review.findMany({ where: { productId } })
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
