import { prisma } from '@/lib/prisma'
import { AdminProductsClient } from './AdminProductsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Products | Admin' }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  return <AdminProductsClient products={products as any} />
}
