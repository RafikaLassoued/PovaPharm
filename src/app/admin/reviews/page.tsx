import { prisma } from '@/lib/prisma'
import { ReviewsClient } from './ReviewsClient'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const session = await getSession()
  if (!session) redirect('/dashboard-secure-x7k2')

  const reviews = await prisma.review.findMany({
    include: { product: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const serializedReviews = reviews.map(review => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
  }))

  return <ReviewsClient initialReviews={serializedReviews} />
}
