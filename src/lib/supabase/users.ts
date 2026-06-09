import { cookies } from 'next/headers'
import { createServerSupabaseClient } from './server'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('prode_user_id')?.value

  if (!userId) return null

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('users').select('id, name, email').eq('id', userId).single()

  return data
}
