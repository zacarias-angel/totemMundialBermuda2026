import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getGroups() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('groups').select('*, teams(*)').order('name')
  return data ?? []
}

export async function getMatchesByGroup(groupId?: string) {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('knockout', false)
    .order('match_date', { ascending: true, nullsFirst: false })
    .order('match_time', { ascending: true, nullsFirst: false })

  if (groupId) {
    query = query.eq('group_id', groupId)
  }

  const { data } = await query
  return data ?? []
}

export async function getMatchesByDate(date: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('match_date', date)
    .order('match_time', { ascending: true, nullsFirst: false })

  return data ?? []
}

export async function getUpcomingMatches(limit = 10) {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'scheduled')
    .or(`match_date.gt.${today},and(match_date.eq.${today},match_time.gte.${now})`)
    .order('match_date', { ascending: true, nullsFirst: false })
    .order('match_time', { ascending: true, nullsFirst: false })
    .limit(limit)

  return data ?? []
}

export async function getKnockoutMatches() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('knockout', true)
    .order('id')

  return data ?? []
}

export async function getMatchById(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('id', matchId)
    .single()

  return data
}
