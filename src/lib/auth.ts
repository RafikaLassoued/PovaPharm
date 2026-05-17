import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'Pova-pharm-secret-change-in-production-2026'
)

export const COOKIE_NAME = 'lava_admin_token'
export const ADMIN_ROUTE_PREFIX = '/admin'
export const LOGIN_PATH = '/dashboard-secure-x7k2'   // رابط الدخول المخفي

export interface AdminPayload {
  id: number
  email: string
  name: string
  role: string
}

// ── توليد JWT ──────────────────────────────────────────────
export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

// ── التحقق من JWT ──────────────────────────────────────────
export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AdminPayload
  } catch {
    return null
  }
}

// ── قراءة الـ Session من الكوكيز ──────────────────────────
export async function getSession(): Promise<AdminPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ── مساعد لحساب الوقت المتبقي للـ Token ──────────────────
export function msUntilExpiry(hours = 8) {
  return hours * 60 * 60 * 1000
}

