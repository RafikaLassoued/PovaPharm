import { prisma } from '@/lib/prisma'
import { AdminMessagesClient } from './AdminMessagesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Messages | Admin' }

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return <AdminMessagesClient messages={messages as any} />
}
