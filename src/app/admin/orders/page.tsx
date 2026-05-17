import { prisma } from '@/lib/prisma'
import { AdminOrdersClient } from './AdminOrdersClient'

export const metadata = { title: 'Orders | Admin' }

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return <AdminOrdersClient orders={orders as any} />
}
