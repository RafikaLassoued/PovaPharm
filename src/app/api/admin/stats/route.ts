export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalProducts, totalOrders, pendingOrders, customers, revenueData, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.customer.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.product.findMany({ where: { stock: { lt: 10 } }, orderBy: { stock: 'asc' }, take: 5 }),
  ])

  return NextResponse.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    customers,
    totalRevenue: revenueData._sum.total || 0,
    lowStock,
  })
}
