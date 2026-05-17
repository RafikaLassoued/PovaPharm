import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const { items, customerName, customerPhone, customerAddress, customerWilaya, paymentMethod, promoCode } = await req.json()

  // Validate promo code
  let discountAmount = 0
  if (promoCode) {
    const promo = await prisma.promoCode.findFirst({ where: { code: promoCode, active: true } })
    if (promo) {
      const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
      discountAmount = Math.round(subtotal * promo.discount)
      await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } })
    }
  }

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
  const delivery = subtotal >= 10000 ? 0 : 500
  const total = Math.max(0, subtotal + delivery - discountAmount)

  const orderNumber = 'ORD-' + Date.now()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      customerWilaya,
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      delivery,
      discount: discountAmount,
      total,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          name: i.name,
          code: i.code,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  })

  // Update stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }

  return NextResponse.json(order, { status: 201 })
}
