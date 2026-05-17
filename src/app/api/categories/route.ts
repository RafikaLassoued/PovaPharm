import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// جلب جميع الكاتيجوريز


export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (err) {
    console.error("Category API Error:", err)
    return NextResponse.json([], { status: 500 })
  }
}
// إضافة كاتيجوري جديدة
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const category = await prisma.category.create({ 
      data: { 
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g,'-'), // توليد slug تلقائي
        emoji: data.emoji || '✨',
        image: data.image || '',
        description: data.description || '',
        active: true,
      }
    })
    return NextResponse.json(category)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// تحديث كاتيجوري
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const category = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g,'-'),
        emoji: data.emoji || '✨',
        image: data.image || '',
        description: data.description || '',
        active: data.active ?? true,
      }
    })

    return NextResponse.json(category)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// حذف كاتيجوري
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}