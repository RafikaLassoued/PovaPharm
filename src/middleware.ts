import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'Pova-pharm-secret-change-in-production-2026'
)

const COOKIE_NAME   = 'lava_admin_token'
const LOGIN_PATH    = '/dashboard-secure-x7k2'   // رابط الدخول المخفي
const ADMIN_PREFIX  = '/admin'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── حماية صفحات /admin فقط ────────────────────────────
  if (!pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value

  // لا يوجد token → إعادة توجيه لصفحة تسجيل الدخول المخفية
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, req.url)
    loginUrl.searchParams.set('from', pathname)  // حفظ الرابط الأصلي للعودة إليه
    return NextResponse.redirect(loginUrl)
  }

  // التحقق من صحة الـ token
  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    // Token منتهي الصلاحية أو مزور
    const loginUrl = new URL(LOGIN_PATH, req.url)
    loginUrl.searchParams.set('from', pathname)
    loginUrl.searchParams.set('reason', 'session_expired')
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete(COOKIE_NAME)  // حذف الكوكيز الفاسد
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}

