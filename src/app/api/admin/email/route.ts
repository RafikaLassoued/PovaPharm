import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST: Change email address
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { newEmail, password } = await req.json()

    // Validation
    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Get admin with password hash
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 401 })
    }

    // Check if new email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: newEmail.toLowerCase().trim() },
    })

    if (existingAdmin && existingAdmin.id !== admin.id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Update email
    const updatedAdmin = await prisma.admin.update({
      where: { id: session.id },
      data: { email: newEmail.toLowerCase().trim() },
      select: { id: true, email: true, name: true, role: true },
    })

    // Generate new token with updated email
    const newToken = await signToken({
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      role: updatedAdmin.role,
    })

    const res = NextResponse.json({
      success: true,
      admin: updatedAdmin,
      message: 'Email updated successfully',
    })

    // Set new token
    res.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return res
  } catch (error: any) {
    console.error('Email change error:', error)
    return NextResponse.json({ error: 'Failed to change email' }, { status: 500 })
  }
}
