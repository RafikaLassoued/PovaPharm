import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function AdminProfilePage() {
  const session = await getSession()
  if (!session) redirect('/dashboard-secure-x7k2')

  return <ProfileClient adminName={session.name} adminEmail={session.email} />
}
