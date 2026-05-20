import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { id: parseInt(params.id) } })
  if (!product) return { title: 'Product Not Found' }
  return { title: `${product.name} | Pova Pharm`, description: product.description }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: { reviews: true },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
  })

  return <ProductDetailClient product={product as any} related={related as any} />
}

