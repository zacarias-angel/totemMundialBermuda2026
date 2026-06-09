import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/users'
import { PronosticosClient } from '@/components/mobile/PronosticosClient'

export default async function PronosticosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/mobile')

  return <PronosticosClient userId={user.id} />
}
