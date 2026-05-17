import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { name: true },
      orderBy: { id: "desc" }
    })

    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}