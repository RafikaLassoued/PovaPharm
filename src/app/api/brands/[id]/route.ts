import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const brand = await prisma.brand.update({
    where: { id: Number(params.id) },
    data
  })
  return NextResponse.json(brand)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.brand.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
