import { prisma } from '@/lib/prisma'
import { TrashClient } from './TrashClient'
export const metadata = { title: 'Trash | Admin' }

export default async function TrashPage() {
  const deleted = await prisma.product.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
  })
  return <TrashClient products={deleted as any} />
}
