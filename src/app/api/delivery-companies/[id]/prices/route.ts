import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - جلب أسعار شركة معينة
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const prices = await prisma.deliveryPrice.findMany({
    where: { companyId: parseInt(params.id) },
    orderBy: { wilayaCode: 'asc' },
  })
  return NextResponse.json(prices)
}

// POST - حفظ/تحديث سعر ولاية معينة
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { wilayaCode, wilayaName, homePrice, officePrice, communePrice } = await req.json()
  const companyId = parseInt(params.id)

  const price = await prisma.deliveryPrice.upsert({
    where: { companyId_wilayaCode: { companyId, wilayaCode } },
    update: { homePrice, officePrice, communePrice },
    create: { companyId, wilayaCode, wilayaName, homePrice, officePrice, communePrice },
  })
  return NextResponse.json(price)
}

// PUT - حفظ أسعار متعددة دفعة واحدة (bulk)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { prices } = await req.json()
  const companyId = parseInt(params.id)

  const results = await Promise.all(
    prices.map((p: any) =>
      prisma.deliveryPrice.upsert({
        where: { companyId_wilayaCode: { companyId, wilayaCode: p.wilayaCode } },
        update: { homePrice: p.homePrice, officePrice: p.officePrice, communePrice: p.communePrice },
        create: { companyId, wilayaCode: p.wilayaCode, wilayaName: p.wilayaName, homePrice: p.homePrice, officePrice: p.officePrice, communePrice: p.communePrice },
      })
    )
  )
  return NextResponse.json({ saved: results.length })
}
