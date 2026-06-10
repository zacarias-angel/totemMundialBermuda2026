export type Group = {
  id: string
  name: string
  created_at?: string
}

export type Team = {
  id: string
  name: string
  group_id: string
  created_at?: string
}

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export type Match = {
  id: string
  round: string
  group_id?: string | null
  home_team_id?: string | null
  away_team_id?: string | null
  home_score?: number | null
  away_score?: number | null
  matchday?: number | null
  match_date?: string | null
  match_time?: string | null
  status: MatchStatus
  knockout: boolean
  created_at?: string
}

export type User = {
  id: string
  name: string
  email: string
  created_at?: string
}

export type Prediction = {
  id: string
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  points?: number | null
  created_at?: string
}

export type ViernesQuestion = {
  id: string
  question: string
  active: boolean
  created_at?: string
}

export type ViernesAnswer = {
  id: string
  user_id: string
  question_id: string
  answer: string
  created_at?: string
}

export type RankEntry = {
  user_id: string
  name: string
  email: string
  total_points: number
  exact_count: number
  correct_count: number
  predictions_count: number
}
