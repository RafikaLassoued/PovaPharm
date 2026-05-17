import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — fetch all promo codes
export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(promos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

// POST — create a new promo code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Required fields
    if (!body.code || !body.discount) {
      return NextResponse.json(
        { error: 'Fields "code" and "discount" are required.' },
        { status: 400 }
      )
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase(),
        discount: Number(body.discount),
        type: body.type || "percentage",
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        firstOrder: body.firstOrder || false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        active: body.active ?? true
      }
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}