import { prisma } from '@/lib/prisma'
import { HeroSection } from '@/components/home/HeroSection'
import { MarqueeBar } from '@/components/home/HomeComponents'
import { CategoriesSection } from '@/components/home/HomeComponents'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FlashSale } from '@/components/home/FeaturedProducts'
import { BrandsSection } from '@/components/home/HomeComponents'
import { TrustBadges } from '@/components/home/HomeComponents'
import { TopBar } from '@/components/home/TopBar'

export default async function HomePage() {
  const [featured, onSale, promos, settings] = await Promise.all([
    // جلب المنتجات المميزة — إذا لم توجد، جلب آخر 8 منتجات
    prisma.product.findMany({
      where: { featured: true },
      take: 8,
    }).then(async (data) => {
      if (data.length > 0) return data
      return prisma.product.findMany({ take: 8, orderBy: { id: 'desc' } })
    }),

    // جلب منتجات العروض — إذا لم توجد، جلب أول 4 منتجات
    prisma.product.findMany({
      where: { sale: true },
      take: 4,
    }).then(async (data) => {
      if (data.length > 0) return data
      return prisma.product.findMany({ take: 4, orderBy: { price: 'desc' } })
    }),

    prisma.promoCode.findMany({ where: { active: true } }).catch(() => []),
    prisma.siteSettings.findFirst().catch(() => null),
  ])

  return (
    <>
      <TopBar settings={settings} promos={promos} />
      <HeroSection />
      <MarqueeBar />
      <CategoriesSection />
      <FeaturedProducts products={featured} />
      {onSale.length > 0 && <FlashSale products={onSale} />}
      <TrustBadges />
      <BrandsSection />
    </>
  )
}
