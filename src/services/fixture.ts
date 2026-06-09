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
    .order('matchday', { ascending: true, nullsFirst: false })

  if (groupId) {
    query = query.eq('group_id', groupId)
  }

  const { data } = await query
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
