import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: { reviews: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data,
  })
  return NextResponse.json(product)
}

// Soft Delete — يضع deletedAt بدلاً من حذف فعلي
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json(product)
}
