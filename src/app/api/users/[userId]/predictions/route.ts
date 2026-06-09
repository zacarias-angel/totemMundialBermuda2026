import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: predictions } = await supabase
    .from('predictions')
    .select('home_score, away_score, points, match_id')
    .eq('user_id', userId)
    .order('match_id')

  if (!predictions || predictions.length === 0) {
    return NextResponse.json([])
  }

  const matchIds = predictions.map((p) => p.match_id)
  const { data: matches } = await supabase
    .from('matches')
    .select('id, round, home_score, away_score, status, home_team_id, away_team_id')
    .in('id', matchIds)

  const teamIds = new Set<string>()
  matches?.forEach((m) => {
    if (m.home_team_id) teamIds.add(m.home_team_id)
    if (m.away_team_id) teamIds.add(m.away_team_id)
  })

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', [...teamIds])

  const teamMap = new Map(teams?.map((t) => [t.id, t.name]) ?? [])
  const matchMap = new Map(matches?.map((m) => [m.id, m]) ?? [])

  const result = predictions.map((p) => {
    const match = matchMap.get(p.match_id)
    return {
      home_team: match?.home_team_id ? (teamMap.get(match.home_team_id) ?? '?') : '?',
      away_team: match?.away_team_id ? (teamMap.get(match.away_team_id) ?? '?') : '?',
      home_score: p.home_score,
      away_score: p.away_score,
      match_home_score: match?.home_score ?? null,
      match_away_score: match?.away_score ?? null,
      points: p.points,
      status: match?.status ?? 'unknown',
      round: match?.round ?? 'Otros',
    }
  })

  return NextResponse.json(result)
}
