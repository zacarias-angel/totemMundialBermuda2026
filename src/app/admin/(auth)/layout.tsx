import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login')
  }

  return <AdminLayout>{children}</AdminLayout>
}
