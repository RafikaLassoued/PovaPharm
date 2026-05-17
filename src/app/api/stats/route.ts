import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function todayStat() {
  const today = new Date(); today.setHours(0,0,0,0)
  return prisma.siteStat.upsert({
    where: { date: today },
    update: {},
    create: { date: today },
  })
}

export async function GET() {
  const [totalVisits, totalLikes, settings, products] = await Promise.all([
    prisma.siteStat.aggregate({ _sum: { visits: true, likes: true } }),
    prisma.siteSettings.findFirst({ select: { totalLikes: true, statProducts: true, statClients: true, statNatural: true } }),
    prisma.siteSettings.findFirst(),
    prisma.product.count(),
  ])
  return NextResponse.json({
    totalVisits: totalVisits._sum.visits || 0,
    totalLikes:  totalVisits._sum.likes  || 0,
    settings,
    productCount: products,
  })
}

// تسجيل زيارة
export async function POST(req: NextRequest) {
  const { type } = await req.json()  // type: 'visit' | 'like'
  const today = new Date(); today.setHours(0,0,0,0)
  if (type === 'visit') {
    await prisma.siteStat.upsert({
      where: { date: today },
      update: { visits: { increment: 1 } },
      create: { date: today, visits: 1 },
    })
  } else if (type === 'like') {
    await prisma.siteStat.upsert({
      where: { date: today },
      update: { likes: { increment: 1 } },
      create: { date: today, likes: 1 },
    })
    // update settings total
    const s = await prisma.siteSettings.findFirst()
    if (s) await prisma.siteSettings.update({ where: { id: s.id }, data: { totalLikes: { increment: 1 } } })
  }
  return NextResponse.json({ ok: true })
}
