import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// حد محاولات تسجيل الدخول (brute-force protection)
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>()
const MAX_ATTEMPTS  = 5
const BLOCK_MINUTES = 15

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  // ── فحص Brute-force ────────────────────────────────────
  const attempt = loginAttempts.get(ip)
  if (attempt && attempt.blockedUntil > Date.now()) {
    const mins = Math.ceil((attempt.blockedUntil - Date.now()) / 60000)
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${mins} minute(s).` },
      { status: 429 }
    )
  }

  const { email, password } = await req.json()

  // ── تحقق بسيط من المدخلات ─────────────────────────────
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  // ── البحث في قاعدة البيانات ────────────────────────────
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } })

  // رسالة خطأ موحدة لتجنب User Enumeration
  const INVALID_MSG = 'Invalid email or password.'

  if (!admin) {
    recordFailedAttempt(ip)
    // تأخير مصطنع لمنع timing attacks
    await bcrypt.compare('dummy', '$2a$12$dummyhashtopreventtimingattack00000000000000000000000')
    return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash)
  if (!passwordMatch) {
    recordFailedAttempt(ip)
    return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
  }

  // ── تسجيل الدخول ناجح ─────────────────────────────────
  loginAttempts.delete(ip)  // إعادة تعيين محاولات IP

  // تحديث آخر تسجيل دخول
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  const token = await signToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  })

  const res = NextResponse.json({
    success: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  })

  // ── وضع JWT في HttpOnly Cookie ─────────────────────────
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,       // لا يمكن الوصول من JavaScript
    secure: process.env.NODE_ENV === 'production',  // HTTPS فقط في production
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,  // 8 ساعات
    path: '/',
  })

  return res
}

export async function DELETE() {
  // تسجيل الخروج
  const res = NextResponse.json({ success: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}

// ── مساعد تسجيل المحاولات الفاشلة ────────────────────────
function recordFailedAttempt(ip: string) {
  const current = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 }
  current.count += 1
  if (current.count >= MAX_ATTEMPTS) {
    current.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000
  }
  loginAttempts.set(ip, current)
}
