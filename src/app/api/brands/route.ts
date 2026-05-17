import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // تأكد من إعداد Prisma

export async function GET() {
  const brands = await prisma.brand.findMany({ orderBy: { id: 'desc' } })
  return NextResponse.json(brands)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const brand = await prisma.brand.create({ data: { 
    name: data.name,
    description: data.description || '',
    logoUrl: data.logoUrl || '',
    active: true
  }})
  return NextResponse.json(brand)
}