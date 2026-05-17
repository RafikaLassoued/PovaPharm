import { LoginClient } from './LoginClient'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

// هذه الصفحة غير مرتبطة بأي قائمة أو nav — رابطها سري
export const metadata = {
  title: 'Sign In',      // عنوان محايد لا يكشف أنها admin
  robots: 'noindex',    // لا تُفهرس في محركات البحث
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; reason?: string }
}) {
  // إذا كان المستخدم مسجلاً دخوله بالفعل → وجّهه للداشبورد
  const session = await getSession()
  if (session) redirect('/admin')

  return (
    <LoginClient
      from={searchParams.from || '/admin'}
      reason={searchParams.reason}
    />
  )
}
