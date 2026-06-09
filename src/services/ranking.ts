import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getRanking() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('predictions')
    .select('points, user_id')

  if (!data) return []

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? [])

  const rankMap = new Map<string, { name: string; email: string; userId: string; total: number; exact: number; correct: number; count: number }>()

  for (const row of data) {
    const u = userMap.get(row.user_id)
    if (!u) continue

    const entry = rankMap.get(u.email) ?? {
      name: u.name,
      email: u.email,
      userId: u.id,
      total: 0,
      exact: 0,
      correct: 0,
      count: 0,
    }

    if (row.points != null) {
      entry.total += row.points
      if (row.points === 3) entry.exact += 1
      if (row.points === 1) entry.correct += 1
    }
    entry.count += 1

    rankMap.set(u.email, entry)
  }

  return Array.from(rankMap.values())
    .sort((a, b) => b.count - a.count || b.total - a.total || b.exact - a.exact)
}
