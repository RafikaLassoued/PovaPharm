import { prisma } from '@/lib/prisma'
import { AdminPagesClient } from './AdminPagesClient'

export const metadata = { title: 'Pages | Admin' }

export default async function AdminPagesPage() {
  const pages = await prisma.staticPage.findMany({ orderBy: { updatedAt: 'desc' } })
  return <AdminPagesClient pages={pages} />
}