import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const promo = await prisma.promoCode.update({ where: { id: parseInt(params.id) }, data })
  return NextResponse.json(promo)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.promoCode.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
