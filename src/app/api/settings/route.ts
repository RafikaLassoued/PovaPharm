import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// جلب أو إنشاء الإعدادات (singleton row)
async function getOrCreate() {
  let settings = await prisma.siteSettings.findFirst()
  if (!settings) settings = await prisma.siteSettings.create({ data: {} })
  return settings
}

export async function GET() {
  const settings = await getOrCreate()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  let settings = await prisma.siteSettings.findFirst()
  if (!settings) {
    settings = await prisma.siteSettings.create({ data })
  } else {
    settings = await prisma.siteSettings.update({ where: { id: settings.id }, data })
  }
  return NextResponse.json(settings)
}
