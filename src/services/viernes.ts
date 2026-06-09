import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getActiveQuestion() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('viernes_questions')
    .select('*')
    .eq('active', true)
    .maybeSingle()

  return data
}

export async function getViernesAnswers() {
  const supabase = await createServerSupabaseClient()
  const { data: question } = await supabase
    .from('viernes_questions')
    .select('id')
    .eq('active', true)
    .maybeSingle()

  if (!question) return []

  const { data } = await supabase
    .from('viernes_answers')
    .select('answer, user:users!user_id(name)')
    .eq('question_id', question.id)
    .order('created_at')

  return data ?? []
}
