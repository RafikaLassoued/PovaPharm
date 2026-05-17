import { prisma } from '@/lib/prisma'
import { HeroAdminClient } from './HeroAdminClient'

export const metadata = { title: 'Hero Products | Admin' }

export default async function AdminHeroPage() {
  const allProducts = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  return <HeroAdminClient products={allProducts as any} />
}
