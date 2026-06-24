import { createClient } from '@/lib/supabase/client'
import { calculatePoints } from '@/lib/utils/scoring'
import { isMatchLocked } from '@/lib/utils/match-time'

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

export async function recalculatePointsForMatch(matchId: string) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('home_score, away_score')
    .eq('id', matchId)
    .single()

  if (!match || match.home_score == null || match.away_score == null) return

  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, home_score, away_score')
    .eq('match_id', matchId)

  if (!predictions) return

  for (const pred of predictions) {
    const points = calculatePoints(
      pred.home_score,
      pred.away_score,
      match.home_score,
      match.away_score
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
