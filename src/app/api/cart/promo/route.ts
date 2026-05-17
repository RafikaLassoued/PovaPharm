import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  const promo = await prisma.promoCode.findFirst({ where: { code: code.toUpperCase(), active: true } })
  if (!promo) return NextResponse.json({ valid: false, error: 'Invalid promo code' }, { status: 400 })
  const discountAmount = Math.round(subtotal * promo.discount)
  return NextResponse.json({ valid: true, discount: promo.discount, discountAmount, code: promo.code })
}
