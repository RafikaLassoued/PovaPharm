import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Restore soft-deleted product
export async function POST(req: NextRequest) {
  const { id } = await req.json()
  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: { deletedAt: null },
  })
  return NextResponse.json(product)
}

// Hard delete — حذف نهائي من قاعدة البيانات
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.product.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
