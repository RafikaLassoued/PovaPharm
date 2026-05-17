import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const companies = await prisma.deliveryCompany.findMany({
    where: { active: true },
    include: { prices: { orderBy: { wilayaCode: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const { name, logoUrl } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const company = await prisma.deliveryCompany.create({
    data: { name, logoUrl: logoUrl || null },
    include: { prices: true },
  })
  return NextResponse.json(company, { status: 201 })
}
