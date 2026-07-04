import { createClient } from '@/lib/supabase/client'

const NEXT_ROUND: Record<string, string> = {
  'Round of 32': 'Round of 16',
  'Round of 16': 'Quarter-finals',
  'Quarter-finals': 'Semi-finals',
  'Semi-finals': 'Final',
}

export async function propagateKnockoutWinner(matchId: string) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('id, round, home_team_id, away_team_id, home_score, away_score, status, knockout')
    .eq('id', matchId)
    .single()

  if (!match || !match.knockout || match.status !== 'finished') return
  if (!match.home_team_id || !match.away_team_id) return
  if (match.home_score == null || match.away_score == null) return
  if (match.home_score === match.away_score) return

  const winnerId = match.home_score > match.away_score ? match.home_team_id : match.away_team_id
  const loserId = match.home_score > match.away_score ? match.away_team_id : match.home_team_id
  const nextRound = NEXT_ROUND[match.round]
  if (!nextRound) return

  const { data: currentRoundMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('round', match.round)
    .eq('knockout', true)
    .order('created_at', { ascending: true })

  if (!currentRoundMatches) return

  const currentIndex = currentRoundMatches.findIndex((m) => m.id === matchId)
  if (currentIndex === -1) return

  const nextMatchIndex = Math.floor(currentIndex / 2)
  const isHome = currentIndex % 2 === 0

  const { data: nextRoundMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('round', nextRound)
    .eq('knockout', true)
    .order('created_at', { ascending: true })

  if (nextRoundMatches && nextRoundMatches[nextMatchIndex]) {
    await supabase
      .from('matches')
      .update(isHome ? { home_team_id: winnerId } : { away_team_id: winnerId })
      .eq('id', nextRoundMatches[nextMatchIndex].id)
  }

  if (match.round === 'Semi-finals') {
    const { data: thirdPlaceMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('round', 'Third place')
      .eq('knockout', true)
      .order('created_at', { ascending: true })

    if (thirdPlaceMatches && thirdPlaceMatches.length > 0) {
      await supabase
        .from('matches')
        .update(isHome ? { home_team_id: loserId } : { away_team_id: loserId })
        .eq('id', thirdPlaceMatches[0].id)
    }
  }
}
