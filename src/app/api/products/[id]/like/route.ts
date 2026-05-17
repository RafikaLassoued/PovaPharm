import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { likes: { increment: 1 } },
  })
  return NextResponse.json({ likes: product.likes })
}
