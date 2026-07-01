import { createClient } from '@/lib/supabase/client'
import { calculatePoints } from '@/lib/utils/scoring'
import { isMatchLocked, isMatchPast } from '@/lib/utils/match-time'

export async function submitPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('status, match_date, match_time')
    .eq('id', matchId)
    .single()

  if (!match || match.status !== 'scheduled') {
    throw new Error('No se puede pronosticar un partido que ya comenzó o finalizó')
  }

  if (isMatchLocked(match.match_date, match.match_time)) {
    throw new Error('No se puede pronosticar un partido que comienza en menos de una hora')
  }

  if (isMatchPast(match.match_date, match.match_time)) {
    throw new Error('No se puede pronosticar un partido que ya se jugó')
  }

  const { data: existing } = await supabase
    .from('predictions')
    .select('id')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .maybeSingle()

  if (existing) {
    return supabase
      .from('predictions')
      .update({ home_score: homeScore, away_score: awayScore, points: null })
      .eq('id', existing.id)
  }

  return supabase.from('predictions').insert({
    user_id: userId,
    match_id: matchId,
    home_score: homeScore,
    away_score: awayScore,
  })
}

export async function recalculatePointsForMatch(matchId: string, actualHome?: number, actualAway?: number) {
  const supabase = createClient()

  let homeScore = actualHome
  let awayScore = actualAway

  if (homeScore == null || awayScore == null) {
    const { data: match } = await supabase
      .from('matches')
      .select('home_score, away_score')
      .eq('id', matchId)
      .single()

    if (!match || match.home_score == null || match.away_score == null) return
    homeScore = match.home_score
    awayScore = match.away_score
  }

  if (homeScore == null || awayScore == null) return

  const PAGE = 1000
  let allPreds: { id: string; home_score: number; away_score: number }[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('predictions')
      .select('id, home_score, away_score')
      .eq('match_id', matchId)
      .range(from, from + PAGE - 1)

    if (error || !data || data.length === 0) break
    allPreds = allPreds.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  for (const pred of allPreds) {
    const points = calculatePoints(
      pred.home_score,
      pred.away_score,
      homeScore,
      awayScore
    )

    await supabase.from('predictions').update({ points }).eq('id', pred.id)
  }
}

export async function recalculateAllPoints() {
  const supabase = createClient()

  const { data: finishedMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'finished')

  if (!finishedMatches || finishedMatches.length === 0) return

  for (const match of finishedMatches) {
    await recalculatePointsForMatch(match.id)
  }
}
