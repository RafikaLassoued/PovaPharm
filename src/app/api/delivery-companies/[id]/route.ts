import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const company = await prisma.deliveryCompany.findUnique({
    where: { id: parseInt(params.id) },
    include: { prices: { orderBy: { wilayaCode: 'asc' } } },
  })
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(company)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const company = await prisma.deliveryCompany.update({
    where: { id: parseInt(params.id) },
    data: { name: data.name, logoUrl: data.logoUrl, active: data.active },
    include: { prices: true },
  })
  return NextResponse.json(company)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.deliveryCompany.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
