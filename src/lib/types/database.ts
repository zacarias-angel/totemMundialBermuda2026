export type Group = {
  id: string
  name: string
  created_at?: string
  updated_at?: string
  update_count?: number
}

export type Team = {
  id: string
  name: string
  group_id: string
  created_at?: string
  updated_at?: string
  update_count?: number
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
  updated_at?: string
  update_count?: number
}

export type User = {
  id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
  update_count?: number
}

export type Prediction = {
  id: string
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  points?: number | null
  created_at?: string
  updated_at?: string
  update_count?: number
}

export type ViernesQuestion = {
  id: string
  question: string
  active: boolean
  created_at?: string
  updated_at?: string
  update_count?: number
}

export type ViernesAnswer = {
  id: string
  user_id: string
  question_id: string
  answer: string
  created_at?: string
  updated_at?: string
  update_count?: number
}

export type PredictionsHistory = {
  id: string
  prediction_id: string
  user_id: string
  match_id: string
  old_home_score: number | null
  old_away_score: number | null
  old_points: number | null
  new_home_score: number | null
  new_away_score: number | null
  new_points: number | null
  changed_at?: string
  update_number: number
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
