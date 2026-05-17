import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Pova Pharm',
  robots: 'noindex, nofollow',   // لا تُفهرس صفحات الإدارة
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ── تحقق من الجلسة من الخادم (Server Component) ──────
  const session = await getSession()

  // إذا لم تكن مسجلاً دخولك → أعد التوجيه فوراً
  // (الـ middleware يعمل أيضاً — هذا طبقة حماية ثانية)
  if (!session) redirect('/dashboard-secure-x7k2')

  return (
    <div className="admin-shell">
      <AdminSidebar adminName={session.name} adminRole={session.role} />
      <div className="admin-main">
        <AdminHeader adminName={session.name} adminEmail={session.email} />
        <main className="admin-content">
          {children}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #F3F4F6;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .admin-content > * {
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .admin-shell {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100% !important;
            position: relative !important;
            height: auto !important;
            max-height: none !important;
          }

          .admin-header {
            width: 100%;
            height: auto !important;
            padding: 16px !important;
          }

          .admin-content {
            padding: 20px;
          }

          .admin-sidebar nav {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .admin-sidebar nav a {
            flex: 1 1 calc(50% - 6px);
            min-width: 140px;
          }

          .admin-sidebar nav a div {
            width: 100%;
          }
        }
      ` }} />
    </div>
  )
}
