import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueProductCode } from '@/lib/utils'

async function createUniqueProductCode() {
  let code = generateUniqueProductCode()
  while (await prisma.product.findUnique({ where: { code } })) {
    code = generateUniqueProductCode()
  }
  return code
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search    = searchParams.get('search')   || ''
  const category  = searchParams.get('category') || ''
  const sale      = searchParams.get('sale')      === '1'
  const featured  = searchParams.get('featured')  === '1'
  const maxPrice  = parseInt(searchParams.get('maxPrice')  || '999999')
  const minRating = parseFloat(searchParams.get('minRating')|| '0')
  const inStock   = searchParams.get('inStock')  === '1'
  const sort      = searchParams.get('sort')      || 'featured'
  // Admin: mostrar eliminados
  const showDeleted = searchParams.get('deleted') === '1'

  const where: Record<string, any> = {
    // Soft delete filter
    deletedAt: showDeleted ? { not: null } : null,
  }

  if (search) where.OR = [
    { name:     { contains: search, mode: 'insensitive' } },
    { code:     { contains: search, mode: 'insensitive' } },
    { category: { contains: search, mode: 'insensitive' } },
    { brand:    { contains: search, mode: 'insensitive' } },
  ]
  if (category) where.category = category
  if (sale)     where.sale     = true
  if (featured) where.featured = true
  if (inStock)  where.stock    = { gt: 0 }
  where.price  = { lte: maxPrice }
  where.rating = { gte: minRating }

  const orderBy: Record<string, string> = {}
  if      (sort === 'price-asc')  orderBy.price    = 'asc'
  else if (sort === 'price-desc') orderBy.price    = 'desc'
  else if (sort === 'rating')     orderBy.rating   = 'desc'
  else if (sort === 'newest')     orderBy.createdAt = 'desc'
  else                            orderBy.featured = 'desc'

  const products = await prisma.product.findMany({ where, orderBy })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const code = typeof data.code === 'string' && data.code.trim() ? data.code.trim().toUpperCase() : await createUniqueProductCode()
  const product = await prisma.product.create({ data: { ...data, code } })
  return NextResponse.json(product, { status: 201 })
}
